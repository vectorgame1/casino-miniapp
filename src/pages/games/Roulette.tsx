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

    // Запрос к API
    const res = await api.gameRoulette(userId, bet, betType) as any
    if (!res || res.error) {
      hapticError()
      alert(res?.error || 'Ошибка игры')
      setPlaying(false)
      return
    }

    // Определяем угол для выигрышного числа
    const segAngle = 360 / 37
    const idx = WHEEL_ORDER.indexOf(res.result)
    const targetAngle = 360 * 5 + (360 - idx * segAngle) - segAngle / 2

    const newRotation = rotationRef.current + targetAngle
    setRotation(newRotation)
    rotationRef.current = newRotation

    // Ждём анимацию (5 сек)
    await new Promise((r) => setTimeout(r, 5000))

    // Показываем результат
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

  // SVG-колесо
  const size = 280
  const center = size / 2
  const radius = center - 10
  const segAngle = 360 / 37

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-casino-muted mb-4 text-sm">
        ← Назад к играм
      </button>

      <Card>
        <div className="text-center py-3">
          <div className="text-3xl font-bold text-casino-gold">🎡 РУЛЕТКА</div>
        </div>
      </Card>

      {/* SVG-колесо */}
      <div className="flex justify-center my-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-3xl text-casino-gold">
          ▼
        </div>

        <div
          className="rounded-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: playing ? 'transform 5s cubic-bezier(0.17, 0.67, 0.4, 0.99)' : 'none',
            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))',
          }}
        >
          <svg width={size} height={size}>
            {WHEEL_ORDER.map((num, i) => {
              const startAngle = i * segAngle
              const endAngle = startAngle + segAngle
              const color = getColor(num)
              const fill =
                color === 'red' ? '#DC143C' :
                color === 'black' ? '#1A1A1A' :
                '#00A650'

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
                  <path d={path} fill={fill} stroke="#FFD700" strokeWidth="0.5" />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${startAngle + segAngle / 2}, ${textPos.x}, ${textPos.y})`}
                  >
                    {num}
                  </text>
                </g>
              )
            })}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#FFD700" strokeWidth="3" />
            <circle cx={center} cy={center} r={20} fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
            <circle cx={center} cy={center} r={12} fill="#B8860B" />
          </svg>
        </div>
      </div>

      {/* Результат */}
      <AnimatePresence>
        {result !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-4"
          >
            <div
              className={`inline-block px-6 py-3 rounded-2xl font-bold text-2xl ${
                resultColor === 'red' ? 'bg-red-600' :
                resultColor === 'black' ? 'bg-gray-900 border-2 border-white' :
                'bg-green-600'
              }`}
            >
              {result}
            </div>
            <div className={`mt-3 text-xl font-bold ${win ? 'text-casino-green' : 'text-casino-red'}`}>
              {win
                ? `🎉 +${fmtNumber(amount - bet)} 💎`
                : `😢 -${fmtNumber(bet)} 💎`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ставки */}
      {!playing && result === null && (
        <>
          <Card className="mb-3">
            <div className="text-casino-muted text-sm mb-2">💰 Ставка:</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {BET_OPTIONS.map((b) => (
                <button
                  key={b}
                  onClick={() => { haptic('light'); setBet(b) }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm ${
                    bet === b
                      ? 'bg-casino-gold text-black'
                      : 'bg-casino-bg border border-casino-border text-casino-muted'
                  }`}
                >
                  {fmtNumber(b)}
                </button>
              ))}
            </div>
          </Card>

          <Card className="mb-3">
            <div className="text-casino-muted text-sm mb-2">🎯 Куда ставим:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { haptic('light'); setBetType('red') }}
                className={`py-3 rounded-xl font-bold text-sm ${
                  betType === 'red' ? 'bg-red-600 text-white' : 'bg-casino-bg border border-red-600 text-red-500'
                }`}
              >
                🔴 ×2
              </button>
              <button
                onClick={() => { haptic('light'); setBetType('black') }}
                className={`py-3 rounded-xl font-bold text-sm ${
                  betType === 'black' ? 'bg-gray-900 text-white border-2 border-white' : 'bg-casino-bg border border-gray-600 text-gray-300'
                }`}
              >
                ⚫ ×2
              </button>
              <button
                onClick={() => { haptic('light'); setBetType('green') }}
                className={`py-3 rounded-xl font-bold text-sm ${
                  betType === 'green' ? 'bg-green-600 text-white' : 'bg-casino-bg border border-green-600 text-green-500'
                }`}
              >
                🟢 ×36
              </button>
            </div>
          </Card>

          <button
            onClick={handleSpin}
            className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-4 rounded-xl text-lg active:scale-95 transition-transform"
          >
            🎡 КРУТИТЬ
          </button>
        </>
      )}

      {!playing && result !== null && (
        <button
          onClick={resetGame}
          className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-4 rounded-xl text-lg active:scale-95 transition-transform"
        >
          🔄 ЕЩЁ РАЗ
        </button>
      )}
    </div>
  )
}