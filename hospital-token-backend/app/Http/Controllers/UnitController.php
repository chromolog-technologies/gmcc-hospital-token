<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\Doctor;
use Illuminate\Support\Facades\Cache;

class UnitController extends Controller
{
    public function index()
    {
        // Cache units for 24 hours (86400 seconds) since hospital units rarely change.
        // This significantly boosts performance and reduces DB load.
        // NOTE: We do NOT cache the final mapped result because photo_url depends on
        // APP_URL config (which may change). We cache the raw Eloquent collection instead.
        $units = Cache::remember('hospital_units', 86400, function () {
            return Unit::with('doctors')->get();
        });

        // Map photo_url onto each doctor. The Doctor model's $appends handles this,
        // but we must call toArray() on Eloquent models (not plain PHP arrays) for
        // accessors to fire. Re-hydrate from cache if needed.
        $data = $units->map(function ($unit) {
            if (is_array($unit)) {
                // Cached as plain array: re-hydrate the doctors manually
                $appUrl = rtrim(config('app.url'), '/');
                $unit['doctors'] = array_map(function ($doc) use ($appUrl) {
                    $doc['photo_url'] = !empty($doc['photo'])
                        ? $appUrl . '/storage/' . ltrim($doc['photo'], '/')
                        : null;
                    return $doc;
                }, $unit['doctors'] ?? []);
                return $unit;
            }
            // Fresh Eloquent model: toArray() triggers $appends including photo_url
            return $unit->toArray();
        });

        return response()->json([
            'success' => true,
            'message' => 'Units retrieved successfully',
            'data'    => $data,
        ], 200);
    }
}

