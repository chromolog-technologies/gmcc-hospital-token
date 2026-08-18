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
