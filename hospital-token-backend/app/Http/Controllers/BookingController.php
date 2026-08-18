<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\CreateBookingRequest;
use App\Http\Requests\CancelBookingRequest;
use App\Models\Booking;
use App\Models\Doctor;
use App\Services\BookingService;
use Carbon\Carbon;

class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    public function create(CreateBookingRequest $request)
    {
        $userId = $request->user()->id;

        try {
            $booking = $this->bookingService->createToken(
                $userId,
                $request->unit_id,
                $request->type,
                'online'  // App users always book online
            );

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

        $bookings = Booking::with(['unit.doctors'])
            ->where('user_id', $user->id)
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

        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== 'active') {
            return response()->json(['success' => false, 'message' => 'Only active bookings can be cancelled'], 400);
        }

        $booking->update(['status' => 'cancelled']);

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
