import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../components/Card'
import { useTelegram } from '../../hooks/useTelegram'
import { api } from '../../api/client'

const BET_OPTIONS = [100, 500, 1000, 5000, 10000]
const LEVELS = [
  { id: 'easy', name: '🟢 Лёгкий', mines: 3 },
  { id: 'medium', name: '🟡 Средний', mines: 5 },
  { id: 'hard', name: '🔴 Хардкор', mines: 10 },
]

interface MinesProps {
  onBack: () => void
}

type Cell = { opened: boolean; mine: boolean; exploded: boolean }

export function Mines({ onBack }: MinesProps) {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState(1000)
  const [level, setLevel] = useState('easy')
  const [playing, setPlaying] = useState(false)
  const [field, setField] = useState<Cell[]>([])
  const [mult, setMult] = useState(1)
  const [result, setResult] = useState<{ win: boolean; amount: number } | null>(null)

  const startGame = async () => {
    haptic('medium')

    const res = await api.minesStart(userId, bet, level) as any
    if (!res || res.error) {
      hapticError()
      alert(res?.error || 'Ошибка старта')
      return
    }

    const newField: Cell[] = Array.from({ length: 25 }, () => ({
      opened: false,
      mine: false,
      exploded: false,
    }))

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
      // Проигрыш — открываем все мины
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
    <div className="p-4">
      <button onClick={onBack} className="text-casino-muted mb-4 text-sm">
        ← Назад к играм
      </button>

      <Card>
        <div className="text-center py-3">
          <div className="text-3xl font-bold text-casino-gold">💣 МИНЫ</div>
        </div>
      </Card>

      {/* Поле */}
      {playing && field.length > 0 && (
        <Card className="mt-4">
          <div className="grid grid-cols-5 gap-1.5 p-1">
            {field.map((cell, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => openCell(i)}
                disabled={cell.opened}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-colors ${
                  !cell.opened
                    ? 'bg-casino-bg border-2 border-casino-border hover:border-casino-gold'
                    : cell.mine
                    ? 'bg-red-600'
                    : 'bg-green-700'
                }`}
              >
                {cell.opened ? (cell.mine ? (cell.exploded ? '💥' : '💣') : '💎') : ''}
              </motion.button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="bg-casino-bg rounded-xl py-3">
              <div className="text-casino-muted text-xs">Множитель</div>
              <div className="text-casino-gold font-bold text-xl">×{mult.toFixed(2)}</div>
            </div>
            <div className="bg-casino-bg rounded-xl py-3">
              <div className="text-casino-muted text-xs">Забрать</div>
              <div className="text-casino-green font-bold text-xl">
                {fmtNumber(Math.floor(bet * mult))}
              </div>
            </div>
          </div>

          <button
            onClick={cashout}
            className="w-full mt-3 bg-gradient-to-r from-casino-green to-green-700 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform"
          >
            💰 ЗАБРАТЬ
          </button>
        </Card>
      )}

      {/* Результат */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          {result.win ? (
            <div className="text-2xl font-bold text-casino-green">
              🎉 +{fmtNumber(result.amount - bet)} 💎
            </div>
          ) : (
            <div className="text-2xl font-bold text-casino-red">
              💥 МИНА! -{fmtNumber(result.amount)} 💎
            </div>
          )}
        </motion.div>
      )}

      {/* Настройки */}
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
            <div className="text-casino-muted text-sm mb-2">🎯 Уровень:</div>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { haptic('light'); setLevel(l.id) }}
                  className={`py-3 rounded-xl font-bold text-xs ${
                    level === l.id ? 'bg-casino-gold text-black' : 'bg-casino-bg border border-casino-border text-casino-muted'
                  }`}
                >
                  {l.name}
                  <div className="text-[10px] mt-0.5">{l.mines} 💣</div>
                </button>
              ))}
            </div>
          </Card>

          <button
            onClick={startGame}
            className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-4 rounded-xl text-lg active:scale-95 transition-transform"
          >
            💣 НАЧАТЬ
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