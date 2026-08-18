<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Unit;
use App\Models\Hospital;
use Illuminate\Support\Facades\Cache;

class HospitalUnitController extends Controller
{
    private function checkAccess(Request $request)
    {
        if (!$request->user() instanceof Hospital) {
            abort(403, 'Unauthorized. Admin access only.');
        }
    }

    public function store(Request $request)
    {
        $this->checkAccess($request);

        $request->validate([
            'name' => 'required|string|max:255',
            'day' => 'required|string|max:255',
            'start_time' => 'nullable|date_format:H:i:s',
            'slot_duration' => 'nullable|integer|min:1',
        ]);

        $unit = Unit::create([
            'name' => $request->name,
            'day' => $request->day,
            'start_time' => $request->start_time ?? '09:00:00',
            'slot_duration' => $request->slot_duration ?? 5,
        ]);

        Cache::forget('hospital_units');

        return response()->json([
            'success' => true,
            'message' => 'Unit created successfully',
            'data' => $unit
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->checkAccess($request);

        $unit = Unit::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'day' => 'sometimes|string|max:255',
            'start_time' => 'sometimes|date_format:H:i:s',
            'slot_duration' => 'sometimes|integer|min:1',
        ]);

        $unit->update($request->only(['name', 'day', 'start_time', 'slot_duration']));

        Cache::forget('hospital_units');

        return response()->json([
            'success' => true,
            'message' => 'Unit updated successfully',
            'data' => $unit
        ], 200);
    }

    public function destroy(Request $request, $id)
    {
        $this->checkAccess($request);

        $unit = Unit::findOrFail($id);

        $activeBookings = $unit->bookings()->where('status', 'active')->count();

        if ($activeBookings > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete unit. There are active bookings associated with it.'
            ], 400);
        }

        $unit->delete();
        Cache::forget('hospital_units');

        return response()->json([
            'success' => true,
            'message' => 'Unit deleted successfully'
        ], 200);
    }
}
