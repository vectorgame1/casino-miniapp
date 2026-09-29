import { Roulette } from './games/Roulette'
import { Slots } from './games/Slots'
import { Coin } from './games/Coin'
import { Mines } from './games/Mines'
import { Card } from '../components/Card'

interface GamePlayProps {
  gameId: string
  onBack: () => void
}

export function GamePlay({ gameId, onBack }: GamePlayProps) {
  if (gameId === 'roulette') return <Roulette onBack={onBack} />
  if (gameId === 'slots') return <Slots onBack={onBack} />
  if (gameId === 'coin') return <Coin onBack={onBack} />
  if (gameId === 'mines') return <Mines onBack={onBack} />

  return (
    <div className="p-4 pb-24">
      <button onClick={onBack} className="text-casino-muted mb-4 text-[10px] tracking-widest uppercase">
        ← Назад
      </button>
      <Card>
        <div className="text-center py-12">
          <div className="flex justify-center mb-4 opacity-50">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" fill="#D4AF37" />
            </svg>
          </div>
          <div className="font-display text-2xl tracking-widest text-casino-gold">ИГРА</div>
        </div>
      </Card>
    </div>
  )
}