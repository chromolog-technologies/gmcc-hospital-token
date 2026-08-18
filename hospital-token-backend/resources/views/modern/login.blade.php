@extends('layouts.modern')

@section('title', 'Sign In - GMCC Hospital')

@section('content')
<div class="flex-center" style="min-height: 70vh;">
    <div class="glass-card animate-fade-in" style="width: 100%; max-width: 450px;">
        <div style="text-align: center; margin-bottom: 2.5rem;">
            <i class="fas fa-hospital-user" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
            <h2 class="font-abel" style="font-size: 2rem; color: var(--text-main);">Welcome Back</h2>
            <p style="color: var(--text-muted);">Sign in to access the hospital portal</p>
        </div>

        <form action="#" method="POST">
            <div class="form-group">
                <label for="email">Email Address</label>
                <div style="position: relative;">
                    <i class="fas fa-envelope" style="position: absolute; left: 1rem; top: 1rem; color: var(--text-muted);"></i>
                    <input type="email" id="email" class="form-input" style="padding-left: 2.8rem;" placeholder="name@hospital.com" required>
                </div>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <div style="position: relative;">
                    <i class="fas fa-lock" style="position: absolute; left: 1rem; top: 1rem; color: var(--text-muted);"></i>
                    <input type="password" id="password" class="form-input" style="padding-left: 2.8rem;" placeholder="••••••••" required>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; cursor: pointer;">
                    <input type="checkbox"> Remember me
                </label>
                <a href="#" style="color: var(--primary-color); text-decoration: none; font-size: 0.85rem; font-weight: 600;">Forgot Password?</a>
            </div>

            <button type="submit" class="btn-primary" style="width: 100%; padding: 1rem;">
                Sign In Now
            </button>
        </form>

        <div style="margin-top: 2rem; text-align: center; font-size: 0.9rem; color: var(--text-muted);">
            Don't have an account? <a href="#" style="color: var(--primary-color); text-decoration: none; font-weight: 600;">Contact Administrator</a>
        </div>
    </div>
</div>
@endsection
