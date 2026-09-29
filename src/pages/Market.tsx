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
      alert(res.message || `Куплено за ${fmtNumber(lot.price)} Tokens`)
      await loadLots()
    } else {
      alert(res?.error || 'Ошибка покупки')
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
      alert(res?.error || 'Ошибка снятия лота')
    }
    setRemoving(null)
  }

  const fmtNumber = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const getLotTitle = (lot: MarketLot): string => {
    const p = lot.payload || {}
    if (lot.type === 'boost') return `Буст ×${p.mult} на ${p.minutes} мин`
    if (lot.type === 'title') return `Титул «${p.title}»`
    if (lot.type === 'vip') return `VIP уровень ${p.vip_level}`
    return 'Предмет'
  }

  const getTypeLabel = (type: string): string => {
    return type === 'boost' ? 'БУСТ' : type === 'title' ? 'ТИТУЛ' : type === 'vip' ? 'VIP' : 'ПРЕДМЕТ'
  }

  const LotIcon = ({ type }: { type: string }) => {
    if (type === 'boost') return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.6">
        <path d="M13 2 L4 14 H11 L10 22 L19 10 H12 Z" />
      </svg>
    )
    if (type === 'title') return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.6">
        <path d="M4 7 H20 L21 20 A1 1 0 0 1 20 21 H4 A1 1 0 0 1 3 20 Z" />
        <path d="M9 7 V4 H15 V7" />
      </svg>
    )
    if (type === 'vip') return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#D4AF37">
        <path d="M3 17 L5 7 L10 11 L12 5 L14 11 L19 7 L21 17 Z" />
      </svg>
    )
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
      </svg>
    )
  }

  const timeAgo = (isoDate: string): string => {
    try {
      const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
      if (diff < 60) return 'только что'
      if (diff < 3600) return `${Math.floor(diff / 60)} мин`
      if (diff < 86400) return `${Math.floor(diff / 3600)} ч`
      return `${Math.floor(diff / 86400)} д`
    } catch { return '' }
  }

  const filteredLots = tab === 'browse'
    ? lots.filter((l) => l.seller_id !== userId)
    : lots.filter((l) => l.seller_id === userId)

  const avgPrice = filteredLots.length > 0
    ? filteredLots.reduce((sum, l) => sum + l.price, 0) / filteredLots.length
    : 0

  const topLotId = filteredLots.length > 0
    ? filteredLots.reduce((max, l) => l.price > max.price ? l : max, filteredLots[0]).id
    : null

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
      <div className="text-center mb-4">
        <h1 className="font-display text-3xl tracking-widest text-casino-gold">РЫНОК</h1>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { haptic('light'); setTab('browse') }}
          className={`flex-1 py-3 rounded-lg font-display text-xs tracking-widest transition-all border ${
            tab === 'browse'
              ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg border-transparent shadow-gold'
              : 'bg-casino-card border-casino-border/60 text-casino-muted'
          }`}
        >
          КУПИТЬ
        </button>
        <button
          onClick={() => { haptic('light'); setTab('mylots') }}
          className={`flex-1 py-3 rounded-lg font-display text-xs tracking-widest transition-all border ${
            tab === 'mylots'
              ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg border-transparent shadow-gold'
              : 'bg-casino-card border-casino-border/60 text-casino-muted'
          }`}
        >
          МОИ ЛОТЫ
        </button>
      </div>

      <Card className="mb-4 bg-casino-bg/50">
        <div className="text-casino-muted text-[10px] text-center tracking-wider">
          ПРОДАВАЙ БУСТЫ, ТИТУЛЫ, VIP ДРУГИМ ИГРОКАМ
          <br />
          КОМИССИЯ 5% → В ДЖЕКПОТ
        </div>
      </Card>

      {filteredLots.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <div className="text-center py-12 text-casino-muted">
              <div className="flex justify-center mb-4">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#6B6B7B" strokeWidth="1.2">
                  <path d="M4 7 H20 L21 20 A1 1 0 0 1 20 21 H4 A1 1 0 0 1 3 20 Z" />
                  <path d="M8 7 V4 H16 V7" />
                </svg>
              </div>
              <div className="font-display tracking-widest text-lg mb-2">
                {tab === 'browse' ? 'ПОКА НИКТО НЕ ПРОДАЁТ' : 'У ТЕБЯ НЕТ ЛОТОВ'}
              </div>
              <div className="text-[10px] tracking-wider">
                {tab === 'browse' ? 'Стань первым продавцом!' : 'Продай что-нибудь со Склада'}
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredLots.map((lot, index) => {
            const isTop = lot.id === topLotId
            const isCheap = avgPrice > 0 && lot.price < avgPrice * 0.8
            const isMine = lot.seller_id === userId

            return (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {isTop && (
                      <span className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg text-[9px] font-display tracking-widest px-2 py-0.5 rounded-full shadow">
                        ТОП
                      </span>
                    )}
                    {isCheap && !isTop && (
                      <span className="bg-gradient-to-r from-casino-green to-casino-greenLight text-casino-bg text-[9px] font-display tracking-widest px-2 py-0.5 rounded-full shadow">
                        ДЁШЕВО
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-casino-bg/70 border border-casino-border/60 flex items-center justify-center flex-shrink-0">
                      <LotIcon type={lot.type} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] tracking-widest uppercase text-casino-muted font-display">
                        {getTypeLabel(lot.type)}
                      </div>
                      <div className="font-display tracking-wider text-casino-text truncate">
                        {getLotTitle(lot)}
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-casino-gold font-display tracking-wider text-lg">
                          {fmtNumber(lot.price)}
                        </span>
                        <span className="text-casino-muted text-[9px] tracking-widest">TOKENS</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-casino-muted text-[10px] tracking-wider">
                        {isMine ? (
                          <span className="text-casino-greenLight font-display tracking-wider">ЭТО ТВОЙ ЛОТ</span>
                        ) : (
                          <span className="truncate">{lot.seller_name}</span>
                        )}
                        {lot.created_at && (
                          <>
                            <span>·</span>
                            <span>{timeAgo(lot.created_at)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {tab === 'browse' && !isMine && (
                      <button
                        onClick={() => handleBuy(lot)}
                        disabled={buying === lot.id}
                        className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display tracking-widest px-3 py-3 rounded-lg text-[10px] active:scale-95 disabled:opacity-50 shadow-gold flex-shrink-0"
                      >
                        {buying === lot.id ? '...' : 'КУПИТЬ'}
                      </button>
                    )}
                    {tab === 'mylots' && isMine && (
                      <button
                        onClick={() => handleRemove(lot)}
                        disabled={removing === lot.id}
                        className="bg-casino-bg border border-casino-redLight text-casino-redLight font-display tracking-widest px-3 py-3 rounded-lg text-[10px] active:scale-95 disabled:opacity-50 flex-shrink-0"
                      >
                        {removing === lot.id ? '...' : 'СНЯТЬ'}
                      </button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {filteredLots.length > 0 && (
        <div className="text-center text-casino-muted text-[10px] mt-6 mb-2 tracking-widest uppercase font-display">
          Лотов в разделе: <span className="text-casino-text">{filteredLots.length}</span>
        </div>
      )}
    </div>
  )
}