import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface XpPack {
  id: string
  xp: number
  stars: number
}

export function XP() {
  const { userId, haptic, hapticSuccess } = useTelegram()
  const [packs, setPacks] = useState<XpPack[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)

  useEffect(() => {
    loadPacks()
  }, [])

  const loadPacks = async () => {
    setLoading(true)
    const res = await api.getXpPacks()
    if (Array.isArray(res)) setPacks(res as XpPack[])
    setLoading(false)
  }

  const handleBuy = async (pack: XpPack) => {
    if (!userId || buying) return
    haptic('medium')
    setBuying(pack.id)
    const res = await api.buyXpPack(userId, pack.id) as any
    if (res?.invoice_url) {
      hapticSuccess()
      const tg = (window as any).Telegram?.WebApp
      if (tg?.openInvoice) {
        tg.openInvoice(res.invoice_url, (status: string) => {
          if (status === 'paid') setTimeout(loadPacks, 1500)
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
    <div className="p-4 pb-24">
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl tracking-widest text-casino-gold">БУСТ XP</h1>
        <p className="text-casino-muted text-[10px] tracking-widest uppercase mt-1">
          Мгновенно · за Stars
        </p>
      </div>

      <div className="space-y-3">
        {packs.map((pack, index) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-casino-bg/70 border border-casino-gold/40 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.6">
                      <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17.5 L6 21 L7 14 L2 9 L9 8 Z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-display tracking-wider text-casino-text text-lg">
                      +{fmt(pack.xp)} XP
                    </div>
                    <div className="text-[10px] tracking-widest uppercase text-casino-muted">
                      Мгновенно
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(pack)}
                  disabled={buying === pack.id}
                  className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display tracking-widest px-4 py-3 rounded-lg text-sm active:scale-95 disabled:opacity-50 shadow-gold flex-shrink-0"
                >
                  {buying === pack.id ? '...' : `${pack.stars} STARS`}
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-casino-muted text-[10px] mt-6 mb-2 tracking-widest uppercase">
        Все покупки за Telegram Stars
      </div>
    </div>
  )
}