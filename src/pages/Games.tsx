import { motion } from 'framer-motion'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'

interface Game {
  id: string
  icon: string
  name: string
  desc: string
  color: string
  isNew?: boolean
}

const GAMES: Game[] = [
  { id: 'roulette', icon: '🎡', name: 'Рулетка', desc: 'Красное / Чёрное / Зеро', color: 'from-red-500/20 to-red-800/20' },
  { id: 'slots', icon: '🎰', name: 'Слоты', desc: 'Собери 3 в ряд', color: 'from-yellow-500/20 to-orange-800/20' },
  { id: 'coin', icon: '🪙', name: 'Монетка', desc: 'Орёл или Решка ×2', color: 'from-yellow-400/20 to-yellow-800/20' },
  { id: 'mines', icon: '💣', name: 'Мины', desc: 'Открой клетки, избегай мин', color: 'from-green-500/20 to-green-800/20' },
  { id: 'crash', icon: '🚀', name: 'Crash', desc: 'Успей забрать!', color: 'from-purple-500/20 to-pink-500/20', isNew: true },
  { id: 'plinko', icon: '🎯', name: 'Plinko', desc: 'Лови множитель', color: 'from-cyan-500/20 to-blue-500/20', isNew: true },
]

interface GamesProps {
  onNavigate?: (tab: string, game?: string) => void
}

export function Games({ onNavigate }: GamesProps) {
  const { haptic } = useTelegram()

  const handleGame = (game: Game) => {
    haptic('medium')
    if (game.id === 'crash') {
      onNavigate?.('crash')
    } else if (game.id === 'plinko') {
      onNavigate?.('plinko')
    } else {
      onNavigate?.('game_play', game.id)
    }
  }

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-casino-gold">🎮 ИГРЫ</h1>
        <p className="text-casino-muted text-sm mt-1">Выбери свою удачу</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((game, index) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleGame(game)}
            className="text-left relative"
          >
            <Card className={`bg-gradient-to-br ${game.color} h-full relative overflow-hidden`}>
              {game.isNew && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow z-10">
                  NEW
                </div>
              )}
              <div className="text-center py-6">
                <div className="text-6xl mb-3">{game.icon}</div>
                <div className="font-bold text-lg">{game.name}</div>
                <div className="text-casino-muted text-xs mt-1">{game.desc}</div>
              </div>
            </Card>
          </motion.button>
        ))}
      </div>

      <Card className="mt-6 bg-casino-card/50">
        <div className="text-center text-casino-muted text-xs">
          💡 Все игры играются прямо здесь — <b className="text-casino-gold">без перехода в чат</b>
        </div>
      </Card>
    </div>
  )
}