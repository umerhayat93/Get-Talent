import { imgUrl } from '../utils/api';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';

const CAT_COLORS = {
  Diamond: { bg:'rgba(64,169,255,0.12)', color:'#40a9ff', border:'rgba(64,169,255,0.3)' },
  Gold:    { bg:'rgba(245,200,66,0.12)', color:'#c8960a', border:'rgba(245,200,66,0.3)' },
  Silver:  { bg:'rgba(192,192,192,0.12)',color:'#c0c0c0', border:'rgba(192,192,192,0.3)'},
  Emerging:{ bg:'rgba(0,230,118,0.12)', color:'#00e676', border:'rgba(0,230,118,0.3)' },
};
const SKILL_ICONS = { Batter:'🏏', Bowler:'⚾', 'All-Rounder':'⚡' };

export default function PlayerCard({ player, onBid }) {
  const navigate = useNavigate();
  const cat = CAT_COLORS[player.category] || CAT_COLORS.Emerging;

  return (
    <div className="fade-in" style={{ background:'linear-gradient(145deg,#fff,#f5f0e8)', border:`1px solid ${cat.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.3)', transition:'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.4)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.3)';}}>
      <div style={{ height:3, background:`linear-gradient(90deg,${cat.color},transparent)` }} />
      <div style={{ padding:16 }}>
        {/* Header */}
        <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
          <div style={{ width:56,height:56,borderRadius:12,overflow:'hidden',border:`2px solid ${cat.border}`,background:'#f0ebe0',flexShrink:0 }}>
            {player.profilePicture ? (
              <img src={imgUrl(player.profilePicture)} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none';}} />
            ) : null}
            <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue',cursive",fontSize:20,color:'#c8960a'}}>GT</div>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            {/* Name + verified badge */}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, overflow:'hidden' }}>
              <span style={{ fontWeight:700,fontSize:15,color:'#1a1a2e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{player.name}</span>
              <VerifiedBadge size={15} style={{ flexShrink:0 }} />
            </div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              <span style={{ background:cat.bg,color:cat.color,border:`1px solid ${cat.border}`,borderRadius:9999,padding:'2px 8px',fontSize:11,fontWeight:700 }}>{player.category}</span>
              <span style={{ background:'rgba(0,0,0,0.06)',color:'#6a7080',borderRadius:9999,padding:'2px 8px',fontSize:11 }}>{SKILL_ICONS[player.skill]} {player.skill}</span>
            </div>
          </div>
          <div style={{ width:8,height:8,borderRadius:'50%',background:player.status==='sold'?'#c8960a':player.status==='approved'?'#00e676':player.status==='pending'?'#ff9500':'#6a7080',marginTop:4,flexShrink:0 }} />
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <div style={{ flex:1,background:'rgba(0,0,0,0.2)',borderRadius:10,padding:'8px 10px',textAlign:'center' }}>
            <div style={{ fontSize:10,color:'#9090a8',fontWeight:600,letterSpacing:'0.5px',marginBottom:3 }}>MIN BID</div>
            <div style={{ fontSize:14,fontWeight:700,color:'#c8960a' }}>Rs. {(player.minimumBid||0).toLocaleString()}</div>
          </div>
          <div style={{ flex:1,background:'rgba(0,0,0,0.2)',borderRadius:10,padding:'8px 10px',textAlign:'center' }}>
            <div style={{ fontSize:10,color:'#9090a8',fontWeight:600,letterSpacing:'0.5px',marginBottom:3 }}>TOURNAMENT</div>
            <div style={{ fontSize:14,fontWeight:700,color:'#1a1a2e' }}>{player.tournament?.name||'—'}</div>
          </div>
        </div>

        {player.status==='sold' && (
          <div style={{ background:'rgba(245,200,66,0.1)',border:'1px solid rgba(245,200,66,0.2)',borderRadius:10,padding:'8px 12px',marginBottom:12,fontSize:12 }}>
            🏆 Sold to <strong>{player.soldToTeam}</strong> for Rs. {(player.soldAmount||0).toLocaleString()}
          </div>
        )}

        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>navigate(`/player/${player.id}`)} style={{ flex:1,padding:'9px 12px',borderRadius:10,background:'transparent',border:'1px solid rgba(0,0,0,0.09)',color:'#6a7080',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(245,200,66,0.3)';e.currentTarget.style.color='#c8960a';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(0,0,0,0.09)';e.currentTarget.style.color='#6a7080';}}>
            View Profile
          </button>
          {player.status==='approved' && onBid && (
            <button onClick={()=>onBid(player)} style={{ flex:1,padding:'9px 12px',borderRadius:10,background:'linear-gradient(135deg,#f5c842,#e6a800)',border:'none',color:'#ffffff',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all 0.2s' }}>
              Join Bidding
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
