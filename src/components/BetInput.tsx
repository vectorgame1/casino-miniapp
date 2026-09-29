import { useState } from 'react'

interface BetInputProps {
  bet: number
  setBet: (v: number) => void
  balance: number
  minBet?: number
  maxBet?: number
  presets?: number[]
  gameLabel?: string
}

export function BetInput({
  bet,
  setBet,
  balance,
  minBet = 10,
  maxBet = 100_000_000,
  presets = [100, 500, 1000, 5000, 10000],
  gameLabel = 'Ставка',
}: BetInputProps) {
  const [showInput, setShowInput] = useState(false)
  const [customValue, setCustomValue] = useState('')

  const handlePreset = (v: number) => {
    const capped = Math.min(v, balance, maxBet)
    setBet(capped)
  }

  const handleMax = () => {
    setBet(Math.min(balance, maxBet))
  }

  const handleCustom = () => {
    const v = parseInt(customValue, 10)
    if (isNaN(v)) return
    if (v < minBet) { alert(`Минимум ${minBet}`); return }
    if (v > balance) { alert('Недостаточно средств'); return }
    if (v > maxBet) { alert(`Максимум ${maxBet.toLocaleString('ru-RU')}`); return }
    setBet(v)
    setShowInput(false)
    setCustomValue('')
  }

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  return (
    <div className="flex flex-col gap-2">
      {/* PRESETS + MAX + СВОЯ */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            disabled={p > balance}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-display text-[10px] tracking-wider transition-all border ${
              bet === p
                ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg border-transparent shadow-gold'
                : 'bg-casino-bg border-casino-border/60 text-casino-muted'
            } disabled:opacity-30`}
          >
            {p >= 1000 ? `${p / 1000}K` : p}
          </button>
        ))}

        <button
          onClick={handleMax}
          className="flex-shrink-0 px-3 py-2 rounded-lg font-display text-[10px] tracking-wider bg-casino-red/60 text-casino-text border border-casino-redLight active:scale-95"
        >
          MAX
        </button>

        <button
          onClick={() => setShowInput(!showInput)}
          className="flex-shrink-0 px-3 py-2 rounded-lg font-display text-[10px] tracking-wider bg-casino-bg border border-casino-gold/50 text-casino-gold active:scale-95"
        >
          СВОЯ
        </button>
      </div>

      {/* ИНПУТ СВОЕЙ СУММЫ */}
      {showInput && (
        <div className="flex gap-2">
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={`${minBet} – ${fmt(balance)}`}
            className="flex-1 px-3 py-2 rounded-lg bg-casino-bg border border-casino-border/60 text-casino-text text-center font-display tracking-wider"
            autoFocus
          />
          <button
            onClick={handleCustom}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display tracking-wider"
          >
            OK
          </button>
        </div>
      )}

      {/* ТЕКУЩАЯ СТАВКА */}
      <div className="text-center text-casino-muted text-[10px] tracking-widest uppercase">
        {gameLabel}: <span className="text-casino-gold font-display text-sm tracking-wider">{fmt(bet)}</span> TOKENS
      </div>
    </div>
  )
}