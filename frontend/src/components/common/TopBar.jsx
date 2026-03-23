import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiBell, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';

export default function TopBar() {
  const token    = useAuthStore(s => s.token);
  const role     = useAuthStore(s => s.user?.role);
  const name     = useAuthStore(s => s.user?.name);
  const logout   = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  const isLoggedIn = !!token;
  const isAdmin    = role === 'admin';

  useEffect(() => {
    if (!isLoggedIn || isAdmin) return;
    api.get('/notifications/mine')
      .then(({ data }) => setUnread(Array.isArray(data) ? data.filter(n => !n.isRead).length : 0))
      .catch(() => {});
  }, [location.pathname, isLoggedIn, isAdmin]);

  const handleLogout = () => { logout(); navigate('/', { replace: true }); };

  const hiddenPaths = ['/login', '/register/player', '/register/captain', '/register/fan', '/register/organiser', '/'];
  if (hiddenPaths.includes(location.pathname)) return null;
  if (location.pathname.startsWith('/admin') && !isAdmin) return null;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#1877f2',
      boxShadow: '0 2px 8px rgba(24,119,242,0.35)',
      padding: '0 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 54, flexShrink: 0,
    }}>
      {/* Logo + name */}
      <div onClick={() => navigate(isAdmin ? '/admin' : '/feed')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.4)', background: '#fff',
          flexShrink: 0,
        }}>
          <img src="/icons/icon-192.png" alt="GT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, letterSpacing: 1.5, color: '#fff', lineHeight: 1 }}>
            Get Talent
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', letterSpacing: '1.5px', fontWeight: 600 }}>
            TALENT GETS HIRED
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isLoggedIn && !isAdmin && (
          <button onClick={() => navigate('/notifications')}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 9999, cursor: 'pointer', position: 'relative', padding: '7px', color: '#fff', display: 'flex', alignItems: 'center' }}>
            <FiBell size={18} />
            {unread > 0 && (
              <span style={{ position: 'absolute', top: 2, right: 2, background: '#e41e3f', color: '#fff', borderRadius: 9999, fontSize: 9, fontWeight: 800, minWidth: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        )}
        {isLoggedIn && (
          <button onClick={handleLogout}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#fff', fontSize: 12, fontWeight: 600 }}>
            <FiLogOut size={14} />
          </button>
        )}
      </div>
    </header>
  );
}
