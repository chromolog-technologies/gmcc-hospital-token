<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Display - {{ $unit->name }}</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Abel&family=Inter:wght@400;900&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary: #ff0088;
            --bg: #000000;
            --text: #ffffff;
            --muted: #666666;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .header {
            padding: 2rem;
            background: #111;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--primary);
        }

        .header h1 {
            font-family: 'Abel', sans-serif;
            font-size: 2.5rem;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 5px;
        }

        .header .doctor-name {
            font-size: 1.5rem;
            font-weight: 400;
            opacity: 0.8;
        }

        .main-container {
            flex: 1;
            display: grid;
            grid-template-columns: 3fr 1fr;
        }

        /* Now Serving Section */
        .serving-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-right: 2px solid #222;
            padding: 2rem;
        }

        .serving-section h2 {
            font-size: 4rem;
            font-weight: 900;
            color: var(--text);
            text-transform: uppercase;
            letter-spacing: 10px;
            margin-bottom: 2rem;
        }

        .token-display {
            font-size: 25rem;
            font-weight: 900;
            color: var(--primary);
            line-height: 1;
            text-shadow: 0 0 50px rgba(255, 0, 136, 0.3);
            animation: blink 1s infinite alternate;
        }

        @keyframes blink {
            0% { opacity: 1; }
            100% { opacity: 0.85; transform: scale(1.02); }
        }

        /* Queue List Section */
        .queue-section {
            background: #080808;
            padding: 2rem;
            display: flex;
            flex-direction: column;
        }

        .queue-section h3 {
            font-size: 2rem;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 2rem;
            text-align: center;
        }

        .queue-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .queue-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            background: #111;
            border-radius: 10px;
            border-left: 5px solid var(--primary);
        }

        .queue-item .token {
            font-size: 3.5rem;
            font-weight: 900;
            color: var(--primary);
        }

        .queue-item .time {
            font-size: 1.5rem;
            color: var(--muted);
            font-weight: 600;
        }

        .footer {
            background: var(--primary);
            color: white;
            padding: 1rem;
            text-align: center;
            font-size: 1.5rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .empty-queue {
            font-size: 3rem;
            color: var(--muted);
            font-style: italic;
        }
    </style>

    <!-- Auto Refresh -->
    <meta http-equiv="refresh" content="8">
</head>
<body>

    <header class="header">
        <div>
            <h1>{{ strtoupper($unit->name) }}</h1>
        </div>
        <div class="doctor-name">
            DR. {{ strtoupper($unit->doctor->name ?? 'ON DUTY') }}
        </div>
    </header>

    <div class="main-container">
        <!-- Main Display -->
        <section class="serving-section">
            <h2>Now Serving</h2>
            @if($currentToken)
                <div class="token-display">
                    {{ $currentToken->token_number }}
                </div>
            @else
                <div class="empty-queue">
                    Waiting for Next Token...
                </div>
            @endif
        </section>

        <!-- Sidebar Queue -->
        <section class="queue-section">
            <h3>Upcoming</h3>
            <ul class="queue-list">
                @forelse($upcoming as $item)
                    <li class="queue-item">
                        <span class="token">#{{ $item->token_number }}</span>
                        <span class="time">{{ $item->slot_time ?? '--:--' }}</span>
                    </li>
                @empty
                    <li style="text-align: center; color: var(--muted); padding-top: 5rem;">
                        Queue Empty
                    </li>
                @endforelse
            </ul>
        </section>
    </div>

    <footer class="footer">
        Please wait for your turn. Maintain silence in the hospital premises.
    </footer>

    <script>
        // Optional: Play sound when token changes (local storage check)
        const currentToken = "{{ $currentToken->token_number ?? '' }}";
        const lastToken = localStorage.getItem('last_token');
        
        if (currentToken && currentToken !== lastToken) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log("Audio play blocked by browser"));
            localStorage.setItem('last_token', currentToken);
        }
    </script>
</body>
</html>
