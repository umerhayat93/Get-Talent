import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';

const TEMPLATES = [
  { label: '🏏 Bidding Starting Soon', title: 'Live Bidding Starting!', message: 'A new bidding session is about to start. Join now to bid on top players!', type: 'bidding' },
  { label: '📣 Registration Open', title: 'Player Registration Open!', message: 'Register now for the upcoming tournament. Limited slots available!', type: 'registration' },
  { label: '🏆 Tournament Announcement', title: 'New Tournament Announced!', message: 'A new cricket tournament has been added to the platform. Check it out!', type: 'tournament' },
  { label: '⚠️ Payment Reminder', title: 'Payment Reminder', message: 'Please complete your payment to activate your account and start participating.', type: 'payment' },
  { label: '🎉 Winners Announcement', title: 'Bidding Results Are Out!', message: 'The latest bidding session has ended. Check the results on the platform!', type: 'results' },
];

const TYPE_COLORS = { bidding: '#f5c842', registration: '#00e676', tournament: '#40a9ff', payment: '#ff9500', results: '#f5c842', general: '#8899aa' };

export default function AdminBroadcast() {
  const [form, setForm] = useState({ title: '', message: '', type: 'general' });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  const handleTemplate = (tpl) => {
    setForm({ title: tpl.title, message: tpl.message, type: tpl.type });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) { toast.error('Title and message are required'); return; }
    setSending(true);
    try {
      await api.post('/admin/broadcast', form);
      toast.success('📢 Broadcast sent to all users!');
      setHistory(prev => [{ ...form, sentAt: new Date().toISOString(), id: Date.now() }, ...prev]);
      setForm({ title: '', message: '', type: 'general' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Broadcast failed');
    } finally { setSending(false); }
  };

  return (
    <AdminLayout title="Broadcast Notifications">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>

        {/* Quick Templates */}
        <div style={{ background: '#1a2a3a', border: '1px solid rgba(245,200,66,0.15)', borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: '#f5c842', letterSpacing: 1, marginBottom: 14 }}>⚡ Quick Templates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TEMPLATES.map((tpl) => (
              <button key={tpl.label} onClick={() => handleTemplate(tpl)} style={{
                padding: '10px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,0,0,0.07)',
                color: '#eef2f7', fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,200,66,0.3)'; e.currentTarget.style.background = 'rgba(245,200,66,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compose */}
        <div style={{ background: '#1a2a3a', border: '1px solid rgba(245,200,66,0.15)', borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: '#f5c842', letterSpacing: 1, marginBottom: 14 }}>📝 Compose Notification</h3>
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Notification Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="general">General</option>
                <option value="bidding">Bidding</option>
                <option value="tournament">Tournament</option>
                <option value="registration">Registration</option>
                <option value="payment">Payment</option>
                <option value="results">Results</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" placeholder="Notification title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={80} />
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea placeholder="Write your message here..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} style={{ resize: 'vertical' }} maxLength={300} />
              <span className="form-hint">{form.message.length}/300 characters</span>
            </div>

            {/* Preview */}
            {(form.title || form.message) && (
              <div style={{ background: '#152030', border: `1px solid ${TYPE_COLORS[form.type] || '#8899aa'}33`, borderRadius: 12, padding: '14px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#4a5a6a', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 8 }}>PREVIEW</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#1a2a3a,#0a1520)', border: '1px solid rgba(245,200,66,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',cursive", color: '#f5c842', fontSize: 14, flexShrink: 0 }}>GT</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#eef2f7', marginBottom: 3 }}>{form.title || 'Title here'}</div>
                    <div style={{ fontSize: 13, color: '#8899aa', lineHeight: 1.5 }}>{form.message || 'Message here...'}</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(64,169,255,0.08)', border: '1px solid rgba(64,169,255,0.15)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#8899aa', display: 'flex', gap: 8 }}>
              <span>ℹ️</span>
              <span>This will send an in-app notification to <strong style={{ color: '#eef2f7' }}>all registered users</strong> and a push notification to subscribed devices.</span>
            </div>

            <button type="submit" disabled={sending || !form.title || !form.message} style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: sending || !form.title || !form.message ? '#ddd8ce' : 'linear-gradient(135deg,#f5c842,#e6a800)',
              border: 'none', color: sending || !form.title || !form.message ? '#4a5a6a' : '#0a1520',
              fontWeight: 700, fontSize: 16, cursor: sending || !form.title || !form.message ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {sending ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Sending...</> : '📢 Send to All Users'}
            </button>
          </form>
        </div>

        {/* Sent History */}
        {history.length > 0 && (
          <div style={{ background: '#1a2a3a', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: '#eef2f7', letterSpacing: 1, marginBottom: 14 }}>📋 Recent Broadcasts (This Session)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map(h => (
                <div key={h.id} style={{ background: '#152030', borderRadius: 10, padding: '12px 14px', border: `1px solid ${TYPE_COLORS[h.type] || '#8899aa'}22` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#eef2f7', marginBottom: 3 }}>{h.title}</div>
                      <div style={{ fontSize: 13, color: '#8899aa' }}>{h.message}</div>
                    </div>
                    <span style={{ padding: '3px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700, background: `${TYPE_COLORS[h.type] || '#8899aa'}20`, color: TYPE_COLORS[h.type] || '#8899aa', flexShrink: 0 }}>{h.type}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#4a5a6a', marginTop: 8 }}>
                    ✓ Sent • {new Date(h.sentAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
