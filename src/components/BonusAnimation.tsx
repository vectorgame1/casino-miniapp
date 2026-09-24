import { motion, AnimatePresence } from 'framer-motion'

interface BonusAnimationProps {
  show: boolean
  amount: number
}

export function BonusAnimation({ show, amount }: BonusAnimationProps) {
  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* 1. ЗОЛОТЫЕ МОНЕТЫ ЛЕТЯТ СВЕРХУ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[60]"
          >
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                  y: -50,
                  rotate: 0,
                  scale: 0.5 + Math.random() * 0.8,
                }}
                animate={{
                  y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800,
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.8,
                  ease: 'easeIn',
                }}
                className="absolute text-3xl"
              >
                {['💰', '💎', '⭐', '👑', '🪙'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </motion.div>

          {/* 2. ЦЕНТРАЛЬНАЯ ЦИФРА +10 000 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -100 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-[65]"
          >
            <div className="relative">
              {/* Свечение вокруг */}
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-casino-gold/40 rounded-full blur-3xl"
                style={{ width: 300, height: 300, marginLeft: -150, marginTop: -150, top: '50%', left: '50%' }}
              />

              {/* Сама цифра */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="relative text-center"
              >
                <div className="text-7xl mb-2">💰</div>
                <div className="text-6xl font-black text-casino-gold drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">
                  +{fmt(amount)}
                </div>
                <div className="text-casino-gold/80 text-xl font-bold mt-1">
                  Tokens
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* 3. ВСПЫШКА ФОНА */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 pointer-events-none z-[55] bg-gradient-to-b from-casino-gold/30 via-transparent to-casino-gold/30"
          />
        </>
      )}
    </AnimatePresence>
  )
}