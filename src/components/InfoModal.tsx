import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon?: ReactNode
  children: ReactNode
}

export function InfoModal({ isOpen, onClose, title, icon, children }: InfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="relative bg-casino-card border-t border-casino-border/60 rounded-t-2xl p-5 w-full max-h-[85vh] overflow-y-auto pb-24"
            onClick={(e) => e.stopPropagation()}
          >
            {/* РУЧКА СВЕРХУ (для свайпа) */}
            <div className="w-12 h-1 bg-casino-border/60 rounded-full mx-auto mb-4" />

            {/* КРЕСТИК */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-casino-bg/80 border border-casino-border/60 text-casino-muted active:scale-95 transition-all z-10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6 L18 18 M18 6 L6 18" />
              </svg>
            </button>

            {/* ИКОНКА */}
            {icon && (
              <div className="flex justify-center mb-3">
                {icon}
              </div>
            )}

            {/* ЗАГОЛОВОК */}
            <div className="font-display text-casino-gold text-xl text-center mb-4 tracking-widest">
              {title}
            </div>

            {/* КОНТЕНТ */}
            <div className="text-casino-muted text-xs tracking-wide space-y-3 leading-relaxed">
              {children}
            </div>

            {/* КНОПКА OK */}
            <button
              onClick={onClose}
              className="w-full mt-5 bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display tracking-widest py-3 rounded-lg active:scale-95"
            >
              ПОНЯТНО
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}