import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      if (data.user.status === 'pending') toast('⏳ Account pending approval', { duration: 4000 });
      navigate('/feed', { replace: true });
    } catch (err) {
      if (!err.response) setError('Cannot reach server. Check your connection.');
      else setError(err.response.data?.message || 'Incorrect phone or password');
      setPassword('');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', flexDirection: 'column' }}>
      {/* Sky blue header banner */}
      <div style={{
        background: 'linear-gradient(160deg, #1877f2 0%, #4293f5 60%, #87ceeb 100%)',
        padding: '40px 24px 56px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, overflow: 'hidden',
            border: '3px solid rgba(255,255,255,0.5)', margin: '0 auto 14px',
            background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            <img src="/icons/icon-192.png" alt="GT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 34, letterSpacing: 3, color: '#fff', lineHeight: 1 }}>
            GET TALENT
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', letterSpacing: '2px', fontWeight: 500, marginTop: 4 }}>
            TALENT GETS HIRED
          </div>
        </div>
      </div>

      {/* Login card — floats over header */}
      <div style={{ flex: 1, padding: '0 16px 40px', marginTop: -28 }}>
        <div style={{
          background: '#fff', borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          padding: '28px 24px',
          maxWidth: 400, margin: '0 auto',
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
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#65676b', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>
                Phone Number
              </label>
              <input type="tel" value={phone} placeholder="03001234567"
                onChange={e => { setPhone(e.target.value); setError(''); }}
                style={{ width: '100%', padding: '12px 16px', background: '#f0f2f5', border: '1.5px solid #e4e6ea', borderRadius: 12, color: '#050505', fontSize: 15, outline: 'none', fontFamily: 'Outfit,sans-serif', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#1877f2'; e.target.style.boxShadow = '0 0 0 3px rgba(24,119,242,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e4e6ea'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ marginBottom: 22, position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#65676b', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>
                Password
              </label>
              <input type={showPw ? 'text' : 'password'} value={password} placeholder="Your password"
                onChange={e => { setPassword(e.target.value); setError(''); }}
                style={{ width: '100%', padding: '12px 44px 12px 16px', background: '#f0f2f5', border: '1.5px solid #e4e6ea', borderRadius: 12, color: '#050505', fontSize: 15, outline: 'none', fontFamily: 'Outfit,sans-serif', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#1877f2'; e.target.style.boxShadow = '0 0 0 3px rgba(24,119,242,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e4e6ea'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(10%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#65676b' }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: loading ? '#8ab4f8' : '#1877f2', border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Outfit,sans-serif' }}>
              {loading ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid #e4e6ea', marginTop: 22, paddingTop: 18, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#65676b', marginBottom: 14 }}>Don't have an account? Register as:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '🏏 Player',    path: '/register/player' },
                { label: '🏆 Captain',   path: '/register/captain' },
                { label: '👀 Fan',       path: '/register/fan' },
                { label: '🏟️ Organiser', path: '/register/organiser' },
              ].map(({ label, path }) => (
                <button key={path} onClick={() => navigate(path)}
                  style={{ padding: '10px', borderRadius: 10, background: '#e7f3ff', border: '1px solid #bbdefb', color: '#1877f2', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
