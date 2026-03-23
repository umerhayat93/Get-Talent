import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import GTLogo from '../common/GTLogo';

const NAV = [
  { path:'/admin',            label:'Dashboard', icon:'📊' },
  { path:'/admin/players',    label:'Players',   icon:'🏏' },
  { path:'/admin/captains',   label:'Captains',  icon:'🏆' },
  { path:'/admin/bidding',    label:'Bidding',   icon:'⚡' },
  { path:'/admin/tournaments',label:'Tournaments',icon:'🏟️' },
  { path:'/admin/broadcast',  label:'Broadcast', icon:'📢' },
];

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <div style={{ minHeight:'100vh', background:'#0a1520', display:'flex', flexDirection:'column' }}>
      {/* Top bar */}
      <header style={{ background:'rgba(15,25,35,0.97)', borderBottom:'1px solid rgba(245,200,66,0.12)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <GTLogo size="sm" />
          <div>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:18, letterSpacing:1, color:'#f5c842', lineHeight:1 }}>Get Talent</div>
            <div style={{ fontSize:10, color:'#4a5a6a', letterSpacing:'2px', fontWeight:600 }}>ADMIN PANEL</div>
          </div>
        </div>
        <button onClick={()=>{ logout(); navigate('/admin/login'); }} style={{ padding:'7px 14px', borderRadius:10, background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.2)', color:'#ff4444', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          Logout
        </button>
      </header>

      {/* Side/top nav */}
      <div style={{ overflowX:'auto', borderBottom:'1px solid rgba(0,0,0,0.06)', background:'#152030' }}>
        <div style={{ display:'flex', padding:'0 16px', minWidth:'max-content' }}>
          {NAV.map(n=>{
            const active = location.pathname === n.path;
            return (
              <button key={n.path} onClick={()=>navigate(n.path)} style={{ padding:'12px 16px', background:'none', border:'none', cursor:'pointer', borderBottom:`2px solid ${active?'#f5c842':'transparent'}`, color: active?'#f5c842':'#4a5a6a', fontSize:13, fontWeight:600, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6, transition:'all 0.2s' }}>
                <span>{n.icon}</span>{n.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, padding:'24px 20px', maxWidth:900, width:'100%', margin:'0 auto' }}>
        {title && <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:30, letterSpacing:1, marginBottom:20, color:'#f5c842' }}>{title}</h1>}
        {children}
      </div>
    </div>
  );
}
