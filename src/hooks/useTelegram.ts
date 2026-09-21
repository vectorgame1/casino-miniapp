export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

export function useTelegram() {
  const tg = (window as any).Telegram?.WebApp
  const user: TelegramUser | null = tg?.initDataUnsafe?.user || null

  const close = () => tg?.close()
  const expand = () => tg?.expand()
  const ready = () => tg?.ready()

  const haptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    try { tg?.HapticFeedback?.impactOccurred(type) } catch (e) {}
  }

  const hapticSuccess = () => {
    try { tg?.HapticFeedback?.notificationOccurred('success') } catch (e) {}
  }

  const hapticError = () => {
    try { tg?.HapticFeedback?.notificationOccurred('error') } catch (e) {}
  }

  return {
    tg, user,
    userId: user?.id || 0,
    username: user?.username || user?.first_name || 'Гость',
    close, expand, ready, haptic, hapticSuccess, hapticError,
    isTelegram: !!tg?.initData,
  }
}