import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/Card'
import { Avatar } from '../components/Avatar'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface TopUser {
  user_id: number
  username: string
  balance: number
  xp: number
}

const TABS = [
  { id: 'balance', label: 'БАЛАНС' },
  { id: 'xp', label: 'XP' },
]

export function Top() {
  const { userId, haptic } = useTelegram()
  const [mode, setMode] = useState('balance')
  const [users, setUsers] = useState<TopUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTop()
  }, [mode])

  const loadTop = async () => {
    setLoading(true)
    const res = await api.getTop(mode)
    if (Array.isArray(res)) setUsers(res as TopUser[])
    setLoading(false)
  }

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  // SVG-медали (не эмодзи)
  const MedalIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) {
      return (
        <svg width="26" height="26" viewBox="0 0 24 24">
          <circle cx="12" cy="15" r="6" fill="#D4AF37" stroke="#8B6914" strokeWidth="1" />
          <circle cx="12" cy="15" r="3.5" fill="none" stroke="#8B6914" strokeWidth="0.5" />
          <path d="M9 3 L11 10 M15 3 L13 10" stroke="#C41E3A" strokeWidth="2" strokeLinecap="round" />
          <text x="12" y="18" fontSize="7" fontWeight="900" textAnchor="middle" fill="#0A0A0F" fontFamily="Bebas Neue">1</text>
        </svg>
      )
    }
    if (rank === 2) {
      return (
        <svg width="26" height="26" viewBox="0 0 24 24">
          <circle cx="12" cy="15" r="6" fill="#C0C0C0" stroke="#707070" strokeWidth="1" />
          <circle cx="12" cy="15" r="3.5" fill="none" stroke="#707070" strokeWidth="0.5" />
          <path d="M9 3 L11 10 M15 3 L13 10" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" />
          <text x="12" y="18" fontSize="7" fontWeight="900" textAnchor="middle" fill="#0A0A0F" fontFamily="Bebas Neue">2</text>
        </svg>
      )
    }
    if (rank === 3) {
      return (
        <svg width="26" height="26" viewBox="0 0 24 24">
          <circle cx="12" cy="15" r="6" fill="#B87333" stroke="#6B4423" strokeWidth="1" />
          <circle cx="12" cy="15" r="3.5" fill="none" stroke="#6B4423" strokeWidth="0.5" />
          <path d="M9 3 L11 10 M15 3 L13 10" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
          <text x="12" y="18" fontSize="7" fontWeight="900" textAnchor="middle" fill="#0A0A0F" fontFamily="Bebas Neue">3</text>
        </svg>
      )
    }
    return (
      <div className="w-[26px] text-center font-display text-casino-muted tracking-wider text-sm">
        {rank}
      </div>
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
      <div className="text-center mb-4">
        <h1 className="font-display text-3xl tracking-widest text-casino-gold">ТОП ИГРОКОВ</h1>
      </div>

      {/* Табы */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { haptic('light'); setMode(tab.id) }}
            className={`flex-1 py-3 rounded-lg font-display text-xs tracking-widest transition-all border ${
              mode === tab.id
                ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg border-transparent shadow-gold'
                : 'bg-casino-card border-casino-border/60 text-casino-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Список */}
      {users.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-casino-muted font-display tracking-widest">
            ПУСТО
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((user, index) => {
            const rank = index + 1
            const isMe = user.user_id === userId
            const isTop3 = rank <= 3

            return (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card
                  className={`${
                    isMe ? 'border-casino-gold/60' : ''
                  } ${isTop3 ? 'bg-gradient-to-r from-casino-gold/5 to-transparent' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex justify-center flex-shrink-0">
                      <MedalIcon rank={rank} />
                    </div>

                    <Avatar
                      username={user.username}
                      size={40}
                      vipLevel={0}
                    />

                    <div className="flex-1 min-w-0">
                      <div className={`font-display tracking-wider truncate ${
                        isTop3 ? 'text-casino-gold' : 'text-casino-text'
                      }`}>
                        {user.username || `user_${user.user_id}`}
                      </div>
                      {isMe && (
                        <div className="text-[9px] tracking-widest uppercase text-casino-gold">
                          ЭТО ТЫ
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className={`font-display tracking-wider text-lg ${
                        isTop3 ? 'text-casino-gold' : 'text-casino-text'
                      }`}>
                        {mode === 'balance' ? fmt(user.balance) : fmt(user.xp)}
                      </div>
                      <div className="text-[9px] tracking-widest uppercase text-casino-muted">
                        {mode === 'balance' ? 'TOKENS' : 'XP'}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <div className="text-center text-casino-muted text-[10px] mt-6 mb-2 tracking-widest uppercase font-display">
        ТОП-{users.length} ИГРОКОВ
      </div>
    </div>
  )
}