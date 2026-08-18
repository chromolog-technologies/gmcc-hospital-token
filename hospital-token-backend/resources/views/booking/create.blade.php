@extends('layouts.app')

@section('title', 'Add Booking - GMCCH Hospital')

@section('content')
<div class="card">
    <div style="text-align: center; margin-bottom: 3rem;">
        <h2 class="font-abel" style="color: var(--primary); font-size: 2.5rem; margin: 0; text-transform: uppercase;">Add Booking</h2>
        <div style="width: 50px; height: 3px; background: var(--primary); margin: 1rem auto;"></div>
    </div>

    {{-- Success Message --}}
    @if(session('success'))
        <div class="alert alert-success">
            <i class="fas fa-check-circle mr-2"></i> {{ session('success') }}
        </div>
    @endif

    {{-- Error Messages --}}
    @if($errors->any())
        <div class="alert alert-error">
            <ul style="margin: 0; padding-left: 1.2rem;">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('bookings.store') }}" method="POST">
        @csrf

        {{-- CR Number --}}
        <div class="form-group">
            <label for="crno">CR Number</label>
            <input type="text" name="crno" id="crno" class="form-control" placeholder="Enter CR Number" value="{{ old('crno') }}" required>
        </div>

        {{-- Unit ID --}}
        <div class="form-group">
            <label for="unit_id">Unit</label>
            <select name="unit_id" id="unit_id" class="form-control" required>
                <option value="">Select Unit</option>
                @foreach($units as $unit)
                    <option value="{{ $unit->id }}" {{ old('unit_id') == $unit->id ? 'selected' : '' }}>
                        {{ $unit->name }} (Unit ID: {{ $unit->id }})
                    </option>
                @endforeach
            </select>
        </div>

        {{-- Booking Type --}}
        <div class="form-group">
            <label for="type">Booking Type</label>
            <select name="type" id="type" class="form-control" required>
                <option value="chemo" {{ old('type') == 'chemo' ? 'selected' : '' }}>Chemotherapy</option>
                <option value="normal" {{ old('type') == 'normal' ? 'selected' : '' }}>Follow up</option>
            </select>
        </div>

        <button type="submit" class="btn-primary font-abel">
            Submit Booking
        </button>
    </form>
</div>
@endsection
