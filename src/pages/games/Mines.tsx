import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../../components/Card'
import { BetInput } from '../../components/BetInput'
import { useTelegram } from '../../hooks/useTelegram'
import { api } from '../../api/client'

const LEVELS = [
  { id: 'easy', name: 'ЛЁГКИЙ', mines: 3 },
  { id: 'medium', name: 'СРЕДНИЙ', mines: 5 },
  { id: 'hard', name: 'ХАРДКОР', mines: 10 },
]

interface MinesProps {
  onBack: () => void
}

type Cell = { opened: boolean; mine: boolean; exploded: boolean }

export function Mines({ onBack }: MinesProps) {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState(1000)
  const [balance, setBalance] = useState(0)
  const [level, setLevel] = useState('easy')
  const [playing, setPlaying] = useState(false)
  const [field, setField] = useState<Cell[]>([])
  const [mult, setMult] = useState(1)
  const [result, setResult] = useState<{ win: boolean; amount: number } | null>(null)

  useEffect(() => {
    if (!userId) return
    api.getBalance(userId).then((res: any) => {
      if (res?.balance !== undefined) setBalance(Number(res.balance))
    })
  }, [userId])

  const startGame = async () => {
    if (bet > balance && balance > 0) {
      hapticError()
      alert('Недостаточно средств')
      return
    }
    haptic('medium')
    const res = await api.minesStart(userId, bet, level) as any
    if (!res || res.error) {
      hapticError()
      alert(res?.error || 'Ошибка старта')
      return
    }
    const newField: Cell[] = Array.from({ length: 25 }, () => ({ opened: false, mine: false, exploded: false }))
    setField(newField)
    setPlaying(true)
    setMult(1)
    setResult(null)
  }

  const openCell = async (index: number) => {
    if (!playing || field[index].opened) return
    haptic('light')

    const res = await api.minesOpen(userId, index) as any
    if (!res || res.error) {
      hapticError()
      alert(res?.error || 'Ошибка')
      return
    }

    const newField = [...field]
    newField[index] = { ...newField[index], opened: true, mine: res.mine, exploded: res.mine }
    setField(newField)

    if (res.mine) {
      if (res.mines) {
        res.mines.forEach((mIdx: number) => {
          if (newField[mIdx]) newField[mIdx].opened = true
        })
        setField(newField)
      }
      setPlaying(false)
      setResult({ win: false, amount: bet })
      hapticError()
      return
    }

    setMult(res.mult)

    if (res.cashout_auto) {
      setPlaying(false)
      setResult({ win: true, amount: res.amount })
      hapticSuccess()
    }
  }

  const cashout = async () => {
    if (!playing) return
    haptic('medium')
    const res = await api.minesCashout(userId) as any
    if (!res || res.error) {
      hapticError()
      alert(res?.error || 'Ошибка')
      return
    }
    hapticSuccess()
    setPlaying(false)
    setResult({ win: true, amount: res.amount })
  }

  const reset = () => {
    setResult(null)
    setField([])
    setMult(1)
  }

  const fmtNumber = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  return (
    <div className="p-4 pb-24">
      <button onClick={onBack} className="text-casino-muted mb-4 text-[10px] tracking-widest uppercase">
        ← Назад
      </button>

      <Card>
        <div className="text-center py-3">
          <div className="font-display text-3xl tracking-widest text-casino-gold">МИНЫ</div>
        </div>
      </Card>

      {playing && field.length > 0 && (
        <Card className="mt-4">
          <div className="grid grid-cols-5 gap-1.5 p-1">
            {field.map((cell, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => openCell(i)}
                disabled={cell.opened}
                className={`aspect-square rounded-lg flex items-center justify-center transition-colors border-2 ${
                  !cell.opened
                    ? 'bg-casino-bg border-casino-border/60 hover:border-casino-gold'
                    : cell.mine
                    ? 'bg-[#8B0000] border-casino-redLight'
                    : 'bg-[#2D6A4F] border-casino-greenLight'
                }`}
              >
                {cell.opened && (
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.3 }}>
                    {cell.mine ? (
                      cell.exploded ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#E5E5E5">
                          <path d="M12 2 L14 9 L21 7 L16 12 L21 17 L14 15 L12 22 L10 15 L3 17 L8 12 L3 7 L10 9 Z" />
                        </svg>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#E5E5E5">
                          <circle cx="12" cy="14" r="7" />
                          <path d="M12 4 L12 7 M8 6 L9 8 M16 6 L15 8" stroke="#E5E5E5" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#52B788">
                        <path d="M6 3 H18 L22 9 L12 21 L2 9 Z" />
                        <path d="M2 9 H22 M12 21 L9 9 L12 3 L15 9 L12 21" stroke="#0A0A0F" strokeWidth="0.5" fill="none" />
                      </svg>
                    )}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="bg-casino-bg rounded-xl py-3 border border-casino-border/40">
              <div className="text-casino-muted text-[9px] tracking-widest uppercase">Множитель</div>
              <div className="text-casino-gold font-display text-xl tracking-wider">×{mult.toFixed(2)}</div>
            </div>
            <div className="bg-casino-bg rounded-xl py-3 border border-casino-border/40">
              <div className="text-casino-muted text-[9px] tracking-widest uppercase">Забрать</div>
              <div className="text-casino-greenLight font-display text-xl tracking-wider">
                {fmtNumber(Math.floor(bet * mult))}
              </div>
            </div>
          </div>

          <button
            onClick={cashout}
            className="w-full mt-3 bg-gradient-to-r from-casino-green to-casino-greenLight text-casino-bg font-display py-3 rounded-xl text-lg tracking-widest active:scale-95"
          >
            ЗАБРАТЬ
          </button>
        </Card>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center">
            {result.win ? (
              <div className="font-display text-2xl tracking-wider text-casino-greenLight">
                +{fmtNumber(result.amount - bet)} TOKENS
              </div>
            ) : (
              <div className="font-display text-2xl tracking-wider text-casino-redLight">
                МИНА! -{fmtNumber(result.amount)} TOKENS
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!playing && !result && (
        <>
          <Card className="mt-4">
            <BetInput bet={bet} setBet={setBet} balance={balance} minBet={10} gameLabel="Ставка" />
          </Card>

          <Card className="mt-3">
            <div className="text-casino-muted text-[10px] mb-2 tracking-widest uppercase">Уровень</div>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { haptic('light'); setLevel(l.id) }}
                  className={`py-3 rounded-lg font-display text-[10px] tracking-wider ${
                    level === l.id ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg' : 'bg-casino-bg border border-casino-border/60 text-casino-muted'
                  }`}
                >
                  {l.name}
                  <div className="text-[9px] mt-0.5">{l.mines} МИН</div>
                </button>
              ))}
            </div>
          </Card>

          <button
            onClick={startGame}
            className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-4 rounded-xl text-xl tracking-widest active:scale-95 shadow-gold"
          >
            НАЧАТЬ
          </button>
        </>
      )}

      {!playing && result && (
        <button
          onClick={reset}
          className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-4 rounded-xl text-xl tracking-widest active:scale-95 shadow-gold"
        >
          ЕЩЁ РАЗ
        </button>
      )}
    </div>
  )
}