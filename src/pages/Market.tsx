import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface MarketLot {
  id: string
  seller_id: number
  seller_name: string
  type: string
  payload: any
  price: number
  created_at: string
}

export function Market() {
  const { userId, haptic, hapticSuccess } = useTelegram()
  const [lots, setLots] = useState<MarketLot[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'browse' | 'mylots'>('browse')
  const [buying, setBuying] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    loadLots()
  }, [])

  const loadLots = async () => {
    setLoading(true)
    const res = await api.getMarketLots()
    if (res && Array.isArray(res)) setLots(res as MarketLot[])
    setLoading(false)
  }

  const handleBuy = async (lot: MarketLot) => {
    if (buying) return
    haptic('medium')
    setBuying(lot.id)
    const res = await api.buyMarketLot(userId, lot.id) as any
    if (res?.success) {
      hapticSuccess()
      alert(res.message || `✅ Куплено за ${fmtNumber(lot.price)} Tokens`)
      await loadLots()
    } else {
      alert(res?.error || '❌ Ошибка покупки')
    }
    setBuying(null)
  }

  const handleRemove = async (lot: MarketLot) => {
    if (removing) return
    if (!confirm(`Снять лот "${getLotTitle(lot)}"?\nПредмет вернётся на Склад.`)) return
    haptic('medium')
    setRemoving(lot.id)
    const res = await api.removeMarketLot(userId, lot.id) as any
    if (res?.success) {
      hapticSuccess()
      await loadLots()
    } else {
      alert(res?.error || '❌ Ошибка снятия лота')
    }
    setRemoving(null)
  }

  const fmtNumber = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const getLotIcon = (type: string): string => {
    switch (type) {
      case 'boost': return '⚡'
      case 'title': return '🏷️'
      case 'vip': return '👑'
      case 'case': return '🎰'
      default: return '🎁'
    }
  }

  const getLotTitle = (lot: MarketLot): string => {
    const p = lot.payload || {}
    if (lot.type === 'boost') return `Буст ×${p.mult} на ${p.minutes} мин`
    if (lot.type === 'title') return `Титул «${p.title}»`
    if (lot.type === 'vip') return `VIP уровень ${p.vip_level}`
    return 'Предмет'
  }

  const filteredLots = tab === 'browse'
    ? lots.filter((l) => l.seller_id !== userId)
    : lots.filter((l) => l.seller_id === userId)

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-casino-muted">Загрузка рынка...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-casino-gold mb-4">🏪 РЫНОК</h1>

      {/* Табы */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { haptic('light'); setTab('browse') }}
          className={`flex-1 py-2 rounded-xl font-bold text-sm ${
            tab === 'browse' ? 'bg-casino-gold text-black' : 'bg-casino-card border border-casino-border text-casino-muted'
          }`}
        >
          🛒 Купить
        </button>
        <button
          onClick={() => { haptic('light'); setTab('mylots') }}
          className={`flex-1 py-2 rounded-xl font-bold text-sm ${
            tab === 'mylots' ? 'bg-casino-gold text-black' : 'bg-casino-card border border-casino-border text-casino-muted'
          }`}
        >
          📦 Мои лоты
        </button>
      </div>

      {/* Инфо */}
      <Card className="mb-3 bg-casino-bg">
        <div className="text-casino-muted text-xs text-center">
          💡 Продавай свои бусты и титулы другим игрокам
          <br />
          💰 Комиссия 5% → в джекпот
        </div>
      </Card>

      {/* Список лотов */}
      {filteredLots.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-casino-muted">
            <div className="text-5xl mb-3">🏪</div>
            {tab === 'browse' ? 'Пока никто не продаёт' : 'У тебя нет лотов'}
            <div className="text-xs mt-2">
              {tab === 'browse' ? 'Стань первым продавцом!' : 'Продай что-нибудь со Склада'}
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLots.map((lot, index) => (
            <motion.div
              key={lot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getLotIcon(lot.type)}</div>
                  <div className="flex-1">
                    <div className="font-bold">{getLotTitle(lot)}</div>
                    <div className="text-casino-gold font-bold mt-1">
                      💎 {fmtNumber(lot.price)}
                    </div>
                    <div className="text-casino-muted text-xs mt-1">
                      👤 {lot.seller_name}
                    </div>
                  </div>
                  {tab === 'browse' && (
                    <button
                      onClick={() => handleBuy(lot)}
                      disabled={buying === lot.id}
                      className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold px-4 py-2 rounded-xl text-sm active:scale-95 disabled:opacity-50"
                    >
                      {buying === lot.id ? '...' : 'КУПИТЬ'}
                    </button>
                  )}
                  {tab === 'mylots' && (
                    <button
                      onClick={() => handleRemove(lot)}
                      disabled={removing === lot.id}
                      className="bg-casino-bg border border-casino-red text-casino-red px-3 py-2 rounded-xl text-xs active:scale-95 disabled:opacity-50"
                    >
                      {removing === lot.id ? '...' : 'СНЯТЬ'}
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}