import { ReactNode } from 'react'
import { useTelegram } from '../hooks/useTelegram'

// ─── SVG-ИКОНКИ ───
const IconHome = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4AF37' : '#6B6B7B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10 L12 3 L21 10 V20 A1 1 0 0 1 20 21 H4 A1 1 0 0 1 3 20 Z" />
    <path d="M9 21 V14 H15 V21" />
  </svg>
)

const IconShop = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4AF37' : '#6B6B7B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M3 4 H5 L7 15 H19 L21 7 H6" />
  </svg>
)

const IconInventory = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4AF37' : '#6B6B7B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7 H20 L21 20 A1 1 0 0 1 20 21 H4 A1 1 0 0 1 3 20 Z" />
    <path d="M9 7 V5 A3 3 0 0 1 15 5 V7" />
  </svg>
)

const IconTop = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#D4AF37' : '#6B6B7B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3 H18 V8 A6 6 0 0 1 6 8 Z" />
    <path d="M6 5 H3 A3 3 0 0 0 6 10" />
    <path d="M18 5 H21 A3 3 0 0 1 18 10" />
    <path d="M12 14 V18" />
    <path d="M8 21 H16" />
  </svg>
)

const TABS = [
  { id: 'home', label: 'ГЛАВНАЯ', icon: IconHome },
  { id: 'shop', label: 'МАГАЗИН', icon: IconShop },
  { id: 'inventory', label: 'СКЛАД', icon: IconInventory },
  { id: 'top', label: 'ТОП', icon: IconTop },
]

interface LayoutProps {
  children: ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { haptic } = useTelegram()

  return (
    <div className="min-h-screen bg-casino-bg flex flex-col relative">
      {/* Фоновый градиент */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.05) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(139, 0, 0, 0.08) 0%, transparent 60%)',
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-casino-bg/95 backdrop-blur-xl border-b border-casino-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            {/* Логотип — звезда */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-casino-gold to-casino-gold2 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A0F">
                <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17.5 L6 21 L7 14 L2 9 L9 8 Z" />
              </svg>
            </div>
            <div>
              <div className="font-display text-casino-gold text-xl leading-none tracking-wider">
                TOKEN CASINO
              </div>
              <div className="text-[9px] text-casino-muted uppercase tracking-widest">
                Premium Gaming
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 pb-24 relative z-10">{children}</main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-casino-card/95 backdrop-blur-xl border-t border-casino-border/50 z-30">
        <div className="flex justify-around max-w-md mx-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  haptic('light')
                  onTabChange(tab.id)
                }}
                className={`flex-1 flex flex-col items-center justify-center py-3 relative transition-colors ${
                  isActive ? 'text-casino-gold' : 'text-casino-muted'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-casino-gold rounded-full" />
                )}
                <Icon active={isActive} />
                <span className="text-[9px] font-bold tracking-widest mt-1.5">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}