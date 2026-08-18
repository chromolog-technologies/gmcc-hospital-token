<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the hospital admin dashboard.
     */
    public function index()
    {
        // Tomorrow's booking logic: booking_date = today + 1
        $targetDate = Carbon::tomorrow()->toDateString();

        // Total bookings for tomorrow
        $total = Booking::where('booking_date', $targetDate)->count();

        // Stats by type (Tomorrow)
        $chemo = Booking::where('booking_date', $targetDate)->where('type', 'chemo')->count();
        $normal = Booking::where('booking_date', $targetDate)->where('type', 'normal')->count();

        // Stats by status (Tomorrow)
        $completed = Booking::where('booking_date', $targetDate)->where('status', 'completed')->count();
        $active = Booking::where('booking_date', $targetDate)->where('status', 'active')->count();
        $cancelled = Booking::where('booking_date', $targetDate)->where('status', 'cancelled')->count();

        return view('dashboard', compact(
            'targetDate',
            'total', 
            'chemo', 
            'normal', 
            'completed', 
            'active', 
            'cancelled'
        ));
    }
}
