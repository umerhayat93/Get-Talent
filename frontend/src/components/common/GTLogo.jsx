import React from 'react';

const SIZES = {
  sm:   { box: 36 },
  md:   { box: 48 },
  lg:   { box: 72 },
  xl:   { box: 96 },
  '2xl':{ box: 128 },
};

export default function GTLogo({ size = 'md', showSlogan = false, className = '' }) {
  const s = SIZES[size] || SIZES.md;
  const r = Math.floor(s.box * 0.22);
  const sloganSize = Math.max(10, Math.floor(s.box * 0.145));
  const nameSize   = Math.max(14, Math.floor(s.box * 0.26));

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: showSlogan ? 8 : 0 }}
    >
      {/* Use PNG icon — no SVG, no CSS text */}
      <div style={{
        width: s.box, height: s.box,
        borderRadius: r,
        overflow: 'hidden',
        border: '2px solid rgba(245,200,66,0.5)',
        boxShadow: '0 0 16px rgba(245,200,66,0.2)',
        flexShrink: 0,
        background: '#fff',
      }}>
        <img
          src="/icons/icon-192.png"
          alt="Get Talent"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {showSlogan && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: nameSize,
            background: 'linear-gradient(135deg, #f5c842, #e6a800)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px',
            lineHeight: 1,
          }}>
            GET TALENT
          </div>
          <div style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: sloganSize,
            color: '#9090a8',
            letterSpacing: '2px',
            fontWeight: 500,
            marginTop: 3,
          }}>
            TALENT GETS HIRED
          </div>
        </div>
      )}
    </div>
  );
}
