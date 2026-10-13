<?php
// Secure database migration runner for cPanel/Hostinger deployment
if (($_GET['token'] ?? '') !== 'Gmcchaav123') {
    http_response_code(403);
    die(json_encode(['success' => false, 'message' => 'Unauthorized']));
}

$baseDir = __DIR__ . '/../';

require $baseDir . 'vendor/autoload.php';
$app = require_once $baseDir . 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$output = '';
try {
    $kernel->call('migrate', ['--force' => true]);
    $output .= \Illuminate\Support\Facades\Artisan::output();
} catch (\Throwable $e) {
    $output .= "Migrate error: " . $e->getMessage() . "\n";
}

try {
    \Illuminate\Support\Facades\DB::statement("ALTER TABLE bookings MODIFY COLUMN source VARCHAR(50) NOT NULL DEFAULT 'online'");
    $output .= "ALTER TABLE bookings MODIFY COLUMN source VARCHAR(50) succeeded.\n";
} catch (\Throwable $e) {
    $output .= "Alter error: " . $e->getMessage() . "\n";
}

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'output'  => $output,
]);
