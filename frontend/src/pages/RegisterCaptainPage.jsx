import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import GTLogo from '../components/common/GTLogo';
import PaymentModal from '../components/common/PaymentModal';
import { useAuthStore } from '../store/authStore';

export default function RegisterCaptainPage() {
  const navigate  = useNavigate();
  const setAuth   = useAuthStore(s => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form');
  const [showPayment, setShowPayment] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', teamName: '', password: '', confirm: '' });
  const [errs, setErrs] = useState({});

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrs(e => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim() || form.phone.trim().length < 10) e.phone = 'Enter valid phone (min 10 digits)';
    if (!form.teamName.trim()) e.teamName = 'Required';
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
      const { data } = await api.post('/auth/register/captain', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        teamName: form.teamName.trim(),
        password: form.password,
      });
      // Auto-login with returned token so receipt upload works immediately
      if (data.token && data.user) {
        setAuth(data.token, data.user);
      }
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
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e7f3ff', border: '2px solid #1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>👑</div>
        <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 30, color: '#1877f2', marginBottom: 8 }}>Captain Registered!</h2>
        <p style={{ color: '#65676b', lineHeight: 1.7, marginBottom: 24, fontSize: 14 }}>
          Account created successfully!<br />
          You can login now. Pay subscription to unlock bidding.
        </p>
        <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '14px', borderRadius: 13, background: '#1877f2', border: 'none', color: '#ffffff', fontSize: 16, fontWeight: 800, cursor: 'pointer', marginBottom: 10, fontFamily: 'Outfit,sans-serif' }}>
          Login Now
        </button>
        <button onClick={() => setShowPayment(true)} style={{ width: '100%', padding: '12px', borderRadius: 13, background: '#e7f3ff', border: '1px solid #1877f2', color: '#1877f2', fontSize: 14, cursor: 'pointer', fontWeight: 600, marginBottom: 8, fontFamily: 'Outfit,sans-serif' }}>
          Pay Subscription — Rs. 3,000
        </button>
        <p style={{ color: '#8a8d91', fontSize: 12 }}>You can pay later from your profile</p>
      </div>
      {showPayment && <PaymentModal type="captain" fee={3000} onClose={() => setShowPayment(false)} onSuccess={() => { setShowPayment(false); navigate('/login'); }} />}
    </div>
  );

  const inp = { width: '100%', padding: '12px 16px', background: '#f0f2f5', border: '1.5px solid #e4e6ea', borderRadius: 12, color: '#050505', fontSize: 15, outline: 'none', fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#65676b', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 };

  const fields = [
    { key: 'name',     label: 'Full Name',       type: 'text',     ph: 'Your full name'     },
    { key: 'phone',    label: 'Phone (Login ID)', type: 'tel',      ph: '03xxxxxxxxx'        },
    { key: 'teamName', label: 'Team Name',        type: 'text',     ph: 'e.g. Lahore BadShah'  },
    { key: 'password', label: 'Password (min 6)', type: 'password', ph: 'Choose a password'  },
    { key: 'confirm',  label: 'Confirm Password', type: 'password', ph: 'Repeat password'    },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '28px 20px 48px', background: '#f0f2f5', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <GTLogo size="md" />
        <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, letterSpacing: 1, marginTop: 12, color: '#050505', lineHeight: 1 }}>Captain Registration</h1>
        <p style={{ color: '#8a8d91', fontSize: 13, marginTop: 6 }}>Free to register · Rs. 3,000 subscription to bid</p>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e4e6ea', borderRadius: 20, padding: '22px 18px' }}>
        <form onSubmit={handleSubmit} noValidate>
          {fields.map(({ key, label, type, ph }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={lbl}>{label}</label>
              <input
                type={type} value={form[key]} placeholder={ph}
                onChange={e => setField(key, e.target.value)}
                style={{ ...inp, borderColor: errs[key] ? '#ff4444' : '#e4e6ea' }}
                onFocus={e => e.target.style.borderColor = '#1877f2'}
                onBlur={e => e.target.style.borderColor = errs[key] ? '#ff4444' : '#e4e6ea'}
              />
              {errs[key] && <p style={{ fontSize: 12, color: '#ff6666', marginTop: 4 }}>{errs[key]}</p>}
              {key === 'phone' && !errs[key] && <p style={{ fontSize: 12, color: '#8a8d91', marginTop: 4 }}>Used as your login ID</p>}
            </div>
          ))}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 14, background: loading ? '#e4e6ea' : '#1877f2', border: 'none', color: loading ? '#9090a8' : '#ffffff', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8, fontFamily: 'Outfit,sans-serif' }}>
            {loading ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Registering...</> : 'Register as Captain'}
          </button>

          <p style={{ textAlign: 'center', color: '#8a8d91', fontSize: 13, marginTop: 14 }}>
            Already registered? <Link to="/login" style={{ color: '#1877f2', fontWeight: 600 }}>Login</Link>
          </p>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
    }
