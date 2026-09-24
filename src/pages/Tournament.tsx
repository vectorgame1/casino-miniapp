import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/Card'
import { api } from '../api/client'

interface TournamentData {
  active: boolean
  name?: string
  ends_at?: string
  prize_1?: number
  prize_2?: number
  prize_3?: number
  top?: Array<{ user_id: number; username: string; total_won: number }>
}

export function Tournament() {
  const [data, setData] = useState<TournamentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const res = await api.getTournament() as TournamentData
    if (res) setData(res)
    setLoading(false)
  }

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-casino-muted">Загрузка...</div>
  }

  if (!data?.active) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-casino-gold mb-4">🏆 ТУРНИР</h1>
        <Card>
          <div className="text-center py-8 text-casino-muted">
            <div className="text-5xl mb-3">😴</div>
            Сейчас нет активного турнира
            <div className="text-xs mt-2">Следи за анонсами в канале</div>
          </div>
        </Card>
      </div>
    )
  }

  const endsDate = data.ends_at ? new Date(data.ends_at) : null
  const endsStr = endsDate ? endsDate.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-casino-gold mb-2">🏆 {data.name}</h1>
      <p className="text-casino-muted text-sm">⏱ До: {endsStr}</p>

      <Card className="border-casino-gold/40">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>🥇 1 место</span>
            <span className="font-bold text-casino-gold">{fmt(data.prize_1 || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>🥈 2 место</span>
            <span className="font-bold text-casino-gold">{fmt(data.prize_2 || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>🥉 3 место</span>
            <span className="font-bold text-casino-gold">{fmt(data.prize_3 || 0)}</span>
          </div>
        </div>
      </Card>

      <h2 className="text-lg font-bold mt-4">📊 ТОП-10</h2>

      {(!data.top || data.top.length === 0) ? (
        <Card>
          <div className="text-center py-6 text-casino-muted">Пока никто не играл</div>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.top.map((p, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
            return (
              <motion.div
                key={p.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="text-xl w-8">{medal}</div>
                    <div className="flex-1 font-bold">{p.username}</div>
                    <div className="text-casino-gold font-bold">{fmt(p.total_won)}</div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}