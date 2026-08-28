<?php
if (($_GET['token'] ?? '') !== 'Gmcchaav123') {
    http_response_code(403);
    die("Unauthorized");
}

echo "<pre>";
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    echo "Raw keys parsed from .env:\n";
    foreach ($lines as $line) {
        // Skip comments
        if (str_starts_with(trim($line), '#')) {
            continue;
        }
        if (str_contains($line, '=')) {
            list($key, $val) = explode('=', $line, 2);
            $cleanKey = trim($key);
            $cleanVal = trim($val);
            // Hide secret values for privacy, show length
            echo "Key: '$cleanKey', Value length: " . strlen($cleanVal) . ", Preview: " . substr($cleanVal, 0, 10) . "...\n";
        } else {
            echo "Non-key line: '$line'\n";
        }
    }
} else {
    echo ".env file does not exist.\n";
}
echo "</pre>";
