import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface Game {
  id: string
  name: string
  desc: string
  isNew?: boolean
  icon: (c: string) => JSX.Element
}

// ═══════════════ SVG-ИКОНКИ ИГР ═══════════════
const GAME_ICONS: Record<string, (c: string) => JSX.Element> = {
  roulette: (c: string) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill={c} />
      <path d="M12 2 V6 M12 18 V22 M2 12 H6 M18 12 H22" />
    </svg>
  ),
  slots: (c: string) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6">
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 11 H21 M8 6 V11 M16 6 V11" />
      <circle cx="7" cy="16" r="1" fill={c} />
      <circle cx="12" cy="16" r="1" fill={c} />
      <circle cx="17" cy="16" r="1" fill={c} />
    </svg>
  ),
  coin: (c: string) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" fill={c} opacity="0.3" />
      <text x="12" y="16" fontSize="8" fontWeight="900" textAnchor="middle" fill={c}>T</text>
    </svg>
  ),
  mines: (c: string) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6">
      <circle cx="12" cy="14" r="7" fill={c} opacity="0.4" />
      <path d="M12 4 V7 M8 6 L9 8 M16 6 L15 8" />
      <path d="M6 20 H18" />
    </svg>
  ),
  crash: (c: string) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 L20 4" />
      <path d="M14 4 H20 V10" />
      <circle cx="6" cy="18" r="2" fill={c} />
    </svg>
  ),
  plinko: (c: string) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6">
      <circle cx="4" cy="6" r="1.5" />
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="20" cy="6" r="1.5" />
      <circle cx="8" cy="12" r="1.5" />
      <circle cx="16" cy="12" r="1.5" />
      <circle cx="4" cy="18" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
      <circle cx="20" cy="18" r="1.5" />
      <circle cx="12" cy="3" r="2" fill={c} />
    </svg>
  ),
}

const GAMES: Game[] = [
  { id: 'roulette', name: 'РУЛЕТКА', desc: 'Красное · Чёрное · Зеро', icon: GAME_ICONS.roulette },
  { id: 'slots', name: 'СЛОТЫ', desc: 'Три барабана', icon: GAME_ICONS.slots },
  { id: 'coin', name: 'МОНЕТКА', desc: 'Орёл или Решка', icon: GAME_ICONS.coin },
  { id: 'mines', name: 'МИНЫ', desc: 'Поле 5×5', icon: GAME_ICONS.mines },
  { id: 'crash', name: 'CRASH', desc: 'Успей забрать', isNew: true, icon: GAME_ICONS.crash },
  { id: 'plinko', name: 'PLINKO', desc: 'Лови множитель', isNew: true, icon: GAME_ICONS.plinko },
]

interface GamesProps {
  onNavigate?: (tab: string, game?: string) => void
}

export function Games({ onNavigate }: GamesProps) {
  const { haptic } = useTelegram()
  const [disabled, setDisabled] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setLoading(true)
    try {
      const res = await api.getGamesStatus() as any
      if (res) setDisabled(res)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const isDisabled = (gameId: string): boolean => {
    // Инвертируем: если false — значит выключена
    return disabled[gameId] === false
  }

  const handleClick = (gameId: string) => {
    haptic('medium')
    if (isDisabled(gameId)) {
      alert('🔧 Игра находится в разработке')
      return
    }
    if (gameId === 'crash') {
      onNavigate?.('crash')
    } else if (gameId === 'plinko') {
      onNavigate?.('plinko')
    } else {
      onNavigate?.('game_play', gameId)
    }
  }

  return (
    <div className="p-4 pb-24">
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl tracking-widest text-casino-gold">ИГРЫ</h1>
        <p className="text-casino-muted text-[10px] tracking-widest uppercase mt-1">Выбери свою удачу</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((game, index) => {
          const off = isDisabled(game.id)
          return (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: off ? 1 : 0.95 }}
              onClick={() => handleClick(game.id)}
              className="text-left relative"
            >
              <Card className={`h-full relative overflow-hidden ${off ? 'opacity-40' : ''}`}>
                {game.isNew && !off && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[9px] font-display tracking-widest px-2 py-0.5 rounded z-10">
                    NEW
                  </div>
                )}
                {off && (
                  <div className="absolute top-2 right-2 bg-casino-bg/90 border border-casino-border/60 text-casino-muted text-[9px] font-display tracking-widest px-2 py-0.5 rounded z-10">
                    🔧
                  </div>
                )}
                <div className="text-center py-6">
                  <div className="flex justify-center mb-3">
                    {game.icon(off ? '#6B6B7B' : '#D4AF37')}
                  </div>
                  <div className={`font-display tracking-widest text-lg ${off ? 'text-casino-muted' : 'text-casino-text'}`}>
                    {game.name}
                  </div>
                  <div className="text-casino-muted text-[10px] tracking-wider mt-1">
                    {off ? 'В РАЗРАБОТКЕ' : game.desc}
                  </div>
                </div>
              </Card>
            </motion.button>
          )
        })}
      </div>

      <Card className="mt-6">
        <div className="text-center text-casino-muted text-[10px] tracking-widest uppercase">
          Все игры играются прямо здесь
        </div>
      </Card>
    </div>
  )
}