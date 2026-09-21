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
  getBalance: (userId: number) => apiGet(`/api/balance/${userId}`),
  getProfile: (userId: number) => apiGet(`/api/profile/${userId}`),
  getShop: () => apiGet('/api/shop'),
  getCases: () => apiGet('/api/cases'),
  getInventory: (userId: number) => apiGet(`/api/inventory/${userId}`),
  getJackpot: () => apiGet('/api/jackpot'),
  getDailyStatus: (userId: number) => apiGet(`/api/daily/status/${userId}`),
  claimDaily: (userId: number) => apiPost('/api/daily/claim', { user_id: userId }),
  getTop: (mode: string = 'balance') => apiGet(`/api/top?mode=${mode}`),
  getMarketLots: () => apiGet('/api/market/lots'),
}