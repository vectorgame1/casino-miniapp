import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../../components/Card'
import { useTelegram } from '../../hooks/useTelegram'

const BET_OPTIONS = [100, 500, 1000, 5000, 10000]

interface CoinProps {
  onBack: () => void
}

type Side = 'heads' | 'tails'

export function Coin({ onBack }: CoinProps) {
  const { haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState(1000)
  const [choice, setChoice] = useState<Side>('heads')
  const [playing, setPlaying] = useState(false)
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<Side | null>(null)
  const [win, setWin] = useState<boolean | null>(null)

  const handleFlip = async () => {
    if (playing) return
    haptic('medium')
    setPlaying(true)
    setResult(null)
    setWin(null)
    setFlipping(true)

    // Вращение 2 секунды
    await new Promise((r) => setTimeout(r, 2000))

    // Результат
    const r: Side = Math.random() < 0.5 ? 'heads' : 'tails'
    const isWin = r === choice

    setFlipping(false)
    setResult(r)
    setWin(isWin)

    if (isWin) hapticSuccess()
    else hapticError()

    setPlaying(false)
  }

  const fmtNumber = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const sideEmoji = (s: Side) => s === 'heads' ? '🦅' : '👑'
  const sideName = (s: Side) => s === 'heads' ? 'ОРЁЛ' : 'РЕШКА'

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-casino-muted mb-4 text-sm">
        ← Назад к играм
      </button>

      {/* Заголовок */}
      <Card>
        <div className="text-center py-3">
          <div className="text-3xl font-bold text-casino-gold">🪙 МОНЕТКА</div>
        </div>
      </Card>

      {/* Монетка */}
      <Card className="mt-4">
        <div className="py-12 flex justify-center items-center h-48">
          <motion.div
            animate={
              flipping
                ? { rotateY: [0, 360, 720, 1080, 1440], scale: [1, 1.3, 1.1, 1.3, 1] }
                : { rotateY: 0, scale: 1 }
            }
            transition={flipping ? { duration: 2, ease: 'easeInOut' } : { duration: 0.3 }}
            className="w-32 h-32 rounded-full flex items-center justify-center text-7xl"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
              boxShadow: '0 10px 40px rgba(255, 215, 0, 0.5), inset 0 0 20px rgba(184, 134, 11, 0.5)',
              transformStyle: 'preserve-3d',
            }}
          >
            {flipping ? '🪙' : result ? sideEmoji(result) : '🪙'}
          </motion.div>
        </div>
      </Card>

      {/* Результат */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <div className="text-2xl font-bold">
            🎯 Выпало: <span className="text-casino-gold">{sideName(result)} {sideEmoji(result)}</span>
          </div>
          <div className={`mt-3 text-xl font-bold ${win ? 'text-casino-green' : 'text-casino-red'}`}>
            {win ? `🎉 +${fmtNumber(bet * 2)} 💎` : `😢 -${fmtNumber(bet)} 💎`}
          </div>
        </motion.div>
      )}

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
          onClick={() => { setResult(null); setWin(null) }}
          className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-4 rounded-xl text-lg active:scale-95 transition-transform"
        >
          🔄 ЕЩЁ РАЗ
        </button>
      )}
    </div>
  )
}