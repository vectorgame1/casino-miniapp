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
}

export function Shop() {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)

  useEffect(() => {
    loadShop()
  }, [])

  const loadShop = async () => {
    setLoading(true)
    const res = await api.getShop()
    if (res && Array.isArray(res)) setItems(res as ShopItem[])
    setLoading(false)
  }

  const handleBuyStars = async (item: ShopItem) => {
    if (buying) return
    haptic('medium')
    setBuying(item.id)

    const res = await api.buyShopItem(userId, item.id) as any
    if (res && res.invoice_url) {
      const tg = (window as any).Telegram?.WebApp
      if (tg?.openInvoice) {
        tg.openInvoice(res.invoice_url, (status: string) => {
          if (status === 'paid') {
            hapticSuccess()
            alert('✅ Оплата прошла! Товар в складе.')
          } else if (status === 'failed') {
            hapticError()
            alert('❌ Оплата не прошла')
          } else if (status === 'cancelled') {
            alert('❌ Оплата отменена')
          }
          setBuying(null)
        })
      } else {
        alert('Оплата только в Telegram')
        setBuying(null)
      }
    } else {
      hapticError()
      alert('❌ Не удалось создать счёт')
      setBuying(null)
    }
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
          <div className="text-center py-8 text-casino-muted">Магазин пуст</div>
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
                      onClick={() => handleBuyStars(item)}
                      disabled={!!buying}
                      className="flex-1 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-2 px-3 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {buying === item.id ? '⏳' : `⭐ ${item.stars}`}
                    </button>
                  )}
                  {item.tokens && (
                    <button
                      onClick={() => { haptic('medium'); alert('💎 Покупка за токены — скоро!') }}
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