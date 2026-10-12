import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../lib/axios';
import { CheckCircle, XCircle, Settings, AlertCircle, RefreshCw, Download } from 'lucide-react';
import Spinner, { LoadingButton } from '../Spinner';
import SearchableSelect from '../SearchableSelect';
import * as XLSX from 'xlsx';

const BookingTab = ({ onBookingChanged, refreshKey = 0 }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [autoApproveHours, setAutoApproveHours] = useState(0);
    const [currentAutoApprove, setCurrentAutoApprove] = useState(null);
    const [savingSettings, setSavingSettings] = useState(false);

    // Format date as dd-MM-yyyy — parse directly to avoid UTC→local timezone shift
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}-${month}-${year}`;
    };

    // Format full timestamp as dd-MM-yyyy HH:mm:ss
    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
        } catch {
            return dateString;
        }
    };
    const [error, setError] = useState('');
    const [units, setUnits] = useState([]);
    
    // Offline Booking State & On-Demand Patient Search
    const [offlineForm, setOfflineForm] = useState({ user_id: '', unit_id: '', type: 'chemo', source: 'offline-walkin' });
    const [patientOptions, setPatientOptions] = useState([]);
    const [patientSearching, setPatientSearching] = useState(false);
    const searchTimeoutRef = useRef(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [availability, setAvailability] = useState(null);

    // On-demand debounced patient search (scales to 50k+ users without slowing down page load)
    const handlePatientSearch = useCallback((query) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if (!query || query.trim().length === 0) {
            return;
        }
        searchTimeoutRef.current = setTimeout(async () => {
            setPatientSearching(true);
            try {
                const res = await api.get('/hospital/users', { params: { search: query } });
                if (res.data.success) {
                    setPatientOptions((res.data.data || []).map(u => ({
                        value: u.id,
                        label: `${u.name} (CR: ${u.crno})`
                    })));
                }
            } catch (err) {
                console.error('Patient search error', err);
            } finally {
                setPatientSearching(false);
            }
        }, 300);
    }, []);

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
            const [bRes, sRes, unitsRes] = await Promise.all([
                api.get('/hospital/bookings'),
                api.get('/hospital/bookings/settings'),
                api.get('/units')
            ]);
            
            if (bRes.data.success) {
                setBookings(bRes.data.data.data || bRes.data.data); // Handle pagination structure
            }
            if (sRes.data.success) {
                setCurrentAutoApprove(sRes.data.data.auto_approve_bookings_until);
            }
            if (unitsRes.data.success) {
                setUnits(unitsRes.data.data || []);
            }

            // Prime the offline patient dropdown with recent 20 patients without blocking
            api.get('/hospital/users', { params: { limit: 20 } }).then(res => {
                if (res.data.success) {
                    setPatientOptions((res.data.data || []).map(u => ({
                        value: u.id,
                        label: `${u.name} (CR: ${u.crno})`
                    })));
                }
            }).catch(() => {});
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

    const isAutoApproveOn = Boolean(
        currentAutoApprove && new Date(currentAutoApprove) > new Date()
    );

    const handleToggleAutoApprove = async () => {
        setSavingSettings(true);
        try {
            const nextHours = isAutoApproveOn ? 0 : 8760;
            const res = await api.put('/hospital/bookings/auto-approve', { hours: nextHours });
            if (res.data.success) {
                setCurrentAutoApprove(res.data.data.auto_approve_bookings_until);
            }
        } catch (err) {
            alert('Failed to update auto-approve setting.');
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
                setOfflineForm({ user_id: '', unit_id: '', type: 'chemo', source: 'offline-walkin' });
                fetchData();
                handleCheckAvailability();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Offline booking failed.');
        } finally {
            setBookingLoading(false);
        }
    };

    // ── Export bookings to Excel ───────────────────────────────────────────
    const exportToExcel = () => {
        const rows = bookings.map(b => ({
            'ID':             b.id,
            'User ID':        b.user_id,
            'Patient Name':   b.user?.name || '',
            'CR No':          b.user?.crno || '',
            'Unit ID':        b.unit_id,
            'Unit Name':      b.unit?.name || '',
            'Type':           b.type || '',
            'Token Number':   b.token_number ?? '',
            'Booking Date':   b.booking_date ? formatDate(b.booking_date) : '',
            'Slot Time':      b.slot_time ?? '',
            'Status':         b.status === 'active' ? 'Approved' : (b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : ''),
            'Source':         b.source || '',
            'Created At':     formatDateTime(b.created_at),
            'Updated At':     formatDateTime(b.updated_at),
        }));

        const worksheet  = XLSX.utils.json_to_sheet(rows);
        const workbook   = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

        // Auto-fit column widths
        const colWidths = [
            { wch: 8 },  // ID
            { wch: 10 }, // User ID
            { wch: 25 }, // Patient Name
            { wch: 14 }, // CR No
            { wch: 10 }, // Unit ID
            { wch: 22 }, // Unit Name
            { wch: 12 }, // Type
            { wch: 14 }, // Token Number
            { wch: 14 }, // Booking Date
            { wch: 12 }, // Slot Time
            { wch: 12 }, // Status
            { wch: 14 }, // Source
            { wch: 22 }, // Created At
            { wch: 22 }, // Updated At
        ];
        worksheet['!cols'] = colWidths;

        const today = formatDate(new Date().toISOString());
        XLSX.writeFile(workbook, `GMCC_Bookings_${today}.xlsx`);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Spinner /></div>;

    return (
        <div style={{ width: '100%', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Booking Management</h2>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} />
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Auto Approve Settings Box - Compact ON/OFF Toggle */}
            <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Settings size={18} color="#64748b" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        Auto-Approve Bookings:
                    </span>
                    <span style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: isAutoApproveOn ? '#dcfce7' : '#fee2e2',
                        color: isAutoApproveOn ? '#166534' : '#991b1b'
                    }}>
                        {isAutoApproveOn ? 'ON' : 'OFF'}
                    </span>
                </div>

                <button
                    onClick={handleToggleAutoApprove}
                    disabled={savingSettings}
                    style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: savingSettings ? 'not-allowed' : 'pointer',
                        background: isAutoApproveOn ? '#ef4444' : '#10b981',
                        color: '#ffffff',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: isAutoApproveOn ? '0 2px 8px rgba(239, 68, 68, 0.25)' : '0 2px 8px rgba(16, 185, 129, 0.25)'
                    }}
                >
                    {savingSettings ? 'Updating...' : (isAutoApproveOn ? 'Turn OFF' : 'Turn ON')}
                </button>
            </div>

            {/* Offline Token Booking Box */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'white', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Settings size={20} color="#ff0088" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Offline Token Booking</h3>
                </div>
                <form onSubmit={handleOfflineBooking} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Select Patient</label>
                        <SearchableSelect
                            options={patientOptions}
                            value={offlineForm.user_id}
                            onChange={(val) => setOfflineForm({ ...offlineForm, user_id: val })}
                            onSearch={handlePatientSearch}
                            loading={patientSearching}
                            placeholder="Type patient name or CR number..."
                            required
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Select Unit</label>
                        <SearchableSelect
                            options={units.map(u => ({ value: u.id, label: `${u.name} (${u.doctorName})` }))}
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
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SOURCE</label>
                        <select className="input-field" value={offlineForm.source} onChange={(e) => setOfflineForm({ ...offlineForm, source: e.target.value })} required>
                            <option value="offline-walkin">Walk-in</option>
                            <option value="offline-staff">Staff</option>
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
                {/* Export toolbar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <button
                        onClick={exportToExcel}
                        disabled={bookings.length === 0}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.45rem 1rem',
                            background: bookings.length === 0 ? '#e2e8f0' : '#16a34a',
                            color: bookings.length === 0 ? '#94a3b8' : '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: bookings.length === 0 ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                        }}
                    >
                        <Download size={15} />
                        Export to Excel
                    </button>
                </div>
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>ID</th>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>User ID / Patient</th>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Unit ID</th>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Type</th>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'center' }}>Token #</th>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Booking Date</th>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Slot Time</th>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Source</th>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Created At</th>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Updated At</th>
                                <th style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                    <tbody>
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="12" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                    No bookings found.
                                </td>
                            </tr>
                        ) : (
                            bookings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    {/* 1. id */}
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155' }}>
                                        #{b.id}
                                    </td>

                                    {/* 2. user_id & Patient */}
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                                                #{b.user_id}
                                            </span>
                                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{b.user?.name || 'Unknown'}</span>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                                            CR: {b.user?.crno || '—'}
                                        </div>
                                    </td>

                                    {/* 3. unit_id & Unit */}
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                                                #{b.unit_id}
                                            </span>
                                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{b.unit?.name || '—'}</span>
                                        </div>
                                    </td>

                                    {/* 4. type */}
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            background: b.type === 'chemo' ? '#fdf2f8' : '#f0fdf4',
                                            color: b.type === 'chemo' ? '#be185d' : '#15803d',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase'
                                        }}>
                                            {b.type || '—'}
                                        </span>
                                    </td>

                                    {/* 5. token_number */}
                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '6px',
                                            background: '#fff1f2',
                                            color: '#e11d48',
                                            fontWeight: 800,
                                            fontSize: '0.95rem'
                                        }}>
                                            {b.token_number ?? '—'}
                                        </span>
                                    </td>

                                    {/* 6. booking_date */}
                                    <td style={{ padding: '0.85rem 1rem', color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                        {formatDate(b.booking_date)}
                                    </td>

                                    {/* 7. slot_time */}
                                    <td style={{ padding: '0.85rem 1rem', color: b.slot_time ? '#0f172a' : '#94a3b8', fontSize: '0.82rem' }}>
                                        {b.slot_time || 'NULL'}
                                    </td>

                                    {/* 8. status */}
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <span style={{
                                            padding: '0.3rem 0.65rem',
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

                                    {/* 9. source */}
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            background: b.source?.includes('offline') ? '#ffedd5' : '#e0f2fe',
                                            color: b.source?.includes('offline') ? '#c2410c' : '#0369a1',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase'
                                        }}>
                                            {b.source?.includes('offline') ? (b.source === 'offline-staff' ? 'STAFF' : 'WALK-IN') : (b.source || 'ONLINE')}
                                        </span>
                                    </td>

                                    {/* 10. created_at */}
                                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                        {formatDateTime(b.created_at)}
                                    </td>

                                    {/* 11. updated_at */}
                                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                        {formatDateTime(b.updated_at)}
                                    </td>

                                    {/* 12. Actions */}
                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {b.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => handleUpdateStatus(b.id, 'active')}
                                                    style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600 }}
                                                >
                                                    <CheckCircle size={13} /> Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                                    style={{ background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600 }}
                                                >
                                                    <XCircle size={13} /> Cancel
                                                </button>
                                            </div>
                                        )}
                                        {b.status === 'active' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                                style={{ background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600 }}
                                            >
                                                <XCircle size={13} /> Cancel
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
        </div>
    );
};

export default BookingTab;
