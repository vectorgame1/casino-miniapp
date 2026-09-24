import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, StatCard } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface UserData {
  user_id: number
  balance: number
  bank: number
  unlimited: boolean
  xp: number
  vip_level: number
  vip_name: string
  vip_icon: string
  cashback: number
  boost?: { mult: number; until: string } | null
}

interface HomeProps {
  onNavigate?: (tab: string) => void
}

export function Home({ onNavigate }: HomeProps) {
  const { userId, username, haptic, hapticSuccess } = useTelegram()
  const [user, setUser] = useState<UserData | null>(null)
  const [dailyStatus, setDailyStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    loadData()
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    const [userRes, dailyRes] = await Promise.all([
      api.getBalance(userId),
      api.getDailyStatus(userId),
    ])
    if (userRes) setUser(userRes as UserData)
    if (dailyRes) setDailyStatus(dailyRes)
    setLoading(false)
  }

  const handleClaimBonus = async () => {
    if (claiming || !dailyStatus?.can_claim) return
    haptic('medium')
    setClaiming(true)
    const res = await api.claimDaily(userId)
    if (res && (res as any).success) {
      hapticSuccess()
      await loadData()
    }
    setClaiming(false)
  }

  const handleCardClick = (tab: string) => {
    haptic('light')
    if (tab === 'more') {
      setShowMore(true)
      return
    }
    onNavigate?.(tab)
  }

  const fmtNumber = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60)
    return `${h}ч ${m}мин`
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-casino-muted">Загрузка...</div>

  return (
    <div className="p-4 space-y-4">
      {/* Профиль */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-casino-gold to-casino-gold2 flex items-center justify-center text-2xl">🎭</div>
          <div className="flex-1">
            <div className="font-bold text-lg">{username}</div>
            <div className="text-casino-muted text-sm">
              {user?.vip_icon || '🥉'} {user?.vip_name || 'Бронза'} · ⭐ {user?.xp || 0} XP
            </div>
          </div>
        </div>
      </Card>

      {/* Баланс и Банк */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="💎" label="Баланс" value={user?.unlimited ? '∞' : fmtNumber(user?.balance || 0)} />
        <StatCard icon="🏦" label="Банк" value={fmtNumber(user?.bank || 0)} color="text-casino-text" />
      </div>

      {/* Бонус */}
      {dailyStatus?.can_claim ? (
        <Card className="border-casino-gold bg-gradient-to-r from-casino-gold/10 to-casino-gold2/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-casino-gold">🎁 Бонус доступен!</div>
              <div className="text-casino-muted text-sm mt-1">+10 000 💎</div>
            </div>
            <button onClick={handleClaimBonus} disabled={claiming}
              className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold px-4 py-2 rounded-xl disabled:opacity-50">
              {claiming ? '...' : 'ЗАБРАТЬ'}
            </button>
          </div>
        </Card>
      ) : dailyStatus ? (
        <Card><div className="text-casino-muted">⏳ Бонус через <b className="text-casino-text">{formatTime(dailyStatus.time_left)}</b></div></Card>
      ) : null}

      {/* Буст */}
      {user?.boost ? (
        <Card className="border-casino-green/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div className="font-bold text-casino-green">Буст ×{user.boost.mult} активен</div>
          </div>
        </Card>
      ) : null}

      {/* БОЛЬШАЯ КНОПКА ИГРЫ */}
      <button
        onClick={() => handleCardClick('games')}
        className="w-full active:scale-95 transition-transform"
      >
        <div className="bg-gradient-to-r from-casino-gold to-casino-gold2 rounded-2xl p-5 shadow-gold">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎮</span>
              <div className="text-left">
                <div className="text-black font-bold text-xl">ИГРЫ</div>
                <div className="text-black/70 text-xs">Рулетка · Слоты · Монетка · Мины</div>
              </div>
            </div>
            <div className="text-black text-3xl font-bold">›</div>
          </div>
        </div>
      </button>

      {/* Быстрые разделы: 4 кнопки */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleCardClick('shop')} className="text-left active:scale-95 transition-transform">
          <Card>
            <div className="text-center py-2">
              <div className="text-3xl mb-1">🛒</div>
              <div className="text-sm font-medium">Магазин</div>
            </div>
          </Card>
        </button>

        <button onClick={() => handleCardClick('vip')} className="text-left active:scale-95 transition-transform">
          <Card>
            <div className="text-center py-2">
              <div className="text-3xl mb-1">👑</div>
              <div className="text-sm font-medium">VIP</div>
            </div>
          </Card>
        </button>

        <button onClick={() => handleCardClick('quests')} className="text-left active:scale-95 transition-transform">
          <Card>
            <div className="text-center py-2">
              <div className="text-3xl mb-1">🎯</div>
              <div className="text-sm font-medium">Задания</div>
            </div>
          </Card>
        </button>

        <button onClick={() => handleCardClick('top')} className="text-left active:scale-95 transition-transform">
          <Card>
            <div className="text-center py-2">
              <div className="text-3xl mb-1">🏆</div>
              <div className="text-sm font-medium">Топ</div>
            </div>
          </Card>
        </button>
      </div>

      {/* Кнопка ЕЩЁ */}
      <button onClick={() => handleCardClick('more')} className="w-full active:scale-95 transition-transform">
        <Card>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <div className="text-left">
                <div className="text-sm font-bold">ЕЩЁ</div>
                <div className="text-casino-muted text-xs">Кейсы · Склад · Буст XP · Турнир · Рынок</div>
              </div>
            </div>
            <div className="text-casino-gold text-2xl">›</div>
          </div>
        </Card>
      </button>

      {/* Модалка ЕЩЁ */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-casino-card border border-casino-border rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-casino-gold text-center mb-4">⚙️ ЕЩЁ</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setShowMore(false); onNavigate?.('cases') }} className="active:scale-95 transition-transform">
                  <Card>
                    <div className="text-center py-3">
                      <div className="text-3xl mb-1">🎰</div>
                      <div className="text-sm">Кейсы</div>
                    </div>
                  </Card>
                </button>
                <button onClick={() => { setShowMore(false); onNavigate?.('inventory') }} className="active:scale-95 transition-transform">
                  <Card>
                    <div className="text-center py-3">
                      <div className="text-3xl mb-1">🎒</div>
                      <div className="text-sm">Склад</div>
                    </div>
                  </Card>
                </button>
                <button onClick={() => { setShowMore(false); onNavigate?.('xp') }} className="active:scale-95 transition-transform">
                  <Card>
                    <div className="text-center py-3">
                      <div className="text-3xl mb-1">⭐</div>
                      <div className="text-sm">Буст XP</div>
                    </div>
                  </Card>
                </button>
                <button onClick={() => { setShowMore(false); onNavigate?.('tournament') }} className="active:scale-95 transition-transform">
                  <Card>
                    <div className="text-center py-3">
                      <div className="text-3xl mb-1">🏆</div>
                      <div className="text-sm">Турнир</div>
                    </div>
                  </Card>
                </button>
                <button onClick={() => { setShowMore(false); onNavigate?.('market') }} className="active:scale-95 transition-transform col-span-2">
                  <Card>
                    <div className="text-center py-3">
                      <div className="text-3xl mb-1">🏪</div>
                      <div className="text-sm">Рынок</div>
                    </div>
                  </Card>
                </button>
              </div>
              <button
                onClick={() => setShowMore(false)}
                className="w-full bg-casino-bg border border-casino-border text-casino-muted font-bold py-3 rounded-xl mt-4"
              >
                ЗАКРЫТЬ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}