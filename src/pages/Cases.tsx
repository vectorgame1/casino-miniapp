import { motion } from 'framer-motion'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'

interface GamesProps {
  onNavigate?: (tab: string, game?: string) => void
}

const GAMES = [
  { id: 'roulette', icon: '🎡', name: 'Рулетка', desc: 'Красное/Чёрное/Зеро', color: 'from-red-500/20 to-red-700/20 border-red-500/40' },
  { id: 'slots', icon: '🎰', name: 'Слоты', desc: 'Три барабана', color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40' },
  { id: 'coin', icon: '🪙', name: 'Монетка', desc: 'Орёл или решка', color: 'from-yellow-400/20 to-amber-600/20 border-yellow-400/40' },
  { id: 'mines', icon: '💣', name: 'Мины', desc: 'Поле 5×5', color: 'from-casino-gold/20 to-casino-gold2/20 border-casino-gold/40' },
  { id: 'crash', icon: '🚀', name: 'Crash', desc: 'Успей забрать!', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/50', isNew: true },
  { id: 'plinko', icon: '🎯', name: 'Plinko', desc: 'Лови множитель', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/50', isNew: true },
]

export function Games({ onNavigate }: GamesProps) {
  const { haptic } = useTelegram()

  const handleClick = (gameId: string) => {
    haptic('light')
    if (gameId === 'crash') {
      onNavigate?.('crash')
    } else if (gameId === 'plinko') {
      onNavigate?.('plinko')
    } else {
      onNavigate?.('game_play', gameId)
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
            onClick={() => handleClick(game.id)}
            className="relative"
          >
            <div className={`rounded-2xl border-2 ${game.color} bg-gradient-to-br p-4 text-left h-full relative overflow-hidden`}>
              {game.isNew && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                  NEW
                </div>
              )}
              <div className="text-4xl mb-2">{game.icon}</div>
              <div className="font-bold text-sm">{game.name}</div>
              <div className="text-casino-muted text-[10px] mt-1">{game.desc}</div>
            </div>
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