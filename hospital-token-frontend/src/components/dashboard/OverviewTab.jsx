import React, { useState } from 'react';
import api from '../../lib/axios';
import { Users, Activity, CheckCircle } from 'lucide-react';

const OverviewTab = ({ hospital, summary, units }) => (
    <div>
        <header style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Welcome back, {hospital.name} 👋
            </h1>
            <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </header>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <KpiCard icon={<Users size={20} color="#ff0088" />} label="Total Bookings" value={summary.today.total} color="#fff5fa" />
            <KpiCard icon={<Activity size={20} color="#f59e0b" />} label="Active Queue"   value={summary.today.active}    color="#fffbeb" />
            <KpiCard icon={<CheckCircle size={20} color="#10b981" />} label="Completed"  value={summary.today.completed} color="#f0fdf4" />
        </div>

        {/* Unit Queue Cards */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '1.25rem' }}>Active Unit Queues</h3>
            {units.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No units configured yet.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {units.map(unit => (
                        <div key={unit.unit_id} style={{ border: '1px solid #f1f5f9', borderRadius: '14px', padding: '1.25rem', background: '#fafafa' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <h4 style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{unit.unit_name}</h4>
                                <span style={{ background: '#fff5fa', color: '#ff0088', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                                    {unit.today?.pending ?? 0} Waiting
                                </span>
                            </div>
                            <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                                Dr. <strong>{unit.doctor_name || 'Not Assigned'}</strong>
                            </p>
                            <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                📅 {unit.day || 'N/A'}
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                                <span>Chemo: <strong>{unit.today?.chemo ?? 0}</strong></span>
                                <span>Normal: <strong>{unit.today?.normal ?? 0}</strong></span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const KpiCard = ({ icon, label, value, color }) => (
    <div style={{ background: color, borderRadius: '16px', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            {icon}
        </div>
        <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value ?? '–'}</h2>
    </div>
);

export default OverviewTab;
