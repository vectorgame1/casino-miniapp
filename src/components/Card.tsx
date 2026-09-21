import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-casino-card border border-casino-border rounded-2xl p-4 shadow-card ${className}`}>
      {children}
    </div>
  )
}

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  color?: string
}

export function StatCard({ icon, label, value, color = 'text-casino-gold' }: StatCardProps) {
  return (
    <div className="bg-casino-card border border-casino-border rounded-2xl p-4 flex flex-col items-center justify-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-casino-muted mt-1">{label}</div>
    </div>
  )
}