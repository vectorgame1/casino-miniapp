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
    <div className="p-4">
      <button onClick={onBack} className="text-casino-muted mb-4 text-sm">
        ← Назад к играм
      </button>
      <Card>
        <div className="text-center py-12">
          <div className="text-7xl mb-4">🎮</div>
          <div className="text-2xl font-bold text-casino-gold">Игра</div>
        </div>
      </Card>
    </div>
  )
}