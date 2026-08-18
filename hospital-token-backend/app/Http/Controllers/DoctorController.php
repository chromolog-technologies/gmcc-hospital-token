<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Doctor;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DoctorController extends Controller
{
    private function checkAccess($doctor, $unit_id)
    {
        if (!$doctor instanceof Doctor) {
            abort(403, 'Unauthorized. Only doctors can perform this action.');
        }

        if ($doctor->unit_id !== (int)$unit_id) {
            abort(403, 'Unauthorized. You are not assigned to this unit.');
        }
    }

    public function getQueue($unit_id, Request $request)
    {
        try {
            $this->checkAccess($request->user(), $unit_id);

            $today = Carbon::today()->toDateString();

            // Fetch active/completed queue (ignore cancelled)
            $queue = Booking::with('user')
                ->where('unit_id', $unit_id)
                ->where('booking_date', $today)
                ->where('status', '!=', 'cancelled')
                ->orderBy('token_number', 'asc')
                ->get();

            $total = $queue->count();
            $completed = $queue->where('status', 'completed')->count();
            $pending = $queue->where('status', 'active')->count();

            return response()->json([
                'success' => true,
                'message' => "Queue retrieved successfully",
                'data' => [
                    'summary' => [
                        'total' => $total,
                        'pending' => $pending,
                        'completed' => $completed,
                    ],
                    'queue' => $queue
                ]
            ], 200);
        } catch (\Exception $e) {
            \Log::error($e);
            $message = ($e instanceof \Illuminate\Database\QueryException || $e instanceof \PDOException)
                ? 'An unexpected database error occurred.'
                : $e->getMessage();
            return response()->json(['success' => false, 'message' => $message], 403);
        }
    }

    public function getCurrentToken($unit_id, Request $request)
    {
        try {
            $this->checkAccess($request->user(), $unit_id);
            
            $today = Carbon::today()->toDateString();

            $currentToken = Booking::with('user')
                ->where('unit_id', $unit_id)
                ->where('booking_date', $today)
                ->where('status', 'active')
                ->orderBy('token_number', 'asc')
                ->first();

            return response()->json([
                'success' => true,
                'message' => $currentToken ? "Current token retrieved" : "No active tokens found",
                'data' => $currentToken
            ], 200);
        } catch (\Exception $e) {
            \Log::error($e);
            $message = ($e instanceof \Illuminate\Database\QueryException || $e instanceof \PDOException)
                ? 'An unexpected database error occurred.'
                : $e->getMessage();
            return response()->json(['success' => false, 'message' => $message], 403);
        }
    }

    public function callNext(Request $request)
    {
        $request->validate([
            'unit_id' => 'required|exists:units,id'
        ]);

        $unit_id = $request->unit_id;

        try {
            $this->checkAccess($request->user(), $unit_id);
            $today = Carbon::today()->toDateString();

            return DB::transaction(function () use ($unit_id, $today) {
                // Find the current active token and lock it
                $currentToken = Booking::where('unit_id', $unit_id)
                    ->where('booking_date', $today)
                    ->where('status', 'active')
                    ->orderBy('token_number', 'asc')
                    ->lockForUpdate()
                    ->first();

                if ($currentToken) {
                    $currentToken->update(['status' => 'completed']);
                }

                // Get the very next token
                $nextToken = Booking::with('user')
                    ->where('unit_id', $unit_id)
                    ->where('booking_date', $today)
                    ->where('status', 'active')
                    ->orderBy('token_number', 'asc')
                    ->first();

                return response()->json([
                    'success' => true,
                    'message' => "Moved to next token",
                    'data' => $nextToken // Will be null if queue is finished
                ], 200);
            });

        } catch (\Exception $e) {
            \Log::error($e);
            $message = ($e instanceof \Illuminate\Database\QueryException || $e instanceof \PDOException)
                ? 'An unexpected database error occurred.'
                : $e->getMessage();
            return response()->json(['success' => false, 'message' => $message], 403);
        }
    }

    public function markCompleted(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id'
        ]);

        try {
            $booking = Booking::findOrFail($request->booking_id);
            $this->checkAccess($request->user(), $booking->unit_id);

            if ($booking->status !== 'active') {
                return response()->json(['success' => false, 'message' => 'Only active bookings can be marked completed'], 400);
            }

            $booking->update(['status' => 'completed']);

            return response()->json([
                'success' => true,
                'message' => "Token marked as completed",
                'data' => $booking
            ], 200);
            
        } catch (\Exception $e) {
            \Log::error($e);
            $message = ($e instanceof \Illuminate\Database\QueryException || $e instanceof \PDOException)
                ? 'An unexpected database error occurred.'
                : $e->getMessage();
            return response()->json(['success' => false, 'message' => $message], 403);
        }
    }
}
