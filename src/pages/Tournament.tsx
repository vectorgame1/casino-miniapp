import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface Player {
  user_id: number
  username: string
  total_won: number
}

interface TournamentData {
  active: boolean
  name?: string
  ends_at?: string
  prize_1?: number
  prize_2?: number
  prize_3?: number
  top?: Player[]
}

export function Tournament() {
  const { userId, haptic } = useTelegram()
  const [data, setData] = useState<TournamentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTournament()
  }, [])

  const loadTournament = async () => {
    setLoading(true)
    const res = await api.getTournament()
    if (res) setData(res as TournamentData)
    setLoading(false)
  }

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const getTimeLeft = (iso?: string): string => {
    if (!iso) return ''
    try {
      const diff = Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000))
      const d = Math.floor(diff / 86400)
      const h = Math.floor((diff % 86400) / 3600)
      const m = Math.floor((diff % 3600) / 60)
      if (d > 0) return `${d} д ${h} ч`
      return `${h} ч ${m} мин`
    } catch { return '' }
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

  if (!data?.active) {
    return (
      <div className="p-4 pb-24">
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl tracking-widest text-casino-gold">ТУРНИР</h1>
        </div>
        <Card>
          <div className="text-center py-12 text-casino-muted">
            <div className="flex justify-center mb-4">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#6B6B7B" strokeWidth="1.2">
                <path d="M6 3 H18 V8 A6 6 0 0 1 6 8 Z" />
                <path d="M6 5 H3 A3 3 0 0 0 6 10" />
                <path d="M18 5 H21 A3 3 0 0 1 18 10" />
                <path d="M12 14 V18 M8 21 H16" />
              </svg>
            </div>
            <div className="font-display tracking-widest mb-1">НЕТ АКТИВНОГО ТУРНИРА</div>
            <div className="text-[10px] tracking-wider">Следи за анонсами</div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl tracking-widest text-casino-gold">ТУРНИР</h1>
        <p className="text-casino-muted text-[10px] tracking-widest uppercase mt-1">
          {data.name}
        </p>
      </div>

      {/* ТАЙМЕР */}
      <Card className="mb-4">
        <div className="text-center">
          <div className="text-[10px] tracking-widest uppercase text-casino-muted">До конца</div>
          <div className="font-display text-2xl tracking-widest text-casino-gold mt-1">
            {getTimeLeft(data.ends_at)}
          </div>
        </div>
      </Card>

      {/* ПРИЗЫ */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Card className="text-center py-3">
          <div className="flex justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#D4AF37">
              <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17.5 L6 21 L7 14 L2 9 L9 8 Z" />
            </svg>
          </div>
          <div className="font-display text-[10px] tracking-widest text-casino-muted">1 МЕСТО</div>
          <div className="font-display tracking-wider text-casino-gold text-lg">{fmt(data.prize_1 || 0)}</div>
        </Card>
        <Card className="text-center py-3">
          <div className="flex justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#C0C0C0">
              <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17.5 L6 21 L7 14 L2 9 L9 8 Z" />
            </svg>
          </div>
          <div className="font-display text-[10px] tracking-widest text-casino-muted">2 МЕСТО</div>
          <div className="font-display tracking-wider text-casino-text text-lg">{fmt(data.prize_2 || 0)}</div>
        </Card>
        <Card className="text-center py-3">
          <div className="flex justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#B87333">
              <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17.5 L6 21 L7 14 L2 9 L9 8 Z" />
            </svg>
          </div>
          <div className="font-display text-[10px] tracking-widest text-casino-muted">3 МЕСТО</div>
          <div className="font-display tracking-wider text-casino-text text-lg">{fmt(data.prize_3 || 0)}</div>
        </Card>
      </div>

      {/* ТОП ИГРОКОВ */}
      <div className="space-y-2">
        {(data.top || []).map((p, i) => {
          const rank = i + 1
          const isMe = p.user_id === userId
          return (
            <motion.div
              key={p.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className={isMe ? 'border-casino-gold/60' : ''}>
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center flex-shrink-0">
                    {rank === 1 ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17.5 L6 21 L7 14 L2 9 L9 8 Z" /></svg>
                    ) : rank === 2 ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#C0C0C0"><path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17.5 L6 21 L7 14 L2 9 L9 8 Z" /></svg>
                    ) : rank === 3 ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#B87333"><path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17.5 L6 21 L7 14 L2 9 L9 8 Z" /></svg>
                    ) : (
                      <span className="font-display text-casino-muted tracking-wider text-sm">{rank}</span>
                    )}
                  </div>
                  <div className={`font-display tracking-wider flex-1 truncate ${rank <= 3 ? 'text-casino-gold' : 'text-casino-text'}`}>
                    {isMe ? 'ТЫ' : (p.username || `user_${p.user_id}`)}
                  </div>
                  <div className="text-right">
                    <div className={`font-display tracking-wider text-lg ${rank <= 3 ? 'text-casino-gold' : 'text-casino-text'}`}>
                      {fmt(p.total_won)}
                    </div>
                    <div className="text-[9px] tracking-widest uppercase text-casino-muted">TOKENS</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}