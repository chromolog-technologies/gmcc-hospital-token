import React, { useState } from 'react';
import api from '../../lib/axios';
import { useToast } from '../Toast';
import { LoadingButton } from '../Spinner';
import { Layers, Calendar, Pencil, Trash2, X, Save, Check } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPTY_UNIT = { name: '', day: 'Monday' };

// ── Delete Confirm Modal ────────────────────────────────────────────────────
const DeleteModal = ({ unit, onClose, onDeleted }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/hospital/units/${unit.unit_id}`);
            toast.success(`Unit "${unit.unit_name}" deleted.`);
            onDeleted();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed.');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={ms.overlay}>
            <div style={ms.card}>
                <div style={ms.header}>
                    <div>
                        <h2 style={ms.title}>Delete Unit</h2>
                        <p style={ms.subtitle}>This action cannot be undone.</p>
                    </div>
                    <button onClick={onClose} style={ms.closeBtn}><X size={18} /></button>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#dc2626', fontWeight: 600 }}>
                        Are you sure you want to delete <strong>{unit.unit_name}</strong> ({unit.day})?
                    </p>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                        Units with active bookings cannot be deleted.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={onClose} style={ms.btnBack} disabled={loading}>Cancel</button>
                    <LoadingButton loading={loading} label={<><Trash2 size={14} /> Delete</>} loadingLabel="Deleting…" onClick={handleDelete} style={{ ...ms.btnConfirm, background: '#ef4444' }} type="button" />
                </div>
            </div>
            <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
    );
};

// ── Inline Edit Row ─────────────────────────────────────────────────────────
const EditRow = ({ unit, onSaved, onCancel }) => {
    const toast = useToast();
    const [name, setName] = useState(unit.unit_name);
    const [editDays, setEditDays] = useState(
        unit.day ? unit.day.split(',').map(d => d.trim()).filter(Boolean) : ['Monday']
    );
    const [loading, setLoading] = useState(false);

    const toggleDay = (d) => {
        setEditDays(prev => 
            prev.includes(d) 
                ? (prev.length > 1 ? prev.filter(item => item !== d) : prev) 
                : [...prev, d]
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put(`/hospital/units/${unit.unit_id}`, { name, day: editDays.join(', ') });
            toast.success(`Unit "${name}" updated.`);
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ ...s.unitRow, background: '#fff5fa', border: '2px solid #ffd6ec', flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={s.unitBadge}>{(name || '?').charAt(0)}</div>
                <input
                    style={{ ...s.inlineInput, flex: 1 }}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Unit name"
                />
            </div>
            {/* Multi-day selection pills for editing */}
            <div>
                <label style={{ ...s.label, fontSize: '0.65rem', marginBottom: '0.25rem' }}>Select Operating Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {DAYS.map(d => {
                        const active = editDays.includes(d);
                        return (
                            <button
                                key={d}
                                type="button"
                                onClick={() => toggleDay(d)}
                                style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '6px',
                                    border: active ? '1px solid #ff0088' : '1px solid #cbd5e1',
                                    background: active ? '#ff0088' : 'white',
                                    color: active ? 'white' : '#64748b',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                {d.substring(0, 3)}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={onCancel} disabled={loading} style={s.btnCancel}><X size={13} /> Cancel</button>
                <LoadingButton
                    loading={loading}
                    label={<><Check size={13} /> Save</>}
                    loadingLabel="Saving…"
                    onClick={handleSave}
                    style={s.btnSave}
                    type="button"
                />
            </div>
        </div>
    );
};

// ── Main UnitTab ────────────────────────────────────────────────────────────
const UnitTab = ({ units, onUnitAdded }) => {
    const toast = useToast();

    const [form,       setForm]       = useState(EMPTY_UNIT);
    const [addDays,    setAddDays]    = useState(['Monday']);
    const [loading,    setLoading]    = useState(false);
    const [editingId,  setEditingId]  = useState(null);  // unit_id being edited inline
    const [deleteUnit, setDeleteUnit] = useState(null);

    const toggleAddDay = (d) => {
        setAddDays(prev => 
            prev.includes(d) 
                ? (prev.length > 1 ? prev.filter(item => item !== d) : prev) 
                : [...prev, d]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/hospital/units', {
                ...form,
                day: addDays.join(', ')
            });
            toast.success(`Unit "${form.name}" created for ${addDays.join(', ')}.`);
            setForm(EMPTY_UNIT);
            setAddDays(['Monday']);
            onUnitAdded?.();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create unit.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Delete Modal */}
            {deleteUnit && (
                <DeleteModal
                    unit={deleteUnit}
                    onClose={() => setDeleteUnit(null)}
                    onDeleted={() => { setDeleteUnit(null); onUnitAdded?.(); }}
                />
            )}

            <h1 style={s.pageTitle}>Unit Management</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* ── Add Unit Form ── */}
                <div style={s.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                        <Layers size={18} color="#ff0088" />
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Add New Unit</h3>
                    </div>
                    <p style={s.desc}>Create a unit by number and assign its operating days.</p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '0.85rem' }}>
                            <label style={s.label}>Unit Number / Name *</label>
                            <input
                                style={s.input}
                                placeholder="e.g., Unit 1"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={s.label}>Operating Days *</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.3rem' }}>
                                {DAYS.map(d => {
                                    const active = addDays.includes(d);
                                    return (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => toggleAddDay(d)}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                borderRadius: '8px',
                                                border: active ? '1.5px solid #ff0088' : '1.5px solid #e2e8f0',
                                                background: active ? '#ff0088' : 'white',
                                                color: active ? 'white' : '#475569',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <LoadingButton loading={loading} label="Create Unit" loadingLabel="Creating…" style={{ ...s.btnPrimary, width: '100%' }} />
                    </form>
                </div>

                {/* ── Existing Units List ── */}
                <div style={s.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                        <Calendar size={18} color="#ff0088" />
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                            Existing Units{' '}
                            <span style={{ fontWeight: 400, color: '#94a3b8' }}>({units.length})</span>
                        </h3>
                    </div>

                    <p style={s.desc}>Standard hospital units configured for token allocation.</p>

                    {units.length === 0 ? (
                        <p style={s.desc}>No units loaded.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {units.map(unit => (
                                editingId === unit.unit_id ? (
                                    <EditRow
                                        key={unit.unit_id}
                                        unit={unit}
                                        onSaved={() => { setEditingId(null); onUnitAdded?.(); }}
                                        onCancel={() => setEditingId(null)}
                                    />
                                ) : (
                                    <div key={unit.unit_id} style={s.unitRow}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                            <div style={s.unitBadge}>
                                                {(unit.unit_name || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{unit.unit_name}</p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                                                    Doctors: <strong style={{ color: '#0f172a' }}>{unit.doctor_name || 'None assigned'}</strong>
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span style={s.dayPill}>{unit.day || 'No day'}</span>
                                            <button
                                                title="Edit unit"
                                                onClick={() => setEditingId(unit.unit_id)}
                                                style={s.iconBtn('#ff0088', '#fff5fa', '#ffd6ec')}
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                title="Delete unit"
                                                onClick={() => setDeleteUnit(unit)}
                                                style={s.iconBtn('#ef4444', '#fef2f2', '#fecaca')}
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
    pageTitle:  { fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem' },
    card:       { background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0' },
    input:      { width: '100%', padding: '0.75rem 1rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
    inlineInput:{ padding: '0.55rem 0.75rem', border: '2px solid #ffd6ec', borderRadius: '8px', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', minWidth: 0 },
    label:      { display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    btnPrimary: { background: '#ff0088', color: 'white', border: 'none', borderRadius: '10px', padding: '0.8rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' },
    btnCancel:  { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', fontFamily: 'inherit' },
    btnSave:    { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.85rem', border: 'none', borderRadius: '8px', background: '#ff0088', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: 'white', fontFamily: 'inherit' },
    desc:       { fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.6 },
    unitRow:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '12px', background: '#fafafa', border: '1px solid #f1f5f9', gap: '0.5rem' },
    unitBadge:  { width: '36px', height: '36px', borderRadius: '10px', background: '#fff5fa', border: '1px solid #ffd6ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: '#ff0088', flexShrink: 0 },
    dayPill:    { background: '#f1f5f9', color: '#475569', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' },
    iconBtn:    (color, bg, border) => ({
        background: bg || 'transparent', border: `1px solid ${border || 'transparent'}`,
        borderRadius: '8px', cursor: 'pointer', color, padding: '0.35rem',
        display: 'flex', alignItems: 'center', flexShrink: 0,
    }),
};

const ms = {
    overlay:    { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease' },
    card:       { background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '460px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease' },
    header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
    title:      { margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' },
    subtitle:   { margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' },
    closeBtn:   { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexShrink: 0 },
    btnBack:    { flex: 1, padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: 'white', cursor: 'pointer', fontWeight: 700, color: '#475569', fontFamily: 'inherit', fontSize: '0.875rem' },
    btnConfirm: { flex: 2, padding: '0.75rem', border: 'none', borderRadius: '12px', background: '#ff0088', color: 'white', cursor: 'pointer', fontWeight: 800, fontFamily: 'inherit', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
};

export default UnitTab;
