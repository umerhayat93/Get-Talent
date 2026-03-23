import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore(s => s.setAuth);
  const token    = useAuthStore(s => s.token);
  const role     = useAuthStore(s => s.user?.role);
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPw,   setShowPw]   = useState(false);

  useEffect(() => {
    if (token) navigate(role === 'admin' ? '/admin' : '/feed', { replace: true });
  }, [token, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim())    { setError('Phone number required'); return; }
    if (!password.trim()) { setError('Password required'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { phone: phone.trim(), password: password.trim() });
      if (!data?.token) { setError('Invalid response from server'); return; }
      setAuth(data.token, data.user);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/feed', { replace: true });
    } catch (err) {
      if (!err.response) setError('Cannot reach server. Check your connection.');
      else setError(err.response.data?.message || 'Incorrect phone or password');
      setPassword('');
    } finally { setLoading(false); }
  };

  const inp = {
    width: '100%', padding: '13px 16px',
    background: '#f0f2f5', border: '1.5px solid #e4e6ea',
    borderRadius: 12, color: '#050505', fontSize: 15, outline: 'none',
    fontFamily: 'Outfit,sans-serif', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const lbl = {
    display: 'block', fontSize: 11, fontWeight: 700, color: '#65676b',
    letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7,
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f0f2f5',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Sky blue header */}
      <div style={{
        background: 'linear-gradient(160deg,#1877f2 0%,#4293f5 60%,#87ceeb 100%)',
        borderRadius: 24, padding: '32px 24px 28px', textAlign: 'center',
        width: '100%', maxWidth: 400, marginBottom: 12,
        boxShadow: '0 8px 32px rgba(24,119,242,0.3)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', margin: '0 auto 12px', background: '#fff', border: '2px solid rgba(255,255,255,0.5)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            <img src="/icons/icon-192.png" alt="GT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 30, letterSpacing: 3, color: '#fff', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>GET TALENT</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', letterSpacing: '2.5px', fontWeight: 600, marginTop: 4 }}>TALENT GETS HIRED</div>
        </div>
      </div>

      {/* Login card */}
      <div style={{
        background: '#fff', borderRadius: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)', padding: '28px 24px',
        width: '100%', maxWidth: 400,
      }}>
        <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 26, letterSpacing: 1, color: '#050505', marginBottom: 4 }}>Sign In</h2>
        <p style={{ color: '#65676b', fontSize: 13, marginBottom: 22 }}>Enter your phone number and password</p>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: 10, padding: '11px 14px', marginBottom: 16, fontSize: 13, color: '#c62828' }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Phone Number</label>
            <input type="tel" value={phone} placeholder="03001234567"
              onChange={e => { setPhone(e.target.value); setError(''); }}
              style={inp}
              onFocus={e => { e.target.style.borderColor = '#1877f2'; e.target.style.boxShadow = '0 0 0 3px rgba(24,119,242,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e4e6ea'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={{ marginBottom: 24, position: 'relative' }}>
            <label style={lbl}>Password</label>
            <input type={showPw ? 'text' : 'password'} value={password} placeholder="Your password"
              onChange={e => { setPassword(e.target.value); setError(''); }}
              style={{ ...inp, paddingRight: 44 }}
              onFocus={e => { e.target.style.borderColor = '#1877f2'; e.target.style.boxShadow = '0 0 0 3px rgba(24,119,242,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e4e6ea'; e.target.style.boxShadow = 'none'; }}
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: 14, top: '62%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#65676b' }}>
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: loading ? '#8ab4f8' : '#1877f2', border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Outfit,sans-serif' }}>
            {loading ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Signing in...</> : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: '#e4e6ea' }} />
          <span style={{ fontSize: 12, color: '#8a8d91', fontWeight: 500 }}>New here? Register as</span>
          <div style={{ flex: 1, height: 1, background: '#e4e6ea' }} />
        </div>

        {/* Register options — clean text only, no icons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Player',    path: '/register/player',    color: '#FFFFFF' },
            { label: 'Captain',   path: '/register/captain',   color: '#FFFFFF' },
            { label: 'Fan',       path: '/register/fan',       color: '#FFFFFF' },
            { label: 'Organiser', path: '/register/organiser', color: '#FFFFFF' },
          ].map(({ label, path, color }) => (
            <button key={path} onClick={() => navigate(path)}
              style={{
                padding: '11px', borderRadius: 10,
                background: '#e7f3ff', border: '1px solid #c3d9fd',
                color, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Outfit,sans-serif', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#d0e8ff'}
              onMouseLeave={e => e.currentTarget.style.background = '#e7f3ff'}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
