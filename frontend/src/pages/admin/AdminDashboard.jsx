import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({data})=>setStats(data)).finally(()=>setLoading(false));
  }, []);

  const cards = stats ? [
    { label:'Total Players',    value:stats.totalPlayers,    icon:'🏏', color:'#40a9ff' },
    { label:'Pending Players',  value:stats.pendingPlayers,  icon:'⏳', color:'#ff9500' },
    { label:'Approved Players', value:stats.approvedPlayers, icon:'✅', color:'#00e676' },
    { label:'Sold Players',     value:stats.soldPlayers,     icon:'🏆', color:'#f5c842' },
    { label:'Unsold Players',   value:stats.unsoldPlayers,   icon:'📋', color:'#8899aa' },
    { label:'Total Captains',   value:stats.totalCaptains,   icon:'👑', color:'#f5c842' },
    { label:'Pending Captains', value:stats.pendingCaptains, icon:'⏳', color:'#ff9500' },
    { label:'Active Sessions',  value:stats.activeSessions,   icon:'⚡', color:'#00e676' },
    { label:'Live Tournaments', value:stats.totalTournaments, icon:'🏟️', color:'#40a9ff' },
    { label:'Pending Requests', value:stats.pendingTournaments||0, icon:'📋', color: stats?.pendingTournaments > 0 ? '#ff9500' : '#4a5a6a', highlight: stats?.pendingTournaments > 0 },
  ] : [];

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
          {[1,2,3,4,5,6].map(i=><div key={i} className="skeleton" style={{ height:90, borderRadius:14 }} />)}
        </div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:28 }}>
            {cards.map(card=>(
              <div key={card.label} style={{ background:'#1a2a3a', border:`1.5px solid ${card.highlight ? card.color : card.color+'22'}`, borderRadius:14, padding:'16px 18px', boxShadow: card.highlight ? `0 0 12px ${card.color}30` : 'none' }}>
                <div style={{ fontSize:26, marginBottom:6 }}>{card.icon}</div>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:32, color:card.color, lineHeight:1 }}>{card.value}</div>
                <div style={{ fontSize:12, color:'#8899aa', marginTop:4, fontWeight:600 }}>{card.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#1a2a3a', border:'1px solid rgba(245,200,66,0.12)', borderRadius:16, padding:'20px' }}>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, letterSpacing:1, marginBottom:12, color:'#f5c842' }}>Quick Actions</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {[
                { label:'Review Players',    path:'/admin/players?status=pending', icon:'🏏' },
                { label:'Approve Captains',  path:'/admin/captains?status=pending', icon:'👑' },
                { label:'Start Bidding',     path:'/admin/bidding',  icon:'⚡' },
                { label:'Tournaments',       path:'/admin/tournaments', icon:'🏟️' },
                { label:'Send Broadcast',    path:'/admin/broadcast', icon:'📢' },
              ].map(a=>(
                <a key={a.label} href={a.path} style={{ padding:'10px 16px', borderRadius:10, background:'rgba(0,0,0,0.05)', border:'1px solid rgba(0,0,0,0.08)', color:'#eef2f7', fontSize:14, fontWeight:600, display:'flex', alignItems:'center', gap:6, textDecoration:'none', transition:'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(245,200,66,0.3)';e.currentTarget.style.color='#f5c842';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(0,0,0,0.08)';e.currentTarget.style.color='#eef2f7';}}>
                  {a.icon} {a.label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
