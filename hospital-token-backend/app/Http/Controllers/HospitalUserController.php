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
        @set_time_limit(300);
        @ini_set('max_execution_time', '300');
        @ini_set('memory_limit', '512M');
        if (function_exists('ignore_user_abort')) {
            @ignore_user_abort(true);
        }

        $this->checkAccess($request);

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
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

        // Strip UTF-8 BOM if present
        $header[0] = preg_replace('/[\x{FEFF}\x{FFFE}]/u', '', $header[0]);
        $header[0] = str_replace("\xEF\xBB\xBF", '', $header[0]);
        $header = array_map(fn($col) => strtolower(trim($col)), $header);

        // Check required columns allowing variations (crno/cr_number/cr/cr_no, name/patient_name)
        $hasName = false;
        $hasCrno = false;
        foreach ($header as $colName) {
            if (in_array($colName, ['name', 'patient_name', 'patient name'])) $hasName = true;
            if (in_array($colName, ['crno', 'cr_number', 'cr number', 'cr_no', 'cr'])) $hasCrno = true;
        }

        if (!$hasName || !$hasCrno) {
            return response()->json([
                'success' => false,
                'message' => 'Missing required columns. The CSV must contain "name" and "crno" (or "cr_number") columns.'
            ], 422);
        }

        // Store file and process import synchronously
        $path = $file->store('imports');
        $absolutePath = \Illuminate\Support\Facades\Storage::path($path);

        $job = new \App\Jobs\ImportPatientsJob($absolutePath);
        $result = $job->process();

        $imported = $result['imported'] ?? 0;
        $skipped  = $result['skipped'] ?? 0;
        $error    = $result['error'] ?? null;

        if ($error) {
            return response()->json([
                'success' => false,
                'message' => "Bulk import failed: " . $error
            ], 500);
        }

        $msg = "Bulk import completed. {$imported} patient" . ($imported === 1 ? '' : 's') . " imported successfully.";
        if ($skipped > 0) {
            $msg .= " ({$skipped} duplicates or invalid rows skipped).";
        }

        return response()->json([
            'success'  => true,
            'imported' => $imported,
            'skipped'  => $skipped,
            'message'  => $msg
        ], 200);
    }

}
