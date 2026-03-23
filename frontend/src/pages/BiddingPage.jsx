import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api, { imgUrl } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/common/Avatar';
import VerifiedBadge, { CheckMark } from '../components/common/VerifiedBadge';

const MAX_BIDS = 3;
const CAT_CAPS = { Diamond: null, Gold: 50000, Silver: 30000, Emerging: 10000 };
const CAT_COLORS = { Diamond: '#40a9ff', Gold: '#1877f2', Silver: '#c0c0c0', Emerging: '#00e676' };

function BidDots({ used, max }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: i < used ? 'linear-gradient(135deg,#f5c842,#e6a800)' : 'rgba(0,0,0,0.09)', border: i < used ? 'none' : '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
      ))}
    </div>
  );
}

function WinnerModal({ winner, player, onClose }) {
  if (!winner) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'linear-gradient(145deg,#fff,#f5f0e8)', border: '1px solid rgba(245,200,66,0.3)', borderRadius: 24, padding: '32px 28px', maxWidth: 360, width: '100%', textAlign: 'center' }} className="scale-in">
        <div style={{ fontSize: 64, marginBottom: 16, animation: 'bounce 0.6s ease infinite alternate' }}>🏆</div>
        <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 30, color: '#1877f2', letterSpacing: 1, marginBottom: 6 }}>AUCTION WON!</h2>
        <p style={{ color: '#65676b', fontSize: 14, marginBottom: 20 }}>
          <strong style={{ color: '#050505' }}>{winner.captain?.teamName}</strong> won <strong style={{ color: '#050505' }}>{player?.name}</strong>
        </p>
        <div style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.25)', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#65676b', fontWeight: 600, marginBottom: 6 }}>WINNING BID</div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 40, color: '#00e676', letterSpacing: -1, lineHeight: 1 }}>Rs. {winner.amount?.toLocaleString()}</div>
        </div>
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 12, padding: '14px', marginBottom: 20, textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: '#ff6666', fontSize: 13, marginBottom: 4 }}>Payment Required</div>
              <div style={{ fontSize: 12, color: '#65676b', lineHeight: 1.6 }}>
                Pay <strong style={{ color: '#1877f2' }}>Rs. {winner.amount?.toLocaleString()}</strong> to the player before tournament starts.
              </div>
              <div style={{ fontSize: 12, color: '#ff6666', marginTop: 6, fontWeight: 600 }}>Failure to pay = Permanent ban from Get Talent</div>
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ width: '100%', padding: '13px', borderRadius: 13, background: 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: '#ffffff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
          Got it — I will pay
        </button>
      </div>
      <style>{`@keyframes bounce{from{transform:translateY(0);}to{transform:translateY(-8px);}}`}</style>
    </div>
  );
}

