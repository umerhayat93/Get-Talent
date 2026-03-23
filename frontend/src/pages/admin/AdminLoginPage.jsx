import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import GTLogo from '../../components/common/GTLogo';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore(s => s.setAuth);
  const token    = useAuthStore(s => s.token);
  const role     = useAuthStore(s => s.user?.role);

  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPw,   setShowPw]   = useState(false);

  useEffect(() => {
    if (token && role === 'admin') navigate('/admin', { replace: true });
  }, [token, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password.trim()) { setError('Password is required'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', { password: password.trim() });
      setAuth(data.token, data.user);
      toast.success('Welcome, Admin!');
      navigate('/admin', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 400) {
        setError('Incorrect admin password');
      } else if (!err.response) {
        setError('Cannot reach server — check connection');
      } else {
        setError(`Server error (${status})`);
      }
      setPassword('');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px 20px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(245,200,66,0.07) 0%, transparent 55%), #0a1520',
    }}>
      <div style={{ width: '100%', maxWidth: 340 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <GTLogo size="lg" showSlogan />
          <div style={{ marginTop: 14, display: 'inline-block', padding: '4px 18px', background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.25)', borderRadius: 9999, fontSize: 11, color: '#f5c842', letterSpacing: '2.5px', fontWeight: 700 }}>
            ADMIN ACCESS
          </div>
        </div>

        <div style={{ background: '#1a2a3a', border: '1px solid rgba(245,200,66,0.15)', borderRadius: 20, padding: '28px 22px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, letterSpacing: 1, marginBottom: 4, color: '#eef2f7' }}>Admin Sign In</h2>
          <p style={{ color: '#4a5a6a', fontSize: 13, marginBottom: 22 }}>Enter your admin password to continue</p>

          {error && (
            <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#ff7070', display: 'flex', gap: 8 }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8899aa', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>
                Admin Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter admin password"
                  autoComplete="off"
                  style={{ width: '100%', padding: '13px 44px 13px 16px', background: '#f0ebe0', border: '1.5px solid rgba(0,0,0,0.09)', borderRadius: 12, color: '#eef2f7', fontSize: 15, outline: 'none', fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#f5c842'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.09)'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a5a6a', cursor: 'pointer', fontSize: 16 }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 12, background: loading ? '#ddd8ce' : 'linear-gradient(135deg, #f5c842, #e6a800)', border: 'none', color: loading ? '#4a5a6a' : '#0a1520', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {loading ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: '#888', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#ddd8ce' }}>
          <a href="/" style={{ color: '#4a5a6a', textDecoration: 'none' }}>← Back to app</a>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
