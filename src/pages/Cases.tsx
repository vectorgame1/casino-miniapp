import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface CaseReward {
  type: string
  mult?: number
  minutes?: number
  title?: string
  vip_level?: number
  chance: number
}

interface CaseItem {
  id: string
  name: string
  desc: string
  stars: number
  rewards: CaseReward[]
}

export function Cases() {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [cases, setCases] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    setLoading(true)
    const res = await api.getCases()
    if (res && Array.isArray(res)) setCases(res as CaseItem[])
    setLoading(false)
  }

  const handleBuy = async (c: CaseItem) => {
    if (buying) return
    haptic('medium')
    setBuying(c.id)

    const res = await api.buyCase(userId, c.id) as any
    if (res && res.invoice_url) {
      const tg = (window as any).Telegram?.WebApp
      if (tg?.openInvoice) {
        tg.openInvoice(res.invoice_url, (status: string) => {
          if (status === 'paid') {
            hapticSuccess()
            alert('✅ Оплата прошла! Кейс добавлен в склад.')
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
      alert('❌ Не удалось создать счёт. Попробуй позже.')
      setBuying(null)
    }
  }

  const getCaseIcon = (id: string): string => {
    if (id.includes('bronze')) return '🥉'
    if (id.includes('silver')) return '🥈'
    if (id.includes('gold')) return '🥇'
    return '🎁'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-casino-muted">Загрузка кейсов...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-casino-gold mb-4">🎰 КЕЙСЫ</h1>

      {cases.length === 0 ? (
        <Card><div className="text-center py-8 text-casino-muted">Кейсы не настроены</div></Card>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Card key={c.id}>
              <div className="flex gap-3 items-center">
                <div className="text-5xl">{getCaseIcon(c.id)}</div>
                <div className="flex-1">
                  <div className="font-bold text-lg">{c.name}</div>
                  <div className="text-casino-muted text-xs mt-1">{c.desc}</div>
                  <div className="text-casino-muted text-xs mt-1">
                    🎁 {c.rewards.length} возможных наград
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleBuy(c)}
                disabled={!!buying}
                className="w-full mt-3 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
              >
                {buying === c.id ? '⏳ Создаём счёт...' : `⭐ КУПИТЬ ЗА ${c.stars}`}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}