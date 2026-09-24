import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface VipTier {
  id: number
  name: string
  icon: string
  stars: number
  cashback: number
  bonus: number
  duration_days: number
  exclusive_games: number
}

// 🎨 ЦВЕТА И СТИЛИ ДЛЯ КАЖДОГО VIP
const VIP_STYLES: Record<number, {
  gradient: string
  border: string
  textColor: string
  glow: string
  badge?: { text: string; color: string }
}> = {
  1: {
    gradient: 'from-gray-300/20 to-gray-500/20',
    border: 'border-gray-400/60',
    textColor: 'text-gray-300',
    glow: 'rgba(192,192,192,0.3)',
  },
  2: {
    gradient: 'from-yellow-400/20 to-yellow-600/20',
    border: 'border-yellow-400/60',
    textColor: 'text-yellow-400',
    glow: 'rgba(255,215,0,0.3)',
    badge: { text: '💰 ВЫГОДНО', color: 'bg-yellow-500' },
  },
  3: {
    gradient: 'from-purple-500/20 via-pink-500/20 to-purple-500/20',
    border: 'border-purple-400/60',
    textColor: 'text-purple-300',
    glow: 'rgba(180,100,255,0.4)',
    badge: { text: '🔥 ХИТ', color: 'bg-gradient-to-r from-orange-500 to-red-500' },
  },
  4: {
    gradient: 'from-cyan-400/20 to-blue-500/20',
    border: 'border-cyan-400/60',
    textColor: 'text-cyan-300',
    glow: 'rgba(0,200,255,0.4)',
  },
  5: {
    gradient: 'from-yellow-500/30 via-amber-500/20 to-yellow-600/30',
    border: 'border-yellow-500/70',
    textColor: 'text-yellow-400',
    glow: 'rgba(255,215,0,0.5)',
    badge: { text: '👑 ЛУЧШЕЕ', color: 'bg-gradient-to-r from-yellow-400 to-amber-600' },
  },
}

