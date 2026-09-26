<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;
use App\Services\BookingService;

Artisan::command('tokens:auto-approve', function () {
    BookingService::processAutoApprovals();
    $this->info('Processed pending token auto-approvals.');
})->purpose('Process auto-approval for pending online bookings older than 1 hour');

Schedule::command('tokens:auto-approve')->everyMinute();

