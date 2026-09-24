import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface Quest {
  key: string
  name: string
  reward: number
  target: number
  progress: number
  completed: boolean
  claimed: boolean
}

export function Quests() {
  const { userId, haptic, hapticSuccess } = useTelegram()
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    loadQuests()
  }, [userId])

  const loadQuests = async () => {
    setLoading(true)
    const res = await api.getQuests(userId)
    if (Array.isArray(res)) setQuests(res as Quest[])
    setLoading(false)
  }

  const handleClaim = async (q: Quest) => {
    if (!q.completed || q.claimed || claiming) return
    haptic('medium')
    setClaiming(q.key)
    const res = await api.claimQuest(userId, q.key) as any
    if (res?.success) {
      hapticSuccess()
      await loadQuests()
    }
    setClaiming(null)
  }

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-casino-muted">Загрузка заданий...</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-casino-gold mb-2">🎯 ЗАДАНИЯ</h1>
      <p className="text-casino-muted text-sm mb-2">⏱ Обновление раз в 24 часа</p>

      {quests.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-casino-muted">
            <div className="text-5xl mb-3">🎯</div>
            Заданий пока нет
          </div>
        </Card>
      ) : (
        quests.map((q) => {
          const fill = Math.min(10, Math.floor(q.progress / q.target * 10))
          const bar = '▰'.repeat(fill) + '▱'.repeat(10 - fill)

          return (
            <motion.div
              key={q.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={q.claimed ? 'opacity-50' : ''}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-bold">{q.name}</div>
                    <div className="text-casino-gold text-sm mt-1">{bar} {q.progress}/{q.target}</div>
                    <div className="text-casino-muted text-xs mt-1">💰 +{fmt(q.reward)} Tokens</div>
                  </div>
                  {q.claimed ? (
                    <div className="text-casino-green font-bold text-2xl">✔️</div>
                  ) : q.completed ? (
                    <button
                      onClick={() => handleClaim(q)}
                      disabled={claiming === q.key}
                      className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold px-3 py-2 rounded-xl text-sm active:scale-95 disabled:opacity-50"
                    >
                      {claiming === q.key ? '...' : '🎁 ЗАБРАТЬ'}
                    </button>
                  ) : (
                    <div className="text-casino-muted text-2xl">⏳</div>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })
      )}
    </div>
  )
}