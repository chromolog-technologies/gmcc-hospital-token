<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Support\Facades\Cache;

class UnitController extends Controller
{
    public function index()
    {
        // Cache units for 24 hours (86400 seconds) since hospital units rarely change.
        // We cache plain arrays (safe to serialize). photo_url is injected below, after
        // the cache read, so it always reflects the current APP_URL without being stale.
        $units = Cache::remember('hospital_units', 86400, function () {
            return Unit::with('doctors')->get()->toArray();
        });

        // Guard: coerce to array in case the cache holds a stale Eloquent Collection
        if (!is_array($units)) {
            $units = $units->toArray();
        }

        // Inject photo_url into each doctor. The cached data is a plain PHP array so
        // Eloquent accessors won't fire — we build the URL manually here instead.
        $appUrl = rtrim(config('app.url'), '/');
        $data = array_map(function ($unit) use ($appUrl) {
            $unit['doctors'] = array_map(function ($doc) use ($appUrl) {
                $doc['photo_url'] = !empty($doc['photo'])
                    ? $appUrl . '/storage/' . ltrim($doc['photo'], '/')
                    : null;
                return $doc;
            }, $unit['doctors'] ?? []);
            return $unit;
        }, $units);

        return response()->json([
            'success' => true,
            'message' => 'Units retrieved successfully',
            'data'    => $data,
        ], 200);
    }
}
