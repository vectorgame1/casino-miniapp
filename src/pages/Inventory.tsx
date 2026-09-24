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
  { id: 'all', icon: '📦', label: 'Всё' },
  { id: 'boost', icon: '⚡', label: 'Бусты' },
  { id: 'title', icon: '🏷️', label: 'Титулы' },
  { id: 'vip', icon: '👑', label: 'VIP' },
  { id: 'case', icon: '🎰', label: 'Кейсы' },
]

// 🎨 ЦВЕТА И РЕДКОСТЬ ПО ТИПУ
const RARITY: Record<string, { name: string; gradient: string; border: string; text: string; glow: string }> = {
  boost: {
    name: 'ЭПИК',
    gradient: 'from-yellow-500/15 to-orange-500/15',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    glow: 'rgba(255,215,0,0.3)',
  },
  title: {
    name: 'РЕДКИЙ',
    gradient: 'from-purple-500/15 to-pink-500/15',
    border: 'border-purple-500/50',
    text: 'text-purple-300',
    glow: 'rgba(180,100,255,0.3)',
  },
  vip: {
    name: 'ЛЕГЕНДА',
    gradient: 'from-cyan-500/15 to-blue-500/15',
    border: 'border-cyan-500/50',
    text: 'text-cyan-300',
    glow: 'rgba(0,200,255,0.3)',
  },
  case: {
    name: 'РЕДКИЙ',
    gradient: 'from-pink-500/15 to-red-500/15',
    border: 'border-pink-500/50',
    text: 'text-pink-300',
    glow: 'rgba(255,100,150,0.3)',
  },
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

  const filteredItems = activeTab === 'all'
    ? items
    : items.filter((i) => i.type === activeTab)

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

  const getItemIcon = (type: string): string => {
    switch (type) {
      case 'boost': return '⚡'
      case 'title': return '🏷️'
      case 'vip': return '👑'
      case 'case': return '🎰'
      default: return '🎁'
    }
  }

  const getItemTitle = (item: InventoryItem): string => {
    switch (item.type) {
      case 'boost': return `Буст ×${item.mult} на ${item.minutes} мин`
      case 'title': return `Титул «${item.title}»`
      case 'vip': return `VIP уровень ${item.vip_level}`
      case 'case': return `Кейс ${item.case_id || ''}`
      default: return 'Предмет'
    }
  }

  const timeAgo = (isoDate?: string): string => {
    if (!isoDate) return ''
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-casino-muted">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">🎒</div>
          Загрузка склада...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* ЗАГОЛОВОК */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-casino-gold">🎒 СКЛАД</h1>
        <p className="text-casino-muted text-xs mt-1">
          📦 Всего предметов: <b className="text-casino-text">{items.length}</b>
        </p>
      </div>

      {/* ТАБЫ */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = tab.id === 'all' ? items.length : items.filter(i => i.type === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => { haptic('light'); setActiveTab(tab.id) }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-black shadow-gold'
                  : 'bg-casino-card text-casino-muted border border-casino-border'
              }`}
            >
              {tab.icon} {tab.label}
              {count > 0 && (
                <span className={`ml-1 text-[10px] ${activeTab === tab.id ? 'text-black/70' : 'text-casino-muted'}`}>
                  ({count})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* СПИСОК ПРЕДМЕТОВ */}
      {filteredItems.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-casino-muted">
            <div className="text-6xl mb-3">📦</div>
            <div className="font-bold mb-1">
              {activeTab === 'all' ? 'Склад пуст' : 'Нет предметов'}
            </div>
            <div className="text-xs">Купи или открой кейс, чтобы получить предметы</div>
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
                whileTap={{ scale: 0.97 }}
              >
                <div className={`relative rounded-2xl border-2 ${rarity.border} bg-gradient-to-br ${rarity.gradient} p-4 overflow-hidden`}>
                  {/* Свечение */}
                  <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top right, ${rarity.glow}, transparent 60%)` }}
                  />

                  {/* БЕЙДЖ РЕДКОСТИ */}
                  <div className={`absolute top-2 right-2 ${rarity.text} bg-casino-bg/80 text-[9px] font-black px-2 py-0.5 rounded-full border ${rarity.border}`}>
                    {rarity.name}
                  </div>

                  <div className="flex items-center gap-3 relative z-[1]">
                    {/* ИКОНКА */}
                    <div className="w-14 h-14 rounded-xl bg-casino-bg/70 border border-casino-border flex items-center justify-center text-3xl flex-shrink-0">
                      {getItemIcon(item.type)}
                    </div>

                    {/* ОПИСАНИЕ */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm pr-16">
                        {getItemTitle(item)}
                      </div>
                      <div className="text-casino-muted text-[10px] mt-1">
                        🕐 {timeAgo(item.obtained_at) || 'Получено'}
                      </div>
                    </div>

                    {/* КНОПКА */}
                    <button
                      onClick={() => { haptic('light'); setSelectedItem(item) }}
                      className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-black px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform flex-shrink-0 shadow-gold"
                    >
                      ДЕЙСТВИЯ
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* МОДАЛКА ДЕЙСТВИЙ */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className={`bg-casino-card border-2 ${RARITY[selectedItem.type]?.border || 'border-casino-border'} rounded-3xl p-6 max-w-sm w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <motion.div
                  className="text-6xl mb-3"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {getItemIcon(selectedItem.type)}
                </motion.div>
                <div className="font-bold text-lg">{getItemTitle(selectedItem)}</div>
                <div className={`inline-block mt-2 ${RARITY[selectedItem.type]?.text} text-[10px] font-black px-2 py-0.5 rounded-full border ${RARITY[selectedItem.type]?.border}`}>
                  {RARITY[selectedItem.type]?.name}
                </div>
              </div>

              <div className="space-y-2">
                {selectedItem.type !== 'case' && (
                  <button
                    onClick={() => handleUse(selectedItem)}
                    disabled={using}
                    className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {using ? '⏳ Активация...' : '⚡ ИСПОЛЬЗОВАТЬ'}
                  </button>
                )}
                <button
                  onClick={() => {
                    haptic('medium')
                    setSellItem(selectedItem)
                    setSellPrice('50000')
                    setSelectedItem(null)
                  }}
                  className="w-full bg-casino-bg border-2 border-casino-red text-casino-red font-bold py-3 rounded-xl active:scale-95 transition-transform"
                >
                  💰 ПРОДАТЬ НА РЫНКЕ
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full bg-casino-bg border border-casino-border text-casino-muted font-bold py-3 rounded-xl"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSellItem(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-casino-card border-2 border-casino-red/50 rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">{getItemIcon(sellItem.type)}</div>
                <div className="font-bold">{getItemTitle(sellItem)}</div>
              </div>

              <div className="mb-4">
                <label className="text-casino-muted text-sm">Цена (Tokens):</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  className="w-full bg-casino-bg border border-casino-border rounded-xl px-4 py-3 mt-2 text-casino-text text-lg text-center font-bold"
                />
                <div className="text-casino-muted text-xs mt-1 text-center">
                  Минимум 10 000 • Комиссия 5% → в джекпот
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
                      alert(`✅ Лот выставлен за ${price.toLocaleString('ru-RU')} Tokens`)
                    } else {
                      alert(res?.error || 'Ошибка')
                    }
                    setSelling(false)
                  }}
                  disabled={selling}
                  className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-3 rounded-xl disabled:opacity-50 active:scale-95"
                >
                  {selling ? '⏳ Выставление...' : '✅ ВЫСТАВИТЬ'}
                </button>
                <button
                  onClick={() => setSellItem(null)}
                  className="w-full bg-casino-bg border border-casino-border text-casino-muted font-bold py-3 rounded-xl"
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