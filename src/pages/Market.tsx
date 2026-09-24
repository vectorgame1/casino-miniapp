import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../components/Card'
import { Avatar } from '../components/Avatar'
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

  // Цвет карточки по типу
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'boost': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40'
      case 'title': return 'from-purple-500/20 to-pink-500/20 border-purple-500/40'
      case 'vip': return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40'
      case 'case': return 'from-pink-500/20 to-red-500/20 border-pink-500/40'
      default: return 'from-casino-gold/20 to-casino-gold2/20 border-casino-gold/40'
    }
  }

  // Время "N мин назад"
  const timeAgo = (isoDate: string): string => {
    try {
      const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
      if (diff < 60) return 'только что'
      if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
      if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
      return `${Math.floor(diff / 86400)} д назад`
    } catch {
      return ''
    }
  }

  // Проверка "новое" (меньше 1 часа)
  const isNew = (isoDate: string): boolean => {
    try {
      const diff = (Date.now() - new Date(isoDate).getTime()) / 1000
      return diff < 3600
    } catch {
      return false
    }
  }

  const filteredLots = tab === 'browse'
    ? lots.filter((l) => l.seller_id !== userId)
    : lots.filter((l) => l.seller_id === userId)

  // Средняя цена (для бейджа "ДЁШЕВО")
  const avgPrice = filteredLots.length > 0
    ? filteredLots.reduce((sum, l) => sum + l.price, 0) / filteredLots.length
    : 0

  // Топ-лот (самый дорогой)
  const topLotId = filteredLots.length > 0
    ? filteredLots.reduce((max, l) => l.price > max.price ? l : max, filteredLots[0]).id
    : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-casino-muted">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">🏪</div>
          Загрузка рынка...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* ЗАГОЛОВОК */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-casino-gold">🏪 РЫНОК</h1>
      </div>

      {/* ТАБЫ */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { haptic('light'); setTab('browse') }}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === 'browse'
              ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-black shadow-gold'
              : 'bg-casino-card border border-casino-border text-casino-muted'
          }`}
        >
          🛒 КУПИТЬ
        </button>
        <button
          onClick={() => { haptic('light'); setTab('mylots') }}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === 'mylots'
              ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-black shadow-gold'
              : 'bg-casino-card border border-casino-border text-casino-muted'
          }`}
        >
          📦 МОИ ЛОТЫ
        </button>
      </div>

      {/* ИНФО-БАННЕР */}
      <Card className="mb-4 bg-gradient-to-r from-casino-gold/5 to-casino-gold2/5 border-casino-gold/30">
        <div className="text-casino-muted text-xs text-center">
          💡 Продавай бусты, титулы, VIP другим игрокам
          <br />
          💰 Комиссия 5% → в джекпот 🎰
        </div>
      </Card>

      {/* СПИСОК ЛОТОВ */}
      {filteredLots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <div className="text-center py-12 text-casino-muted">
              <div className="text-6xl mb-4">
                {tab === 'browse' ? '🛒' : '📦'}
              </div>
              <div className="font-bold text-lg mb-2">
                {tab === 'browse' ? 'Пока никто не продаёт' : 'У тебя нет лотов'}
              </div>
              <div className="text-xs">
                {tab === 'browse'
                  ? 'Стань первым продавцом!'
                  : 'Продай что-нибудь со Склада 🎒'}
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredLots.map((lot, index) => {
            const typeColor = getTypeColor(lot.type)
            const isTop = lot.id === topLotId
            const isCheap = avgPrice > 0 && lot.price < avgPrice * 0.8
            const newLot = isNew(lot.created_at)
            const isMine = lot.seller_id === userId

            return (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={`rounded-2xl border-2 bg-gradient-to-br ${typeColor} p-4 relative overflow-hidden`}>
                  {/* БЕЙДЖИ СВЕРХУ */}
                  <div className="absolute top-2 right-2 flex gap-1 flex-wrap justify-end">
                    {isTop && (
                      <span className="bg-gradient-to-r from-yellow-400 to-amber-600 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                        💎 ТОП
                      </span>
                    )}
                    {isCheap && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                        🔥 ДЁШЕВО
                      </span>
                    )}
                    {newLot && (
                      <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                        ⚡ НОВОЕ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* ИКОНКА ПРЕДМЕТА */}
                    <div className="w-14 h-14 rounded-xl bg-casino-bg/60 border border-casino-border flex items-center justify-center text-3xl flex-shrink-0">
                      {getLotIcon(lot.type)}
                    </div>

                    {/* ОПИСАНИЕ */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate text-casino-text">
                        {getLotTitle(lot)}
                      </div>

                      {/* ЦЕНА */}
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-casino-gold text-lg font-black">
                          💎 {fmtNumber(lot.price)}
                        </span>
                        <span className="text-casino-muted text-[10px]">Tokens</span>
                      </div>

                      {/* ПРОДАВЕЦ + ВРЕМЯ */}
                      <div className="flex items-center gap-2 mt-1 text-casino-muted text-[10px]">
                        {!isMine && (
                          <div className="flex items-center gap-1">
                            <span>👤</span>
                            <span className="truncate max-w-[80px]">{lot.seller_name}</span>
                          </div>
                        )}
                        {isMine && (
                          <span className="text-casino-green font-bold">👤 Это твой лот</span>
                        )}
                        {lot.created_at && (
                          <>
                            <span>•</span>
                            <span>{timeAgo(lot.created_at)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* КНОПКА */}
                    {tab === 'browse' && !isMine && (
                      <button
                        onClick={() => handleBuy(lot)}
                        disabled={buying === lot.id}
                        className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-black px-4 py-3 rounded-xl text-xs active:scale-95 transition-transform disabled:opacity-50 shadow-gold flex-shrink-0"
                      >
                        {buying === lot.id ? '⏳' : 'КУПИТЬ'}
                      </button>
                    )}
                    {tab === 'mylots' && isMine && (
                      <button
                        onClick={() => handleRemove(lot)}
                        disabled={removing === lot.id}
                        className="bg-casino-bg border-2 border-casino-red text-casino-red font-bold px-3 py-3 rounded-xl text-xs active:scale-95 transition-transform disabled:opacity-50 flex-shrink-0"
                      >
                        {removing === lot.id ? '⏳' : '❌ СНЯТЬ'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ИНФО ВНИЗУ */}
      {filteredLots.length > 0 && (
        <div className="text-center text-casino-muted text-xs mt-6 mb-2">
          📊 Лотов в разделе: <b className="text-casino-text">{filteredLots.length}</b>
        </div>
      )}
    </div>
  )
}