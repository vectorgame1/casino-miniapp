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
  
  // Джекпот
  getJackpot: () => apiGet('/api/jackpot'),
  
  // Ежедневный бонус
  getDailyStatus: (userId: number) => apiGet(`/api/daily/status/${userId}`),
  claimDaily: (userId: number) => apiPost('/api/daily/claim', { user_id: userId }),
  
  // Топ
  getTop: (mode: string = 'balance') => apiGet(`/api/top?mode=${mode}`),
  
  // Рынок
  getMarketLots: () => apiGet('/api/market/lots'),
  
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