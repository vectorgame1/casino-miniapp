import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../components/Card'
import { Avatar } from '../components/Avatar'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { BonusAnimation } from '../components/BonusAnimation'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface UserData {
  user_id: number
  balance: number
  bank: number
  unlimited: boolean
  xp: number
  vip_tier: number
  vip_expires?: string
  cashback?: number
  boost?: { mult: number; until: string } | null
}

interface HomeProps {
  onNavigate?: (tab: string) => void
}

export function Home({ onNavigate }: HomeProps) {
  const { userId, username, firstName, photoUrl, haptic, hapticSuccess } = useTelegram()
  const [user, setUser] = useState<UserData | null>(null)
  const [dailyStatus, setDailyStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [bonusAnim, setBonusAnim] = useState(false)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    loadData()
  }, [userId])

  const loadData = async () => {
    setLoading(true)
    const [userRes, dailyRes] = await Promise.all([
      api.getBalance(userId),
      api.getDailyStatus(userId),
    ])
    if (userRes) setUser(userRes as UserData)
    if (dailyRes) setDailyStatus(dailyRes)
    setLoading(false)
  }

  const handleClaimBonus = async () => {
    if (claiming || !dailyStatus?.can_claim) return
    haptic('medium')
    setClaiming(true)
    const res = await api.claimDaily(userId)
    if (res && (res as any).success) {
      hapticSuccess()
      setBonusAnim(true)
      setTimeout(() => setBonusAnim(false), 3000)
      await loadData()
    }
    setClaiming(false)
  }

  const handleCardClick = (tab: string) => {
    haptic('light')
    if (tab === 'more') {
      setShowMore(true)
      return
    }
    onNavigate?.(tab)
  }

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h}ч ${m}мин`
  }

  // XP
  const xp = user?.xp || 0
  const level = Math.floor(xp / 100)
  const xpProgress = xp % 100

  // Ранг (БЕЗ эмодзи, строкой)
  const getRank = (lvl: number): string => {
    if (lvl < 5) return `БРОНЗА ${['I', 'II', 'III'][Math.min(lvl, 2)]}`
    if (lvl < 10) return 'СЕРЕБРО III'
    if (lvl < 15) return 'СЕРЕБРО II'
    if (lvl < 20) return 'СЕРЕБРО I'
    if (lvl < 25) return 'ЗОЛОТО III'
    if (lvl < 30) return 'ЗОЛОТО II'
    if (lvl < 35) return 'ЗОЛОТО I'
    if (lvl < 45) return 'ПЛАТИНА'
    if (lvl < 55) return 'БРИЛЛИАНТ'
    return 'ЧЁРНАЯ КАРТА'
  }

  // VIP — название
  const getVipName = (tier: number): string => {
    return {
      1: 'СЕРЕБРО',
      2: 'ЗОЛОТО',
      3: 'ПЛАТИНА',
      4: 'БРИЛЛИАНТ',
      5: 'ЧЁРНАЯ',
    }[tier] || ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-casino-muted">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-casino-gold/30 border-t-casino-gold rounded-full animate-spin mx-auto mb-3" />
          <div className="text-[10px] uppercase tracking-widest">Загрузка</div>
        </div>
      </div>
    )
  }

  const vipTier = user?.vip_tier || 0

  return (
    <div className="p-4 space-y-3 relative">
      {/* АНИМАЦИЯ БОНУСА */}
      <BonusAnimation show={bonusAnim} amount={10000} />

      {/* ПРОФИЛЬ */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-casino-gold/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative flex items-start gap-3">
            <Avatar
              photoUrl={photoUrl}
              username={username}
              size={56}
              vipLevel={vipTier}
              glow={true}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-display text-lg tracking-wider truncate text-casino-text">
                  {(firstName || username || 'PLAYER').toUpperCase()}
                </div>
                {vipTier > 0 && (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-casino-gold/15 text-casino-gold border border-casino-gold/40 font-bold tracking-widest uppercase">
                    VIP {getVipName(vipTier)}
                  </span>
                )}
              </div>

              <div className="text-casino-muted text-[10px] tracking-widest uppercase mt-1">
                {getRank(level)}
              </div>

              <div className="mt-2">
                <div className="text-casino-muted text-[9px] mb-1 flex justify-between tracking-widest uppercase">
                  <span>XP {xp}</span>
                  <span>LVL {level}</span>
                </div>
                <div className="h-1 bg-casino-bg rounded-full overflow-hidden border border-casino-border/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-casino-gold to-casino-gold2"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* БАЛАНС И БАНК */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            {/* SVG-Алмаз */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="mx-auto mb-1.5"
              stroke="#D4AF37"
              strokeWidth="1.5"
            >
              <path d="M6 3 H18 L22 9 L12 21 L2 9 Z" />
              <path d="M2 9 H22" />
              <path d="M12 21 L9 9 L12 3 L15 9 L12 21" />
            </svg>
            <div className="font-display text-2xl tracking-wider text-casino-gold leading-none">
              {user?.unlimited ? (
                '∞'
              ) : (
                <AnimatedNumber value={user?.balance || 0} format="short" />
              )}
            </div>
            <div className="text-[9px] uppercase tracking-widest text-casino-muted mt-1.5">
              Баланс
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="text-center">
            {/* SVG-Банк */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="mx-auto mb-1.5"
              stroke="#E5E5E5"
              strokeWidth="1.5"
            >
              <path d="M3 10 L12 3 L21 10" />
              <path d="M5 10 V19" />
              <path d="M9 10 V19" />
              <path d="M15 10 V19" />
              <path d="M19 10 V19" />
              <path d="M3 19 H21" />
              <path d="M3 22 H21" />
            </svg>
            <div className="font-display text-2xl tracking-wider text-casino-text leading-none">
              <AnimatedNumber value={user?.bank || 0} format="short" />
            </div>
            <div className="text-[9px] uppercase tracking-widest text-casino-muted mt-1.5">
              Банк
            </div>
          </Card>
        </motion.div>
      </div>

      {/* БОНУС */}
      {dailyStatus?.can_claim ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-casino-gold/50 bg-gradient-to-r from-casino-gold/10 to-casino-gold2/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display tracking-wider text-casino-gold text-lg leading-none">
                  БОНУС ДОСТУПЕН
                </div>
                <div className="text-casino-muted text-xs mt-1.5 tracking-wide">
                  +5 000 TOKENS
                </div>
              </div>
              <button
                onClick={handleClaimBonus}
                disabled={claiming}
                className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display tracking-widest px-4 py-2 rounded-lg text-sm disabled:opacity-50 active:scale-95 transition-transform shadow-gold"
              >
                {claiming ? '...' : 'ЗАБРАТЬ'}
              </button>
            </div>
          </Card>
        </motion.div>
      ) : dailyStatus ? (
        <Card>
          <div className="text-casino-muted text-xs text-center tracking-wide">
            СЛЕДУЮЩИЙ БОНУС ЧЕРЕЗ{' '}
            <span className="text-casino-text font-bold tracking-widest">
              {formatTime(dailyStatus.time_left)}
            </span>
          </div>
        </Card>
      ) : null}

      {/* БУСТ */}
      {user?.boost ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-casino-greenLight/50 bg-casino-green/10">
            <div className="flex items-center justify-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#52B788"
                className="animate-pulse"
              >
                <path d="M13 2 L4 14 H11 L10 22 L19 10 H12 Z" />
              </svg>
              <div className="font-display tracking-widest text-casino-greenLight text-sm">
                БУСТ ×{user.boost.mult} АКТИВЕН
              </div>
            </div>
          </Card>
        </motion.div>
      ) : null}

      {/* КНОПКА ИГРЫ */}
      <motion.button
        onClick={() => handleCardClick('games')}
        className="w-full active:scale-[0.98] transition-transform"
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-casino-gold to-casino-gold2 p-4">
          {/* Блик */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* SVG-Рулетка */}
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0A0A0F" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" fill="#0A0A0F" />
                <path d="M12 2 V6 M12 18 V22 M2 12 H6 M18 12 H22" />
              </svg>
              <div className="text-left">
                <div className="font-display text-casino-bg text-2xl leading-none tracking-wider">
                  ИГРЫ
                </div>
                <div className="text-casino-bg/70 text-[10px] tracking-widest uppercase mt-0.5">
                  Рулетка · Слоты · Краш · Мины
                </div>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0F" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 6 L15 12 L9 18" />
            </svg>
          </div>
        </div>
      </motion.button>

      {/* БЫСТРЫЕ КНОПКИ */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'shop', label: 'МАГАЗИН', icon: 'shop' },
          { id: 'credits', label: 'КРЕДИТЫ', icon: 'credits' },
          { id: 'inventory', label: 'СКЛАД', icon: 'inventory' },
          { id: 'top', label: 'ТОП', icon: 'top' },
        ].map((btn, i) => (
          <motion.button
            key={btn.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            onClick={() => handleCardClick(btn.id)}
            className="active:scale-95 transition-transform text-left"
          >
            <Card>
              <div className="text-center py-3">
                <div className="flex justify-center mb-2">
                  <QuickIcon name={btn.icon} />
                </div>
                <div className="font-display tracking-widest text-casino-text text-xs">
                  {btn.label}
                </div>
              </div>
            </Card>
          </motion.button>
        ))}
      </div>

      {/* КНОПКА ЕЩЁ */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => handleCardClick('more')}
        className="w-full active:scale-95 transition-transform"
      >
        <Card>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15 A1.65 1.65 0 0 0 20 13.6 V10.4 A1.65 1.65 0 0 0 19.4 9 L17 7.6 A1.65 1.65 0 0 0 16.6 7 H7.4 A1.65 1.65 0 0 0 7 7.6 L4.6 9 A1.65 1.65 0 0 0 4 10.4 V13.6 A1.65 1.65 0 0 0 4.6 15 L7 16.4 A1.65 1.65 0 0 0 7.4 17 H16.6 A1.65 1.65 0 0 0 17 16.4 Z" />
              </svg>
              <div className="text-left">
                <div className="font-display text-casino-text text-sm tracking-widest">
                  ЕЩЁ
                </div>
                <div className="text-casino-muted text-[10px] tracking-wide">
                  Кейсы · Турнир · Рынок · Задания
                </div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round">
              <path d="M9 6 L15 12 L9 18" />
            </svg>
          </div>
        </Card>
      </motion.button>

      {/* МОДАЛКА ЕЩЁ */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              className="bg-casino-card border border-casino-border/60 rounded-xl p-5 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-display text-casino-gold text-xl text-center mb-4 tracking-widest">
                ДОПОЛНИТЕЛЬНО
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowMore(false)
                    onNavigate?.('tournament')
                  }}
                  className="active:scale-95 transition-transform"
                >
                  <Card>
                    <div className="text-center py-3">
                      <div className="flex justify-center mb-2">
                        <QuickIcon name="tournament" />
                      </div>
                      <div className="font-display tracking-widest text-xs">
                        ТУРНИР
                      </div>
                    </div>
                  </Card>
                </button>
                <button
                  onClick={() => {
                    setShowMore(false)
                    onNavigate?.('market')
                  }}
                  className="active:scale-95 transition-transform"
                >
                  <Card>
                    <div className="text-center py-3">
                      <div className="flex justify-center mb-2">
                        <QuickIcon name="market" />
                      </div>
                      <div className="font-display tracking-widest text-xs">
                        РЫНОК
                      </div>
                    </div>
                  </Card>
                </button>
                <button
                  onClick={() => {
                    setShowMore(false)
                    onNavigate?.('quests')
                  }}
                  className="active:scale-95 transition-transform"
                >
                  <Card>
                    <div className="text-center py-3">
                      <div className="flex justify-center mb-2">
                        <QuickIcon name="quests" />
                      </div>
                      <div className="font-display tracking-widest text-xs">
                        ЗАДАНИЯ
                      </div>
                    </div>
                  </Card>
                </button>
                <button
                  onClick={() => {
                    setShowMore(false)
                    onNavigate?.('cases')
                  }}
                  className="active:scale-95 transition-transform"
                >
                  <Card>
                    <div className="text-center py-3">
                      <div className="flex justify-center mb-2">
                        <QuickIcon name="cases" />
                      </div>
                      <div className="font-display tracking-widest text-xs">
                        КЕЙСЫ
                      </div>
                    </div>
                  </Card>
                </button>
              </div>
              <button
                onClick={() => setShowMore(false)}
                className="w-full bg-casino-bg border border-casino-border text-casino-muted font-display tracking-widest py-3 rounded-xl mt-4 text-sm active:scale-95"
              >
                ЗАКРЫТЬ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


// ═══════════════ SVG-ИКОНКИ (инлайн) ═══════════════

function QuickIcon({ name }: { name: string }) {
  const stroke = '#D4AF37'
  const common = { fill: 'none', stroke, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (name) {
    case 'shop':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" {...common}>
          <path d="M3 6 H21 L20 18 H4 Z" />
          <path d="M8 6 V4 A4 4 0 0 1 16 4 V6" />
        </svg>
      )
    case 'credits':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" {...common}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10 H22" />
          <path d="M6 15 H10" />
        </svg>
      )
    case 'inventory':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" {...common}>
          <path d="M4 7 H20 L21 20 A1 1 0 0 1 20 21 H4 A1 1 0 0 1 3 20 Z" />
          <path d="M9 7 V5 A3 3 0 0 1 15 5 V7" />
        </svg>
      )
    case 'top':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" {...common}>
          <path d="M6 3 H18 V8 A6 6 0 0 1 6 8 Z" />
          <path d="M6 5 H3 A3 3 0 0 0 6 10" />
          <path d="M18 5 H21 A3 3 0 0 1 18 10" />
          <path d="M12 14 V18" />
          <path d="M8 21 H16" />
        </svg>
      )
    case 'tournament':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" {...common}>
          <path d="M6 3 H18 V8 A6 6 0 0 1 6 8 Z" />
          <path d="M12 14 V18" />
          <path d="M8 21 H16" />
        </svg>
      )
    case 'market':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" {...common}>
          <path d="M4 7 H20 L21 20 A1 1 0 0 1 20 21 H4 A1 1 0 0 1 3 20 Z" />
          <path d="M8 7 V4 H16 V7" />
          <circle cx="9" cy="14" r="1" />
          <circle cx="15" cy="14" r="1" />
        </svg>
      )
    case 'quests':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="#D4AF37" />
        </svg>
      )
    case 'cases':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" {...common}>
          <rect x="3" y="7" width="18" height="14" rx="2" />
          <path d="M3 11 H21" />
          <path d="M12 7 V11" />
          <path d="M9 7 V4 H15 V7" />
        </svg>
      )
    default:
      return null
  }
}