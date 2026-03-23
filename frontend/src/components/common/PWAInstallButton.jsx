import React, { useState, useEffect } from 'react';

export default function PWAInstallButton() {
  const [prompt,     setPrompt]     = useState(null);
  const [visible,    setVisible]    = useState(false);
  const [installing, setInstalling] = useState(false);
  const [dismissed,  setDismissed]  = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    setInstalling(true);
    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setVisible(false);
      setPrompt(null);
    } finally {
      setInstalling(false);
    }
  };

  if (!visible || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 84, // above bottom nav
      left: 14,
      zIndex: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      filter: 'drop-shadow(0 4px 16px rgba(24,119,242,0.35))',
      animation: 'pwaSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      {/* Main install button */}
      <button
        onClick={handleInstall}
        disabled={installing}
        title="Install Get Talent App"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '10px 14px 10px 10px',
          background: 'linear-gradient(135deg,#1877f2,#166fe5)',
          border: 'none',
          borderRadius: '14px 0 0 14px',
          color: '#fff',
          cursor: installing ? 'not-allowed' : 'pointer',
          fontFamily: 'Outfit,sans-serif',
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 9, overflow: 'hidden', background: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', flexShrink: 0 }}>
          <img src="/icons/icon-72.png" alt="GT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>
            {installing ? 'Installing…' : 'Install GT App'}
          </div>
          <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 400 }}>Add to home screen</div>
        </div>
        {/* Down arrow — pure CSS */}
        {!installing && (
          <div style={{
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '7px solid rgba(255,255,255,0.7)',
            marginLeft: 2,
            flexShrink: 0,
          }} />
        )}
        {installing && (
          <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        )}
      </button>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          width: 30, height: '100%', minHeight: 52,
          background: 'rgba(24,119,242,0.85)',
          border: 'none',
          borderRadius: '0 14px 14px 0',
          borderLeft: '1px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>

      <style>{`
        @keyframes pwaSlideIn {
          from { opacity:0; transform:translateX(-20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
