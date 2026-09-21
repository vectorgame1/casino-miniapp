import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface TopUser {
  user_id: number
  username: string
  balance: number
  xp: number
  games?: number
  wins?: number
}

const TABS = [
  { id: 'balance', icon: '💎', label: 'Баланс' },
  { id: 'xp', icon: '⭐', label: 'XP' },
  { id: 'games', icon: '🎮', label: 'Игры' },
  { id: 'wins', icon: '🏆', label: 'Победы' },
]

export function Top() {
  const { haptic } = useTelegram()
  const [users, setUsers] = useState<TopUser[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('balance')

  useEffect(() => {
    loadTop()
  }, [mode])

  const loadTop = async () => {
    setLoading(true)
    const res = await api.getTop(mode)
    if (res && Array.isArray(res)) setUsers(res as TopUser[])
    setLoading(false)
  }

  const fmtNumber = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const getMedal = (index: number): string => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}.`
  }

  const getMetric = (user: TopUser): string => {
    switch (mode) {
      case 'balance': return `${fmtNumber(user.balance)} 💎`
      case 'xp': return `${fmtNumber(user.xp)} XP`
      case 'games': return `${user.games || 0} 🎮`
      case 'wins': return `${user.wins || 0} 🏆`
      default: return `${fmtNumber(user.balance)} 💎`
    }
  }

  const getBorderClass = (index: number): string => {
    if (index === 0) return 'border-casino-gold'
    if (index === 1) return 'border-gray-300'
    if (index === 2) return 'border-orange-400'
    return 'border-casino-border'
  }

  const getBgClass = (index: number): string => {
    if (index === 0) return 'bg-gradient-to-r from-casino-gold/20 to-transparent'
    if (index === 1) return 'bg-gradient-to-r from-gray-400/10 to-transparent'
    if (index === 2) return 'bg-gradient-to-r from-orange-500/10 to-transparent'
    return ''
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-casino-muted">Загрузка топа...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-casino-gold mb-4">🏆 ТОП ИГРОКОВ</h1>

      {/* Табы */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { haptic('light'); setMode(tab.id) }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              mode === tab.id
                ? 'bg-casino-gold text-black'
                : 'bg-casino-card text-casino-muted border border-casino-border'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Список */}
      {users.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-casino-muted">
            <div className="text-5xl mb-3">🏆</div>
            Пока пусто
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={`bg-casino-card border-l-4 ${getBorderClass(index)} ${getBgClass(index)} rounded-xl p-3 flex items-center gap-3`}
              >
                <div className="text-2xl w-8 text-center">{getMedal(index)}</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-casino-gold to-casino-gold2 flex items-center justify-center text-lg flex-shrink-0">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{user.username || `user_${user.user_id}`}</div>
                </div>
                <div className="text-casino-gold font-bold text-sm whitespace-nowrap">
                  {getMetric(user)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}