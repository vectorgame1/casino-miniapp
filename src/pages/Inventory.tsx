import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface InventoryItem {
  inv_id: string
  type: string
  mult?: number
  minutes?: number
  title?: string
  vip_level?: number
  case_id?: string
  obtained_at?: string
}

const TABS = [
  { id: 'all', label: 'ВСЕ' },
  { id: 'boost', label: 'БУСТЫ' },
  { id: 'title', label: 'ТИТУЛЫ' },
  { id: 'vip', label: 'VIP' },
  { id: 'case', label: 'КЕЙСЫ' },
]

// ═══════════════ SVG-ИКОНКИ ПРЕДМЕТОВ ═══════════════
const ItemIcon = ({ type, size = 32 }: { type: string; size?: number }) => {
  const c = '#D4AF37'
  if (type === 'boost') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={c}>
        <path d="M13 2 L4 14 H11 L10 22 L19 10 H12 Z" />
      </svg>
    )
  }
  if (type === 'title') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7 H20 L21 20 A1 1 0 0 1 20 21 H4 A1 1 0 0 1 3 20 Z" />
        <path d="M9 7 V4 H15 V7" />
      </svg>
    )
  }
  if (type === 'vip') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={c}>
        <path d="M3 17 L5 7 L10 11 L12 5 L14 11 L19 7 L21 17 Z" />
      </svg>
    )
  }
  if (type === 'case') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M3 11 H21 M12 7 V11" />
        <path d="M9 7 V4 H15 V7" />
        <circle cx="12" cy="15" r="1.5" fill={c} />
      </svg>
    )
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="12" cy="12" r="9" /></svg>
}

// ═══════════════ РЕДКОСТЬ ═══════════════
const RARITY: Record<string, { name: string; border: string; text: string; glow: string }> = {
  boost: { name: 'ЭПИК', border: 'border-casino-gold/50', text: 'text-casino-gold', glow: 'rgba(212,175,55,0.3)' },
  title: { name: 'РЕДКИЙ', border: 'border-purple-500/50', text: 'text-purple-300', glow: 'rgba(180,100,255,0.3)' },
  vip: { name: 'ЛЕГЕНДА', border: 'border-cyan-500/50', text: 'text-cyan-300', glow: 'rgba(0,200,255,0.3)' },
  case: { name: 'РЕДКИЙ', border: 'border-pink-500/50', text: 'text-pink-300', glow: 'rgba(255,100,150,0.3)' },
}

