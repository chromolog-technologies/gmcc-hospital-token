<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ActivityLog;
use App\Models\Hospital;

class ActivityLogController extends Controller
{
    private function checkAccess(Request $request)
    {
        if (!$request->user() instanceof Hospital) {
            abort(403, 'Unauthorized. Admin access only.');
        }
    }

    /**
     * List login / activity logs (last 30 days), newest first, with optional filters.
     */
    public function index(Request $request)
    {
        $this->checkAccess($request);

        $request->validate([
            'actor_type' => 'nullable|in:admin,doctor,patient,system,unknown',
            'action'     => 'nullable|string|max:50',
            'category'   => 'nullable|in:auth,booking',
            'date'       => 'nullable|date',
            'search'     => 'nullable|string|max:100',
            'per_page'   => 'nullable|integer|min:1|max:200',
        ]);

        $query = ActivityLog::query()->orderByDesc('created_at')->orderByDesc('id');

        if ($request->filled('actor_type')) {
            $query->where('actor_type', $request->actor_type);
        }
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }
        if ($request->category === 'auth') {
            $query->whereIn('action', ['login', 'login_failed', 'logout']);
        } elseif ($request->category === 'booking') {
            $query->where('action', 'like', 'booking_%');
        }
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('actor_name', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success'        => true,
            'retention_days' => ActivityLog::RETENTION_DAYS,
            'data'           => $query->paginate((int) $request->input('per_page', 50)),
        ]);
    }
}
