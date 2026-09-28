import { motion } from 'framer-motion'

interface CrashRocketProps {
  rotation?: number
  spinning?: boolean
}

export function CrashRocket({ rotation = 0, spinning = false }: CrashRocketProps) {
  return (
    <motion.div
      animate={spinning ? { rotate: [0, 360] } : {}}
      transition={spinning ? { duration: 1.2, repeat: Infinity, ease: 'linear' } : {}}
      style={{
        filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 165, 0, 0.5))',
      }}
    >
      <svg
        viewBox="0 0 160 100"
        width="120"
        height="80"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.15s linear',
        }}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="30%" stopColor="#FFF8DC" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="70%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          <linearGradient id="noseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF4500" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
          <radialGradient id="fire1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FFD700" />
            <stop offset="60%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fire2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="70%" stopColor="#FF4500" />
            <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="windowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>

        <g>
          <ellipse cx="5" cy="50" rx="40" ry="12" fill="url(#fire2)" opacity="0.7">
            <animate attributeName="rx" values="40;50;40" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="15" cy="50" rx="25" ry="8" fill="url(#fire1)" opacity="0.9">
            <animate attributeName="rx" values="25;35;25" dur="0.2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="22" cy="50" rx="12" ry="5" fill="#FFFFFF" opacity="0.95">
            <animate attributeName="rx" values="12;16;12" dur="0.15s" repeatCount="indefinite" />
          </ellipse>
        </g>

        <path d="M 38 42 L 25 36 L 25 64 L 38 58 Z" fill="#4A3410" />
        <path d="M 38 44 L 28 40 L 28 60 L 38 56 Z" fill="#8B6914" />

        <path
          d="M 38 42 L 90 38 Q 115 42 130 50 Q 115 58 90 62 L 38 58 Z"
          fill="url(#bodyGrad)"
          stroke="#4A3410"
          strokeWidth="1.5"
        />

        <path d="M 70 38 L 75 20 L 90 38 Z" fill="url(#bodyGrad)" stroke="#4A3410" strokeWidth="1.5" />
        <path d="M 73 36 L 76 26 L 85 36 Z" fill="#FF4500" />

        <path d="M 70 62 L 75 80 L 90 62 Z" fill="url(#bodyGrad)" stroke="#4A3410" strokeWidth="1.5" />
        <path d="M 73 64 L 76 74 L 85 64 Z" fill="#FF4500" />

        <path d="M 130 50 L 145 50 L 155 50 L 145 46 L 130 46 Z" fill="url(#noseGrad)" />
        <path d="M 130 50 L 145 50 L 155 50 L 145 54 L 130 54 Z" fill="url(#noseGrad)" />
        <path d="M 145 46 L 155 50 L 145 54 Z" fill="#FF4500" stroke="#8B0000" strokeWidth="0.5" />

        <circle cx="90" cy="50" r="13" fill="url(#windowGrad)" stroke="#FFD700" strokeWidth="2.5" />
        <circle cx="90" cy="50" r="10" fill="none" stroke="#FFA500" strokeWidth="0.5" opacity="0.6" />
        <text x="90" y="56" fontSize="13" textAnchor="middle">💎</text>

        <circle cx="70" cy="44" r="3" fill="url(#windowGrad)" stroke="#FFD700" strokeWidth="1" />
        <circle cx="70" cy="56" r="3" fill="url(#windowGrad)" stroke="#FFD700" strokeWidth="1" />
      </svg>
    </motion.div>
  )
}