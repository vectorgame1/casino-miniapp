import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

// ─── ТИПЫ ───
interface ShopItem {
  id: string
  type: string
  name: string
  desc?: string
  stars?: number
  tokens?: number
  mult?: number
  minutes?: number
  title?: string
  vip_level?: number
}

interface VipTier {
  id: number
  name: string
  icon: string
  stars: number
  cashback: number
  bonus: number
  duration_days: number
  exclusive_games: number
}

interface CaseItem {
  id: string
  name: string
  desc?: string
  stars: number
  rewards: any[]
}

interface XpPack {
  id: string
  xp: number
  stars: number
}

// ─── ТАБЫ ───
const TABS = [
  { id: 'hits', icon: '🔥', label: 'Хиты' },
  { id: 'boost', icon: '⚡', label: 'Бусты' },
  { id: 'vip', icon: '👑', label: 'VIP' },
  { id: 'case', icon: '🎰', label: 'Кейсы' },
  { id: 'xp', icon: '⭐', label: 'XP' },
  { id: 'title', icon: '🏷️', label: 'Титулы' },
]

// ─── ЦВЕТА ПО ТИПУ ───
const TYPE_STYLES: Record<string, { gradient: string; border: string; text: string }> = {
  boost: { gradient: 'from-yellow-500/15 to-orange-500/15', border: 'border-yellow-500/50', text: 'text-yellow-400' },
  title: { gradient: 'from-purple-500/15 to-pink-500/15', border: 'border-purple-500/50', text: 'text-purple-300' },
  vip: { gradient: 'from-cyan-500/15 to-blue-500/15', border: 'border-cyan-500/50', text: 'text-cyan-300' },
  case: { gradient: 'from-pink-500/15 to-red-500/15', border: 'border-pink-500/50', text: 'text-pink-300' },
  xp: { gradient: 'from-green-500/15 to-emerald-500/15', border: 'border-green-500/50', text: 'text-green-300' },
}

