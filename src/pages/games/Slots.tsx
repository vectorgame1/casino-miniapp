import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../components/Card'
import { useTelegram } from '../../hooks/useTelegram'
import { api } from '../../api/client'

const BET_OPTIONS = [100, 500, 1000, 5000, 10000]
const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣']
const MULTIPLIERS = {
  '🍒': 10,
  '🍋': 15,
  '🍊': 20,
  '🍇': 25,
  '💎': 50,
  '7️⃣': 100,
}

interface SlotsProps {
  onBack: () => void
}

export function Slots({ onBack }: SlotsProps) {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState(1000)
  const [playing, setPlaying] = useState(false)
  const [reels, setReels] = useState<string[]>(['❓', '❓', '❓'])
  const [stopped, setStopped] = useState<boolean[]>([false, false, false])
  const [result, setResult] = useState<{ win: boolean; amount: number; mult: number } | null>(null)

  const spinOne = (): string => {
    const idx = Math.floor(Math.random() * SYMBOLS.length)
    return SYMBOLS[idx]
  }

  const getMultiplier = (symbol: string): number => {
    if (symbol === '🍒') return MULTIPLIERS['🍒']
    if (symbol === '🍋') return MULTIPLIERS['🍋']
    if (symbol === '🍊') return MULTIPLIERS['🍊']
    if (symbol === '🍇') return MULTIPLIERS['🍇']
    if (symbol === '💎') return MULTIPLIERS['💎']
    if (symbol === '7️⃣') return MULTIPLIERS['7️⃣']
    return 10
  }

  const handleSpin = async () => {
    if (playing) return
    haptic('medium')
    setPlaying(true)
    setResult(null)
    setStopped([false, false, false])

    // Фаза 1: все крутятся
    for (let i = 0; i < 5; i++) {
      setReels([spinOne(), spinOne(), spinOne()])
      await new Promise((r) => setTimeout(r, 150))
    }

    // Запрос к API
    const res = await api.gameSlots(userId, bet) as any
    if (!res || res.error) {
      hapticError()
      alert(res?.error || 'Ошибка игры')
      setPlaying(false)
      return
    }

    const final: string[] = res.reels || ['🍒', '🍒', '🍒']

    // Останавливаем по одному
    setReels([final[0], spinOne(), spinOne()])
    setStopped([true, false, false])
    await new Promise((r) => setTimeout(r, 400))

    setReels([final[0], final[1], spinOne()])
    setStopped([true, true, false])
    await new Promise((r) => setTimeout(r, 400))

    setReels([final[0], final[1], final[2]])
    setStopped([true, true, true])
    await new Promise((r) => setTimeout(r, 300))

    // Расчёт множителя
    let mult = 0
    if (final[0] === final[1] && final[1] === final[2]) {
      mult = getMultiplier(final[0])
    } else if (final[0] === final[1] || final[1] === final[2] || final[0] === final[2]) {
      mult = 2
    }

    setResult({ win: res.win, amount: res.amount, mult: res.win ? mult : 0 })

    if (res.win) hapticSuccess()
    else hapticError()

    setPlaying(false)
  }

  const fmtNumber = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const reset = () => {
    setResult(null)
    setReels(['❓', '❓', '❓'])
    setStopped([false, false, false])
  }

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-casino-muted mb-4 text-sm">
        ← Назад к играм
      </button>

      <Card>
        <div className="text-center py-3">
          <div className="text-3xl font-bold text-casino-gold">🎰 СЛОТЫ</div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="py-8">
          <div className="flex justify-center gap-2">
            {reels.map((symbol, i) => (
              <motion.div
                key={i}
                animate={{ scale: stopped[i] ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className={`w-20 h-24 bg-casino-bg border-2 rounded-xl flex items-center justify-center text-5xl ${
                  stopped[i] ? 'border-casino-gold' : 'border-casino-border'
                }`}
              >
                {symbol}
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          {result.win ? (
            <>
              <div className="text-2xl font-bold text-casino-green">🎉 ВЫИГРЫШ!</div>
              <div className="text-casino-gold text-xl font-bold mt-2">
                +{fmtNumber(result.amount - bet)} 💎
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-casino-red">😢 Проигрыш</div>
              <div className="text-casino-muted mt-2">-{fmtNumber(bet)} 💎</div>
            </>
          )}
        </motion.div>
      )}

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

          <button
            onClick={handleSpin}
            className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-4 rounded-xl text-lg active:scale-95 transition-transform"
          >
            🎰 КРУТИТЬ
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

      <Card className="mt-4 bg-casino-bg">
        <div className="text-casino-muted text-xs">
          <div className="font-bold mb-2">🎁 ВЫИГРЫШИ:</div>
          <div className="grid grid-cols-2 gap-1">
            <div>🍒×3 → ×10</div>
            <div>🍋×3 → ×15</div>
            <div>🍊×3 → ×20</div>
            <div>🍇×3 → ×25</div>
            <div>💎×3 → ×50</div>
            <div>7️⃣×3 → ×100</div>
            <div className="col-span-2 text-casino-gold mt-1">2 в ряд → ×2</div>
          </div>
        </div>
      </Card>
    </div>
  )
}