export function Vip() {
  const { userId, haptic, hapticSuccess } = useTelegram()
  const [tiers, setTiers] = useState<VipTier[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<number | null>(null)
  const [currentVip, setCurrentVip] = useState<number>(0)

  useEffect(() => {
    loadTiers()
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    if (!userId) return
    try {
      const res = await api.getProfile(userId) as any
      if (res?.vip_tier) setCurrentVip(res.vip_tier)
    } catch (e) {
      console.error('profile load error:', e)
    }
  }

  const loadTiers = async () => {
    setLoading(true)
    const res = await api.getVipTiers()
    if (Array.isArray(res)) setTiers(res as VipTier[])
    setLoading(false)
  }

  const handleBuy = async (tier: VipTier) => {
    if (!userId || buying) return
    haptic('medium')
    setBuying(tier.id)
    const res = await api.buyVip(userId, tier.id) as any
    if (res?.invoice_url) {
      hapticSuccess()
      const tg = (window as any).Telegram?.WebApp
      if (tg?.openInvoice) {
        tg.openInvoice(res.invoice_url, (status: string) => {
          if (status === 'paid') {
            setTimeout(() => { loadTiers(); loadProfile() }, 1500)
          }
        })
      } else {
        window.open(res.invoice_url, '_blank')
      }
    }
    setBuying(null)
  }

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-casino-muted">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">👑</div>
          Загрузка VIP...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* ЗАГОЛОВОК */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-casino-gold">👑 VIP КЛУБ</h1>
        <p className="text-casino-muted text-sm mt-1">Эксклюзивные привилегии за ⭐ Stars</p>
      </div>

      {/* КАРТОЧКИ VIP */}
      {tiers.map((tier, index) => {
        const style = VIP_STYLES[tier.id] || VIP_STYLES[1]
        const isActive = currentVip === tier.id
        const isHigher = tier.id > currentVip

        return (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            {/* Свечение для VIP 3-5 */}
            {tier.id >= 3 && (
              <div
                className="absolute inset-0 rounded-2xl blur-xl -z-10 opacity-50"
                style={{ background: style.glow }}
              />
            )}

            <div
              className={`relative rounded-2xl border-2 ${style.border} overflow-hidden`}
              style={{
                background: `linear-gradient(135deg, ${
                  tier.id === 1 ? 'rgba(192,192,192,0.08), rgba(100,100,100,0.08)' :
                  tier.id === 2 ? 'rgba(255,215,0,0.08), rgba(200,160,0,0.08)' :
                  tier.id === 3 ? 'rgba(180,100,255,0.08), rgba(255,100,200,0.08)' :
                  tier.id === 4 ? 'rgba(0,200,255,0.08), rgba(100,150,255,0.08)' :
                  'rgba(255,215,0,0.12), rgba(120,80,0,0.12)'
                })`,
              }}
            >
              {/* ТЕКУЩИЙ VIP — ЗЕЛЁНАЯ ПОЛОСА */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-casino-green to-emerald-400" />
              )}

              <div className="p-4">
                {/* БЕЙДЖ СВЕРХУ СПРАВА */}
                {style.badge && (
                  <div className={`absolute top-3 right-3 ${style.badge.color} text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg`}>
                    {style.badge.text}
                  </div>
                )}

                {/* БЕЙДЖ "ТВОЙ" СЛЕВА */}
                {isActive && (
                  <div className="absolute top-3 left-3 bg-casino-green text-black text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                    ✓ ТВОЙ
                  </div>
                )}

                {/* ИКОНКА + НАЗВАНИЕ */}
                <div className={`flex items-center gap-3 ${style.badge || isActive ? 'mt-6' : ''} mb-4`}>
                  <motion.div
                    className="text-5xl"
                    animate={tier.id === 5 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {tier.icon}
                  </motion.div>
                  <div className="flex-1">
                    <div className={`font-bold text-lg ${style.textColor}`}>
                      VIP {tier.id} — {tier.name}
                    </div>
                    <div className="text-casino-gold text-base font-black mt-0.5">
                      {tier.stars} ⭐
                    </div>
                  </div>
                </div>

                {/* ХАРАКТЕРИСТИКИ */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-casino-muted">💸 Кэшбэк</span>
                    <span className={`font-bold ${style.textColor}`}>{tier.cashback}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-casino-muted">🎁 Бонус сразу</span>
                    <span className="font-bold text-casino-text">+{fmt(tier.bonus)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-casino-muted">⏱ Срок</span>
                    <span className="font-bold text-casino-text">{tier.duration_days} дней</span>
                  </div>
                  {tier.exclusive_games > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-casino-muted">🎰 Эксклюзивных игр</span>
                      <span className="font-bold text-casino-text">
                        {tier.exclusive_games === 99 ? 'Все' : tier.exclusive_games}
                      </span>
                    </div>
                  )}
                </div>

                {/* КНОПКА КУПИТЬ */}
                <motion.button
                  onClick={() => handleBuy(tier)}
                  disabled={buying === tier.id || isActive || !isHigher}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-3 rounded-xl font-bold text-base transition-all ${
                    isActive
                      ? 'bg-casino-green/20 text-casino-green border-2 border-casino-green/50 cursor-default'
                      : !isHigher
                      ? 'bg-casino-bg text-casino-muted border border-casino-border cursor-not-allowed'
                      : tier.id === 5
                      ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black shadow-[0_0_30px_rgba(255,215,0,0.5)]'
                      : tier.id === 4
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black'
                      : tier.id === 3
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : tier.id === 2
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                      : 'bg-gradient-to-r from-gray-300 to-gray-500 text-black'
                  } disabled:opacity-50`}
                >
                  {buying === tier.id ? (
                    '⏳ Обработка...'
                  ) : isActive ? (
                    '✓ У ТЕБЯ АКТИВЕН'
                  ) : !isHigher ? (
                    '🔒 Недоступно (есть VIP выше)'
                  ) : (
                    `⭐ КУПИТЬ ЗА ${tier.stars} ⭐`
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* ИНФО ВНИЗУ */}
      <div className="text-center text-casino-muted text-xs mt-6 mb-2">
        💡 Все VIP покупаются за Telegram Stars<br />
        ⚡ Активация моментальная
      </div>
    </div>
  )
}