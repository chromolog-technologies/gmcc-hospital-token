<?php
if (($_GET['token'] ?? '') !== 'Gmcchaav123') {
    http_response_code(403);
    die("Unauthorized");
}

echo "<pre>";
$imgPath = __DIR__ . '/../storage/app/public/doctors/nonam.png';
echo "Checking nonam.png at: " . $imgPath . "\n";
if (file_exists($imgPath)) {
    echo "nonam.png EXISTS on the server!\n";
    echo "Size: " . filesize($imgPath) . " bytes\n";
} else {
    echo "nonam.png DOES NOT EXIST on the server!\n";
    $dir = __DIR__ . '/../storage/app/public';
    if (file_exists($dir)) {
        echo "Files in storage/app/public/:\n";
        print_r(scandir($dir));
        if (file_exists($dir . '/doctors')) {
            echo "Files in storage/app/public/doctors/:\n";
            print_r(scandir($dir . '/doctors'));
        } else {
            echo "doctors directory does not exist.\n";
        }
    } else {
        echo "storage/app/public directory does not exist.\n";
    }
}
echo "</pre>";
