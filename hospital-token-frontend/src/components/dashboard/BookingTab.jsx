import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../lib/axios';
import { CheckCircle, XCircle, Settings, AlertCircle, RefreshCw } from 'lucide-react';
import Spinner, { LoadingButton } from '../Spinner';
import SearchableSelect from '../SearchableSelect';

const BookingTab = ({ onBookingChanged, refreshKey = 0 }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [autoApproveHours, setAutoApproveHours] = useState(0);
    const [currentAutoApprove, setCurrentAutoApprove] = useState(null);
    const [savingSettings, setSavingSettings] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [units, setUnits] = useState([]);
    
    // Offline Booking State
    const [offlineForm, setOfflineForm] = useState({ user_id: '', unit_id: '', type: 'chemo' });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [availability, setAvailability] = useState(null);

    // Auto-refresh state
    const AUTO_REFRESH_SECONDS = 5 * 60; // 5 minutes
    const [isRefreshing, setIsRefreshing] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchData();
        startAutoRefresh();
        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

    // Re-fetch when the navbar Refresh button is clicked (refreshKey increments)
    useEffect(() => {
        if (refreshKey > 0) fetchData();
    }, [refreshKey]);

    const startAutoRefresh = useCallback(() => {
        clearInterval(intervalRef.current);
        // Silently auto-refresh bookings list every 5 minutes
        intervalRef.current = setInterval(async () => {
            await refreshBookingsOnly();
        }, AUTO_REFRESH_SECONDS * 1000);
    }, []);

    // Light refresh: only re-fetches the bookings list (no full page reload)
    const refreshBookingsOnly = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const bRes = await api.get('/hospital/bookings');
            if (bRes.data.success) {
                setBookings(bRes.data.data.data || bRes.data.data);
            }
        } catch (err) {
            console.error('Auto-refresh failed', err);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // Manual refresh: re-fetches bookings AND resets the 5-min countdown
    const handleManualRefresh = useCallback(async () => {
        await refreshBookingsOnly();
        startAutoRefresh();
    }, [refreshBookingsOnly, startAutoRefresh]);


    const fetchData = async () => {
        setLoading(true);
        try {
            const [bRes, sRes, usersRes, unitsRes] = await Promise.all([
                api.get('/hospital/bookings'),
                api.get('/hospital/bookings/settings'),
                api.get('/hospital/users'),
                api.get('/units')
            ]);
            
            if (bRes.data.success) {
                setBookings(bRes.data.data.data || bRes.data.data); // Handle pagination structure
            }
            if (sRes.data.success) {
                setCurrentAutoApprove(sRes.data.data.auto_approve_bookings_until);
            }
            if (usersRes.data.success) {
                setUsers(usersRes.data.data || []);
            }
            if (unitsRes.data.success) {
                setUnits(unitsRes.data.data || []);
            }
        } catch (err) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
            setSettingsLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/hospital/bookings/${id}/status`, { status });
            // Update local state
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
            if (onBookingChanged) onBookingChanged();
        } catch (err) {
            alert('Failed to update status.');
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            const res = await api.put('/hospital/bookings/auto-approve', { hours: Number(autoApproveHours) });
            if (res.data.success) {
                setCurrentAutoApprove(res.data.data.auto_approve_bookings_until);
                alert('Auto-approve settings updated.');
            }
        } catch (err) {
            alert('Failed to update settings.');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleCheckAvailability = async () => {
        if (!offlineForm.unit_id) return;
        try {
            const res = await api.get(`/hospital/bookings/availability?unit_id=${offlineForm.unit_id}`);
            if (res.data.success) {
                setAvailability(res.data.data);
            }
        } catch (err) {
            console.error('Failed to check availability', err);
        }
    };

    useEffect(() => {
        handleCheckAvailability();
    }, [offlineForm.unit_id]);

    const handleOfflineBooking = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        try {
            const res = await api.post('/hospital/bookings/offline', offlineForm);
            if (res.data.success) {
                alert(res.data.message);
                setOfflineForm({ user_id: '', unit_id: '', type: 'chemo' });
                fetchData();
                handleCheckAvailability();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Offline booking failed.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Spinner /></div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Booking Management</h2>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} />
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Auto Approve Settings Box */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Settings size={20} color="#64748b" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Auto-Approval Settings</h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                            Automatically approve new bookings from the app for the specified duration.
                        </p>
                        {currentAutoApprove ? (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                                Currently active until: {new Date(currentAutoApprove).toLocaleString()}
                            </p>
                        ) : (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                Auto-approve is currently <strong style={{color:'#ef4444'}}>OFF</strong>.
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select 
                            className="input-field" 
                            style={{ width: 'auto' }}
                            value={autoApproveHours}
                            onChange={(e) => setAutoApproveHours(e.target.value)}
                        >
                            <option value="0">Turn OFF Auto-Approve</option>
                            <option value="1">1 Hour</option>
                            <option value="6">6 Hours</option>
                            <option value="12">12 Hours</option>
                            <option value="24">24 Hours</option>
                            <option value="48">48 Hours</option>
                        </select>
                        <LoadingButton 
                            onClick={handleSaveSettings} 
                            loading={savingSettings} 
                            label="Apply Settings"
                            className="btn btn-primary" 
                            style={{ whiteSpace: 'nowrap', padding: '0.6rem 1rem', background: '#ff0088', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600 }}
                        />
                    </div>
                </div>
            </div>

            {/* Offline Token Booking Box */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Settings size={20} color="#ff0088" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Offline Token Booking (Walk-in)</h3>
                </div>
                <form onSubmit={handleOfflineBooking} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Select Patient</label>
                        <SearchableSelect
                            options={users.map(u => ({ value: u.id, label: `${u.name} (CR: ${u.crno})` }))}
                            value={offlineForm.user_id}
                            onChange={(val) => setOfflineForm({ ...offlineForm, user_id: val })}
                            placeholder="Search patient by name or CR..."
                            required
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Select Unit</label>
                        <SearchableSelect
                            options={units.map(u => ({ value: u.id, label: `${u.name} (Dr. ${u.doctorName})` }))}
                            value={offlineForm.unit_id}
                            onChange={(val) => setOfflineForm({ ...offlineForm, unit_id: val })}
                            placeholder="Search unit or doctor..."
                            required
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Token Type</label>
                        <select className="input-field" value={offlineForm.type} onChange={(e) => setOfflineForm({ ...offlineForm, type: e.target.value })} required>
                            <option value="chemo">Chemo</option>
                            <option value="followup">Followup</option>
                        </select>
                    </div>
                    <LoadingButton 
                        loading={bookingLoading} 
                        label="Book Offline Token"
                        className="btn btn-primary" 
                        style={{ whiteSpace: 'nowrap', padding: '0.75rem 1.25rem', background: '#ff0088', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, height: '42px' }}
                    />
                </form>
                {availability && offlineForm.unit_id && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                        <strong>Availability for Today: </strong>
                        Chemo Offline Slots: <span style={{ color: availability.chemo.offline_remaining > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{availability.chemo.offline_remaining} left</span> | 
                        Followup Offline Slots: <span style={{ color: availability.followup.offline_remaining > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{availability.followup.offline_remaining} left</span>
                    </div>
                )}
            </div>

            {/* Bookings List */}
            <div className="glass-panel" style={{ background: 'white', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Patient / CRNO</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Unit & Doctor</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Date & Token</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                    No bookings found.
                                </td>
                            </tr>
                        ) : (
                            bookings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.user?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.user?.crno}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.unit?.name || '-'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.unit?.doctor?.name || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.booking_date}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#ff0088', fontWeight: 800 }}>Token: {b.token_number}</div>
                                        <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                            <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: b.source === 'offline' ? '#ffedd5' : '#e0f2fe', color: b.source === 'offline' ? '#c2410c' : '#0369a1', fontWeight: 700 }}>
                                                {b.source?.toUpperCase() || 'ONLINE'}
                                            </span>
                                            <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 700, marginLeft: '0.3rem' }}>
                                                {b.type?.toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            background: b.status === 'active' ? '#dcfce7' : b.status === 'pending' ? '#fef3c7' : b.status === 'completed' ? '#f1f5f9' : '#fee2e2',
                                            color: b.status === 'active' ? '#166534' : b.status === 'pending' ? '#92400e' : b.status === 'completed' ? '#475569' : '#991b1b'
                                        }}>
                                            {b.status === 'active' ? 'Approved' : b.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {b.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => handleUpdateStatus(b.id, 'active')}
                                                    style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                                    style={{ background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}
                                                >
                                                    <XCircle size={14} /> Cancel
                                                </button>
                                            </div>
                                        )}
                                        {b.status === 'active' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                                style={{ background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}
                                            >
                                                <XCircle size={14} /> Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingTab;
