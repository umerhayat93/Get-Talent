import React from 'react';

export default function VerifiedBadge({ size = 20, style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
      title="Verified by Get Talent"
    >
      {/* Grooved badge shape */}
      <path
        fill="#1877F2"
        d="M12 2.2l1.3 1.1 1.7-.4 1 1.5 1.8.2.3 1.7 1.5 1-.4 1.7 1.1 1.3-1.1 1.3.4 1.7-1.5 1-.3 1.7-1.8.2-1 1.5-1.7-.4-1.3 1.1-1.3-1.1-1.7.4-1-1.5-1.8-.2-.3-1.7-1.5-1 .4-1.7-1.1-1.3 1.1-1.3-.4-1.7 1.5-1 .3-1.7 1.8-.2 1-1.5 1.7.4L12 2.2z"
      />
      {/* Centered white checkmark */}
      <path
        d="M8.7 10.3l2.2 2.2 4.4-4.6"
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Green checkmark variant — pure CSS, no SVG
export function CheckMark({ size = 18, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#42b72a,#36a420)',
      boxShadow: `0 0 ${size*0.3}px rgba(66,183,42,0.4)`,
      flexShrink: 0, position: 'relative', overflow: 'hidden', ...style,
    }}>
      <span style={{
        position: 'absolute', left: '50%', top: '46%',
        width: Math.round(size*0.32), height: Math.round(size*0.52),
        borderRight: `${Math.max(2,Math.round(size*0.15))}px solid white`,
        borderBottom: `${Math.max(2,Math.round(size*0.15))}px solid white`,
        transform: 'translate(-60%,-58%) rotate(45deg)',
        borderRadius: `0 0 ${Math.round(size*0.06)}px 0`,
      }} />
    </span>
  );
}
