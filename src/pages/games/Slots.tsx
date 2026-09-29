import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../../components/Card'
import { useTelegram } from '../../hooks/useTelegram'
import { api } from '../../api/client'

const BET_OPTIONS = [100, 500, 1000, 5000, 10000]

// SVG-символы для слотов
const SYMBOLS = [
  { id: 'cherry', name: 'cherry', color: '#C41E3A', mult: 10 },
  { id: 'lemon', name: 'lemon', color: '#D4AF37', mult: 15 },
  { id: 'orange', name: 'orange', color: '#FF8C00', mult: 20 },
  { id: 'grape', name: 'grape', color: '#8B008B', mult: 25 },
  { id: 'diamond', name: 'diamond', color: '#00CED1', mult: 50 },
  { id: 'seven', name: 'seven', color: '#8B0000', mult: 100 },
]

interface SlotsProps {
  onBack: () => void
}

function SymbolIcon({ symbol, size = 48 }: { symbol: string; size?: number }) {
  const cfg = SYMBOLS.find(s => s.id === symbol) || SYMBOLS[0]
  const c = cfg.color
  const s = size

  if (symbol === 'cherry') {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <circle cx="16" cy="34" r="9" fill={c} />
        <circle cx="32" cy="34" r="9" fill={c} />
        <circle cx="14" cy="32" r="2" fill="#fff" opacity="0.4" />
        <circle cx="30" cy="32" r="2" fill="#fff" opacity="0.4" />
        <path d="M16 25 Q20 14 28 8 Q26 16 24 25" stroke="#2D6A4F" strokeWidth="2.5" fill="none" />
        <path d="M32 25 Q30 16 28 8" stroke="#2D6A4F" strokeWidth="2.5" fill="none" />
      </svg>
    )
  }
  if (symbol === 'lemon') {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <ellipse cx="24" cy="24" rx="14" ry="18" fill={c} transform="rotate(30 24 24)" />
        <ellipse cx="20" cy="20" rx="4" ry="6" fill="#fff" opacity="0.3" transform="rotate(30 20 20)" />
      </svg>
    )
  }
  if (symbol === 'orange') {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="16" fill={c} />
        <circle cx="20" cy="20" r="5" fill="#fff" opacity="0.3" />
        <path d="M24 8 L26 4 L22 4 Z" fill="#2D6A4F" />
      </svg>
    )
  }
  if (symbol === 'grape') {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <circle cx="18" cy="20" r="6" fill={c} />
        <circle cx="28" cy="20" r="6" fill={c} />
        <circle cx="23" cy="28" r="6" fill={c} />
        <circle cx="14" cy="30" r="6" fill={c} />
        <circle cx="32" cy="30" r="6" fill={c} />
        <circle cx="23" cy="36" r="6" fill={c} />
        <path d="M23 14 L23 6 M23 6 Q28 4 30 8" stroke="#2D6A4F" strokeWidth="2" fill="none" />
      </svg>
    )
  }
  if (symbol === 'diamond') {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <path d="M12 12 H36 L44 24 L24 44 L4 24 Z" fill={c} />
        <path d="M4 24 H44 M24 44 L18 24 L24 12 L30 24 L24 44" stroke="#0A0A0F" strokeWidth="0.8" fill="none" opacity="0.5" />
        <path d="M12 12 L18 24 L4 24 Z M36 12 L44 24 L30 24 Z" fill="#fff" opacity="0.15" />
      </svg>
    )
  }
  if (symbol === 'seven') {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48">
        <text x="24" y="38" fontSize="40" fontWeight="900" textAnchor="middle" fill={c} fontFamily="Bebas Neue, sans-serif">7</text>
      </svg>
    )
  }
  return <div style={{ width: s, height: s, color: '#6B6B7B' }}>?</div>
}

export function Slots({ onBack }: SlotsProps) {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [bet, setBet] = useState(1000)
  const [playing, setPlaying] = useState(false)
  const [reels, setReels] = useState<string[]>(['?', '?', '?'])
  const [stopped, setStopped] = useState<boolean[]>([false, false, false])
  const [result, setResult] = useState<{ win: boolean; amount: number; mult: number } | null>(null)

  const spinOne = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].id

  const handleSpin = async () => {
    if (playing) return
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

    // API может вернуть эмодзи — маппим на id
    const mapFromEmoji = (e: string): string => {
      const map: Record<string, string> = {
        '🍒': 'cherry', '🍋': 'lemon', '🍊': 'orange',
        '🍇': 'grape', '💎': 'diamond', '7️⃣': 'seven',
      }
      return map[e] || e
    }

    const final = (res.reels || []).map(mapFromEmoji)

    setReels([final[0] || 'cherry', spinOne(), spinOne()])
    setStopped([true, false, false])
    await new Promise((r) => setTimeout(r, 400))

    setReels([final[0] || 'cherry', final[1] || 'cherry', spinOne()])
    setStopped([true, true, false])
    await new Promise((r) => setTimeout(r, 400))

    setReels([final[0] || 'cherry', final[1] || 'cherry', final[2] || 'cherry'])
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
    setReels(['?', '?', '?'])
    setStopped([false, false, false])
  }

  return (
    <div className="p-4 pb-24">
      <button onClick={onBack} className="text-casino-muted mb-4 text-xs tracking-widest uppercase">
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
                className={`w-20 h-24 rounded-xl flex items-center justify-center bg-gradient-to-br border-2 ${
                  stopped[i]
                    ? 'from-casino-gold/10 to-casino-gold2/10 border-casino-gold/40'
                    : 'from-casino-bg to-casino-card border-casino-border/60'
                }`}
                style={{
                  boxShadow: stopped[i] ? '0 0 20px rgba(212, 175, 55, 0.3)' : 'none',
                }}
              >
                <SymbolIcon symbol={symbol} size={48} />
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
            <div className="text-casino-muted text-[10px] mb-2 tracking-widest uppercase">Ставка</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {BET_OPTIONS.map((b) => (
                <button
                  key={b}
                  onClick={() => { haptic('light'); setBet(b) }}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-display text-sm tracking-wider ${
                    bet === b ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg' : 'bg-casino-bg border border-casino-border/60 text-casino-muted'
                  }`}
                >
                  {fmtNumber(b)}
                </button>
              ))}
            </div>
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
          <div className="font-display tracking-widest mb-3 text-casino-gold">ВЫИГРЫШИ</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {SYMBOLS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <SymbolIcon symbol={s.id} size={28} />
                <div className="text-[10px] tracking-wider">×{s.mult}</div>
              </div>
            ))}
          </div>
          <div className="text-center text-casino-gold mt-3 tracking-widest text-[11px]">
            2 В РЯД → ×2
          </div>
        </div>
      </Card>
    </div>
  )
}