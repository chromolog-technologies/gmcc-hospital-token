<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Support\Facades\Cache;

class UnitController extends Controller
{
    public function index()
    {
        // Cache units for 24 hours (86400 seconds) since hospital units rarely change.
        // This significantly boosts performance and reduces DB load.
        $units = Cache::remember('hospital_units', 86400, function () {
            return Unit::with('doctors')->get()->toArray();
        });

        return response()->json([
            'success' => true,
            'message' => 'Units retrieved successfully',
            'data' => $units
        ], 200);
    }
}
