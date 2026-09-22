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
  { id: 'title', icon: '🏷️', label: 'Титулы' },
  { id: 'boost', icon: '⚡', label: 'Бусты' },
  { id: 'vip', icon: '👑', label: 'VIP' },
  { id: 'case', icon: '🎰', label: 'Кейсы' },
]

export function Inventory() {
  const { userId, haptic, hapticSuccess } = useTelegram()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [using, setUsing] = useState(false)

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

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-casino-muted">Загрузка склада...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-casino-gold mb-4">🎒 СКЛАД</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { haptic('light'); setActiveTab(tab.id) }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-casino-gold text-black'
                : 'bg-casino-card text-casino-muted border border-casino-border'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-casino-muted">
            <div className="text-5xl mb-3">📦</div>
            Пусто
            <div className="text-xs mt-2">Купи или открой кейс, чтобы получить предметы</div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <motion.div
              key={item.inv_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
            >
              <Card>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getItemIcon(item.type)}</div>
                  <div className="flex-1">
                    <div className="font-bold">{getItemTitle(item)}</div>
                    <div className="text-casino-muted text-xs mt-1">
                      Тип: {item.type}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="bg-casino-bg border border-casino-gold text-casino-gold px-3 py-2 rounded-xl text-sm font-bold"
                  >
                    ДЕЙСТВИЯ
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

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
              className="bg-casino-card border border-casino-border rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{getItemIcon(selectedItem.type)}</div>
                <div className="font-bold text-lg">{getItemTitle(selectedItem)}</div>
              </div>

              <div className="space-y-2">
                {selectedItem.type !== 'case' && (
                  <button
                    onClick={() => handleUse(selectedItem)}
                    disabled={using}
                    className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {using ? '...' : '⚡ ИСПОЛЬЗОВАТЬ'}
                  </button>
                )}
                <button
                  onClick={() => { haptic('medium'); alert('Продажа — скоро') }}
                  className="w-full bg-casino-bg border border-casino-red text-casino-red font-bold py-3 rounded-xl active:scale-95 transition-transform"
                >
                  💰 ПРОДАТЬ
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
    </div>
  )
}