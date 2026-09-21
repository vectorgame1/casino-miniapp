import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../components/Card'
import { useTelegram } from '../../hooks/useTelegram'

// ═══════ Цвета и данные рулетки ═══════
const RED = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
const BLACK = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35]

// Европейская рулетка: 37 чисел. Порядок по колесу (стандартный):
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
  const { haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState(1000)
  const [betType, setBetType] = useState<BetType>('red')
  const [playing, setPlaying] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<number | null>(null)
  const [win, setWin] = useState<boolean | null>(null)
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

    // 1. Выбираем число результата
    const resultNumber = Math.floor(Math.random() * 37)
    const color = getColor(resultNumber)
    const isWin =
      (betType === 'red' && color === 'red') ||
      (betType === 'black' && color === 'black') ||
      (betType === 'green' && color === 'green')

    // 2. Определяем угол для выигрышного числа
    const segAngle = 360 / 37
    const idx = WHEEL_ORDER.indexOf(resultNumber)
    // Мы хотим, чтобы число оказалось под маркером (сверху, т.е. -90° от начала)
    // Колесо вращается по часовой стрелке
    const targetAngle = 360 * 5 + (360 - idx * segAngle) - segAngle / 2

    // 3. Вращаем
    const startRotation = rotationRef.current
    const newRotation = startRotation + targetAngle

    setRotation(newRotation)
    rotationRef.current = newRotation

    // 4. Ждём окончания анимации (5 сек)
    await new Promise((r) => setTimeout(r, 5000))

    // 5. Показываем результат
    setResult(resultNumber)
    setWin(isWin)
    if (isWin) hapticSuccess()
    else hapticError()
    setPlaying(false)
  }

  const fmtNumber = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  // ═══════ Отрисовка колеса через SVG ═══════
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

      {/* Заголовок */}
      <Card>
        <div className="text-center py-3">
          <div className="text-3xl font-bold text-casino-gold">🎡 РУЛЕТКА</div>
        </div>
      </Card>

      {/* Колесо */}
      <div className="flex justify-center my-6 relative">
        {/* Маркер сверху */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-3xl">
          ▼
        </div>

        <div
          className="rounded-full shadow-2xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: playing ? 'transform 5s cubic-bezier(0.17, 0.67, 0.4, 0.99)' : 'none',
            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
          }}
        >
          <svg width={size} height={size}>
            {/* Секторы */}
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
              const largeArc = segAngle > 180 ? 1 : 0
              const path = [
                `M ${center} ${center}`,
                `L ${p1.x} ${p1.y}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
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

            {/* Внешнее кольцо */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#FFD700" strokeWidth="3" />

            {/* Центр */}
            <circle cx={center} cy={center} r={20} fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
            <circle cx={center} cy={center} r={12} fill="#B8860B" />
          </svg>
        </div>
      </div>

      {/* Результат */}
      {result !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-4"
        >
          <div
            className={`inline-block px-6 py-3 rounded-2xl font-bold text-2xl ${
              getColor(result) === 'red' ? 'bg-red-600' :
              getColor(result) === 'black' ? 'bg-gray-900 border-2 border-white' :
              'bg-green-600'
            }`}
          >
            {result}
          </div>
          <div className={`mt-3 text-xl font-bold ${win ? 'text-casino-green' : 'text-casino-red'}`}>
            {win
              ? `🎉 +${fmtNumber(bet * (betType === 'green' ? 36 : 2))} 💎`
              : `😢 -${fmtNumber(bet)} 💎`}
          </div>
        </motion.div>
      )}

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
          onClick={() => { setResult(null); setWin(null) }}
          className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-4 rounded-xl text-lg active:scale-95 transition-transform"
        >
          🔄 ЕЩЁ РАЗ
        </button>
      )}
    </div>
  )
}