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
        // ── Date rule ────────────────────────────────────────────────────────
        // Online  (app)   → always books for TOMORROW (prev-day booking)
        // Offline (admin) → always books for TODAY    (walk-in patient)
        $bookingDate = $source === 'offline'
            ? Carbon::today()->toDateString()
            : Carbon::tomorrow()->toDateString();

        // ── Validate Unit Operating Day ──────────────────────────────────────
        $unit = Unit::find($unitId);
        if (!$unit) {
            throw new Exception("Selected unit does not exist.");
        }
        
        $targetDayName = Carbon::parse($bookingDate)->format('l'); // e.g. 'Monday'
        $unitDays = $unit->day ? array_map('trim', explode(',', $unit->day)) : [];
        if (!empty($unitDays) && !in_array($targetDayName, $unitDays)) {
            $label = $source === 'offline' ? 'Today' : 'Tomorrow';
            throw new Exception("This unit operates on {$unit->day}. You cannot book it for {$label} ({$targetDayName}).");
        }

        // Retry up to 5 times on deadlock
        return DB::transaction(function () use ($userId, $unitId, $type, $source, $bookingDate) {
            // Lock the user record to serialize booking requests for this user
            \App\Models\User::where('id', $userId)->lockForUpdate()->first();

            // ── 1. Prevent duplicate: one active token per user per day ────
            if ($source === 'online') {
                $existing = Booking::where('user_id', $userId)
                    ->where('booking_date', $bookingDate)
                    ->whereIn('status', ['active', 'pending'])
                    ->first();

                if ($existing) {
                    throw new Exception('You already have a booking for tomorrow. Only one token allowed per day.');
                }
            }

            // ── 2. Lock and fetch all booked token numbers for this slot ──
            $bookedTokens = Booking::where('unit_id', $unitId)
                ->where('type', $type)
                ->where('booking_date', $bookingDate)
                ->lockForUpdate()
                ->pluck('token_number')
                ->toArray();

            // ── 3. Find next available token number ───────────────────────
            $nextToken = $this->findNextToken($type, $source, $bookedTokens);

            if ($nextToken === null) {
                $label = $source === 'offline' ? 'Offline (walk-in)' : 'Online';
                throw new Exception("{$label} tokens are fully booked for {$type} today. No more slots available.");
            }

            // ── 4. Determine status ───────────────────────────────────────
            // Offline bookings are always immediately active (admin confirmed).
            // Online bookings check auto-approve setting.
            if ($source === 'offline') {
                $status = 'active';
            } else {
                $hospital = Hospital::first();
                $isAutoApprove = $hospital
                    && $hospital->auto_approve_bookings_until
                    && Carbon::parse($hospital->auto_approve_bookings_until)->isFuture();
                $status = $isAutoApprove ? 'active' : 'pending';
            }

            // ── 5. Create the booking ─────────────────────────────────────
            try {
                return Booking::create([
                    'user_id'      => $userId,
                    'unit_id'      => $unitId,
                    'type'         => $type,
                    'token_number' => $nextToken,
                    'booking_date' => $bookingDate,
                    'status'       => $status,
                    'source'       => $source,
                ]);
            } catch (\Illuminate\Database\QueryException $e) {
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
                $offlineBooked = $booked->where('type', 'followup')->where('source', 'offline')->count();
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
            } else {
                // Offline Chemo: any number from 1 to 150 that is NOT an online chemo token
                for ($t = 1; $t <= 150; $t++) {
                    if (!$this->isOnlineChemoToken($t) && !in_array($t, $bookedTokens)) {
                        return $t;
                    }
                }
                return null;
            }
        }

        if ($type === 'followup') {
            // Followups: sequential starting at 151 to 300
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
