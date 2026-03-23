import React, { useState, useRef } from 'react';
import { uploadFile } from '../../utils/api';
import toast from 'react-hot-toast';

export default function PaymentModal({ type = 'player', fee, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!file) { toast.error('Please upload payment receipt'); return; }
    setLoading(true);
    try {
      const endpoint = type === 'player' ? '/players/upload-receipt' : '/captains/upload-receipt';
      await uploadFile(endpoint, file);
      toast.success('Receipt uploaded! Awaiting admin approval.');
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 env(safe-area-inset-bottom)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="scale-in" style={{
        background: '#ffffff', borderRadius: '24px 24px 0 0',
        width: '100%', maxWidth: 480, padding: '24px 20px 32px',
        border: '1px solid rgba(245,200,66,0.2)',
        borderBottom: 'none',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 4, margin: '0 auto 20px' }} />

        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, letterSpacing: 1, color: '#c8960a', marginBottom: 4 }}>
          💳 Payment Required
        </h2>
        <p style={{ color: '#6a7080', fontSize: 14, marginBottom: 20 }}>
          {type === 'player' ? 'Registration fee' : 'Subscription fee to start bidding'}
        </p>

        {/* Bank Details */}
        <div style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#6a7080', marginBottom: 8, fontWeight: 600, letterSpacing: '0.5px' }}>PAYMENT DETAILS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Bank', 'SADAPAY'],
              ['IBAN', 'PK79SADA0000003288649256'],
              ['Title', 'SAEED ANWAR'],
              ['Amount', `Rs. ${(fee || 0).toLocaleString()}`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#6a7080' }}>{label}:</span>
                <span style={{ fontWeight: 600, color: label === 'Amount' ? '#c8960a' : '#1a1a2e' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#6a7080', fontWeight: 600, marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Upload Payment Screenshot
          </div>
          <div
            onClick={() => inputRef.current.click()}
            style={{
              border: `2px dashed ${preview ? 'rgba(0,230,118,0.4)' : 'rgba(245,200,66,0.3)'}`,
              borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer',
              background: preview ? 'rgba(0,230,118,0.05)' : 'rgba(245,200,66,0.03)',
              transition: 'all 0.2s',
            }}>
            {preview ? (
              <img src={preview} alt="receipt" style={{ maxHeight: 140, borderRadius: 8, objectFit: 'contain' }} />
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
                <div style={{ color: '#6a7080', fontSize: 14 }}>Tap to select receipt image</div>
                <div style={{ color: '#9090a8', fontSize: 12, marginTop: 4 }}>PNG, JPG up to 5MB</div>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </div>

        {/* Info */}
        <div style={{ background: 'rgba(64,169,255,0.1)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#6a7080', display: 'flex', gap: 8 }}>
          <span>ℹ️</span>
          <span>After submission, admin will verify your payment within <strong style={{ color: '#1a1a2e' }}>1–3 business days</strong>.</span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 14, borderRadius: 12, background: 'transparent',
            border: '1px solid rgba(0,0,0,0.09)', color: '#6a7080',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !file} style={{
            flex: 2, padding: 14, borderRadius: 12,
            background: loading || !file ? '#e4e6ea' : 'linear-gradient(135deg, #f5c842, #e6a800)',
            border: 'none', color: loading || !file ? '#9090a8' : '#ffffff',
            fontSize: 15, fontWeight: 700, cursor: loading || !file ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Uploading...</> : '✓ Submit Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
}
