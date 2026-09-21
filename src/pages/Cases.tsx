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
  const { haptic, hapticSuccess } = useTelegram()
  const [cases, setCases] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState(false)
  const [openingCase, setOpeningCase] = useState<CaseItem | null>(null)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    setLoading(true)
    const res = await api.getCases()
    if (res && Array.isArray(res)) setCases(res as CaseItem[])
    setLoading(false)
  }

  const handleBuy = (c: CaseItem) => {
    haptic('medium')
    // Имитация открытия (в Telegram — реальный invoice)
    setOpeningCase(c)
    setOpening(true)
    setResult(null)

    // Анимация 3 сек + результат
    setTimeout(() => {
      const reward = rollReward(c.rewards)
      setResult(reward)
      setOpening(false)
      hapticSuccess()
    }, 3000)
  }

  const rollReward = (rewards: CaseReward[]): string => {
    const total = rewards.reduce((s, r) => s + r.chance, 0)
    const rand = Math.random() * total
    let acc = 0
    for (const r of rewards) {
      acc += r.chance
      if (rand <= acc) {
        if (r.type === 'boost') return `⚡ Буст ×${r.mult} на ${r.minutes} мин`
        if (r.type === 'title') return `🏷️ Титул «${r.title}»`
        if (r.type === 'vip') return `👑 VIP уровень ${r.vip_level}`
        return '🎁 Награда'
      }
    }
    return '🎁 Награда'
  }

  const closeResult = () => {
    setResult(null)
    setOpeningCase(null)
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
                disabled={opening}
                className="w-full mt-3 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
              >
                ⭐ КУПИТЬ ЗА {c.stars}
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
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <div className="text-center">
              <div className="text-6xl mb-6">{getCaseIcon(openingCase.id)}</div>
              <div className="text-casino-gold font-bold text-xl mb-4">Открываем...</div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1, 1.2, 1],
                  rotate: [0, 10, -10, 10, 0],
                }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-7xl"
              >
                🎁
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалка результата */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeResult}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="bg-casino-card border-2 border-casino-gold rounded-3xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-7xl mb-4">🎉</div>
              <div className="text-casino-gold font-bold text-2xl mb-2">ПОБЕДА!</div>
              <div className="text-casino-text font-bold text-lg mb-6">{result}</div>
              <div className="text-casino-muted text-xs mb-4">
                Предмет добавлен в склад
              </div>
              <button
                onClick={closeResult}
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

function getCaseIcon(id: string): string {
  if (id.includes('bronze')) return '🥉'
  if (id.includes('silver')) return '🥈'
  if (id.includes('gold')) return '🥇'
  return '🎁'
}