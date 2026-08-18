@extends('layouts.modern')

@section('title', 'Live Token Queue - GMCC Hospital')

@section('content')
<div class="animate-fade-in" style="text-align: center;">
    <div style="margin-bottom: 3rem;">
        <h2 class="font-abel" style="font-size: 3rem; color: var(--text-main); margin-bottom: 0.5rem;">Live Queue Display</h2>
        <p style="color: var(--text-muted); font-size: 1.2rem;">Real-time token status for all departments.</p>
        <div style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1.5rem; background: var(--secondary-color); color: white; border-radius: 50px; font-weight: 600;">
            <i class="fas fa-circle" style="font-size: 0.7rem; margin-right: 0.5rem; animation: pulse 2s infinite;"></i> LIVE UPDATING
        </div>
    </div>

    <!-- Active Now Section -->
    <div class="glass-card" style="background: var(--primary-color); color: white; margin-bottom: 4rem; padding: 3rem;">
        <p style="text-transform: uppercase; letter-spacing: 3px; font-weight: 600; opacity: 0.8;">Now Serving</p>
        <h1 class="font-abel" style="font-size: 8rem; margin: 1rem 0;">#T-2040</h1>
        <div style="display: flex; justify-content: center; gap: 3rem; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 2rem; margin-top: 2rem;">
            <div>
                <p style="opacity: 0.8; font-size: 0.9rem;">PATIENT</p>
                <p style="font-size: 1.5rem; font-weight: 600;">Priya Patel</p>
            </div>
            <div style="width: 1px; background: rgba(255,255,255,0.2);"></div>
            <div>
                <p style="opacity: 0.8; font-size: 0.9rem;">UNIT</p>
                <p style="font-size: 1.5rem; font-weight: 600;">Pediatrics (Room 3)</p>
            </div>
        </div>
    </div>

    <!-- Upcoming Queue -->
    <div class="grid-cols-3">
        <div class="glass-card" style="padding: 1.5rem;">
            <p style="color: var(--primary-color); font-weight: 600; margin-bottom: 1rem;">NEXT UP</p>
            <h3 style="font-size: 2.5rem;">#T-2041</h3>
            <p style="color: var(--text-muted);">Rahul Sharma</p>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">Cardiology</p>
        </div>
        <div class="glass-card" style="padding: 1.5rem;">
            <p style="color: var(--text-muted); font-weight: 600; margin-bottom: 1rem;">IN QUEUE</p>
            <h3 style="font-size: 2.5rem;">#T-2042</h3>
            <p style="color: var(--text-muted);">Sneha Gupta</p>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">General Medicine</p>
        </div>
        <div class="glass-card" style="padding: 1.5rem;">
            <p style="color: var(--text-muted); font-weight: 600; margin-bottom: 1rem;">IN QUEUE</p>
            <h3 style="font-size: 2.5rem;">#T-2043</h3>
            <p style="color: var(--text-muted);">Amit Verma</p>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">General Medicine</p>
        </div>
    </div>
</div>

<style>
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.3; }
        100% { opacity: 1; }
    }
</style>
@endsection
