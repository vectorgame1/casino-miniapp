import { useEffect, useState } from 'react'
import { useTelegram } from './hooks/useTelegram'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { Inventory } from './pages/Inventory'
import { Top } from './pages/Top'
import { Games } from './pages/Games'
import { GamePlay } from './pages/GamePlay'
import { Market } from './pages/Market'
import { Vip } from './pages/Vip'
import { XP } from './pages/XP'
import { Quests } from './pages/Quests'
import { Tournament } from './pages/Tournament'
import { Crash } from './pages/games/Crash'
import { Plinko } from './pages/games/Plinko'

function App() {
  const { ready, expand } = useTelegram()
  const [activeTab, setActiveTab] = useState('home')
  const [currentGame, setCurrentGame] = useState<string | null>(null)

  useEffect(() => {
    try { ready() } catch (e) {}
    try { expand() } catch (e) {}
  }, [])

  const handleNavigate = (tab: string, game?: string) => {
    if (tab === 'game_play' && game) {
      setCurrentGame(game)
      setActiveTab('game_play')
    } else {
      setCurrentGame(null)
      setActiveTab(tab)
    }
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':       return <Home onNavigate={handleNavigate} />
      case 'games':      return <Games onNavigate={handleNavigate} />
      case 'game_play':  return <GamePlay gameId={currentGame || 'roulette'} onBack={() => handleNavigate('games')} />
      case 'shop':       return <Shop />
      case 'inventory':  return <Inventory />
      case 'top':        return <Top />
      case 'market':     return <Market />
      case 'vip':        return <Vip />
      case 'xp':         return <XP />
      case 'quests':     return <Quests />
      case 'tournament': return <Tournament />
      case 'crash':      return <Crash />
      case 'plinko':     return <Plinko />
      default:           return <Home onNavigate={handleNavigate} />
    }
  }

  return (
    <Layout activeTab={activeTab} onTabChange={(t) => handleNavigate(t)}>
      {renderPage()}
    </Layout>
  )
}

export default App