import React from 'react';

interface FibaCourtSvgProps {
  className?: string;
  isWeakSideFloatActive?: boolean;
}

export const FibaCourtSvg: React.FC<FibaCourtSvgProps> = ({ className = '', isWeakSideFloatActive = false }) => {
  // FIBA half-court dimensions:
  // Full court: 28m x 15m. Half court: 14m (height) x 15m (width).
  // Baseline is at the bottom (y = 860). Half-court line is at the top (y = 60).
  // Center is x = 500.

  return (
    <svg
      viewBox="0 0 1000 933"
      className={`w-full h-full select-none pointer-events-none ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Court Hardwood Gradient */}
        <radialGradient id="courtFloorGrad" cx="50%" cy="60%" r="70%">
          <stop offset="0%" stopColor="#121A2D" />
          <stop offset="60%" stopColor="#0E1524" />
          <stop offset="100%" stopColor="#090D18" />
        </radialGradient>

        {/* Paint / Key Color Gradient */}
        <linearGradient id="paintGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E2B48" />
          <stop offset="100%" stopColor="#16223B" />
        </linearGradient>

        {/* Glow for court lines in dark mode */}
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer Boundary / Court Wood Floor */}
      <rect x="0" y="0" width="1000" height="933" fill="url(#courtFloorGrad)" />

      {/* In-bounds boundary (Baseline at bottom y=860, Halfcourt at top y=60, Side lines x=70 and x=930) */}
      <rect
        x="70"
        y="60"
        width="860"
        height="800"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="5"
        strokeLinejoin="miter"
        filter="url(#lineGlow)"
      />

      {/* Half-Court Line with center circle */}
      <path
        d="M 70,60 L 930,60"
        stroke="#E2E8F0"
        strokeWidth="5"
      />
      {/* Center Circle */}
      <path
        d="M 397,60 A 103,103 0 0,0 603,60"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="5"
      />
      {/* Inner Center Circle */}
      <path
        d="M 466,60 A 34,34 0 0,0 534,60"
        fill="none"
        stroke="#00F0FF"
        strokeWidth="2"
        opacity="0.7"
      />

      {/* Watermark Cuervos Logo in Center Circle */}
      <g transform="translate(500, 110) scale(0.35)" opacity="0.2">
        <image href="/logo-cuervos.svg" x="-256" y="-256" width="512" height="512" />
      </g>

      {/* FIBA Paint / Restricted Key Area */}
      <rect
        x="360"
        y="529"
        width="280"
        height="331"
        fill="url(#paintGrad)"
        stroke="#E2E8F0"
        strokeWidth="5"
      />

      {/* Free Throw Circle */}
      {/* Top half (solid towards halfcourt) */}
      <path
        d="M 397,529 A 103,103 0 0,1 603,529"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="5"
      />
      {/* Bottom half inside the paint (dashed towards baseline) */}
      <path
        d="M 397,529 A 103,103 0 0,0 603,529"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="4"
        strokeDasharray="14,14"
        opacity="0.8"
      />

      {/* Free Throw Line */}
      <line x1="360" y1="529" x2="640" y2="529" stroke="#E2E8F0" strokeWidth="5" />

      {/* Backboard */}
      <line x1="448.5" y1="791.5" x2="551.5" y2="791.5" stroke="#FFFFFF" strokeWidth="6" />
      {/* Support arm */}
      <line x1="500" y1="860" x2="500" y2="791.5" stroke="#64748B" strokeWidth="4" />

      {/* Rim */}
      <circle cx="500" cy="770" r="13" fill="none" stroke="#EA580C" strokeWidth="4" />
      {/* Net / Ring connection */}
      <line x1="500" y1="791.5" x2="500" y2="783" stroke="#EA580C" strokeWidth="4" />

      {/* FIBA No-Charge Semi-Circle */}
      <path
        d="M 428.6,770 A 71.4,71.4 0 0,1 571.4,770"
        fill="none"
        stroke="#00F0FF"
        strokeWidth="3"
        opacity="0.75"
      />
      <line x1="428.6" y1="770" x2="428.6" y2="791.5" stroke="#00F0FF" strokeWidth="3" opacity="0.75" />
      <line x1="571.4" y1="770" x2="571.4" y2="791.5" stroke="#00F0FF" strokeWidth="3" opacity="0.75" />

      {/* FIBA 3-Point Arc */}
      <path
        d="M 121.4,860 
           L 121.4,575 
           A 385.7,385.7 0 0,1 878.6,575 
           L 878.6,860"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Rebound Hash Marks on Key Sides */}
      {/* Left side of paint */}
      <line x1="345" y1="760" x2="360" y2="760" stroke="#E2E8F0" strokeWidth="4" />
      <rect x="345" y="700" width="15" height="20" fill="#E2E8F0" />
      <line x1="345" y1="655" x2="360" y2="655" stroke="#E2E8F0" strokeWidth="4" />
      <line x1="345" y1="605" x2="360" y2="605" stroke="#E2E8F0" strokeWidth="4" />

      {/* Right side of paint */}
      <line x1="640" y1="760" x2="655" y2="760" stroke="#E2E8F0" strokeWidth="4" />
      <rect x="640" y="700" width="15" height="20" fill="#E2E8F0" />
      <line x1="640" y1="655" x2="655" y2="655" stroke="#E2E8F0" strokeWidth="4" />
      <line x1="640" y1="605" x2="655" y2="605" stroke="#E2E8F0" strokeWidth="4" />

      {/* Coaching Box marks on sidelines */}
      <line x1="55" y1="390" x2="70" y2="390" stroke="#00F0FF" strokeWidth="3" />
      <line x1="930" y1="390" x2="945" y2="390" stroke="#00F0FF" strokeWidth="3" />

      {/* Weak Side Float Indicator Zone (when active) */}
      {isWeakSideFloatActive && (
        <g opacity="0.35">
          <ellipse cx="380" cy="680" rx="90" ry="60" fill="#10B981" />
          <text
            x="380"
            y="685"
            textAnchor="middle"
            fill="#34D399"
            fontSize="18"
            fontWeight="bold"
            letterSpacing="2"
          >
            ZONA FLOTE DÉBIL
          </text>
        </g>
      )}

      {/* Tactile Half-Court Text Branding */}
      <text
        x="500"
        y="910"
        textAnchor="middle"
        fill="#475569"
        fontSize="16"
        letterSpacing="4"
        fontWeight="600"
      >
        MEDIA CANCHA REGLAMENTARIA FIBA • CUERVOSAPP
      </text>
    </svg>
  );
};