export default function BiddingPage() {
  const role      = useAuthStore(s => s.user?.role);
  const isCaptain = role === 'captain';
  const isFan     = role === 'fan';

  const [view,             setView]             = useState('tournaments');
  const [tournaments,      setTournaments]      = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [roomPlayers,      setRoomPlayers]      = useState([]);
  const [activeSessions,   setActiveSessions]   = useState([]);
  const [activeSession,    setActiveSession]    = useState(null);
  const [bids,             setBids]             = useState([]);
  const [bidAmount,        setBidAmount]        = useState('');
  const [timeLeft,         setTimeLeft]         = useState(0);
  const [loading,          setLoading]          = useState(true);
  const [placing,          setPlacing]          = useState(false);
  const [myBidCount,       setMyBidCount]       = useState(0);
  const [winnerModal,      setWinnerModal]      = useState(null);

  const socketRef = useRef(null);
  const timerRef  = useRef(null);

  useEffect(() => {
    api.get('/tournaments/active').then(({ data }) => setTournaments(Array.isArray(data) ? data : [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTournament) return;
    loadRoom(selectedTournament.id);
    const iv = setInterval(() => loadRoom(selectedTournament.id), 8000);
    return () => clearInterval(iv);
  }, [selectedTournament?.id]);

  const loadRoom = async (tid) => {
    try {
      const [pp, ss] = await Promise.all([api.get(`/players/by-tournament/${tid}`), api.get('/bids/sessions/active')]);
      setRoomPlayers(Array.isArray(pp.data) ? pp.data : []);
      setActiveSessions((Array.isArray(ss.data) ? ss.data : []).filter(s => s.tournament?.id === tid));
    } catch {}
  };

  const joinSession = (session) => {
    setActiveSession(session); setView('bidding');
    setBids([]); setMyBidCount(0); setBidAmount('');
    connectSocket(session.id); loadBids(session.id);
    if (isCaptain) loadMyBidCount(session.id);
    const t = session.timerSeconds || 120;
    setTimeLeft(t); startTimer(t);
  };

  const leaveSession = () => {
    socketRef.current?.disconnect(); clearInterval(timerRef.current);
    setActiveSession(null); setView('room');
  };

  const loadBids = async (sid) => {
    try { const { data } = await api.get(`/bids/session/${sid}`); setBids(Array.isArray(data) ? data.sort((a, b) => b.amount - a.amount) : []); } catch {}
  };

  const loadMyBidCount = async (sid) => {
    try { const { data } = await api.get(`/bids/count/${sid}`); setMyBidCount(data.count || 0); } catch {}
  };

  const connectSocket = (sid) => {
    try {
      const wsBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://get-talent-api.onrender.com';
      const socket = io(wsBase + '/bidding', { path: '/socket.io', transports: ['polling', 'websocket'] });
      socket.on('connect', () => socket.emit('joinSession', { sessionId: sid }));
      socket.on('newBid', (bid) => setBids(prev => [{ ...bid, highlight: true }, ...prev.filter(b => b.captain?.id !== bid.captain?.id)].sort((a, b) => b.amount - a.amount)));
      socket.on('sessionEnded', () => {
        clearInterval(timerRef.current); setTimeLeft(0);
        setBids(prev => { if (prev[0]) setWinnerModal(prev[0]); return prev; });
        toast('⏰ Bidding ended!', { icon: '🏆', duration: 4000 });
      });
      socket.on('timerUpdate', ({ secondsLeft }) => setTimeLeft(secondsLeft));
      socketRef.current = socket;
    } catch {}
  };

  const startTimer = (s) => {
    clearInterval(timerRef.current); let t = s;
    timerRef.current = setInterval(() => { t--; setTimeLeft(t); if (t <= 0) clearInterval(timerRef.current); }, 1000);
  };

  const handleBid = async () => {
    if (!isCaptain) { toast.error('Only captains can place bids'); return; }
    if (myBidCount >= MAX_BIDS) { toast.error(`Used all ${MAX_BIDS} bids`); return; }
    const amount = Number(bidAmount);
    if (!amount) { toast.error('Enter bid amount'); return; }
    const minBid = activeSession?.player?.minimumBid || 0;
    const cap    = CAT_CAPS[activeSession?.player?.category];
    if (amount < minBid) { toast.error(`Min bid Rs. ${minBid.toLocaleString()}`); return; }
    if (cap !== null && cap !== undefined && amount > cap) {
      toast.error(`${activeSession.player.category} cap is Rs. ${cap.toLocaleString()}`);
      return;
    }
    setPlacing(true);
    try {
      const { data } = await api.post('/bids', { sessionId: activeSession.id, amount });
      toast.success(`Bid: Rs. ${amount.toLocaleString()}`);
      setBidAmount('');
      setMyBidCount(data.captainBidsUsed || myBidCount + 1);
      await loadBids(activeSession.id);
    } catch (err) {
      const msg = err.response?.data?.message || 'Bid failed';
      // Make canBid error very visible
      if (msg.includes('not enabled') || msg.includes('subscription') || msg.includes('approve')) {
        toast.error('Bidding blocked: Admin must approve your account & enable bidding for you', { duration: 5000 });
      } else {
        toast.error(msg);
      }
    } finally { setPlacing(false); }
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const timerColor = timeLeft <= 10 ? '#ff4444' : timeLeft <= 30 ? '#ff9500' : '#00e676';
  const topBid     = bids[0];
  const bidsLeft   = MAX_BIDS - myBidCount;
  const bidLimitReached = isCaptain && myBidCount >= MAX_BIDS;
  const playerCap  = activeSession ? CAT_CAPS[activeSession.player?.category] : undefined;
  const catColor   = activeSession ? CAT_COLORS[activeSession.player?.category] || '#1877f2' : '#1877f2';

  // ── TOURNAMENT LIST ────────────────────────────────────────────────────────
  if (view === 'tournaments') return (
    <div className="page">
      <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, letterSpacing: 1, lineHeight: 1, marginBottom: 4 }}>Bidding Rooms</h1>
      <p style={{ color: '#65676b', fontSize: 13, marginBottom: 20 }}>Select a tournament to enter its live auction room</p>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 18 }} />)}</div>
      ) : tournaments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏟️</div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: '#8a8d91', letterSpacing: 1 }}>No Active Tournaments</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tournaments.map(t => (
            <div key={t.id} onClick={() => { setSelectedTournament(t); setView('room'); }}
              style={{ background: 'linear-gradient(145deg,#fff,#f5f0e8)', border: '1px solid rgba(245,200,66,0.18)', borderRadius: 18, padding: '18px 16px', cursor: 'pointer', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: '#1877f2', letterSpacing: 1, lineHeight: 1 }}>{t.name}</div>
                  {t.description && <div style={{ fontSize: 13, color: '#65676b', marginTop: 2 }}>{t.description}</div>}
                </div>
                <span style={{ background: 'rgba(0,230,118,0.12)', color: '#00e676', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999 }}>OPEN</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: 12, color: '#8a8d91' }}>
                {t.location && <span>📍 {t.location}</span>}
                {t.startDate && <span>📅 {t.startDate}{t.endDate ? ` → ${t.endDate}` : ''}</span>}
                {t.prizePool && <span>💰 {t.prizePool}</span>}
              </div>
              <div style={{ marginTop: 12, textAlign: 'right', fontSize: 12, color: '#1877f2', fontWeight: 600 }}>Enter Bidding Room →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── TOURNAMENT ROOM ────────────────────────────────────────────────────────
  if (view === 'room') {
    const t = selectedTournament;
    return (
      <div style={{ paddingBottom: 90 }}>
        <div style={{ background: 'linear-gradient(180deg,#ede8df,transparent)', padding: '12px 16px 16px' }}>
          <button onClick={() => { setView('tournaments'); setSelectedTournament(null); }} style={{ background: 'none', border: 'none', color: '#65676b', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 10 }}>← All Tournaments</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 26, color: '#1877f2', letterSpacing: 1, lineHeight: 1 }}>{t?.name} Bidding Room</h1>
              {t?.location && <div style={{ fontSize: 13, color: '#8a8d91', marginTop: 2 }}>📍 {t.location}</div>}
            </div>
            {activeSessions.length > 0 && <span style={{ background: 'rgba(0,230,118,0.12)', color: '#00e676', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', animation: 'pulse 1.5s infinite' }} />{activeSessions.length} LIVE</span>}
          </div>
        </div>

        {activeSessions.length > 0 && (
          <div style={{ margin: '0 16px 16px' }}>
            <div style={{ fontSize: 11, color: '#00e676', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 8 }}>🔴 LIVE AUCTIONS</div>
            {activeSessions.map(s => (
              <div key={s.id} onClick={() => joinSession(s)} style={{ background: 'linear-gradient(135deg,#0f2d1e,#1a3a28)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: '#f0f2f5', border: '2px solid rgba(0,230,118,0.25)', flexShrink: 0 }}>
                  {s.player?.profilePicture ? <img src={imgUrl(s.player?.profilePicture)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',cursive", fontSize: 16, color: '#1877f2' }}>GT</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{s.player?.name}</span>
                    <VerifiedBadge size={13} />
                  </div>
                  <div style={{ fontSize: 12, color: '#65676b' }}>{s.player?.skill} · {s.player?.category} · Min Rs.{(s.player?.minimumBid || 0).toLocaleString()}</div>
                </div>
                <div style={{ background: 'rgba(0,230,118,0.15)', color: '#00e676', borderRadius: 9999, padding: '5px 12px', fontSize: 12, fontWeight: 700 }}>JOIN →</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '0 16px' }}>
          <div style={{ fontSize: 11, color: '#8a8d91', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 10 }}>REGISTERED PLAYERS ({roomPlayers.length})</div>
          {roomPlayers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8a8d91' }}><div style={{ fontSize: 40, marginBottom: 10 }}>🏏</div>No approved players yet</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {roomPlayers.map(p => {
                const cc = CAT_COLORS[p.category] || '#1877f2';
                const liveSession = activeSessions.find(s => s.player?.id === p.id);
                const cap = CAT_CAPS[p.category];
                return (
                  <div key={p.id} onClick={() => liveSession ? joinSession(liveSession) : null}
                    style={{ background: '#ffffff', border: `1px solid ${liveSession ? 'rgba(0,230,118,0.3)' : `${cc}22`}`, borderRadius: 14, overflow: 'hidden', cursor: liveSession ? 'pointer' : 'default', position: 'relative', transition: 'transform 0.15s' }}
                    onMouseEnter={e => liveSession && (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}>
                    {liveSession && <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,230,118,0.15)', color: '#00e676', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 9999 }}>LIVE</div>}
                    <div style={{ height: 2, background: `linear-gradient(90deg,${cc},transparent)` }} />
                    <div style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: 11, overflow: 'hidden', border: `2px solid ${cc}33`, background: '#f0ebe0', margin: '0 auto 8px', flexShrink: 0 }}>
                        {p.profilePicture ? <img src={imgUrl(p.profilePicture)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : null}
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',cursive", fontSize: 19, color: '#1877f2' }}>GT</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 75 }}>{p.name}</span>
                        <VerifiedBadge size={12} />
                      </div>
                      <div style={{ fontSize: 10, color: cc, fontWeight: 700, marginBottom: 2 }}>{p.category}</div>
                      <div style={{ fontSize: 11, color: '#1877f2', fontWeight: 600 }}>Rs. {(p.minimumBid || 0).toLocaleString()}</div>
                      <div style={{ fontSize: 9, color: '#8a8d91', marginTop: 2 }}>
                        {cap === null ? '💎 No cap' : `Max Rs.${(cap / 1000)}k`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}`}</style>
      </div>
    );
  }

  // ── ACTIVE BIDDING SESSION ─────────────────────────────────────────────────
  const player = activeSession?.player;
  const isDiamond = player?.category === 'Diamond';

  return (
    <div style={{ paddingBottom: isCaptain && !bidLimitReached ? 150 : 90 }}>
      <div style={{ padding: '12px 16px 0' }}>
        <button onClick={leaveSession} style={{ background: 'none', border: 'none', color: '#65676b', cursor: 'pointer', fontSize: 13, padding: 0 }}>← Back to room</button>
      </div>

      {/* Category cap badge */}
      <div style={{ margin: '10px 16px 0', display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 9999, background: isDiamond ? 'rgba(64,169,255,0.12)' : 'rgba(0,0,0,0.06)', color: isDiamond ? '#40a9ff' : '#6a7080', border: `1px solid ${isDiamond ? 'rgba(64,169,255,0.3)' : 'rgba(0,0,0,0.08)'}` }}>
          {isDiamond ? '💎 Diamond — No Bid Cap' : `${player?.category} — Max Rs. ${(playerCap || 0).toLocaleString()}`}
        </span>
      </div>

      {/* Highest bid hero */}
      <div style={{ margin: '10px 16px', background: isDiamond ? 'linear-gradient(135deg,#0a1e35,#0d2440)' : 'linear-gradient(135deg,#0f2d1e,#1a3a28)', border: `1px solid ${isDiamond ? 'rgba(64,169,255,0.25)' : 'rgba(0,230,118,0.25)'}`, borderRadius: 20, padding: '16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: isDiamond ? 'rgba(64,169,255,0.08)' : 'rgba(0,230,118,0.08)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: isDiamond ? '#40a9ff' : '#00e676', fontWeight: 700, letterSpacing: '1px' }}>HIGHEST BID</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 9999, padding: '4px 12px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: timerColor, animation: timeLeft > 0 ? 'pulse 1s infinite' : 'none' }} />
            <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: timerColor, letterSpacing: 1 }}>{timeLeft <= 0 ? 'ENDED' : `${mins}:${secs}`}</span>
          </div>
        </div>
        {topBid ? (
          <>
            <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 42, color: isDiamond ? '#40a9ff' : '#00e676', letterSpacing: -1, lineHeight: 1, marginBottom: 6 }}>
              Rs. {topBid.amount?.toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckMark size={16} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>{topBid.captain?.teamName}</span>
            </div>
          </>
        ) : (
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: '#8a8d91' }}>No bids yet!</div>
        )}
        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.07)', borderRadius: 10, padding: '6px 12px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: '#050505', lineHeight: 1 }}>{bids.length}</div>
          <div style={{ fontSize: 9, color: '#8a8d91', fontWeight: 600 }}>BIDS</div>
        </div>
      </div>

      {/* Player strip */}
      <div style={{ margin: '0 16px 14px', display: 'flex', gap: 12, alignItems: 'center', background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '12px 14px' }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', border: `2px solid ${catColor}44`, background: '#f0ebe0', flexShrink: 0 }}>
          {player?.profilePicture ? <img src={imgUrl(player.profilePicture)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',cursive", fontSize: 18, color: '#1877f2' }}>GT</div>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontWeight: 800, fontSize: 15 }}>{player?.name}</span><VerifiedBadge size={14} /></div>
          <div style={{ fontSize: 12, color: '#65676b' }}>{player?.skill} · <span style={{ color: catColor, fontWeight: 700 }}>{player?.category}</span></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: 11, color: '#1877f2', fontWeight: 600 }}>Min: Rs.{(player?.minimumBid || 0).toLocaleString()}</span>
            <span style={{ fontSize: 11, color: isDiamond ? '#40a9ff' : '#9090a8', fontWeight: 600 }}>{isDiamond ? '· No cap 💎' : `· Max: Rs.${(playerCap || 0).toLocaleString()}`}</span>
          </div>
        </div>
        {isCaptain && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#8a8d91', fontWeight: 600, marginBottom: 4 }}>MY BIDS</div>
            <BidDots used={myBidCount} max={MAX_BIDS} />
            <div style={{ fontSize: 10, marginTop: 3, color: bidLimitReached ? '#ff4444' : '#6a7080', fontWeight: 600 }}>{bidLimitReached ? 'LIMIT' : `${bidsLeft} left`}</div>
          </div>
        )}
      </div>

      {/* Bids list */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 11, color: '#8a8d91', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 10 }}>ALL BIDS ({bids.length})</div>
        {bids.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: '#8a8d91', background: 'rgba(255,255,255,0.02)', borderRadius: 12, fontSize: 14 }}>No bids yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bids.map((bid, i) => (
              <div key={bid.id} style={{ background: bid.isWinning ? 'rgba(0,230,118,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${bid.isWinning ? 'rgba(0,230,118,0.25)' : 'rgba(0,0,0,0.06)'}`, borderRadius: 12, padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: bid.highlight ? 'bidSlideIn 0.4s ease' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,#f5c842,#e6a800)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',cursive", fontSize: 12, color: i === 0 ? '#ffffff' : '#9090a8', flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: bid.isWinning ? '#1a1a2e' : '#6a7080' }}>{bid.captain?.teamName}</span>
                      {bid.isWinning && <CheckMark size={14} />}
                    </div>
                    <div style={{ fontSize: 11, color: '#8a8d91' }}>{bid.captain?.name}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: bid.isWinning ? '#00e676' : '#1a1a2e' }}>Rs. {bid.amount?.toLocaleString()}</div>
                  {bid.isWinning && <div style={{ fontSize: 9, color: '#00e676', fontWeight: 700 }}>LEADING</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bid input */}
      {isCaptain && timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: 72, left: 0, right: 0, padding: '12px 16px', background: 'rgba(10,21,32,0.98)', backdropFilter: 'blur(16px)', borderTop: `1px solid ${bidLimitReached ? 'rgba(255,68,68,0.25)' : `${catColor}25`}` }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            {bidLimitReached ? (
              <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🚫</span>
                <div><div style={{ fontWeight: 700, fontSize: 14, color: '#ff6666' }}>Bid Limit Reached</div><div style={{ fontSize: 12, color: '#8a8d91' }}>Used all {MAX_BIDS} bids for this player</div></div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <div style={{ fontSize: 11, color: '#65676b', fontWeight: 600 }}>
                    {isDiamond ? <span style={{ color: '#40a9ff' }}>💎 No bid cap</span> : `Max Rs. ${(playerCap || 0).toLocaleString()}`}
                    {topBid && <span style={{ color: '#8a8d91' }}> · beat Rs.{topBid.amount.toLocaleString()}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <BidDots used={myBidCount} max={MAX_BIDS} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: bidsLeft === 1 ? '#ff9500' : '#1877f2' }}>{bidsLeft}/{MAX_BIDS}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#65676b', fontSize: 14, fontWeight: 600, pointerEvents: 'none' }}>Rs.</span>
                    <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                      placeholder={(topBid ? topBid.amount + 1000 : player?.minimumBid || 0).toString()}
                      min={player?.minimumBid || 0}
                      max={playerCap || undefined}
                      style={{ width: '100%', paddingLeft: 44, paddingRight: 12, paddingTop: 13, paddingBottom: 13, background: '#f0f2f5', border: `1.5px solid ${catColor}44`, borderRadius: 12, color: '#050505', fontSize: 16, fontWeight: 700, outline: 'none', fontFamily: 'Outfit,sans-serif', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = catColor}
                      onBlur={e => e.target.style.borderColor = catColor + '44'}
                      onKeyDown={e => e.key === 'Enter' && handleBid()} />
                  </div>
                  <button onClick={handleBid} disabled={placing || !bidAmount}
                    style={{ padding: '13px 20px', borderRadius: 12, background: placing || !bidAmount ? '#e4e6ea' : `linear-gradient(135deg, ${catColor}, ${catColor}bb)`, border: 'none', color: placing || !bidAmount ? '#9090a8' : '#ffffff', fontWeight: 800, fontSize: 15, cursor: placing || !bidAmount ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, minWidth: 90 }}>
                    {placing ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '⚡ BID'}
                  </button>
                </div>
                {bidsLeft === 1 && <div style={{ fontSize: 11, color: '#ff9500', marginTop: 5, textAlign: 'center', fontWeight: 600 }}>⚠ Last bid!</div>}
              </>
            )}
          </div>
        </div>
      )}

      {(isFan || role === 'player') && (
        <div style={{ margin: '16px', padding: '12px 16px', background: 'rgba(64,169,255,0.06)', border: '1px solid rgba(64,169,255,0.12)', borderRadius: 12, textAlign: 'center', fontSize: 13, color: '#65676b' }}>
          {isFan ? '👀 Watching as fan' : '🏏 Watching as player'}
        </div>
      )}

      {winnerModal && <WinnerModal winner={winnerModal} player={player} onClose={() => setWinnerModal(null)} />}

      <style>{`
        @keyframes bidSlideIn{from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:none;}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
      `}</style>
    </div>
  );
}
