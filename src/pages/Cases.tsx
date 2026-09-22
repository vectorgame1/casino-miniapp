import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [opening, setOpening] = useState(false)
  const [openingCase, setOpeningCase] = useState<CaseItem | null>(null)
  const [showWin, setShowWin] = useState(false)

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
        tg.openInvoice(res.invoice_url, async (status: string) => {
          setBuying(null)
          if (status === 'paid') {
            hapticSuccess()
            // Показываем анимацию
            setOpeningCase(c)
            setOpening(true)
            // Ждём 3 сек
            await new Promise((r) => setTimeout(r, 3000))
            setOpening(false)
            setShowWin(true)
          } else if (status === 'failed') {
            hapticError()
            alert('❌ Оплата не прошла')
          } else if (status === 'cancelled') {
            alert('❌ Оплата отменена')
          }
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

  const closeWin = () => {
    setShowWin(false)
    setOpeningCase(null)
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

      {/* Модалка открытия */}
      <AnimatePresence>
        {opening && openingCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <div className="text-center">
              <div className="text-6xl mb-6">{getCaseIcon(openingCase.id)}</div>
              <div className="text-casino-gold font-bold text-xl mb-4">Открываем...</div>
              <motion.div
                animate={{
                  scale: [1, 1.3, 1, 1.3, 1],
                  rotate: [0, 15, -15, 15, 0],
                }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-8xl"
              >
                🎁
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалка победы */}
      <AnimatePresence>
        {showWin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeWin}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="bg-casino-card border-2 border-casino-gold rounded-3xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              <div className="text-casino-gold font-bold text-3xl mb-2">
                ПОБЕДА!
              </div>
              <div className="text-casino-text text-lg mb-2">
                🎁 Награда получена
              </div>
              <div className="text-casino-muted text-sm mb-6">
                Загляни в склад — там твой предмет
              </div>
              <button
                onClick={closeWin}
                className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-3 rounded-xl active:scale-95 transition-transform"
              >
                ОТЛИЧНО
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}