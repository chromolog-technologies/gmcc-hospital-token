<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Hospital;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\BookingService;
use Carbon\Carbon;

class HospitalBookingController extends Controller
{
    public function __construct(protected BookingService $bookingService) {}

    private function checkAccess(Request $request)
    {
        if (!$request->user() instanceof Hospital) {
            abort(403, 'Unauthorized. Admin access only.');
        }
    }

    /**
     * List all bookings (paginated), with optional filters.
     */
    public function index(Request $request)
    {
        $this->checkAccess($request);

        BookingService::processAutoApprovals();

        $query = Booking::with(['user', 'unit.doctors'])
            ->orderBy('booking_date', 'desc')
            ->orderBy('id', 'desc');

        // Optional filters
        if ($request->filled('source')) {
            if ($request->source === 'offline') {
                $query->where('source', 'like', 'offline%');
            } else {
                $query->where('source', $request->source);
            }
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('date')) {
            $query->where('booking_date', $request->date);
        }
        if ($request->filled('crno')) {
            $crno = trim($request->crno);
            $query->whereHas('user', function ($q) use ($crno) {
                $q->where('crno', 'like', "%{$crno}%")
                  ->orWhere('name', 'like', "%{$crno}%");
            });
        }

        $perPage = (int) $request->input('per_page', 100);
        if ($perPage < 1 || $perPage > 500) {
            $perPage = 100;
        }

        $bookings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $bookings
        ]);
    }

    /**
     * Book an offline (walk-in) token for a patient.
     * Admin only. Always books for TODAY.
     */
    public function storeOffline(Request $request)
    {
        $this->checkAccess($request);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'unit_id' => 'required|exists:units,id',
            'type'    => 'required|in:chemo,followup',
            'source'  => 'required|in:offline-walkin,offline-staff',
        ]);

        try {
            $booking = $this->bookingService->createToken(
                $request->user_id,
                $request->unit_id,
                $request->type,
                $request->source   // Admin walk-in or staff booking for TODAY
            );

            $booking->load(['user', 'unit.doctors']);

            ActivityLogger::log($request->user(), 'booking_created', "Admin booked {$request->source} token #{$booking->token_number} for {$booking->user->name}", $booking, [
                'unit_id' => $booking->unit_id,
                'type'    => $booking->type,
                'source'  => $booking->source,
            ]);

            return response()->json([
                'success' => true,
                'message' => "Offline token booked. Token #" . str_pad($booking->token_number, 3, '0', STR_PAD_LEFT) . " assigned to " . $booking->user->name . ".",
                'data'    => $booking
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get slot availability for a unit on a given date.
     * Returns remaining online and offline slots for chemo and followup.
     */
    public function getAvailability(Request $request)
    {
        $this->checkAccess($request);

        $request->validate([
            'unit_id' => 'required|exists:units,id',
            'date'    => 'nullable|date',
        ]);

        $date = $request->date ?? Carbon::today()->toDateString();

        $availability = $this->bookingService->getAvailability(
            $request->unit_id,
            $date
        );

        return response()->json([
            'success' => true,
            'date'    => $date,
            'data'    => $availability
        ]);
    }

    /**
     * Update a booking's status (approve / cancel / complete).
     */
    public function updateStatus(Request $request, $id)
    {
        $this->checkAccess($request);

        $request->validate([
            'status' => 'required|in:pending,active,cancelled,completed'
        ]);

        $booking = Booking::findOrFail($id);
        $previousStatus = $booking->status;

        $action = match ($request->status) {
            'active'    => 'admin_approved',
            'cancelled' => 'admin_cancelled',
            'completed' => 'admin_completed',
            'pending'   => 'admin_set_pending',
        };

        $booking->fill(Booking::statusActionAttributes($action));
        $booking->status = $request->status;
        $booking->save();

        ActivityLogger::log($request->user(), 'booking_' . str_replace('admin_', '', $action), "Admin changed token #{$booking->token_number} from {$previousStatus} to {$request->status}", $booking, [
            'from_status' => $previousStatus,
            'to_status'   => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking status updated successfully',
            'data'    => $booking
        ]);
    }

    /**
     * Get current auto-approve settings.
     */
    public function getSettings(Request $request)
    {
        $this->checkAccess($request);

        $hospital = $request->user();

        return response()->json([
            'success' => true,
            'data'    => [
                'auto_approve_bookings_until' => $hospital->auto_approve_bookings_until
            ]
        ]);
    }

    /**
     * Update auto-approve window.
     */
    public function updateAutoApprove(Request $request)
    {
        $this->checkAccess($request);

        $request->validate([
            'hours' => 'required|integer|min:0|max:87600'
        ]);

        $hospital = $request->user();

        if ($request->hours > 0) {
            $hospital->auto_approve_bookings_until = Carbon::now()->addYears(1);
        } else {
            $hospital->auto_approve_bookings_until = null;
        }

        $hospital->save();

        ActivityLogger::log($hospital, 'auto_approve_' . ($request->hours > 0 ? 'enabled' : 'disabled'), 'Admin turned auto-approve ' . ($request->hours > 0 ? 'ON' : 'OFF'));

        return response()->json([
            'success' => true,
            'message' => 'Auto-approve settings updated successfully',
            'data'    => [
                'auto_approve_bookings_until' => $hospital->auto_approve_bookings_until
            ]
        ]);
    }
}
