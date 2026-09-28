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
          {/* Монеты летят сверху — SVG */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[60]"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                  y: -50,
                  rotate: 0,
                  scale: 0.5 + Math.random() * 0.5,
                }}
                animate={{
                  y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800,
                  rotate: Math.random() * 540 - 270,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.6,
                  ease: 'easeIn',
                }}
                className="absolute"
              >
                {/* SVG-монета */}
                <svg width="28" height="28" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="13" fill="#D4AF37" stroke="#8B6914" strokeWidth="1" />
                  <circle cx="14" cy="14" r="9" fill="none" stroke="#8B6914" strokeWidth="0.5" />
                  <text
                    x="14"
                    y="19"
                    fontSize="12"
                    fontWeight="900"
                    textAnchor="middle"
                    fill="#0A0A0F"
                    fontFamily="Bebas Neue, sans-serif"
                  >
                    T
                  </text>
                </svg>
              </motion.div>
            ))}
          </motion.div>

          {/* Центральное число */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -100 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-[65]"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute bg-casino-gold/30 rounded-full blur-3xl"
                style={{
                  width: 300,
                  height: 300,
                  marginLeft: -150,
                  marginTop: -150,
                  top: '50%',
                  left: '50%',
                }}
              />

              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="relative text-center"
              >
                {/* SVG-мешок */}
                <div className="flex justify-center mb-3">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <path
                      d="M 30 15 Q 40 5 50 15 L 55 20 L 55 35 Q 65 40 65 55 Q 65 72 40 72 Q 15 72 15 55 Q 15 40 25 35 L 25 20 Z"
                      fill="#D4AF37"
                      stroke="#8B6914"
                      strokeWidth="2"
                    />
                    <text
                      x="40"
                      y="60"
                      fontSize="32"
                      fontWeight="900"
                      textAnchor="middle"
                      fill="#0A0A0F"
                      fontFamily="Bebas Neue, sans-serif"
                    >
                      T
                    </text>
                  </svg>
                </div>
                <div
                  className="font-display text-casino-gold"
                  style={{
                    fontSize: '60px',
                    lineHeight: 1,
                    textShadow: '0 0 30px rgba(212,175,55,0.8)',
                  }}
                >
                  +{fmt(amount)}
                </div>
                <div className="text-casino-gold/70 text-sm font-bold uppercase tracking-widest mt-2">
                  Tokens
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Вспышка */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.25, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 pointer-events-none z-[55]"
            style={{
              background:
                'radial-gradient(circle at center, rgba(212,175,55,0.3) 0%, transparent 70%)',
            }}
          />
        </>
      )}
    </AnimatePresence>
  )
}