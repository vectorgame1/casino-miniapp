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
    loadQuests()
  }, [userId])

  const loadQuests = async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const res = await api.getQuests(userId)
    if (Array.isArray(res)) setQuests(res as Quest[])
    setLoading(false)
  }

  const handleClaim = async (q: Quest) => {
    if (claiming || q.claimed || !q.completed) return
    haptic('medium')
    setClaiming(q.key)
    const res = await api.claimQuest(userId, q.key) as any
    if (res?.success) {
      hapticSuccess()
      await loadQuests()
    } else {
      alert(res?.error || 'Ошибка')
    }
    setClaiming(null)
  }

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  // SVG-иконка для квеста (по ключу)
  const QuestIcon = ({ questKey }: { questKey: string }) => {
    const common = {
      width: 26,
      height: 26,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: '#D4AF37',
      strokeWidth: 1.6,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
    }
    if (questKey.includes('bet')) {
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3 V6 M12 18 V21 M3 12 H6 M18 12 H21" />
        </svg>
      )
    }
    if (questKey.includes('win')) {
      return (
        <svg {...common}>
          <path d="M6 3 H18 V8 A6 6 0 0 1 6 8 Z" />
          <path d="M6 5 H3 A3 3 0 0 0 6 10" />
          <path d="M18 5 H21 A3 3 0 0 1 18 10" />
          <path d="M12 14 V18 M8 21 H16" />
        </svg>
      )
    }
    if (questKey.includes('ref')) {
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="10" r="2.5" />
          <path d="M3 20 Q3 14 9 14 Q13 14 15 17" />
          <path d="M15 20 Q15 16 17 16" />
        </svg>
      )
    }
    if (questKey.includes('vip')) {
      return (
        <svg {...common} fill="#D4AF37">
          <path d="M3 17 L5 7 L10 11 L12 5 L14 11 L19 7 L21 17 Z" />
        </svg>
      )
    }
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7 V12 L15 15" />
      </svg>
    )
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
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl tracking-widest text-casino-gold">ЗАДАНИЯ</h1>
        <p className="text-casino-muted text-[10px] tracking-widest uppercase mt-1">
          ОБНОВЛЕНИЕ РАЗ В 24 ЧАСА
        </p>
      </div>

      {quests.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-casino-muted font-display tracking-widest">
            ПУСТО
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {quests.map((q, index) => {
            const progressPct = Math.min((q.progress / q.target) * 100, 100)
            const isCompleted = q.completed && !q.claimed
            const isClaimed = q.claimed
            const isLocked = !q.completed

            return (
              <motion.div
                key={q.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`${
                    isClaimed
                      ? 'border-casino-greenLight/40 bg-casino-green/5'
                      : isCompleted
                      ? 'border-casino-gold/60 bg-casino-gold/5'
                      : ''
                  }`}
                >
                  {isClaimed && (
                    <div className="absolute top-2 right-2 bg-casino-green/20 text-casino-greenLight text-[9px] font-display tracking-widest px-2 py-0.5 rounded border border-casino-greenLight/40">
                      ЗАБРАНО
                    </div>
                  )}
                  {isCompleted && (
                    <div className="absolute top-2 right-2 bg-casino-gold/20 text-casino-gold text-[9px] font-display tracking-widest px-2 py-0.5 rounded border border-casino-gold/60 animate-pulse">
                      ГОТОВО
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-casino-bg/70 border border-casino-border/60 flex items-center justify-center flex-shrink-0">
                      <QuestIcon questKey={q.key} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`font-display tracking-wider ${isClaimed ? 'text-casino-muted line-through' : 'text-casino-text'}`}>
                        {q.name.replace(/^[\p{Emoji}\s]+/u, '')}
                      </div>

                      {/* Прогресс-бар */}
                      <div className="mt-2">
                        <div className="flex justify-between text-[9px] tracking-widest uppercase text-casino-muted font-display mb-1">
                          <span>ПРОГРЕСС</span>
                          <span className={isClaimed ? 'text-casino-greenLight' : 'text-casino-text'}>
                            {q.progress} / {q.target}
                          </span>
                        </div>
                        <div className="h-1.5 bg-casino-bg rounded-full overflow-hidden border border-casino-border/40">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full ${
                              isClaimed
                                ? 'bg-gradient-to-r from-casino-green to-casino-greenLight'
                                : 'bg-gradient-to-r from-casino-gold to-casino-gold2'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                            <path d="M6 3 H18 L22 9 L12 21 L2 9 Z" />
                            <path d="M2 9 H22" />
                          </svg>
                          <span className="font-display tracking-wider text-casino-gold text-sm">
                            +{fmt(q.reward)}
                          </span>
                        </div>
                        <span className="text-[9px] text-casino-muted tracking-widest uppercase">
                          TOKENS
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Кнопка "Забрать" */}
                  {isCompleted && (
                    <button
                      onClick={() => handleClaim(q)}
                      disabled={claiming === q.key}
                      className="w-full mt-3 bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-2.5 rounded-lg text-sm tracking-widest active:scale-95 disabled:opacity-50"
                    >
                      {claiming === q.key ? '...' : 'ЗАБРАТЬ'}
                    </button>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <div className="text-center text-casino-muted text-[10px] mt-6 mb-2 tracking-widest uppercase font-display">
        Задания обновляются раз в 24 часа
      </div>
    </div>
  )
}