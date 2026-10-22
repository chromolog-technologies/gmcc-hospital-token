<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        // Fallback for patient role: allow patient identification by X-User-Id, user_id, or CRNO
        if (!$user && $role === 'patient') {
            $userId = $request->header('X-User-Id') ?? $request->input('user_id') ?? $request->query('user_id');
            $userCrno = $request->header('X-User-Crno') ?? $request->input('crno') ?? $request->query('crno');

            if ($userId) {
                $user = \App\Models\User::find($userId);
            } elseif ($userCrno) {
                $user = \App\Models\User::where('crno', \App\Models\User::formatCrno($userCrno))->first();
            }

            if ($user) {
                $request->setUserResolver(fn () => $user);
            }
        }

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        $userRole = null;
        if ($user instanceof \App\Models\Hospital) {
            $userRole = 'admin';
        } elseif ($user instanceof \App\Models\Doctor) {
            $userRole = 'doctor';
        } elseif ($user instanceof \App\Models\User) {
            $userRole = 'patient';
        }

        if ($userRole !== $role) {
            abort(403, 'Unauthorized. Access restricted to ' . $role . ' only.');
        }

        return $next($request);
    }
}
