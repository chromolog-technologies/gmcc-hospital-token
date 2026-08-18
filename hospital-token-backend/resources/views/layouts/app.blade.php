<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Hospital Token System')</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Abel&family=Inter:wght@400;600&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        :root {
            --primary: #ff0088;
            --primary-hover: #e6007a;
            --bg-light: #fdfbfb;
            --bg-dark: #ebedee;
            --text-main: #2d3436;
            --text-muted: #636e72;
            --shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
            --radius: 20px;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, var(--bg-light) 0%, var(--bg-dark) 100%);
            color: var(--text-main);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .font-abel {
            font-family: 'Abel', sans-serif;
            letter-spacing: 2px;
        }

        .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: 3rem;
            width: 100%;
            max-width: 500px;
            animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .btn-primary {
            background: var(--primary);
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-size: 1rem;
            margin-top: 1rem;
        }

        .btn-primary:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(255, 0, 136, 0.2);
        }

        .form-group {
            margin-bottom: 2rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.8rem;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 1px;
        }

        .form-control {
            width: 100%;
            padding: 1rem 1.2rem;
            border: 2px solid #f0f0f0;
            border-radius: 12px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
            box-sizing: border-box;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary);
        }

        .alert {
            padding: 1rem 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }

        .alert-success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }

        .alert-error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }

        .navbar {
            background: white;
            padding: 1rem 0;
            box-shadow: 0 2px 15px rgba(0,0,0,0.05);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .nav-logo {
            color: var(--primary);
            margin: 0;
            font-size: 1.5rem;
        }

        .btn-logout {
            background: #f8f9fa;
            color: #dc3545;
            border: 1px solid #dee2e6;
            padding: 0.5rem 1.2rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-logout:hover {
            background: #dc3545;
            color: white;
            border-color: #dc3545;
        }

        /* Dashboard Grid */
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
            width: 100%;
        }

        .stat-card {
            background: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: var(--shadow);
            text-align: center;
            transition: all 0.3s ease;
            border: 1px solid rgba(0,0,0,0.03);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .stat-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(255, 0, 136, 0.1);
            border-color: rgba(255, 0, 136, 0.2);
        }

        .stat-card i {
            font-size: 2rem;
            color: var(--primary);
            margin-bottom: 1rem;
            opacity: 0.8;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 0.5rem;
        }

        .stat-label {
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 1.5px;
        }

        /* Action Grid */
        .action-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            width: 100%;
            margin-top: 2rem;
        }

        .btn-action {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem;
            background: white;
            border-radius: 20px;
            text-decoration: none;
            color: var(--text-main);
            font-weight: 600;
            transition: all 0.3s ease;
            border: 1px solid #f0f0f0;
        }

        .btn-action:hover {
            background: var(--primary);
            color: white;
            transform: scale(1.05);
        }

        .btn-action i {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        /* Table Styling */
        .table-card {
            background: white;
            border-radius: 20px;
            box-shadow: var(--shadow);
            overflow: hidden;
            margin-top: 2rem;
            width: 100%;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
        }

        .table th {
            background: #f8f9fa;
            padding: 1.2rem 1rem;
            text-align: left;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-muted);
            border-bottom: 1px solid #eee;
        }

        .table td {
            padding: 1.2rem 1rem;
            border-bottom: 1px solid #f8f8f8;
            font-size: 0.95rem;
        }

        .table tr:hover {
            background: #fff9fc;
        }

        /* Status Badges */
        .badge {
            padding: 0.4rem 1rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
        }

        .badge-active { background: #e0f2fe; color: #0369a1; }
        .badge-completed { background: #dcfce7; color: #15803d; }
        .badge-cancelled { background: #fee2e2; color: #b91c1c; }

        /* Filter Section */
        .filter-section {
            background: white;
            padding: 1.5rem;
            border-radius: 20px;
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            align-items: flex-end;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .filter-group label {
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
        }

        .btn-cancel {
            background: transparent;
            color: #dc3545;
            border: 1px solid #dc3545;
            padding: 0.4rem 1rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-cancel:hover {
            background: #dc3545;
            color: white;
        }

        @media (max-width: 1024px) {
            .table-responsive {
                overflow-x: auto;
            }
        }
    </style>
    @stack('styles')
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <h1 class="font-abel nav-logo">GMCCH <span style="color: var(--text-main); font-weight: 300;">HOSPITAL</span></h1>
            <div class="nav-actions">
                <form action="{{ route('logout') }}" method="POST" style="display: inline;">
                    @csrf
                    <button type="submit" class="btn-logout">
                        <i class="fas fa-sign-out-alt"></i> Sign Out
                    </button>
                </form>
            </div>
        </div>
    </nav>

    <main class="container">
        @yield('content')
    </main>

    <footer>
        <p>&copy; {{ date('Y') }} MC Chest Hospital. All rights reserved.</p>
    </footer>

    @stack('scripts')
</body>
</html>
