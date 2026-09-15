import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { Bell, Plus, Edit2, Trash2, X, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`/hospital/notifications`);
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (notification = null) => {
    if (notification) {
      setEditingNotification(notification);
      setTitle(notification.title);
      setMessage(notification.message);
    } else {
      setEditingNotification(null);
      setTitle('');
      setMessage('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNotification(null);
    setTitle('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const payload = { title, message };

      if (editingNotification) {
        // Update
        const response = await api.put(`/hospital/notifications/${editingNotification.id}`, payload);
        if (response.data.success) {
          toast.success('Notification updated');
          fetchNotifications();
          handleCloseModal();
        }
      } else {
        // Create
        const response = await api.post(`/hospital/notifications`, payload);
        if (response.data.success) {
          toast.success('Notification created and broadcast sent');
          fetchNotifications();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error saving notification:', error);
      toast.error('Failed to save notification');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification? It will be removed from the App.')) return;

    try {
      const response = await api.delete(`/hospital/notifications/${id}`);
      if (response.data.success) {
        toast.success('Notification deleted');
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: '#94a3b8' }}>
        Loading notifications...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Notifications</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Manage push notifications and alerts sent to the patient app.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: '#ff0088', color: '#fff', border: 'none',
            padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer',
            fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(255,0,136,0.2)'
          }}
        >
          <Plus size={18} /> New Notification
        </button>
      </div>

      {/* List */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ margin: 0, color: '#334155', fontSize: '1.1rem' }}>No notifications</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Get started by creating a new notification.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((notification, idx) => (
              <div
                key={notification.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  padding: '1.5rem', borderBottom: idx !== notifications.length - 1 ? '1px solid #e2e8f0' : 'none'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                  <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', height: 'fit-content' }}>
                    <MessageSquare size={24} color="#ff0088" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 'bold' }}>
                      {notification.title}
                    </h4>
                    <p style={{ margin: '0.5rem 0 0.75rem', color: '#475569', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {notification.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                      <Clock size={14} />
                      {format(new Date(notification.created_at), 'PPP h:mm a')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '1rem' }}>
                  <button
                    onClick={() => handleOpenModal(notification)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(notification.id)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 'bold' }}>
                {editingNotification ? 'Edit Notification' : 'Send New Notification'}
              </h3>
              <button onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Holiday Alert"
                  required
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid #cbd5e1', fontSize: '0.95rem',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: '600', fontSize: '0.9rem' }}>
                  Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification content..."
                  required
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid #cbd5e1', fontSize: '0.95rem',
                    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '0.6rem 1.2rem', background: '#f8fafc', color: '#475569',
                    border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.2rem', background: '#ff0088', color: '#fff',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                  }}
                >
                  {editingNotification ? 'Save Changes' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
