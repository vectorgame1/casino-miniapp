import { motion } from 'framer-motion'

interface CrashRocketProps {
  rotation?: number
  spinning?: boolean
}

export function CrashRocket({ rotation = 0, spinning = false }: CrashRocketProps) {
  return (
    <motion.div
      animate={spinning ? { rotate: [0, 360] } : {}}
      transition={spinning ? { duration: 1.5, repeat: Infinity, ease: 'linear' } : {}}
      style={{
        filter:
          'drop-shadow(0 0 25px rgba(212, 175, 55, 1)) drop-shadow(0 0 50px rgba(184, 148, 31, 0.6))',
      }}
    >
      <svg
        viewBox="0 0 160 100"
        width="180"
        height="115"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.1s linear',
        }}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="30%" stopColor="#FFF8DC" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="70%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          <linearGradient id="noseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C41E3A" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
          <radialGradient id="fire1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FFD700" />
            <stop offset="55%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#C41E3A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fire2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="60%" stopColor="#C41E3A" />
            <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="windowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>

        {/* Пламя */}
        <g>
          <ellipse cx="0" cy="50" rx="55" ry="16" fill="url(#fire2)" opacity="0.8">
            <animate attributeName="rx" values="55;70;55" dur="0.25s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="12" cy="50" rx="35" ry="11" fill="url(#fire1)" opacity="0.95">
            <animate attributeName="rx" values="35;45;35" dur="0.18s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="20" cy="50" rx="18" ry="6" fill="#FFFFFF" opacity="1">
            <animate attributeName="rx" values="18;24;18" dur="0.12s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Хвост */}
        <path d="M 38 42 L 22 34 L 22 66 L 38 58 Z" fill="#4A3410" />
        <path d="M 38 44 L 26 38 L 26 62 L 38 56 Z" fill="#8B6914" />

        {/* Корпус */}
        <path
          d="M 38 42 L 90 38 Q 115 42 130 50 Q 115 58 90 62 L 38 58 Z"
          fill="url(#bodyGrad)"
          stroke="#4A3410"
          strokeWidth="2"
        />

        {/* Верхний плавник */}
        <path d="M 70 38 L 75 18 L 90 38 Z" fill="url(#bodyGrad)" stroke="#4A3410" strokeWidth="2" />
        <path d="M 73 36 L 76 24 L 85 36 Z" fill="#C41E3A" />

        {/* Нижний плавник */}
        <path d="M 70 62 L 75 82 L 90 62 Z" fill="url(#bodyGrad)" stroke="#4A3410" strokeWidth="2" />
        <path d="M 73 64 L 76 76 L 85 64 Z" fill="#C41E3A" />

        {/* Нос */}
        <path d="M 130 50 L 145 50 L 155 50 L 145 44 L 130 44 Z" fill="url(#noseGrad)" />
        <path d="M 130 50 L 145 50 L 155 50 L 145 56 L 130 56 Z" fill="url(#noseGrad)" />
        <path d="M 145 44 L 155 50 L 145 56 Z" fill="#C41E3A" stroke="#8B0000" strokeWidth="0.8" />

        {/* Иллюминатор */}
        <circle cx="90" cy="50" r="14" fill="url(#windowGrad)" stroke="#FFD700" strokeWidth="3" />
        <circle cx="90" cy="50" r="10" fill="none" stroke="#FFA500" strokeWidth="0.8" opacity="0.7" />

        {/* Мелкие окна */}
        <circle cx="70" cy="43" r="3.5" fill="url(#windowGrad)" stroke="#FFD700" strokeWidth="1.2" />
        <circle cx="70" cy="57" r="3.5" fill="url(#windowGrad)" stroke="#FFD700" strokeWidth="1.2" />

        {/* Заклёпки */}
        <circle cx="50" cy="43" r="1.8" fill="#4A3410" />
        <circle cx="50" cy="57" r="1.8" fill="#4A3410" />
        <circle cx="110" cy="42" r="1.8" fill="#4A3410" />
        <circle cx="110" cy="58" r="1.8" fill="#4A3410" />
      </svg>
    </motion.div>
  )
}