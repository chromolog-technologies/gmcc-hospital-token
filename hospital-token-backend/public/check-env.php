<?php
if (($_GET['token'] ?? '') !== 'Gmcchaav123') {
    http_response_code(403);
    die("Unauthorized");
}

$envPath = __DIR__ . '/../.env';
echo "<pre>";
if (file_exists($envPath)) {
    echo ".env file exists!\n";
    echo "Is readable: " . (is_readable($envPath) ? 'Yes' : 'No') . "\n";
    echo "Size: " . filesize($envPath) . " bytes\n";
    
    $content = file_get_contents($envPath);
    if (str_contains($content, 'APP_KEY')) {
        echo "APP_KEY is present in the file.\n";
    } else {
        echo "APP_KEY is MISSING in the file.\n";
    }
} else {
    echo ".env file DOES NOT EXIST at path: " . $envPath . "\n";
    echo "Parent directory resolved real path: " . realpath(__DIR__ . '/../') . "\n";
    echo "Files in parent directory:\n";
    print_r(scandir(__DIR__ . '/../'));
}
echo "</pre>";
