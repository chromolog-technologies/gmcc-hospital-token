<?php
if (($_GET['token'] ?? '') !== 'Gmcchaav123') {
    http_response_code(403);
    die("Unauthorized");
}

echo "<pre>";
$cacheDir = __DIR__ . '/../bootstrap/cache';
echo "Files in bootstrap/cache:\n";
if (file_exists($cacheDir)) {
    $files = scandir($cacheDir);
    print_r($files);
    
    foreach (['config.php', 'routes-v7.php', 'events.php'] as $cacheFile) {
        $filePath = $cacheDir . '/' . $cacheFile;
        if (file_exists($filePath)) {
            echo "Deleting cached file: $cacheFile\n";
            unlink($filePath);
        }
    }
} else {
    echo "bootstrap/cache directory does not exist.\n";
}
echo "</pre>";
