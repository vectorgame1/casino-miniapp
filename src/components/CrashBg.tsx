import { useEffect, useState } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
}

export function CrashBg() {
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

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A1A] via-[#0F0F1A] to-[#1A0F2E]" />

      {stars.slice(0, 30).map((star) => (
        <div
          key={`far-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0.4,
            animation: `twinkle ${2 + star.delay}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {stars.slice(30).map((star) => (
        <div
          key={`near-${star.id}`}
          className="absolute rounded-full bg-casino-gold"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size + 1}px`,
            height: `${star.size + 1}px`,
            boxShadow: '0 0 6px rgba(255, 215, 0, 0.9)',
            animation: `twinkle ${1.5 + star.delay}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,215,0,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(138,43,226,0.1),transparent_60%)]" />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}