@extends('layouts.modern')

@section('title', 'New Booking - GMCC Hospital')

@section('content')
<div class="animate-fade-in" style="max-width: 800px; margin: 0 auto;">
    <div style="margin-bottom: 2.5rem; text-align: center;">
        <h2 class="font-abel" style="font-size: 2.5rem; color: var(--text-main);">Appointment Booking</h2>
        <p style="color: var(--text-muted);">Fill in the details below to generate a new token.</p>
    </div>

    <div class="glass-card">
        <form action="#" method="POST">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div class="form-group">
                    <label for="patient_name">Patient Full Name</label>
                    <input type="text" id="patient_name" class="form-input" placeholder="e.g. John Doe" required>
                </div>

                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" class="form-input" placeholder="e.g. +91 98765 43210" required>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div class="form-group">
                    <label for="unit">Medical Unit / Department</label>
                    <select id="unit" class="form-input" required>
                        <option value="">Select Unit</option>
                        <option value="cardiology">Cardiology</option>
                        <option value="pediatrics">Pediatrics</option>
                        <option value="oncology">Oncology (Chemo)</option>
                        <option value="general">General Medicine</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="doctor">Preferred Doctor</label>
                    <select id="doctor" class="form-input" required>
                        <option value="">Select Doctor</option>
                        <option value="dr_smith">Dr. Sarah Smith</option>
                        <option value="dr_kumar">Dr. Rajesh Kumar</option>
                        <option value="dr_vaz">Dr. Elena Vaz</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="appointment_type">Appointment Type</label>
                <div style="display: flex; gap: 2rem; margin-top: 0.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" name="type" value="normal" checked> Normal Checkup
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" name="type" value="emergency"> Emergency / Urgent
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="radio" name="type" value="followup"> Follow-up
                    </label>
                </div>
            </div>

            <div class="form-group">
                <label for="notes">Additional Notes (Optional)</label>
                <textarea id="notes" class="form-input" rows="4" placeholder="Any specific symptoms or history..."></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
                <button type="button" class="btn-primary" style="background: var(--text-muted); border-radius: 50px;">Cancel</button>
                <button type="submit" class="btn-primary">Generate Token</button>
            </div>
        </form>
    </div>
</div>
@endsection
