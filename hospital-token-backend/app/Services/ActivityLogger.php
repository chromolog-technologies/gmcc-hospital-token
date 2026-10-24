<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Doctor;
use App\Models\Hospital;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Writes login / activity audit records to the activity_logs table.
 *
 * Logging is strictly best-effort: any failure (e.g. migration not yet run)
 * is swallowed so it can never break a login or booking request.
 */
class ActivityLogger
{
    /**
     * Log an action performed by an admin, doctor or patient.
     *
     * @param Model|null  $actor    Hospital (admin), Doctor or User (patient); null for anonymous / system
     * @param string      $action   e.g. login, login_failed, logout, booking_created, booking_cancelled
     * @param Model|null  $subject  The record acted upon (e.g. a Booking)
     */
    public static function log(?Model $actor, string $action, ?string $description = null, ?Model $subject = null, array $meta = [], ?Request $request = null): void
    {
        try {
            $request ??= request();
            [$actorType, $actorName] = self::describeActor($actor);

            if (isset($meta['actor_type'])) {
                $actorType = $meta['actor_type'];
                unset($meta['actor_type']);
            }
            if (isset($meta['actor_name'])) {
                $actorName = $meta['actor_name'];
                unset($meta['actor_name']);
            }

            $client = self::clientInfo($request);

            $log = ActivityLog::create(array_merge($client, [
                'actor_type'   => $actorType,
                'actor_id'     => $actor?->getKey(),
                'actor_name'   => $actorName,
                'action'       => $action,
                'description'  => $description ? mb_substr($description, 0, 255) : null,
                'subject_type' => $subject ? strtolower(class_basename($subject)) : null,
                'subject_id'   => $subject?->getKey(),
                'meta'         => $meta ?: null,
            ]));

            // Resolve IP location and prune old rows after the response is sent,
            // so neither slows down the request.
            app()->terminating(function () use ($log) {
                self::resolveLocation($log);
                self::pruneIfDue();
            });
        } catch (\Throwable $e) {
            Log::warning('ActivityLogger failed: ' . $e->getMessage());
        }
    }

    /**
     * Log a system action (e.g. scheduled auto-approval) for many bookings at once.
     */
    public static function logSystemBulk(string $action, string $subjectType, array $subjectIds, string $description): void
    {
        if (empty($subjectIds)) {
            return;
        }

        try {
            $now = now();
            $rows = array_map(fn ($id) => [
                'actor_type'   => 'system',
                'actor_name'   => 'System',
                'action'       => $action,
                'description'  => $description,
                'subject_type' => $subjectType,
                'subject_id'   => $id,
                'platform'     => 'server',
                'created_at'   => $now,
            ], $subjectIds);

            foreach (array_chunk($rows, 200) as $chunk) {
                ActivityLog::insert($chunk);
            }
        } catch (\Throwable $e) {
            Log::warning('ActivityLogger bulk failed: ' . $e->getMessage());
        }
    }

    /**
     * Delete records older than the retention window.
     */
    public static function prune(): int
    {
        return ActivityLog::where('created_at', '<', now()->subDays(ActivityLog::RETENTION_DAYS))->delete();
    }

    /**
     * Prune at most once every 12 hours. Acts as a fallback in case the
     * scheduler (cron) is not running on the host.
     */
    private static function pruneIfDue(): void
    {
        try {
            if (Cache::add('activity_logs:pruned', true, now()->addHours(12))) {
                self::prune();
            }
        } catch (\Throwable $e) {
            Log::warning('ActivityLog prune failed: ' . $e->getMessage());
        }
    }

    private static function describeActor(?Model $actor): array
    {
        return match (true) {
            $actor instanceof Hospital => ['admin', $actor->email ?: $actor->name],
            $actor instanceof Doctor   => ['doctor', trim($actor->name . ($actor->regno ? " ({$actor->regno})" : ''))],
            $actor instanceof User     => ['patient', trim($actor->name . ($actor->crno ? " ({$actor->crno})" : ''))],
            default                    => ['unknown', null],
        };
    }

