import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../components/Card'
import { CrashRocket } from '../../components/CrashRocket'
import { CrashBg } from '../../components/CrashBg'
import { useTelegram } from '../../hooks/useTelegram'
import { api } from '../../api/client'

interface CrashBet {
  user_id: number
  username: string
  bet: number
  auto_cashout: number | null
  cashed_out_at: number | null
  won: number
}

interface CrashState {
  round_id: number
  status: 'waiting' | 'running' | 'crashed'
  multiplier: number
  crash_point: number | null
  next_round_at: number
  history: number[]
  bets: CrashBet[]
  time_to_next: number
}

export function Crash() {
  const { userId, username, haptic, hapticSuccess, hapticError } = useTelegram()
  const [state, setState] = useState<CrashState | null>(null)
  const [betAmount, setBetAmount] = useState('100')
  const [autoCashout, setAutoCashout] = useState('')
  const [balance, setBalance] = useState(0)
  const [placing, setPlacing] = useState(false)
  const [myBet, setMyBet] = useState<CrashBet | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)
  const [timeToNext, setTimeToNext] = useState(0)
  const pollRef = useRef<number | null>(null)

  const loadBalance = async () => {
    if (!userId) return
    const res = await api.getBalance(userId) as any
    if (res?.balance !== undefined) setBalance(res.balance)
  }

  const fetchState = async () => {
    const res = await api.crashState() as CrashState
    if (res) {
      setState(res)
      setTimeToNext(res.time_to_next)
      const mine = res.bets?.find(b => b.user_id === userId)
      setMyBet(mine || null)
    }
  }

  useEffect(() => {
    loadBalance()
    fetchState()
    pollRef.current = window.setInterval(fetchState, 500)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [userId])

  const handleBet = async () => {
    if (!userId || placing) return
    const bet = parseInt(betAmount)
    if (!bet || bet < 10) { hapticError(); alert('Мин. 10 Tokens'); return }
    if (bet > balance) { hapticError(); alert('Недостаточно'); return }
    if (state?.status !== 'waiting') { hapticError(); alert('Ставки только во время отсчёта!'); return }
    haptic('medium')
    setPlacing(true)
    const auto = autoCashout ? parseFloat(autoCashout) : undefined
    const res = await api.crashBet(userId, username, bet, auto) as any
    if (res?.success) {
      hapticSuccess()
      await loadBalance()
      await fetchState()
    } else {
      alert(res?.error || 'Ошибка')
    }
    setPlacing(false)
  }

  const handleCashout = async () => {
    if (!userId) return
    haptic('medium')
    const res = await api.crashCashout(userId) as any
    if (res?.success) {
      hapticSuccess()
      setLastResult({ mult: res.mult, win: res.win })
      await loadBalance()
      await fetchState()
      setTimeout(() => setLastResult(null), 3000)
    } else {
      alert(res?.error || 'Ошибка')
    }
  }

  const getRocketPosition = () => {
    const m = state?.multiplier || 1
    const progress = Math.min(m / 10, 1)
    const left = 85 - progress * 70
    const top = 70 - progress * 55
    return { left: `${left}%`, top: `${top}%`, progress }
  }

  const rocketPos = getRocketPosition()
  const currentMult = state?.multiplier || 1
  const status = state?.status || 'waiting'
  const history = state?.history || []
  const bets = state?.bets || []
  const isMyBetActive = myBet && !myBet.cashed_out_at
  const isMyBetCashedOut = myBet && myBet.cashed_out_at
  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col">
      <CrashBg />

      <div className="relative z-10 pt-4 px-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-casino-gold font-bold text-sm">🚀 CRASH</div>
          <div className="flex gap-1 overflow-x-auto max-w-[60%] scrollbar-hide">
            {history.slice(0, 8).map((h, i) => (
              <div
                key={i}
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${
                  h >= 10 ? 'bg-purple-500/30 text-purple-300' :
                  h >= 3 ? 'bg-pink-500/30 text-pink-300' :
                  h >= 2 ? 'bg-blue-500/30 text-blue-300' :
                  'bg-casino-bg/60 text-casino-muted'
                }`}
              >
                {h.toFixed(2)}×
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex-1 min-h-[300px]">
          {status !== 'crashed' && (
            <motion.div
              className="absolute"
              style={{
                left: rocketPos.left,
                top: rocketPos.top,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ left: rocketPos.left, top: rocketPos.top }}
              transition={{ duration: 0.15, ease: 'linear' }}
            >
              <CrashRocket rotation={-20 - rocketPos.progress * 20} />
            </motion.div>
          )}

          {status === 'crashed' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0.8] }}
              transition={{ duration: 0.5 }}
              className="absolute text-7xl"
              style={{
                left: rocketPos.left,
                top: rocketPos.top,
                transform: 'translate(-50%, -50%)',
              }}
            >
              💥
            </motion.div>
          )}
        </div>

        <div className="relative z-10 mb-3">
          <div className="text-center py-4 bg-casino-bg/60 backdrop-blur rounded-2xl border border-casino-border">
            <div className="text-casino-muted text-[10px] mb-1">
              {status === 'waiting' && '⏱ Отсчёт до старта'}
              {status === 'running' && '📈 Множитель растёт!'}
              {status === 'crashed' && '💥 КРАШ'}
            </div>
            <motion.div
              className={`text-5xl font-black ${
                status === 'crashed' ? 'text-casino-red' : 'text-casino-gold'
              }`}
              animate={status === 'running' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{
                textShadow: status === 'crashed'
                  ? '0 0 30px rgba(220, 20, 60, 0.8)'
                  : '0 0 30px rgba(255, 215, 0, 0.8)',
              }}
            >
              {status === 'crashed'
                ? `КРАШ ×${(state?.crash_point || 1).toFixed(2)}`
                : `×${currentMult.toFixed(2)}`}
            </motion.div>
            {status === 'waiting' && timeToNext > 0 && (
              <div className="text-casino-gold text-sm mt-1 font-bold">
                {Math.ceil(timeToNext)} сек
              </div>
            )}
          </div>
        </div>

        {myBet && (
          <div className="relative z-10 mb-3">
            <Card className={isMyBetCashedOut ? 'border-casino-green/50' : 'border-casino-gold/50'}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-casino-muted">Твоя ставка</div>
                  <div className="font-bold text-casino-text">{fmt(myBet.bet)} Tokens</div>
                  {myBet.auto_cashout && (
                    <div className="text-[10px] text-casino-muted">АВТО ×{myBet.auto_cashout}</div>
                  )}
                </div>
                {isMyBetCashedOut ? (
                  <div className="text-right">
                    <div className="text-casino-green font-bold">
                      ✅ ×{myBet.cashed_out_at?.toFixed(2)}
                    </div>
                    <div className="text-casino-green text-sm">+{fmt(myBet.won)}</div>
                  </div>
                ) : status === 'running' && isMyBetActive ? (
                  <button
                    onClick={handleCashout}
                    className="bg-gradient-to-r from-casino-green to-emerald-400 text-black font-black px-4 py-3 rounded-xl active:scale-95"
                  >
                    ЗАБРАТЬ ×{currentMult.toFixed(2)}
                  </button>
                ) : null}
              </div>
            </Card>
          </div>
        )}

        {status === 'waiting' && !myBet && (
          <div className="relative z-10 mb-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Ставка"
                className="flex-1 bg-casino-bg border border-casino-border rounded-xl px-3 py-3 text-casino-text text-center font-bold"
              />
              <input
                type="number"
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value)}
                placeholder="Авто ×"
                className="w-24 bg-casino-bg border border-casino-border rounded-xl px-2 py-3 text-casino-text text-center text-sm"
              />
            </div>
            <div className="flex gap-2">
              {[100, 500, 1000, 5000].map((v) => (
                <button
                  key={v}
                  onClick={() => setBetAmount(v.toString())}
                  className="flex-1 bg-casino-bg border border-casino-border text-casino-muted py-2 rounded-xl text-xs font-bold"
                >
                  {v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
            </div>
            <button
              onClick={handleBet}
              disabled={placing}
              className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-black py-4 rounded-2xl active:scale-95 shadow-gold disabled:opacity-50"
            >
              {placing ? '⏳...' : `🚀 СДЕЛАТЬ СТАВКУ (${fmt(balance)})`}
            </button>
          </div>
        )}

        {status === 'running' && !myBet && (
          <div className="relative z-10 mb-3 text-center text-casino-muted text-xs py-2">
            Раунд уже идёт. Жди следующего.
          </div>
        )}

        {bets.length > 0 && (
          <div className="relative z-10 mb-4">
            <div className="text-casino-muted text-[10px] font-bold mb-1 px-1">
              ИГРОКИ В РАУНДЕ ({bets.length})
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {bets.map((b, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between bg-casino-card/80 backdrop-blur px-3 py-2 rounded-xl text-xs ${
                    b.user_id === userId ? 'border border-casino-gold/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>👤</span>
                    <span className="truncate font-bold">
                      {b.user_id === userId ? 'ТЫ' : b.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-casino-muted">⭐{fmt(b.bet)}</span>
                    {b.auto_cashout && (
                      <span className="text-[9px] text-casino-muted">×{b.auto_cashout}</span>
                    )}
                    {b.cashed_out_at ? (
                      <span className="text-casino-green font-bold">
                        ✓ ×{b.cashed_out_at.toFixed(2)}
                      </span>
                    ) : status === 'crashed' ? (
                      <span className="text-casino-red font-bold">💥</span>
                    ) : (
                      <span className="text-casino-muted">⏳</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {lastResult && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-casino-green text-black font-black px-6 py-3 rounded-2xl shadow-lg"
        >
          ✅ ВЫИГРАЛ ×{lastResult.mult?.toFixed(2)}
        </motion.div>
      )}
    </div>
  )
}