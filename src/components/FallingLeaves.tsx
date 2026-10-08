import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// 🍁 SVG-листья (5 разных форм)
const LeafSVG1 = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill={color} width="100%" height="100%">
    <path d="M12 2C8 6 4 8 4 12c0 3 2 5 5 5-1 2-2 3-2 5h2c0-2 2-3 3-5 1 2 3 3 3 5h2c0-2-1-3-2-5 3 0 5-2 5-5 0-4-4-6-8-10z" />
  </svg>
)

const LeafSVG2 = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill={color} width="100%" height="100%">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
  </svg>
)

const LeafSVG3 = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill={color} width="100%" height="100%">
    <path d="M12 2c-3 3-5 6-5 9 0 2 1 4 3 5-1 2-2 3-2 4 0 1 1 2 2 2s2-1 2-2c0-1-1-2-2-4 2-1 3-3 3-5 0-3-2-6-5-9z" />
  </svg>
)

const LeafSVG4 = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill={color} width="100%" height="100%">
    <path d="M12 2c-1.5 2-4 4-4 6 0 1.5 1 2.5 2 3-1 1-2 2-2 3.5 0 2 1.5 3.5 4 3.5s4-1.5 4-3.5c0-1.5-1-2.5-2-3.5 1-.5 2-1.5 2-3 0-2-2.5-4-4-6z" />
  </svg>
)

const LeafSVG5 = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill={color} width="100%" height="100%">
    <path d="M19 3c-2 0-4 1-6 3-1 1-2 2-3 4-2 0-4 2-4 5 0 1 .5 2 1 3l-2 3h2l1-2c1 1 2 1 3 1 3 0 5-2 5-4 0-2-1-3-3-4 1-1 2-2 3-3 2-2 4-4 3-6z" />
  </svg>
)

// Цвета в стиле твоего казино (золото + осень)
const LEAF_TYPES = [
  { Comp: LeafSVG1, colors: ['#D4AF37', '#E0B84A', '#C9A227'] },  // золото
  { Comp: LeafSVG2, colors: ['#B8860B', '#DAA520', '#FFD700'] },  // тёмное золото
  { Comp: LeafSVG3, colors: ['#C9A227', '#D4AF37', '#B8860B'] },  // золото-медь
  { Comp: LeafSVG4, colors: ['#E0B84A', '#FFD700', '#D4AF37'] },  // светлое золото
  { Comp: LeafSVG5, colors: ['#8B6914', '#B8860B', '#DAA520'] },  // бронза
]

interface LeafItem {
  id: number
  Comp: any
  color: string
  left: number
  delay: number
  duration: number
  size: number
  rotateStart: number
  swayAmount: number
  opacity: number
}

export function FallingLeaves({ count = 20 }: { count?: number }) {
  const [leaves, setLeaves] = useState<LeafItem[]>([])
  const [screenHeight, setScreenHeight] = useState(800)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setScreenHeight(window.innerHeight)
      const handleResize = () => setScreenHeight(window.innerHeight)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const items: LeafItem[] = Array.from({ length: count }, (_, i) => {
      const leafType = LEAF_TYPES[Math.floor(Math.random() * LEAF_TYPES.length)]
      const color = leafType.colors[Math.floor(Math.random() * leafType.colors.length)]
      return {
        id: i,
        Comp: leafType.Comp,
        color,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 10 + Math.random() * 12,   // 10-22 сек (плавно)
        size: 16 + Math.random() * 28,       // 16-44 px
        rotateStart: Math.random() * 360,
        swayAmount: 20 + Math.random() * 50,
        opacity: 0.15 + Math.random() * 0.25, // 0.15-0.4 (полупрозрачные)
      }
    })
    setLeaves(items)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => {
        const { Comp, color, left, delay, duration, size, rotateStart, swayAmount, opacity } = leaf
        return (
          <motion.div
            key={leaf.id}
            className="absolute"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              filter: 'drop-shadow(0 2px 6px rgba(212,175,55,0.4))',
            }}
            initial={{ y: -100, opacity: 0, rotate: rotateStart, x: 0 }}
            animate={{
              y: [-100, screenHeight + 100],
              x: [0, swayAmount, -swayAmount, swayAmount * 0.7, -swayAmount * 0.5, 0],
              rotate: [
                rotateStart,
                rotateStart + 180,
                rotateStart + 360,
                rotateStart + 540,
                rotateStart + 720,
              ],
              opacity: [0, opacity, opacity, opacity * 0.7, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Comp color={color} />
          </motion.div>
        )
      })}
    </div>
  )
}