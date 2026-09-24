import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/Card'
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

export function Vip() {
  const { userId, haptic, hapticSuccess } = useTelegram()
  const [tiers, setTiers] = useState<VipTier[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<number | null>(null)

  useEffect(() => {
    loadTiers()
  }, [])

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
            setTimeout(loadTiers, 1500)
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
    return <div className="flex items-center justify-center h-64 text-casino-muted">Загрузка VIP...</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-casino-gold mb-2">👑 VIP КЛУБ</h1>
      <p className="text-casino-muted text-sm mb-4">Эксклюзивные привилегии за Telegram Stars</p>

      {tiers.map((tier) => (
        <motion.div
          key={tier.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="border-casino-gold/40">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-5xl">{tier.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-lg">VIP {tier.id} — {tier.name}</div>
                <div className="text-casino-gold text-sm font-bold">{tier.stars} ⭐</div>
              </div>
            </div>

            <div className="space-y-1 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-casino-muted">💸 Кэшбэк</span>
                <span className="font-bold text-casino-green">{tier.cashback}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">🎁 Бонус сразу</span>
                <span className="font-bold">+{fmt(tier.bonus)} Tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">⏱ Срок</span>
                <span className="font-bold">{tier.duration_days} дней</span>
              </div>
              {tier.exclusive_games > 0 && (
                <div className="flex justify-between">
                  <span className="text-casino-muted">🎰 Эксклюзивных игр</span>
                  <span className="font-bold">{tier.exclusive_games === 99 ? 'Все' : tier.exclusive_games}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleBuy(tier)}
              disabled={buying === tier.id}
              className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
            >
              {buying === tier.id ? '...' : `⭐ КУПИТЬ ЗА ${tier.stars} ⭐`}
            </button>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}