import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import { useToast } from '../Toast';
import { LoadingButton } from '../Spinner';
import {
    UserPlus, Camera, X, User, Mail, Phone, Building2, CreditCard, Lock,
    Stethoscope, Eye, Pencil, Trash2, Save, RefreshCw
} from 'lucide-react';

const EMPTY_DOCTOR = {
    name: '', qualification: '', unit_id: '', department: '',
    phone: '', email: '', gender: 'male', regno: '', password: '', photo: null
};

// ── Modal Shell ─────────────────────────────────────────────────────────────
const Modal = ({ title, subtitle, onClose, children, maxWidth = '520px' }) => (
    <div style={ms.overlay}>
        <div style={{ ...ms.card, maxWidth }}>
            <div style={ms.header}>
                <div>
                    <h2 style={ms.title}>{title}</h2>
                    {subtitle && <p style={ms.subtitle}>{subtitle}</p>}
                </div>
                <button onClick={onClose} style={ms.closeBtn}><X size={18} /></button>
            </div>
            {children}
        </div>
        <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
);

// ── View Doctor Modal ───────────────────────────────────────────────────────
const ViewModal = ({ doctor, onClose, onEdit }) => (
    <Modal title="Doctor Details" subtitle="Full profile information" onClose={onClose}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#fff5fa', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #ffd6ec' }}>
            <div style={ms.photoThumb}>
                {doctor.photo_url
                    ? <img src={doctor.photo_url} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={28} style={{ color: '#ff0088' }} />
                }
            </div>
            <div>
                <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>Dr. {doctor.name}</p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#ff0088', fontWeight: 700 }}>{doctor.qualification || '—'}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{doctor.department || '—'}</p>
            </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[
                { icon: <CreditCard size={14} />,  label: 'Registration No', value: doctor.regno },
                { icon: <Building2 size={14} />,   label: 'Assigned Unit',   value: doctor.unit_name || 'Not assigned' },
                { icon: <Phone size={14} />,       label: 'Phone',           value: doctor.phone || '—' },
                { icon: <Mail size={14} />,        label: 'Email',           value: doctor.email || '—' },
                { icon: <User size={14} />,        label: 'Gender',          value: doctor.gender ? doctor.gender.charAt(0).toUpperCase() + doctor.gender.slice(1) : '—' },
            ].map(({ icon, label, value }) => (
                <div key={label} style={ms.detailRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff0088', minWidth: '130px' }}>
                        {icon}
                        <span style={ms.rowLabel}>{label}</span>
                    </div>
                    <span style={ms.rowValue}>{value}</span>
                </div>
            ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} style={ms.btnBack}>Close</button>
            <button onClick={onEdit}  style={ms.btnConfirm}><Pencil size={14} /> Edit Doctor</button>
        </div>
    </Modal>
);

// ── Edit Doctor Modal ───────────────────────────────────────────────────────
const EditModal = ({ doctor, units, onClose, onSaved }) => {
    const toast  = useToast();
    const [form, setForm]       = useState({
        name: doctor.name, qualification: doctor.qualification || '',
        department: doctor.department || '', phone: doctor.phone || '',
        gender: doctor.gender || 'male', unit_id: doctor.unit_id || '', password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
            await api.put(`/hospital/doctors/${doctor.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Doctor updated successfully.');
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    return (
        <Modal title="Edit Doctor" subtitle={`Editing: Dr. ${doctor.name}`} onClose={onClose} maxWidth="580px">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <Field label="Full Name *"      value={form.name}          onChange={v => set('name', v)}          required />
                <Field label="Qualification"    value={form.qualification} onChange={v => set('qualification', v)} placeholder="MD, MBBS…" />
                <Field label="Department"       value={form.department}    onChange={v => set('department', v)}    placeholder="Pulmonology…" />
                <Field label="Phone"            value={form.phone}         onChange={v => set('phone', v)} />
                <div style={{ marginBottom: '0.85rem' }}>
                    <label style={s.label}>Gender</label>
                    <select style={s.input} value={form.gender} onChange={e => set('gender', e.target.value)}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div style={{ marginBottom: '0.85rem' }}>
                    <label style={s.label}>Assigned Unit</label>
                    <select style={s.input} value={form.unit_id} onChange={e => set('unit_id', e.target.value)}>
                        <option value="">— No unit —</option>
                        {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_name} — {u.day || ''}</option>)}
                    </select>
                </div>
            </div>
            <Field label="New Password (leave blank to keep)" value={form.password} onChange={v => set('password', v)} type="password" />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button onClick={onClose} style={ms.btnBack} disabled={loading}>Cancel</button>
                <LoadingButton loading={loading} label={<><Save size={14} /> Save Changes</>} loadingLabel="Saving…" onClick={handleSave} style={ms.btnConfirm} type="button" />
            </div>
        </Modal>
    );
};

// ── Delete Doctor Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ doctor, onClose, onDeleted }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/hospital/doctors/${doctor.id}`);
            toast.success(`Dr. ${doctor.name} deleted.`);
            onDeleted();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed.');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Delete Doctor" subtitle="This action cannot be undone." onClose={onClose}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#dc2626', fontWeight: 600 }}>
                    Are you sure you want to delete <strong>Dr. {doctor.name}</strong>?
                </p>
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                    The doctor will be unassigned from their unit before deletion.
                </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={onClose} style={ms.btnBack} disabled={loading}>Cancel</button>
                <LoadingButton loading={loading} label={<><Trash2 size={14} /> Delete</>} loadingLabel="Deleting…" onClick={handleDelete} style={{ ...ms.btnConfirm, background: '#ef4444' }} type="button" />
            </div>
        </Modal>
    );
};

// ── Register Confirmation Modal ─────────────────────────────────────────────
const ConfirmModal = ({ form, unitLabel, preview, onConfirm, onBack, loading }) => {
    const rows = [
        { icon: <User size={15} />,        label: 'Full Name',       value: form.name },
        { icon: <Stethoscope size={15} />, label: 'Qualification',   value: form.qualification },
        { icon: <Building2 size={15} />,   label: 'Department',      value: form.department },
        { icon: <Building2 size={15} />,   label: 'Assigned Unit',   value: unitLabel },
        { icon: <Phone size={15} />,       label: 'Phone',           value: form.phone },
        { icon: <Mail size={15} />,        label: 'Email',           value: form.email },
        { icon: <User size={15} />,        label: 'Gender',          value: form.gender.charAt(0).toUpperCase() + form.gender.slice(1) },
        { icon: <CreditCard size={15} />,  label: 'Registration No', value: form.regno },
        { icon: <Lock size={15} />,        label: 'Password',        value: '••••••••' },
    ];

    return (
        <Modal title="Confirm Registration" subtitle="Please review the details before submitting." onClose={onBack}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#fff5fa', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #ffd6ec' }}>
                <div style={ms.photoThumb}>
                    {preview ? <img src={preview} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={28} style={{ color: '#ff0088' }} />}
                </div>
                <div>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>{form.name}</p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#ff0088', fontWeight: 700 }}>{form.qualification}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{form.department}</p>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                {rows.map(({ icon, label, value }) => (
                    <div key={label} style={ms.detailRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff0088', minWidth: '140px' }}>
                            {icon}<span style={ms.rowLabel}>{label}</span>
                        </div>
                        <span style={ms.rowValue}>{value || <span style={{ color: '#cbd5e1' }}>Not provided</span>}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={onBack} style={ms.btnBack} disabled={loading}>← Edit Details</button>
                <LoadingButton type="button" loading={loading} label="Confirm & Register" loadingLabel="Registering…" onClick={onConfirm} style={ms.btnConfirm} />
            </div>
        </Modal>
    );
};

// ── Main DoctorTab ──────────────────────────────────────────────────────────
const DoctorTab = ({ units, onDoctorAdded }) => {
    const toast = useToast();

    const [form,         setForm]         = useState(EMPTY_DOCTOR);
    const [preview,      setPreview]      = useState(null);
    const [showConfirm,  setShowConfirm]  = useState(false);
    const [submitting,   setSubmitting]   = useState(false);
    const [showForm,     setShowForm]     = useState(false);

    const [doctors,      setDoctors]      = useState([]);
    const [loadingList,  setLoadingList]  = useState(false);
    const [viewDoctor,   setViewDoctor]   = useState(null);
    const [editDoctor,   setEditDoctor]   = useState(null);
    const [deleteDoctor, setDeleteDoctor] = useState(null);

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const fetchDoctors = useCallback(async () => {
        setLoadingList(true);
        try {
            const res = await api.get('/hospital/doctors');
            setDoctors(res.data.data || []);
        } catch {
            toast.error('Failed to load doctors.');
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        set('photo', file);
        setPreview(URL.createObjectURL(file));
    };

    const handleReview = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const handleConfirmedSubmit = async () => {
        setSubmitting(true);
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
        try {
            await api.post('/hospital/doctors', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success(`Dr. ${form.name} registered successfully.`);
            setForm(EMPTY_DOCTOR);
            setPreview(null);
            setShowConfirm(false);
            setShowForm(false);
            onDoctorAdded?.();
            fetchDoctors();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register doctor.');
            setShowConfirm(false);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedUnit = units.find(u => String(u.unit_id) === String(form.unit_id));
    const unitLabel    = selectedUnit ? `${selectedUnit.unit_name} — ${selectedUnit.day || ''}` : '—';

    return (
        <>
            {/* Modals */}
            {showConfirm && <ConfirmModal form={form} unitLabel={unitLabel} preview={preview} onConfirm={handleConfirmedSubmit} onBack={() => setShowConfirm(false)} loading={submitting} />}
            {viewDoctor   && <ViewModal   doctor={viewDoctor}   onClose={() => setViewDoctor(null)}   onEdit={() => { setEditDoctor(viewDoctor); setViewDoctor(null); }} />}
            {editDoctor   && <EditModal   doctor={editDoctor}   units={units} onClose={() => setEditDoctor(null)}   onSaved={() => { setEditDoctor(null); fetchDoctors(); onDoctorAdded?.(); }} />}
            {deleteDoctor && <DeleteModal doctor={deleteDoctor} onClose={() => setDeleteDoctor(null)} onDeleted={() => { setDeleteDoctor(null); fetchDoctors(); onDoctorAdded?.(); }} />}

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={s.pageTitle}>Doctor Management</h1>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={fetchDoctors} disabled={loadingList} style={s.btnRefresh} title="Refresh list">
                            <RefreshCw size={14} style={{ animation: loadingList ? 'spin 0.8s linear infinite' : 'none' }} />
                        </button>
                        <button onClick={() => setShowForm(f => !f)} style={s.btnPrimary}>
                            {showForm ? <><X size={15} /> Cancel</> : <><UserPlus size={15} /> Register Doctor</>}
                        </button>
                    </div>
                </div>

                {/* Register Form */}
                {showForm && (
                    <div style={{ ...s.card, marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                            <UserPlus size={20} color="#ff0088" />
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Register New Doctor</h3>
                        </div>
                        <form onSubmit={handleReview}>
                            <div style={s.formGrid}>
                                <div>
                                    <Field label="Full Name *"         value={form.name}          onChange={v => set('name', v)}          required />
                                    <Field label="Qualification *"     value={form.qualification} onChange={v => set('qualification', v)} required placeholder="e.g. MD, MBBS" />
                                    <div style={{ marginBottom: '0.85rem' }}>
                                        <label style={s.label}>Select Unit *</label>
                                        <select style={s.input} value={form.unit_id} onChange={e => set('unit_id', e.target.value)} required>
                                            <option value="">Select a unit…</option>
                                            {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_name} — {u.day || 'No day set'}</option>)}
                                        </select>
                                    </div>
                                    <Field label="Department *"        value={form.department}    onChange={v => set('department', v)}    required placeholder="e.g. Pulmonology" />
                                    <Field label="Phone No *"          value={form.phone}         onChange={v => set('phone', v)}         required placeholder="+91 98765 43210" />
                                </div>
                                <div>
                                    <Field label="Registration No (Regno) *" value={form.regno}    onChange={v => set('regno', v)}    required placeholder="MCI Reg number" />
                                    <Field label="Email"                      value={form.email}    onChange={v => set('email', v)}    type="email" placeholder="doctor@example.com" />
                                    <div style={{ marginBottom: '0.85rem' }}>
                                        <label style={s.label}>Gender *</label>
                                        <select style={s.input} value={form.gender} onChange={e => set('gender', e.target.value)}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <Field label="Password *" value={form.password} onChange={v => set('password', v)} type="password" required placeholder="Min. 6 characters" />
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={s.label}>Photo (jpeg, png)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={s.photoPreview}>
                                                {preview ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={22} style={{ color: '#cbd5e1' }} />}
                                            </div>
                                            <div>
                                                <input type="file" id="doctorPhoto" accept="image/jpeg,image/png" onChange={handlePhoto} style={{ display: 'none' }} />
                                                <label htmlFor="doctorPhoto" style={{ ...s.btnSecondary, cursor: 'pointer', display: 'inline-block' }}>
                                                    {preview ? 'Change Photo' : 'Upload Photo'}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <LoadingButton loading={false} label="Review Details →" style={{ ...s.btnPrimary, width: '100%', marginTop: '0.75rem' }} />
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Doctor List */}
                <div style={s.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        <Stethoscope size={18} color="#ff0088" />
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                            All Doctors <span style={{ fontWeight: 400, color: '#94a3b8' }}>({doctors.length})</span>
                        </h3>
                    </div>

                    {loadingList ? (
                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading doctors…</p>
                    ) : doctors.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            <Stethoscope size={40} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                            <p style={{ fontSize: '0.875rem' }}>No doctors registered yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                            {doctors.map(doc => (
                                <div key={doc.id} style={s.doctorCard}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={s.photoThumbSm}>
                                            {doc.photo_url
                                                ? <img src={doc.photo_url} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <User size={18} style={{ color: '#ff0088' }} />
                                            }
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dr. {doc.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#ff0088', fontWeight: 700 }}>{doc.qualification || '—'}</p>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
                                        <p style={{ margin: '0 0 0.2rem' }}>🏥 {doc.department || '—'}</p>
                                        <p style={{ margin: '0 0 0.2rem' }}>📋 {doc.unit_name || 'No unit'}</p>
                                        <p style={{ margin: 0 }}>📞 {doc.phone || '—'}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button title="View"   onClick={() => setViewDoctor(doc)}   style={{ ...s.actionBtn, color: '#3b82f6', borderColor: '#bfdbfe', background: '#eff6ff' }}><Eye    size={13} /> View</button>
                                        <button title="Edit"   onClick={() => setEditDoctor(doc)}   style={{ ...s.actionBtn, color: '#ff0088', borderColor: '#ffd6ec', background: '#fff5fa' }}><Pencil size={13} /> Edit</button>
                                        <button title="Delete" onClick={() => setDeleteDoctor(doc)} style={{ ...s.actionBtn, color: '#ef4444', borderColor: '#fecaca', background: '#fef2f2' }}><Trash2 size={13} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
};

// ── Shared sub-components ──────────────────────────────────────────────────
const Field = ({ label, value, onChange, required, type = 'text', placeholder = '' }) => (
    <div style={{ marginBottom: '0.85rem' }}>
        <label style={s.label}>{label}</label>
        <input type={type} style={s.input} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} />
    </div>
);

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
    pageTitle:    { fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 },
    card:         { background: 'white', borderRadius: '20px', padding: '1.75rem', border: '1px solid #e2e8f0' },
    formGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
    input:        { width: '100%', padding: '0.75rem 1rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
    label:        { display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    btnPrimary:   { background: '#ff0088', color: 'white', border: 'none', borderRadius: '10px', padding: '0.7rem 1.25rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
    btnSecondary: { background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.82rem' },
    btnRefresh:   { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.7rem', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' },
    photoPreview: { width: '64px', height: '64px', borderRadius: '12px', background: '#f8fafc', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
    photoThumbSm: { width: '44px', height: '44px', borderRadius: '10px', background: '#fff5fa', border: '1px solid #ffd6ec', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
    doctorCard:   { background: '#f8fafc', borderRadius: '14px', padding: '1rem', border: '1px solid #e2e8f0' },
    actionBtn:    { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.65rem', border: '1px solid', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit', background: 'none' },
};

const ms = {
    overlay:    { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease' },
    card:       { background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease' },
    header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
    title:      { margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' },
    subtitle:   { margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' },
    closeBtn:   { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexShrink: 0 },
    detailRow:  { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '10px', background: '#fafafa', border: '1px solid #f1f5f9' },
    rowLabel:   { margin: 0, fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' },
    rowValue:   { margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' },
    photoThumb: { width: '60px', height: '60px', borderRadius: '14px', background: '#ffd6ec', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
    btnBack:    { flex: 1, padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: 'white', cursor: 'pointer', fontWeight: 700, color: '#475569', fontFamily: 'inherit', fontSize: '0.875rem' },
    btnConfirm: { flex: 2, padding: '0.75rem', border: 'none', borderRadius: '12px', background: '#ff0088', color: 'white', cursor: 'pointer', fontWeight: 800, fontFamily: 'inherit', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
};

export default DoctorTab;
