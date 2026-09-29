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

  const [displayMult, setDisplayMult] = useState(1)
  const displayMultRef = useRef(1)

  const pollRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const loadBalance = async () => {
    if (!userId) return
    const res = (await api.getBalance(userId)) as any
    if (res?.balance !== undefined) setBalance(Number(res.balance))
  }

  const getRocketPositionFromMult = (m: number) => {
    const progress = Math.min(Math.log(Math.max(m, 1)) / Math.log(10), 1)
    const leftPct = 9 + progress * 78
    const topPct = 92 - progress * 75
    return { leftPct, topPct, progress }
  }

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
    pollRef.current = window.setInterval(fetchState, 300)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [userId])

  // ⚠️ ПЛАВНОЕ ОТОБРАЖЕНИЕ — УВЕЛИЧИЛ ВРЕМЯ С 280 ДО 500 МС
  useEffect(() => {
    if (!state) return
    const target = state.multiplier
    const start = displayMultRef.current
    const duration = 500  // ← было 280
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

  useEffect(() => {
    if (state?.status === 'crashed' && state.crash_point) {
      displayMultRef.current = state.crash_point
      setDisplayMult(state.crash_point)
    }
  }, [state?.status])

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
          <div className="font-display text-casino-gold text-xl tracking-widest">CRASH</div>
          <div className="flex gap-1 overflow-x-auto max-w-[70%] scrollbar-hide">
            {history.slice(0, 10).map((h, i) => (
              <div
                key={i}
                className={`text-[10px] px-2 py-1 rounded font-display tracking-wider flex-shrink-0 border ${
                  h >= 10
                    ? 'bg-purple-500/20 text-purple-200 border-purple-500/40'
                    : h >= 5
                    ? 'bg-pink-500/20 text-pink-200 border-pink-500/40'
                    : h >= 3
                    ? 'bg-orange-500/20 text-orange-200 border-orange-500/40'
                    : h >= 2
                    ? 'bg-blue-500/20 text-blue-200 border-blue-500/40'
                    : 'bg-casino-bg/70 text-casino-muted border-casino-border/40'
                }`}
              >
                {h.toFixed(2)}×
              </div>
            ))}
          </div>
        </div>

        {/* ПОЛЕ С РАКЕТОЙ */}
        <div className="relative flex-1 min-h-[360px]">
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
              <motion.div
                key="explosion"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${rocketPos.leftPct}%`,
                  top: `${rocketPos.topPct}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                }}
              >
                <svg width="400" height="400" viewBox="-200 -200 400 400">
                  <defs>
                    <radialGradient id="expl1">
                      <stop offset="0%" stopColor="#FFF" />
                      <stop offset="20%" stopColor="#FFD700" />
                      <stop offset="50%" stopColor="#FF8C00" />
                      <stop offset="100%" stopColor="#C41E3A" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="expl2">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="60%" stopColor="#C41E3A" />
                      <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Круги взрыва */}
                  <circle r="20" fill="url(#expl1)">
                    <animate attributeName="r" from="10" to="180" dur="0.9s" fill="freeze" />
                    <animate attributeName="opacity" from="1" to="0" dur="0.9s" fill="freeze" />
                  </circle>
                  <circle r="30" fill="none" stroke="#FFD700" strokeWidth="4">
                    <animate attributeName="r" from="20" to="160" dur="0.8s" fill="freeze" />
                    <animate attributeName="opacity" from="1" to="0" dur="0.8s" fill="freeze" />
                  </circle>
                  <circle r="30" fill="none" stroke="#C41E3A" strokeWidth="3">
                    <animate attributeName="r" from="30" to="200" dur="1.1s" fill="freeze" />
                    <animate attributeName="opacity" from="0.9" to="0" dur="1.1s" fill="freeze" />
                  </circle>

                  {/* Лучи */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i * 22.5) * Math.PI / 180
                    const x2 = Math.cos(angle) * 170
                    const y2 = Math.sin(angle) * 170
                    return (
                      <line
                        key={i}
                        x1="0"
                        y1="0"
                        x2={x2}
                        y2={y2}
                        stroke={i % 2 === 0 ? '#FFD700' : '#C41E3A'}
                        strokeWidth="4"
                        strokeLinecap="round"
                      >
                        <animate attributeName="opacity" from="1" to="0" dur="0.7s" fill="freeze" />
                        <animate attributeName="x2" from="0" to={x2} dur="0.7s" fill="freeze" />
                        <animate attributeName="y2" from="0" to={y2} dur="0.7s" fill="freeze" />
                      </line>
                    )
                  })}

                  {/* Искры */}
                  {Array.from({ length: 20 }).map((_, i) => {
                    const angle = Math.random() * Math.PI * 2
                    const dist = 100 + Math.random() * 100
                    const x = Math.cos(angle) * dist
                    const y = Math.sin(angle) * dist
                    return (
                      <circle
                        key={`spark-${i}`}
                        cx="0"
                        cy="0"
                        r="3"
                        fill={i % 3 === 0 ? '#FFF' : '#FFD700'}
                      >
                        <animate attributeName="cx" from="0" to={x} dur="1.3s" fill="freeze" />
                        <animate attributeName="cy" from="0" to={y} dur="1.3s" fill="freeze" />
                        <animate attributeName="opacity" from="1" to="0" dur="1.3s" fill="freeze" />
                        <animate attributeName="r" from="3" to="0.5" dur="1.3s" fill="freeze" />
                      </circle>
                    )
                  })}

                  {/* Центральный */}
                  <circle r="20" fill="#FFF">
                    <animate attributeName="r" from="0" to="40" dur="0.25s" fill="freeze" />
                    <animate attributeName="opacity" from="1" to="0" dur="0.7s" fill="freeze" />
                  </circle>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* МНОЖИТЕЛЬ */}
        <div className="relative z-10 mb-3">
          <div className="text-center py-4 bg-casino-bg/80 backdrop-blur rounded-2xl border border-casino-border/50">
            <div className="text-casino-muted text-[10px] mb-2 tracking-widest uppercase font-display">
              {status === 'waiting' && 'ОТСЧЁТ ДО СТАРТА'}
              {status === 'running' && 'МНОЖИТЕЛЬ РАСТЁТ'}
              {status === 'crashed' && 'КРАШ'}
            </div>
            <motion.div
              className="font-display"
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
                fontSize: '72px',
                lineHeight: 1,
                letterSpacing: '3px',
                color: status === 'crashed' ? '#C41E3A' : '#FFD700',
                textShadow:
                  status === 'crashed'
                    ? '0 0 50px rgba(196, 30, 58, 1), 0 0 100px rgba(196, 30, 58, 0.7)'
                    : '0 0 50px rgba(255, 215, 0, 1), 0 0 100px rgba(255, 215, 0, 0.6)',
              }}
            >
              {status === 'crashed'
                ? `${(state?.crash_point || 1).toFixed(2)}×`
                : `${currentMult.toFixed(2)}×`}
            </motion.div>
            {status === 'waiting' && timeToNext > 0 && (
              <div className="text-casino-gold text-sm mt-2 font-display tracking-widest">
                СТАРТ ЧЕРЕЗ {Math.ceil(timeToNext)} СЕК
              </div>
            )}
            {status === 'running' && isMyBetActive && (
              <div className="text-casino-gold text-xs mt-2 font-display tracking-widest animate-pulse">
                ЖМИ «ЗАБРАТЬ» — УСПЕЙ
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
                  ? 'border-casino-greenLight/60'
                  : 'border-casino-gold/60'
              }
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-casino-muted tracking-widest uppercase font-display">
                    Твоя ставка
                  </div>
                  <div className="font-display text-casino-text truncate tracking-wider text-lg">
                    {fmt(myBet.bet)} TOKENS
                  </div>
                  {myBet.auto_cashout && (
                    <div className="text-[10px] text-casino-gold font-display tracking-widest">
                      АВТО ×{myBet.auto_cashout}
                    </div>
                  )}
                </div>
                {isMyBetCashedOut ? (
                  <div className="text-right">
                    <div className="text-casino-greenLight font-display text-lg tracking-wider">
                      ×{myBet.cashed_out_at?.toFixed(2)}
                    </div>
                    <div className="text-casino-greenLight text-sm font-display tracking-wider">
                      +{fmt(myBet.won)}
                    </div>
                  </div>
                ) : status === 'running' && isMyBetActive ? (
                  <motion.button
                    onClick={handleCashout}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      boxShadow: [
                        '0 0 25px rgba(82, 183, 136, 0.6)',
                        '0 0 50px rgba(82, 183, 136, 1)',
                        '0 0 25px rgba(82, 183, 136, 0.6)',
                      ],
                    }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                    className="bg-gradient-to-r from-casino-green to-casino-greenLight text-casino-bg font-display px-5 py-3 rounded-xl whitespace-nowrap tracking-widest text-sm"
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
                className="flex-1 bg-casino-bg border border-casino-border/60 rounded-xl px-4 py-3 text-casino-text text-center font-display tracking-wider text-lg"
              />
              <input
                type="number"
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value)}
                placeholder="Авто ×"
                className="w-28 bg-casino-bg border border-casino-border/60 rounded-xl px-2 py-3 text-casino-gold text-center font-display tracking-wider"
              />
            </div>

            <div className="flex gap-1.5">
              {[100, 500, 1000, 5000, 10000].map((v) => (
                <button
                  key={v}
                  onClick={() => setBetAmount(v.toString())}
                  className="flex-1 bg-casino-bg border border-casino-border/60 text-casino-muted py-2.5 rounded-xl text-xs font-display tracking-wider active:scale-95"
                >
                  {v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
              <button
                onClick={() => setBetAmount(Math.floor(balance).toString())}
                className="flex-1 bg-casino-red/80 border border-casino-redLight text-casino-text py-2.5 rounded-xl text-xs font-display tracking-wider active:scale-95"
              >
                MAX
              </button>
            </div>

            <motion.button
              onClick={handleBet}
              disabled={placing}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  '0 0 25px rgba(255, 215, 0, 0.5)',
                  '0 0 45px rgba(255, 215, 0, 0.8)',
                  '0 0 25px rgba(255, 215, 0, 0.5)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-4 rounded-xl text-lg tracking-widest disabled:opacity-50"
            >
              {placing ? '...' : `СДЕЛАТЬ СТАВКУ (${fmt(balance)})`}
            </motion.button>
          </div>
        )}

        {status === 'running' && !myBet && (
          <div className="relative z-10 mb-3 text-center text-casino-muted text-[11px] py-2 font-display tracking-widest">
            РАУНД УЖЕ ИДЁТ. ЖДИ СЛЕДУЮЩЕГО.
          </div>
        )}

        {/* ТАБЛИЦА СТАВОК */}
        {bets.length > 0 && (
          <div className="relative z-10 mb-4">
            <div className="text-casino-muted text-[10px] font-display tracking-widest mb-2 px-1">
              ИГРОКИ В РАУНДЕ ({bets.length})
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {bets.map((b, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between bg-casino-card/80 backdrop-blur px-3 py-2.5 rounded-xl text-xs ${
                    b.user_id === userId ? 'border border-casino-gold/50' : 'border border-casino-border/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate font-display tracking-wider text-casino-text">
                      {b.user_id === userId ? 'ТЫ' : b.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-casino-muted font-display tracking-wider">
                      {fmt(b.bet)}
                    </span>
                    {b.cashed_out_at ? (
                      <span className="text-casino-greenLight font-display tracking-wider font-bold">
                        ×{b.cashed_out_at.toFixed(2)}
                      </span>
                    ) : status === 'crashed' ? (
                      <span className="text-casino-redLight font-display tracking-wider font-bold">
                        КРАШ
                      </span>
                    ) : (
                      <span className="text-casino-muted font-display tracking-wider">...</span>
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
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-casino-green to-casino-greenLight text-casino-bg font-display tracking-widest px-8 py-4 rounded-xl shadow-2xl text-lg"
          >
            ВЫИГРАЛ ×{lastResult.mult?.toFixed(2)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}