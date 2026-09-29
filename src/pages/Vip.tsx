import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/Card'
import { InfoModal } from '../components/InfoModal'
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

// ═══════════════ SVG-ИКОНКА VIP ═══════════════
const VipIcon = ({ tier, size = 32 }: { tier: number; size?: number }) => {
  const colors: Record<number, string> = {
    1: '#C0C0C0',
    2: '#D4AF37',
    3: '#B464FF',
    4: '#00CED1',
    5: '#FFD700',
  }
  const c = colors[tier] || '#D4AF37'

  if (tier === 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L22 12 L12 22 L2 12 Z" fill={c} opacity="0.9" />
        <path d="M12 6 L18 12 L12 18 L6 12 Z" fill="#fff" opacity="0.3" />
      </svg>
    )
  }
  if (tier === 2) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={c}>
        <path d="M3 17 L5 7 L10 12 L12 5 L14 12 L19 7 L21 17 Z" />
        <circle cx="12" cy="5" r="1.2" fill="#fff" opacity="0.7" />
      </svg>
    )
  }
  if (tier === 3) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={c}>
        <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17.5 L6 21 L7 14 L2 9 L9 8 Z" />
      </svg>
    )
  }
  if (tier === 4) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M6 3 H18 L22 9 L12 21 L2 9 Z" fill={c} />
        <path d="M2 9 H22 M12 21 L9 9 L12 3 L15 9 L12 21" stroke="#0A0A0F" strokeWidth="0.6" fill="none" opacity="0.5" />
      </svg>
    )
  }
  if (tier === 5) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={c}>
        <path d="M3 18 L4 8 L9 13 L12 5 L15 13 L20 8 L21 18 Z" />
        <circle cx="12" cy="4" r="1.5" fill="#fff" />
      </svg>
    )
  }
  return null
}

// ═══════════════ СТИЛИ ТИРОВ ═══════════════
const VIP_STYLES: Record<number, {
  border: string
  textColor: string
  glow: string
  badge?: { text: string; color: string }
}> = {
  1: { border: 'border-gray-400/40', textColor: 'text-gray-300', glow: 'rgba(192,192,192,0.2)' },
  2: { border: 'border-casino-gold/50', textColor: 'text-casino-gold', glow: 'rgba(212,175,55,0.3)', badge: { text: 'ВЫГОДНО', color: 'bg-gradient-to-r from-casino-gold to-casino-gold2' } },
  3: { border: 'border-purple-400/50', textColor: 'text-purple-300', glow: 'rgba(180,100,255,0.35)', badge: { text: 'ХИТ', color: 'bg-gradient-to-r from-orange-500 to-red-600' } },
  4: { border: 'border-cyan-400/50', textColor: 'text-cyan-300', glow: 'rgba(0,200,255,0.3)' },
  5: { border: 'border-casino-gold/70', textColor: 'text-casino-gold', glow: 'rgba(212,175,55,0.5)', badge: { text: 'ЛУЧШЕЕ', color: 'bg-gradient-to-r from-casino-gold to-amber-600' } },
}

