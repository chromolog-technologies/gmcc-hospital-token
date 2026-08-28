<?php
if (($_GET['token'] ?? '') !== 'Gmcchaav123') {
    http_response_code(403);
    die("Unauthorized");
}

echo "<pre>";
$logPath = __DIR__ . '/../storage/logs/laravel.log';
if (file_exists($logPath)) {
    $content = file_get_contents($logPath);
    $entries = preg_split('/^\[\d{4}-\d{2}-\d{2}/m', $content);
    $latestEntries = array_slice($entries, -5); // Get last 5 full exception logs
    foreach ($latestEntries as $entry) {
        echo "==================================================\n";
        $lines = explode("\n", $entry);
        echo implode("\n", array_slice($lines, 0, 15)) . "\n";
    }
} else {
    echo "Log file not found.\n";
}
echo "</pre>";
