import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import GTLogo from '../components/common/GTLogo';

export default function RegisterFanPage() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore(s => s.setAuth);
  const [form, setForm]     = useState({ name: '', phone: '', password: '', confirm: '' });
  const [errs, setErrs]     = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrs(e => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim() || form.phone.trim().length < 10) e.phone = 'Enter valid phone (min 10 digits)';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/register/fan', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      toast.success('Welcome to Get Talent! Login to watch live bidding.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '12px 16px', background: '#f0ebe0', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 12, color: '#050505', fontSize: 15, outline: 'none', fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#65676b', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', padding: '28px 20px 48px', background: '#f0f2f5', maxWidth: 440, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <GTLogo size="md" />
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, letterSpacing: 1, marginTop: 14, color: '#050505', lineHeight: 1 }}>
          Fan Registration
        </h1>
        <p style={{ color: '#8a8d91', fontSize: 13, marginTop: 6 }}>Watch live cricket player auctions for free</p>
      </div>

      {/* What fans can do */}
      <div style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#8a8d91', fontWeight: 700, letterSpacing: '0.8px', marginBottom: 10 }}>AS A FAN YOU CAN</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            { icon: '👀', text: 'Watch live player auctions in real-time' },
            { icon: '🏏', text: 'View all player profiles and categories' },
            { icon: '📊', text: 'See live bids and auction results' },
            { icon: '🔔', text: 'Get notifications for new auctions' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: '#65676b' }}>
              <span style={{ fontSize: 16 }}>{icon}</span> {text}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,68,68,0.08)', borderRadius: 8, fontSize: 12, color: '#ff7070' }}>
          ⚠ Fans cannot place bids. Register as Captain to bid on players.
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 20, padding: '22px 18px' }}>
        <form onSubmit={handleSubmit} noValidate>

          {[
            { key: 'name',     label: 'Full Name',            type: 'text',     ph: 'Your full name'     },
            { key: 'phone',    label: 'Phone (Login ID)',      type: 'tel',      ph: '03xxxxxxxxx'        },
            { key: 'password', label: 'Password (min 6 chars)',type: 'password', ph: 'Choose a password'  },
            { key: 'confirm',  label: 'Confirm Password',     type: 'password', ph: 'Repeat password'    },
          ].map(({ key, label, type, ph }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={lbl}>{label}</label>
              <input type={type} placeholder={ph} value={form[key]}
                onChange={e => setField(key, e.target.value)}
                style={{ ...inp, borderColor: errs[key] ? '#ff4444' : 'rgba(0,0,0,0.08)' }}
                onFocus={e => e.target.style.borderColor = '#00e676'}
                onBlur={e => e.target.style.borderColor = errs[key] ? '#ff4444' : 'rgba(0,0,0,0.08)'}
              />
              {errs[key] && <p style={{ fontSize: 12, color: '#ff6666', marginTop: 4 }}>{errs[key]}</p>}
              {key === 'phone' && !errs[key] && <p style={{ fontSize: 12, color: '#8a8d91', marginTop: 4 }}>Used as your login ID</p>}
            </div>
          ))}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 14, background: loading ? '#e4e6ea' : 'linear-gradient(135deg, #00e676, #00b85c)', border: 'none', color: loading ? '#9090a8' : '#ffffff', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 }}>
            {loading ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: '#888', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Registering...</> : '👀 Register as Fan — Free'}
          </button>

          <p style={{ textAlign: 'center', color: '#8a8d91', fontSize: 13, marginTop: 14 }}>
            Want to bid? <Link to="/register/captain" style={{ color: '#1877f2', fontWeight: 600 }}>Register as Captain</Link>
          </p>
          <p style={{ textAlign: 'center', color: '#8a8d91', fontSize: 13, marginTop: 6 }}>
            Already registered? <Link to="/login" style={{ color: '#1877f2', fontWeight: 600 }}>Login</Link>
          </p>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
