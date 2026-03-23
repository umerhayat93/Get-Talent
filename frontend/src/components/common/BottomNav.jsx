import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUser } from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';

const navItems = [
  { path: '/feed',    icon: FiHome,       label: 'Feed' },
  { path: '/bidding', icon: GiCricketBat, label: 'Bidding' },
  { path: '/profile', icon: FiUser,       label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: '#ffffff',
      borderTop: '1px solid #e4e6ea',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'stretch',
      height: 68,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {navItems.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path || location.pathname.startsWith(path + '/');
        return (
          <button key={path} onClick={() => navigate(path)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, background: 'none', border: 'none', cursor: 'pointer',
            color: active ? '#1877f2' : '#65676b',
            transition: 'color 0.2s',
            position: 'relative',
          }}>
            {active && <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 28, height: 3, background: '#1877f2',
              borderRadius: '0 0 4px 4px',
            }} />}
            <Icon size={22} />
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, letterSpacing: '0.2px' }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