export function Inventory() {
  const { userId, haptic, hapticSuccess } = useTelegram()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [using, setUsing] = useState(false)
  const [sellItem, setSellItem] = useState<InventoryItem | null>(null)
  const [sellPrice, setSellPrice] = useState('50000')
  const [selling, setSelling] = useState(false)

  useEffect(() => {
    loadInventory()
  }, [userId])

  const loadInventory = async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const res = await api.getInventory(userId)
    if (res && Array.isArray(res)) setItems(res as InventoryItem[])
    setLoading(false)
  }

  const filteredItems = activeTab === 'all' ? items : items.filter((i) => i.type === activeTab)

  const handleUse = async (item: InventoryItem) => {
    haptic('medium')
    setUsing(true)
    setTimeout(() => {
      hapticSuccess()
      setItems(items.filter((i) => i.inv_id !== item.inv_id))
      setSelectedItem(null)
      setUsing(false)
    }, 500)
  }

  const getItemTitle = (item: InventoryItem): string => {
    switch (item.type) {
      case 'boost': return `БУСТ ×${item.mult} НА ${item.minutes} МИН`
      case 'title': return `ТИТУЛ «${item.title}»`
      case 'vip': return `VIP УРОВЕНЬ ${item.vip_level}`
      case 'case': return `КЕЙС ${item.case_id || ''}`
      default: return 'ПРЕДМЕТ'
    }
  }

  const timeAgo = (isoDate?: string): string => {
    if (!isoDate) return ''
    try {
      const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
      if (diff < 60) return 'только что'
      if (diff < 3600) return `${Math.floor(diff / 60)} мин`
      if (diff < 86400) return `${Math.floor(diff / 3600)} ч`
      return `${Math.floor(diff / 86400)} д`
    } catch { return '' }
  }

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
        <h1 className="font-display text-3xl tracking-widest text-casino-gold">СКЛАД</h1>
        <p className="text-casino-muted text-[10px] tracking-widest uppercase mt-1">
          Всего предметов: <span className="text-casino-text">{items.length}</span>
        </p>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {TABS.map((tab) => {
          const count = tab.id === 'all' ? items.length : items.filter(i => i.type === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => { haptic('light'); setActiveTab(tab.id) }}
              className={`flex-shrink-0 px-3.5 py-2 rounded-lg font-display text-[10px] tracking-widest transition-all border ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg border-transparent shadow-gold'
                  : 'bg-casino-card text-casino-muted border-casino-border/60'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 ${activeTab === tab.id ? 'text-casino-bg/70' : 'text-casino-muted'}`}>
                  ({count})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-casino-muted">
            <div className="flex justify-center mb-3 opacity-50">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#6B6B7B" strokeWidth="1.2">
                <path d="M4 7 H20 L21 20 A1 1 0 0 1 20 21 H4 A1 1 0 0 1 3 20 Z" />
                <path d="M9 7 V5 A3 3 0 0 1 15 5 V7" />
              </svg>
            </div>
            <div className="font-display tracking-widest mb-1">
              {activeTab === 'all' ? 'СКЛАД ПУСТ' : 'НЕТ ПРЕДМЕТОВ'}
            </div>
            <div className="text-[10px] tracking-wider">Открой кейс, чтобы получить предметы</div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const rarity = RARITY[item.type] || RARITY.boost
            return (
              <motion.div
                key={item.inv_id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`${rarity.border} relative overflow-hidden`}>
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top right, ${rarity.glow}, transparent 60%)` }}
                  />
                  <div className={`absolute top-2 right-2 ${rarity.text} text-[9px] font-display tracking-widest px-2 py-0.5 rounded border ${rarity.border}`}>
                    {rarity.name}
                  </div>

                  <div className="flex items-center gap-3 relative z-[1]">
                    <div className="w-14 h-14 rounded-lg bg-casino-bg/70 border border-casino-border/60 flex items-center justify-center flex-shrink-0">
                      <ItemIcon type={item.type} size={28} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-display tracking-wider text-sm text-casino-text truncate pr-16">
                        {getItemTitle(item)}
                      </div>
                      <div className="text-casino-muted text-[10px] mt-1 tracking-wider">
                        {timeAgo(item.obtained_at) || 'Получено'}
                      </div>
                    </div>

                    <button
                      onClick={() => { haptic('light'); setSelectedItem(item) }}
                      className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display tracking-widest px-3 py-2 rounded-lg text-[10px] active:scale-95 flex-shrink-0 shadow-gold"
                    >
                      ДЕЙСТВИЯ
                    </button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* МОДАЛКА ДЕЙСТВИЙ */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className={`bg-casino-card border-2 ${RARITY[selectedItem.type]?.border || 'border-casino-border'} rounded-xl p-6 max-w-sm w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <motion.div
                  className="flex justify-center mb-3"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ItemIcon type={selectedItem.type} size={64} />
                </motion.div>
                <div className="font-display tracking-wider text-lg">{getItemTitle(selectedItem)}</div>
                <div className={`inline-block mt-2 ${RARITY[selectedItem.type]?.text} text-[9px] font-display tracking-widest px-2 py-0.5 rounded border ${RARITY[selectedItem.type]?.border}`}>
                  {RARITY[selectedItem.type]?.name}
                </div>
              </div>

              <div className="space-y-2">
                {selectedItem.type !== 'case' && (
                  <button
                    onClick={() => handleUse(selectedItem)}
                    disabled={using}
                    className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display tracking-widest py-3 rounded-lg disabled:opacity-50"
                  >
                    {using ? '...' : 'ИСПОЛЬЗОВАТЬ'}
                  </button>
                )}
                <button
                  onClick={() => { haptic('medium'); setSellItem(selectedItem); setSellPrice('50000'); setSelectedItem(null) }}
                  className="w-full bg-casino-bg border border-casino-red/50 text-casino-redLight font-display tracking-widest py-3 rounded-lg"
                >
                  ПРОДАТЬ
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full bg-casino-bg border border-casino-border/60 text-casino-muted font-display tracking-widest py-3 rounded-lg"
                >
                  ОТМЕНА
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* МОДАЛКА ПРОДАЖИ */}
      <AnimatePresence>
        {sellItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSellItem(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-casino-card border-2 border-casino-red/50 rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="flex justify-center mb-2">
                  <ItemIcon type={sellItem.type} size={48} />
                </div>
                <div className="font-display tracking-wider">{getItemTitle(sellItem)}</div>
              </div>

              <div className="mb-4">
                <label className="text-casino-muted text-[10px] tracking-widest uppercase">Цена (Tokens)</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  className="w-full bg-casino-bg border border-casino-border/60 rounded-lg px-4 py-3 mt-2 text-casino-text text-lg text-center font-display tracking-wider"
                />
                <div className="text-casino-muted text-[10px] mt-1 text-center tracking-wider">
                  Минимум 10 000 · Комиссия 5%
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={async () => {
                    const price = parseInt(sellPrice)
                    if (!price || price < 10000) { alert('Минимум 10 000'); return }
                    setSelling(true)
                    const res = await api.sellInventoryItem(userId, sellItem.inv_id, price) as any
                    if (res?.success) {
                      hapticSuccess()
                      setItems(items.filter((i) => i.inv_id !== sellItem.inv_id))
                      setSellItem(null)
                      alert(`Лот выставлен за ${price.toLocaleString('ru-RU')} Tokens`)
                    } else {
                      alert(res?.error || 'Ошибка')
                    }
                    setSelling(false)
                  }}
                  disabled={selling}
                  className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display tracking-widest py-3 rounded-lg disabled:opacity-50"
                >
                  {selling ? '...' : 'ВЫСТАВИТЬ'}
                </button>
                <button
                  onClick={() => setSellItem(null)}
                  className="w-full bg-casino-bg border border-casino-border/60 text-casino-muted font-display tracking-widest py-3 rounded-lg"
                >
                  ОТМЕНА
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}