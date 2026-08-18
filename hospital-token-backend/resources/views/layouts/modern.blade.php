<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Hospital Token System')</title>
    <link rel="stylesheet" href="{{ asset('css/modern-hospital.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    @stack('styles')
</head>
<body>
    <nav class="glass-card" style="margin: 1rem; padding: 1rem 2rem; border-radius: 50px; position: sticky; top: 1rem; z-index: 1000; display: flex; justify-content: space-between; align-items: center;">
        <div class="logo">
            <h1 style="color: var(--primary-color); margin: 0; font-size: 1.5rem;">GMCCH <span style="font-weight: 300; color: var(--text-main);">Hospital</span></h1>
        </div>
        <ul style="display: flex; list-style: none; gap: 2rem;">
            <li><a href="#" style="text-decoration: none; color: var(--text-main); font-weight: 600;">Dashboard</a></li>
            <li><a href="#" style="text-decoration: none; color: var(--text-main); font-weight: 600;">Bookings</a></li>
            <li><a href="#" style="text-decoration: none; color: var(--text-main); font-weight: 600;">Queue</a></li>
        </ul>
        <div class="user-actions">
            <button class="btn-primary" style="padding: 0.5rem 1.5rem;">Sign Out</button>
        </div>
    </nav>

    <main class="container" style="padding-top: 2rem; padding-bottom: 4rem;">
        @yield('content')
    </main>

    <footer style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.9rem;">
        <p>&copy; {{ date('Y') }} GMCC Hospital. Designed for Excellence.</p>
    </footer>

    @stack('scripts')
</body>
</html>
