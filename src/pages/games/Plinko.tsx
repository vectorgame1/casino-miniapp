import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../components/Card'
import { useTelegram } from '../../hooks/useTelegram'
import { api } from '../../api/client'

const RISKS = [
  { id: 'low', icon: '🟢', name: 'Низкий' },
  { id: 'medium', icon: '🟡', name: 'Средний' },
  { id: 'high', icon: '🔴', name: 'Высокий' },
]

const MULTIPLIERS: Record<string, number[]> = {
  low:    [1.5, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.5],
  medium: [5.0, 2.0, 1.0, 0.5, 0.3, 0.5, 1.0, 2.0, 5.0],
  high:   [100.0, 10.0, 2.0, 0.5, 0.0, 0.5, 2.0, 10.0, 100.0],
}

export function Plinko() {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState('100')
  const [risk, setRisk] = useState('medium')
  const [balance, setBalance] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [path, setPath] = useState<number[]>([])
  const [finalPos, setFinalPos] = useState<number | null>(null)
  const [lastWin, setLastWin] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])

  const loadBalance = async () => {
    if (!userId) return
    const res = await api.getBalance(userId) as any
    if (res?.balance !== undefined) setBalance(res.balance)
  }

  const loadHistory = async () => {
    const res = await api.plinkoHistory() as any[]
    if (Array.isArray(res)) setHistory(res)
  }

  useEffect(() => {
    loadBalance()
    loadHistory()
  }, [userId])

  const handlePlay = async () => {
    if (!userId || playing) return
    const b = parseInt(bet)
    if (!b || b < 10) { hapticError(); alert('Мин. 10 Tokens'); return }
    if (b > balance) { hapticError(); alert('Недостаточно'); return }

    haptic('medium')
    setPlaying(true)
    setFinalPos(null)
    setLastWin(null)
    setPath([])

    const res = await api.plinkoPlay(userId, b, risk) as any

    if (res && res.position !== undefined) {
      // Генерируем визуальный путь к РЕАЛЬНОЙ позиции
      const targetPos = res.position
      const visualPath: number[] = [4]
      let cur = 4
      const steps = 8
      for (let i = 0; i < steps; i++) {
        const remaining = steps - i
        const diff = targetPos - cur
        let step: number
        if (remaining === Math.abs(diff)) {
          step = diff > 0 ? 1 : -1
        } else {
          step = Math.random() < 0.5 ? -1 : 1
        }
        cur += step
        cur = Math.max(0, Math.min(8, cur))
        visualPath.push(cur)
      }
      // Финалим точно на targetPos
      visualPath[visualPath.length - 1] = targetPos

      for (let i = 0; i < visualPath.length; i++) {
        await new Promise(r => setTimeout(r, 130))
        setPath(visualPath.slice(0, i + 1))
      }

      await new Promise(r => setTimeout(r, 200))
      setFinalPos(targetPos)
      setLastWin(res)

      if (res.win) hapticSuccess()
      else hapticError()

      await loadBalance()
      await loadHistory()

      setTimeout(() => {
        setFinalPos(null)
        setLastWin(null)
        setPath([])
      }, 3000)
    } else {
      alert(res?.error || 'Ошибка')
    }
    setPlaying(false)
  }

  const multipliers = MULTIPLIERS[risk] || MULTIPLIERS.medium
  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const ballPos = path.length > 0 ? path[path.length - 1] : 4
  const ballRow = path.length - 1

  return (
    <div className="p-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-casino-gold">🎯 PLINKO</h1>
        <p className="text-casino-muted text-xs mt-1">Бросай шарик — лови множитель</p>
      </div>

      {/* ПОЛЕ */}
      <Card className="mb-4 relative overflow-hidden">
        <div className="relative w-full" style={{ height: '400px' }}>
          {/* Колышки */}
          {Array.from({ length: 9 }).map((_, row) => (
            <div
              key={row}
              className="absolute w-full flex justify-center items-center gap-3"
              style={{ top: `${(row + 1) * 9}%` }}
            >
              {Array.from({ length: row + 2 }).map((_, i) => (
                <div                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-casino-gold/50"
                  style={{ boxShadow: '0 0 4px rgba(255,215,0,0.5)' }}
                />
              ))}
            </div>
          ))}

          {/* Шарик */}
          {path.length > 0 && finalPos === null && (
            <motion.div
              className="absolute w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                boxShadow: '0 0 15px rgba(255,215,0,0.9)',
                left: `${8 + ballPos * 10.5}%`,
                top: `${(ballRow + 1) * 9}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                left: `${8 + ballPos * 10.5}%`,
                top: `${(ballRow + 1) * 9}%`,
              }}
              transition={{ duration: 0.13 }}
            >
              💎
            </motion.div>
          )}

          {/* Результат */}
          {finalPos !== null && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: 1 }}
              className="absolute text-4xl z-10"
              style={{
                left: `${8 + finalPos * 10.5}%`,
                top: '95%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {lastWin?.win ? '🎉' : '💥'}
            </motion.div>
          )}

          {/* Лунки */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 gap-0.5">
            {multipliers.map((m, i) => {
              const isWinner = finalPos === i
              const colorBase =
                m >= 10 ? 'purple' :
                m >= 2 ? 'green' :
                m >= 1 ? 'gold' : 'red'
              const baseClasses =
                colorBase === 'purple' ? 'bg-purple-500/20 text-purple-300' :
                colorBase === 'green' ? 'bg-casino-green/20 text-casino-green' :
                colorBase === 'gold' ? 'bg-casino-gold/20 text-casino-gold' :
                'bg-casino-red/20 text-casino-red'
              const winClasses =
                colorBase === 'purple' ? 'bg-gradient-to-b from-purple-500 to-purple-700 text-white' :
                colorBase === 'green' ? 'bg-gradient-to-b from-casino-green to-emerald-600 text-black' :
                colorBase === 'gold' ? 'bg-gradient-to-b from-casino-gold to-casino-gold2 text-black' :
                'bg-gradient-to-b from-casino-red to-red-700 text-white'
              return (
                <motion.div
                  key={i}
                  animate={isWinner ? { scale: [1, 1.3, 1] } : {}}
                  className={`flex-1 py-3 rounded text-center text-[10px] font-black transition-all ${
                    isWinner ? `${winClasses} shadow-[0_0_20px_rgba(255,255,255,0.6)]` : baseClasses
                  }`}
                >
                  {m}×
                </motion.div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* РИСК */}
      <div className="flex gap-2 mb-3">
        {RISKS.map((r) => (
          <button
            key={r.id}
            onClick={() => { haptic('light'); setRisk(r.id) }}
            disabled={playing}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
              risk === r.id
                ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-black shadow-gold'
                : 'bg-casino-card border border-casino-border text-casino-muted'
            } disabled:opacity-50`}
          >
            {r.icon} {r.name}
          </button>
        ))}
      </div>

      {/* СТАВКА */}
      <div className="flex gap-2 mb-3">
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(e.target.value)}
          disabled={playing}
          placeholder="Ставка"
          className="flex-1 bg-casino-bg border border-casino-border rounded-xl px-4 py-3 text-casino-text text-center font-bold disabled:opacity-50"
        />
        {[100, 1000, 5000].map((v) => (
          <button
            key={v}
            onClick={() => setBet(v.toString())}
            disabled={playing}
            className="bg-casino-bg border border-casino-border text-casino-muted px-3 rounded-xl text-xs font-bold disabled:opacity-50"
          >
            {v >= 1000 ? `${v / 1000}K` : v}
          </button>
        ))}
      </div>

      {/* КНОПКА БРОСИТЬ */}
      <button
        onClick={handlePlay}
        disabled={playing}
        className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-black py-4 rounded-2xl active:scale-95 shadow-gold disabled:opacity-50 mb-4"
      >
        {playing ? '⏳ Бросаем...' : `🎯 БРОСИТЬ (${fmt(balance)})`}
      </button>

      {/* РЕЗУЛЬТАТ */}
      {lastWin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center py-4 rounded-2xl mb-4 ${
            lastWin.win
              ? 'bg-casino-green/20 border border-casino-green/50'
              : 'bg-casino-red/20 border border-casino-red/50'
          }`}
        >
          <div className={`text-2xl font-black ${lastWin.win ? 'text-casino-green' : 'text-casino-red'}`}>
            {lastWin.win ? `✅ ×${lastWin.multiplier}` : `💥 ×${lastWin.multiplier}`}
          </div>
          <div className="text-sm mt-1">
            {lastWin.win ? `+${fmt(lastWin.amount)}` : `-${fmt(lastWin.bet)}`}
          </div>
        </motion.div>
      )}

      {/* ИСТОРИЯ */}
      {history.length > 0 && (
        <div>
          <div className="text-casino-muted text-[10px] font-bold mb-2">
            ПОСЛЕДНИЕ ДРОПЫ
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center justify-between bg-casino-card px-3 py-1.5 rounded-lg text-xs">
                <span className="truncate">👤 {h.username}</span>
                <span className={`font-bold ${
                  h.multiplier >= 2 ? 'text-casino-green' :
                  h.multiplier >= 1 ? 'text-casino-gold' :
                  'text-casino-red'
                }`}>
                  ×{h.multiplier}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}