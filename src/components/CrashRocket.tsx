interface CrashRocketProps {
  rotation?: number
}

export function CrashRocket({ rotation = 0 }: CrashRocketProps) {
  return (
    <svg
      viewBox="0 0 120 80"
      width="120"
      height="80"
      style={{
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
        transition: 'transform 0.15s linear',
      }}
    >
      <defs>
        <linearGradient id="goldBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="40%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <radialGradient id="fireGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#FFD700" />
          <stop offset="80%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="windowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F0F1A" />
        </linearGradient>
      </defs>

      <g>
        <ellipse cx="10" cy="40" rx="18" ry="10" fill="url(#fireGrad)" opacity="0.9">
          <animate attributeName="rx" values="18;24;18" dur="0.25s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.6;0.9" dur="0.3s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="6" cy="40" rx="10" ry="6" fill="#FFF8DC" opacity="0.9">
          <animate attributeName="rx" values="10;14;10" dur="0.2s" repeatCount="indefinite" />
        </ellipse>
      </g>

      <path d="M 20 35 L 10 32 L 10 48 L 20 45 Z" fill="#8B6914" />

      <path
        d="M 25 32 L 75 30 Q 95 32 105 40 Q 95 48 75 50 L 25 48 Z"
        fill="url(#goldBody)"
        stroke="#8B6914"
        strokeWidth="1.5"
      />

      <circle cx="60" cy="40" r="9" fill="url(#windowGrad)" stroke="#FFD700" strokeWidth="2" />
      <text x="60" y="44" fontSize="10" textAnchor="middle">💎</text>

      <path d="M 50 30 L 55 18 L 68 30 Z" fill="url(#goldBody)" stroke="#8B6914" strokeWidth="1" />
      <path d="M 50 50 L 55 62 L 68 50 Z" fill="url(#goldBody)" stroke="#8B6914" strokeWidth="1" />
      <path d="M 100 38 L 112 40 L 100 42 Z" fill="#FF4500" />

      <path
        d="M 30 34 Q 60 32 90 34"
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
    </svg>
  )
}