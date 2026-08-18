<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Doctor;
use App\Models\Hospital;
use App\Models\Unit;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class HospitalDoctorController extends Controller
{
    private function checkAccess(Request $request)
    {
        if (!$request->user() instanceof Hospital) {
            abort(403, 'Unauthorized. Admin access only.');
        }
    }

    /**
     * List all doctors with their unit assignment.
     */
    public function index(Request $request)
    {
        $this->checkAccess($request);

        $doctors = Doctor::with('unit')->orderBy('id', 'desc')->get()->map(function ($doctor) {
            return array_merge($doctor->toArray(), [
                'photo_url' => $doctor->photo ? Storage::disk('public')->url($doctor->photo) : null,
                'unit_name' => $doctor->unit?->name ?? null,
                'unit_id'   => $doctor->unit?->id ?? null,
            ]);
        });

        return response()->json(['success' => true, 'data' => $doctors]);
    }

    /**
     * Get a single doctor by ID.
     */
    public function show(Request $request, $id)
    {
        $this->checkAccess($request);

        $doctor = Doctor::with('unit')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => array_merge($doctor->toArray(), [
                'photo_url' => $doctor->photo ? Storage::disk('public')->url($doctor->photo) : null,
                'unit_name' => $doctor->unit?->name ?? null,
                'unit_id'   => $doctor->unit?->id ?? null,
            ])
        ]);
    }

    /**
     * Register a new doctor.
     */
    public function store(Request $request)
    {
        $this->checkAccess($request);

        $request->validate([
            'name'          => 'required|string|max:255',
            'qualification' => 'nullable|string|max:255',
            'unit_id'       => 'required|exists:units,id',
            'department'    => 'nullable|string|max:255',
            'phone'         => 'nullable|string|max:20',
            'gender'        => 'nullable|in:male,female,other',
            'regno'         => 'required|string|unique:doctors,regno',
            'password'      => 'required|string|min:8',
            'photo'         => 'nullable|image|mimes:jpeg,png|max:2048',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('doctors', 'public');
        }

        $doctor = Doctor::create([
            'name'          => $request->name,
            'qualification' => $request->qualification,
            'username'      => $request->regno,
            'password'      => Hash::make($request->password),
            'department'    => $request->department,
            'phone'         => $request->phone,
            'gender'        => $request->gender,
            'regno'         => $request->regno,
            'photo'         => $photoPath,
            'unit_id'       => $request->unit_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Doctor added successfully',
            'data'    => array_merge($doctor->toArray(), [
                'photo_url' => $doctor->photo ? Storage::disk('public')->url($doctor->photo) : null,
            ])
        ], 201);
    }

    /**
     * Update a doctor's details.
     */
    public function update(Request $request, $id)
    {
        $this->checkAccess($request);

        $doctor = Doctor::findOrFail($id);

        $request->validate([
            'name'          => 'sometimes|string|max:255',
            'qualification' => 'nullable|string|max:255',
            'department'    => 'nullable|string|max:255',
            'phone'         => 'nullable|string|max:20',
            'gender'        => 'nullable|in:male,female,other',
            'password'      => 'nullable|string|min:8',
            'unit_id'       => 'nullable|exists:units,id',
            'photo'         => 'nullable|image|mimes:jpeg,png|max:2048',
        ]);

        $data = $request->only(['name', 'qualification', 'department', 'phone', 'gender', 'unit_id']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($doctor->photo) {
                Storage::disk('public')->delete($doctor->photo);
            }
            $data['photo'] = $request->file('photo')->store('doctors', 'public');
        }

        $doctor->update($data);

        $doctor->refresh()->load('unit');

        return response()->json([
            'success' => true,
            'message' => 'Doctor updated successfully',
            'data'    => array_merge($doctor->toArray(), [
                'photo_url' => $doctor->photo ? Storage::disk('public')->url($doctor->photo) : null,
                'unit_name' => $doctor->unit?->name ?? null,
                'unit_id'   => $doctor->unit?->id ?? null,
            ])
        ]);
    }

    /**
     * Delete a doctor.
     * Unassigns from unit before deleting.
     */
    public function destroy(Request $request, $id)
    {
        $this->checkAccess($request);

        $doctor = Doctor::findOrFail($id);

        // Delete photo if exists
        if ($doctor->photo) {
            Storage::disk('public')->delete($doctor->photo);
        }

        $doctor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Doctor deleted successfully'
        ]);
    }
}
