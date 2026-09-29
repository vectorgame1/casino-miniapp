import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../../components/Card'
import { useTelegram } from '../../hooks/useTelegram'
import { api } from '../../api/client'

const RED = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]
const BET_OPTIONS = [100, 500, 1000, 5000, 10000]

type BetType = 'red' | 'black' | 'green'

interface RouletteProps {
  onBack: () => void
}

export function Roulette({ onBack }: RouletteProps) {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState(1000)
  const [betType, setBetType] = useState<BetType>('red')
  const [playing, setPlaying] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<number | null>(null)
  const [resultColor, setResultColor] = useState<string | null>(null)
  const [win, setWin] = useState<boolean | null>(null)
  const [amount, setAmount] = useState(0)
  const rotationRef = useRef(0)

  const getColor = (n: number): 'red' | 'black' | 'green' => {
    if (n === 0) return 'green'
    return RED.includes(n) ? 'red' : 'black'
  }

  const handleSpin = async () => {
    if (playing) return
    haptic('medium')
    setPlaying(true)
    setResult(null)
    setWin(null)
    setAmount(0)

    const res = await api.gameRoulette(userId, bet, betType) as any
    if (!res || res.error) {
      hapticError()
      alert(res?.error || 'Ошибка игры')
      setPlaying(false)
      return
    }

    const segAngle = 360 / 37
    const idx = WHEEL_ORDER.indexOf(res.result)
    const targetMod = (360 - (idx * segAngle + segAngle / 2)) % 360
    const baseRotation = rotationRef.current % 360

    let delta = targetMod - baseRotation
    if (delta < 0) delta += 360

    const fullSpins = 360 * 5
    const newRotation = rotationRef.current + fullSpins + delta
    setRotation(newRotation)
    rotationRef.current = newRotation

    await new Promise((r) => setTimeout(r, 5000))

    setResult(res.result)
    setResultColor(res.color)
    setWin(res.win)
    setAmount(res.amount)

    if (res.win) hapticSuccess()
    else hapticError()

    setPlaying(false)
  }

  const resetGame = () => {
    setResult(null)
    setWin(null)
    setAmount(0)
    setResultColor(null)
  }

  const fmtNumber = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const size = 280
  const center = size / 2
  const radius = center - 12
  const segAngle = 360 / 37

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  return (
    <div className="p-4 pb-24">
      <button onClick={onBack} className="text-casino-muted mb-4 text-xs tracking-widest uppercase">
        ← Назад
      </button>

      <Card>
        <div className="text-center py-3">
          <div className="font-display text-3xl tracking-widest text-casino-gold">РУЛЕТКА</div>
        </div>
      </Card>

      <div className="flex justify-center my-6 relative">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
          <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
            <path d="M10 26 L2 8 L18 8 Z" fill="#D4AF37" stroke="#8B6914" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="10" cy="6" r="4" fill="#D4AF37" stroke="#8B6914" strokeWidth="1"/>
          </svg>
        </div>

        <div
          className="rounded-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: playing ? 'transform 5s cubic-bezier(0.15, 0.8, 0.4, 0.99)' : 'none',
            filter: 'drop-shadow(0 0 25px rgba(212, 175, 55, 0.5))',
          }}
        >
          <svg width={size} height={size}>
            {WHEEL_ORDER.map((num, i) => {
              const startAngle = i * segAngle
              const endAngle = startAngle + segAngle
              const color = getColor(num)
              const fill =
                color === 'red' ? '#8B0000' :
                color === 'black' ? '#0F0F16' :
                '#2D6A4F'

              const p1 = polarToCartesian(center, center, radius, startAngle)
              const p2 = polarToCartesian(center, center, radius, endAngle)
              const path = [
                `M ${center} ${center}`,
                `L ${p1.x} ${p1.y}`,
                `A ${radius} ${radius} 0 0 1 ${p2.x} ${p2.y}`,
                'Z'
              ].join(' ')

              const textPos = polarToCartesian(center, center, radius * 0.82, startAngle + segAngle / 2)

              return (
                <g key={i}>
                  <path d={path} fill={fill} stroke="#D4AF37" strokeWidth="0.4" opacity="0.85" />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    fill="#E5E5E5"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="Inter, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${startAngle + segAngle / 2}, ${textPos.x}, ${textPos.y})`}
                  >
                    {num}
                  </text>
                </g>
              )
            })}

            <circle cx={center} cy={center} r={radius} fill="none" stroke="#D4AF37" strokeWidth="2.5" />
            <circle cx={center} cy={center} r={22} fill="#14141C" stroke="#D4AF37" strokeWidth="1.5" />
            <circle cx={center} cy={center} r={14} fill="#0A0A0F" />
            <circle cx={center} cy={center} r={6} fill="#D4AF37" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {result !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mb-4"
          >
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-xl font-display text-3xl ${
                resultColor === 'red' ? 'bg-[#8B0000] text-casino-text border-2 border-casino-redLight' :
                resultColor === 'black' ? 'bg-[#0F0F16] text-casino-text border-2 border-casino-border' :
                'bg-[#2D6A4F] text-casino-text border-2 border-casino-greenLight'
              }`}
            >
              {result}
            </div>
            <div className={`mt-3 font-display text-2xl tracking-wider ${win ? 'text-casino-greenLight' : 'text-casino-redLight'}`}>
              {win ? `+${fmtNumber(amount - bet)} TOKENS` : `-${fmtNumber(bet)} TOKENS`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!playing && result === null && (
        <>
          <Card className="mb-3">
            <div className="text-casino-muted text-[10px] mb-2 tracking-widest uppercase">Ставка</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {BET_OPTIONS.map((b) => (
                <button
                  key={b}
                  onClick={() => { haptic('light'); setBet(b) }}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-display text-sm tracking-wider ${
                    bet === b
                      ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg'
                      : 'bg-casino-bg border border-casino-border/60 text-casino-muted'
                  }`}
                >
                  {fmtNumber(b)}
                </button>
              ))}
            </div>
          </Card>

          <Card className="mb-3">
            <div className="text-casino-muted text-[10px] mb-2 tracking-widest uppercase">Куда ставим</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { haptic('light'); setBetType('red') }}
                className={`py-3 rounded-lg font-display text-sm tracking-wider flex items-center justify-center gap-2 ${
                  betType === 'red'
                    ? 'bg-[#8B0000] text-casino-text border-2 border-casino-redLight'
                    : 'bg-casino-bg border border-casino-red/40 text-casino-redLight'
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#C41E3A"/></svg>
                ×2
              </button>
              <button
                onClick={() => { haptic('light'); setBetType('black') }}
                className={`py-3 rounded-lg font-display text-sm tracking-wider flex items-center justify-center gap-2 ${
                  betType === 'black'
                    ? 'bg-[#0F0F16] text-casino-text border-2 border-casino-text'
                    : 'bg-casino-bg border border-casino-border text-casino-muted'
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#1A1A1A" stroke="#666"/></svg>
                ×2
              </button>
              <button
                onClick={() => { haptic('light'); setBetType('green') }}
                className={`py-3 rounded-lg font-display text-sm tracking-wider flex items-center justify-center gap-2 ${
                  betType === 'green'
                    ? 'bg-[#2D6A4F] text-casino-text border-2 border-casino-greenLight'
                    : 'bg-casino-bg border border-casino-green/40 text-casino-greenLight'
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#52B788"/></svg>
                ×36
              </button>
            </div>
          </Card>

          <button
            onClick={handleSpin}
            className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-4 rounded-xl text-xl tracking-widest active:scale-95 transition-transform shadow-gold"
          >
            КРУТИТЬ
          </button>
        </>
      )}

      {!playing && result !== null && (
        <button
          onClick={resetGame}
          className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-4 rounded-xl text-xl tracking-widest active:scale-95 transition-transform shadow-gold"
        >
          ЕЩЁ РАЗ
        </button>
      )}
    </div>
  )
}