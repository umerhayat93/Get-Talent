import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import Avatar from '../../components/common/Avatar';

const STATUS_TABS = ['all','pending','approved','rejected','banned'];
const STATUS_COLORS = { pending:'#ff9500', approved:'#00e676', rejected:'#ff4444', banned:'#ff4444' };

export default function AdminCaptains() {
  const [captains, setCaptains] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    setLoading(true);
    try {
      const params = tab !== 'all' ? `?status=${tab}` : '';
      const { data } = await api.get(`/admin/captains${params}`);
      setCaptains(data);
    } finally { setLoading(false); }
  };

  const action = async (id, endpoint, msg) => {
    try {
      await api.patch(`/admin/captains/${id}/${endpoint}`, { remarks: remarksMap[id]||'' });
      toast.success(msg); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <AdminLayout title="Captains Management">
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
        {STATUS_TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'6px 14px', borderRadius:9999, fontSize:12, fontWeight:700, cursor:'pointer', border:'none', background: tab===t?'rgba(245,200,66,0.2)':'rgba(0,0,0,0.06)', color: tab===t?'#f5c842':'#8899aa', textTransform:'capitalize' }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{ height:80, borderRadius:14 }} />)}</div>
      ) : captains.length === 0 ? (
        <div className="empty-state"><div className="icon">👑</div><div className="title">No captains here</div></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {captains.map(c=>(
            <div key={c.id} style={{ background:'#1a2a3a', border:'1px solid rgba(0,0,0,0.07)', borderRadius:16, overflow:'hidden' }}>
              <div style={{ display:'flex', gap:12, alignItems:'center', padding:'14px 16px', cursor:'pointer' }} onClick={()=>setExpandedId(expandedId===c.id?null:c.id)}>
                <Avatar src={c.user?.profilePicture} name={c.name} size={44} radius={10} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{c.name}</div>
                  <div style={{ fontSize:12, color:'#f5c842' }}>🏆 {c.teamName}</div>
                  <div style={{ fontSize:12, color:'#8899aa' }}>{c.phone}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                  <span style={{ fontSize:11, fontWeight:700, color: STATUS_COLORS[c.status]||'#8899aa', background:`${STATUS_COLORS[c.status]||'#8899aa'}22`, padding:'2px 8px', borderRadius:9999, textTransform:'capitalize' }}>{c.status}</span>
                  <span style={{ fontSize:11, color: c.canBid?'#00e676':'#ff9500' }}>{c.canBid?'⚡ Can Bid':'🚫 No Bid'}</span>
                  <span style={{ fontSize:11, color: c.subscriptionPaid?'#00e676':'#ff9500' }}>💳 {c.subscriptionPaid?'Paid':'Unpaid'}</span>
                </div>
                <span style={{ color:'#4a5a6a', fontSize:18 }}>{expandedId===c.id?'▲':'▼'}</span>
              </div>

              {expandedId===c.id && (
                <div className="fade-in" style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
                  {c.paymentReceipt && (
                    <a href={`/uploads/${c.paymentReceipt}`} target="_blank" rel="noreferrer" style={{ display:'block', margin:'12px 0', padding:'8px 12px', background:'rgba(64,169,255,0.1)', border:'1px solid rgba(64,169,255,0.25)', borderRadius:10, fontSize:13, color:'#40a9ff', fontWeight:600 }}>
                      📎 View Subscription Receipt →
                    </a>
                  )}
                  {c.isMismanaged && <div style={{ background:'rgba(255,68,68,0.15)', borderRadius:8, padding:'8px 10px', marginBottom:10, fontSize:12, color:'#ff4444', fontWeight:600 }}>⚠️ Marked as Mismanaged Team</div>}

                  <div style={{ marginBottom:10 }}>
                    <input value={remarksMap[c.id]||''} onChange={e=>setRemarksMap({...remarksMap,[c.id]:e.target.value})} placeholder="Add remarks (optional)" style={{ fontSize:13 }} />
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {c.status!=='approved' && <button onClick={()=>action(c.id,'approve','Captain approved!')} style={{ padding:'8px 14px', borderRadius:10, background:'rgba(0,230,118,0.15)', border:'1px solid rgba(0,230,118,0.3)', color:'#00e676', fontWeight:600, cursor:'pointer', fontSize:13 }}>✅ Approve</button>}
                    {!c.canBid && c.status==='approved' && <button onClick={()=>action(c.id,'approve-bidding','Bidding enabled!')} style={{ padding:'8px 14px', borderRadius:10, background:'rgba(245,200,66,0.15)', border:'1px solid rgba(245,200,66,0.3)', color:'#f5c842', fontWeight:600, cursor:'pointer', fontSize:13 }}>⚡ Enable Bidding</button>}
                    {c.status!=='rejected' && <button onClick={()=>action(c.id,'reject','Captain rejected')} style={{ padding:'8px 14px', borderRadius:10, background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.25)', color:'#ff4444', fontWeight:600, cursor:'pointer', fontSize:13 }}>❌ Reject</button>}
                    {c.status!=='banned' && <button onClick={()=>action(c.id,'ban','Captain banned')} style={{ padding:'8px 14px', borderRadius:10, background:'rgba(255,68,68,0.15)', border:'1px solid rgba(255,68,68,0.4)', color:'#ff4444', fontWeight:700, cursor:'pointer', fontSize:13 }}>🚫 Ban</button>}
                    {!c.isMismanaged && <button onClick={()=>action(c.id,'mismanaged','Marked as mismanaged')} style={{ padding:'8px 14px', borderRadius:10, background:'rgba(255,149,0,0.1)', border:'1px solid rgba(255,149,0,0.25)', color:'#ff9500', fontWeight:600, cursor:'pointer', fontSize:13 }}>⚠️ Mismanaged</button>}
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
