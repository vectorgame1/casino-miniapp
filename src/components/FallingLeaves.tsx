import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// ═══════════════ SVG-ЛИСТЬЯ РАЗНЫХ ПОРОД ═══════════════

// 🍁 КЛЁН (кленовый лист — 5 лопастей)
const MapleLeaf = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" fill={color} width="100%" height="100%">
    <path d="M32 4 L36 16 L44 12 L42 22 L54 20 L48 30 L60 34 L48 38 L54 48 L42 46 L44 56 L36 52 L32 62 L28 52 L20 56 L22 46 L10 48 L16 38 L4 34 L16 30 L10 20 L22 22 L20 12 L28 16 Z" />
    <path d="M32 4 L32 62" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
  </svg>
)

// 🌳 ДУБ (дубовый лист — волнистый)
const OakLeaf = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" fill={color} width="100%" height="100%">
    <path d="M32 2 C28 8 22 10 20 16 C14 14 10 18 12 24 C6 26 6 34 12 38 C8 44 12 50 18 50 C20 58 28 58 32 62 C36 58 44 58 46 50 C52 50 56 44 52 38 C58 34 58 26 52 24 C54 18 50 14 44 16 C42 10 36 8 32 2 Z" />
    <path d="M32 2 L32 62" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
  </svg>
)

// 🍃 БЕРЁЗА (маленький ромбовидный листик)
const BirchLeaf = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" fill={color} width="100%" height="100%">
    <path d="M32 4 C42 14 46 26 44 38 C42 50 38 58 32 62 C26 58 22 50 20 38 C18 26 22 14 32 4 Z" />
    <path d="M32 4 L32 62" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
    <path d="M32 14 L22 20 M32 22 L42 28 M32 30 L22 36 M32 38 L42 44 M32 46 L24 52" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" fill="none" />
  </svg>
)

// 🌿 ЛИПА (сердцевидный лист)
const LindenLeaf = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" fill={color} width="100%" height="100%">
    <path d="M32 8 C20 8 10 18 8 32 C6 46 16 56 32 58 C48 56 58 46 56 32 C54 18 44 8 32 8 Z M32 8 L24 58 M32 8 L40 58" />
    <path d="M32 8 L32 58" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" fill="none" />
    <path d="M32 20 L18 32 M32 20 L46 32 M32 34 L18 46 M32 34 L46 46" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" fill="none" />
  </svg>
)

// 🌰 КАШТАН (широкий лист с 7 лопастями)
const ChestnutLeaf = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" fill={color} width="100%" height="100%">
    <path d="M32 2 L36 14 L46 8 L44 20 L58 18 L50 28 L62 32 L50 36 L58 46 L44 44 L46 56 L36 50 L32 62 L28 50 L18 56 L20 44 L6 46 L14 36 L2 32 L14 28 L6 18 L20 20 L18 8 L28 14 Z" />
    <path d="M32 2 L32 62" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
  </svg>
)

// 🍂 ВЯЗ (удлинённый лист)
const ElmLeaf = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" fill={color} width="100%" height="100%">
    <path d="M32 4 C46 12 54 26 52 40 C50 54 42 60 32 62 C22 60 14 54 12 40 C10 26 18 12 32 4 Z" />
    <path d="M32 4 L32 62" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
    <path d="M32 16 L20 26 M32 16 L44 26 M32 32 L18 42 M32 32 L46 42" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" fill="none" />
  </svg>
)

// ═══════════════ ВСЕ ПОРОДЫ + ЦВЕТА ═══════════════
const LEAF_TYPES = [
  { Comp: MapleLeaf, colors: ['#C0392B', '#E74C3C', '#B03A2E', '#D35400'] },        // клён — красно-оранжевый
  { Comp: OakLeaf, colors: ['#8B4513', '#A0522D', '#D2691E', '#B8860B'] },          // дуб — коричневый
  { Comp: BirchLeaf, colors: ['#F4D03F', '#F1C40F', '#F39C12', '#E67E22'] },        // берёза — жёлтый
  { Comp: LindenLeaf, colors: ['#F5B041', '#F39C12', '#E67E22', '#D68910'] },       // липа — оранжевый
  { Comp: ChestnutLeaf, colors: ['#922B21', '#A93226', '#CB4335', '#873600'] },    // каштан — тёмно-красный
  { Comp: ElmLeaf, colors: ['#E67E22', '#CA6F1E', '#D35400', '#A04000'] },          // вяз — оранжево-коричневый
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
  blur: number
}

export function FallingLeaves({ count = 60 }: { count?: number }) {
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
      
      // Три слоя глубины: маленькие (далёкие), средние, большие (близкие)
      const layer = Math.random()
      let size: number
      let opacity: number
      let blur: number
      let duration: number
      
      if (layer < 0.4) {
        // Далёкие — маленькие, размытые, медленные
        size = 20 + Math.random() * 15   // 20-35
        opacity = 0.2 + Math.random() * 0.15
        blur = 1.5 + Math.random() * 1.5
        duration = 14 + Math.random() * 10
      } else if (layer < 0.75) {
        // Средние
        size = 35 + Math.random() * 20   // 35-55
        opacity = 0.4 + Math.random() * 0.2
        blur = 0.5 + Math.random() * 0.8
        duration = 10 + Math.random() * 8
      } else {
        // Близкие — большие, чёткие, быстрее
        size = 55 + Math.random() * 30   // 55-85
        opacity = 0.7 + Math.random() * 0.3
        blur = 0
        duration = 7 + Math.random() * 6
      }

      return {
        id: i,
        Comp: leafType.Comp,
        color,
        left: Math.random() * 100,
        delay: Math.random() * 15,
        duration,
        size,
        rotateStart: Math.random() * 360,
        swayAmount: 30 + Math.random() * 80,
        opacity,
        blur,
      }
    })
    setLeaves(items)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => {
        const { Comp, color, left, delay, duration, size, rotateStart, swayAmount, opacity, blur } = leaf
        return (
          <motion.div
            key={leaf.id}
            className="absolute"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.4)) ${blur > 0 ? `blur(${blur}px)` : ''}`,
            }}
            initial={{ y: -150, opacity: 0, rotate: rotateStart, x: 0 }}
            animate={{
              y: [-150, screenHeight + 150],
              x: [
                0,
                swayAmount,
                -swayAmount * 0.8,
                swayAmount * 0.6,
                -swayAmount * 0.4,
                0,
              ],
              rotate: [
                rotateStart,
                rotateStart + 180,
                rotateStart + 360,
                rotateStart + 540,
                rotateStart + 720,
              ],
              opacity: [0, opacity, opacity, opacity * 0.8, 0],
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