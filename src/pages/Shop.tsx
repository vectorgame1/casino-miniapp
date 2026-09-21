import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface ShopItem {
  id: string
  type: string
  name: string
  desc: string
  stars?: number | null
  tokens?: number | null
  mult?: number
  minutes?: number
  title?: string
  vip_level?: number
}

export function Shop() {
  const { haptic, hapticSuccess } = useTelegram()
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShop()
  }, [])

  const loadShop = async () => {
    setLoading(true)
    const res = await api.getShop()
    if (res && Array.isArray(res)) setItems(res as ShopItem[])
    setLoading(false)
  }

  const handleBuy = (item: ShopItem, method: 'stars' | 'tokens') => {
    haptic('medium')
    if (method === 'stars') {
      alert(`Купить "${item.name}" за ${item.stars} ⭐ (в Telegram откроется оплата)`)
    } else {
      alert(`Купить "${item.name}" за ${item.tokens?.toLocaleString('ru-RU')} 💎`)
    }
    hapticSuccess()
  }

  const fmtNumber = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const getIcon = (type: string) => {
    switch (type) {
      case 'boost': return '⚡'
      case 'title': return '🏷️'
      case 'vip': return '👑'
      case 'case': return '🎰'
      default: return '🎁'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-casino-muted">Загрузка магазина...</div>
  }

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-2xl font-bold text-casino-gold mb-4">🛒 МАГАЗИН</h1>

      {items.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-casino-muted">
            🛒 Магазин пуст
            <div className="text-xs mt-2">Проверь соединение с ботом</div>
          </div>
        </Card>
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <div className="flex gap-3">
              <div className="text-4xl">{getIcon(item.type)}</div>
              <div className="flex-1">
                <div className="font-bold text-lg">{item.name}</div>
                <div className="text-casino-muted text-sm mt-1">{item.desc}</div>

                <div className="flex gap-2 mt-3">
                  {item.stars && (
                    <button
                      onClick={() => handleBuy(item, 'stars')}
                      className="flex-1 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-2 px-3 rounded-xl text-sm active:scale-95 transition-transform"
                    >
                      ⭐ {item.stars}
                    </button>
                  )}
                  {item.tokens && (
                    <button
                      onClick={() => handleBuy(item, 'tokens')}
                      className="flex-1 bg-casino-bg border border-casino-gold text-casino-gold font-bold py-2 px-3 rounded-xl text-sm active:scale-95 transition-transform"
                    >
                      💎 {fmtNumber(item.tokens)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}