    /**
     * Collects IP + system info from the request. Clients can enrich this by sending:
     *   X-Client-Platform: web | android | ios
     *   X-App-Version:     app version string
     *   X-Device-Info:     URL-encoded JSON object (device model, OS version, screen, timezone, ...)
     */
    private static function clientInfo(Request $request): array
    {
        $userAgent = (string) $request->userAgent();
        $parsed = self::parseUserAgent($userAgent);

        $deviceInfo = null;
        $rawDeviceInfo = $request->header('X-Device-Info');
        if ($rawDeviceInfo && strlen($rawDeviceInfo) <= 4096) {
            $decoded = json_decode(rawurldecode($rawDeviceInfo), true);
            if (is_array($decoded)) {
                $deviceInfo = $decoded;
            }
        }

        $platform = strtolower((string) $request->header('X-Client-Platform', ''));
        if ($platform === '') {
            $platform = match (true) {
                str_contains($userAgent, 'Dart/') => 'app',
                $userAgent !== ''                 => 'web',
                default                           => null,
            };
        }

        if ($appVersion = $request->header('X-App-Version')) {
            $deviceInfo['app_version'] = mb_substr($appVersion, 0, 50);
        }

        // Prefer the richer client-supplied details for native apps
        $os = $parsed['os'];
        $device = $parsed['device'];
        if (!empty($deviceInfo['os'])) {
            $os = trim($deviceInfo['os'] . ' ' . ($deviceInfo['os_version'] ?? ''));
        }
        if (!empty($deviceInfo['model'])) {
            $device = trim(($deviceInfo['manufacturer'] ?? '') . ' ' . $deviceInfo['model']);
        }

        return [
            'platform'    => $platform ? mb_substr($platform, 0, 20) : null,
            'ip_address'  => $request->ip(),
            'browser'     => $parsed['browser'] ? mb_substr($parsed['browser'], 0, 100) : null,
            'os'          => $os ? mb_substr($os, 0, 100) : null,
            'device'      => $device ? mb_substr($device, 0, 150) : null,
            'user_agent'  => $userAgent !== '' ? mb_substr($userAgent, 0, 1000) : null,
            'device_info' => $deviceInfo,
        ];
    }

    /**
     * Lightweight user-agent parser (browser, OS, device type).
     */
    private static function parseUserAgent(string $ua): array
    {
        if ($ua === '') {
            return ['browser' => null, 'os' => null, 'device' => null];
        }

        $browser = null;
        foreach ([
            'Edge'    => '/Edg(?:e|A|iOS)?\/([\d.]+)/',
            'Opera'   => '/(?:OPR|Opera)\/([\d.]+)/',
            'Samsung Internet' => '/SamsungBrowser\/([\d.]+)/',
            'Chrome'  => '/(?:Chrome|CriOS)\/([\d.]+)/',
            'Firefox' => '/(?:Firefox|FxiOS)\/([\d.]+)/',
            'Safari'  => '/Version\/([\d.]+).*Safari/',
            'Dart'    => '/Dart\/([\d.]+)/',
        ] as $name => $pattern) {
            if (preg_match($pattern, $ua, $m)) {
                $browser = $name . ' ' . explode('.', $m[1])[0];
                break;
            }
        }

        $os = match (true) {
            (bool) preg_match('/Android ([\d.]+)/', $ua, $m)            => 'Android ' . $m[1],
            (bool) preg_match('/(?:iPhone|CPU) OS ([\d_]+)/', $ua, $m)  => 'iOS ' . str_replace('_', '.', $m[1]),
            (bool) preg_match('/Windows NT ([\d.]+)/', $ua, $m)         => 'Windows ' . ($m[1] === '10.0' ? '10/11' : $m[1]),
            (bool) preg_match('/Mac OS X ([\d_]+)/', $ua, $m)           => 'macOS ' . str_replace('_', '.', $m[1]),
            str_contains($ua, 'CrOS')                                    => 'ChromeOS',
            str_contains($ua, 'Linux')                                   => 'Linux',
            default                                                      => null,
        };

        $device = match (true) {
            (bool) preg_match('/iPad|Tablet/i', $ua)               => 'Tablet',
            (bool) preg_match('/Mobile|iPhone|Android/i', $ua)     => 'Mobile',
            str_contains($ua, 'Dart/')                             => 'Mobile',
            default                                                => 'Desktop',
        };

        return ['browser' => $browser, 'os' => $os, 'device' => $device];
    }

    /**
     * Approximate location from the IP address (city / region / country).
     * Results are cached per IP for a day to stay well within free API limits.
     */
    private static function resolveLocation(ActivityLog $log): void
    {
        try {
            $ip = $log->ip_address;
            if (!$ip || !config('services.ip_geolocation.enabled')) {
                return;
            }

            if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                $log->update(['location' => 'Local / Private network']);
                return;
            }

            $geo = Cache::remember("ip_geo:{$ip}", now()->addDay(), function () use ($ip) {
                $url = str_replace('{ip}', urlencode($ip), config('services.ip_geolocation.url'));
                $res = Http::timeout(3)->get($url);
                if (!$res->ok() || $res->json('status') !== 'success') {
                    return null;
                }
                return [
                    'location'  => implode(', ', array_filter([$res->json('city'), $res->json('regionName'), $res->json('country')])),
                    'latitude'  => $res->json('lat'),
                    'longitude' => $res->json('lon'),
                    'isp'       => $res->json('isp'),
                ];
            });

            if ($geo) {
                $log->update([
                    'location'  => mb_substr($geo['location'], 0, 255) ?: null,
                    'latitude'  => $geo['latitude'],
                    'longitude' => $geo['longitude'],
                    'meta'      => array_merge($log->meta ?? [], array_filter(['isp' => $geo['isp']])),
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('IP geolocation failed: ' . $e->getMessage());
        }
    }
}
