import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../components/Card'
import { InfoModal } from '../components/InfoModal'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'

interface CreditInfo {
  status: 'available' | 'active' | 'blocked' | 'used'
  amount?: number
  due_at?: string
  days_left?: number
  reason?: string
}

interface CreditHistory {
  id: number
  amount: number
  issued_at: string
  due_at: string
  returned_at: string | null
  status: string
}

export function Credits() {
  const { userId, haptic, hapticSuccess, hapticError } = useTelegram()
  const [info, setInfo] = useState<CreditInfo | null>(null)
  const [history, setHistory] = useState<CreditHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [amount, setAmount] = useState('50000')
  const [issuing, setIssuing] = useState(false)
  const [returning, setReturning] = useState(false)

  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ')

  const loadData = async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await api.getCredits(userId) as any
      if (res?.info) setInfo(res.info)
      if (Array.isArray(res?.history)) setHistory(res.history)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [userId])

  const handleTake = async () => {
    const amt = parseInt(amount)
    if (!amt || amt < 50000 || amt > 500000) {
      hapticError()
      alert('Сумма от 50 000 до 500 000')
      return
    }
    haptic('medium')
    setIssuing(true)
    try {
      const res = await api.takeCredit(userId, amt) as any
      if (res?.success) {
        hapticSuccess()
        setShowModal(false)
        await loadData()
      } else {
        alert(res?.error || 'Ошибка')
      }
    } catch (e) {
      alert('Ошибка')
    }
    setIssuing(false)
  }

  const handleReturn = async () => {
    if (!confirm('Вернуть кредит полностью?')) return
    haptic('medium')
    setReturning(true)
    try {
      const res = await api.returnCredit(userId) as any
      if (res?.success) {
        hapticSuccess()
        await loadData()
        alert('Кредит возвращён!')
      } else {
        alert(res?.error || 'Ошибка')
      }
    } catch (e) {
      alert('Ошибка')
    }
    setReturning(false)
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
      {/* ЗАГОЛОВОК + КНОПКА ? */}
      <div className="text-center mb-6 relative">
        <h1 className="font-display text-3xl tracking-widest text-casino-gold">КРЕДИТЫ</h1>
        <p className="text-casino-muted text-[10px] tracking-widest uppercase mt-1">
          Без процентов · 3 дня
        </p>
        <button
          onClick={() => { haptic('light'); setShowInfo(true) }}
          className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-lg bg-casino-bg/80 border border-casino-border/60 text-casino-gold active:scale-95 z-10"
        >
          ?
        </button>
      </div>

      {info?.status === 'available' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="text-center py-4">
              <div className="flex justify-center mb-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.6">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10 H22" />
                  <path d="M6 15 H10" />
                </svg>
              </div>
              <div className="font-display tracking-widest text-casino-gold text-xl mb-1">
                ДОСТУПНО
              </div>
              <div className="text-[10px] tracking-widest uppercase text-casino-muted">
                Сумма: 50 000 — 500 000
              </div>
              <button
                onClick={() => { haptic('light'); setShowModal(true) }}
                className="w-full mt-4 bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display tracking-widest py-3 rounded-lg shadow-gold"
              >
                ВЗЯТЬ КРЕДИТ
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {info?.status === 'active' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-casino-gold/60">
            <div className="py-2">
              <div className="text-center mb-4">
                <div className="text-[10px] tracking-widest uppercase text-casino-gold">
                  АКТИВНЫЙ КРЕДИТ
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center border-b border-casino-border/30 pb-2">
                  <span className="text-casino-muted text-xs tracking-wider">СУММА</span>
                  <span className="font-display tracking-wider text-casino-gold text-lg">
                    {fmt(info.amount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-casino-border/30 pb-2">
                  <span className="text-casino-muted text-xs tracking-wider">ОСТАЛОСЬ</span>
                  <span className={`font-display tracking-wider text-lg ${(info.days_left || 0) <= 1 ? 'text-casino-redLight' : 'text-casino-text'}`}>
                    {info.days_left} дн.
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-casino-muted text-xs tracking-wider">СРОК</span>
                  <span className="text-casino-text text-sm">
                    {info.due_at ? new Date(info.due_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleReturn}
                disabled={returning}
                className="w-full bg-gradient-to-r from-casino-green to-casino-greenLight text-casino-bg font-display tracking-widest py-3 rounded-lg disabled:opacity-50"
              >
                {returning ? '...' : 'ВЕРНУТЬ КРЕДИТ'}
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {info?.status === 'blocked' && (
        <Card className="border-casino-redLight/60">
          <div className="text-center py-6">
            <div className="flex justify-center mb-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C41E3A" strokeWidth="1.6">
                <circle cx="12" cy="12" r="10" />
                <path d="M4.93 4.93 L19.07 19.07" />
              </svg>
            </div>
            <div className="font-display tracking-widest text-casino-redLight text-xl mb-1">
              ЗАБЛОКИРОВАНО
            </div>
            <div className="text-[10px] tracking-wider text-casino-muted">
              {info.reason || 'Свяжитесь с админом'}
            </div>
          </div>
        </Card>
      )}

      {info?.status === 'used' && (
        <Card>
          <div className="text-center py-6">
            <div className="font-display tracking-widest text-casino-muted text-lg mb-1">
              ИСПОЛЬЗОВАНО
            </div>
            <div className="text-[10px] tracking-wider text-casino-muted">
              Вы уже брали кредит
            </div>
          </div>
        </Card>
      )}

      {/* ИСТОРИЯ */}
      {history.length > 0 && (
        <div className="mt-6">
          <div className="text-casino-muted text-[10px] tracking-widest uppercase mb-2">
            ИСТОРИЯ КРЕДИТОВ
          </div>
          <div className="space-y-2">
            {history.map((h) => (
              <Card key={h.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display tracking-wider text-casino-text">
                      {fmt(h.amount)} TOKENS
                    </div>
                    <div className="text-[9px] tracking-widest uppercase text-casino-muted mt-0.5">
                      {new Date(h.issued_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className={`font-display tracking-wider text-[10px] px-2 py-1 rounded border ${
                    h.status === 'returned' ? 'text-casino-greenLight border-casino-greenLight/40' :
                    h.status === 'active' ? 'text-casino-gold border-casino-gold/40' :
                    'text-casino-redLight border-casino-redLight/40'
                  }`}>
                    {h.status === 'returned' ? 'ВОЗВРАЩЁН' : h.status === 'active' ? 'АКТИВЕН' : 'ПРОСРОЧЕН'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* МОДАЛКА ВЫБОРА СУММЫ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-casino-card border border-casino-border/60 rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-display text-casino-gold text-xl text-center mb-4 tracking-widest">
                СУММА КРЕДИТА
              </div>
              <div className="text-casino-muted text-[10px] tracking-wider text-center mb-3">
                От 50 000 до 500 000
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-casino-bg border border-casino-border/60 rounded-lg px-4 py-3 text-casino-text text-lg text-center font-display tracking-wider"
              />
              <div className="flex gap-2 mt-3">
                {[50000, 100000, 250000, 500000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v.toString())}
                    className="flex-1 bg-casino-bg border border-casino-border/60 text-casino-muted py-2 rounded-lg text-[10px] font-display tracking-wider active:scale-95"
                  >
                    {v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleTake}
                  disabled={issuing}
                  className="w-full bg-gradient-to-r from-casino-gold to-casino-gold2 text-casino-bg font-display tracking-widest py-3 rounded-lg disabled:opacity-50"
                >
                  {issuing ? '...' : 'ВЗЯТЬ'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-casino-bg border border-casino-border/60 text-casino-muted font-display tracking-widest py-3 rounded-lg"
                >
                  ОТМЕНА
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* МОДАЛКА ИНФО */}
      <InfoModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title="КРЕДИТЫ"
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.6">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10 H22" />
            <path d="M6 15 H10" />
          </svg>
        }
      >
        <p>Кредит — это Tokens, которые ты берёшь в долг у казино.</p>
        <p><b className="text-casino-gold">Условия:</b></p>
        <p>• Сумма: <b>50 000 — 500 000</b></p>
        <p>• Срок: <b>3 дня</b></p>
        <p>• Процент: <b>0%</b></p>
        <p className="text-casino-redLight">• При просрочке — БЛОКИРОВКА аккаунта</p>
        <p>💡 Возврат — вручную на этой же странице.</p>
      </InfoModal>
    </div>
  )
}