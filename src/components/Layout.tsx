import { ReactNode } from 'react'
import { useTelegram } from '../hooks/useTelegram'

const TABS = [
  { id: 'home', icon: '🏠', label: 'Главная' },
  { id: 'shop', icon: '🛒', label: 'Магазин' },
  { id: 'inventory', icon: '🎒', label: 'Склад' },
  { id: 'top', icon: '🏆', label: 'Топ' },
]

interface LayoutProps {
  children: ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { haptic } = useTelegram()

  return (
    <div className="min-h-screen bg-casino-bg flex flex-col">
      <header className="sticky top-0 z-20 bg-casino-bg/95 backdrop-blur border-b border-casino-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            <span className="font-bold text-casino-gold text-lg">TOKEN CASINO</span>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-casino-card/95 backdrop-blur border-t border-casino-border z-30">
        <div className="flex justify-around">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { haptic('light'); onTabChange(tab.id) }}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                activeTab === tab.id ? 'text-casino-gold' : 'text-casino-muted'
              }`}
            >
              <span className="text-2xl mb-1">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}