const API_URL = 'https://casino-bot-1wdp.onrender.com'

export async function apiGet<T = any>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error('API error:', e)
    return null
  }
}

export async function apiPost<T = any>(path: string, body: any): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error('API error:', e)
    return null
  }
}

export const api = {
  // Профиль
  getBalance: (userId: number) => apiGet(`/api/balance/${userId}`),
  getProfile: (userId: number) => apiGet(`/api/profile/${userId}`),

  // Магазин
  getShop: () => apiGet('/api/shop'),
  buyShopItem: (userId: number, itemId: string) =>
    apiPost('/api/shop/buy', { user_id: userId, item_id: itemId }),

  // Кейсы
  getCases: () => apiGet('/api/cases'),
  buyCase: (userId: number, caseId: string) =>
    apiPost('/api/cases/buy', { user_id: userId, case_id: caseId }),
  getLastReward: (userId: number) => apiGet(`/api/cases/last_reward/${userId}`),

  // Инвентарь
  getInventory: (userId: number) => apiGet(`/api/inventory/${userId}`),
  sellInventoryItem: (userId: number, invId: string, price: number) =>
    apiPost('/api/inventory/sell', { user_id: userId, inv_id: invId, price }),

  // Джекпот
  getJackpot: () => apiGet('/api/jackpot'),

  // Ежедневный бонус
  getDailyStatus: (userId: number) => apiGet(`/api/daily/status/${userId}`),
  claimDaily: (userId: number) => apiPost('/api/daily/claim', { user_id: userId }),

  // Топ
  getTop: (mode: string = 'balance') => apiGet(`/api/top?mode=${mode}`),

  // Рынок
  getMarketLots: () => apiGet('/api/market/lots'),
  buyMarketLot: (userId: number, lotId: string) =>
    apiPost('/api/market/buy', { user_id: userId, lot_id: lotId }),
  removeMarketLot: (userId: number, lotId: string) =>
    apiPost('/api/market/remove', { user_id: userId, lot_id: lotId }),

  // ═══════════════ VIP ═══════════════
  getVipTiers: () => apiGet('/api/vip'),
  buyVip: (userId: number, tierId: number) =>
    apiPost('/api/vip/buy', { user_id: userId, tier_id: tierId }),

  // ═══════════════ XP ═══════════════
  getXpPacks: () => apiGet('/api/xp'),
  buyXpPack: (userId: number, packId: string) =>
    apiPost('/api/xp/buy', { user_id: userId, pack_id: packId }),

  // ═══════════════ ЗАДАНИЯ ═══════════════
  getQuests: (userId: number) => apiGet(`/api/quests/${userId}`),
  claimQuest: (userId: number, questKey: string) =>
    apiPost('/api/quests/claim', { user_id: userId, quest_key: questKey }),

  // ═══════════════ ТУРНИР ═══════════════
  getTournament: () => apiGet('/api/tournament'),

  // ═══════════════ ИГРЫ ═══════════════
  gameRoulette: (userId: number, bet: number, choice: string) =>
    apiPost('/api/game/roulette', { user_id: userId, bet, choice }),

  gameSlots: (userId: number, bet: number) =>
    apiPost('/api/game/slots', { user_id: userId, bet }),

  gameCoin: (userId: number, bet: number, choice: string) =>
    apiPost('/api/game/coin', { user_id: userId, bet, choice }),

  minesStart: (userId: number, bet: number, level: string) =>
    apiPost('/api/game/mines/start', { user_id: userId, bet, level }),

  minesOpen: (userId: number, idx: number) =>
    apiPost('/api/game/mines/open', { user_id: userId, idx }),

  minesCashout: (userId: number) =>
    apiPost('/api/game/mines/cashout', { user_id: userId }),
}