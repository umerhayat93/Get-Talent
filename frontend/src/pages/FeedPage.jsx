import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { imgUrl } from '../utils/api';
import VerifiedBadge from '../components/common/VerifiedBadge';
import { useAuthStore } from '../store/authStore';

const STATUS_TABS = ['All', 'Available', 'Sold', 'Unsold', 'Pending'];
const SKILLS      = ['All', 'Batter', 'Bowler', 'All-Rounder'];
const CATEGORIES  = ['All', 'Diamond', 'Gold', 'Silver', 'Emerging'];
const STATUS_MAP  = { All: null, Available: 'approved', Sold: 'sold', Unsold: 'unsold', Pending: 'pending' };
const SKILL_ICONS = { Batter: '🏏', Bowler: '⚾', 'All-Rounder': '⚡' };

// Category gem card configurations
const CAT = {
  Diamond: {
    icon: '💎', label: 'Diamond', capLabel: 'No Bid Cap',
    bg: '#e3f2fd', border: '#90caf9', accent: '#1565c0',
    headerBg: 'linear-gradient(135deg,#1565c0,#1976d2,#42a5f5)',
    headerText: '#fff', tagBg: 'rgba(255,255,255,0.2)', tagText: '#fff',
    statBg: '#f3f9ff', statBorder: '#bbdefb', bidColor: '#1565c0',
    btnBg: '#1565c0', btnText: '#fff', cap: null,
  },
  Gold: {
    icon: '🥇', label: 'Gold', capLabel: 'Cap Rs.50k',
    bg: '#fff8e1', border: '#ffe082', accent: '#e65100',
    headerBg: 'linear-gradient(135deg,#e65100,#f57c00,#ffa726)',
    headerText: '#fff', tagBg: 'rgba(255,255,255,0.2)', tagText: '#fff',
    statBg: '#fffdf4', statBorder: '#ffe082', bidColor: '#e65100',
    btnBg: '#e65100', btnText: '#fff', cap: 50000,
  },
  Silver: {
    icon: '🥈', label: 'Silver', capLabel: 'Cap Rs.30k',
    bg: '#f5f5f5', border: '#b0bec5', accent: '#37474f',
    headerBg: 'linear-gradient(135deg,#455a64,#546e7a,#78909c)',
    headerText: '#fff', tagBg: 'rgba(255,255,255,0.18)', tagText: '#fff',
    statBg: '#f9fafb', statBorder: '#cfd8dc', bidColor: '#37474f',
    btnBg: '#455a64', btnText: '#fff', cap: 30000,
  },
  Emerging: {
    icon: '⭐', label: 'Emerging', capLabel: 'Cap Rs.10k',
    bg: '#e0f2f1', border: '#80cbc4', accent: '#00695c',
    headerBg: 'linear-gradient(135deg,#00695c,#00897b,#26a69a)',
    headerText: '#fff', tagBg: 'rgba(255,255,255,0.2)', tagText: '#fff',
    statBg: '#f4fdfb', statBorder: '#b2dfdb', bidColor: '#00695c',
    btnBg: '#00695c', btnText: '#fff', cap: 10000,
  },
};

