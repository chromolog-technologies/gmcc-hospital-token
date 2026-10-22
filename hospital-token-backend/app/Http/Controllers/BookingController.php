<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\CreateBookingRequest;
use App\Http\Requests\CancelBookingRequest;
use App\Models\Booking;
use App\Models\Doctor;
use App\Services\ActivityLogger;
use App\Services\BookingService;
use Carbon\Carbon;

class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    public function getAvailability(Request $request)
    {
        $request->validate([
            'unit_id' => 'required|exists:units,id',
        ]);

        $nowIST = Carbon::now('Asia/Kolkata');
        
        // Define the current "Booking Day" (shifts at 6 AM IST)
        $bookingDay = $nowIST->copy();
        if ($nowIST->hour < 6) {
            $bookingDay->subDay();
        }
        
        // App users always book for the NEXT booking day
        $targetDate = $bookingDay->copy()->addDay()->toDateString();
        
        $availability = $this->bookingService->getAvailability(
            $request->unit_id,
            $targetDate
        );

        return response()->json([
            'success' => true,
            'target_date' => $targetDate,
            'data'    => $availability
        ]);
    }

    public function create(CreateBookingRequest $request)
    {
        $user = $request->user();
        $userId = $user ? $user->id : ($request->input('user_id') ?? $request->header('X-User-Id'));

        try {
            $booking = $this->bookingService->createToken(
                (int)$userId,
                $request->unit_id,
                $request->type,
                'online'  // App users always book online
            );

            ActivityLogger::log($user, 'booking_created', "Booked online token #{$booking->token_number} for {$booking->booking_date->toDateString()}", $booking, [
                'unit_id' => $booking->unit_id,
                'type'    => $booking->type,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Token generated successfully',
                'data' => $booking
            ], 201);

        } catch (\Exception $e) {
            \Log::error($e);
            $message = ($e instanceof \Illuminate\Database\QueryException || $e instanceof \PDOException)
                ? 'An unexpected database error occurred.'
                : $e->getMessage();
            return response()->json([
                'success' => false,
                'message' => $message
            ], 400);
        }
    }

    public function getByUser(Request $request)
    {
        $user = $request->user();

        if ($user instanceof Doctor) {
            return response()->json(['success' => false, 'message' => 'Doctors cannot fetch patient bookings here.'], 403);
        }

        $userId = $user ? $user->id : ($request->query('user_id') ?? $request->header('X-User-Id'));

        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'User ID is required.'], 400);
        }

        BookingService::processAutoApprovals();

        $bookings = Booking::with(['unit.doctors'])
            ->where('user_id', (int)$userId)
            ->orderBy('booking_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'User bookings retrieved successfully',
            'data' => $bookings
        ], 200);
    }

    public function cancel(CancelBookingRequest $request)
    {
        $booking = Booking::find($request->booking_id);

        $user = $request->user();
        $userId = $user ? $user->id : ($request->input('user_id') ?? $request->header('X-User-Id'));

        if ($booking->user_id !== (int)$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if (!in_array($booking->status, ['active', 'pending'])) {
            return response()->json(['success' => false, 'message' => 'Only active or pending bookings can be cancelled'], 400);
        }

        $previousStatus = $booking->status;
        $booking->update(array_merge(['status' => 'cancelled'], Booking::statusActionAttributes('user_cancelled')));

        ActivityLogger::log($request->user(), 'booking_cancelled', "Patient cancelled token #{$booking->token_number}", $booking, [
            'from_status' => $previousStatus,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully',
            'data' => $booking
        ], 200);
    }

    public function getByUnit($unit_id, Request $request)
    {
        $doctor = $request->user();

        // SECURITY: Ensure only Doctors can access the queue
        if (!$doctor instanceof Doctor) {
            return response()->json(['success' => false, 'message' => 'Unauthorized. Only doctors can view the queue.'], 403);
        }

        // SECURITY: Ensure the doctor is assigned to this specific unit
        if ($doctor->unit_id !== (int)$unit_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized. You are not assigned to this unit.'], 403);
        }

        BookingService::processAutoApprovals();

        $today = Carbon::today()->toDateString();

        $queue = Booking::with('user')
            ->where('unit_id', $unit_id)
            ->where('booking_date', $today)
            ->orderBy('token_number', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => "Today's queue retrieved successfully",
            'data' => $queue
        ], 200);
    }
}
