import React from 'react';
import { imgUrl } from '../../utils/api';

export default function Avatar({ src, name, size = 56, radius = 12 }) {
  const url = imgUrl(src);
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: radius, flexShrink: 0 }}>
      {url && (
        <img
          src={url}
          alt={name}
          style={{ width: '100%', height: '100%', borderRadius: radius, objectFit: 'cover', border: '2px solid rgba(245,200,66,0.2)' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: radius,
        background: 'linear-gradient(135deg, #ffffff, #f8f4ee)',
        border: '2px solid rgba(245,200,66,0.3)',
        display: url ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Bebas Neue', cursive",
        fontSize: Math.floor(size * 0.35), color: '#c8960a', letterSpacing: '1px',
      }}>
        GT
      </div>
    </div>
  );
}
