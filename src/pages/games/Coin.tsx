import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../../components/Card'
import { useTelegram } from '../../hooks/useTelegram'
import { api } from '../../api/client'

const BET_OPTIONS = [100, 500, 1000, 5000, 10000]

interface CoinProps {
  onBack: () => void
}

type Side = 'heads' | 'tails'

export function Coin({ onBack }: CoinProps) {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState(1000)
  const [choice, setChoice] = useState<Side>('heads')
  const [playing, setPlaying] = useState(false)
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<Side | null>(null)
  const [win, setWin] = useState<boolean | null>(null)
  const [amount, setAmount] = useState(0)

  const handleFlip = async () => {
    if (playing) return
    haptic('medium')
    setPlaying(true)
    setResult(null)
    setWin(null)
    setAmount(0)
    setFlipping(true)

    // Запрос к API (параллельно с анимацией)
    const apiPromise = api.gameCoin(userId, bet, choice) as Promise<any>

    // Анимация 2.5 сек
    await new Promise((r) => setTimeout(r, 2500))

    const res = await apiPromise
    if (!res || res.error) {
      hapticError()
      alert(res?.error || 'Ошибка игры')
      setFlipping(false)
      setPlaying(false)
      return
    }

    setFlipping(false)
    setResult(res.result)
    setWin(res.win)
    setAmount(res.amount)

    if (res.win) hapticSuccess()
    else hapticError()

    setPlaying(false)
  }

  const reset = () => {
    setResult(null)
    setWin(null)
    setAmount(0)
  }

  const fmtNumber = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')
  const sideName = (s: Side) => s === 'heads' ? 'ОРЁЛ' : 'РЕШКА'
  const sideEmoji = (s: Side) => s === 'heads' ? '🦅' : '👑'

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-casino-muted mb-4 text-sm">
        ← Назад к играм
      </button>

      <Card>
        <div className="text-center py-3">
          <div className="text-3xl font-bold text-casino-gold">🪙 МОНЕТКА</div>
        </div>
      </Card>

      {/* 3D-Монетка */}
      <Card className="mt-4">
        <div className="py-12 flex justify-center items-center h-56 relative">
          {/* Свечение позади монеты */}
          <div
            className="absolute w-40 h-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />

          {/* Монета */}
          <motion.div
            animate={
              flipping
                ? {
                    rotateY: [0, 360, 720, 1080, 1440],
                    scale: [1, 1.4, 1.1, 1.4, 1],
                  }
                : { rotateY: 0, scale: 1 }
            }
            transition={
              flipping
                ? { duration: 2.5, ease: 'easeInOut' }
                : { duration: 0.3 }
            }
            className="w-36 h-36 rounded-full flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, #FFE066 0%, #FFD700 20%, #FFA500 50%, #FFD700 80%, #FFE066 100%)',
              boxShadow:
                'inset -8px -8px 20px rgba(184,134,11,0.7), inset 8px 8px 20px rgba(255,255,255,0.5), 0 10px 40px rgba(255,215,0,0.6)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Внутреннее кольцо */}
            <div
              className="absolute inset-3 rounded-full"
              style={{
                border: '2px solid rgba(184,134,11,0.6)',
                boxShadow: 'inset 0 0 10px rgba(184,134,11,0.4)',
              }}
            />

            {/* Значок на монете */}
            <div className="text-7xl relative z-10">
              {flipping ? '🪙' : result ? sideEmoji(result) : '🪙'}
            </div>

            {/* Блик сверху */}
            <div
              className="absolute top-3 left-6 w-10 h-10 rounded-full opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)',
                filter: 'blur(4px)',
              }}
            />
          </motion.div>
        </div>
      </Card>

      {/* Результат */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <div className="text-3xl font-bold mb-2">
              🎯 {sideName(result)} {sideEmoji(result)}
            </div>
            <div className={`text-xl font-bold ${win ? 'text-casino-green' : 'text-casino-red'}`}>
              {win ? `🎉 +${fmtNumber(amount - bet)} 💎` : `😢 -${fmtNumber(bet)} 💎`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ставки */}
      {!playing && !result && (
        <>
          <Card className="mt-4">
            <div className="text-casino-muted text-sm mb-2">💰 Ставка:</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {BET_OPTIONS.map((b) => (
                <button
                  key={b}
                  onClick={() => { haptic('light'); setBet(b) }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm ${
                    bet === b ? 'bg-casino-gold text-black' : 'bg-casino-bg border border-casino-border text-casino-muted'
                  }`}
                >
                  {fmtNumber(b)}
                </button>
              ))}
            </div>
          </Card>

          <Card className="mt-3">
            <div className="text-casino-muted text-sm mb-2">🎯 Твой выбор:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { haptic('light'); setChoice('heads') }}
                className={`py-4 rounded-xl font-bold ${
                  choice === 'heads' ? 'bg-casino-gold text-black' : 'bg-casino-bg border border-casino-border text-casino-muted'
                }`}
              >
                🦅 ОРЁЛ
              </button>
              <button
                onClick={() => { haptic('light'); setChoice('tails') }}
                className={`py-4 rounded-xl font-bold ${
                  choice === 'tails' ? 'bg-casino-gold text-black' : 'bg-casino-bg border border-casino-border text-casino-muted'
                }`}
              >
                👑 РЕШКА
              </button>
            </div>
          </Card>

          <button
            onClick={handleFlip}
            className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-4 rounded-xl text-lg active:scale-95 transition-transform"
          >
            🪙 БРОСИТЬ
          </button>
        </>
      )}

      {!playing && result && (
        <button
          onClick={reset}
          className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-4 rounded-xl text-lg active:scale-95 transition-transform"
        >
          🔄 ЕЩЁ РАЗ
        </button>
      )}
    </div>
  )
}