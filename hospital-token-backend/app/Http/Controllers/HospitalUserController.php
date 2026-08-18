<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Hospital;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class HospitalUserController extends Controller
{
    /**
     * Number of rows inserted per database batch.
     */
    private const CHUNK_SIZE = 50;

    private function checkAccess(Request $request)
    {
        if (!$request->user() instanceof Hospital) {
            abort(403, 'Unauthorized. Admin access only.');
        }
    }

    /**
     * List all users or search by CR Number.
     */
    public function index(Request $request)
    {
        $this->checkAccess($request);

        $crno = $request->query('crno');

        if ($crno) {
            $formattedCrno = User::formatCrno($crno);
            $user = User::where('crno', $formattedCrno)->first();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found', 'data' => []], 404);
            }
            return response()->json(['success' => true, 'data' => [$user]]);
        }

        $users = User::orderBy('id', 'desc')->get();
        return response()->json(['success' => true, 'data' => $users]);
    }

    /**
     * Get a single user by ID.
     */
    public function show(Request $request, $id)
    {
        $this->checkAccess($request);

        $user = User::findOrFail($id);
        return response()->json(['success' => true, 'data' => $user]);
    }

    /**
     * Add a single user manually.
     */
    public function store(Request $request)
    {
        $this->checkAccess($request);

        if ($request->has('crno')) {
            $request->merge(['crno' => User::formatCrno($request->crno)]);
        }

        $request->validate([
            'name'        => 'required|string|max:255',
            'crno'        => 'required|string|unique:users,crno',
            'user_age'    => 'nullable|integer|min:0|max:150',
            'user_gender' => 'nullable|string|max:20',
            'password'    => 'nullable|string|min:6',
        ]);

        $password = $request->password ? Hash::make($request->password) : Hash::make($request->crno);

        $user = User::create([
            'name'        => $request->name,
            'crno'        => $request->crno,
            'user_age'    => $request->user_age,
            'user_gender' => $request->user_gender,
            'password'    => $password,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data'    => $user
        ], 201);
    }

    /**
     * Update an existing user's details.
     */
    public function update(Request $request, $id)
    {
        $this->checkAccess($request);

        $user = User::findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'user_age'    => 'nullable|integer|min:0|max:150',
            'user_gender' => 'nullable|string|max:20',
            'password'    => 'nullable|string|min:6',
        ]);

        $data = $request->only(['name', 'user_age', 'user_gender']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data'    => $user->fresh()
        ]);
    }

    /**
     * Delete a user.
     * Guard: cannot delete if user has active bookings.
     */
    public function destroy(Request $request, $id)
    {
        $this->checkAccess($request);

        $user = User::findOrFail($id);

        $activeBookings = $user->bookings()->where('status', 'active')->count();
        if ($activeBookings > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete user. They have active bookings.'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Bulk import users from a CSV file (queued background process).
     */
    public function bulkStore(Request $request)
    {
        $this->checkAccess($request);

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        if ($handle === false) {
            return response()->json(['success' => false, 'message' => 'Could not read the uploaded file.'], 422);
        }

        $header = fgetcsv($handle);
        fclose($handle);

        if (!$header) {
            return response()->json(['success' => false, 'message' => 'The CSV file is empty.'], 422);
        }

        $header = array_map(fn($col) => strtolower(trim($col)), $header);

        $requiredColumns = ['name', 'crno'];
        $missingColumns  = array_diff($requiredColumns, $header);

        if (!empty($missingColumns)) {
            return response()->json([
                'success' => false,
                'message' => 'Missing required columns: ' . implode(', ', $missingColumns) . '. The CSV must have "name" and "crno" columns.'
            ], 422);
        }

        // Store file and dispatch background job
        $path = $file->store('imports');
        $absolutePath = \Illuminate\Support\Facades\Storage::path($path);

        \App\Jobs\ImportPatientsJob::dispatch($absolutePath);

        return response()->json([
            'success'  => true,
            'message'  => "CSV file uploaded successfully. Bulk patient import is now processing in the background."
        ], 200);
    }
}
