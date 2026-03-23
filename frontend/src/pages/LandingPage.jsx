import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const token = useAuthStore(s => s.token);
  const role  = useAuthStore(s => s.user?.role);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) return;
    if (role === 'admin')     navigate('/admin',     { replace: true });
    else if (role === 'organiser') navigate('/organiser', { replace: true });
    else navigate('/feed', { replace: true });
  }, [token, role, navigate]);

  const glass = {
    background: 'rgba(255,255,255,0.14)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 18,
  };

  const goldText = {
    background: 'linear-gradient(135deg,#ffd700,#f5a623,#ffd700)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#0d47a1 0%,#1565c0 30%,#1976d2 55%,#42a5f5 80%,#87ceeb 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px', position: 'relative', overflow: 'hidden',
    }}>

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,215,0,0.08)', top: -80, right: -80, filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -60, left: -60, filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,215,0,0.05)', top: '40%', left: '10%', filter: 'blur(30px)' }} />

      <div style={{ width: '100%', maxWidth: 360, position: 'relative', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.6s cubic-bezier(0.34,1.2,0.64,1)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 100, height: 100, borderRadius: 26, overflow: 'hidden',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 0 3px rgba(255,215,0,0.4)',
            border: '2px solid rgba(255,255,255,0.3)',
            background: '#fff',
          }}>
            <img src="/icons/icon-192.png" alt="Get Talent" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 40, letterSpacing: 4, lineHeight: 1, ...goldText }}>
            GET TALENT
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', letterSpacing: '3px', fontWeight: 600, marginTop: 5 }}>
            TALENT GETS HIRED
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 12, lineHeight: 1.7 }}>
            Pakistan's premier cricket player<br />auction and bidding platform
          </p>
        </div>

        {/* Login button */}
        <button onClick={() => navigate('/login')}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, marginBottom: 14,
            background: 'linear-gradient(135deg,#ffd700,#f5a623)',
            border: 'none', color: '#1a1000',
            fontSize: 17, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(245,166,35,0.45), 0 0 0 1px rgba(255,255,255,0.15)',
            fontFamily: 'Outfit,sans-serif',
            letterSpacing: '0.5px',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(245,166,35,0.55)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 24px rgba(245,166,35,0.45)'; }}>
          Sign In
        </button>

        {/* Register cards — glassmorphism */}
        <div style={{ ...glass, padding: '18px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.5)', marginBottom: 12, textAlign: 'center' }}>
            NEW? REGISTER AS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { path: '/register/player',    label: 'Player',    sub: 'Join auctions',      accent: '#FFFFFF' },
              { path: '/register/captain',   label: 'Captain',   sub: 'Build your team',    accent: '#FFFFFF' },
              { path: '/register/fan',       label: 'Fan',       sub: 'Watch for free',     accent: '#FFFFFF' },
              { path: '/register/organiser', label: 'Organiser', sub: 'Run tournaments',    accent: '#FFFFFF' },
            ].map(({ path, label, sub, accent }) => (
              <button key={path} onClick={() => navigate(path)}
                style={{
                  padding: '13px 10px', borderRadius: 13,
                  background: 'rgba(255,255,255,0.09)',
                  border: `1px solid rgba(255,255,255,0.15)`,
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.15s', fontFamily: 'Outfit,sans-serif',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.borderColor = `${accent}55`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: accent, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 7, marginTop: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Live Auctions', 'Real-time Bidding', 'GET · Hired'].map(f => (
            <span key={f} style={{
              padding: '4px 12px', borderRadius: 9999,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: 11, color: '#ffffff', fontWeight: 600,
            }}>{f}</span>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
          Admin?{' '}
          <span onClick={() => navigate('/admin/login')}
            style={{ color: 'rgba(255,215,0,0.7)', cursor: 'pointer', textDecoration: 'underline' }}>
            Sign in here
          </span>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
