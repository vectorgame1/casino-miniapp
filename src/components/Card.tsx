import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative
        bg-casino-card
        border border-casino-border/60
        rounded-xl
        p-4
        shadow-card
        transition-all duration-200
        ${onClick ? 'active:scale-[0.98] cursor-pointer' : ''}
        ${className}
      `}
      style={{
        backgroundImage: 'linear-gradient(135deg, #14141C 0%, #0F0F16 100%)',
      }}
    >
      {/* Тонкая золотая линия сверху */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-casino-gold/30 to-transparent" />
      {children}
    </div>
  )
}

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  color?: string
}

export function StatCard({ icon, label, value, color = 'text-casino-gold' }: StatCardProps) {
  return (
    <div className="bg-casino-card border border-casino-border/60 rounded-xl p-4 flex flex-col items-center justify-center">
      <div className="mb-1 opacity-70">{icon}</div>
      <div className={`text-xl font-bold font-display tracking-wide ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-casino-muted mt-1">{label}</div>
    </div>
  )
}