export function Vip() {
  const { userId, haptic, hapticSuccess } = useTelegram()
  const [tiers, setTiers] = useState<VipTier[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<number | null>(null)
  const [currentVip, setCurrentVip] = useState<number>(0)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    loadTiers()
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    if (!userId) return
    try {
      const res = await api.getProfile(userId) as any
      if (res?.vip_tier) setCurrentVip(res.vip_tier)
    } catch (e) { console.error(e) }
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
          if (status === 'paid') setTimeout(() => { loadTiers(); loadProfile() }, 1500)
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
          <div className="w-8 h-8 border-2 border-casino-gold/30 border-t-casino-gold rounded-full animate-spin mx-auto mb-3" />
          <div className="text-[10px] tracking-widest uppercase">Загрузка</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="text-center mb-4 relative">
        <h1 className="font-display text-3xl tracking-widest text-casino-gold">VIP КЛУБ</h1>
        <p className="text-casino-muted text-[10px] tracking-widest uppercase mt-1">
          Эксклюзивные привилегии
        </p>
        <button
          onClick={() => { haptic('light'); setShowInfo(true) }}
          className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-lg bg-casino-bg/80 border border-casino-border/60 text-casino-gold active:scale-95 z-10"
        >
          ?
        </button>
      </div>

      {tiers.map((tier, index) => {
        const style = VIP_STYLES[tier.id] || VIP_STYLES[1]
        const isActive = currentVip === tier.id
        const isHigher = tier.id > currentVip

        return (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            {tier.id >= 3 && (
              <div className="absolute inset-0 rounded-xl blur-2xl -z-10 opacity-60" style={{ background: style.glow }} />
            )}

            <Card className={`${style.border} relative overflow-hidden`}>
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-casino-green to-casino-greenLight" />
              )}

              {style.badge && !isActive && (
                <div className={`absolute top-3 right-3 ${style.badge.color} text-casino-bg text-[9px] font-display tracking-widest px-2 py-1 rounded shadow-lg`}>
                  {style.badge.text}
                </div>
              )}

              {isActive && (
                <div className="absolute top-3 right-3 bg-casino-green text-casino-bg text-[9px] font-display tracking-widest px-2 py-1 rounded shadow-lg">
                  ТВОЙ
                </div>
              )}

              <div className="flex items-center gap-3 mb-4 mt-2">
                <motion.div animate={tier.id === 5 ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
                  <VipIcon tier={tier.id} size={44} />
                </motion.div>
                <div className="flex-1">
                  <div className="text-[9px] tracking-widest uppercase text-casino-muted font-display">
                    УРОВЕНЬ {tier.id}
                  </div>
                  <div className={`font-display text-xl tracking-wider ${style.textColor}`}>
                    {tier.name.toUpperCase()}
                  </div>
                  <div className="text-casino-gold font-display tracking-widest text-sm mt-0.5">
                    {tier.stars} STARS
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between items-center border-b border-casino-border/30 pb-2">
                  <span className="text-casino-muted tracking-wider">КЭШБЭК</span>
                  <span className={`font-display tracking-wider text-base ${style.textColor}`}>{tier.cashback}%</span>
                </div>
                <div className="flex justify-between items-center border-b border-casino-border/30 pb-2">
                  <span className="text-casino-muted tracking-wider">БОНУС СРАЗУ</span>
                  <span className="font-display tracking-wider text-base text-casino-text">+{fmt(tier.bonus)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-casino-border/30 pb-2">
                  <span className="text-casino-muted tracking-wider">СРОК</span>
                  <span className="font-display tracking-wider text-base text-casino-text">{tier.duration_days} ДН.</span>
                </div>
                {tier.exclusive_games > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-casino-muted tracking-wider">ЭКСКЛ. ИГР</span>
                    <span className="font-display tracking-wider text-base text-casino-text">
                      {tier.exclusive_games === 99 ? 'ВСЕ' : tier.exclusive_games}
                    </span>
                  </div>
                )}
              </div>

              <motion.button
                onClick={() => handleBuy(tier)}
                disabled={buying === tier.id || isActive || !isHigher}
                whileTap={{ scale: 0.97 }}
                className={`w-full py-3 rounded-lg font-display tracking-widest text-sm transition-all ${
                  isActive
                    ? 'bg-casino-green/20 text-casino-greenLight border border-casino-greenLight/40 cursor-default'
                    : !isHigher
                    ? 'bg-casino-bg text-casino-muted border border-casino-border/60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg shadow-gold'
                } disabled:opacity-50`}
              >
                {buying === tier.id ? '...' : isActive ? 'АКТИВЕН' : !isHigher ? 'НЕДОСТУПНО' : `КУПИТЬ ЗА ${tier.stars}`}
              </motion.button>
            </Card>
          </motion.div>
        )
      })}

      <div className="text-center text-casino-muted text-[10px] mt-6 mb-2 tracking-widest uppercase">
        Все VIP покупаются за Telegram Stars
        <br />
        Активация моментальная
      </div>

      <InfoModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title="VIP КЛУБ"
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#D4AF37">
            <path d="M3 17 L5 7 L10 11 L12 5 L14 11 L19 7 L21 17 Z" />
          </svg>
        }
      >
        <p>VIP даёт <b className="text-casino-gold">эксклюзивные привилегии</b>:</p>
        <p>• 💸 <b>Кэшбэк</b> до 10% с проигрышей</p>
        <p>• 🎁 <b>Бонус сразу</b> до 100 000 Tokens</p>
        <p>• 🎰 <b>Эксклюзивные игры</b></p>
        <p>• ⏱ Срок: 20 дней</p>
        <p>💡 Все VIP — за Telegram Stars.</p>
      </InfoModal>
    </div>
  )
}