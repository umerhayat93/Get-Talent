import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import Avatar from '../../components/common/Avatar';

const STATUS_TABS = ['all','pending','approved','sold','unsold','rejected','banned'];
const STATUS_COLORS = { pending:'#ff9500', approved:'#00e676', sold:'#f5c842', unsold:'#ff4444', rejected:'#ff4444', banned:'#ff4444' };

export default function AdminPlayers() {
  const [players, setPlayers] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    setLoading(true);
    try {
      const params = tab !== 'all' ? `?status=${tab}` : '';
      const { data } = await api.get(`/admin/players${params}`);
      setPlayers(data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const action = async (id, endpoint, successMsg) => {
    try {
      await api.patch(`/admin/players/${id}/${endpoint}`, { remarks: remarksMap[id] || '' });
      toast.success(successMsg);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  return (
    <AdminLayout title="Players Management">
      {/* Tabs */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
        {STATUS_TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'6px 14px', borderRadius:9999, fontSize:12, fontWeight:700, cursor:'pointer', border:'none', background: tab===t?'rgba(245,200,66,0.2)':'rgba(0,0,0,0.06)', color: tab===t?'#f5c842':'#8899aa', textTransform:'capitalize' }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{ height:80, borderRadius:14 }} />)}</div>
      ) : players.length === 0 ? (
        <div className="empty-state"><div className="icon">🏏</div><div className="title">No players in this category</div></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {players.map(p=>(
            <div key={p.id} style={{ background:'#1a2a3a', border:'1px solid rgba(0,0,0,0.07)', borderRadius:16, overflow:'hidden' }}>
              {/* Header row */}
              <div style={{ display:'flex', gap:12, alignItems:'center', padding:'14px 16px', cursor:'pointer' }} onClick={()=>setExpandedId(expandedId===p.id?null:p.id)}>
                <Avatar src={p.profilePicture} name={p.name} size={44} radius={10} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize:12, color:'#8899aa' }}>{p.phone} · {p.skill} · {p.category}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                  <span style={{ fontSize:11, fontWeight:700, color: STATUS_COLORS[p.status]||'#8899aa', background:`${STATUS_COLORS[p.status]||'#8899aa'}22`, padding:'2px 8px', borderRadius:9999, textTransform:'capitalize' }}>{p.status}</span>
                  <span style={{ fontSize:11, color: p.paymentStatus==='verified'?'#00e676':p.paymentStatus==='submitted'?'#40a9ff':'#ff9500' }}>
                    💳 {p.paymentStatus}
                  </span>
                </div>
                <span style={{ color:'#4a5a6a', fontSize:18 }}>{expandedId===p.id?'▲':'▼'}</span>
              </div>

              {/* Expanded */}
              {expandedId===p.id && (
                <div className="fade-in" style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, margin:'12px 0' }}>
                    {[
                      ['Tournament', p.tournament?.name||'—'],
                      ['Min Bid', `Rs. ${(p.minimumBid||0).toLocaleString()}`],
                      ['Reg Fee', `Rs. ${(p.registrationFee||0).toLocaleString()}`],
                      ['Address', p.address||'—'],
                    ].map(([k,v])=>(
                      <div key={k} style={{ background:'rgba(0,0,0,0.2)', borderRadius:10, padding:'8px 12px' }}>
                        <div style={{ fontSize:10, color:'#4a5a6a', fontWeight:600 }}>{k.toUpperCase()}</div>
                        <div style={{ fontSize:13, fontWeight:600, marginTop:2 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {p.paymentReceipt && (
                    <a href={`/uploads/${p.paymentReceipt}`} target="_blank" rel="noreferrer" style={{ display:'block', marginBottom:10, padding:'8px 12px', background:'rgba(64,169,255,0.1)', border:'1px solid rgba(64,169,255,0.25)', borderRadius:10, fontSize:13, color:'#40a9ff', fontWeight:600 }}>
                      📎 View Payment Receipt →
                    </a>
                  )}

                  <div style={{ marginBottom:10 }}>
                    <input value={remarksMap[p.id]||''} onChange={e=>setRemarksMap({...remarksMap,[p.id]:e.target.value})} placeholder="Add remarks (optional)" style={{ fontSize:13 }} />
                  </div>

                  {p.remarks && <div style={{ background:'rgba(255,149,0,0.1)', borderRadius:8, padding:'8px 10px', marginBottom:10, fontSize:12, color:'#ff9500' }}>Prev remark: {p.remarks}</div>}

                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {p.status !== 'approved' && <button onClick={()=>action(p.id,'approve','Player approved!')} style={{ padding:'8px 16px', borderRadius:10, background:'rgba(0,230,118,0.15)', border:'1px solid rgba(0,230,118,0.3)', color:'#00e676', fontWeight:600, cursor:'pointer', fontSize:13 }}>✅ Approve</button>}
                    {p.status !== 'rejected' && <button onClick={()=>action(p.id,'reject','Player rejected')} style={{ padding:'8px 16px', borderRadius:10, background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.25)', color:'#ff4444', fontWeight:600, cursor:'pointer', fontSize:13 }}>❌ Reject</button>}
                    {p.status !== 'banned' && <button onClick={()=>action(p.id,'ban','Player banned')} style={{ padding:'8px 16px', borderRadius:10, background:'rgba(255,68,68,0.15)', border:'1px solid rgba(255,68,68,0.4)', color:'#ff4444', fontWeight:700, cursor:'pointer', fontSize:13 }}>🚫 Ban</button>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
