<?php
/**
 * Cache Clear Trigger
 * Called by GitHub Actions after backend deployment.
 * Secured by a secret token to prevent unauthorized access.
 */

$secret = getenv('CACHE_CLEAR_SECRET') ?: 'gmcch-deploy-secret-2024';

if (!isset($_GET['token']) || $_GET['token'] !== $secret) {
    http_response_code(403);
    die(json_encode(['success' => false, 'message' => 'Unauthorized']));
}

$output = [];
$return = 0;

// Run from the Laravel root
$laravelRoot = __DIR__ . '/../gmcc-api';

exec("cd {$laravelRoot} && php artisan config:cache 2>&1", $output, $return);
exec("cd {$laravelRoot} && php artisan route:cache 2>&1", $output, $return);
exec("cd {$laravelRoot} && php artisan view:cache 2>&1", $output, $return);

header('Content-Type: application/json');
echo json_encode([
    'success' => $return === 0,
    'output'  => implode("\n", $output),
]);
