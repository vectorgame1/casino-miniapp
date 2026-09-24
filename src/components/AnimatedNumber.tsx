import { useEffect, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
  format?: 'full' | 'short'
}

export function AnimatedNumber({
  value,
  duration = 800,
  className = '',
  format = 'full',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    const startValue = displayValue
    const endValue = value
    const diff = endValue - startValue
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutQuad
      const eased = 1 - (1 - progress) * (1 - progress)
      setDisplayValue(Math.floor(startValue + diff * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  const fmt = (n: number) => {
    if (format === 'short') {
      if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
      if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
      return n.toString()
    }
    return n.toLocaleString('ru-RU').replace(/,/g, ' ')
  }

  return <span className={className}>{fmt(displayValue)}</span>
}