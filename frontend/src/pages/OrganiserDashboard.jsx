import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import GTLogo from '../components/common/GTLogo';
import VerifiedBadge from '../components/common/VerifiedBadge';
import { CheckMark } from '../components/common/VerifiedBadge';

const STATUS_COLORS = { pending: '#ff9500', approved: '#00e676', rejected: '#ff4444' };
const STATUS_LABELS = { pending: 'Pending Review', approved: 'Approved — Live', rejected: 'Rejected' };

const EMPTY_FORM = { name: '', location: '', description: '', startDate: '', endDate: '', contactPhone: '', contactEmail: '', prizePool: '' };

export default function OrganiserDashboard() {
  const navigate  = useNavigate();
  const userName  = useAuthStore(s => s.user?.name);
  const logout    = useAuthStore(s => s.logout);

  const [requests, setRequests]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form,     setForm]       = useState(EMPTY_FORM);
  const [errs,     setErrs]       = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const { data } = await api.get('/tournaments/organiser/my-requests');
      setRequests(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  };

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrs(e => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Tournament name required';
    if (!form.location.trim()) e.location = 'Location required';
    if (!form.startDate)       e.startDate = 'Start date required';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/tournaments/request', form);
      toast.success('Tournament request submitted! Admin will review shortly.');
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const handleLogout = () => { logout(); navigate('/', { replace: true }); };

  const inp = { width: '100%', padding: '11px 14px', background: '#f0ebe0', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 10, color: '#1a1a2e', fontSize: 14, outline: 'none', fontFamily: 'Outfit,sans-serif', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6a7080', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
      <header style={{ background: 'rgba(10,21,32,0.97)', borderBottom: '1px solid rgba(255,149,0,0.15)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <GTLogo size="sm" />
          <div>
            <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 16, letterSpacing: 1, color: '#ff9500', lineHeight: 1 }}>Get Talent</div>
            <div style={{ fontSize: 9, color: '#9090a8', letterSpacing: '1.5px' }}>ORGANISER PANEL</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#6a7080' }}>👋 {userName}</span>
          <button onClick={handleLogout} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff6666', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 48px' }}>
        {/* Welcome card */}
        <div style={{ background: 'linear-gradient(145deg,#fff,#f5f0e8)', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 18, padding: '20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>🏟️</span>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: '#ff9500', letterSpacing: 1 }}>Organiser Dashboard</div>
              <div style={{ fontSize: 13, color: '#6a7080' }}>Submit and manage your tournament requests</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: '#ff9500' }}>{requests.length}</div>
              <div style={{ fontSize: 11, color: '#9090a8', fontWeight: 600 }}>TOTAL</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: '#00e676' }}>{requests.filter(r => r.approvalStatus === 'approved').length}</div>
              <div style={{ fontSize: 11, color: '#9090a8', fontWeight: 600 }}>LIVE</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: '#ff9500' }}>{requests.filter(r => r.approvalStatus === 'pending').length}</div>
              <div style={{ fontSize: 11, color: '#9090a8', fontWeight: 600 }}>PENDING</div>
            </div>
          </div>
        </div>

        {/* New request button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, letterSpacing: 1, color: '#1a1a2e', margin: 0 }}>
            My Tournament Requests
          </h2>
          <button onClick={() => setShowForm(v => !v)} style={{ padding: '9px 16px', borderRadius: 10, background: showForm ? 'rgba(255,68,68,0.15)' : 'linear-gradient(135deg,#ff9500,#e68000)', border: 'none', color: showForm ? '#ff4444' : '#ffffff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {showForm ? '✕ Cancel' : '+ New Request'}
          </button>
        </div>

        {/* Submission form */}
        {showForm && (
          <div style={{ background: '#ffffff', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 18, padding: '20px', marginBottom: 20 }} className="fade-in">
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: '#ff9500', letterSpacing: 1, marginBottom: 16 }}>🏟️ Submit Tournament Request</h3>
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Tournament / League Name *</label>
                  <input type="text" placeholder="e.g. Pattan Super League 2025" value={form.name} onChange={e => set('name', e.target.value)} style={{ ...inp, borderColor: errs.name ? '#ff4444' : 'rgba(0,0,0,0.08)' }} onFocus={e => e.target.style.borderColor = '#ff9500'} onBlur={e => e.target.style.borderColor = errs.name ? '#ff4444' : 'rgba(0,0,0,0.08)'} />
                  {errs.name && <p style={{ fontSize: 12, color: '#ff6666', marginTop: 4 }}>{errs.name}</p>}
                </div>

                <div>
                  <label style={lbl}>Location *</label>
                  <input type="text" placeholder="City, District" value={form.location} onChange={e => set('location', e.target.value)} style={{ ...inp, borderColor: errs.location ? '#ff4444' : 'rgba(0,0,0,0.08)' }} onFocus={e => e.target.style.borderColor = '#ff9500'} onBlur={e => e.target.style.borderColor = errs.location ? '#ff4444' : 'rgba(0,0,0,0.08)'} />
                  {errs.location && <p style={{ fontSize: 12, color: '#ff6666', marginTop: 4 }}>{errs.location}</p>}
                </div>

                <div>
                  <label style={lbl}>Expected Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} style={{ ...inp, borderColor: errs.startDate ? '#ff4444' : 'rgba(0,0,0,0.08)', colorScheme: 'dark' }} onFocus={e => e.target.style.borderColor = '#ff9500'} onBlur={e => e.target.style.borderColor = errs.startDate ? '#ff4444' : 'rgba(0,0,0,0.08)'} />
                  {errs.startDate && <p style={{ fontSize: 12, color: '#ff6666', marginTop: 4 }}>{errs.startDate}</p>}
                </div>

                <div>
                  <label style={lbl}>End Date</label>
                  <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} style={{ ...inp, colorScheme: 'dark' }} onFocus={e => e.target.style.borderColor = '#ff9500'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                </div>

                <div>
                  <label style={lbl}>Contact Phone</label>
                  <input type="tel" placeholder="03xxxxxxxxx" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = '#ff9500'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                </div>

                <div>
                  <label style={lbl}>Prize Pool (Optional)</label>
                  <input type="text" placeholder="e.g. Rs. 500,000" value={form.prizePool} onChange={e => set('prizePool', e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = '#ff9500'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Description / Notes</label>
                  <textarea placeholder="Tournament details, format, rules..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#ff9500'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                </div>
              </div>

              <div style={{ background: 'rgba(64,169,255,0.07)', border: '1px solid rgba(64,169,255,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#6a7080', display: 'flex', gap: 8 }}>
                <span>ℹ️</span>
                <span>Admin will review your request within 24 hours. You'll be notified when approved.</span>
              </div>

              <button type="submit" disabled={submitting} style={{ width: '100%', padding: '13px', borderRadius: 12, background: submitting ? '#e4e6ea' : 'linear-gradient(135deg,#ff9500,#e68000)', border: 'none', color: submitting ? '#9090a8' : '#ffffff', fontWeight: 800, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {submitting ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: '#888', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Submitting...</> : '🏟️ Submit Request'}
              </button>
            </form>
          </div>
        )}

        {/* Requests list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9090a8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏟️</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#6a7080', marginBottom: 6 }}>No requests yet</div>
            <p style={{ fontSize: 13 }}>Submit your first tournament request above</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {requests.map(r => {
              const sc = STATUS_COLORS[r.approvalStatus] || '#6a7080';
              const sl = STATUS_LABELS[r.approvalStatus] || r.approvalStatus;
              const schedule = r.biddingSchedule ? JSON.parse(r.biddingSchedule) : null;
              return (
                <div key={r.id} style={{ background: '#ffffff', border: `1px solid ${sc}22`, borderRadius: 16, padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: '#1a1a2e', letterSpacing: 1 }}>{r.name}</span>
                        {r.approvalStatus === 'approved' && <CheckMark size={16} />}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', fontSize: 12, color: '#9090a8', marginTop: 3 }}>
                        {r.location  && <span>📍 {r.location}</span>}
                        {r.startDate && <span>📅 {r.startDate}</span>}
                        {r.prizePool && <span>💰 {r.prizePool}</span>}
                      </div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, background: `${sc}18`, color: sc, flexShrink: 0 }}>{sl}</span>
                  </div>

                  {r.adminRemarks && (
                    <div style={{ background: r.approvalStatus === 'rejected' ? 'rgba(255,68,68,0.08)' : 'rgba(0,230,118,0.06)', border: `1px solid ${r.approvalStatus === 'rejected' ? 'rgba(255,68,68,0.2)' : 'rgba(0,230,118,0.15)'}`, borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 12 }}>
                      <span style={{ fontWeight: 600, color: r.approvalStatus === 'rejected' ? '#ff6666' : '#00e676' }}>Admin note: </span>
                      <span style={{ color: '#6a7080' }}>{r.adminRemarks}</span>
                    </div>
                  )}

                  {/* Bidding schedule if approved */}
                  {r.approvalStatus === 'approved' && schedule && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px', marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: '#9090a8', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 8 }}>BIDDING SCHEDULE</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {Object.entries(schedule).map(([cat, date]) => (
                          <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: cat === 'Diamond' ? '#40a9ff' : cat === 'Gold' ? '#1877f2' : cat === 'Silver' ? '#c0c0c0' : '#00e676', fontWeight: 600 }}>
                              {cat === 'Diamond' ? '💎' : cat === 'Gold' ? '🥇' : cat === 'Silver' ? '🥈' : '⭐'} {cat}
                            </span>
                            <span style={{ color: '#6a7080' }}>{date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: 11, color: '#e4e6ea', marginTop: 10 }}>
                    Submitted {new Date(r.createdAt).toLocaleDateString('en-PK')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
