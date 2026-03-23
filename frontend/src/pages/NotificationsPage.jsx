import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = { approval:'✅', rejection:'❌', bidding:'⚡', sold:'🏆', won:'🏆', broadcast:'📢', general:'🔔' };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifs(); }, []);

  const loadNotifs = async () => {
    try {
      const { data } = await api.get('/notifications/mine');
      setNotifs(data);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const unread = notifs.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'50vh' }}>
      <div className="spinner" style={{ width:36, height:36, borderWidth:3 }} />
    </div>
  );

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:28, letterSpacing:1, lineHeight:1 }}>Notifications</h1>
          {unread > 0 && <span style={{ fontSize:13, color:'#1877f2' }}>{unread} unread</span>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ padding:'7px 14px', borderRadius:10, background:'rgba(245,200,66,0.1)', border:'1px solid rgba(245,200,66,0.25)', color:'#1877f2', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            Mark all read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔔</div>
          <div className="title">No notifications yet</div>
          <p>You'll see updates about your bids and registration here</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {notifs.map(n => (
            <div key={n.id} onClick={()=>!n.isRead&&markRead(n.id)} style={{
              background: n.isRead ? 'rgba(255,255,255,0.02)' : '#ffffff',
              border: `1px solid ${n.isRead ? 'rgba(0,0,0,0.06)' : 'rgba(245,200,66,0.15)'}`,
              borderRadius:14, padding:'14px 16px', cursor:'pointer',
              transition:'all 0.2s', display:'flex', gap:12, alignItems:'flex-start',
            }}>
              <div style={{ fontSize:24, flexShrink:0 }}>{TYPE_ICONS[n.type] || '🔔'}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight: n.isRead?600:800, fontSize:15, marginBottom:3 }}>{n.title}</div>
                <div style={{ fontSize:13, color:'#6a7080', lineHeight:1.5 }}>{n.message}</div>
                <div style={{ fontSize:11, color:'#9090a8', marginTop:6 }}>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  {n.isBroadcast && <span style={{ marginLeft:8, background:'rgba(64,169,255,0.15)', color:'#40a9ff', padding:'1px 6px', borderRadius:4, fontSize:10 }}>BROADCAST</span>}
                </div>
              </div>
              {!n.isRead && <div style={{ width:8, height:8, borderRadius:'50%', background:'#1877f2', marginTop:4, flexShrink:0 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
