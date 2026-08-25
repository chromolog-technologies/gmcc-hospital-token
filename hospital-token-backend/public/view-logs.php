<?php
if (($_GET['token'] ?? '') !== 'Gmcchaav123') {
    http_response_code(403);
    die("Unauthorized");
}
$logPath = __DIR__ . '/../storage/logs/laravel.log';
if (!file_exists($logPath)) {
    die("Log file does not exist at " . $logPath);
}
$lines = file($logPath);
$lastLines = array_slice($lines, -100);
echo "<pre>";
echo implode("", $lastLines);
echo "</pre>";
