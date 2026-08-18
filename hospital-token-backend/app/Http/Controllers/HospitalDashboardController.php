<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Unit;
use App\Models\Doctor;
use App\Models\Hospital;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class HospitalDashboardController extends Controller
{
    private function checkAccess(Request $request)
    {
        if (!$request->user() instanceof Hospital) {
            abort(403, 'Unauthorized. Admin access only.');
        }
    }

    public function getSummary(Request $request)
    {
        $this->checkAccess($request);

        $today = Carbon::today()->toDateString();
        $tomorrow = Carbon::tomorrow()->toDateString();

        // Get aggregate totals
        $totals = Booking::select('booking_date', 'status', DB::raw('count(*) as count'))
            ->whereIn('booking_date', [$today, $tomorrow])
            ->groupBy('booking_date', 'status')
            ->get();

        $todayStats = ['total' => 0, 'active' => 0, 'pending' => 0, 'completed' => 0, 'cancelled' => 0];
        $tomorrowStats = ['total' => 0, 'active' => 0, 'pending' => 0, 'completed' => 0, 'cancelled' => 0];

        foreach ($totals as $row) {
            if ($row->booking_date == $today) {
                $todayStats[$row->status] += $row->count;
                $todayStats['total'] += $row->count;
            } else {
                $tomorrowStats[$row->status] += $row->count;
                $tomorrowStats['total'] += $row->count;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'today' => $todayStats,
                'tomorrow' => $tomorrowStats,
            ]
        ]);
    }

    public function getUnitStats(Request $request)
    {
        $this->checkAccess($request);

        $today = Carbon::today()->toDateString();
        $tomorrow = Carbon::tomorrow()->toDateString();

        $units = Unit::with(['doctors'])->get();

        $bookings = Booking::select('unit_id', 'type', 'booking_date', 'status', DB::raw('count(*) as count'))
            ->whereIn('booking_date', [$today, $tomorrow])
            ->groupBy('unit_id', 'type', 'booking_date', 'status')
            ->get();

        $unitData = [];

        foreach ($units as $unit) {
            $unitData[$unit->id] = [
                'unit_id'     => $unit->id,
                'unit_name'   => $unit->name,
                'day'         => $unit->day,   // ← was missing; caused unit.day = undefined on frontend
                'doctor_name' => $unit->doctors->isNotEmpty() ? $unit->doctors->pluck('name')->implode(', ') : 'Unassigned',
                'today'       => ['chemo' => 0, 'followup' => 0, 'normal' => 0, 'completed' => 0, 'pending' => 0],
                'tomorrow'    => ['chemo' => 0, 'followup' => 0, 'normal' => 0],
            ];
        }

        foreach ($bookings as $row) {
            if (!isset($unitData[$row->unit_id])) continue;
            
            // Ensure the type key exists in our initialized array
            $type = $row->type;
            if (!isset($unitData[$row->unit_id]['today'][$type])) {
                $unitData[$row->unit_id]['today'][$type] = 0;
            }
            if (!isset($unitData[$row->unit_id]['tomorrow'][$type])) {
                $unitData[$row->unit_id]['tomorrow'][$type] = 0;
            }

            if ($row->booking_date == $today) {
                $unitData[$row->unit_id]['today'][$type] += $row->count;
                if ($row->status == 'completed') $unitData[$row->unit_id]['today']['completed'] += $row->count;
                if ($row->status == 'active') $unitData[$row->unit_id]['today']['pending'] += $row->count;
            } else {
                $unitData[$row->unit_id]['tomorrow'][$type] += $row->count;
            }
        }

        return response()->json([
            'success' => true,
            'data' => array_values($unitData)
        ]);
    }

    public function getDoctorStats(Request $request)
    {
        $this->checkAccess($request);

        $today = Carbon::today()->toDateString();

        $doctors = Doctor::with('unit')->get();
        $doctorUnitMap = [];
        
        $doctorData = [];
        foreach ($doctors as $doctor) {
            $doctorData[$doctor->id] = [
                'doctor_id' => $doctor->id,
                'doctor_name' => $doctor->name,
                'total_assigned_units' => $doctor->unit ? 1 : 0,
                'today_patients_seen' => 0,
                'today_patients_waiting' => 0,
            ];
            
            if ($doctor->unit) {
                $doctorUnitMap[$doctor->unit->id] = $doctor->id;
            }
        }

        $bookings = Booking::select('unit_id', 'status', DB::raw('count(*) as count'))
            ->where('booking_date', $today)
            ->groupBy('unit_id', 'status')
            ->get();

        foreach ($bookings as $row) {
            if (isset($doctorUnitMap[$row->unit_id])) {
                $doctorId = $doctorUnitMap[$row->unit_id];
                if ($row->status == 'completed') {
                    $doctorData[$doctorId]['today_patients_seen'] += $row->count;
                } elseif ($row->status == 'active') {
                    $doctorData[$doctorId]['today_patients_waiting'] += $row->count;
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => array_values($doctorData)
        ]);
    }
}
