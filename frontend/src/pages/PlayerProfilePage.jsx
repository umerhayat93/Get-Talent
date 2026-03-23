import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { imgUrl } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/common/Avatar';
import VerifiedBadge from '../components/common/VerifiedBadge';

const CAT_COLORS = { Diamond:'#40a9ff', Gold:'#1877f2', Silver:'#c0c0c0', Emerging:'#00e676' };

export default function PlayerProfilePage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const role     = useAuthStore(s => s.user?.role);
  const userId   = useAuthStore(s => s.user?.id);

  const isCaptain = role === 'captain';
  const isFan     = role === 'fan';
  const isPlayer  = role === 'player';

  const [player,  setPlayer]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/players/${id}`)
      .then(({ data }) => setPlayer(data))
      .catch(() => navigate('/feed', { replace: true }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div className="spinner" style={{ width:36, height:36, borderWidth:3 }} />
    </div>
  );
  if (!player) return null;

  const catColor    = CAT_COLORS[player.category] || '#1877f2';
  const isVerified  = player.status === 'approved' || player.status === 'sold' || player.status === 'unsold';
  const isOwnProfile = isPlayer && player.user?.id === userId;

  return (
    <div className="page">
      <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#6a7080', cursor:'pointer', marginBottom:16, fontSize:14, display:'flex', alignItems:'center', gap:6, padding:0 }}>
        ← Back
      </button>

      {/* Hero card */}
      <div style={{ background:'linear-gradient(145deg,#fff,#f5f0e8)', border:`1px solid ${catColor}33`, borderRadius:20, overflow:'hidden', marginBottom:14 }}>
        <div style={{ height:4, background:`linear-gradient(90deg,${catColor},transparent)` }} />
        <div style={{ padding:'22px 18px', display:'flex', gap:16, alignItems:'flex-start' }}>
          {/* Square profile pic */}
          <div style={{ width:88, height:88, borderRadius:16, overflow:'hidden', border:`2px solid ${catColor}44`, background:'#f0ebe0', flexShrink:0 }}>
            {player.profilePicture ? (
              <img src={imgUrl(player.profilePicture)} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none';}} />
            ) : null}
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue',cursive", fontSize:28, color:'#1877f2' }}>GT</div>
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            {/* Name + verified badge */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
              <h1 style={{ fontSize:22, fontWeight:800, lineHeight:1 }}>{player.name}</h1>
              {isVerified && <VerifiedBadge size={20} />}
            </div>

            {/* Tags */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
              <span style={{ background:`${catColor}22`, color:catColor, border:`1px solid ${catColor}55`, borderRadius:9999, padding:'3px 10px', fontSize:12, fontWeight:700 }}>
                {player.category}
              </span>
              <span style={{ background:'rgba(0,0,0,0.06)', color:'#6a7080', borderRadius:9999, padding:'3px 10px', fontSize:12 }}>
                {player.skill}
              </span>
              <span style={{ background: player.status==='sold'?'rgba(245,200,66,0.15)':player.status==='approved'?'rgba(0,230,118,0.15)':'rgba(0,0,0,0.06)', color: player.status==='sold'?'#1877f2':player.status==='approved'?'#00e676':'#6a7080', borderRadius:9999, padding:'3px 10px', fontSize:12, fontWeight:600 }}>
                {player.status==='approved'?'Available':player.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        {[
          { label:'Min Bid',     value:`Rs. ${(player.minimumBid||0).toLocaleString()}`,    color:'#1877f2' },
          { label:'Reg. Fee',    value:`Rs. ${(player.registrationFee||0).toLocaleString()}`, color:'#6a7080' },
          { label:'Tournament',  value: player.tournament?.name||'—',                       color:'#40a9ff' },
          { label:'Location',    value: player.tournament?.location||'—',                    color:'#6a7080' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.06)', borderRadius:13, padding:'13px 14px' }}>
            <div style={{ fontSize:10, color:'#9090a8', fontWeight:600, letterSpacing:'0.5px', marginBottom:4 }}>{label.toUpperCase()}</div>
            <div style={{ fontSize:15, fontWeight:700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Sold info */}
      {player.status === 'sold' && (
        <div style={{ background:'rgba(245,200,66,0.07)', border:'1px solid rgba(245,200,66,0.18)', borderRadius:14, padding:'16px', marginBottom:14 }}>
          <div style={{ fontSize:11, color:'#6a7080', fontWeight:600, marginBottom:6 }}>SOLD TO</div>
          <div style={{ fontSize:18, fontWeight:800, color:'#1877f2', marginBottom:4 }}>🏆 {player.soldToTeam}</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#00e676' }}>Rs. {(player.soldAmount||0).toLocaleString()}</div>
        </div>
      )}

      {/* Contact section — CAPTAINS ONLY */}
      {isCaptain && (
        <div style={{ background:'#ffffff', border:'1px solid rgba(0,230,118,0.18)', borderRadius:14, padding:'16px', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#00e676', fontWeight:700, letterSpacing:'0.8px' }}>CONTACT DETAILS</div>
            <span style={{ fontSize:10, color:'#9090a8', background:'rgba(0,230,118,0.1)', borderRadius:9999, padding:'2px 8px' }}>Captain only</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'rgba(0,0,0,0.2)', borderRadius:10 }}>
              <span style={{ color:'#6a7080', fontSize:13 }}>📱 Phone</span>
              <a href={`tel:${player.phone}`} style={{ fontWeight:700, fontSize:15, color:'#00e676', textDecoration:'none' }}>
                {player.phone}
              </a>
            </div>
            {player.address && (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'rgba(0,0,0,0.2)', borderRadius:10 }}>
                <span style={{ color:'#6a7080', fontSize:13 }}>📍 Address</span>
                <span style={{ fontWeight:600, fontSize:13, color:'#1a1a2e', textAlign:'right', maxWidth:160 }}>{player.address}</span>
              </div>
            )}
            <a href={`https://wa.me/${player.phone?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', borderRadius:12, background:'rgba(37,211,102,0.15)', border:'1px solid rgba(37,211,102,0.3)', color:'#25D366', fontWeight:700, fontSize:14, textDecoration:'none', cursor:'pointer' }}>
              <span style={{ fontSize:18 }}>💬</span> WhatsApp Player
            </a>
          </div>
        </div>
      )}

      {/* Fan — hide contact */}
      {isFan && (
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(0,0,0,0.07)', borderRadius:14, padding:'14px', marginBottom:14, textAlign:'center', fontSize:13, color:'#9090a8' }}>
          🔒 Contact details are only visible to captains
        </div>
      )}

      {/* Player own profile info */}
      {isOwnProfile && (
        <div style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.06)', borderRadius:14, padding:'16px', marginBottom:14 }}>
          <div style={{ fontSize:11, color:'#9090a8', fontWeight:600, letterSpacing:'0.8px', marginBottom:10 }}>YOUR DETAILS</div>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.06)', fontSize:14 }}>
            <span style={{ color:'#6a7080' }}>Phone</span>
            <span style={{ fontWeight:600 }}>{player.phone}</span>
          </div>
          {player.address && (
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:14 }}>
              <span style={{ color:'#6a7080' }}>Address</span>
              <span style={{ fontWeight:600 }}>{player.address}</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {player.status === 'approved' && (
        <button onClick={() => navigate('/bidding')} style={{ width:'100%', padding:'14px', borderRadius:14, background:'linear-gradient(135deg,#f5c842,#e6a800)', border:'none', color:'#ffffff', fontSize:16, fontWeight:800, cursor:'pointer' }}>
          Join Bidding Room
        </button>
      )}
    </div>
  );
}
