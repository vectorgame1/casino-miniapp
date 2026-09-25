import { motion } from 'framer-motion'

interface CrashRocketProps {
  rotation?: number
  spinning?: boolean
}

export function CrashRocket({ rotation = 0, spinning = false }: CrashRocketProps) {
  return (
    <motion.div
      animate={spinning ? { rotate: [0, 360] } : {}}
      transition={spinning ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
      style={{
        filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 60px rgba(255, 165, 0, 0.5))',
      }}
    >
      <svg
        viewBox="0 0 160 100"
        width="140"
        height="90"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.2s linear',
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
          <ellipse cx="0" cy="50" rx="45" ry="14" fill="url(#fire2)" opacity="0.7">
            <animate attributeName="rx" values="45;55;45" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="15" cy="50" rx="30" ry="10" fill="url(#fire1)" opacity="0.9">
            <animate attributeName="rx" values="30;40;30" dur="0.2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="25" cy="50" rx="15" ry="6" fill="#FFFFFF" opacity="0.95">
            <animate attributeName="rx" values="15;20;15" dur="0.15s" repeatCount="indefinite" />
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

        <line x1="38" y1="50" x2="130" y2="50" stroke="#FF4500" strokeWidth="1" opacity="0.4" />

        <path
          d="M 45 44 Q 85 40 125 46"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 45 43 Q 85 39 125 45"
          stroke="#FFFFFF"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />

        <circle cx="50" cy="44" r="1.5" fill="#4A3410" />
        <circle cx="50" cy="56" r="1.5" fill="#4A3410" />
        <circle cx="110" cy="43" r="1.5" fill="#4A3410" />
        <circle cx="110" cy="57" r="1.5" fill="#4A3410" />

        <circle cx="10" cy="46" r="2" fill="#FFD700" opacity="0.9">
          <animate attributeName="cx" values="10;0;10" dur="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0;0.9" dur="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="8" cy="54" r="1.5" fill="#FFA500" opacity="0.8">
          <animate attributeName="cx" values="8;0;8" dur="0.7s" repeatCount="indefinite" />
        </circle>
      </svg>
    </motion.div>
  )
}