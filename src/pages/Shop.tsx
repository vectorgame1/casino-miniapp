import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../components/Card'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

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

interface TokensPack {
  id: string
  amount: number
  stars: number
}

const TABS = [
  { id: 'hits', label: 'ХИТЫ' },
  { id: 'tokens', label: 'TOKENS' },
  { id: 'boost', label: 'БУСТЫ' },
  { id: 'vip', label: 'VIP' },
  { id: 'case', label: 'КЕЙСЫ' },
  { id: 'xp', label: 'XP' },
  { id: 'title', label: 'ТИТУЛЫ' },
]

export function Shop() {
  const { userId, haptic, hapticSuccess } = useTelegram()
  const [activeTab, setActiveTab] = useState('hits')
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)

  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [vipTiers, setVipTiers] = useState<VipTier[]>([])
  const [cases, setCases] = useState<CaseItem[]>([])
  const [xpPacks, setXpPacks] = useState<XpPack[]>([])
  const [tokensPacks, setTokensPacks] = useState<TokensPack[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    const [shopRes, vipRes, casesRes, xpRes, tokensRes] = await Promise.all([
      api.getShop(),
      api.getVipTiers(),
      api.getCases(),
      api.getXpPacks(),
      (api as any).getTokensPacks ? (api as any).getTokensPacks() : Promise.resolve([]),
    ])
    if (Array.isArray(shopRes)) setShopItems(shopRes as ShopItem[])
    if (Array.isArray(vipRes)) setVipTiers(vipRes as VipTier[])
    if (Array.isArray(casesRes)) setCases(casesRes as CaseItem[])
    if (Array.isArray(xpRes)) setXpPacks(xpRes as XpPack[])
    if (Array.isArray(tokensRes)) setTokensPacks(tokensRes as TokensPack[])
    setLoading(false)
  }

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const openInvoice = (url: string) => {
    hapticSuccess()
    const tg = (window as any).Telegram?.WebApp
    if (tg?.openInvoice) {
      tg.openInvoice(url, (status: string) => {
        if (status === 'paid') setTimeout(loadAll, 1500)
      })
    } else {
      window.open(url, '_blank')
    }
  }

  const buyStars = async (itemId: string) => {
    if (!userId || buying) return
    haptic('medium')
    setBuying(itemId)
    try {
      const res = await api.buyShopItem(userId, itemId) as any
      if (res?.invoice_url) openInvoice(res.invoice_url)
      else if (res?.error) alert(res.error)
    } catch { alert('Ошибка оплаты') }
    setBuying(null)
  }

  const buyCase = async (caseId: string) => {
    if (!userId || buying) return
    haptic('medium')
    setBuying(`case_${caseId}`)
    try {
      const res = await api.buyCase(userId, caseId) as any
      if (res?.invoice_url) openInvoice(res.invoice_url)
    } catch { alert('Ошибка оплаты') }
    setBuying(null)
  }

  const buyVip = async (tierId: number) => {
    if (!userId || buying) return
    haptic('medium')
    setBuying(`vip_${tierId}`)
    try {
      const res = await api.buyVip(userId, tierId) as any
      if (res?.invoice_url) openInvoice(res.invoice_url)
    } catch { alert('Ошибка оплаты') }
    setBuying(null)
  }

  const buyXp = async (packId: string) => {
    if (!userId || buying) return
    haptic('medium')
    setBuying(`xp_${packId}`)
    try {
      const res = await api.buyXpPack(userId, packId) as any
      if (res?.invoice_url) openInvoice(res.invoice_url)
    } catch { alert('Ошибка оплаты') }
    setBuying(null)
  }

  const buyTokensPack = async (packId: string) => {
    if (!userId || buying) return
    haptic('medium')
    setBuying(`tokens_${packId}`)
    try {
      const apiAny = api as any
      if (!apiAny.buyTokensPack) {
        alert('Покупка Tokens временно недоступна')
        setBuying(null)
        return
      }
      const res = await apiAny.buyTokensPack(userId, packId) as any
      if (res?.invoice_url) openInvoice(res.invoice_url)
      else if (res?.error) alert(res.error)
    } catch { alert('Ошибка оплаты') }
    setBuying(null)
  }

  const renderShopCard = (item: ShopItem) => {
    const price = item.stars ? `${item.stars} STARS` : '—'
    const typeLabel = item.type === 'boost' ? 'БУСТ' : item.type === 'title' ? 'ТИТУЛ' : item.type === 'vip' ? 'VIP' : 'ТОВАР'

    return (
      <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-casino-bg/70 border border-casino-border/60 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.6">
                {item.type === 'boost' && <path d="M13 2 L4 14 H11 L10 22 L19 10 H12 Z" />}
                {item.type === 'title' && <><path d="M4 7 H20 L21 20 A1 1 0 0 1 20 21 H4 A1 1 0 0 1 3 20 Z" /><path d="M9 7 V4 H15 V7" /></>}
                {item.type === 'vip' && <path d="M3 17 L5 7 L10 11 L12 5 L14 11 L19 7 L21 17 Z" />}
                {item.type !== 'boost' && item.type !== 'title' && item.type !== 'vip' && <circle cx="12" cy="12" r="9" />}
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] tracking-widest uppercase text-casino-muted font-display">{typeLabel}</div>
              <div className="font-display tracking-wider text-casino-text truncate">{item.name}</div>
              {item.desc && <div className="text-casino-muted text-[10px] mt-0.5">{item.desc}</div>}
            </div>
          </div>
          <button
            onClick={() => buyStars(item.id)}
            disabled={buying === item.id}
            className="w-full mt-3 bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-2.5 rounded-lg text-sm tracking-widest active:scale-95 disabled:opacity-50"
          >
            {buying === item.id ? '...' : `КУПИТЬ ЗА ${price}`}
          </button>
        </Card>
      </motion.div>
    )
  }

  const renderTokensPack = (pack: TokensPack) => {
    return (
      <motion.div key={pack.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-casino-bg/70 border border-casino-gold/40 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.6">
                <path d="M6 3 H18 L22 9 L12 21 L2 9 Z" />
                <path d="M2 9 H22 M12 21 L9 9 L12 3 L15 9 L12 21" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[9px] tracking-widest uppercase text-casino-muted font-display">TOKENS</div>
              <div className="font-display tracking-wider text-casino-gold text-lg">
                {fmt(pack.amount)} TOKENS
              </div>
            </div>
            <div className="text-right">
              <div className="font-display tracking-wider text-casino-text text-lg">{pack.stars}</div>
              <div className="text-[9px] tracking-widest uppercase text-casino-muted">STARS</div>
            </div>
          </div>
          <button
            onClick={() => buyTokensPack(pack.id)}
            disabled={buying === `tokens_${pack.id}`}
            className="w-full mt-3 bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-3 rounded-lg text-sm tracking-widest active:scale-95 disabled:opacity-50"
          >
            {buying === `tokens_${pack.id}` ? '...' : 'КУПИТЬ'}
          </button>
        </Card>
      </motion.div>
    )
  }

  const renderVipCard = (tier: VipTier) => {
    return (
      <motion.div key={tier.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-casino-bg/70 border border-casino-gold/40 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#D4AF37">
                <path d="M3 17 L5 7 L10 11 L12 5 L14 11 L19 7 L21 17 Z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-display tracking-wider text-casino-gold">
                VIP {tier.id} — {tier.name.toUpperCase()}
              </div>
              <div className="text-casino-gold text-sm font-display tracking-widest mt-0.5">
                {tier.stars} STARS
              </div>
            </div>
          </div>
          <div className="space-y-1.5 text-[11px] mb-3">
            <div className="flex justify-between">
              <span className="text-casino-muted tracking-wider">КЭШБЭК</span>
              <span className="font-display tracking-wider text-casino-text">{tier.cashback}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-casino-muted tracking-wider">БОНУС</span>
              <span className="font-display tracking-wider text-casino-text">+{fmt(tier.bonus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-casino-muted tracking-wider">СРОК</span>
              <span className="font-display tracking-wider text-casino-text">{tier.duration_days} ДН.</span>
            </div>
          </div>
          <button
            onClick={() => buyVip(tier.id)}
            disabled={buying === `vip_${tier.id}`}
            className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-3 rounded-lg text-sm tracking-widest active:scale-95 disabled:opacity-50"
          >
            {buying === `vip_${tier.id}` ? '...' : `КУПИТЬ ЗА ${tier.stars}`}
          </button>
        </Card>
      </motion.div>
    )
  }

  const renderCaseCard = (c: CaseItem) => {
    return (
      <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-casino-bg/70 border border-casino-gold/40 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.6">
                <rect x="3" y="7" width="18" height="14" rx="2" />
                <path d="M3 11 H21 M12 7 V11" />
                <path d="M9 7 V4 H15 V7" />
                <circle cx="12" cy="15" r="2" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-display tracking-wider text-casino-text">{c.name}</div>
              <div className="text-casino-muted text-[10px] mt-0.5">{c.desc || 'Кейс с наградами'}</div>
              <div className="text-casino-gold text-sm font-display tracking-widest mt-1">{c.stars} STARS</div>
            </div>
          </div>
          <button
            onClick={() => buyCase(c.id)}
            disabled={buying === `case_${c.id}`}
            className="w-full mt-3 bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display py-3 rounded-lg text-sm tracking-widest active:scale-95 disabled:opacity-50"
          >
            {buying === `case_${c.id}` ? '...' : `ОТКРЫТЬ ЗА ${c.stars}`}
          </button>
        </Card>
      </motion.div>
    )
  }

  const renderXpCard = (p: XpPack) => {
    return (
      <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-casino-bg/70 border border-casino-gold/40 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.6">
                  <path d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17.5 L6 21 L7 14 L2 9 L9 8 Z" />
                </svg>
              </div>
              <div>
                <div className="font-display tracking-wider text-casino-text text-lg">+{p.xp} XP</div>
                <div className="text-casino-muted text-[10px] tracking-widest uppercase">МГНОВЕННО</div>
              </div>
            </div>
            <button
              onClick={() => buyXp(p.id)}
              disabled={buying === `xp_${p.id}`}
              className="bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display px-4 py-3 rounded-lg text-sm tracking-widest active:scale-95 disabled:opacity-50"
            >
              {buying === `xp_${p.id}` ? '...' : `${p.stars}`}
            </button>
          </div>
        </Card>
      </motion.div>
    )
  }

  const getHits = (): ShopItem[] => {
    const hits: ShopItem[] = []
    const bestCase = cases.length > 0 ? [...cases].sort((a, b) => b.stars - a.stars)[0] : null
    if (bestCase) hits.push({ id: `hit_case_${bestCase.id}`, type: 'case', name: bestCase.name, desc: `ТОП-КЕЙС · ${bestCase.rewards.length} наград`, stars: bestCase.stars })
    const vip3 = vipTiers.find(v => v.id === 3) || vipTiers[2]
    if (vip3) hits.push({ id: `hit_vip_${vip3.id}`, type: 'vip', name: `VIP ${vip3.id} — ${vip3.name}`, desc: `Кэшбэк ${vip3.cashback}% · +${fmt(vip3.bonus)}`, stars: vip3.stars })
    const bestBoost = shopItems.filter(i => i.type === 'boost').sort((a, b) => (b.mult || 0) - (a.mult || 0))[0]
    if (bestBoost && bestBoost.stars) hits.push({ id: `hit_boost_${bestBoost.id}`, type: 'boost', name: bestBoost.name, desc: `Множитель ×${bestBoost.mult}`, stars: bestBoost.stars })
    const bestXp = xpPacks.length > 0 ? [...xpPacks].sort((a, b) => b.xp - a.xp)[0] : null
    if (bestXp) hits.push({ id: `hit_xp_${bestXp.id}`, type: 'xp', name: `+${bestXp.xp} XP`, desc: `Мгновенно ${bestXp.xp} XP`, stars: bestXp.stars })
    return hits
  }

  const renderContent = () => {
    if (activeTab === 'hits') {
      const hits = getHits()
      return (
        <div className="space-y-3">
          {hits.map(item => {
            if (item.type === 'case') {
              const rc = cases.find(c => `hit_case_${c.id}` === item.id)
              if (rc) return renderCaseCard(rc)
            }
            if (item.type === 'vip') {
              const vid = parseInt(item.id.replace('hit_vip_', ''))
              const tier = vipTiers.find(v => v.id === vid)
              if (tier) return renderVipCard(tier)
            }
            if (item.type === 'boost') {
              const ri = shopItems.find(s => `hit_boost_${s.id}` === item.id)
              if (ri) return renderShopCard(ri)
            }
            if (item.type === 'xp') {
              const rx = xpPacks.find(x => `hit_xp_${x.id}` === item.id)
              if (rx) return renderXpCard(rx)
            }
            return null
          })}
        </div>
      )
    }

    if (activeTab === 'tokens') {
      return tokensPacks.length === 0
        ? <Card><div className="text-center py-8 text-casino-muted font-display tracking-widest">СКОРО</div></Card>
        : <div className="space-y-3">{tokensPacks.map(renderTokensPack)}</div>
    }

    if (activeTab === 'boost') {
      const boosts = shopItems.filter(i => i.type === 'boost')
      return boosts.length === 0
        ? <Card><div className="text-center py-8 text-casino-muted font-display tracking-widest">ПУСТО</div></Card>
        : <div className="space-y-3">{boosts.map(renderShopCard)}</div>
    }

    if (activeTab === 'title') {
      const titles = shopItems.filter(i => i.type === 'title')
      return titles.length === 0
        ? <Card><div className="text-center py-8 text-casino-muted font-display tracking-widest">ПУСТО</div></Card>
        : <div className="space-y-3">{titles.map(renderShopCard)}</div>
    }

    if (activeTab === 'vip') {
      return vipTiers.length === 0
        ? <Card><div className="text-center py-8 text-casino-muted font-display tracking-widest">ПУСТО</div></Card>
        : <div className="space-y-3">{vipTiers.map(renderVipCard)}</div>
    }

    if (activeTab === 'case') {
      return cases.length === 0
        ? <Card><div className="text-center py-8 text-casino-muted font-display tracking-widest">ПУСТО</div></Card>
        : <div className="space-y-3">{cases.map(renderCaseCard)}</div>
    }

    if (activeTab === 'xp') {
      return xpPacks.length === 0
        ? <Card><div className="text-center py-8 text-casino-muted font-display tracking-widest">ПУСТО</div></Card>
        : <div className="space-y-3">{xpPacks.map(renderXpCard)}</div>
    }

    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-casino-muted">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-casino-gold/30 border-t-casino-gold rounded-full animate-spin mx-auto mb-3" />
          <div className="text-[10px] tracking-widest uppercase">Загрузка</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <div className="text-center mb-4">
        <h1 className="font-display text-3xl tracking-widest text-casino-gold">МАГАЗИН</h1>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { haptic('light'); setActiveTab(tab.id) }}
            className={`flex-shrink-0 px-3.5 py-2 rounded-lg font-display text-[10px] tracking-widest transition-all whitespace-nowrap border ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg border-transparent shadow-gold'
                : 'bg-casino-card text-casino-muted border-casino-border/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}

      <div className="text-center text-casino-muted text-[9px] mt-6 mb-2 tracking-widest uppercase font-display">
        Все покупки за Telegram Stars
      </div>
    </div>
  )
}