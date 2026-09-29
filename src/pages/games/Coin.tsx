import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../../components/Card'
import { BetInput } from '../../components/BetInput'
import { useTelegram } from '../../hooks/useTelegram'
import { api } from '../../api/client'

interface CoinProps {
  onBack: () => void
}

type Side = 'heads' | 'tails'

export function Coin({ onBack }: CoinProps) {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState(1000)
  const [balance, setBalance] = useState(0)
  const [choice, setChoice] = useState<Side>('heads')
  const [playing, setPlaying] = useState(false)
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<Side | null>(null)
  const [win, setWin] = useState<boolean | null>(null)
  const [amount, setAmount] = useState(0)

  useEffect(() => {
    if (!userId) return
    api.getBalance(userId).then((res: any) => {
      if (res?.balance !== undefined) setBalance(Number(res.balance))
    })
  }, [userId])

  const handleFlip = async () => {
    if (playing) return
    if (bet > balance && balance > 0) {
      hapticError()
      alert('Недостаточно средств')
      return
    }
    haptic('medium')
    setPlaying(true)
    setResult(null)
    setWin(null)
    setAmount(0)
    setFlipping(true)

    const apiPromise = api.gameCoin(userId, bet, choice) as Promise<any>
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

  return (
    <div className="p-4 pb-24">
      <button onClick={onBack} className="text-casino-muted mb-4 text-[10px] tracking-widest uppercase">
        ← Назад
      </button>

      <Card>
        <div className="text-center py-3">
          <div className="font-display text-3xl tracking-widest text-casino-gold">МОНЕТКА</div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="py-12 flex justify-center items-center h-56 relative">
          <div
            className="absolute w-40 h-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />

          <motion.div
            animate={
              flipping
                ? { rotateY: [0, 360, 720, 1080, 1440], scale: [1, 1.4, 1.1, 1.4, 1] }
                : { rotateY: 0, scale: 1 }
            }
            transition={flipping ? { duration: 2.5, ease: 'easeInOut' } : { duration: 0.3 }}
            className="w-36 h-36 rounded-full flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, #E8C860 0%, #D4AF37 25%, #B8941F 50%, #D4AF37 75%, #E8C860 100%)',
              boxShadow:
                'inset -8px -8px 20px rgba(139,105,20,0.7), inset 8px 8px 20px rgba(255,255,255,0.3), 0 10px 40px rgba(212,175,55,0.5)',
              transformStyle: 'preserve-3d',
            }}
          >
            <div
              className="absolute inset-3 rounded-full"
              style={{ border: '2px solid rgba(139,105,20,0.6)', boxShadow: 'inset 0 0 10px rgba(139,105,20,0.4)' }}
            />

            <div className="text-6xl relative z-10 font-display text-casino-bg">
              {flipping ? (
                '◉'
              ) : result ? (
                result === 'heads' ? (
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="#0A0A0F">
                    <path d="M30 8 L38 22 L52 24 L42 34 L44 48 L30 42 L16 48 L18 34 L8 24 L22 22 Z" />
                  </svg>
                ) : (
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="#0A0A0F">
                    <path d="M10 30 L30 10 L50 30 L30 50 Z" />
                    <circle cx="30" cy="30" r="6" fill="#D4AF37" />
                  </svg>
                )
              ) : (
                <svg width="60" height="60" viewBox="0 0 60 60" fill="#0A0A0F">
                  <circle cx="30" cy="30" r="22" fill="none" stroke="#0A0A0F" strokeWidth="3" />
                  <circle cx="30" cy="30" r="8" fill="#0A0A0F" />
                </svg>
              )}
            </div>
          </motion.div>
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center">
            <div className="font-display text-2xl tracking-widest text-casino-text mb-2">
              {result === 'heads' ? 'ОРЁЛ' : 'РЕШКА'}
            </div>
            <div className={`font-display text-2xl tracking-wider ${win ? 'text-casino-greenLight' : 'text-casino-redLight'}`}>
              {win ? `+${fmtNumber(amount - bet)} TOKENS` : `-${fmtNumber(bet)} TOKENS`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!playing && !result && (
        <>
          <Card className="mt-4">
            <BetInput bet={bet} setBet={setBet} balance={balance} minBet={10} gameLabel="Ставка" />
          </Card>

          <Card className="mt-3">
            <div className="text-casino-muted text-[10px] mb-2 tracking-widest uppercase">Твой выбор</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { haptic('light'); setChoice('heads') }}
                className={`py-4 rounded-lg font-display text-sm tracking-wider ${
                  choice === 'heads' ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg' : 'bg-casino-bg border border-casino-border/60 text-casino-muted'
                }`}
              >
                ОРЁЛ
              </button>
              <button
                onClick={() => { haptic('light'); setChoice('tails') }}
                className={`py-4 rounded-lg font-display text-sm tracking-wider ${
                  choice === 'tails' ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg' : 'bg-casino-bg border border-casino-border/60 text-casino-muted'
                }`}
              >
                РЕШКА
              </button>
            </div>
          </Card>

          <button
            onClick={handleFlip}
            className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-4 rounded-xl text-xl tracking-widest active:scale-95 transition-transform shadow-gold"
          >
            БРОСИТЬ
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
    </div>
  )
}