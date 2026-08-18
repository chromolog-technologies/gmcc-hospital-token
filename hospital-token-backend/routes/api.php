<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DoctorController;

// Apply standard API rate limiting
Route::middleware('throttle:60,1')->group(function () {
    
    // Strict Rate Limiting for Auth
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('/user/login', [AuthController::class, 'userLogin']);
        Route::post('/doctor/login', [AuthController::class, 'doctorLogin']);
        Route::post('/hospital/login', [AuthController::class, 'hospitalLogin']);
    });

    Route::get('/units', [UnitController::class, 'index']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        Route::post('/logout', [AuthController::class, 'logout']);

        // Patient / User Only Routes
        Route::middleware('role:patient')->group(function () {
            // Booking Endpoints (Users)
            Route::get('/booking/availability', [BookingController::class, 'getAvailability']);
            Route::post('/booking/create', [BookingController::class, 'create']);
            Route::get('/booking/my-bookings', [BookingController::class, 'getByUser']);
            Route::post('/booking/cancel', [BookingController::class, 'cancel']);
        });
        
        // Doctor Only Routes
        Route::middleware('role:doctor')->group(function () {
            // Doctor Queue Endpoints
            Route::get('/doctor/queue/{unit_id}', [DoctorController::class, 'getQueue']);
            Route::get('/doctor/current/{unit_id}', [DoctorController::class, 'getCurrentToken']);
            Route::post('/doctor/call-next', [DoctorController::class, 'callNext']);
            Route::post('/doctor/complete', [DoctorController::class, 'markCompleted']);
        });

        // Hospital Admin Only Routes
        Route::middleware('role:admin')->group(function () {
            // Hospital Admin Dashboard Endpoints
            Route::prefix('hospital/dashboard')->group(function () {
                Route::get('/summary', [\App\Http\Controllers\HospitalDashboardController::class, 'getSummary']);
                Route::get('/units', [\App\Http\Controllers\HospitalDashboardController::class, 'getUnitStats']);
                Route::get('/doctors', [\App\Http\Controllers\HospitalDashboardController::class, 'getDoctorStats']);
            });

            // Hospital User Management Endpoints
            Route::prefix('hospital/users')->group(function () {
                Route::get('/',        [\App\Http\Controllers\HospitalUserController::class, 'index']);
                Route::post('/',       [\App\Http\Controllers\HospitalUserController::class, 'store']);
                Route::post('/bulk',   [\App\Http\Controllers\HospitalUserController::class, 'bulkStore']);
                Route::get('/{id}',    [\App\Http\Controllers\HospitalUserController::class, 'show']);
                Route::put('/{id}',    [\App\Http\Controllers\HospitalUserController::class, 'update']);
                Route::delete('/{id}', [\App\Http\Controllers\HospitalUserController::class, 'destroy']);
            });

            // Hospital Doctor Management Endpoints
            Route::prefix('hospital/doctors')->group(function () {
                Route::get('/',        [\App\Http\Controllers\HospitalDoctorController::class, 'index']);
                Route::post('/',       [\App\Http\Controllers\HospitalDoctorController::class, 'store']);
                Route::get('/{id}',    [\App\Http\Controllers\HospitalDoctorController::class, 'show']);
                Route::put('/{id}',    [\App\Http\Controllers\HospitalDoctorController::class, 'update']);
                Route::delete('/{id}', [\App\Http\Controllers\HospitalDoctorController::class, 'destroy']);
            });

            // Hospital Unit Management Endpoints
            Route::prefix('hospital/units')->group(function () {
                Route::post('/',       [\App\Http\Controllers\HospitalUnitController::class, 'store']);
                Route::put('/{id}',    [\App\Http\Controllers\HospitalUnitController::class, 'update']);
                Route::delete('/{id}', [\App\Http\Controllers\HospitalUnitController::class, 'destroy']);
            });

            // Hospital Booking Management Endpoints
            Route::prefix('hospital/bookings')->group(function () {
                Route::get('/', [\App\Http\Controllers\HospitalBookingController::class, 'index']);
                Route::get('/availability', [\App\Http\Controllers\HospitalBookingController::class, 'getAvailability']);
                Route::post('/offline', [\App\Http\Controllers\HospitalBookingController::class, 'storeOffline']);
                Route::put('/{id}/status', [\App\Http\Controllers\HospitalBookingController::class, 'updateStatus']);
                Route::get('/settings', [\App\Http\Controllers\HospitalBookingController::class, 'getSettings']);
                Route::put('/auto-approve', [\App\Http\Controllers\HospitalBookingController::class, 'updateAutoApprove']);
            });
        });
    });
});
