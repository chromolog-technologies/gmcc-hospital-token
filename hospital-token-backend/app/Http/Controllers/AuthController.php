<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\UserLoginRequest;
use App\Http\Requests\DoctorLoginRequest;
use App\Models\User;
use App\Models\Doctor;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * User Login (Using CRNO)
     */
    public function userLogin(UserLoginRequest $request)
    {
        $crno = User::formatCrno($request->crno);
        $user = User::where('crno', $crno)->first();

        if (!$user) {
            ActivityLogger::log(null, 'login_failed', 'Patient login failed: unknown CRNO', null, ['actor_type' => 'patient', 'actor_name' => $crno]);
            return response()->json([
                'success' => false,
                'message' => 'Invalid CRNO.'
            ], 401);
        }

        if ($request->filled('password')) {
            if (!\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
                ActivityLogger::log($user, 'login_failed', 'Patient login failed: wrong password');
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid CRNO or password.'
                ], 401);
            }
        }

        $token = $user->createToken('user-token')->plainTextToken;
        ActivityLogger::log($user, 'login', 'Patient logged in');

        return response()->json([
            'success' => true,
            'message' => 'User logged in successfully',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], 200);
    }

    /**
     * Doctor Login (Using regno + password)
     */
    public function doctorLogin(DoctorLoginRequest $request)
    {
        $doctor = Doctor::where('regno', $request->regno)->with('unit')->first();

        if (!$doctor || !Hash::check($request->password, $doctor->password)) {
            ActivityLogger::log($doctor, 'login_failed', 'Doctor login failed', null, $doctor ? [] : ['actor_type' => 'doctor', 'actor_name' => $request->regno]);
            return response()->json([
                'success' => false,
                'message' => 'Invalid registration number or password.'
            ], 401);
        }

        $token = $doctor->createToken('doctor-token')->plainTextToken;
        ActivityLogger::log($doctor, 'login', 'Doctor logged in');

        // Build doctor data with units as an array (dashboard expects doctor['units'])
        $doctorData = $doctor->toArray();
        $doctorData['units'] = $doctor->unit ? [$doctor->unit->toArray()] : [];

        return response()->json([
            'success' => true,
            'message' => 'Doctor logged in successfully',
            'data' => [
                'doctor' => $doctorData,
                'token'  => $token
            ]
        ], 200);
    }

    /**
     * Hospital Login
     */
    public function hospitalLogin(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|min:8',
        ]);

        $hospital = \App\Models\Hospital::where('email', $request->email)->first();

        if (!$hospital || !\Illuminate\Support\Facades\Hash::check($request->password, $hospital->password)) {
            ActivityLogger::log($hospital, 'login_failed', 'Admin login failed', null, $hospital ? [] : ['actor_type' => 'admin', 'actor_name' => $request->email]);
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.'
            ], 401);
        }

        $token = $hospital->createToken('hospital-token')->plainTextToken;
        ActivityLogger::log($hospital, 'login', 'Admin logged in');

        return response()->json([
            'success' => true,
            'message' => 'Hospital logged in successfully',
            'data' => [
                'hospital' => $hospital,
                'token' => $token
            ]
        ], 200);
    }

    /**
     * Revoke the current user's token (logout)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        ActivityLogger::log($request->user(), 'logout', 'Logged out');

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ], 200);
    }
}
