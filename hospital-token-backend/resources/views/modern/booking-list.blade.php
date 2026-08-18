@extends('layouts.modern')

@section('title', 'Manage Bookings - GMCC Hospital')

@section('content')
<div class="animate-fade-in">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;">
        <h2 class="font-abel" style="font-size: 2.5rem; color: var(--text-main);">Booking Management</h2>
        <div style="display: flex; gap: 1rem;">
            <div style="position: relative;">
                <i class="fas fa-search" style="position: absolute; left: 1rem; top: 0.8rem; color: var(--text-muted);"></i>
                <input type="text" class="form-input" style="padding-left: 2.5rem; width: 300px;" placeholder="Search patient or token...">
            </div>
            <button class="btn-primary">Filter</button>
        </div>
    </div>

    <div class="glass-card" style="padding: 0; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead style="background: rgba(255, 0, 136, 0.05);">
                <tr>
                    <th style="padding: 1.5rem; color: var(--primary-color); font-weight: 600;">Token #</th>
                    <th style="padding: 1.5rem; color: var(--primary-color); font-weight: 600;">Patient Name</th>
                    <th style="padding: 1.5rem; color: var(--primary-color); font-weight: 600;">Doctor / Unit</th>
                    <th style="padding: 1.5rem; color: var(--primary-color); font-weight: 600;">Time</th>
                    <th style="padding: 1.5rem; color: var(--primary-color); font-weight: 600;">Status</th>
                    <th style="padding: 1.5rem; color: var(--primary-color); font-weight: 600;">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.3s ease;">
                    <td style="padding: 1.5rem; font-weight: 600;">#T-2041</td>
                    <td style="padding: 1.5rem;">Rahul Sharma</td>
                    <td style="padding: 1.5rem;">Dr. Sarah Smith<br><span style="font-size: 0.8rem; color: var(--text-muted);">Cardiology</span></td>
                    <td style="padding: 1.5rem;">10:30 AM</td>
                    <td style="padding: 1.5rem;"><span style="padding: 0.4rem 1rem; border-radius: 20px; background: #e1f5fe; color: #0288d1; font-size: 0.8rem; font-weight: 600;">Waiting</span></td>
                    <td style="padding: 1.5rem;">
                        <button style="border: none; background: none; color: var(--primary-color); cursor: pointer; margin-right: 1rem;"><i class="fas fa-check-circle"></i></button>
                        <button style="border: none; background: none; color: #e74c3c; cursor: pointer;"><i class="fas fa-times-circle"></i></button>
                    </td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.3s ease;">
                    <td style="padding: 1.5rem; font-weight: 600;">#T-2040</td>
                    <td style="padding: 1.5rem;">Priya Patel</td>
                    <td style="padding: 1.5rem;">Dr. Elena Vaz<br><span style="font-size: 0.8rem; color: var(--text-muted);">Pediatrics</span></td>
                    <td style="padding: 1.5rem;">10:15 AM</td>
                    <td style="padding: 1.5rem;"><span style="padding: 0.4rem 1rem; border-radius: 20px; background: #e8f5e9; color: #2e7d32; font-size: 0.8rem; font-weight: 600;">Active</span></td>
                    <td style="padding: 1.5rem;">
                        <button style="border: none; background: none; color: var(--primary-color); cursor: pointer; margin-right: 1rem;"><i class="fas fa-check-circle"></i></button>
                        <button style="border: none; background: none; color: #e74c3c; cursor: pointer;"><i class="fas fa-times-circle"></i></button>
                    </td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.3s ease;">
                    <td style="padding: 1.5rem; font-weight: 600;">#T-2039</td>
                    <td style="padding: 1.5rem;">Arun Kumar</td>
                    <td style="padding: 1.5rem;">Dr. Rajesh Kumar<br><span style="font-size: 0.8rem; color: var(--text-muted);">Oncology</span></td>
                    <td style="padding: 1.5rem;">09:50 AM</td>
                    <td style="padding: 1.5rem;"><span style="padding: 0.4rem 1rem; border-radius: 20px; background: #f5f5f5; color: #616161; font-size: 0.8rem; font-weight: 600;">Completed</span></td>
                    <td style="padding: 1.5rem;">
                        <button style="border: none; background: none; color: var(--text-muted); cursor: not-allowed; margin-right: 1rem;"><i class="fas fa-check-circle"></i></button>
                        <button style="border: none; background: none; color: var(--text-muted); cursor: not-allowed;"><i class="fas fa-times-circle"></i></button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center;">
        <p style="color: var(--text-muted); font-size: 0.9rem;">Showing 3 of 42 bookings</p>
        <div style="display: flex; gap: 0.5rem;">
            <button class="btn-primary" style="padding: 0.5rem 1rem; background: #fff; color: var(--text-main); border: 1px solid #ddd;">Previous</button>
            <button class="btn-primary" style="padding: 0.5rem 1rem;">Next</button>
        </div>
    </div>
</div>

<style>
    tbody tr:hover {
        background: rgba(255, 0, 136, 0.02);
    }
</style>
@endsection
