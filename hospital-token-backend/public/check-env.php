<?php
if (($_GET['token'] ?? '') !== 'Gmcchaav123') {
    http_response_code(403);
    die("Unauthorized");
}

echo "<pre>";
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

// Boot kernel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Laravel configuration loaded!\n";
echo "Config app.key: " . config('app.key') . "\n";
echo "env('APP_KEY'): " . env('APP_KEY') . "\n";
echo "getenv('APP_KEY'): " . getenv('APP_KEY') . "\n";
echo "Database Connection: " . config('database.default') . "\n";
echo "</pre>";
