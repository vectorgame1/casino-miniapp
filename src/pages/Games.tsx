import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'

interface Game {
  id: string
  icon: string
  name: string
  desc: string
  color: string
}

const GAMES: Game[] = [
  { id: 'roulette', icon: '🎡', name: 'Рулетка', desc: 'Красное / Чёрное / Зеро', color: 'from-red-500/20 to-red-800/20' },
  { id: 'slots', icon: '🎰', name: 'Слоты', desc: 'Собери 3 в ряд', color: 'from-yellow-500/20 to-orange-800/20' },
  { id: 'coin', icon: '🪙', name: 'Монетка', desc: 'Орёл или Решка ×2', color: 'from-yellow-400/20 to-yellow-800/20' },
  { id: 'mines', icon: '💣', name: 'Мины', desc: 'Открой клетки, избегай мин', color: 'from-green-500/20 to-green-800/20' },
]

interface GamesProps {
  onNavigate?: (tab: string, game?: string) => void
}

export function Games({ onNavigate }: GamesProps) {
  const { haptic } = useTelegram()

  const handleGame = (game: Game) => {
    haptic('medium')
    onNavigate?.('game_play', game.id)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-casino-gold mb-4">🎮 ИГРЫ</h1>

      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => handleGame(game)}
            className="text-left active:scale-95 transition-transform"
          >
            <Card className={`bg-gradient-to-br ${game.color} h-full`}>
              <div className="text-center py-6">
                <div className="text-6xl mb-3">{game.icon}</div>
                <div className="font-bold text-lg">{game.name}</div>
                <div className="text-casino-muted text-xs mt-1">{game.desc}</div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}