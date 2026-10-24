<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;
use App\Services\BookingService;
use App\Services\ActivityLogger;
use App\Models\ActivityLog;

Artisan::command('tokens:auto-approve', function () {
    BookingService::processAutoApprovals();
    $this->info('Processed pending token auto-approvals.');
})->purpose('Process auto-approval for pending online bookings older than 1 hour');

Schedule::command('tokens:auto-approve')->everyMinute();

Artisan::command('logs:prune', function () {
    $deleted = ActivityLogger::prune();
    $this->info("Deleted {$deleted} activity log records older than " . ActivityLog::RETENTION_DAYS . " days.");
})->purpose('Delete login/activity logs older than the 30-day retention window');

Schedule::command('logs:prune')->daily();

