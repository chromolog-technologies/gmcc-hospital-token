<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\Hospital;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Check if the request is from an admin (hospital)
     */
    private function checkAccess(Request $request)
    {
        $user = $request->user();
        if (!$user instanceof Hospital) {
            abort(403, 'Unauthorized. Only admins can manage notifications.');
        }
    }

    /**
     * Get all notifications (used by both Admin and Patient App)
     */
    public function index(Request $request)
    {
        $notifications = Notification::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data'    => $notifications
        ]);
    }

    /**
     * Create a new notification (Admin only)
     */
    public function store(Request $request)
    {
        $this->checkAccess($request);

        $request->validate([
            'title'   => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $notification = Notification::create([
            'title'   => $request->title,
            'message' => $request->message,
        ]);

        $this->sendPushNotification($notification->title, $notification->message);

        return response()->json([
            'success' => true,
            'message' => 'Notification created and sent successfully',
            'data'    => $notification
        ], 201);
    }

    /**
     * Update an existing notification (Admin only)
     */
    public function update(Request $request, $id)
    {
        $this->checkAccess($request);

        $request->validate([
            'title'   => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
        ]);

        $notification = Notification::findOrFail($id);
        $notification->update($request->only(['title', 'message']));

        return response()->json([
            'success' => true,
            'message' => 'Notification updated successfully',
            'data'    => $notification
        ]);
    }

    /**
     * Delete a notification (Admin only)
     */
    public function destroy(Request $request, $id)
    {
        $this->checkAccess($request);

        $notification = Notification::findOrFail($id);
        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted successfully'
        ]);
    }

    /**
     * Helper to send push notifications via Firebase
     */
    private function sendPushNotification($title, $body)
    {
        // TODO: Implement FCM Push Notification broadcast here
        // We will do this once the user provides the Firebase Service Account JSON.
        Log::info("Push Notification Broadcast Placeholder: Title: {$title}, Body: {$body}");
    }
}
