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
    if (!userId) { setLoading(false); return }
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
      // 🎬 ЗАПУСКАЕМ НОВУЮ АНИМАЦИЮ
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
    const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60)
    return `${h}ч ${m}мин`
  }

  const xp = user?.xp || 0
  const level = Math.floor(xp / 100)
  const xpProgress = xp % 100
  const xpFill = Math.floor(xpProgress / 100 * 10)

  const getRank = (lvl: number) => {
    if (lvl < 5) return `🥉 Бронза ${['I','II','III'][Math.min(lvl, 2)]}`
    if (lvl < 10) return '🥈 Серебро III'
    if (lvl < 15) return '🥈 Серебро II'
    if (lvl < 20) return '🥈 Серебро I'
    if (lvl < 25) return '🥇 Золото III'
    if (lvl < 30) return '🥇 Золото II'
    if (lvl < 35) return '🥇 Золото I'
    if (lvl < 45) return '💎 Платина'
    if (lvl < 55) return '💠 Бриллиант'
    return '🖤 Чёрная карта'
  }

  const vipIcon = {
    0: '', 1: '🥈', 2: '🥇', 3: '💎', 4: '💠', 5: '🖤',
  }[user?.vip_tier || 0] || ''

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-casino-muted">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">🎰</div>
          Загрузка...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 relative">
      {/* 🎬 НОВАЯ АНИМАЦИЯ БОНУСА */}
      <BonusAnimation show={bonusAnim} amount={10000} />

      {/* ПРОФИЛЬ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-casino-gold/5 rounded-full blur-3xl -mr-20 -mt-20" />

          <div className="relative flex items-start gap-3">
            <Avatar
              photoUrl={photoUrl}
              username={username}
              size={56}
              vipLevel={user?.vip_tier || 0}
              glow={true}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-bold text-lg truncate">
                  {firstName || username}
                </div>
                {vipIcon && (
                  <span className="text-sm px-2 py-0.5 rounded-full bg-casino-gold/20 text-casino-gold border border-casino-gold/40">
                    {vipIcon} VIP {user?.vip_tier}
                  </span>
                )}
              </div>

              <div className="text-casino-muted text-sm mt-0.5">
                🎖 {getRank(level)}
              </div>

              <div className="mt-2">
                <div className="text-casino-muted text-[10px] mb-1 flex justify-between">
                  <span>XP: {xp}</span>
                  <span>Ур. {level}</span>
                </div>
                <div className="h-1.5 bg-casino-bg rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpFill * 10}%` }}
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
            <div className="text-2xl mb-1">💎</div>
            <div className="text-xl font-bold text-casino-gold">
              {user?.unlimited ? '∞' : <AnimatedNumber value={user?.balance || 0} format="short" />}
            </div>
            <div className="text-xs text-casino-muted mt-1">Баланс</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="text-center">
            <div className="text-2xl mb-1">🏦</div>
            <div className="text-xl font-bold text-casino-text">
              <AnimatedNumber value={user?.bank || 0} format="short" />
            </div>
            <div className="text-xs text-casino-muted mt-1">Банк</div>
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
          <Card className="border-casino-gold bg-gradient-to-r from-casino-gold/10 to-casino-gold2/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-casino-gold">🎁 Бонус доступен!</div>
                <div className="text-casino-muted text-sm mt-1">+10 000 💎</div>
              </div>
              <button
                onClick={handleClaimBonus}
                disabled={claiming}
                className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold px-4 py-2 rounded-xl disabled:opacity-50 active:scale-95 transition-transform shadow-gold"
              >
                {claiming ? '...' : 'ЗАБРАТЬ'}
              </button>
            </div>
          </Card>
        </motion.div>
      ) : dailyStatus ? (
        <Card>
          <div className="text-casino-muted text-sm text-center">
            ⏳ Бонус через <b className="text-casino-text">{formatTime(dailyStatus.time_left)}</b>
          </div>
        </Card>
      ) : null}

      {/* БУСТ */}
      {user?.boost ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-casino-green/50 bg-casino-green/5">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl animate-pulse">⚡</span>
              <div className="font-bold text-casino-green">
                Буст ×{user.boost.mult} активен
              </div>
            </div>
          </Card>
        </motion.div>
      ) : null}

      {/* КНОПКА ИГРЫ */}
      <motion.button
        onClick={() => handleCardClick('games')}
        className="w-full active:scale-95 transition-transform relative"
        animate={{
          boxShadow: [
            '0 0 20px rgba(255, 215, 0, 0.3)',
            '0 0 40px rgba(255, 215, 0, 0.5)',
            '0 0 20px rgba(255, 215, 0, 0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ borderRadius: 16 }}
      >
        <div className="bg-gradient-to-r from-casino-gold to-casino-gold2 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎮</span>
              <div className="text-left">
                <div className="text-black font-bold text-xl">ИГРЫ</div>
                <div className="text-black/70 text-xs">Рулетка · Слоты · Монетка · Мины</div>
              </div>
            </div>
            <div className="text-black text-3xl font-bold">›</div>
          </div>
        </div>
      </motion.button>

      {/* БЫСТРЫЕ КНОПКИ */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'shop', icon: '🛒', label: 'Магазин' },
          { id: 'vip', icon: '👑', label: 'VIP' },
          { id: 'quests', icon: '🎯', label: 'Задания' },
          { id: 'top', icon: '🏆', label: 'Топ' },
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
              <div className="text-center py-2">
                <div className="text-3xl mb-1">{btn.icon}</div>
                <div className="text-sm font-medium">{btn.label}</div>
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
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <div className="text-left">
                <div className="text-sm font-bold">ЕЩЁ</div>
                <div className="text-casino-muted text-xs">Кейсы · Склад · Буст XP · Турнир · Рынок</div>
              </div>
            </div>
            <div className="text-casino-gold text-2xl">›</div>
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
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-casino-card border border-casino-border rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-casino-gold text-center mb-4">⚙️ ЕЩЁ</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'cases', icon: '🎰', label: 'Кейсы' },
                  { id: 'inventory', icon: '🎒', label: 'Склад' },
                  { id: 'xp', icon: '⭐', label: 'Буст XP' },
                  { id: 'tournament', icon: '🏆', label: 'Турнир' },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => { setShowMore(false); onNavigate?.(btn.id) }}
                    className="active:scale-95 transition-transform"
                  >
                    <Card>
                      <div className="text-center py-3">
                        <div className="text-3xl mb-1">{btn.icon}</div>
                        <div className="text-sm">{btn.label}</div>
                      </div>
                    </Card>
                  </button>
                ))}
                <button
                  onClick={() => { setShowMore(false); onNavigate?.('market') }}
                  className="active:scale-95 transition-transform col-span-2"
                >
                  <Card>
                    <div className="text-center py-3">
                      <div className="text-3xl mb-1">🏪</div>
                      <div className="text-sm">Рынок</div>
                    </div>
                  </Card>
                </button>
              </div>
              <button
                onClick={() => setShowMore(false)}
                className="w-full bg-casino-bg border border-casino-border text-casino-muted font-bold py-3 rounded-xl mt-4"
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