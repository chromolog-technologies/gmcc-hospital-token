import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../lib/axios';
import { RefreshCw, Search, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// Human-readable labels for logged actions
const ACTION_LABELS = {
    login:                 { label: 'Login',            bg: '#dcfce7', color: '#166534' },
    login_failed:          { label: 'Login Failed',     bg: '#fee2e2', color: '#991b1b' },
    logout:                { label: 'Logout',           bg: '#f1f5f9', color: '#475569' },
    booking_created:       { label: 'Token Booked',     bg: '#e0f2fe', color: '#0369a1' },
    booking_approved:      { label: 'Approved',         bg: '#dcfce7', color: '#166534' },
    booking_auto_approved: { label: 'Auto Approved',    bg: '#ecfdf5', color: '#047857' },
    booking_cancelled:     { label: 'Cancelled',        bg: '#fee2e2', color: '#991b1b' },
    booking_completed:     { label: 'Completed',        bg: '#f1f5f9', color: '#475569' },
    booking_set_pending:   { label: 'Set Pending',      bg: '#fef3c7', color: '#92400e' },
    auto_approve_enabled:  { label: 'Auto-Approve ON',  bg: '#ede9fe', color: '#5b21b6' },
    auto_approve_disabled: { label: 'Auto-Approve OFF', bg: '#ede9fe', color: '#5b21b6' },
};

const ACTOR_COLORS = {
    admin:   { bg: '#fdf2f8', color: '#be185d' },
    doctor:  { bg: '#eff6ff', color: '#1d4ed8' },
    patient: { bg: '#f0fdf4', color: '#15803d' },
    system:  { bg: '#f8fafc', color: '#64748b' },
};

const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const controlStyle = {
    padding: '0.45rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.85rem',
    outline: 'none',
    background: '#f8fafc',
    color: '#0f172a',
    cursor: 'pointer',
    fontWeight: 600,
};

const th = { padding: '0.85rem 1rem', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', whiteSpace: 'nowrap' };
const td = { padding: '0.85rem 1rem', verticalAlign: 'top' };

const ActivityLogsTab = () => {
    const [logs, setLogs]           = useState([]);
    const [meta, setMeta]           = useState({ current_page: 1, last_page: 1, total: 0 });
    const [retention, setRetention] = useState(30);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [expanded, setExpanded]   = useState(null);

    const [filters, setFilters] = useState({ actor_type: '', category: '', date: '', search: '' });
    const [page, setPage]       = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const searchDebounceRef = useRef(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, per_page: 50 };
            Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
            const res = await api.get('/hospital/activity-logs', { params });
            if (res.data.success) {
                const { data, current_page, last_page, total } = res.data.data;
                setLogs(data);
                setMeta({ current_page, last_page, total });
                setRetention(res.data.retention_days);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load activity logs.');
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const updateFilter = (key, value) => {
        setPage(1);
        setFilters(f => ({ ...f, [key]: value }));
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => updateFilter('search', value.trim()), 400);
    };

    const clearFilters = () => {
        setSearchInput('');
        setPage(1);
        setFilters({ actor_type: '', category: '', date: '', search: '' });
    };

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <div style={{ width: '100%', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Activity Logs</h2>
                <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                    Logins and token actions by admins, doctors and patients. Records are kept for {retention} days, then deleted automatically.
                </p>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} />
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="glass-panel" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ position: 'relative', minWidth: '220px' }}>
                            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search name, CR No, IP..."
                                value={searchInput}
                                onChange={handleSearchChange}
                                style={{ ...controlStyle, width: '100%', paddingLeft: '2rem', boxSizing: 'border-box', cursor: 'text', fontWeight: 400 }}
                            />
                        </div>
                        <select value={filters.actor_type} onChange={(e) => updateFilter('actor_type', e.target.value)} style={controlStyle}>
                            <option value="">All Users</option>
                            <option value="admin">Admin</option>
                            <option value="doctor">Doctor</option>
                            <option value="patient">Patient</option>
                            <option value="system">System</option>
                        </select>
                        <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} style={controlStyle}>
                            <option value="">All Activity</option>
                            <option value="auth">Logins / Logouts</option>
                            <option value="booking">Token Actions</option>
                        </select>
                        <input type="date" value={filters.date} onChange={(e) => updateFilter('date', e.target.value)} style={controlStyle} />
                        {hasFilters && (
                            <button type="button" onClick={clearFilters} style={{ ...controlStyle, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', fontSize: '0.8rem' }}>
                                <X size={13} /> Clear
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{meta.total} records</span>
                        <button type="button" onClick={fetchLogs} disabled={loading} style={{ ...controlStyle, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                            <RefreshCw size={13} className={loading ? 'spin-fast' : ''} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={th}>Date &amp; Time</th>
                                <th style={th}>User</th>
                                <th style={th}>Action</th>
                                <th style={th}>Details</th>
                                <th style={th}>IP Address</th>
                                <th style={th}>Location</th>
                                <th style={th}>System</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && logs.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading…</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No activity found.</td></tr>
                            ) : logs.map(log => {
                                const action = ACTION_LABELS[log.action] || { label: log.action, bg: '#f1f5f9', color: '#475569' };
                                const actor  = ACTOR_COLORS[log.actor_type] || ACTOR_COLORS.system;
                                const isOpen = expanded === log.id;
                                return (
                                    <React.Fragment key={log.id}>
                                        <tr
                                            onClick={() => setExpanded(isOpen ? null : log.id)}
                                            style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isOpen ? '#fafafa' : 'white' }}
                                            title="Click for full system details"
                                        >
                                            <td style={{ ...td, whiteSpace: 'nowrap', color: '#0f172a', fontWeight: 600 }}>{formatDateTime(log.created_at)}</td>
                                            <td style={td}>
                                                <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: actor.bg, color: actor.color }}>
                                                    {log.actor_type}
                                                </span>
                                                <div style={{ marginTop: '0.3rem', fontWeight: 600, color: '#0f172a' }}>{log.actor_name || '—'}</div>
                                            </td>
                                            <td style={td}>
                                                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: action.bg, color: action.color, whiteSpace: 'nowrap' }}>
                                                    {action.label}
                                                </span>
                                            </td>
                                            <td style={{ ...td, color: '#475569', maxWidth: '280px' }}>{log.description || '—'}</td>
                                            <td style={{ ...td, fontFamily: 'monospace', color: '#334155', whiteSpace: 'nowrap' }}>{log.ip_address || '—'}</td>
                                            <td style={{ ...td, color: '#475569' }}>{log.location || '—'}</td>
                                            <td style={{ ...td, color: '#475569' }}>
                                                <div style={{ fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' }}>{log.platform || '—'}</div>
                                                <div style={{ fontSize: '0.78rem' }}>{[log.device, log.os, log.browser].filter(Boolean).join(' · ') || '—'}</div>
                                            </td>
                                        </tr>
                                        {isOpen && (
                                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                                                <td colSpan="7" style={{ padding: '0.75rem 1rem 1rem' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem 1.5rem', fontSize: '0.8rem', color: '#475569' }}>
                                                        {log.latitude && log.longitude && (
                                                            <div><strong>Coordinates:</strong>{' '}
                                                                <a href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`} target="_blank" rel="noreferrer" style={{ color: '#ff0088' }}>
                                                                    {Number(log.latitude).toFixed(4)}, {Number(log.longitude).toFixed(4)}
                                                                </a> <span style={{ color: '#94a3b8' }}>(approx., from IP)</span>
                                                            </div>
                                                        )}
                                                        {log.meta?.isp && <div><strong>ISP:</strong> {log.meta.isp}</div>}
                                                        {log.subject_type && <div><strong>Record:</strong> {log.subject_type} #{log.subject_id}</div>}
                                                        {log.device_info && Object.entries(log.device_info).map(([k, v]) => (
                                                            v !== null && v !== '' && <div key={k}><strong>{k.replace(/_/g, ' ')}:</strong> {String(v)}</div>
                                                        ))}
                                                        {log.user_agent && <div style={{ gridColumn: '1 / -1', wordBreak: 'break-all' }}><strong>User agent:</strong> {log.user_agent}</div>}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
                        <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)} style={{ ...controlStyle, display: 'inline-flex', alignItems: 'center' }}>
                            <ChevronLeft size={15} />
                        </button>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Page {meta.current_page} of {meta.last_page}</span>
                        <button type="button" disabled={page >= meta.last_page || loading} onClick={() => setPage(p => p + 1)} style={{ ...controlStyle, display: 'inline-flex', alignItems: 'center' }}>
                            <ChevronRight size={15} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogsTab;
