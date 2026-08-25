<?php
if (($_GET['token'] ?? '') !== 'Gmcchaav123') {
    http_response_code(403);
    die("Unauthorized");
}
$logPath = __DIR__ . '/../storage/logs/laravel.log';
if (!file_exists($logPath)) {
    die("Log file does not exist.");
}

$content = file_get_contents($logPath);
// Split logs by [YYYY-MM-DD
$entries = preg_split('/^\[\d{4}-\d{2}-\d{2}/m', $content);
$latestEntries = array_slice($entries, -5); // Get last 5 full exception logs

echo "<pre>";
foreach ($latestEntries as $entry) {
    echo "==================================================\n";
    // Print first 10 lines of the entry to get the main error message
    $lines = explode("\n", $entry);
    echo implode("\n", array_slice($lines, 0, 15)) . "\n";
}
echo "</pre>";
