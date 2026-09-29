import { useEffect, useState } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
}

interface CrashBgProps {
  multiplier?: number
  status?: 'waiting' | 'running' | 'crashed'
}

export function CrashBg({ multiplier = 1, status = 'waiting' }: CrashBgProps) {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    const newStars: Star[] = []
    for (let i = 0; i < 40; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        delay: Math.random() * 3,
      })
    }
    setStars(newStars)
  }, [])

  const W = 1000
  const H = 600

  // Прогресс (логарифмический)
  const progress = Math.min(Math.log(Math.max(multiplier, 1)) / Math.log(10), 1)

  // Позиция ракеты
  const rocketX = 90 + progress * (W - 200)
  const rocketY = H - 50 - progress * (H - 150)

  // Контрольные точки кривой
  const ctrlX1 = 90 + (rocketX - 90) * 0.45
  const ctrlY1 = H - 50
  const ctrlX2 = rocketX - (rocketX - 90) * 0.35
  const ctrlY2 = rocketY + 50

  const pathD = `M 90 ${H - 50} C ${ctrlX1} ${ctrlY1} ${ctrlX2} ${ctrlY2} ${rocketX} ${rocketY}`
  const fillD = `${pathD} L ${rocketX} ${H - 50} L 90 ${H - 50} Z`

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Фон */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#0F0F1A] to-[#1A0F1E]" />

      {/* Звёзды */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0.3,
            animation: `twinkle ${2 + star.delay}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="crashFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#D4AF37" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8B0000" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="crashLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>

          <filter id="crashGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Сетка */}
        {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((p) => (
          <line
            key={p}
            x1="0"
            y1={H * p}
            x2={W}
            y2={H * p}
            stroke="rgba(212, 175, 55, 0.08)"
            strokeWidth="1"
            strokeDasharray="4 12"
          />
        ))}

        {/* Метки уровней */}
        {[1.5, 2, 3, 5, 7, 10].map((m) => {
          const y = H - 50 - (Math.log(m) / Math.log(10)) * (H - 150)
          return (
            <text
              key={m}
              x="20"
              y={y + 4}
              fill="rgba(212, 175, 55, 0.4)"
              fontSize="16"
              fontWeight="900"
              fontFamily="Bebas Neue, sans-serif"
              letterSpacing="2"
            >
              ×{m}
            </text>
          )
        })}

        {/* Заливка */}
        {(status === 'running' || status === 'crashed') && (
          <path d={fillD} fill="url(#crashFill)" />
        )}

        {/* Кривая (свечение + основная) */}
        {(status === 'running' || status === 'crashed') && (
          <>
            <path
              d={pathD}
              stroke="#FFD700"
              strokeWidth="14"
              fill="none"
              opacity="0.3"
              filter="url(#crashGlow)"
            />
            <path
              d={pathD}
              stroke="url(#crashLine)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              filter="url(#crashGlow)"
            />
          </>
        )}

        {/* Пульсация у ракеты */}
        {status === 'running' && (
          <circle cx={rocketX} cy={rocketY} r="30" fill="#FFD700" opacity="0.2">
            <animate attributeName="r" values="20;50;20" dur="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="0.7s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}