import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  // Плавное отображение множителя
  const [displayMult, setDisplayMult] = useState(1)
  const displayMultRef = useRef(1)

  const pollRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  // ─── ЗАГРУЗКА БАЛАНСА ───
  const loadBalance = async () => {
    if (!userId) return
    const res = (await api.getBalance(userId)) as any
    if (res?.balance !== undefined) setBalance(Number(res.balance))
  }

  // ─── ПОЗИЦИЯ РАКЕТЫ ───
  const getRocketPositionFromMult = (m: number) => {
    const progress = Math.min(Math.log(Math.max(m, 1)) / Math.log(10), 1)
    const leftPct = 9 + progress * 78
    const topPct = 90 - progress * 73
    return { leftPct, topPct, progress }
  }

  // ─── ЗАПРОС СОСТОЯНИЯ ───
  const fetchState = async () => {
    const res = (await api.crashState()) as CrashState
    if (res) {
      setState(res)
      setTimeToNext(res.time_to_next)
      const mine = res.bets?.find((b) => b.user_id === userId)
      setMyBet(mine || null)
    }
  }

  useEffect(() => {
    loadBalance()
    fetchState()
    pollRef.current = window.setInterval(fetchState, 400)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [userId])

  // ─── ПЛАВНОЕ ОТОБРАЖЕНИЕ МНОЖИТЕЛЯ ───
  useEffect(() => {
    if (!state) return
    const target = state.multiplier
    const start = displayMultRef.current
    const duration = 280
    const startTime = performance.now()

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const tick = () => {
      const elapsed = performance.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const val = start + (target - start) * eased

      displayMultRef.current = val
      setDisplayMult(val)

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [state?.multiplier])

  // ─── СБРОС ПРИ КРАШЕ ───
  useEffect(() => {
    if (state?.status === 'crashed' && state.crash_point) {
      displayMultRef.current = state.crash_point
      setDisplayMult(state.crash_point)
    }
  }, [state?.status])

  // ─── ПОСТАВИТЬ СТАВКУ ───
  const handleBet = async () => {
    if (!userId || placing) return
    const bet = parseInt(betAmount)
    const bal = Number(balance)

    if (!bet || bet < 10) {
      hapticError()
      alert('Минимальная ставка 10 Tokens')
      return
    }
    if (bet > bal) {
      hapticError()
      alert(`Недостаточно средств\nСтавка: ${fmt(bet)}\nБаланс: ${fmt(bal)}`)
      return
    }
    if (state?.status !== 'waiting') {
      hapticError()
      alert('Ставки только во время отсчёта!')
      return
    }

    haptic('medium')
    setPlacing(true)
    const auto = autoCashout ? parseFloat(autoCashout) : undefined
    const res = (await api.crashBet(userId, username, bet, auto)) as any
    if (res?.success) {
      hapticSuccess()
      await loadBalance()
      await fetchState()
    } else {
      alert(res?.error || 'Ошибка ставки')
    }
    setPlacing(false)
  }

  // ─── ЗАБРАТЬ ───
  const handleCashout = async () => {
    if (!userId) return
    haptic('medium')
    const res = (await api.crashCashout(userId)) as any
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

  // ─── ВЫЧИСЛЕНИЯ ───
  const rocketPos = getRocketPositionFromMult(displayMult)
  const currentMult = displayMult
  const status = state?.status || 'waiting'
  const history = state?.history || []
  const bets = state?.bets || []
  const isMyBetActive = myBet && !myBet.cashed_out_at
  const isMyBetCashedOut = myBet && myBet.cashed_out_at

  const isSpinning = status === 'waiting'
  const rocketRotation = -30 - rocketPos.progress * 25

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      <CrashBg multiplier={displayMult} status={status} />

      <div className="relative z-10 pt-3 px-4 flex-1 flex flex-col">
        {/* ЗАГОЛОВОК + ИСТОРИЯ */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-casino-gold font-bold text-sm">🚀 CRASH</div>
          <div className="flex gap-1 overflow-x-auto max-w-[70%] scrollbar-hide">
            {history.slice(0, 10).map((h, i) => (
              <div
                key={i}
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${
                  h >= 10
                    ? 'bg-purple-500/40 text-purple-200'
                    : h >= 5
                    ? 'bg-pink-500/40 text-pink-200'
                    : h >= 3
                    ? 'bg-orange-500/40 text-orange-200'
                    : h >= 2
                    ? 'bg-blue-500/40 text-blue-200'
                    : 'bg-casino-bg/70 text-casino-muted'
                }`}
              >
                {h.toFixed(2)}×
              </div>
            ))}
          </div>
        </div>

        {/* ПОЛЕ С РАКЕТОЙ */}
        <div className="relative flex-1 min-h-[340px]">
          {/* РАКЕТА */}
          <AnimatePresence>
            {status !== 'crashed' && (
              <motion.div
                key="rocket"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute"
                style={{
                  left: `${rocketPos.leftPct}%`,
                  top: `${rocketPos.topPct}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5,
                }}
              >
                <CrashRocket rotation={rocketRotation} spinning={isSpinning} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ВЗРЫВ */}
          <AnimatePresence>
            {status === 'crashed' && (
              <>
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: 0 }}
                  animate={{
                    scale: [0, 2.2, 1.8],
                    opacity: [0, 1, 0.85],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 0.7 }}
                  className="absolute text-8xl z-10 pointer-events-none"
                  style={{
                    left: `${rocketPos.leftPct}%`,
                    top: `${rocketPos.topPct}%`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'drop-shadow(0 0 50px rgba(255,69,0,0.95))',
                  }}
                >
                  💥
                </motion.div>

                {[...Array(14)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      left: `${rocketPos.leftPct}%`,
                      top: `${rocketPos.topPct}%`,
                      opacity: 1,
                      scale: 1,
                    }}
                    animate={{
                      left: `${rocketPos.leftPct + (Math.random() - 0.5) * 45}%`,
                      top: `${rocketPos.topPct + (Math.random() - 0.5) * 45}%`,
                      opacity: 0,
                      scale: 0.3,
                    }}
                    transition={{ duration: 1.2, delay: i * 0.04 }}
                    className="absolute text-2xl pointer-events-none"
                  >
                    {['💥', '🔥', '⭐', '💫'][i % 4]}
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* МНОЖИТЕЛЬ ВНИЗУ */}
        <div className="relative z-10 mb-3">
          <div className="text-center py-4 bg-casino-bg/70 backdrop-blur rounded-2xl border border-casino-border/50">
            <div className="text-casino-muted text-[10px] mb-1">
              {status === 'waiting' && '⏱ Отсчёт до старта'}
              {status === 'running' && '📈 Множитель растёт!'}
              {status === 'crashed' && '💥 КРАШ'}
            </div>
            <motion.div
              className={`text-6xl font-black ${
                status === 'crashed' ? 'text-casino-red' : 'text-casino-gold'
              }`}
              animate={
                status === 'running'
                  ? { scale: [1, 1.05, 1] }
                  : { scale: 1 }
              }
              transition={{
                duration: 0.4,
                repeat: status === 'running' ? Infinity : 0,
              }}
              style={{
                textShadow:
                  status === 'crashed'
                    ? '0 0 40px rgba(220, 20, 60, 1), 0 0 80px rgba(220, 20, 60, 0.6)'
                    : '0 0 40px rgba(255, 215, 0, 0.9), 0 0 80px rgba(255, 215, 0, 0.5)',
                letterSpacing: '2px',
              }}
            >
              {status === 'crashed'
                ? `${(state?.crash_point || 1).toFixed(2)}×`
                : `${currentMult.toFixed(2)}×`}
            </motion.div>
            {status === 'waiting' && timeToNext > 0 && (
              <div className="text-casino-gold text-sm mt-1 font-bold">
                Старт через {Math.ceil(timeToNext)} сек
              </div>
            )}
            {status === 'running' && isMyBetActive && (
              <div className="text-casino-gold text-xs mt-1 font-bold animate-pulse">
                ⚡ ЖМИ «ЗАБРАТЬ» — УСПЕЙ!
              </div>
            )}
          </div>
        </div>

        {/* МОЯ СТАВКА */}
        {myBet && (
          <div className="relative z-10 mb-3">
            <Card
              className={
                isMyBetCashedOut
                  ? 'border-casino-green/70'
                  : 'border-casino-gold/70'
              }
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-casino-muted">Твоя ставка</div>
                  <div className="font-bold text-casino-text truncate">
                    {fmt(myBet.bet)} Tokens
                  </div>
                  {myBet.auto_cashout && (
                    <div className="text-[10px] text-casino-gold">
                      🎯 АВТО ×{myBet.auto_cashout}
                    </div>
                  )}
                </div>
                {isMyBetCashedOut ? (
                  <div className="text-right">
                    <div className="text-casino-green font-bold text-sm">
                      ✅ ×{myBet.cashed_out_at?.toFixed(2)}
                    </div>
                    <div className="text-casino-green text-xs">
                      +{fmt(myBet.won)}
                    </div>
                  </div>
                ) : status === 'running' && isMyBetActive ? (
                  <motion.button
                    onClick={handleCashout}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(0,255,127,0.5)',
                        '0 0 40px rgba(0,255,127,0.9)',
                        '0 0 20px rgba(0,255,127,0.5)',
                      ],
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="bg-gradient-to-r from-casino-green to-emerald-400 text-black font-black px-4 py-3 rounded-xl whitespace-nowrap"
                  >
                    ЗАБРАТЬ ×{currentMult.toFixed(2)}
                  </motion.button>
                ) : null}
              </div>
            </Card>
          </div>
        )}

        {/* КНОПКИ СТАВКИ */}
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
                className="w-24 bg-casino-bg border border-casino-border rounded-xl px-2 py-3 text-casino-gold text-center text-sm"
              />
            </div>

            <div className="flex gap-1.5">
              {[100, 500, 1000, 5000].map((v) => (
                <button
                  key={v}
                  onClick={() => setBetAmount(v.toString())}
                  className="flex-1 bg-casino-bg border border-casino-border text-casino-muted py-2 rounded-xl text-xs font-bold active:scale-95"
                >
                  {v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
              <button
                onClick={() => setBetAmount(Math.floor(balance).toString())}
                className="flex-1 bg-red-500/80 border border-red-500 text-white py-2 rounded-xl text-xs font-bold active:scale-95"
              >
                MAX
              </button>
            </div>

            <motion.button
              onClick={handleBet}
              disabled={placing}
              whileTap={{ scale: 0.96 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255,215,0,0.4)',
                  '0 0 35px rgba(255,215,0,0.7)',
                  '0 0 20px rgba(255,215,0,0.4)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-black py-4 rounded-2xl disabled:opacity-50"
            >
              {placing ? '⏳...' : `🚀 СДЕЛАТЬ СТАВКУ (${fmt(balance)})`}
            </motion.button>
          </div>
        )}

        {status === 'running' && !myBet && (
          <div className="relative z-10 mb-3 text-center text-casino-muted text-xs py-2">
            Раунд уже идёт. Жди следующего.
          </div>
        )}

        {/* ТАБЛИЦА СТАВОК */}
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

      {/* РЕЗУЛЬТАТ ВЫИГРЫША */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-casino-green to-emerald-400 text-black font-black px-8 py-4 rounded-2xl shadow-2xl"
          >
            ✅ ВЫИГРАЛ ×{lastResult.mult?.toFixed(2)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}