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
