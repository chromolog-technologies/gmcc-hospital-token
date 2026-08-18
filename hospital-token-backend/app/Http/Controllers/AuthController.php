<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\UserLoginRequest;
use App\Http\Requests\DoctorLoginRequest;
use App\Models\User;
use App\Models\Doctor;
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
            return response()->json([
                'success' => false,
                'message' => 'Invalid CRNO.'
            ], 401);
        }

        if ($request->filled('password')) {
            if (!\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid CRNO or password.'
                ], 401);
            }
        }

        $token = $user->createToken('user-token')->plainTextToken;

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
     * Doctor Login (Using username + password)
     */
    public function doctorLogin(DoctorLoginRequest $request)
    {
        $doctor = Doctor::where('username', $request->username)->first();

        if (!$doctor || !Hash::check($request->password, $doctor->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid username or password.'
            ], 401);
        }

        $token = $doctor->createToken('doctor-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Doctor logged in successfully',
            'data' => [
                'doctor' => $doctor,
                'token' => $token
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
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.'
            ], 401);
        }

        $token = $hospital->createToken('hospital-token')->plainTextToken;

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

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ], 200);
    }
}
