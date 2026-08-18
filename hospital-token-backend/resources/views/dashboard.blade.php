@extends('layouts.app')

@section('title', 'Admin Dashboard - GMCCH Hospital')

@section('content')
<div style="width: 100%;">
    <div style="margin-bottom: 3rem; text-align: center;">
        <h2 class="font-abel" style="font-size: 2.5rem; color: var(--primary); margin: 0; text-transform: uppercase; letter-spacing: 3px;">Hospital Overview</h2>
        <p style="color: var(--text-muted); font-weight: 500;">Token & Booking Statistics for <strong>{{ $targetDate }}</strong> (Tomorrow)</p>
    </div>

    {{-- Stats Grid --}}
    <div class="dashboard-grid">
        <x-dashboard-card label="Total Bookings" :value="$total" icon="fas fa-calendar-check" />
        <x-dashboard-card label="Chemotherapy" :value="$chemo" icon="fas fa-pills" />
        <x-dashboard-card label="Follow-up" :value="$normal" icon="fas fa-user-md" />
        <x-dashboard-card label="Completed" :value="$completed" icon="fas fa-check-double" />
        <x-dashboard-card label="Active Tokens" :value="$active" icon="fas fa-clock" />
        <x-dashboard-card label="Cancelled" :value="$cancelled" icon="fas fa-times-circle" />
    </div>

    {{-- Quick Actions --}}
    <div style="margin-top: 4rem;">
        <h3 class="font-abel" style="font-size: 1.5rem; text-align: center; margin-bottom: 2rem; color: var(--text-main); text-transform: uppercase; letter-spacing: 2px;">Quick Navigation</h3>
        <div class="action-grid">
            <a href="{{ route('bookings.create') }}" class="btn-action">
                <i class="fas fa-plus-circle"></i>
                <span>Add Booking</span>
            </a>
            <a href="#" class="btn-action">
                <i class="fas fa-list-alt"></i>
                <span>View Bookings</span>
            </a>
            <a href="#" class="btn-action">
                <i class="fas fa-users-viewfinder"></i>
                <span>Queue View</span>
            </a>
        </div>
    </div>
</div>
@endsection
