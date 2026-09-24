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
  const [userXp, setUserXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [userId])

  const loadAll = async () => {
    setLoading(true)
    const [packsRes, userRes] = await Promise.all([
      api.getXpPacks(),
      userId ? api.getBalance(userId) : Promise.resolve(null),
    ])
    if (Array.isArray(packsRes)) setPacks(packsRes as XpPack[])
    if (userRes && (userRes as any).xp !== undefined) setUserXp((userRes as any).xp)
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
          if (status === 'paid') setTimeout(loadAll, 1500)
        })
      } else {
        window.open(res.invoice_url, '_blank')
      }
    }
    setBuying(null)
  }

  const level = Math.floor(userXp / 100)
  const progress = userXp % 100
  const fill = Math.floor(progress / 100 * 10)
  const bar = '▰'.repeat(fill) + '▱'.repeat(10 - fill)

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-casino-muted">Загрузка...</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-casino-gold mb-2">⭐ БУСТ XP</h1>

      <Card>
        <div className="text-center">
          <div className="text-casino-muted text-sm">Твой XP</div>
          <div className="text-3xl font-bold text-casino-gold mt-1">{userXp} / {(level + 1) * 100}</div>
          <div className="text-xl tracking-widest text-casino-gold mt-2">{bar}</div>
          <div className="text-casino-muted text-sm mt-2">🎖 Уровень: {level}</div>
        </div>
      </Card>

      {packs.map((pack) => (
        <motion.div
          key={pack.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">⭐</div>
                <div>
                  <div className="font-bold text-lg">+{pack.xp} XP</div>
                  <div className="text-casino-muted text-sm">Мгновенно</div>
                </div>
              </div>
              <button
                onClick={() => handleBuy(pack)}
                disabled={buying === pack.id}
                className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold px-4 py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
              >
                {buying === pack.id ? '...' : `${pack.stars} ⭐`}
              </button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}