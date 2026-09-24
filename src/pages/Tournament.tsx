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
    return (
      <div className="flex items-center justify-center h-64 text-casino-muted">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">🏆</div>
          Загрузка турнира...
        </div>
      </div>
    )
  }

  // 🚨 ТУРНИР НЕ АКТИВЕН
  if (!data?.active) {
    return (
      <div className="p-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-casino-gold">🏆 ТУРНИР</h1>
        </div>
        <Card>
          <div className="text-center py-12 text-casino-muted">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              😴
            </motion.div>
            <div className="font-bold text-lg mb-2">Сейчас нет активного турнира</div>
            <div className="text-xs mb-4">Следи за анонсами в канале</div>
            <a
              href="https://t.me/TokenCasinoTournaments"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold px-6 py-3 rounded-xl active:scale-95 transition-transform"
            >
              📢 ПОДПИСАТЬСЯ НА КАНАЛ
            </a>
          </div>
        </Card>
      </div>
    )
  }

  const endsDate = data.ends_at ? new Date(data.ends_at) : null
  const endsStr = endsDate
    ? endsDate.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  // Считаем сколько времени осталось до конца
  const timeLeft = endsDate ? Math.max(0, endsDate.getTime() - Date.now()) : 0
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.floor((timeLeft / (1000 * 60 * 60)) % 24)
  const minutesLeft = Math.floor((timeLeft / (1000 * 60)) % 60)

  // Процент оставшегося времени (для прогресс-бара)
  // Предполагаем что турнир длится 7 дней (168 часов)
  const totalDuration = 7 * 24 * 60 * 60 * 1000
  const progressPct = Math.max(0, Math.min(100, 100 - (timeLeft / totalDuration) * 100))

  const top = data.top || []

  return (
    <div className="p-4 space-y-4">
      {/* 🏆 ЗАГОЛОВОК */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-casino-gold">🏆 {data.name || 'ТУРНИР'}</h1>
        <p className="text-casino-muted text-xs mt-1">⏱ До: {endsStr}</p>
      </div>

      {/* ⏰ ТАЙМЕР + ПРОГРЕСС-БАР */}
      <Card className="border-casino-gold/40">
        <div className="text-center mb-2">
          <div className="text-casino-gold text-2xl font-black">
            {daysLeft}д {hoursLeft}ч {minutesLeft}м
          </div>
          <div className="text-casino-muted text-[10px]">до конца</div>
        </div>
        <div className="h-1.5 bg-casino-bg rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-casino-gold to-casino-gold2"
          />
        </div>
      </Card>

      {/* 💰 ПРИЗЫ */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { place: 2, medal: '🥈', amount: data.prize_2 || 0, color: 'from-gray-400/20 to-gray-500/20 border-gray-400/50', text: 'text-gray-300' },
          { place: 1, medal: '🥇', amount: data.prize_1 || 0, color: 'from-yellow-400/30 to-yellow-600/20 border-yellow-400/60', text: 'text-yellow-400' },
          { place: 3, medal: '🥉', amount: data.prize_3 || 0, color: 'from-orange-500/20 to-orange-600/20 border-orange-500/50', text: 'text-orange-400' },
        ].map((p) => (
          <motion.div
            key={p.place}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: p.place * 0.1 }}
          >
            <div className={`rounded-2xl border-2 bg-gradient-to-br ${p.color} p-3 text-center`}>
              <div className="text-3xl mb-1">{p.medal}</div>
              <div className={`text-xs font-bold ${p.text} mb-1`}>{p.place} МЕСТО</div>
              <div className="text-casino-gold font-black text-sm">{fmt(p.amount)}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🏆 ПОДИУМ ТОП-3 */}
      {top.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-casino-gold/40 bg-gradient-to-br from-casino-gold/5 to-casino-gold2/5">
            <h2 className="text-center text-casino-gold font-bold text-sm mb-4">
              🏆 ЛИДЕРЫ
            </h2>

            {/* Подиум: 2 - 1 - 3 */}
            <div className="flex items-end justify-center gap-2">
              {[
                { idx: 1, place: 2, medal: '🥈', height: 'h-20', color: 'from-gray-400 to-gray-600' },
                { idx: 0, place: 1, medal: '🥇', height: 'h-28', color: 'from-yellow-400 to-amber-600' },
                { idx: 2, place: 3, medal: '🥉', height: 'h-16', color: 'from-orange-500 to-orange-700' },
              ].map((p) => {
                const player = top[p.idx]
                if (!player) return <div key={p.place} className="w-20" />
                return (
                  <motion.div
                    key={p.place}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + p.idx * 0.1, type: 'spring' }}
                    className="flex flex-col items-center flex-1 max-w-[90px]"
                  >
                    {/* Игрок */}
                    <div className="text-2xl mb-1">{p.medal}</div>
                    <div className="text-xs font-bold text-center truncate w-full mb-1">
                      {player.username}
                    </div>
                    <div className="text-casino-gold font-black text-[11px] mb-2">
                      {fmt(player.total_won)}
                    </div>

                    {/* Подиум */}
                    <div className={`w-full ${p.height} bg-gradient-to-t ${p.color} rounded-t-lg flex items-start justify-center pt-2 shadow-lg`}>
                      <div className="text-white font-black text-lg">{p.place}</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* 📊 ОСТАЛЬНЫЕ МЕСТА */}
      {top.length > 3 && (
        <div className="space-y-2 mt-4">
          <h2 className="text-center text-casino-muted font-bold text-xs">ОСТАЛЬНЫЕ УЧАСТНИКИ</h2>
          {top.slice(3).map((p, i) => (
            <motion.div
              key={p.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
            >
              <Card>
                <div className="flex items-center gap-3">
                  <div className="text-casino-muted font-bold w-8 text-center">
                    {i + 4}
                  </div>
                  <div className="flex-1 font-bold truncate">
                    {p.username}
                  </div>
                  <div className="text-casino-gold font-bold text-sm">
                    {fmt(p.total_won)}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🕳 ПУСТО */}
      {top.length === 0 && (
        <Card>
          <div className="text-center py-8 text-casino-muted">
            <div className="text-5xl mb-3">🎲</div>
            <div className="font-bold mb-1">Пока никто не играл</div>
            <div className="text-xs">Стань первым и получи приз!</div>
          </div>
        </Card>
      )}

      {/* 📢 КНОПКА ПОДЕЛИТЬСЯ */}
      <motion.a
        href="https://t.me/TokenCasinoTournaments"
        target="_blank"
        rel="noopener noreferrer"
        whileTap={{ scale: 0.95 }}
        className="block w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-3 rounded-xl text-center mt-4"
      >
        📢 СЛЕДИТЬ ЗА ТУРНИРОМ
      </motion.a>
    </div>
  )
}