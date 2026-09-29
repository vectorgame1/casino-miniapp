import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../../components/Card'
import { BetInput } from '../../components/BetInput'
import { useTelegram } from '../../hooks/useTelegram'
import { api } from '../../api/client'

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣']

interface SlotsProps {
  onBack: () => void
}

export function Slots({ onBack }: SlotsProps) {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState(1000)
  const [balance, setBalance] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [reels, setReels] = useState<string[]>(['❓', '❓', '❓'])
  const [stopped, setStopped] = useState<boolean[]>([false, false, false])
  const [result, setResult] = useState<{ win: boolean; amount: number; mult: number } | null>(null)

  useEffect(() => {
    if (!userId) return
    api.getBalance(userId).then((res: any) => {
      if (res?.balance !== undefined) setBalance(Number(res.balance))
    })
  }, [userId])

  const spinOne = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]

  const handleSpin = async () => {
    if (playing) return
    if (bet > balance && balance > 0) {
      hapticError()
      alert('Недостаточно средств')
      return
    }
    haptic('medium')
    setPlaying(true)
    setResult(null)
    setStopped([false, false, false])

    for (let i = 0; i < 5; i++) {
      setReels([spinOne(), spinOne(), spinOne()])
      await new Promise((r) => setTimeout(r, 130))
    }

    const res = await api.gameSlots(userId, bet) as any
    if (!res || res.error) {
      hapticError()
      alert(res?.error || 'Ошибка игры')
      setPlaying(false)
      return
    }

    const final = res.reels || ['🍒', '🍒', '🍒']

    setReels([final[0], spinOne(), spinOne()])
    setStopped([true, false, false])
    await new Promise((r) => setTimeout(r, 400))

    setReels([final[0], final[1], spinOne()])
    setStopped([true, true, false])
    await new Promise((r) => setTimeout(r, 400))

    setReels([final[0], final[1], final[2]])
    setStopped([true, true, true])
    await new Promise((r) => setTimeout(r, 300))

    setResult({ win: res.win, amount: res.amount, mult: res.win ? (res.mult || 0) : 0 })

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

  const symbolColor = (s: string) => {
    if (s === '💎') return 'from-cyan-500/20 to-blue-500/20 border-cyan-400/60'
    if (s === '7️⃣') return 'from-red-500/20 to-pink-500/20 border-casino-redLight/60'
    return 'from-casino-gold/10 to-casino-gold2/10 border-casino-gold/40'
  }

  return (
    <div className="p-4 pb-24">
      <button onClick={onBack} className="text-casino-muted mb-4 text-[10px] tracking-widest uppercase">
        ← Назад
      </button>

      <Card>
        <div className="text-center py-3">
          <div className="font-display text-3xl tracking-widest text-casino-gold">СЛОТЫ</div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="py-8">
          <div className="flex justify-center gap-3">
            {reels.map((symbol, i) => (
              <motion.div
                key={i}
                animate={{ scale: stopped[i] ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className={`w-20 h-24 rounded-xl flex items-center justify-center text-5xl bg-gradient-to-br ${
                  stopped[i] ? symbolColor(symbol) : 'from-casino-bg to-casino-card border-casino-border'
                } border-2`}
                style={{
                  boxShadow: stopped[i] ? '0 0 20px rgba(212, 175, 55, 0.3)' : 'none',
                }}
              >
                {symbol}
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            {result.win ? (
              <>
                <div className="font-display text-2xl tracking-widest text-casino-greenLight">ВЫИГРЫШ</div>
                <div className="font-display text-3xl tracking-wider text-casino-gold mt-2">
                  +{fmtNumber(result.amount - bet)} TOKENS
                </div>
              </>
            ) : (
              <>
                <div className="font-display text-2xl tracking-widest text-casino-redLight">ПРОИГРЫШ</div>
                <div className="font-display text-xl text-casino-muted mt-2">
                  -{fmtNumber(bet)} TOKENS
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!playing && !result && (
        <>
          <Card className="mt-4">
            <BetInput
              bet={bet}
              setBet={setBet}
              balance={balance}
              minBet={10}
              gameLabel="Ставка"
            />
          </Card>

          <button
            onClick={handleSpin}
            className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-4 rounded-xl text-xl tracking-widest active:scale-95 transition-transform shadow-gold"
          >
            КРУТИТЬ
          </button>
        </>
      )}

      {!playing && result && (
        <button
          onClick={reset}
          className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-4 rounded-xl text-xl tracking-widest active:scale-95 transition-transform shadow-gold"
        >
          ЕЩЁ РАЗ
        </button>
      )}

      <Card className="mt-4 bg-casino-bg">
        <div className="text-casino-muted text-[10px]">
          <div className="font-display tracking-widest mb-2 text-casino-gold">ВЫИГРЫШИ</div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <div>🍒×3 → ×10</div>
            <div>🍋×3 → ×15</div>
            <div>🍊×3 → ×20</div>
            <div>🍇×3 → ×25</div>
            <div>💎×3 → ×50</div>
            <div>7️⃣×3 → ×100</div>
            <div className="col-span-2 text-casino-gold mt-1 tracking-widest">2 в ряд → ×2</div>
          </div>
        </div>
      </Card>
    </div>
  )
}