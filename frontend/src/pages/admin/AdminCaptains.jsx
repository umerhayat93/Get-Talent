import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import Avatar from '../../components/common/Avatar';

const STATUS_TABS   = ['all','pending','approved','rejected','banned'];
const STATUS_COLORS = { pending:'#ff9500', approved:'#00e676', rejected:'#ff4444', banned:'#ff4444' };

export default function AdminCaptains() {
  const [receiptModal, setReceiptModal] = useState(null);
  const [captains,    setCaptains]    = useState([]);
  const [tab,         setTab]         = useState('pending');
  const [loading,     setLoading]     = useState(true);
  const [remarksM,    setRemarksM]    = useState({});
  const [expandedId,  setExpandedId]  = useState(null);

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    setLoading(true);
    try {
      const params = tab !== 'all' ? `?status=${tab}` : '';
      const { data } = await api.get(`/admin/captains${params}`);
      setCaptains(data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const action = async (id, endpoint, msg) => {
    try {
      await api.patch(`/admin/captains/${id}/${endpoint}`, { remarks: remarksM[id] || '' });
      toast.success(msg); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const receiptSrc = (val) => {
    if (!val) return null;
    if (val.startsWith('data:')) return val;
    const base = (import.meta.env.VITE_API_URL || 'https://get-talent-api.onrender.com/api').replace('/api', '');
    return `${base}/uploads/${val}`;
  };

  return (
    <>
      <AdminLayout title="Captains Management">
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'6px 14px', borderRadius:9999, fontSize:12, fontWeight:700, cursor:'pointer', border:'none', background: tab===t?'rgba(245,200,66,0.2)':'rgba(0,0,0,0.06)', color: tab===t?'#f5c842':'#8899aa', textTransform:'capitalize' }}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:80, borderRadius:14 }} />)}
          </div>
        ) : captains.length === 0 ? (
          <div className="empty-state"><div className="icon">👑</div><div className="title">No captains in this category</div></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {captains.map(c => (
              <div key={c.id} style={{ background:'#1a2a3a', border:'1px solid rgba(0,0,0,0.07)', borderRadius:16, overflow:'hidden' }}>
                <div style={{ display:'flex', gap:12, alignItems:'center', padding:'14px 16px', cursor:'pointer' }} onClick={() => setExpandedId(expandedId===c.id ? null : c.id)}>
                  <Avatar src={c.user?.profilePicture} name={c.name} size={44} radius={10} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
                    <div style={{ fontSize:12, color:'#8899aa' }}>{c.phone} · 🏆 {c.teamName}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                    <span style={{ fontSize:11, fontWeight:700, color: STATUS_COLORS[c.status]||'#8899aa', background:`${STATUS_COLORS[c.status]||'#8899aa'}22`, padding:'2px 8px', borderRadius:9999, textTransform:'capitalize' }}>{c.status}</span>
                    <span style={{ fontSize:11, color: c.canBid?'#00e676':'#ff9500' }}>{c.canBid ? '⚡ Can Bid' : '🚫 No Bid'}</span>
                  </div>
                  <span style={{ color:'#4a5a6a', fontSize:18 }}>{expandedId===c.id ? '▲' : '▼'}</span>
                </div>

                {expandedId===c.id && (
                  <div className="fade-in" style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, margin:'12px 0' }}>
                      {[
                        ['Team', c.teamName],
                        ['Subscription', c.subscriptionPaid ? 'Paid' : 'Unpaid'],
                        ['Bidding', c.canBid ? 'Enabled' : 'Disabled'],
                        ['Mismanaged', c.isMismanaged ? 'Yes' : 'No'],
                      ].map(([k,v]) => (
                        <div key={k} style={{ background:'rgba(0,0,0,0.2)', borderRadius:10, padding:'8px 12px' }}>
                          <div style={{ fontSize:10, color:'#4a5a6a', fontWeight:600 }}>{k.toUpperCase()}</div>
                          <div style={{ fontSize:13, fontWeight:600, marginTop:2 }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {c.paymentReceipt && (
                      <button
                        onClick={() => setReceiptModal(c.paymentReceipt)}
                        style={{ display:'block', width:'100%', margin:'0 0 10px', padding:'10px 12px', background:'rgba(64,169,255,0.1)', border:'1px solid rgba(64,169,255,0.25)', borderRadius:10, fontSize:13, color:'#40a9ff', fontWeight:600, cursor:'pointer', textAlign:'left', fontFamily:'Outfit,sans-serif' }}
                      >
                        📎 View Payment Receipt →
                      </button>
                    )}

                    <div style={{ marginBottom:10 }}>
                      <input value={remarksM[c.id]||''} onChange={e => setRemarksM({...remarksM,[c.id]:e.target.value})} placeholder="Add remarks (optional)" style={{ fontSize:13 }} />
                    </div>

                    {c.remarks && <div style={{ background:'rgba(255,149,0,0.1)', borderRadius:8, padding:'8px 10px', marginBottom:10, fontSize:12, color:'#ff9500' }}>Prev remark: {c.remarks}</div>}

                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {c.status !== 'approved'  && <button onClick={() => action(c.id,'approve','Captain approved!')} style={{ padding:'8px 16px', borderRadius:10, background:'rgba(0,230,118,0.15)', border:'1px solid rgba(0,230,118,0.3)', color:'#00e676', fontWeight:600, cursor:'pointer', fontSize:13 }}>✅ Approve</button>}
                      {!c.canBid && c.status==='approved' && <button onClick={() => action(c.id,'approve-bidding','Bidding enabled!')} style={{ padding:'8px 14px', borderRadius:10, background:'rgba(245,200,66,0.15)', border:'1px solid rgba(245,200,66,0.3)', color:'#f5c842', fontWeight:600, cursor:'pointer', fontSize:13 }}>⚡ Enable Bidding</button>}
                      {c.status !== 'rejected'  && <button onClick={() => action(c.id,'reject','Captain rejected')} style={{ padding:'8px 16px', borderRadius:10, background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.25)', color:'#ff4444', fontWeight:600, cursor:'pointer', fontSize:13 }}>❌ Reject</button>}
                      {c.status !== 'banned'    && <button onClick={() => action(c.id,'ban','Captain banned')} style={{ padding:'8px 16px', borderRadius:10, background:'rgba(255,68,68,0.15)', border:'1px solid rgba(255,68,68,0.4)', color:'#ff4444', fontWeight:700, cursor:'pointer', fontSize:13 }}>🚫 Ban</button>}
                      {!c.isMismanaged          && <button onClick={() => action(c.id,'mismanaged','Marked mismanaged')} style={{ padding:'8px 14px', borderRadius:10, background:'rgba(255,68,68,0.1)', border:'1px solid rgba(255,68,68,0.2)', color:'#ff6666', fontWeight:600, cursor:'pointer', fontSize:12 }}>⚠ Mismanaged</button>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminLayout>

      {receiptModal && (
        <div onClick={() => setReceiptModal(null)} style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.93)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ position:'relative', maxWidth:'92vw', maxHeight:'86vh' }}>
            <img src={receiptSrc(receiptModal)} alt="Payment Receipt" style={{ maxWidth:'100%', maxHeight:'80vh', borderRadius:12, boxShadow:'0 8px 40px rgba(0,0,0,0.6)', display:'block', objectFit:'contain' }} onClick={e => e.stopPropagation()} onError={e => { e.target.style.display='none'; }} />
            <button onClick={() => setReceiptModal(null)} style={{ position:'absolute', top:-14, right:-14, width:32, height:32, borderRadius:'50%', background:'#ff4444', border:'2px solid #fff', color:'#fff', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>✕</button>
          </div>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:12, marginTop:14 }}>Tap outside to close</p>
        </div>
      )}
    </>
  );
          }
