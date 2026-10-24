<?php
// Secure cache clear & OPcache reset bootstrapper for Hostinger deployment
if (($_GET['token'] ?? '') !== 'Gmcchaav123') {
    http_response_code(403);
    die("Unauthorized");
}

$baseDir = __DIR__ . '/../';

// Remove compiled bootstrap cache files
$cacheFiles = glob($baseDir . 'bootstrap/cache/*.php');
$cleared = 0;
if ($cacheFiles) {
    foreach ($cacheFiles as $file) {
        if (@unlink($file)) {
            $cleared++;
        }
    }
}

// Reset OPcache if enabled on Hostinger
$opcacheStatus = "Not active";
if (function_exists('opcache_reset')) {
    if (opcache_reset()) {
        $opcacheStatus = "OPcache reset successfully";
    }
}

echo "Success: Cleared {$cleared} bootstrap cache files. {$opcacheStatus}.";
