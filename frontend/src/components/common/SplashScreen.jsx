import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 150);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#1a1a2e',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(245,200,66,0.1) 0%,transparent 70%)',
        transform: `scale(${phase >= 1 ? 1 : 0})`,
        transition: 'transform 1.2s cubic-bezier(0.34,1.56,0.64,1)',
      }} />

      {/* Logo PNG — replaces SVG/text */}
      <div style={{
        width: 130, height: 130,
        borderRadius: 30,
        border: `2px solid rgba(245,200,66,${phase >= 1 ? 0.6 : 0})`,
        boxShadow: phase >= 1 ? '0 0 60px rgba(245,200,66,0.25), 0 0 120px rgba(245,200,66,0.1)' : 'none',
        transform: `scale(${phase >= 1 ? 1 : 0.3})`,
        opacity: phase >= 1 ? 1 : 0,
        transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'hidden',
        background: '#fff',
      }}>
        <img
          src="/icons/icon-192.png"
          alt="Get Talent"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* App name */}
      <div style={{
        marginTop: 28,
        opacity: phase >= 2 ? 1 : 0,
        transform: `translateY(${phase >= 2 ? 0 : 16}px)`,
        transition: 'all 0.5s ease',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Bebas Neue',cursive",
          fontSize: 36, letterSpacing: 4,
          background: 'linear-gradient(135deg,#f5c842,#e6a800)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1,
        }}>GET TALENT</div>
        <div style={{
          fontFamily: "'Outfit',sans-serif",
          fontSize: 13, color: '#9090a8', letterSpacing: '3px', fontWeight: 500, marginTop: 6,
          opacity: phase >= 3 ? 1 : 0,
          transform: `translateY(${phase >= 3 ? 0 : 8}px)`,
          transition: 'all 0.4s ease 0.1s',
        }}>TALENT GETS HIRED</div>
      </div>

      {/* Loading dots */}
      <div style={{
        position: 'absolute', bottom: 60,
        display: 'flex', gap: 8,
        opacity: phase >= 2 ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: '#c8960a',
            animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes dotPulse {
          0%,80%,100% { opacity:0.2; transform:scale(0.8); }
          40%          { opacity:1;   transform:scale(1.2); }
        }
      `}</style>
    </div>
  );
}
