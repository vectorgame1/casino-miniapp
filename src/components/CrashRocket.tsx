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
        filter:
          'drop-shadow(0 0 20px rgba(212, 175, 55, 0.9)) drop-shadow(0 0 40px rgba(184, 148, 31, 0.5))',
      }}
    >
      <svg
        viewBox="0 0 160 100"
        width="150"
        height="95"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.15s linear',
        }}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="30%" stopColor="#FFF8DC" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#B8941F" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          <linearGradient id="noseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C41E3A" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <radialGradient id="fire1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#C41E3A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fire2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#C41E3A" />
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
          <ellipse cx="5" cy="50" rx="42" ry="13" fill="url(#fire2)" opacity="0.75">
            <animate attributeName="rx" values="42;52;42" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="15" cy="50" rx="26" ry="9" fill="url(#fire1)" opacity="0.9">
            <animate attributeName="rx" values="26;34;26" dur="0.2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="22" cy="50" rx="12" ry="5" fill="#FFFFFF" opacity="0.95">
            <animate attributeName="rx" values="12;16;12" dur="0.15s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Хвост */}
        <path d="M 38 42 L 25 36 L 25 64 L 38 58 Z" fill="#4A3410" />
        <path d="M 38 44 L 28 40 L 28 60 L 38 56 Z" fill="#8B6914" />

        {/* Корпус */}
        <path
          d="M 38 42 L 90 38 Q 115 42 130 50 Q 115 58 90 62 L 38 58 Z"
          fill="url(#bodyGrad)"
          stroke="#4A3410"
          strokeWidth="1.5"
        />

        {/* Верхний плавник */}
        <path d="M 70 38 L 75 20 L 90 38 Z" fill="url(#bodyGrad)" stroke="#4A3410" strokeWidth="1.5" />
        <path d="M 73 36 L 76 26 L 85 36 Z" fill="#C41E3A" />

        {/* Нижний плавник */}
        <path d="M 70 62 L 75 80 L 90 62 Z" fill="url(#bodyGrad)" stroke="#4A3410" strokeWidth="1.5" />
        <path d="M 73 64 L 76 74 L 85 64 Z" fill="#C41E3A" />

        {/* Нос */}
        <path d="M 130 50 L 145 50 L 155 50 L 145 46 L 130 46 Z" fill="url(#noseGrad)" />
        <path d="M 130 50 L 145 50 L 155 50 L 145 54 L 130 54 Z" fill="url(#noseGrad)" />
        <path d="M 145 46 L 155 50 L 145 54 Z" fill="#C41E3A" stroke="#8B0000" strokeWidth="0.5" />

        {/* Окно-иллюминатор */}
        <circle cx="90" cy="50" r="13" fill="url(#windowGrad)" stroke="#D4AF37" strokeWidth="2.5" />
        <circle cx="90" cy="50" r="10" fill="none" stroke="#B8941F" strokeWidth="0.5" opacity="0.6" />

        {/* Мелкие окна */}
        <circle cx="70" cy="44" r="3" fill="url(#windowGrad)" stroke="#D4AF37" strokeWidth="1" />
        <circle cx="70" cy="56" r="3" fill="url(#windowGrad)" stroke="#D4AF37" strokeWidth="1" />

        {/* Полоса */}
        <line x1="38" y1="50" x2="130" y2="50" stroke="#C41E3A" strokeWidth="1" opacity="0.4" />

        {/* Заклёпки */}
        <circle cx="50" cy="44" r="1.5" fill="#4A3410" />
        <circle cx="50" cy="56" r="1.5" fill="#4A3410" />
        <circle cx="110" cy="43" r="1.5" fill="#4A3410" />
        <circle cx="110" cy="57" r="1.5" fill="#4A3410" />

        {/* Искры */}
        <circle cx="10" cy="46" r="2" fill="#D4AF37" opacity="0.9">
          <animate attributeName="cx" values="10;0;10" dur="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0;0.9" dur="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="8" cy="54" r="1.5" fill="#B8941F" opacity="0.8">
          <animate attributeName="cx" values="8;0;8" dur="0.7s" repeatCount="indefinite" />
        </circle>
      </svg>
    </motion.div>
  )
}