export function Shop() {
  const { userId, haptic, hapticSuccess } = useTelegram()
  const [activeTab, setActiveTab] = useState('hits')
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)

  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [vipTiers, setVipTiers] = useState<VipTier[]>([])
  const [cases, setCases] = useState<CaseItem[]>([])
  const [xpPacks, setXpPacks] = useState<XpPack[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    const [shopRes, vipRes, casesRes, xpRes] = await Promise.all([
      api.getShop(),
      api.getVipTiers(),
      api.getCases(),
      api.getXpPacks(),
    ])
    if (Array.isArray(shopRes)) setShopItems(shopRes as ShopItem[])
    if (Array.isArray(vipRes)) setVipTiers(vipRes as VipTier[])
    if (Array.isArray(casesRes)) setCases(casesRes as CaseItem[])
    if (Array.isArray(xpRes)) setXpPacks(xpRes as XpPack[])
    setLoading(false)
  }

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  // 🛒 ПОКУПКА ЗА STARS
  const buyStars = async (payload: string, title: string, stars: number) => {
    if (!userId || buying) return
    haptic('medium')
    setBuying(payload)
    try {
      const res = await api.buyShopItem(userId, payload) as any
      if (res?.invoice_url) {
        hapticSuccess()
        const tg = (window as any).Telegram?.WebApp
        if (tg?.openInvoice) {
          tg.openInvoice(res.invoice_url, (status: string) => {
            if (status === 'paid') setTimeout(loadAll, 1500)
          })
        } else {
          window.open(res.invoice_url, '_blank')
        }
      } else if (res?.error) {
        alert(res.error)
      }
    } catch (e) {
      alert('Ошибка оплаты')
    }
    setBuying(null)
  }

  // 🎫 ПОКУПКА КЕЙСА
  const buyCase = async (caseId: string, stars: number) => {
    if (!userId || buying) return
    haptic('medium')
    setBuying(`case_${caseId}`)
    try {
      const res = await api.buyCase(userId, caseId) as any
      if (res?.invoice_url) {
        hapticSuccess()
        const tg = (window as any).Telegram?.WebApp
        if (tg?.openInvoice) {
          tg.openInvoice(res.invoice_url, (status: string) => {
            if (status === 'paid') setTimeout(loadAll, 1500)
          })
        } else {
          window.open(res.invoice_url, '_blank')
        }
      }
    } catch (e) {
      alert('Ошибка оплаты')
    }
    setBuying(null)
  }

  // 👑 ПОКУПКА VIP
  const buyVip = async (tierId: number, stars: number) => {
    if (!userId || buying) return
    haptic('medium')
    setBuying(`vip_${tierId}`)
    try {
      const res = await api.buyVip(userId, tierId) as any
      if (res?.invoice_url) {
        hapticSuccess()
        const tg = (window as any).Telegram?.WebApp
        if (tg?.openInvoice) {
          tg.openInvoice(res.invoice_url, (status: string) => {
            if (status === 'paid') setTimeout(loadAll, 1500)
          })
        } else {
          window.open(res.invoice_url, '_blank')
        }
      }
    } catch (e) {
      alert('Ошибка оплаты')
    }
    setBuying(null)
  }

  // ⭐ ПОКУПКА XP
  const buyXp = async (packId: string, stars: number) => {
    if (!userId || buying) return
    haptic('medium')
    setBuying(`xp_${packId}`)
    try {
      const res = await api.buyXpPack(userId, packId) as any
      if (res?.invoice_url) {
        hapticSuccess()
        const tg = (window as any).Telegram?.WebApp
        if (tg?.openInvoice) {
          tg.openInvoice(res.invoice_url, (status: string) => {
            if (status === 'paid') setTimeout(loadAll, 1500)
          })
        } else {
          window.open(res.invoice_url, '_blank')
        }
      }
    } catch (e) {
      alert('Ошибка оплаты')
    }
    setBuying(null)
  }

  // 🔥 ХИТЫ — собираем лучшее
  const getHits = (): ShopItem[] => {
    const hits: ShopItem[] = []

    // Лучший кейс (самый дорогой = обычно лучший)
    const bestCase = cases.length > 0
      ? [...cases].sort((a, b) => b.stars - a.stars)[0]
      : null
    if (bestCase) {
      hits.push({
        id: `hit_case_${bestCase.id}`,
        type: 'case',
        name: bestCase.name,
        desc: `🔥 ТОП-кейс · ${bestCase.rewards.length} наград`,
        stars: bestCase.stars,
      })
    }

    // VIP 3 (Платина — обычно ХИТ)
    const vip3 = vipTiers.find(v => v.id === 3) || vipTiers[2]
    if (vip3) {
      hits.push({
        id: `hit_vip_${vip3.id}`,
        type: 'vip',
        name: `${vip3.icon} VIP ${vip3.id} — ${vip3.name}`,
        desc: `💸 Кэшбэк ${vip3.cashback}% · 🎁 +${fmt(vip3.bonus)}`,
        stars: vip3.stars,
      })
    }

    // Лучший буст (самый дорогой / с максимальным множителем)
    const bestBoost = shopItems.filter(i => i.type === 'boost').sort((a, b) => (b.mult || 0) - (a.mult || 0))[0]
    if (bestBoost && bestBoost.stars) {
      hits.push({
        id: `hit_boost_${bestBoost.id}`,
        type: 'boost',
        name: bestBoost.name,
        desc: `⚡ Множитель ×${bestBoost.mult}`,
        stars: bestBoost.stars,
      })
    }

    // Лучший XP-пак
    const bestXp = xpPacks.length > 0
      ? [...xpPacks].sort((a, b) => b.xp - a.xp)[0]
      : null
    if (bestXp) {
      hits.push({
        id: `hit_xp_${bestXp.id}`,
        type: 'xp',
        name: `⭐ +${bestXp.xp} XP`,
        desc: `📊 Мгновенно ${bestXp.xp} XP`,
        stars: bestXp.stars,
      })
    }

    return hits
  }

  // ─── РЕНДЕР КАРТОЧКИ ТОВАРА (магазин) ───
  const renderShopCard = (item: ShopItem) => {
    const style = TYPE_STYLES[item.type] || TYPE_STYLES.boost
    const icon = item.type === 'boost' ? '⚡' : item.type === 'title' ? '🏷️' : item.type === 'vip' ? '👑' : '🎁'
    const price = item.stars ? `${item.stars} ⭐` : '—'

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`rounded-2xl border-2 ${style.border} bg-gradient-to-br ${style.gradient} p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-casino-bg/70 border border-casino-border flex items-center justify-center text-2xl flex-shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{item.name}</div>
              {item.desc && (
                <div className="text-casino-muted text-[10px] mt-0.5">{item.desc}</div>
              )}
            </div>
          </div>
          <button
            onClick={() => buyStars(item.id, item.name, item.stars || 0)}
            disabled={buying === item.id}
            className="w-full mt-3 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-2.5 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {buying === item.id ? '⏳...' : `⭐ КУПИТЬ ЗА ${price}`}
          </button>
        </div>
      </motion.div>
    )
  }

  // ─── РЕНДЕР VIP ───
  const renderVipCard = (tier: VipTier) => {
    const colors: Record<number, { grad: string; border: string; text: string; badge?: { text: string; color: string } }> = {
      1: { grad: 'from-gray-400/15 to-gray-600/15', border: 'border-gray-400/50', text: 'text-gray-300' },
      2: { grad: 'from-yellow-400/20 to-yellow-600/15', border: 'border-yellow-400/60', text: 'text-yellow-400', badge: { text: '💰 ВЫГОДНО', color: 'bg-yellow-500' } },
      3: { grad: 'from-purple-500/20 to-pink-500/15', border: 'border-purple-400/60', text: 'text-purple-300', badge: { text: '🔥 ХИТ', color: 'bg-gradient-to-r from-orange-500 to-red-500' } },
      4: { grad: 'from-cyan-400/20 to-blue-500/15', border: 'border-cyan-400/60', text: 'text-cyan-300' },
      5: { grad: 'from-yellow-500/25 to-amber-600/20', border: 'border-yellow-500/70', text: 'text-yellow-400', badge: { text: '👑 ЛУЧШЕЕ', color: 'bg-gradient-to-r from-yellow-400 to-amber-600' } },
    }
    const c = colors[tier.id] || colors[1]

    return (
      <motion.div
        key={tier.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`relative rounded-2xl border-2 ${c.border} bg-gradient-to-br ${c.grad} p-4`}>
          {c.badge && (
            <div className={`absolute top-2 right-2 ${c.badge.color} text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow`}>
              {c.badge.text}
            </div>
          )}
          <div className="flex items-center gap-3 mb-3">
            <div className="text-4xl">{tier.icon}</div>
            <div className="flex-1">
              <div className={`font-bold ${c.text}`}>VIP {tier.id} — {tier.name}</div>
              <div className="text-casino-gold text-sm font-black">{tier.stars} ⭐</div>
            </div>
          </div>
          <div className="space-y-1 text-[11px] mb-3">
            <div className="flex justify-between">
              <span className="text-casino-muted">💸 Кэшбэк</span>
              <span className={`font-bold ${c.text}`}>{tier.cashback}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-casino-muted">🎁 Бонус</span>
              <span className="font-bold">+{fmt(tier.bonus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-casino-muted">⏱ Срок</span>
              <span className="font-bold">{tier.duration_days} дней</span>
            </div>
          </div>
          <button
            onClick={() => buyVip(tier.id, tier.stars)}
            disabled={buying === `vip_${tier.id}`}
            className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-2.5 rounded-xl text-sm active:scale-95 disabled:opacity-50"
          >
            {buying === `vip_${tier.id}` ? '⏳...' : `⭐ КУПИТЬ ЗА ${tier.stars} ⭐`}
          </button>
        </div>
      </motion.div>
    )
  }

  // ─── РЕНДЕР КЕЙСА ───
  const renderCaseCard = (c: CaseItem) => {
    const style = TYPE_STYLES.case
    return (
      <motion.div
        key={c.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`rounded-2xl border-2 ${style.border} bg-gradient-to-br ${style.gradient} p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-casino-bg/70 border border-casino-border flex items-center justify-center text-3xl flex-shrink-0">
              🎰
            </div>
            <div className="flex-1">
              <div className="font-bold">{c.name}</div>
              <div className="text-casino-muted text-[10px] mt-0.5">{c.desc || 'Кейс с наградами'}</div>
              <div className="text-casino-gold text-sm font-black mt-1">{c.stars} ⭐</div>
            </div>
          </div>
          <button
            onClick={() => buyCase(c.id, c.stars)}
            disabled={buying === `case_${c.id}`}
            className="w-full mt-3 bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold py-2.5 rounded-xl text-sm active:scale-95 disabled:opacity-50"
          >
            {buying === `case_${c.id}` ? '⏳...' : `⭐ ОТКРЫТЬ ЗА ${c.stars} ⭐`}
          </button>
        </div>
      </motion.div>
    )
  }

  // ─── РЕНДЕР XP ───
  const renderXpCard = (p: XpPack) => {
    const style = TYPE_STYLES.xp
    return (
      <motion.div
        key={p.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`rounded-2xl border-2 ${style.border} bg-gradient-to-br ${style.gradient} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">⭐</div>
              <div>
                <div className="font-bold text-lg">+{p.xp} XP</div>
                <div className="text-casino-muted text-[10px]">Мгновенно</div>
              </div>
            </div>
            <button
              onClick={() => buyXp(p.id, p.stars)}
              disabled={buying === `xp_${p.id}`}
              className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-black font-bold px-4 py-3 rounded-xl text-sm active:scale-95 disabled:opacity-50"
            >
              {buying === `xp_${p.id}` ? '⏳' : `${p.stars} ⭐`}
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── СЕКЦИЯ ───
  const renderSection = (title: string, children: React.ReactNode) => (
    <div className="mb-6">
      <h2 className="text-sm font-bold text-casino-muted mb-3 px-1">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )

  // ─── КОНТЕНТ ПО ТАБАМ ───
  const renderContent = () => {
    const hits = getHits()

    if (activeTab === 'hits') {
      return (
        <div>
          {hits.map(item => {
            if (item.type === 'case') {
              const realCase = cases.find(c => `hit_case_${c.id}` === item.id)
              if (realCase) return renderCaseCard(realCase)
            }
            if (item.type === 'vip') {
              const vipId = parseInt(item.id.replace('hit_vip_', ''))
              const tier = vipTiers.find(v => v.id === vipId)
              if (tier) return renderVipCard(tier)
            }
            if (item.type === 'boost') {
              const realItem = shopItems.find(s => `hit_boost_${s.id}` === item.id)
              if (realItem) return renderShopCard(realItem)
            }
            if (item.type === 'xp') {
              const realXp = xpPacks.find(x => `hit_xp_${x.id}` === item.id)
              if (realXp) return renderXpCard(realXp)
            }
            return null
          })}
        </div>
      )
    }

    if (activeTab === 'boost') {
      const boosts = shopItems.filter(i => i.type === 'boost')
      return boosts.length === 0
        ? <Card><div className="text-center py-8 text-casino-muted">Пусто</div></Card>
        : <div className="space-y-3">{boosts.map(renderShopCard)}</div>
    }

    if (activeTab === 'title') {
      const titles = shopItems.filter(i => i.type === 'title')
      return titles.length === 0
        ? <Card><div className="text-center py-8 text-casino-muted">Пусто</div></Card>
        : <div className="space-y-3">{titles.map(renderShopCard)}</div>
    }

    if (activeTab === 'vip') {
      return vipTiers.length === 0
        ? <Card><div className="text-center py-8 text-casino-muted">Пусто</div></Card>
        : <div className="space-y-3">{vipTiers.map(renderVipCard)}</div>
    }

    if (activeTab === 'case') {
      return cases.length === 0
        ? <Card><div className="text-center py-8 text-casino-muted">Пусто</div></Card>
        : <div className="space-y-3">{cases.map(renderCaseCard)}</div>
    }

    if (activeTab === 'xp') {
      return xpPacks.length === 0
        ? <Card><div className="text-center py-8 text-casino-muted">Пусто</div></Card>
        : <div className="space-y-3">{xpPacks.map(renderXpCard)}</div>
    }

    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-casino-muted">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">🛒</div>
          Загрузка магазина...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* ЗАГОЛОВОК */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-casino-gold">🛒 МАГАЗИН</h1>
      </div>

      {/* ТАБЫ — В ОДИН РЯД, СКРОЛЛ */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { haptic('light'); setActiveTab(tab.id) }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-black shadow-gold'
                : 'bg-casino-card text-casino-muted border border-casino-border'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* КОНТЕНТ */}
      {renderContent()}

      {/* ИНФО */}
      <div className="text-center text-casino-muted text-[10px] mt-6 mb-2">
        💡 Все покупки за Telegram Stars ⭐
      </div>
    </div>
  )
}