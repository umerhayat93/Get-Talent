import React from 'react';

// Uses the actual uploaded badge PNG
export default function VerifiedBadge({ size = 18, style = {} }) {
  return (
    <img
      src="/icons/verified-badge.png"
      alt="Verified"
      title="Verified by Get Talent"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
    />
  );
}

// Green circular checkmark — crisp CSS, no SVG
export function CheckMark({ size = 18, style = {} }) {
  return (
    <span
      title="Verified"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00e676, #00b85c)',
        boxShadow: `0 0 ${size * 0.3}px rgba(0,230,118,0.4)`,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* White check using border trick — clean and crisp */}
      <span style={{
        position: 'absolute',
        left: '50%',
        top: '46%',
        width:  Math.round(size * 0.32),
        height: Math.round(size * 0.52),
        borderRight: `${Math.max(2, Math.round(size * 0.15))}px solid white`,
        borderBottom: `${Math.max(2, Math.round(size * 0.15))}px solid white`,
        transform: 'translate(-60%, -58%) rotate(45deg)',
        borderRadius: `0 0 ${Math.round(size * 0.06)}px 0`,
      }} />
    </span>
  );
}
