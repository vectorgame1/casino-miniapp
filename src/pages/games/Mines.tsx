import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../../components/Card'
import { useTelegram } from '../../hooks/useTelegram'

const BET_OPTIONS = [100, 500, 1000, 5000, 10000]

const LEVELS = [
  { id: 'easy', name: '🟢 Лёгкий', mines: 3, step: 0.15 },
  { id: 'medium', name: '🟡 Средний', mines: 5, step: 0.25 },
  { id: 'hard', name: '🔴 Хардкор', mines: 10, step: 0.5 },
]

interface MinesProps {
  onBack: () => void
}

type Cell = { mine: boolean; opened: boolean; exploded: boolean }

export function Mines({ onBack }: MinesProps) {
  const { haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState(1000)
  const [level, setLevel] = useState('easy')
  const [playing, setPlaying] = useState(false)
  const [field, setField] = useState<Cell[]>([])
  const [mult, setMult] = useState(1)
  const [result, setResult] = useState<{ win: boolean; amount: number } | null>(null)

  const currentLevel = LEVELS.find((l) => l.id === level)!

  const startGame = () => {
    haptic('medium')
    const minesCount = currentLevel.mines
    const positions = Array.from({ length: 25 }, (_, i) => i)
    // Перемешиваем
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }
    const minePositions = new Set(positions.slice(0, minesCount))

    const newField: Cell[] = Array.from({ length: 25 }, (_, i) => ({
      mine: minePositions.has(i),
      opened: false,
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

    const cell = field[index]
    const newField = [...field]
    newField[index] = { ...cell, opened: true }

    if (cell.mine) {
      // Проигрыш
      newField[index].exploded = true
      setField(newField)
      setPlaying(false)
      setResult({ win: false, amount: bet })
      hapticError()
      return
    }

    // Открыл безопасную
    const openedCount = newField.filter((c) => c.opened && !c.mine).length
    const newMult = 1 + openedCount * currentLevel.step

    setField(newField)
    setMult(newMult)

    // Все безопасные открыты?
    const safeCells = 25 - currentLevel.mines
    if (openedCount === safeCells) {
      setPlaying(false)
      setResult({ win: true, amount: Math.floor(bet * newMult) })
      hapticSuccess()
    }
  }

  const cashout = () => {
    if (!playing) return
    hapticSuccess()
    setPlaying(false)
    setResult({ win: true, amount: Math.floor(bet * mult) })
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

      {/* Игровое поле */}
      {playing && (
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
                {cell.opened
                  ? cell.mine
                    ? cell.exploded ? '💥' : '💣'
                    : '💎'
                  : ''}
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
              <div className="text-casino-green font-bold text-xl">{fmtNumber(Math.floor(bet * mult))}</div>
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
            <div className="text-2xl font-bold text-casino-green">🎉 +{fmtNumber(result.amount)} 💎</div>
          ) : (
            <div className="text-2xl font-bold text-casino-red">💥 МИНА! -{fmtNumber(result.amount)} 💎</div>
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
          onClick={() => { setResult(null); setField([]); setMult(1) }}
          className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-4 rounded-xl text-lg active:scale-95 transition-transform"
        >
          🔄 ЕЩЁ РАЗ
        </button>
      )}
    </div>
  )
}