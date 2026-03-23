import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import Avatar from '../../components/common/Avatar';

const CATEGORIES = ['Diamond', 'Gold', 'Silver', 'Emerging'];
const CAT_COLORS = { Diamond: '#40a9ff', Gold: '#f5c842', Silver: '#c0c0c0', Emerging: '#00e676' };
const CAT_ICONS  = { Diamond: '💎', Gold: '🥇', Silver: '🥈', Emerging: '⭐' };
const CAT_CAPS   = { Diamond: 'No cap', Gold: 'Max Rs.50k', Silver: 'Max Rs.30k', Emerging: 'Max Rs.10k' };

function fmt(sec) {
  if (sec <= 0) return '00:00:00';
  const h = Math.floor(sec / 3600).toString().padStart(2, '0');
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function AdminBidding() {
  const [tab,            setTab]            = useState('category');
  const [tournaments,    setTournaments]    = useState([]);
  const [players,        setPlayers]        = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [allSessions,    setAllSessions]    = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [actionId,       setActionId]       = useState(null);

  // Category bidding form
  const [catForm, setCatForm] = useState({ tournamentId: '', category: '' });
  const [catLoading, setCatLoading] = useState(false);

  // Individual bidding form
  const [form, setForm] = useState({ playerId: '', tournamentId: '', timerSeconds: 86400 });
  const [indLoading, setIndLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pp, tt, aa, ss] = await Promise.all([
        api.get('/admin/players?status=approved'),
        api.get('/admin/tournaments'),
        api.get('/admin/sessions/active'),
        api.get('/admin/sessions'),
      ]);
      setPlayers(Array.isArray(pp.data) ? pp.data : []);
      setTournaments(Array.isArray(tt.data) ? tt.data.filter(t => t.approvalStatus === 'approved') : []);
      setActiveSessions(Array.isArray(aa.data) ? aa.data : []);
      setAllSessions(Array.isArray(ss.data) ? ss.data : []);
    } catch {} finally { setLoading(false); }
  };

  const startCategoryBidding = async () => {
    if (!catForm.tournamentId || !catForm.category) { toast.error('Select tournament and category'); return; }
    setCatLoading(true);
    try {
      const { data } = await api.post('/admin/bidding/start-category', {
        tournamentId: catForm.tournamentId,
        category: catForm.category,
      });
      toast.success(data.message || `${catForm.category} bidding started!`);
      setCatForm({ tournamentId: '', category: '' });
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCatLoading(false); }
  };

  const startIndividual = async () => {
    if (!form.playerId || !form.tournamentId) { toast.error('Select player and tournament'); return; }
    setIndLoading(true);
    try {
      await api.post('/admin/sessions/start', { playerId: form.playerId, tournamentId: form.tournamentId, timerSeconds: Number(form.timerSeconds) });
      toast.success('Bidding session started!');
      setForm({ playerId: '', tournamentId: '', timerSeconds: 86400 });
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setIndLoading(false); }
  };

  const endSession = async (id) => {
    setActionId(id);
    try {
      await api.patch(`/admin/sessions/${id}/end`);
      toast.success('Session ended!');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionId(null); }
  };

  // Timer display for active sessions
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const iv = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(iv); }, []);

  const getTimeLeft = (session) => {
    if (!session.startedAt) return session.timerSeconds;
    const elapsed = Math.floor((now - new Date(session.startedAt).getTime()) / 1000);
    return Math.max(0, session.timerSeconds - elapsed);
  };

  const inp = { width: '100%', padding: '10px 14px', background: '#f0ebe0', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 10, color: '#eef2f7', fontSize: 14, outline: 'none', fontFamily: 'Outfit,sans-serif', boxSizing: 'border-box' };
  const sel = { ...inp, cursor: 'pointer' };

  return (
    <AdminLayout title="Bidding Control">
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: '#152030', padding: 4, borderRadius: 12, marginBottom: 20 }}>
        {[
          { key: 'category', label: '📅 By Category' },
          { key: 'individual', label: '🏏 Individual' },
          { key: 'active',   label: `🔴 Active (${activeSessions.length})` },
          { key: 'history',  label: '📋 History' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px 4px', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: tab === key ? '#1a2a3a' : 'transparent', color: tab === key ? '#f5c842' : '#4a5a6a', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── CATEGORY BIDDING ────────────────────────────────────────────────── */}
      {tab === 'category' && (
        <div>
          <div style={{ background: '#1a2a3a', border: '1px solid rgba(245,200,66,0.15)', borderRadius: 18, padding: '20px', marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: '#f5c842', marginBottom: 6 }}>Open Category Bidding</h3>
            <p style={{ color: '#4a5a6a', fontSize: 13, marginBottom: 18 }}>
              Opens 24-hour auction for ALL approved players of selected category in the tournament.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8899aa', letterSpacing: '0.8px', marginBottom: 6 }}>SELECT TOURNAMENT</label>
              <select value={catForm.tournamentId} onChange={e => setCatForm(f => ({ ...f, tournamentId: e.target.value }))} style={sel}>
                <option value="">Choose tournament...</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name} — {t.location || 'No location'}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8899aa', letterSpacing: '0.8px', marginBottom: 10 }}>SELECT CATEGORY</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {CATEGORIES.map(cat => {
                  const sel = catForm.category === cat;
                  return (
                    <button key={cat} onClick={() => setCatForm(f => ({ ...f, category: cat }))}
                      style={{ padding: '14px 12px', borderRadius: 13, border: `2px solid ${sel ? CAT_COLORS[cat] : `${CAT_COLORS[cat]}33`}`, background: sel ? `${CAT_COLORS[cat]}18` : 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 20 }}>{CAT_ICONS[cat]}</span>
                        <span style={{ fontWeight: 800, fontSize: 15, color: sel ? CAT_COLORS[cat] : '#8899aa' }}>{cat}</span>
                        {sel && <span style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', background: CAT_COLORS[cat], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 10, color: '#4a5a6a', fontWeight: 600 }}>{CAT_CAPS[cat]} · 24hr auction</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {catForm.tournamentId && catForm.category && (() => {
              const t = tournaments.find(t => t.id === catForm.tournamentId);
              const schedule = t?.biddingSchedule ? (() => { try { return JSON.parse(t.biddingSchedule); } catch { return {}; } })() : {};
              const scheduledDate = schedule[catForm.category];
              const eligible = players.filter(p => p.category === catForm.category && (p.tournament?.id === catForm.tournamentId || p.tournaments?.some?.(ts => ts.id === catForm.tournamentId)));
              return (
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#4a5a6a', fontWeight: 600, marginBottom: 8 }}>PREVIEW</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
                    <span style={{ color: '#8899aa' }}>Tournament:</span> <strong style={{ color: '#eef2f7' }}>{t?.name}</strong>
                    <span style={{ color: '#4a5a6a' }}>·</span>
                    <span style={{ color: CAT_COLORS[catForm.category], fontWeight: 700 }}>{CAT_ICONS[catForm.category]} {catForm.category}</span>
                    <span style={{ color: '#4a5a6a' }}>·</span>
                    <span style={{ color: '#eef2f7' }}>{eligible.length} eligible players</span>
                  </div>
                  {scheduledDate && <div style={{ fontSize: 12, color: '#00e676', marginTop: 4 }}>📅 Scheduled for: {scheduledDate}</div>}
                  {eligible.length === 0 && <div style={{ fontSize: 12, color: '#ff9500', marginTop: 4 }}>⚠ No approved {catForm.category} players in this tournament</div>}
                </div>
              );
            })()}

            <button onClick={startCategoryBidding} disabled={catLoading || !catForm.tournamentId || !catForm.category}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: catLoading || !catForm.tournamentId || !catForm.category ? '#ddd8ce' : `linear-gradient(135deg, ${CAT_COLORS[catForm.category] || '#f5c842'}, ${CAT_COLORS[catForm.category] || '#f5c842'}88)`, border: 'none', color: catLoading || !catForm.tournamentId || !catForm.category ? '#4a5a6a' : '#0a1520', fontSize: 16, fontWeight: 800, cursor: catLoading || !catForm.tournamentId || !catForm.category ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {catLoading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Opening...</> : `⚡ Open ${catForm.category || 'Category'} Bidding — 24 Hours`}
            </button>
          </div>

          {/* Active category sessions summary */}
          {activeSessions.length > 0 && (
            <div style={{ background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 14, padding: '14px' }}>
              <div style={{ fontSize: 11, color: '#00e676', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 10 }}>
                🔴 {activeSessions.length} ACTIVE SESSIONS
              </div>
              {/* Group by category */}
              {CATEGORIES.map(cat => {
                const catSessions = activeSessions.filter(s => s.category === cat || s.player?.category === cat);
                if (!catSessions.length) return null;
                return (
                  <div key={cat} style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: CAT_COLORS[cat], fontWeight: 700 }}>{CAT_ICONS[cat]} {cat} ({catSessions.length})</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── INDIVIDUAL PLAYER SESSION ───────────────────────────────────────── */}
      {tab === 'individual' && (
        <div style={{ background: '#1a2a3a', border: '1px solid rgba(245,200,66,0.15)', borderRadius: 18, padding: '20px' }}>
          <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: '#f5c842', marginBottom: 16 }}>Start Individual Session</h3>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8899aa', letterSpacing: '0.8px', marginBottom: 6 }}>SELECT PLAYER</label>
            <select value={form.playerId} onChange={e => setForm(f => ({ ...f, playerId: e.target.value }))} style={sel}>
              <option value="">Choose approved player...</option>
              {CATEGORIES.map(cat => {
                const catPlayers = players.filter(p => p.category === cat);
                if (!catPlayers.length) return null;
                return (
                  <optgroup key={cat} label={`${CAT_ICONS[cat]} ${cat}`}>
                    {catPlayers.map(p => <option key={p.id} value={p.id}>{p.name} — {p.skill} · Min Rs.{(p.minimumBid||0).toLocaleString()}</option>)}
                  </optgroup>
                );
              })}
            </select>
            {players.length === 0 && <span style={{ fontSize: 12, color: '#ff9500', marginTop: 4, display: 'block' }}>No approved players available</span>}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8899aa', letterSpacing: '0.8px', marginBottom: 6 }}>SELECT TOURNAMENT</label>
            <select value={form.tournamentId} onChange={e => setForm(f => ({ ...f, tournamentId: e.target.value }))} style={sel}>
              <option value="">Choose tournament...</option>
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.name} — {t.location||'—'}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8899aa', letterSpacing: '0.8px', marginBottom: 6 }}>AUCTION DURATION</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[
                { label: '1 Hour',   val: 3600 },
                { label: '6 Hours',  val: 21600 },
                { label: '12 Hours', val: 43200 },
                { label: '24 Hours', val: 86400 },
              ].map(({ label, val }) => (
                <button key={val} onClick={() => setForm(f => ({ ...f, timerSeconds: val }))}
                  style={{ padding: '8px', borderRadius: 9, border: `1.5px solid ${form.timerSeconds === val ? '#f5c842' : 'rgba(0,0,0,0.08)'}`, background: form.timerSeconds === val ? 'rgba(245,200,66,0.12)' : 'rgba(0,0,0,0.2)', color: form.timerSeconds === val ? '#f5c842' : '#8899aa', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.playerId && (() => {
            const p = players.find(pp => pp.id === form.playerId);
            return p ? (
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar src={p.profilePicture} name={p.name} size={44} radius={10} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#8899aa' }}>{p.skill} · <span style={{ color: CAT_COLORS[p.category] }}>{p.category}</span></div>
                  <div style={{ fontSize: 12, color: '#f5c842', fontWeight: 600 }}>Min: Rs.{(p.minimumBid||0).toLocaleString()}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#4a5a6a', fontWeight: 600, marginBottom: 2 }}>DURATION</div>
                  <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: '#f5c842' }}>{form.timerSeconds / 3600}h</div>
                </div>
              </div>
            ) : null;
          })()}

          <button onClick={startIndividual} disabled={indLoading || !form.playerId || !form.tournamentId}
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: indLoading || !form.playerId || !form.tournamentId ? '#ddd8ce' : 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: indLoading || !form.playerId || !form.tournamentId ? '#4a5a6a' : '#0a1520', fontSize: 16, fontWeight: 800, cursor: indLoading || !form.playerId || !form.tournamentId ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {indLoading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Starting...</> : '⚡ Start Individual Session'}
          </button>
        </div>
      )}

      {/* ── ACTIVE SESSIONS ─────────────────────────────────────────────────── */}
      {tab === 'active' && (
        activeSessions.length === 0 ? (
          <div className="empty-state"><div className="icon">⏳</div><div className="title">No Active Sessions</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Group by category */}
            {CATEGORIES.map(cat => {
              const catSessions = activeSessions.filter(s => s.category === cat || s.player?.category === cat);
              if (!catSessions.length) return null;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 16, color: CAT_COLORS[cat], letterSpacing: 1 }}>{CAT_ICONS[cat]} {cat}</span>
                    <span style={{ flex: 1, height: 1, background: `${CAT_COLORS[cat]}30` }} />
                    <span style={{ fontSize: 11, color: CAT_COLORS[cat], fontWeight: 700 }}>{catSessions.length} live</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {catSessions.map(s => {
                      const timeLeft = getTimeLeft(s);
                      const pct = Math.max(0, timeLeft / s.timerSeconds);
                      const urgent = pct < 0.1;
                      return (
                        <div key={s.id} style={{ background: '#1a2a3a', border: `1px solid ${urgent ? 'rgba(255,68,68,0.3)' : 'rgba(0,230,118,0.2)'}`, borderRadius: 16, padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                            <Avatar src={s.player?.profilePicture} name={s.player?.name} size={44} radius={10} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 15 }}>{s.player?.name}</div>
                              <div style={{ fontSize: 12, color: '#8899aa' }}>{s.player?.skill} · {s.tournament?.name}</div>
                              <div style={{ fontSize: 11, color: '#f5c842' }}>Min: Rs.{(s.player?.minimumBid||0).toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: urgent ? '#ff4444' : '#00e676', letterSpacing: 1 }}>
                                {fmt(timeLeft)}
                              </div>
                              <div style={{ fontSize: 9, color: '#4a5a6a', fontWeight: 600 }}>REMAINING</div>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 9999, marginBottom: 12, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct * 100}%`, background: urgent ? '#ff4444' : '#00e676', borderRadius: 9999, transition: 'width 1s linear' }} />
                          </div>
                          <button onClick={() => endSession(s.id)} disabled={actionId === s.id}
                            style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {actionId === s.id ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : '🔴 End & Declare Winner'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── HISTORY ─────────────────────────────────────────────────────────── */}
      {tab === 'history' && (
        allSessions.filter(s => s.status === 'ended').length === 0 ? (
          <div className="empty-state"><div className="icon">📋</div><div className="title">No Ended Sessions</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allSessions.filter(s => s.status === 'ended').map(s => (
              <div key={s.id} style={{ background: '#1a2a3a', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar src={s.player?.profilePicture} name={s.player?.name} size={40} radius={8} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.player?.name}</div>
                  <div style={{ fontSize: 11, color: '#8899aa' }}>
                    <span style={{ color: CAT_COLORS[s.category || s.player?.category] }}>{s.category || s.player?.category}</span>
                    {' · '}{s.tournament?.name}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {s.winningBid ? (
                    <>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#f5c842' }}>Rs.{s.winningBid.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: '#00e676', fontWeight: 700 }}>SOLD</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: '#ff4444', fontWeight: 600 }}>UNSOLD</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </AdminLayout>
  );
}
