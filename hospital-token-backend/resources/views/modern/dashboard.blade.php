@extends('layouts.modern')

@section('title', 'Admin Dashboard - GMCC Hospital')

@section('content')
<div class="animate-fade-in">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem;">
        <div>
            <h2 class="font-abel" style="font-size: 2.5rem; color: var(--text-main); margin-bottom: 0.5rem;">Hospital Overview</h2>
            <p style="color: var(--text-muted);">Real-time metrics and administration controls.</p>
        </div>
        <button class="btn-primary">
            <i class="fas fa-plus" style="margin-right: 0.5rem;"></i> New Booking
        </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid-cols-3">
        <div class="glass-card" style="border-left: 5px solid var(--primary-color);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">Today's Bookings</p>
                    <h3 style="font-size: 2rem; margin: 0.5rem 0;">124</h3>
                </div>
                <i class="fas fa-calendar-check" style="font-size: 2.5rem; color: var(--primary-color); opacity: 0.3;"></i>
            </div>
            <p style="font-size: 0.8rem; color: #27ae60;"><i class="fas fa-arrow-up"></i> 12% from yesterday</p>
        </div>

        <div class="glass-card" style="border-left: 5px solid var(--secondary-color);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">Active Queue</p>
                    <h3 style="font-size: 2rem; margin: 0.5rem 0;">18</h3>
                </div>
                <i class="fas fa-users" style="font-size: 2.5rem; color: var(--secondary-color); opacity: 0.3;"></i>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Avg. wait: 14 mins</p>
        </div>

        <div class="glass-card" style="border-left: 5px solid #f1c40f;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">Doctors Online</p>
                    <h3 style="font-size: 2rem; margin: 0.5rem 0;">9 / 12</h3>
                </div>
                <i class="fas fa-user-md" style="font-size: 2.5rem; color: #f1c40f; opacity: 0.3;"></i>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted);">3 On Break</p>
        </div>
    </div>

    <!-- Quick Actions -->
    <h3 class="font-abel" style="margin: 3rem 0 1.5rem; font-size: 1.5rem;">Quick Management</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
        <a href="#" class="glass-card flex-center" style="text-decoration: none; padding: 1.5rem; flex-direction: column; gap: 1rem;">
            <i class="fas fa-user-plus" style="font-size: 1.5rem; color: var(--primary-color);"></i>
            <span style="color: var(--text-main); font-weight: 600;">Add Doctor</span>
        </a>
        <a href="#" class="glass-card flex-center" style="text-decoration: none; padding: 1.5rem; flex-direction: column; gap: 1rem;">
            <i class="fas fa-clinic-medical" style="font-size: 1.5rem; color: var(--primary-color);"></i>
            <span style="color: var(--text-main); font-weight: 600;">Manage Units</span>
        </a>
        <a href="#" class="glass-card flex-center" style="text-decoration: none; padding: 1.5rem; flex-direction: column; gap: 1rem;">
            <i class="fas fa-file-export" style="font-size: 1.5rem; color: var(--primary-color);"></i>
            <span style="color: var(--text-main); font-weight: 600;">Daily Report</span>
        </a>
        <a href="#" class="glass-card flex-center" style="text-decoration: none; padding: 1.5rem; flex-direction: column; gap: 1rem;">
            <i class="fas fa-cog" style="font-size: 1.5rem; color: var(--primary-color);"></i>
            <span style="color: var(--text-main); font-weight: 600;">Settings</span>
        </a>
    </div>
</div>
@endsection
