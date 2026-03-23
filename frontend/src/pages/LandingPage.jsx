import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import GTLogo from '../components/common/GTLogo';

export default function LandingPage() {
  const navigate = useNavigate();
  const token = useAuthStore(s => s.token);
  const role  = useAuthStore(s => s.user?.role);

  useEffect(() => {
    if (!token) return;
    if (role === 'admin')     navigate('/admin', { replace: true });
    else if (role === 'organiser') navigate('/organiser', { replace: true });
    else                           navigate('/feed', { replace: true });
  }, [token, role, navigate]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      background: 'linear-gradient(160deg,#1877f2 0%,#4293f5 50%,#87ceeb 100%)',
      textAlign: 'center',
    }}>
      <div style={{ marginBottom: 36 }}>
        <GTLogo size="2xl" showSlogan />
      </div>

      <p style={{ fontSize: 14, color: '#9090a8', lineHeight: 1.8, maxWidth: 300, marginBottom: 44 }}>
        Pakistan's premier cricket player<br />auction and bidding platform
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>

        <button onClick={() => navigate('/login')} style={{ padding: '15px 24px', borderRadius: 14, background: 'linear-gradient(135deg, #f5c842, #e6a800)', border: 'none', color: '#ffffff', fontSize: 17, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(245,200,66,0.25)', transition: 'transform 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}>
          Login
        </button>

        {/* Role cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
          {[
            { path: '/register/player',   icon: '🏏', label: 'Register as\nPlayer',    color: '#1877f2', bg: 'rgba(245,200,66,0.07)',  border: 'rgba(245,200,66,0.25)' },
            { path: '/register/captain',  icon: '👑', label: 'Register as\nCaptain',   color: '#40a9ff', bg: 'rgba(64,169,255,0.07)',  border: 'rgba(64,169,255,0.2)'  },
            { path: '/register/fan',      icon: '👀', label: 'Watch as\nFan — Free',  color: '#00e676', bg: 'rgba(0,230,118,0.07)',   border: 'rgba(0,230,118,0.2)'   },
            { path: '/register/organiser',icon: '🏟️', label: 'Organise\nTournament', color: '#ff9500', bg: 'rgba(255,149,0,0.07)',   border: 'rgba(255,149,0,0.2)'   },
          ].map(({ path, icon, label, color, bg, border }) => (
            <button key={path} onClick={() => navigate(path)}
              style={{ padding: '14px 10px', borderRadius: 13, background: bg, border: `1.5px solid ${border}`, color, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1.4, whiteSpace: 'pre' }}
              onMouseEnter={e => e.currentTarget.style.background = bg.replace('0.07', '0.13')}
              onMouseLeave={e => e.currentTarget.style.background = bg}>
              <div style={{ fontSize: 22, marginBottom: 5 }}>{icon}</div>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature pills */}
      <div style={{ display: 'flex', gap: 8, marginTop: 44, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Live Auctions', 'Real-time Bidding', 'PPL · BPL'].map(f => (
          <span key={f} style={{ padding: '5px 14px', borderRadius: 9999, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.07)', fontSize: 11, color: '#9090a8', fontWeight: 500 }}>{f}</span>
        ))}
      </div>

      <div style={{ marginTop: 36, fontSize: 12, color: '#1e2e3e' }}>
        Admin?{' '}
        <span onClick={() => navigate('/admin/login')} style={{ color: '#3a4a5a', cursor: 'pointer', textDecoration: 'underline' }}>
          Sign in here
        </span>
      </div>
    </div>
  );
}
