<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Doctor;
use Carbon\Carbon;

class DoctorQueueController extends Controller
{
    public function index(Request $request)
    {
        $doctor = $request->user();
        
        if (!$doctor instanceof Doctor) {
            return response()->json(['message' => 'Unauthorized. Only doctors can access this queue.'], 403);
        }

        $today = Carbon::today()->toDateString();
        $unitIds = $doctor->units()->pluck('id');

        // Fetch today's active bookings for the doctor's units, sorted by token number
        $queue = Booking::with('user')
            ->whereIn('unit_id', $unitIds)
            ->where('booking_date', $today)
            ->where('status', 'active')
            ->orderBy('token_number', 'asc')
            ->get();

        return response()->json($queue);
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        $doctor = $request->user();
        
        if (!$doctor instanceof Doctor) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'status' => 'required|in:completed,cancelled'
        ]);

        // Ensure the booking belongs to one of the doctor's units
        $unitIds = $doctor->units()->pluck('id')->toArray();
        
        if (!in_array($booking->unit_id, $unitIds)) {
            return response()->json(['message' => 'Unauthorized to modify this booking'], 403);
        }

        $booking->update([
            'status' => $request->status
        ]);

        return response()->json([
            'message' => "Booking successfully marked as {$request->status}",
            'booking' => $booking
        ]);
    }
}
