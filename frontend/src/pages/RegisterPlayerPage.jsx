import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import GTLogo from '../components/common/GTLogo';
import PaymentModal from '../components/common/PaymentModal';

const CATS = [
  { name: 'Diamond', fee: 10000, minBid: 20000, icon: '💎', color: '#40a9ff' },
  { name: 'Gold',    fee: 7000,  minBid: 10000, icon: '🥇', color: '#1877f2' },
  { name: 'Silver',  fee: 5000,  minBid: 8000,  icon: '🥈', color: '#c0c0c0' },
  { name: 'Emerging',fee: 3000,  minBid: 6000,  icon: '⭐', color: '#00e676' },
];
const SKILLS = [
  { value: 'Batter',      icon: '🏏' },
  { value: 'Bowler',      icon: '⚾' },
  { value: 'All-Rounder', icon: '⚡' },
];

export default function RegisterPlayerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '', skill: 'Batter', category: 'Gold' });
  const [errs, setErrs] = useState({});

  const cat = CATS.find(c => c.name === form.category) || CATS[1];

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrs(e => ({ ...e, [k]: undefined }));
  };

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
      await api.post('/auth/register/player', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        password: form.password,
        skill: form.skill,
        category: form.category,
      });
      setStep('success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f0f2f5' }}>
      <div style={{ textAlign: 'center', maxWidth: 340, width: '100%' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 32, color: '#1877f2', marginBottom: 8 }}>Registered!</h2>
        <p style={{ color: '#65676b', lineHeight: 1.7, marginBottom: 4 }}>
          Account created. You can login now with your phone and password.
        </p>
        <p style={{ color: '#8a8d91', fontSize: 13, marginBottom: 24 }}>
          Pay registration fee (Rs. {cat.fee.toLocaleString()}) to get approved for bidding.
        </p>
        <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '14px', borderRadius: 13, background: 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: '#ffffff', fontSize: 16, fontWeight: 800, cursor: 'pointer', marginBottom: 10 }}>
          Login Now
        </button>
        <button onClick={() => setShowPayment(true)} style={{ width: '100%', padding: '12px', borderRadius: 13, background: 'transparent', border: '1px solid rgba(245,200,66,0.3)', color: '#1877f2', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
          Pay Registration Fee (Rs. {cat.fee.toLocaleString()})
        </button>
        <p style={{ color: '#8a8d91', fontSize: 12, marginTop: 12 }}>You can also pay later from your profile page</p>
      </div>
      {showPayment && <PaymentModal type="player" fee={cat.fee} onClose={() => setShowPayment(false)} onSuccess={() => { setShowPayment(false); navigate('/login'); }} />}
    </div>
  );

  const inp = { width: '100%', padding: '12px 16px', background: '#f0ebe0', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 12, color: '#050505', fontSize: 15, outline: 'none', fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#65676b', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', padding: '28px 20px 48px', background: '#f0f2f5', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <GTLogo size="md" />
        <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, letterSpacing: 1, marginTop: 12, color: '#050505', lineHeight: 1 }}>Player Registration</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 20, padding: '22px 18px', marginBottom: 14 }}>

          {/* Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Full Name</label>
            <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Your full name" style={{ ...inp, borderColor: errs.name ? '#ff4444' : 'rgba(0,0,0,0.08)' }} onFocus={e => e.target.style.borderColor = '#1877f2'} onBlur={e => e.target.style.borderColor = errs.name ? '#ff4444' : 'rgba(0,0,0,0.08)'} />
            {errs.name && <p style={{ fontSize: 12, color: '#ff6666', marginTop: 4 }}>{errs.name}</p>}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Phone Number (Login ID)</label>
            <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="03xxxxxxxxx" style={{ ...inp, borderColor: errs.phone ? '#ff4444' : 'rgba(0,0,0,0.08)' }} onFocus={e => e.target.style.borderColor = '#1877f2'} onBlur={e => e.target.style.borderColor = errs.phone ? '#ff4444' : 'rgba(0,0,0,0.08)'} />
            {errs.phone && <p style={{ fontSize: 12, color: '#ff6666', marginTop: 4 }}>{errs.phone}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Password (min 6 chars)</label>
            <input type="password" value={form.password} onChange={e => setField('password', e.target.value)} placeholder="Choose a password" style={{ ...inp, borderColor: errs.password ? '#ff4444' : 'rgba(0,0,0,0.08)' }} onFocus={e => e.target.style.borderColor = '#1877f2'} onBlur={e => e.target.style.borderColor = errs.password ? '#ff4444' : 'rgba(0,0,0,0.08)'} />
            {errs.password && <p style={{ fontSize: 12, color: '#ff6666', marginTop: 4 }}>{errs.password}</p>}
          </div>

          {/* Confirm */}
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Confirm Password</label>
            <input type="password" value={form.confirm} onChange={e => setField('confirm', e.target.value)} placeholder="Repeat password" style={{ ...inp, borderColor: errs.confirm ? '#ff4444' : 'rgba(0,0,0,0.08)' }} onFocus={e => e.target.style.borderColor = '#1877f2'} onBlur={e => e.target.style.borderColor = errs.confirm ? '#ff4444' : 'rgba(0,0,0,0.08)'} />
            {errs.confirm && <p style={{ fontSize: 12, color: '#ff6666', marginTop: 4 }}>{errs.confirm}</p>}
          </div>

          {/* Skill */}
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Playing Role</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {SKILLS.map(s => (
                <button key={s.value} type="button" onClick={() => setField('skill', s.value)}
                  style={{ flex: 1, padding: '10px 6px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${form.skill === s.value ? '#1877f2' : 'rgba(0,0,0,0.07)'}`, background: form.skill === s.value ? 'rgba(245,200,66,0.1)' : 'transparent', color: form.skill === s.value ? '#1877f2' : '#6a7080', textAlign: 'center', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{s.value}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={lbl}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {CATS.map(c => (
                <div key={c.name} onClick={() => setField('category', c.name)}
                  style={{ padding: '12px 10px', borderRadius: 14, cursor: 'pointer', textAlign: 'center', border: `2px solid ${form.category === c.name ? c.color : 'rgba(0,0,0,0.07)'}`, background: form.category === c.name ? `${c.color}15` : 'transparent', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: form.category === c.name ? c.color : '#1a1a2e', marginBottom: 3 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#8a8d91' }}>Rs. {c.fee.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#00e676' }}>Bid: Rs. {c.minBid.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fee summary */}
        <div style={{ background: 'rgba(245,200,66,0.07)', border: '1px solid rgba(245,200,66,0.15)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: 11, color: '#65676b', fontWeight: 600, marginBottom: 2 }}>Registration Fee</div><div style={{ fontSize: 20, fontWeight: 800, color: '#1877f2' }}>Rs. {cat.fee.toLocaleString()}</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11, color: '#65676b', fontWeight: 600, marginBottom: 2 }}>Minimum Bid</div><div style={{ fontSize: 20, fontWeight: 800, color: '#00e676' }}>Rs. {cat.minBid.toLocaleString()}</div></div>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 14, background: loading ? '#e4e6ea' : 'linear-gradient(135deg,#f5c842,#e6a800)', border: 'none', color: loading ? '#9090a8' : '#ffffff', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {loading ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: '#888', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Registering...</> : 'Register as Player'}
        </button>

        <p style={{ textAlign: 'center', color: '#8a8d91', fontSize: 13, marginTop: 14 }}>
          Already registered? <Link to="/login" style={{ color: '#1877f2', fontWeight: 600 }}>Login</Link>
        </p>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
