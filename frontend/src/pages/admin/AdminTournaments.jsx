import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';

const CATEGORIES = ['Diamond', 'Gold', 'Silver', 'Emerging'];
const CAT_COLORS = { Diamond: '#40a9ff', Gold: '#f5c842', Silver: '#c0c0c0', Emerging: '#00e676' };
const CAT_ICONS  = { Diamond: '💎', Gold: '🥇', Silver: '🥈', Emerging: '⭐' };

const EMPTY_FORM = { name: '', location: '', description: '', startDate: '', endDate: '', prizePool: '', organizerName: '', organizerPhone: '' };

export default function AdminTournaments() {
  const [tab,         setTab]         = useState('pending'); // pending|approved|create
  const [pending,     setPending]     = useState([]);
  const [approved,    setApproved]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [actionId,    setActionId]    = useState(null);
  const [remarks,     setRemarks]     = useState('');
  const [scheduleFor, setScheduleFor] = useState(null); // tournament id
  const [schedule,    setSchedule]    = useState({ Diamond: '', Gold: '', Silver: '', Emerging: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        api.get('/admin/tournaments/pending'),
        api.get('/admin/tournaments'),
      ]);
      setPending(Array.isArray(p.data) ? p.data.filter(t => t.approvalStatus === 'pending') : []);
      setApproved(Array.isArray(a.data) ? a.data.filter(t => t.approvalStatus === 'approved') : []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setActionId(id);
    try {
      await api.patch(`/admin/tournaments/${id}/approve`, { remarks, biddingSchedule: null });
      toast.success('Tournament approved and live!');
      setRemarks(''); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionId(null); }
  };

  const reject = async (id) => {
    if (!remarks.trim()) { toast.error('Add a reason for rejection'); return; }
    setActionId(id);
    try {
      await api.patch(`/admin/tournaments/${id}/reject`, { remarks });
      toast.success('Tournament rejected');
      setRemarks(''); load();
    } catch { toast.error('Failed'); }
    finally { setActionId(null); }
  };

  const saveSchedule = async () => {
    const filled = Object.values(schedule).filter(Boolean);
    if (filled.length === 0) { toast.error('Set at least one date'); return; }
    try {
      // Filter out empty dates
      const clean = Object.fromEntries(Object.entries(schedule).filter(([, v]) => v));
      await api.patch(`/admin/tournaments/${scheduleFor}/schedule`, { schedule: clean });
      toast.success('Bidding schedule saved!');
      setScheduleFor(null);
      setSchedule({ Diamond: '', Gold: '', Silver: '', Emerging: '' });
      load();
    } catch { toast.error('Failed'); }
  };

  const createTournament = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) { toast.error('Name and location required'); return; }
    setSaving(true);
    try {
      await api.post('/admin/tournaments', form);
      toast.success('Tournament created!');
      setForm(EMPTY_FORM);
      setTab('approved');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const inp = { width: '100%', padding: '11px 14px', background: '#f0ebe0', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 10, color: '#eef2f7', fontSize: 14, outline: 'none', fontFamily: 'Outfit,sans-serif', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#8899aa', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 };

  return (
    <AdminLayout title="Tournaments">

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#152030', padding: 4, borderRadius: 12 }}>
        {[
          { key: 'pending',  label: `Pending (${pending.length})`,  color: pending.length > 0 ? '#ff9500' : undefined },
          { key: 'approved', label: `Live (${approved.length})` },
          { key: 'create',   label: '+ Create' },
        ].map(({ key, label, color }) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px 8px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: tab === key ? '#1a2a3a' : 'transparent', color: tab === key ? (color || '#f5c842') : (color || '#4a5a6a'), transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1,2].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>
      ) : (
        <>
          {/* ── PENDING REQUESTS ──────────────────────────────────────────── */}
          {tab === 'pending' && (
            pending.length === 0 ? (
              <div className="empty-state"><div className="icon">📋</div><div className="title">No Pending Requests</div><p>No organiser tournament requests waiting</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {pending.map(t => (
                  <div key={t.id} style={{ background: '#1a2a3a', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 16, padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: '#eef2f7', letterSpacing: 1 }}>{t.name}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', fontSize: 12, color: '#4a5a6a', marginTop: 3 }}>
                          {t.location && <span>📍 {t.location}</span>}
                          {t.startDate && <span>📅 {t.startDate}{t.endDate ? ` → ${t.endDate}` : ''}</span>}
                          {t.prizePool && <span>💰 {t.prizePool}</span>}
                          {t.organizerName && <span>👤 {t.organizerName}</span>}
                          {t.organizerPhone && <span>📱 {t.organizerPhone}</span>}
                        </div>
                        {t.description && <p style={{ fontSize: 12, color: '#4a5a6a', marginTop: 6 }}>{t.description}</p>}
                      </div>
                      <span style={{ background: 'rgba(255,149,0,0.15)', color: '#ff9500', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>PENDING</span>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={lbl}>Remarks (required for rejection)</label>
                      <input type="text" placeholder="Add notes or reason..." value={actionId === t.id ? remarks : ''} onChange={e => { setActionId(t.id); setRemarks(e.target.value); }} style={inp} />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => { setActionId(t.id); approve(t.id); }} disabled={actionId === t.id} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.3)', color: '#00e676', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                        ✅ Approve
                      </button>
                      <button onClick={() => { setActionId(t.id); reject(t.id); }} disabled={actionId === t.id} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff4444', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── APPROVED TOURNAMENTS ──────────────────────────────────────── */}
          {tab === 'approved' && (
            approved.length === 0 ? (
              <div className="empty-state"><div className="icon">🏟️</div><div className="title">No Active Tournaments</div></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {approved.map(t => {
                  const schedule = t.biddingSchedule ? (() => { try { return JSON.parse(t.biddingSchedule); } catch { return null; } })() : null;
                  return (
                    <div key={t.id} style={{ background: '#1a2a3a', border: '1px solid rgba(0,230,118,0.18)', borderRadius: 16, padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: '#eef2f7', letterSpacing: 1 }}>{t.name}</span>
                            <span style={{ background: 'rgba(0,230,118,0.12)', color: '#00e676', borderRadius: 9999, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>LIVE</span>
                          </div>
                          <div style={{ fontSize: 12, color: '#4a5a6a', marginTop: 3 }}>
                            {t.location && `📍 ${t.location}`}{t.startDate && ` · 📅 ${t.startDate}`}
                          </div>
                        </div>
                        <button onClick={() => { setScheduleFor(t.id); const s = t.biddingSchedule ? JSON.parse(t.biddingSchedule) : {}; setSchedule({ Diamond: s.Diamond || '', Gold: s.Gold || '', Silver: s.Silver || '', Emerging: s.Emerging || '' }); }}
                          style={{ padding: '6px 12px', borderRadius: 9, background: 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.25)', color: '#f5c842', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          📅 Set Schedule
                        </button>
                      </div>

                      {/* Current schedule */}
                      {schedule && (
                        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px' }}>
                          <div style={{ fontSize: 10, color: '#4a5a6a', fontWeight: 600, marginBottom: 8 }}>BIDDING SCHEDULE</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            {CATEGORIES.map(cat => schedule[cat] && (
                              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                <span>{CAT_ICONS[cat]}</span>
                                <span style={{ color: CAT_COLORS[cat], fontWeight: 600 }}>{cat}</span>
                                <span style={{ color: '#4a5a6a' }}>— {schedule[cat]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Schedule editor */}
                      {scheduleFor === t.id && (
                        <div className="fade-in" style={{ background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.15)', borderRadius: 12, padding: '14px', marginTop: 12 }}>
                          <div style={{ fontSize: 12, color: '#f5c842', fontWeight: 700, marginBottom: 12 }}>SET PER-CATEGORY BIDDING DATES</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                            {CATEGORIES.map(cat => (
                              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 16, flexShrink: 0 }}>{CAT_ICONS[cat]}</span>
                                <span style={{ minWidth: 70, fontSize: 13, fontWeight: 700, color: CAT_COLORS[cat] }}>{cat}</span>
                                <input type="date" value={schedule[cat]} onChange={e => setSchedule(s => ({ ...s, [cat]: e.target.value }))} style={{ ...inp, flex: 1, colorScheme: 'dark', fontSize: 13, padding: '8px 12px' }} />
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setScheduleFor(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(0,0,0,0.08)', color: '#8899aa', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Cancel</button>
                            <button onClick={saveSchedule} style={{ flex: 2, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: '#0a1520', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Save Schedule</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── CREATE TOURNAMENT (Admin direct) ──────────────────────────── */}
          {tab === 'create' && (
            <div style={{ background: '#1a2a3a', border: '1px solid rgba(245,200,66,0.15)', borderRadius: 18, padding: '20px' }}>
              <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: '#f5c842', letterSpacing: 1, marginBottom: 16 }}>🏟️ Create Tournament Directly</h3>
              <form onSubmit={createTournament}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>Tournament Name *</label>
                    <input type="text" placeholder="e.g. PPL 2025" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp} onFocus={e => e.target.style.borderColor = '#f5c842'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                  </div>
                  {[
                    { k: 'location',      label: 'Location *',         ph: 'City, KPK',            type: 'text' },
                    { k: 'startDate',     label: 'Start Date',         ph: '',                     type: 'date' },
                    { k: 'endDate',       label: 'End Date',           ph: '',                     type: 'date' },
                    { k: 'prizePool',     label: 'Prize Pool',         ph: 'Rs. 500,000',          type: 'text' },
                    { k: 'organizerName', label: 'Organiser Name',     ph: 'Full name',            type: 'text' },
                    { k: 'organizerPhone',label: 'Organiser Phone',    ph: '03xxxxxxxxx',          type: 'tel'  },
                  ].map(({ k, label, ph, type }) => (
                    <div key={k}>
                      <label style={lbl}>{label}</label>
                      <input type={type} placeholder={ph} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} style={{ ...inp, colorScheme: type === 'date' ? 'dark' : undefined }} onFocus={e => e.target.style.borderColor = '#f5c842'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>Description</label>
                    <textarea placeholder="Tournament details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = '#f5c842'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                  </div>
                </div>
                <button type="submit" disabled={saving} style={{ marginTop: 16, padding: '13px 28px', borderRadius: 10, background: saving ? '#ddd8ce' : 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: saving ? '#4a5a6a' : '#0a1520', fontWeight: 800, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {saving ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Saving...</> : '✓ Create Tournament'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
