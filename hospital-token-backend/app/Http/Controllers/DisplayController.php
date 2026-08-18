<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Unit;
use Carbon\Carbon;

class DisplayController extends Controller
{
    /**
     * Display the TV screen for patients.
     */
    public function index($unit_id)
    {
        $unit = Unit::with('doctors')->findOrFail($unit_id);
        
        // Using today's date for live TV display
        $today = Carbon::today()->toDateString();

        $bookings = Booking::where('unit_id', $unit_id)
            ->whereDate('booking_date', $today)
            ->where('status', 'active')
            ->orderBy('token_number', 'asc')
            ->get();

        $currentToken = $bookings->first();
        $upcoming = $bookings->skip(1)->take(8);

        return view('display.index', compact('unit', 'currentToken', 'upcoming'));
    }
}
