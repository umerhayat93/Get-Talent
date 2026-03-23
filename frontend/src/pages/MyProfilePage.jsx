import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api, { uploadFile, imgUrl } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import PaymentModal from '../components/common/PaymentModal';
import VerifiedBadge, { CheckMark } from '../components/common/VerifiedBadge';
import { requestNotificationPermission, registerPushNotifications } from '../utils/push';

const CATEGORY_FEES = { Diamond: 10000, Gold: 7000, Silver: 5000, Emerging: 3000 };
const CATEGORY_CAPS = { Diamond: null, Gold: 50000, Silver: 30000, Emerging: 10000 };

// ── Profile Picture Modal ─────────────────────────────────────────────────────
function ProfilePicModal({ onClose, onSave, currentSrc }) {
  const [preview, setPreview] = useState(currentSrc || null);
  const [file, setFile]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { toast.error('Select an image file'); return; }
    if (f.size > 8 * 1024 * 1024) { toast.error('Max 8MB'); return; }
    setFile(f);
    const r = new FileReader();
    r.onload = (e) => setPreview(e.target.result);
    r.readAsDataURL(f);
  };

  const handleSave = async () => {
    if (!file) return;
    setUploading(true);
    try { await onSave(file); onClose(); } finally { setUploading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#ffffff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, padding: '0 0 32px', border: '1px solid rgba(245,200,66,0.15)', borderBottom: 'none' }}>
        <div style={{ padding: '16px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, background: 'rgba(0,0,0,0.12)', borderRadius: 4 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
          <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: 1, color: '#050505', margin: 0 }}>Profile Photo</h3>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#65676b', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: '0 20px', marginBottom: 20 }}>
          {preview ? (
            <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: 16, overflow: 'hidden', background: '#f0f2f5' }}>
              <img src={preview} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => { setPreview(null); setFile(null); }} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          ) : (
            <div onClick={() => inputRef.current.click()} style={{ width: '100%', paddingBottom: '100%', position: 'relative', borderRadius: 16, border: '2px dashed rgba(0,0,0,0.10)', background: '#f0f2f5', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📷</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#050505', marginBottom: 4 }}>Tap to upload</div>
                  <div style={{ fontSize: 12, color: '#65676b' }}>Square photo works best · Max 8MB</div>
                </div>
              </div>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
        </div>
        <div style={{ padding: '0 20px', display: 'flex', gap: 10 }}>
          {preview && <button onClick={() => inputRef.current.click()} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(0,0,0,0.09)', color: '#65676b', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Change</button>}
          <button onClick={file ? handleSave : () => inputRef.current.click()} disabled={uploading}
            style={{ flex: 2, padding: '14px', borderRadius: 12, background: uploading ? '#e4e6ea' : 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: uploading ? '#9090a8' : '#ffffff', fontWeight: 800, fontSize: 15, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {uploading ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: '#888', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Uploading...</> : file ? 'Save Photo' : 'Choose Photo'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function MyProfilePage() {
  const userId    = useAuthStore(s => s.user?.id);
  const role      = useAuthStore(s => s.user?.role);
  const setProfileStore = useAuthStore(s => s.setProfile);

  const isPlayer  = role === 'player';
  const isCaptain = role === 'captain';
  const isFan     = role === 'fan';

  // Always use LOCAL state — never rely on store.profile which can be stale
  const [data,           setData]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [editing,        setEditing]        = useState(false);
  const [form,           setForm]           = useState({});
  const [saving,         setSaving]         = useState(false);
  const [showPayment,    setShowPayment]    = useState(false);
  const [showPicModal,   setShowPicModal]   = useState(false);
  const [pushEnabled,    setPushEnabled]    = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );
  const [originalMinBid, setOriginalMinBid] = useState(null);
  const [tournaments,    setTournaments]    = useState([]);
  const [joiningTid,     setJoiningTid]     = useState(null);
  const [reAuctioning,   setReAuctioning]   = useState(false);
  const [showReAuctionFee, setShowReAuctionFee] = useState(false);

  // Load fresh profile data from API every time the page mounts
  useEffect(() => { loadProfile(); }, []);
  useEffect(() => {
    if (isPlayer) {
      api.get('/tournaments/active')
        .then(({ data: d }) => setTournaments(Array.isArray(d) ? d : []))
        .catch(() => {});
    }
  }, [isPlayer]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Always fetch fresh — never use cached store data for status display
      const { data: d } = await api.get('/auth/profile');
      setData(d);
      setProfileStore(d); // also update store for other components
      if (d.player) {
        setForm({ name: d.player.name || '', phone: d.player.phone || '', address: d.player.address || '', minimumBid: d.player.minimumBid || 0 });
        setOriginalMinBid(d.player.minimumBid || 0);
      }
      if (d.captain) {
        setForm({ name: d.captain.name || '', phone: d.captain.phone || '', teamName: d.captain.teamName || '' });
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isPlayer) {
        const newBid = Number(form.minimumBid);
        if (newBid < originalMinBid) {
          toast.error(`Min bid cannot go below Rs. ${originalMinBid.toLocaleString()}`);
          setSaving(false);
          return;
        }
        await api.patch('/players/profile', form);
      }
      toast.success('Profile updated!');
      await loadProfile();
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePicSave = async (file) => {
    // All roles upload to /users/profile-picture — simpler unified endpoint
    // Players and captains also update their sub-profile
    let endpoint = '/users/profile-picture';
    if (isPlayer)  endpoint = '/players/profile-picture';
    if (isCaptain) endpoint = '/captains/profile-picture';
    // fans and organisers use /users/profile-picture (handled by auth controller)
    try {
      await uploadFile(endpoint, file);
      toast.success('Profile photo updated!');
      await loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleReAuction = async () => {
    setReAuctioning(true);
    try {
      const { data: result } = await api.post('/players/re-auction');
      toast.success(result.message);
      setShowReAuctionFee(true);
      await loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setReAuctioning(false);
    }
  };

  const handleJoinTournament = async (tid) => {
    setJoiningTid(tid);
    try {
      await api.post(`/players/join-tournament/${tid}`);
      toast.success('Joined!');
      await loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setJoiningTid(null);
    }
  };

  const handleLeaveTournament = async (tid) => {
    try {
      await api.delete(`/players/leave-tournament/${tid}`);
      toast.success('Left tournament');
      await loadProfile();
    } catch {
      toast.error('Failed');
    }
  };

  const handleEnablePush = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      const ok = await registerPushNotifications(userId);
      if (ok) { setPushEnabled(true); toast.success('Notifications enabled!'); }
      else toast.error('Requires HTTPS');
    } else if (perm === 'denied') {
      toast.error('Blocked in browser settings');
    }
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );

  // All derived values from FRESH local data — never from store
  const player   = data?.player;
  const captain  = data?.captain;
  const profile  = player || captain;

  // Status is whatever the DB says RIGHT NOW (fresh from loadProfile)
  const playerStatus  = player?.status?.toLowerCase() || '';
  const captainStatus = captain?.status?.toLowerCase() || '';
  const profileStatus = profile ? (player ? playerStatus : captainStatus) : '';

  const isApproved = profileStatus === 'approved' || profileStatus === 'sold';
  const isPending  = profileStatus === 'pending';
  const isRejected = profileStatus === 'rejected';

  const picSrc = data?.user?.profilePicture || player?.profilePicture || captain?.profilePicture;
  const reAuctionFee = CATEGORY_FEES[player?.category] || 0;
  const catCap = CATEGORY_CAPS[player?.category];
  const joinedTid = player?.tournament?.id;

  // Only show re-auction for sold/unsold players
  const canReAuction = isPlayer && (playerStatus === 'sold' || playerStatus === 'unsold');

  // Payment notice: only show if PENDING status AND paymentStatus is not yet verified
  // NEVER show for approved players — they are verified
  const showPaymentNotice = isPlayer && !isApproved &&
    player?.paymentStatus !== 'verified' &&
    player?.paymentStatus !== 're-auction-pending';

  const isReAuctionPending = player?.paymentStatus === 're-auction-pending';

  const statusColors = { approved: '#00e676', pending: '#ff9500', rejected: '#ff4444', banned: '#ff4444', sold: '#1877f2', unsold: '#6a7080' };
  const statusLabels = { approved: 'Verified', pending: 'Pending Approval', rejected: 'Rejected', banned: 'Banned', sold: 'Sold', unsold: 'Unsold' };

  const inp = { width: '100%', padding: '11px 14px', background: '#f0f2f5', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 10, color: '#050505', fontSize: 14, outline: 'none', fontFamily: 'Outfit,sans-serif', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#65676b', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 };

  return (
    <div className="page">
      <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, letterSpacing: 1, marginBottom: 20 }}>My Profile</h1>

      {/* ── Profile Hero ──────────────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', border: '1px solid rgba(245,200,66,0.1)', borderRadius: 20, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ height: 80, background: 'linear-gradient(180deg,#1877f2,#4293f5,#e7f3ff)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at 20% 50%,#f5c842 0%,transparent 50%),radial-gradient(circle at 80% 50%,#40a9ff 0%,transparent 50%)' }} />
        </div>
        <div style={{ padding: '0 18px 20px', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginTop: -44 }}>
            <div style={{ width: 88, height: 88, borderRadius: 16, overflow: 'hidden', border: '3px solid #ede8df', background: '#f0f2f5' }}>
              {picSrc
                ? <img src={imgUrl(picSrc)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                : null}
              <div style={{ width: '100%', height: '100%', display: picSrc ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: '#1877f2' }}>GT</div>
            </div>
            <button onClick={() => setShowPicModal(true)} style={{ position: 'absolute', bottom: -6, right: -6, width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#f5c842,#e6a800)', border: '2px solid #ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>📷</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 20 }}>{data?.user?.name}</span>
              {/* Blue badge ONLY for verified/approved */}
              {isApproved && <VerifiedBadge size={20} />}
            </div>
            <div style={{ fontSize: 12, color: '#65676b', textTransform: 'capitalize', marginBottom: 6 }}>
              {isFan ? '👀 Fan' : role}
            </div>
            {profile && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: statusColors[profileStatus] || '#6a7080', background: `${statusColors[profileStatus] || '#6a7080'}18`, padding: '3px 10px', borderRadius: 9999 }}>
                {isApproved && <VerifiedBadge size={12} />}
                {statusLabels[profileStatus] || profileStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Pending notice — ONLY for genuinely pending accounts ─────────── */}
      {isPending && !isReAuctionPending && (
        <div style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>⏳</span>
          <div>
            <div style={{ fontWeight: 700, color: '#ff9500', fontSize: 14, marginBottom: 3 }}>Pending Admin Approval</div>
            <div style={{ fontSize: 13, color: '#65676b', lineHeight: 1.5 }}>
              {isPlayer
                ? 'Once approved, you will get a blue verification badge and can join tournaments.'
                : 'Once approved, pay subscription to enable bidding.'}
            </div>
          </div>
        </div>
      )}

      {/* Rejected notice */}
      {isRejected && (
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 14, display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 20 }}>❌</span>
          <div>
            <div style={{ fontWeight: 700, color: '#ff6666', fontSize: 14, marginBottom: 3 }}>Registration Rejected</div>
            {profile?.remarks && <div style={{ fontSize: 13, color: '#65676b' }}>Reason: {profile.remarks}</div>}
          </div>
        </div>
      )}

      {/* Approved success notice — shows briefly, then disappears */}
      {isApproved && !isPending && (
        <div style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.18)', borderRadius: 14, padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          <VerifiedBadge size={18} />
          <div style={{ fontSize: 13, color: '#00e676', fontWeight: 600 }}>
            {isPlayer ? 'Your profile is verified — join tournaments to enter bidding!' : 'Account verified — pay subscription to start bidding!'}
          </div>
        </div>
      )}

      {/* ── Player stats ───────────────────────────────────────────────── */}
      {player && (
        <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#65676b', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 12 }}>PLAYER STATS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: playerStatus === 'sold' ? 10 : 0 }}>
            {[
              { label: 'Category',  value: player.category,                                        color: player.category === 'Diamond' ? '#40a9ff' : '#1877f2' },
              { label: 'Skill',     value: player.skill,                                            color: '#050505' },
              { label: 'Min Bid',   value: `Rs. ${(player.minimumBid || 0).toLocaleString()}`,     color: '#1877f2' },
              { label: 'Bid Cap',   value: catCap === null ? '∞ No Cap' : `Rs. ${catCap.toLocaleString()}`, color: catCap === null ? '#40a9ff' : '#6a7080' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#65676b', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 3 }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>
          {playerStatus === 'sold' && (
            <div style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.18)', borderRadius: 10, padding: '10px 12px', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}><CheckMark size={14} /><span style={{ fontSize: 12, fontWeight: 700, color: '#1877f2' }}>Sold to {player.soldToTeam}</span></div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#00e676' }}>Rs. {(player.soldAmount || 0).toLocaleString()}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Re-auction ─────────────────────────────────────────────────── */}
      {canReAuction && (
        <div style={{ background: 'linear-gradient(135deg,#fff,#f5f0e8)', border: 'rgba(245,200,66,0.25) 1px solid', borderRadius: 16, padding: '18px', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 22 }}>🔄</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Re-register for Auction</div>
              <div style={{ fontSize: 12, color: '#65676b', marginTop: 1 }}>
                {playerStatus === 'sold' ? 'You were sold. Re-register to enter the next auction.' : 'You were unsold. Re-register to try again.'}
              </div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.15)', borderRadius: 10, padding: '10px 12px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#65676b' }}>Re-registration Fee ({player.category})</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#1877f2' }}>Rs. {reAuctionFee.toLocaleString()}</span>
          </div>
          {isReAuctionPending ? (
            <button onClick={() => setShowPayment(true)} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: '#ffffff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              Pay Re-registration Fee — Rs. {reAuctionFee.toLocaleString()}
            </button>
          ) : (
            <button onClick={handleReAuction} disabled={reAuctioning} style={{ width: '100%', padding: '12px', borderRadius: 12, background: reAuctioning ? '#e4e6ea' : 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.3)', color: reAuctioning ? '#9090a8' : '#1877f2', fontWeight: 700, fontSize: 14, cursor: reAuctioning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {reAuctioning ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#888', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Processing...</> : '🔄 Request Re-auction'}
            </button>
          )}
        </div>
      )}

      {/* ── Tournament joining — approved players only ─────────────────── */}
      {isPlayer && isApproved && (
        <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#65676b', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 12 }}>MY TOURNAMENT</div>
          {joinedTid && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(0,230,118,0.08)', borderRadius: 12, border: '1px solid rgba(0,230,118,0.2)', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckMark size={14} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{player.tournament?.name}</span>
              </div>
              <button onClick={() => handleLeaveTournament(joinedTid)} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff6666', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Leave</button>
            </div>
          )}
          {tournaments.length === 0 ? (
            <div style={{ fontSize: 13, color: '#65676b', textAlign: 'center', padding: '8px 0' }}>No active tournaments available</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {tournaments.filter(t => t.id !== joinedTid).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</span>
                    {t.location && <span style={{ fontSize: 11, color: '#65676b', marginLeft: 8 }}>📍 {t.location}</span>}
                  </div>
                  <button onClick={() => handleJoinTournament(t.id)} disabled={joiningTid === t.id} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.25)', color: '#00e676', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {joiningTid === t.id ? '...' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Payment notice — ONLY when actually unpaid and not yet approved ─ */}
      {showPaymentNotice && (
        <div style={{ background: player?.paymentStatus === 'submitted' ? 'rgba(64,169,255,0.07)' : 'rgba(255,149,0,0.07)', border: `1px solid ${player?.paymentStatus === 'submitted' ? 'rgba(64,169,255,0.18)' : 'rgba(255,149,0,0.18)'}`, borderRadius: 12, padding: '12px 14px', marginBottom: 14, fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: player?.paymentStatus === 'submitted' ? '#40a9ff' : '#ff9500', marginBottom: 6 }}>
            {player?.paymentStatus === 'submitted' ? '⏳ Payment under review (1–3 days)' : '💳 Registration fee not paid'}
          </div>
          {player?.paymentStatus === 'pending' && (
            <button onClick={() => setShowPayment(true)} style={{ padding: '7px 14px', borderRadius: 8, background: 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
              Pay Now — Rs. {(player?.registrationFee || 0).toLocaleString()}
            </button>
          )}
        </div>
      )}

      {/* ── Captain info ───────────────────────────────────────────────── */}
      {captain && (
        <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#65676b', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 12 }}>TEAM INFO</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1877f2', marginBottom: 10 }}>🏆 {captain.teamName}</div>
          <div style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckMark size={14} />
            <span style={{ fontSize: 12, color: '#65676b' }}>Captain registration is <strong style={{ color: '#00e676' }}>lifetime</strong> — no recurring fees</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: captain.subscriptionPaid ? 0 : 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: captain.canBid ? 'rgba(0,230,118,0.1)' : 'rgba(255,149,0,0.1)', color: captain.canBid ? '#00e676' : '#ff9500', padding: '4px 10px', borderRadius: 9999, fontWeight: 600 }}>
              {captain.canBid && <CheckMark size={12} />}{captain.canBid ? 'Bidding Enabled' : 'Bidding Pending'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: captain.subscriptionPaid ? 'rgba(0,230,118,0.1)' : 'rgba(255,149,0,0.1)', color: captain.subscriptionPaid ? '#00e676' : '#ff9500', padding: '4px 10px', borderRadius: 9999, fontWeight: 600 }}>
              {captain.subscriptionPaid && <CheckMark size={12} />}{captain.subscriptionPaid ? 'Subscription Paid' : 'Subscription Unpaid'}
            </span>
          </div>
          {!captain.subscriptionPaid && (
            <button onClick={() => setShowPayment(true)} style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              Pay Subscription — Rs. 3,000
            </button>
          )}
        </div>
      )}

      {/* ── Edit profile ────────────────────────────────────────────────── */}
      {(isPlayer || isCaptain) && (
        <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
          {!editing ? (
            <button onClick={() => setEditing(true)} style={{ width: '100%', padding: '11px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(245,200,66,0.22)', color: '#1877f2', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Edit Profile
            </button>
          ) : (
            <>
              <div style={{ fontSize: 11, color: '#65676b', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 14 }}>EDIT PROFILE</div>
              {['name', 'phone'].map(k => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <label style={lbl}>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                  <input value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} style={inp}
                    onFocus={e => e.target.style.borderColor = '#1877f2'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                </div>
              ))}
              {isPlayer && <>
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>Address</label>
                  <input value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} style={inp}
                    onFocus={e => e.target.style.borderColor = '#1877f2'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Min Bid (Rs.) — can only raise</label>
                  <input type="number" value={form.minimumBid || ''} min={originalMinBid}
                    onChange={e => setForm({ ...form, minimumBid: e.target.value })}
                    style={{ ...inp, borderColor: 'rgba(245,200,66,0.3)', color: '#1877f2', fontWeight: 700 }}
                    onFocus={e => e.target.style.borderColor = '#1877f2'} onBlur={e => e.target.style.borderColor = 'rgba(245,200,66,0.3)'} />
                  <p style={{ fontSize: 11, color: '#65676b', marginTop: 4 }}>
                    Original: Rs. {(originalMinBid || 0).toLocaleString()}
                  </p>
                </div>
              </>}
              {isCaptain && (
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Team Name</label>
                  <input value={form.teamName || ''} onChange={e => setForm({ ...form, teamName: e.target.value })} style={inp}
                    onFocus={e => e.target.style.borderColor = '#1877f2'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.08)'} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '11px', borderRadius: 12, background: 'transparent', border: '1px solid rgba(0,0,0,0.08)', color: '#65676b', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 12, background: 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: '#ffffff', fontWeight: 800, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {saving ? <><div style={{ width: 16, height: 16, border: '2.5px solid rgba(0,0,0,0.2)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Saving...</> : <><CheckMark size={16} />Save</>}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Push notifications ─────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: '14px 18px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
              Push Notifications {pushEnabled && <CheckMark size={15} />}
            </div>
            <div style={{ fontSize: 12, color: '#65676b' }}>Alerts for bids and updates</div>
          </div>
          {pushEnabled ? (
            <span style={{ background: 'rgba(0,230,118,0.1)', color: '#00e676', borderRadius: 9999, padding: '4px 12px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckMark size={12} />ON
            </span>
          ) : (
            <button onClick={handleEnablePush} style={{ padding: '7px 14px', borderRadius: 9, background: 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Enable</button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPicModal && (
        <ProfilePicModal
          currentSrc={picSrc ? (imgUrl(picSrc)) : null}
          onClose={() => setShowPicModal(false)}
          onSave={handlePicSave}
        />
      )}
      {showPayment && (
        <PaymentModal
          type={role}
          fee={isCaptain ? 3000 : (showReAuctionFee ? reAuctionFee : player?.registrationFee)}
          onClose={() => { setShowPayment(false); setShowReAuctionFee(false); }}
          onSuccess={() => { setShowPayment(false); setShowReAuctionFee(false); loadProfile(); }}
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
