interface AvatarProps {
  photoUrl?: string
  username?: string
  size?: number
  vipLevel?: number
  glow?: boolean
}

export function Avatar({
  photoUrl,
  username = 'User',
  size = 48,
  vipLevel = 0,
  glow = false,
}: AvatarProps) {
  const borderGradient = {
    0: 'from-casino-border to-casino-border',
    1: 'from-gray-400 to-gray-600',
    2: 'from-casino-gold to-casino-gold2',
    3: 'from-purple-400 to-pink-500',
    4: 'from-cyan-400 to-blue-500',
    5: 'from-casino-goldLight via-casino-gold to-casino-gold2',
  }[vipLevel] || 'from-casino-gold to-casino-gold2'

  const glowShadow = glow && vipLevel > 0
    ? {
        1: '0 0 16px rgba(192,192,192,0.4)',
        2: '0 0 16px rgba(212,175,55,0.5)',
        3: '0 0 20px rgba(180,100,255,0.5)',
        4: '0 0 20px rgba(0,200,255,0.5)',
        5: '0 0 24px rgba(212,175,55,0.7)',
      }[vipLevel]
    : 'none'

  if (photoUrl) {
    return (
      <div
        className={`rounded-full p-[2px] bg-gradient-to-br ${borderGradient}`}
        style={{ boxShadow: glowShadow }}
      >
        <img
          src={photoUrl}
          alt={username}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
    )
  }

  const initial = username?.[0]?.toUpperCase() || '?'

  return (
    <div
      className={`rounded-full p-[2px] bg-gradient-to-br ${borderGradient}`}
      style={{ boxShadow: glowShadow }}
    >
      <div
        className="rounded-full bg-casino-card flex items-center justify-center font-display tracking-wider text-casino-gold"
        style={{
          width: size - 4,
          height: size - 4,
          fontSize: size * 0.42,
        }}
      >
        {initial}
      </div>
    </div>
  )
}