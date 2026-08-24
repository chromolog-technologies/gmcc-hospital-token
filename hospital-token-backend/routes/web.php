<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/display/{unit_id}', 'App\Http\Controllers\DisplayController@index')->name('display.index');

Route::post('/logout', function () {
    auth()->logout();
    return redirect('/');
})->name('logout');

// Route to manually create storage symlink (useful for shared hosting like Hostinger)
Route::get('/storage-link', function () {
    try {
        $target = storage_path('app/public');
        $link = public_path('storage');
        
        if (file_exists($link)) {
            if (is_link($link)) {
                unlink($link);
            } else {
                return response()->json(['message' => 'Storage directory/link already exists'], 200);
            }
        }
        
        symlink($target, $link);
        return response()->json(['message' => 'Symlink created successfully'], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Fallback storage route for hosting environments that block symbolic links
Route::get('/storage/{path}', function ($path) {
    if (str_contains($path, '..')) {
        abort(404);
    }
    $fullPath = storage_path("app/public/{$path}");
    if (!file_exists($fullPath) || !is_file($fullPath)) {
        abort(404);
    }
    return response()->file($fullPath);
})->where('path', '.*');
