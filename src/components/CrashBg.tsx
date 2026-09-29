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
    for (let i = 0; i < 60; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 3,
      })
    }
    setStars(newStars)
  }, [])

  const W = 1000
  const H = 600

  const progress = Math.min(Math.log(Math.max(multiplier, 1)) / Math.log(10), 1)
  const rocketX = 90 + progress * (W - 220)
  const rocketY = H - 60 - progress * (H - 160)

  const ctrlX1 = 90 + (rocketX - 90) * 0.4
  const ctrlY1 = H - 60
  const ctrlX2 = rocketX - (rocketX - 90) * 0.3
  const ctrlY2 = rocketY + 60

  const pathD = `M 90 ${H - 60} C ${ctrlX1} ${ctrlY1} ${ctrlX2} ${ctrlY2} ${rocketX} ${rocketY}`
  const fillD = `${pathD} L ${rocketX} ${H - 60} L 90 ${H - 60} Z`

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#0F0F16] to-[#1A0F1E]" />

      {stars.slice(0, 30).map((star) => (
        <div
          key={`far-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0.35,
            animation: `twinkle ${2 + star.delay}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {stars.slice(30).map((star) => (
        <div
          key={`near-${star.id}`}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size + 1}px`,
            height: `${star.size + 1}px`,
            background: '#D4AF37',
            boxShadow: '0 0 6px rgba(212, 175, 55, 0.9)',
            animation: `twinkle ${1.5 + star.delay}s ease-in-out infinite`,
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
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#B8941F" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8B0000" stopOpacity="0.03" />
          </linearGradient>

          <linearGradient id="crashLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E8C860" />
            <stop offset="60%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8941F" />
          </linearGradient>

          <filter id="crashGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Сетка */}
        {[0.2, 0.4, 0.6, 0.8].map((p) => (
          <line
            key={p}
            x1="0"
            y1={H * p}
            x2={W}
            y2={H * p}
            stroke="rgba(212, 175, 55, 0.06)"
            strokeWidth="1"
            strokeDasharray="6 10"
          />
        ))}

        {/* Метки уровней */}
        {[1.5, 2, 3, 5, 10].map((m) => {
          const y = H - 60 - (Math.log(m) / Math.log(10)) * (H - 160)
          return (
            <text
              key={m}
              x="16"
              y={y}
              fill="rgba(212, 175, 55, 0.35)"
              fontSize="14"
              fontWeight="bold"
              fontFamily="Bebas Neue, sans-serif"
              letterSpacing="1"
            >
              ×{m}
            </text>
          )
        })}

        {/* Заливка */}
        {(status === 'running' || status === 'crashed') && (
          <path d={fillD} fill="url(#crashFill)" />
        )}

        {/* Кривая */}
        {(status === 'running' || status === 'crashed') && (
          <>
            <path
              d={pathD}
              stroke="#D4AF37"
              strokeWidth="10"
              fill="none"
              opacity="0.25"
              filter="url(#crashGlow)"
            />
            <path
              d={pathD}
              stroke="url(#crashLine)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Пульсация у ракеты */}
        {status === 'running' && (
          <circle cx={rocketX} cy={rocketY} r="30" fill="#D4AF37" opacity="0.15">
            <animate attributeName="r" values="20;40;20" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0;0.2" dur="0.8s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}