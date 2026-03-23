import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step,        setStep]        = useState('email'); // email | reset | done
  const [email,       setEmail]       = useState('');
  const [phoneHint,   setPhoneHint]   = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [showPw,      setShowPw]      = useState(false);

  const handleFindAccount = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Enter your Gmail address'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim() });
      setPhoneHint(data.phoneHint);
      setStep('reset');
      toast.success('Account found!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No account with this email');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: email.trim(), newPassword });
      setStep('done');
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  const inp = { width:'100%', padding:'12px 16px', background:'#f0f2f5', border:'1.5px solid #e4e6ea', borderRadius:12, color:'#050505', fontSize:15, outline:'none', fontFamily:'Outfit,sans-serif', boxSizing:'border-box' };
  const lbl = { display:'block', fontSize:11, fontWeight:700, color:'#65676b', letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:7 };

  return (
    <div style={{ minHeight:'100vh', background:'#f0f2f5', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#1877f2,#4293f5,#87ceeb)', borderRadius:20, padding:'28px 24px', textAlign:'center', width:'100%', maxWidth:400, marginBottom:12, boxShadow:'0 8px 32px rgba(24,119,242,0.3)' }}>
        <div style={{ width:56, height:56, borderRadius:14, overflow:'hidden', margin:'0 auto 12px', background:'#fff', border:'2px solid rgba(255,255,255,0.5)' }}>
          <img src="/icons/icon-192.png" alt="GT" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:24, letterSpacing:3, color:'#fff', lineHeight:1 }}>
          {step === 'email' ? 'Forgot Password' : step === 'reset' ? 'Set New Password' : 'Password Reset!'}
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:20, boxShadow:'0 4px 24px rgba(0,0,0,0.1)', padding:'28px 24px', width:'100%', maxWidth:400 }}>

        {step === 'email' && (
          <>
            <p style={{ color:'#65676b', fontSize:14, marginBottom:22, lineHeight:1.6 }}>
              Enter the Gmail address you registered with. We'll find your account and let you set a new password.
            </p>
            <form onSubmit={handleFindAccount} noValidate>
              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Your Gmail Address</label>
                <input type="email" value={email} placeholder="yourname@gmail.com"
                  onChange={e => setEmail(e.target.value)} style={inp}
                  onFocus={e => { e.target.style.borderColor='#1877f2'; e.target.style.boxShadow='0 0 0 3px rgba(24,119,242,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor='#e4e6ea'; e.target.style.boxShadow='none'; }}
                />
              </div>
              <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', borderRadius:12, background: loading?'#8ab4f8':'#1877f2', border:'none', color:'#fff', fontSize:15, fontWeight:800, cursor: loading?'not-allowed':'pointer', fontFamily:'Outfit,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {loading ? <><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite' }} />Finding...</> : 'Find My Account'}
              </button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <div style={{ background:'#e7f3ff', border:'1px solid #c3d9fd', borderRadius:12, padding:'12px 14px', marginBottom:20 }}>
              <div style={{ fontSize:12, color:'#65676b', marginBottom:2 }}>Account found for</div>
              <div style={{ fontWeight:700, fontSize:15, color:'#1877f2' }}>{email}</div>
              <div style={{ fontSize:12, color:'#65676b', marginTop:4 }}>Phone: {phoneHint}</div>
            </div>
            <form onSubmit={handleResetPassword} noValidate>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>New Password (min 6 chars)</label>
                <div style={{ position:'relative' }}>
                  <input type={showPw?'text':'password'} value={newPassword} placeholder="Choose a new password"
                    onChange={e => setNewPassword(e.target.value)} style={{ ...inp, paddingRight:44 }}
                    onFocus={e => { e.target.style.borderColor='#1877f2'; e.target.style.boxShadow='0 0 0 3px rgba(24,119,242,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor='#e4e6ea'; e.target.style.boxShadow='none'; }}
                  />
                  <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:16,color:'#65676b' }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom:22 }}>
                <label style={lbl}>Confirm New Password</label>
                <input type="password" value={confirm} placeholder="Repeat new password"
                  onChange={e => setConfirm(e.target.value)} style={inp}
                  onFocus={e => { e.target.style.borderColor='#1877f2'; e.target.style.boxShadow='0 0 0 3px rgba(24,119,242,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor='#e4e6ea'; e.target.style.boxShadow='none'; }}
                />
              </div>
              <button type="submit" disabled={loading} style={{ width:'100%', padding:'13px', borderRadius:12, background: loading?'#8ab4f8':'#1877f2', border:'none', color:'#fff', fontSize:15, fontWeight:800, cursor: loading?'not-allowed':'pointer', fontFamily:'Outfit,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {loading ? <><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite' }} />Resetting...</> : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign:'center', padding:'8px 0' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
            <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:26, color:'#1877f2', marginBottom:8 }}>Password Reset!</h3>
            <p style={{ color:'#65676b', lineHeight:1.7, marginBottom:24, fontSize:14 }}>
              Your password has been changed. You can now login with your new password.
            </p>
            <button onClick={() => navigate('/login')} style={{ width:'100%', padding:'13px', borderRadius:12, background:'#1877f2', border:'none', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'Outfit,sans-serif' }}>
              Go to Login
            </button>
          </div>
        )}

        {step !== 'done' && (
          <button onClick={() => navigate('/login')} style={{ width:'100%', padding:'10px', borderRadius:10, background:'transparent', border:'none', color:'#65676b', fontSize:13, cursor:'pointer', marginTop:14, fontFamily:'Outfit,sans-serif' }}>
            ← Back to Login
          </button>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
