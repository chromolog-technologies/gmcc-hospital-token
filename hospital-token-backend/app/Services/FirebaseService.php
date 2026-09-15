<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseService
{
    /**
     * Sends a push notification to a specific FCM topic.
     */
    public static function sendNotificationToTopic(string $topic, string $title, string $body)
    {
        try {
            $credentialsPath = storage_path('app/firebase_credentials.json');
            
            if (!file_exists($credentialsPath)) {
                Log::error('Firebase credentials file not found.');
                return false;
            }

            $credentials = json_decode(file_get_contents($credentialsPath), true);
            $projectId = $credentials['project_id'];

            $accessToken = self::getAccessToken($credentials);

            if (!$accessToken) {
                Log::error('Failed to get Firebase access token.');
                return false;
            }

            $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

            $response = Http::withToken($accessToken)
                ->post($url, [
                    'message' => [
                        'topic' => $topic,
                        'notification' => [
                            'title' => $title,
                            'body' => $body,
                        ],
                        'android' => [
                            'notification' => [
                                'sound' => 'default',
                            ],
                        ],
                        'apns' => [
                            'payload' => [
                                'aps' => [
                                    'sound' => 'default',
                                ],
                            ],
                        ],
                    ],
                ]);

            if ($response->successful()) {
                Log::info("Firebase notification sent successfully to topic {$topic}");
                return true;
            } else {
                Log::error("Failed to send Firebase notification: " . $response->body());
                return false;
            }

        } catch (\Exception $e) {
            Log::error("Firebase exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Generates an OAuth2 Access Token using the Service Account JSON directly
     * without requiring the heavy google/apiclient composer package.
     */
    private static function getAccessToken(array $credentials): ?string
    {
        $jwtHeader = base64_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        
        $now = time();
        $jwtPayload = base64_encode(json_encode([
            'iss' => $credentials['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud' => $credentials['token_uri'],
            'exp' => $now + 3600,
            'iat' => $now
        ]));
        
        $dataToSign = $jwtHeader . '.' . $jwtPayload;
        
        $signature = '';
        openssl_sign($dataToSign, $signature, $credentials['private_key'], 'sha256WithRSAEncryption');
        
        $jwt = $dataToSign . '.' . self::base64UrlEncode($signature);
        
        $response = Http::asForm()->post($credentials['token_uri'], [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]);

        if ($response->successful()) {
            return $response->json('access_token');
        }
        
        Log::error("Failed to generate JWT for Firebase: " . $response->body());
        return null;
    }

    private static function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
