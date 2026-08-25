<?php
// Secure remote unzip script for automated deployment
if (($_GET['token'] ?? '') !== 'Gmcchaav123') {
    http_response_code(403);
    die("Unauthorized");
}

$zipFile = __DIR__ . '/../backend.zip';
$extractTo = __DIR__ . '/../';

if (!file_exists($zipFile)) {
    http_response_code(404);
    die("Error: backend.zip not found.");
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo($extractTo);
    $zip->close();
    unlink($zipFile); // Remove the zip file after successful extraction
    echo "Success: Unzipped backend files successfully!";
} else {
    http_response_code(500);
    echo "Error: Failed to open zip file.";
}
