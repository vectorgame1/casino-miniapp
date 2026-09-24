import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

// 🎨 Иконки для заданий по ключу
const QUEST_ICONS: Record<string, string> = {
  daily_bets_5: '🎰',
  daily_win_1: '🎲',
  daily_ref_1: '👥',
  daily_buy_vip: '⭐',
}

// 🎨 Цвета для заданий
const QUEST_COLORS: Record<string, string> = {
  daily_bets_5: 'from-yellow-500/15 to-orange-500/15 border-yellow-500/40',
  daily_win_1: 'from-green-500/15 to-emerald-500/15 border-green-500/40',
  daily_ref_1: 'from-blue-500/15 to-cyan-500/15 border-blue-500/40',
  daily_buy_vip: 'from-purple-500/15 to-pink-500/15 border-purple-500/40',
}

export function Quests() {
  const { userId, haptic, hapticSuccess } = useTelegram()
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [confetti, setConfetti] = useState(false)

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
      // 🎊 Конфетти
      setConfetti(true)
      setTimeout(() => setConfetti(false), 2500)
      await loadQuests()
    }
    setClaiming(null)
  }

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  // 💰 Сумма доступных наград
  const totalAvailable = quests
    .filter(q => q.completed && !q.claimed)
    .reduce((sum, q) => sum + q.reward, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-casino-muted">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">🎯</div>
          Загрузка заданий...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 relative">
      {/* 🎊 КОНФЕТТИ ПРИ ПОЛУЧЕНИИ */}
      <AnimatePresence>
        {confetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                  y: -50,
                  rotate: 0,
                }}
                animate={{
                  y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800,
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                  ease: 'easeIn',
                }}
                className="absolute text-2xl"
              >
                {['🎉', '💎', '⭐', '🎊', '💰'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎯 ЗАГОЛОВОК */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-casino-gold">🎯 ЗАДАНИЯ</h1>
        <p className="text-casino-muted text-xs mt-1">Обновление раз в 24 часа</p>
      </div>

      {/* 💰 СУММА ДОСТУПНЫХ НАГРАД */}
      {totalAvailable > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-casino-green/50 bg-gradient-to-r from-casino-green/10 to-emerald-500/10">
            <div className="text-center">
              <div className="text-casino-green font-bold text-lg">
                💎 Доступно: {fmt(totalAvailable)} Tokens
              </div>
              <div className="text-casino-muted text-xs mt-1">
                Забери награды за выполненные задания!
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* 📋 СПИСОК ЗАДАНИЙ */}
      {quests.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-casino-muted">
            <div className="text-5xl mb-3">🎯</div>
            Заданий пока нет
          </div>
        </Card>
      ) : (
        quests.map((q, index) => {
          const fill = Math.min(10, Math.floor(q.progress / q.target * 10))
          const icon = QUEST_ICONS[q.key] || '🎯'
          const colorClass = QUEST_COLORS[q.key] || 'from-casino-gold/15 to-casino-gold2/15 border-casino-gold/40'
          const isReadyToClaim = q.completed && !q.claimed

          return (
            <motion.div
              key={q.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className={`rounded-2xl border-2 bg-gradient-to-br ${colorClass} p-4 relative overflow-hidden ${q.claimed ? 'opacity-50' : ''}`}>
                {/* ✨ СВЕЧЕНИЕ ДЛЯ ГОТОВЫХ */}
                {isReadyToClaim && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-casino-green/10 pointer-events-none"
                  />
                )}

                {/* БЕЙДЖ "ГОТОВО" */}
                {isReadyToClaim && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="absolute top-2 right-2 bg-casino-green text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_15px_rgba(0,255,127,0.6)] z-10"
                  >
                    ✓ ГОТОВО
                  </motion.div>
                )}
                {q.claimed && (
                  <div className="absolute top-2 right-2 bg-casino-bg/80 text-casino-muted text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                    ✔️ ЗАБРАНО
                  </div>
                )}

                <div className="flex items-start gap-3 relative z-[1]">
                  {/* 🎨 ИКОНКА */}
                  <div className="w-12 h-12 rounded-xl bg-casino-bg/70 border border-casino-border flex items-center justify-center text-2xl flex-shrink-0">
                    {icon}
                  </div>

                  {/* 📝 ОПИСАНИЕ */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm pr-20">{q.name}</div>

                    {/* 📊 ПРОГРЕСС-БАР */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-casino-muted mb-1">
                        <span>Прогресс</span>
                        <span className="font-bold">{q.progress} / {q.target}</span>
                      </div>
                      <div className="h-2 bg-casino-bg rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${fill * 10}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-full rounded-full ${
                            q.completed
                              ? 'bg-gradient-to-r from-casino-green to-emerald-400'
                              : 'bg-gradient-to-r from-casino-gold to-casino-gold2'
                          }`}
                        />
                      </div>
                    </div>

                    {/* 💰 НАГРАДА */}
                    <div className="text-casino-gold font-bold text-sm mt-2">
                      💰 +{fmt(q.reward)} Tokens
                    </div>
                  </div>
                </div>

                {/* 🎁 КНОПКА ЗАБРАТЬ */}
                {isReadyToClaim && (
                  <motion.button
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleClaim(q)}
                    disabled={claiming === q.key}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-3 bg-gradient-to-r from-casino-green to-emerald-400 text-black font-black py-2.5 rounded-xl text-sm shadow-[0_0_20px_rgba(0,255,127,0.4)] disabled:opacity-50 relative z-[1]"
                  >
                    {claiming === q.key ? '⏳ Обработка...' : '🎁 ЗАБРАТЬ НАГРАДУ'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )
        })
      )}

      {/* 💡 ИНФО ВНИЗУ */}
      <div className="text-center text-casino-muted text-xs mt-6 mb-2">
        💡 Задания обновляются каждые 24 часа
      </div>
    </div>
  )
}