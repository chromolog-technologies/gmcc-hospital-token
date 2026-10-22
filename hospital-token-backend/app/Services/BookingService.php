<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Hospital;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class BookingService
{
    /**
     * Process auto-approval for pending online bookings older than 1 hour,
     * provided auto-approval is currently active for the hospital.
     */
    public static function processAutoApprovals(): void
    {
        $hospital = Hospital::first();
        if (!$hospital || !$hospital->auto_approve_bookings_until) {
            return;
        }

        if (Carbon::now()->lt(Carbon::parse($hospital->auto_approve_bookings_until))) {
            $oneHourAgo = Carbon::now()->subHour();
            $ids = Booking::where('status', 'pending')
                ->where('source', 'online')
                ->where('created_at', '<=', $oneHourAgo)
                ->pluck('id')
                ->all();

            if (empty($ids)) {
                return;
            }

            // Re-check status so concurrent callers don't approve/log the same booking twice
            $approved = Booking::whereIn('id', $ids)
                ->where('status', 'pending')
                ->update(array_merge(['status' => 'active'], Booking::statusActionAttributes('auto_approved')));

            if ($approved > 0) {
                ActivityLogger::logSystemBulk('booking_auto_approved', 'booking', $ids, 'Token auto-approved after 1-hour grace period');
            }
        }
    }

    // ── Token pool constants ────────────────────────────────────────────────
    const MAX_TOKENS      = 300; // Total tokens per unit per day

    /**
     * Create a booking token (online or offline).
     *
     * @param int    $userId   The patient's user ID
     * @param int    $unitId   The unit being booked
     * @param string $type     'chemo' or 'followup'
     * @param string $source   'online' (app) or 'offline' (admin walk-in)
     *
     * @throws Exception
     */
    public function createToken(int $userId, int $unitId, string $type, string $source = 'online'): Booking
    {
        $nowIST = Carbon::now('Asia/Kolkata');
        
        // Define the current "Booking Day" (shifts at 6 AM IST)
        $bookingDay = $nowIST->copy();
        if ($nowIST->hour < 6) {
            $bookingDay->subDay();
        }

        // ── Date rule ────────────────────────────────────────────────────────
        // Online  (app)           → books for NEXT booking day (tomorrow's slot)
        // Offline (walk-in/staff) → books for CURRENT booking day (today's slot)
        $bookingDate = ($source === 'offline-walkin' || $source === 'offline-staff')
            ? $bookingDay->toDateString()
            : $bookingDay->copy()->addDay()->toDateString();

        // ── Validate Unit Operating Day ──────────────────────────────────────
        $unit = Unit::find($unitId);
        if (!$unit) {
            throw new Exception("Selected unit does not exist.");
        }
        
        $targetDayName = Carbon::parse($bookingDate)->format('l'); // e.g. 'Monday'
        $unitDays = $unit->day ? array_map('trim', explode(',', $unit->day)) : [];
        if (!empty($unitDays) && !in_array($targetDayName, $unitDays)) {
            $operatingDaysStr = implode(', ', array_map('ucfirst', $unitDays));
            if ($source === 'online') {
                $windowStart = $bookingDay->format('l') . ' 6:00 AM';
                $windowEnd = $targetDayName . ' 6:00 AM';
                throw new Exception("This unit operates on {$operatingDaysStr}.\n\nYou are trying to book for {$targetDayName}.\nBooking cannot be done for this day.\n\nNote: Bookings for {$targetDayName} must be made between {$windowStart} and {$windowEnd}.");
            } else {
                throw new Exception("This unit operates on {$operatingDaysStr}. Cannot generate offline token for {$targetDayName}.");
            }
        }

        // Ensure bookings.source column is VARCHAR(50) so it accepts 'offline-walkin' and 'offline-staff'
        static $checkedSourceColumn = false;
        if (!$checkedSourceColumn) {
            try {
                DB::statement("ALTER TABLE bookings MODIFY COLUMN source VARCHAR(50) NOT NULL DEFAULT 'online'");
                $checkedSourceColumn = true;
            } catch (\Throwable $e) {
                // Ignore if alter cannot run directly
            }
        }

        // Retry up to 5 times on deadlock
        return DB::transaction(function () use ($userId, $unitId, $type, $source, $bookingDate) {
            // Lock the user record to serialize booking requests for this user
            \App\Models\User::where('id', $userId)->lockForUpdate()->first();

            // ── 1. Prevent duplicate: one active token per user per day ────
            $existing = Booking::where('user_id', $userId)
                ->where('booking_date', $bookingDate)
                ->whereIn('status', ['active', 'pending'])
                ->first();

            if ($existing) {
                throw new Exception('User already has a booking for this day. Only one token allowed per day.');
            }

            // ── 2. Lock and fetch all booked token numbers for this slot ──
            $bookedTokens = Booking::where('unit_id', $unitId)
                ->where('type', $type)
                ->where('booking_date', $bookingDate)
                ->where('status', '!=', 'cancelled')
                ->lockForUpdate()
                ->pluck('token_number')
                ->toArray();

            // ── 3. Find next available token number ───────────────────────
            $nextToken = $this->findNextToken($type, $source, $bookedTokens);

            if ($nextToken === null) {
                $label = ($source === 'offline-walkin' || $source === 'offline-staff') ? 'Offline (walk-in)' : 'Online';
                throw new Exception("{$label} tokens are fully booked for {$type} today. No more slots available.");
            }

            // ── 4. Determine status ───────────────────────────────────────
            // Offline bookings are always immediately active (admin confirmed).
            // Online bookings start as 'pending' (1-hour cancellation grace period before auto-approval).
            if ($source === 'offline-walkin' || $source === 'offline-staff') {
                $status = 'active';
            } else {
                $status = 'pending';
            }

            // ── 5. Create or Overwrite the booking ────────────────────────
            $payload = [
                'user_id'      => $userId,
                'unit_id'      => $unitId,
                'type'         => $type,
                'token_number' => $nextToken,
                'booking_date' => $bookingDate,
                'status'       => $status,
                'source'       => $source,
            ] + Booking::statusActionAttributes($status === 'active' ? 'admin_booked_offline' : 'online_booked');

            try {
                $existingCancelled = Booking::where('unit_id', $unitId)
                    ->where('booking_date', $bookingDate)
                    ->where('token_number', $nextToken)
                    ->where('status', 'cancelled')
                    ->first();

                if ($existingCancelled) {
                    $existingCancelled->update($payload);
                    return $existingCancelled;
                }

                return Booking::create($payload);
            } catch (\Illuminate\Database\QueryException $e) {
                // If MySQL rejects 'offline-staff'/'offline-walkin' due to ENUM('online','offline')
                if (str_contains($e->getMessage(), '1265') || str_contains($e->getMessage(), 'Data truncated')) {
                    $fallbackPayload = array_merge($payload, ['source' => 'offline']);
                    if ($existingCancelled ?? null) {
                        $existingCancelled->update($fallbackPayload);
                        return $existingCancelled;
                    }
                    return Booking::create($fallbackPayload);
                }

                if ($e->getCode() == 23000) {
                    throw new Exception('High demand detected. Please try again in a few seconds.');
                }
                throw $e;
            }
        }, 5);
    }

    /**
     * Get availability counts for a unit/date across both token types.
     * Returns remaining online and offline slots for chemo and followup.
     */
    public function getAvailability(int $unitId, string $date): array
    {
        $booked = Booking::where('unit_id', $unitId)
            ->where('booking_date', $date)
            ->whereIn('status', ['active', 'pending'])
            ->get(['type', 'token_number', 'source']);

        $result = [];
        foreach (['chemo', 'followup'] as $type) {
            $tokens = $booked->where('type', $type)->pluck('token_number')->toArray();

            if ($type === 'chemo') {
                $onlineBooked = 0;
                $offlineBooked = 0;
                foreach ($tokens as $t) {
                    if ($this->isOnlineChemoToken($t)) {
                        $onlineBooked++;
                    } else {
                        $offlineBooked++;
                    }
                }
                $result['chemo'] = [
                    'online_booked'    => $onlineBooked,
                    'online_remaining' => max(0, 64 - $onlineBooked),
                    'offline_booked'   => $offlineBooked,
                    'offline_remaining'=> max(0, 86 - $offlineBooked),
                    'total_booked'     => count($tokens),
                    'total_remaining'  => max(0, 150 - count($tokens)),
                ];
            } else {
                $totalBooked = count($tokens);
                $onlineBooked = $booked->where('type', 'followup')->where('source', 'online')->count();
                $offlineBooked = $booked->where('type', 'followup')->where('source', '!=', 'online')->count();
                $result['followup'] = [
                    'online_booked'    => $onlineBooked,
                    'online_remaining' => max(0, 150 - $totalBooked),
                    'offline_booked'   => $offlineBooked,
                    'offline_remaining'=> max(0, 150 - $totalBooked),
                    'total_booked'     => $totalBooked,
                    'total_remaining'  => max(0, 150 - $totalBooked),
                ];
            }
        }

        return $result;
    }

    // ── Private helpers ─────────────────────────────────────────────────────

    /**
     * Helper to check if a token number matches the Online Chemo constraints.
     */
    private function isOnlineChemoToken(int $t): bool
    {
        if ($t < 1 || $t > 150) {
            return false;
        }
        $tens = (int)($t / 10);
        if ($tens % 2 !== 0) {
            return false;
        }
        $units = $t % 10;
        return in_array($units, [1, 2, 3, 4, 6, 7, 8, 9]);
    }

    /**
     * Find the next available token number for the given type and source.
     */
    private function findNextToken(string $type, string $source, array $bookedTokens): ?int
    {
        if ($type === 'chemo') {
            if ($source === 'online') {
                // Online Chemo: must be in even-tens blocks and not end in 5 or 0
                for ($t = 1; $t <= 150; $t++) {
                    if ($this->isOnlineChemoToken($t) && !in_array($t, $bookedTokens)) {
                        return $t;
                    }
                }
                return null;
            } elseif ($source === 'offline-staff') {
                for ($t = 1; $t <= 150; $t++) {
                    if (!$this->isOnlineChemoToken($t) && $t % 5 === 0 && !in_array($t, $bookedTokens)) {
                        return $t;
                    }
                }
                return null;
            } elseif ($source === 'offline-walkin' || $source === 'offline') {
                // Offline Chemo: any number from 1 to 150 that is NOT an online chemo token and NOT a multiple of 5
                for ($t = 1; $t <= 150; $t++) {
                    if (!$this->isOnlineChemoToken($t) && $t % 5 !== 0 && !in_array($t, $bookedTokens)) {
                        return $t;
                    }
                }
                return null;
            }
        }

        if ($type === 'followup') {
            for ($t = 151; $t <= 300; $t++) {
                if (!in_array($t, $bookedTokens)) {
                    return $t;
                }
            }
            return null;
        }

        return null;
    }
}