function PlayerCard({ player, role }) {
  const navigate  = useNavigate();
  const cfg       = CAT[player.category] || CAT.Gold;
  const status    = (player.status || '').toLowerCase();
  const isApproved = status === 'approved';
  const isSold     = status === 'sold';
  const isUnsold   = status === 'unsold';
  const isPending  = status === 'pending';
  const isCaptain  = role === 'captain';
  const picUrl     = imgUrl(player.profilePicture);

  const statusChip = isSold     ? { label: 'HIRED',     bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' }
                   : isApproved ? { label: 'AVAILABLE',  bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' }
                   : isPending  ? { label: 'PENDING',    bg: '#fff8e1', color: '#e65100', border: '#ffe082' }
                   :              { label: 'UNAVAILABLE', bg: '#f5f5f5', color: '#757575', border: '#e0e0e0' };

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 0 }}>

      {/* Category header band */}
      <div style={{ background: cfg.headerBg, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 17 }}>{cfg.icon}</span>
          <span style={{ fontWeight: 800, fontSize: 13, color: cfg.headerText, letterSpacing: '0.3px' }}>{cfg.label}</span>
          <span style={{ fontSize: 10, background: cfg.tagBg, color: cfg.tagText, padding: '1px 7px', borderRadius: 9999, fontWeight: 600 }}>{cfg.capLabel}</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, background: statusChip.bg, color: statusChip.color, border: `1px solid ${statusChip.border}`, padding: '2px 8px', borderRadius: 9999 }}>
          {statusChip.label}
        </span>
      </div>

      {/* Cover photo */}
      <div onClick={() => navigate(`/player/${player.id}`)} style={{ cursor: 'pointer', position: 'relative', width: '100%', paddingBottom: '56%', background: 'linear-gradient(180deg,#87ceeb,#b0e0ff,#e0f4ff,#ffffff)', overflow: 'hidden' }}>
        {picUrl && <img src={picUrl} alt={player.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
        {!picUrl && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 42, opacity: 0.5 }}>{cfg.icon}</span>
            <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 13, color: 'rgba(0,80,160,0.5)', letterSpacing: 2 }}>Where Talent Gets Hired</span>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top,rgba(0,0,0,0.65),transparent)' }} />
        <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontWeight: 800, fontSize: 19, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>{player.name}</span>
            {isApproved && <VerifiedBadge size={19} />}
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
            {SKILL_ICONS[player.skill]} {player.skill}
            {player.tournament?.name && <span style={{ opacity: 0.7 }}> · 🏟️ {player.tournament.name}</span>}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', background: cfg.statBg, borderTop: `1px solid ${cfg.statBorder}`, borderBottom: `1px solid ${cfg.statBorder}` }}>
        {[
          { label: 'MIN BID', value: `Rs.${(player.minimumBid||0).toLocaleString()}`, color: cfg.bidColor },
          { label: 'MAX BID', value: cfg.cap ? `Rs.${cfg.cap.toLocaleString()}` : 'Unlimited', color: cfg.cap ? '#37474f' : '#1565c0' },
          { label: 'CATEGORY', value: player.category, color: cfg.accent },
        ].map(({ label, value, color }, i) => (
          <div key={label} style={{ flex: 1, padding: '9px 6px', textAlign: 'center', borderRight: i < 2 ? `1px solid ${cfg.statBorder}` : 'none' }}>
            <div style={{ fontSize: 9, color: '#65676b', fontWeight: 700, letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Hired info */}
      {isSold && (
        <div style={{ background: '#f9fff9', padding: '8px 14px', borderBottom: `1px solid ${cfg.statBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#65676b' }}>🏆 Hired by <strong style={{ color: '#2e7d32' }}>{player.soldToTeam}</strong></span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#2e7d32' }}>Rs.{(player.soldAmount||0).toLocaleString()}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', padding: '10px 12px', gap: 8, background: cfg.bg }}>
        <button onClick={() => navigate(`/player/${player.id}`)}
          style={{ flex: 1, padding: '9px', borderRadius: 9, background: '#fff', border: `1px solid ${cfg.border}`, color: cfg.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
          View Profile
        </button>
        {isApproved && (
          isCaptain ? (
            <button onClick={() => navigate('/bidding')}
              style={{ flex: 2, padding: '9px', borderRadius: 9, background: cfg.btnBg, border: 'none', color: cfg.btnText, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
              {cfg.icon} Join Bidding
            </button>
          ) : (
            <button disabled
              style={{ flex: 2, padding: '9px', borderRadius: 9, background: '#f0f2f5', border: '1px solid #e4e6ea', color: '#8a8d91', fontSize: 12, fontWeight: 600, cursor: 'not-allowed', fontFamily: 'Outfit,sans-serif' }}>
              {role === 'player' ? '👁 Watch as Player' : '👁 Watch Only'}
            </button>
          )
        )}
        {!isApproved && (
          <div style={{ flex: 2, padding: '9px', borderRadius: 9, background: '#f0f2f5', border: '1px solid #e4e6ea', color: '#8a8d91', fontSize: 11, fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit,sans-serif' }}>
            {isSold ? '🏆 Hired' : isUnsold ? 'Not Available' : 'Pending Approval'}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryDivider({ category }) {
  const cfg = CAT[category] || {};
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 12px' }}>
      <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg,${cfg.accent||'#e4e6ea'},transparent)`, borderRadius: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 16px', background: cfg.headerBg, borderRadius: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
        <span style={{ fontSize: 15 }}>{cfg.icon}</span>
        <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 15, letterSpacing: 1, color: '#fff' }}>{category}</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{cfg.capLabel}</span>
      </div>
      <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg,transparent,${cfg.accent||'#e4e6ea'})`, borderRadius: 1 }} />
    </div>
  );
}

export default function FeedPage() {
  const navigate  = useNavigate();
  const role      = useAuthStore(s => s.user?.role);
  const [players,     setPlayers]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState('All');
  const [skill,       setSkill]       = useState('All');
  const [category,    setCategory]    = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const filterRef = useRef({ tab, skill, category });
  filterRef.current = { tab, skill, category };

  const fetchPlayers = async (pageNum = 1, append = false) => {
    const { tab: t, skill: sk, category: cat } = filterRef.current;
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: '20' });
      if (sk  !== 'All') params.append('skill', sk);
      if (cat !== 'All') params.append('category', cat);
      const { data } = await api.get(`/players/feed?${params}`);
      if (!data || !Array.isArray(data.players)) { if (!append) setPlayers([]); return; }
      const statusFilter = STATUS_MAP[t];
      const filtered = statusFilter ? data.players.filter(p => (p.status||'').toLowerCase() === statusFilter) : data.players;
      if (append) setPlayers(prev => [...prev, ...filtered]);
      else setPlayers(filtered);
      setPage(pageNum);
      setHasMore(pageNum < (data.pages||1));
    } catch (err) {
      toast.error(`Failed to load: ${err?.response?.data?.message || err?.message || 'Server error'}`);
      if (!append) setPlayers([]);
    } finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => { setPlayers([]); setPage(1); setHasMore(false); fetchPlayers(1, false); }, [tab, skill, category]);

  const grouped = { Diamond: [], Gold: [], Silver: [], Emerging: [] };
  players.forEach(p => { if (grouped[p.category]) grouped[p.category].push(p); });
  const showGrouped = tab === 'All' && category === 'All';

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Sky blue page header */}
      <div style={{ background: 'linear-gradient(180deg,#e7f3ff 0%,#f0f2f5 100%)', padding: '16px 16px 12px', borderBottom: '1px solid #e4e6ea' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 480, margin: '0 auto' }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 26, letterSpacing: 1, color: '#1877f2', lineHeight: 1 }}>Players Feed</h1>
            <p style={{ color: '#65676b', fontSize: 12, marginTop: 2 }}>{players.length} players</p>
          </div>
          <button onClick={() => setShowFilters(v => !v)}
            style={{ padding: '8px 14px', borderRadius: 9, background: showFilters ? '#e7f3ff' : '#fff', border: `1px solid ${showFilters ? '#1877f2' : '#e4e6ea'}`, color: showFilters ? '#1877f2' : '#65676b', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
            {showFilters ? '✕ Close' : '⚙ Filters'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 12px 0' }}>
        {/* Filters */}
        {showFilters && (
          <div className="fade-in" style={{ background: '#fff', border: '1px solid #e4e6ea', borderRadius: 14, padding: '14px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: '#65676b', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 7 }}>SKILL</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SKILLS.map(s => <button key={s} onClick={() => setSkill(s)} style={{ padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: skill===s?'#e7f3ff':'#f0f2f5', border: `1px solid ${skill===s?'#1877f2':'#e4e6ea'}`, color: skill===s?'#1877f2':'#65676b', fontFamily: 'Outfit,sans-serif' }}>{s}</button>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#65676b', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 7 }}>CATEGORY</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIES.map(c => <button key={c} onClick={() => setCategory(c)} style={{ padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: category===c?'#e7f3ff':'#f0f2f5', border: `1px solid ${category===c?'#1877f2':'#e4e6ea'}`, color: category===c?'#1877f2':'#65676b', fontFamily: 'Outfit,sans-serif' }}>{c}</button>)}
              </div>
            </div>
          </div>
        )}

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#fff', padding: 4, borderRadius: 12, marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {STATUS_TABS.map(t => <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px 4px', borderRadius: 9, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', background: tab===t?'#1877f2':'transparent', color: tab===t?'#fff':'#65676b', transition: 'all 0.2s', whiteSpace: 'nowrap', fontFamily: 'Outfit,sans-serif' }}>{t}</button>)}
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 340, borderRadius: 16 }} />)}
          </div>
        ) : players.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏏</div>
            <div className="title">No Players Found</div>
            <p>Try adjusting your filters</p>
          </div>
        ) : showGrouped ? (
          <div>
            {['Diamond','Gold','Silver','Emerging'].map(cat => {
              const catPlayers = grouped[cat];
              if (!catPlayers.length) return null;
              return (
                <div key={cat}>
                  <CategoryDivider category={cat} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {catPlayers.map(p => <PlayerCard key={p.id} player={p} role={role} />)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {players.map(p => <PlayerCard key={p.id} player={p} role={role} />)}
          </div>
        )}

        {hasMore && (
          <button onClick={() => fetchPlayers(page+1, true)} disabled={loadingMore}
            style={{ width: '100%', marginTop: 14, padding: '12px', borderRadius: 12, background: '#fff', border: '1px solid #e4e6ea', color: '#1877f2', fontSize: 14, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Outfit,sans-serif' }}>
            {loadingMore ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Load More'}
          </button>
        )}
        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
