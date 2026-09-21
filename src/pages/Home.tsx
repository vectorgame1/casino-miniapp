import { useEffect, useState } from 'react'
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

      {/* Быстрые разделы */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleCardClick('shop')} className="text-left active:scale-95 transition-transform">
          <Card>
            <div className="text-center py-2">
              <div className="text-3xl mb-1">🛒</div>
              <div className="text-sm font-medium">Магазин</div>
            </div>
          </Card>
        </button>

        <button onClick={() => handleCardClick('cases')} className="text-left active:scale-95 transition-transform">
          <Card>
            <div className="text-center py-2">
              <div className="text-3xl mb-1">🎰</div>
              <div className="text-sm font-medium">Кейсы</div>
            </div>
          </Card>
        </button>

        <button onClick={() => handleCardClick('inventory')} className="text-left active:scale-95 transition-transform">
          <Card>
            <div className="text-center py-2">
              <div className="text-3xl mb-1">🎒</div>
              <div className="text-sm font-medium">Склад</div>
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

        {/* ⚠️ РЫНОК — теперь ведёт на 'market', а не 'shop' */}
        <button onClick={() => handleCardClick('market')} className="text-left active:scale-95 transition-transform col-span-2">
          <Card>
            <div className="text-center py-2">
              <div className="text-3xl mb-1">🏪</div>
              <div className="text-sm font-medium">Рынок</div>
            </div>
          </Card>
        </button>
      </div>

      {/* БОЛЬШАЯ КНОПКА ИГРЫ — ВНИЗУ */}
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
    </div>
  )
}