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
  // Градиент рамки по VIP
  const borderGradient = {
    0: 'from-casino-border to-casino-border',
    1: 'from-gray-300 to-gray-500',      // Серебро
    2: 'from-yellow-300 to-yellow-600',  // Золото
    3: 'from-purple-400 to-pink-500',    // Платина
    4: 'from-cyan-400 to-blue-500',      // Бриллиант
    5: 'from-yellow-400 via-amber-500 to-yellow-600', // Чёрная карта
  }[vipLevel] || 'from-casino-gold to-casino-gold2'

  // Свечение при VIP
  const glowShadow = glow && vipLevel > 0
    ? {
        1: '0 0 20px rgba(192,192,192,0.4)',
        2: '0 0 20px rgba(255,215,0,0.5)',
        3: '0 0 24px rgba(180,100,255,0.5)',
        4: '0 0 24px rgba(0,200,255,0.5)',
        5: '0 0 28px rgba(255,215,0,0.7)',
      }[vipLevel]
    : 'none'

  // Если есть фото из Telegram
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
            // Если фото не загрузилось — покажем заглушку
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
    )
  }

  // Заглушка — градиент + буква
  const initial = username?.[0]?.toUpperCase() || '?'

  return (
    <div
      className={`rounded-full p-[2px] bg-gradient-to-br ${borderGradient}`}
      style={{ boxShadow: glowShadow }}
    >
      <div
        className="rounded-full bg-casino-card flex items-center justify-center font-bold text-casino-gold"
        style={{
          width: size - 4,
          height: size - 4,
          fontSize: size * 0.4,
        }}
      >
        {initial}
      </div>
    </div>
  )
}