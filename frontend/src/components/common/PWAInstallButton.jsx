import React, { useState, useEffect } from 'react';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible,    setVisible]    = useState(false);
  const [installing, setInstalling] = useState(false);
  const [pulse,      setPulse]      = useState(false);

  useEffect(() => {
    // Already installed (standalone mode)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) return;

    // Already dismissed this session
    if (sessionStorage.getItem('gt_pwa_dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Pulse every 6 seconds to draw attention
    const iv = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }, 6000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearInterval(iv);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setVisible(false);
      setDeferredPrompt(null);
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('gt_pwa_dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: 82,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'stretch',
        filter: 'drop-shadow(0 4px 20px rgba(245,200,66,0.4))',
        animation: 'pwaSlideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        {/* Install button */}
        <button
          onClick={handleInstall}
          disabled={installing}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 18px',
            background: 'linear-gradient(135deg,#f5c842,#e6a800)',
            border: 'none',
            borderRadius: '14px 0 0 14px',
            color: '#ffffff',
            cursor: installing ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit,sans-serif',
            animation: pulse ? 'pwaPulse 0.8s ease' : 'none',
          }}
        >
          {/* Logo using PNG */}
          <img
            src="/icons/icon-72.png"
            alt="GT"
            style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0 }}
          />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>
              {installing ? 'Installing…' : 'Install GT App'}
            </div>
            <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 500 }}>
              Talent Gets Hired
            </div>
          </div>
          {/* Download arrow using pure CSS — no SVG */}
          {!installing && (
            <div style={{
              width: 16, height: 16, borderBottom: '2.5px solid #f8f4ee',
              borderRight: '2.5px solid #f8f4ee', transform: 'rotate(45deg) translate(-3px,-3px)',
              flexShrink: 0,
            }} />
          )}
          {installing && (
            <div style={{ width: 16, height: 16, border: '2px solid rgba(10,21,32,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          )}
        </button>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          style={{
            width: 36,
            background: '#ffffff',
            border: '1px solid rgba(245,200,66,0.3)',
            borderLeft: 'none',
            borderRadius: '0 14px 14px 0',
            color: '#6a7080',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes pwaSlideUp {
          from { opacity:0; transform:translateX(-50%) translateY(20px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes pwaPulse {
          0%   { box-shadow:0 0 0 0 rgba(245,200,66,0.5); }
          50%  { box-shadow:0 0 0 8px rgba(245,200,66,0); }
          100% { box-shadow:0 0 0 0 rgba(245,200,66,0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </>
  );
}
