import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1400);
    const t4 = setTimeout(() => setPhase(4), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#ffffff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* Subtle light blue ring behind logo */}
      <div style={{
        position: 'absolute',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(24,119,242,0.07) 0%, transparent 70%)',
        transform: `scale(${phase >= 1 ? 1 : 0})`,
        transition: 'transform 1.4s cubic-bezier(0.34,1.56,0.64,1)',
      }} />

      {/* Second outer ring */}
      <div style={{
        position: 'absolute',
        width: 420, height: 420, borderRadius: '50%',
        border: `1.5px solid rgba(24,119,242,${phase >= 2 ? 0.08 : 0})`,
        transition: 'all 1.2s ease',
      }} />

      {/* Logo — bounces in */}
      <div style={{
        width: 120, height: 120,
        borderRadius: 28,
        overflow: 'hidden',
        border: '2px solid rgba(24,119,242,0.15)',
        boxShadow: phase >= 1
          ? '0 12px 40px rgba(24,119,242,0.15), 0 4px 12px rgba(0,0,0,0.08)'
          : 'none',
        transform: `scale(${phase >= 1 ? 1 : 0.2}) rotate(${phase >= 1 ? 0 : -15}deg)`,
        opacity: phase >= 1 ? 1 : 0,
        transition: 'all 0.65s cubic-bezier(0.34,1.56,0.64,1)',
        background: '#fff',
      }}>
        <img
          src="/icons/icon-192.png"
          alt="Get Talent"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* App name — black text slides up */}
      <div style={{
        marginTop: 24,
        opacity: phase >= 2 ? 1 : 0,
        transform: `translateY(${phase >= 2 ? 0 : 20}px)`,
        transition: 'all 0.5s cubic-bezier(0.34,1.2,0.64,1)',
        textAlign: 'center',
      }}>
        {/* Each letter animates in */}
        <div style={{
          fontFamily: "'Bebas Neue',cursive",
          fontSize: 38, letterSpacing: 5,
          color: '#050505',
          lineHeight: 1,
        }}>
          {'GET TALENT'.split('').map((char, i) => (
            <span key={i} style={{
              display: 'inline-block',
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? 'translateY(0)' : 'translateY(12px)',
              transition: `all 0.4s cubic-bezier(0.34,1.2,0.64,1) ${i * 0.04}s`,
            }}>
              {char === ' ' ? '\u00a0' : char}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <div style={{
          fontFamily: "'Outfit',sans-serif",
          fontSize: 11, color: '#65676b',
          letterSpacing: '3.5px', fontWeight: 600, marginTop: 6,
          textTransform: 'uppercase',
          opacity: phase >= 3 ? 1 : 0,
          transform: `translateY(${phase >= 3 ? 0 : 8}px)`,
          transition: 'all 0.45s ease',
        }}>Talent Gets Hired</div>
      </div>

      {/* Progress bar instead of dots */}
      <div style={{
        position: 'absolute', bottom: 60,
        width: 120, height: 3, borderRadius: 9999,
        background: 'rgba(24,119,242,0.1)',
        overflow: 'hidden',
        opacity: phase >= 2 ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        <div style={{
          height: '100%',
          width: phase >= 4 ? '100%' : phase >= 3 ? '70%' : phase >= 2 ? '35%' : '0%',
          background: 'linear-gradient(90deg, #1877f2, #42a5f5)',
          borderRadius: 9999,
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Subtle "Loading" text */}
      <div style={{
        position: 'absolute', bottom: 40,
        fontSize: 10, color: '#8a8d91', letterSpacing: '2px', fontWeight: 600,
        textTransform: 'uppercase',
        opacity: phase >= 2 ? 0.7 : 0,
        transition: 'opacity 0.4s ease',
      }}>Loading</div>

    </div>
  );
}
