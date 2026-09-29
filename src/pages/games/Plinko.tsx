import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../../components/Card'
import { useTelegram } from '../../hooks/useTelegram'
import { api } from '../../api/client'

const RISKS = [
  { id: 'low', name: 'НИЗКИЙ', color: '#52B788', border: 'border-casino-greenLight/50' },
  { id: 'medium', name: 'СРЕДНИЙ', color: '#D4AF37', border: 'border-casino-gold/50' },
  { id: 'high', name: 'ВЫСОКИЙ', color: '#C41E3A', border: 'border-casino-redLight/50' },
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
    <div className="p-4 pb-24">
      <div className="text-center mb-4">
        <h1 className="font-display text-3xl tracking-widest text-casino-gold">PLINKO</h1>
        <p className="text-casino-muted text-[10px] tracking-widest uppercase mt-1">Бросай шарик — лови множитель</p>
      </div>

      <Card className="mb-4 relative overflow-hidden">
        <div className="relative w-full" style={{ height: '400px' }}>
          {Array.from({ length: 9 }).map((_, row) => (
            <div
              key={row}
              className="absolute w-full flex justify-center items-center gap-3"
              style={{ top: `${(row + 1) * 9}%` }}
            >
              {Array.from({ length: row + 2 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-casino-gold/50"
                  style={{ boxShadow: '0 0 4px rgba(212,175,55,0.5)' }}
                />
              ))}
            </div>
          ))}

          {path.length > 0 && finalPos === null && (
            <motion.div
              className="absolute w-5 h-5 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #E8C860, #D4AF37, #B8941F)',
                boxShadow: '0 0 15px rgba(212,175,55,0.9)',
                left: `${8 + ballPos * 10.5}%`,
                top: `${(ballRow + 1) * 9}%`,
                transform: 'translate(-50%, -50%)',
              }}
              transition={{ duration: 0.13 }}
            />
          )}

          {finalPos !== null && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: 1 }}
              className="absolute z-10"
              style={{
                left: `${8 + finalPos * 10.5}%`,
                top: '95%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24">
                {lastWin?.win ? (
                  <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17.5 L6 21 L7 14 L2 9 L9 8 Z" fill="#52B788" />
                ) : (
                  <path d="M12 2 L14 9 L21 7 L16 12 L21 17 L14 15 L12 22 L10 15 L3 17 L8 12 L3 7 L10 9 Z" fill="#C41E3A" />
                )}
              </svg>
            </motion.div>
          )}

          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 gap-0.5">
            {multipliers.map((m, i) => {
              const isWinner = finalPos === i
              const colorBase =
                m >= 10 ? 'purple' :
                m >= 2 ? 'green' :
                m >= 1 ? 'gold' : 'red'
              const baseClasses =
                colorBase === 'purple' ? 'bg-purple-500/20 text-purple-300' :
                colorBase === 'green' ? 'bg-casino-green/20 text-casino-greenLight' :
                colorBase === 'gold' ? 'bg-casino-gold/20 text-casino-gold' :
                'bg-casino-red/20 text-casino-redLight'
              const winClasses =
                colorBase === 'purple' ? 'bg-gradient-to-b from-purple-500 to-purple-700 text-white' :
                colorBase === 'green' ? 'bg-gradient-to-b from-casino-green to-emerald-600 text-casino-bg' :
                colorBase === 'gold' ? 'bg-gradient-to-b from-casino-gold to-casino-gold2 text-casino-bg' :
                'bg-gradient-to-b from-casino-red to-red-700 text-white'
              return (
                <motion.div
                  key={i}
                  animate={isWinner ? { scale: [1, 1.3, 1] } : {}}
                  className={`flex-1 py-3 rounded text-center text-[10px] font-display tracking-wider transition-all ${
                    isWinner ? `${winClasses} shadow-[0_0_20px_rgba(212,175,55,0.6)]` : baseClasses
                  }`}
                >
                  {m}×
                </motion.div>
              )
            })}
          </div>
        </div>
      </Card>

      <div className="flex gap-2 mb-3">
        {RISKS.map((r) => (
          <button
            key={r.id}
            onClick={() => { haptic('light'); setRisk(r.id) }}
            disabled={playing}
            className={`flex-1 py-3 rounded-lg font-display text-[10px] tracking-widest transition-all ${
              risk === r.id
                ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg shadow-gold'
                : `bg-casino-card border ${r.border} text-casino-muted`
            } disabled:opacity-50`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(e.target.value)}
          disabled={playing}
          placeholder="Ставка"
          className="flex-1 bg-casino-bg border border-casino-border/60 rounded-lg px-4 py-3 text-casino-text text-center font-display tracking-wider disabled:opacity-50"
        />
        {[100, 1000, 5000].map((v) => (
          <button
            key={v}
            onClick={() => setBet(v.toString())}
            disabled={playing}
            className="bg-casino-bg border border-casino-border/60 text-casino-muted px-3 rounded-lg text-xs font-display tracking-wider disabled:opacity-50"
          >
            {v >= 1000 ? `${v / 1000}K` : v}
          </button>
        ))}
      </div>

      <button
        onClick={handlePlay}
        disabled={playing}
        className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-4 rounded-xl text-lg tracking-widest active:scale-95 shadow-gold disabled:opacity-50 mb-4"
      >
        {playing ? 'БРОСАЕМ...' : `БРОСИТЬ (${fmt(balance)})`}
      </button>

      {lastWin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center py-4 rounded-xl mb-4 border ${
            lastWin.win
              ? 'bg-casino-green/10 border-casino-greenLight/40'
              : 'bg-casino-red/10 border-casino-redLight/40'
          }`}
        >
          <div className={`font-display text-2xl tracking-wider ${lastWin.win ? 'text-casino-greenLight' : 'text-casino-redLight'}`}>
            ×{lastWin.multiplier}
          </div>
          <div className="text-sm mt-1 text-casino-muted font-display tracking-wider">
            {lastWin.win ? `+${fmt(lastWin.amount)}` : `-${fmt(lastWin.bet)}`}
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <div>
          <div className="text-casino-muted text-[10px] font-display tracking-widest mb-2">
            ПОСЛЕДНИЕ ДРОПЫ
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center justify-between bg-casino-card px-3 py-1.5 rounded-lg text-xs border border-casino-border/40">
                <span className="truncate text-casino-muted">{h.username}</span>
                <span className={`font-display tracking-wider ${
                  h.multiplier >= 2 ? 'text-casino-greenLight' :
                  h.multiplier >= 1 ? 'text-casino-gold' :
                  'text-casino-redLight'
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