@extends('layouts.app')

@section('title', 'Booking List - GMCCH Hospital')

@section('content')
<div style="width: 100%;">
    <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
            <h2 class="font-abel" style="font-size: 2.2rem; color: var(--primary); margin: 0; text-transform: uppercase;">Manage Bookings</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">Viewing tokens for <strong>{{ $date }}</strong></p>
        </div>
        <a href="{{ route('bookings.create') }}" class="btn-primary" style="width: auto; padding: 0.8rem 2rem;">
            <i class="fas fa-plus-circle mr-2"></i> Add Booking
        </a>
    </div>

    {{-- Filters --}}
    <form action="{{ route('bookings.index') }}" method="GET" class="filter-section reveal">
        <div class="filter-group">
            <label>Select Date</label>
            <input type="date" name="date" class="form-control" value="{{ $date }}" style="padding: 0.6rem 1rem;">
        </div>

        <div class="filter-group">
            <label>Filter by Unit</label>
            <select name="unit_id" class="form-control" style="padding: 0.6rem 1rem;">
                <option value="">All Units</option>
                @foreach($units as $unit)
                    <option value="{{ $unit->id }}" {{ request('unit_id') == $unit->id ? 'selected' : '' }}>
                        {{ $unit->name }}
                    </option>
                @endforeach
            </select>
        </div>

        <div class="filter-group">
            <label>Booking Type</label>
            <select name="type" class="form-control" style="padding: 0.6rem 1rem;">
                <option value="">All Types</option>
                <option value="chemo" {{ request('type') == 'chemo' ? 'selected' : '' }}>Chemotherapy</option>
                <option value="normal" {{ request('type') == 'normal' ? 'selected' : '' }}>Follow up</option>
            </select>
        </div>

        <button type="submit" class="btn-primary" style="width: auto; padding: 0.7rem 2rem; margin-top: 0;">
            <i class="fas fa-filter mr-1"></i> Apply
        </button>
        
        <a href="{{ route('bookings.index') }}" style="color: var(--text-muted); font-size: 0.8rem; text-decoration: none; padding-bottom: 0.8rem;">Reset</a>
    </form>

    {{-- Alert Messages --}}
    @if(session('success'))
        <div class="alert alert-success animate-fade-in">
            <i class="fas fa-check-circle mr-2"></i> {{ session('success') }}
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-error animate-fade-in">
            <i class="fas fa-exclamation-triangle mr-2"></i> {{ $errors->first() }}
        </div>
    @endif

    {{-- Table --}}
    <div class="table-card reveal" style="animation-delay: 0.2s;">
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 100px;">Token</th>
                        <th>Patient Name</th>
                        <th>Unit</th>
                        <th>Type</th>
                        <th>Slot Time</th>
                        <th>Status</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($bookings as $booking)
                        <tr>
                            <td>
                                <strong style="color: var(--primary); font-size: 1.1rem;">#{{ $booking->token_number }}</strong>
                            </td>
                            <td>
                                <div style="font-weight: 600;">{{ $booking->user->name }}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">CR: {{ $booking->user->crno }}</div>
                            </td>
                            <td>{{ $booking->unit->name }}</td>
                            <td>
                                @if($booking->type == 'chemo')
                                    <span style="color: #8b5cf6;"><i class="fas fa-pills mr-1"></i> Chemo</span>
                                @else
                                    <span style="color: #0ea5e9;"><i class="fas fa-user-md mr-1"></i> Follow up</span>
                                @endif
                            </td>
                            <td>{{ $booking->slot_time ?? 'N/A' }}</td>
                            <td>
                                <span class="badge badge-{{ $booking->status }}">
                                    {{ $booking->status }}
                                </span>
                            </td>
                            <td style="text-align: right;">
                                @if($booking->status == 'active')
                                    <form action="{{ route('bookings.cancel', $booking->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to cancel this booking?')">
                                        @csrf
                                        @method('POST')
                                        <button type="submit" class="btn-cancel">
                                            Cancel
                                        </button>
                                    </form>
                                @else
                                    <span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">No actions</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 4rem; color: var(--text-muted);">
                                <i class="fas fa-calendar-times" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem; display: block;"></i>
                                No bookings found for this selection.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
