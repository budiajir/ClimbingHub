'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Users, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Gym } from '@/lib/mock-data'

interface SlotPickerProps {
  gym: Gym
  onBook: (booking: BookingData) => void
}

export interface BookingData {
  gymId: string
  gymName: string
  session: 'morning' | 'afternoon' | 'evening'
  sessionLabel: string
  sessionTime: string
  date: string
  quantity: number
  addons: Record<string, number>
  totalPrice: number
}

const sessions = [
  { key: 'morning' as const, label: 'Morning', time: '07:00 – 10:00', icon: '🌅' },
  { key: 'afternoon' as const, label: 'Afternoon', time: '11:00 – 14:00', icon: '☀️' },
  { key: 'evening' as const, label: 'Evening', time: '15:00 – 20:00', icon: '🌆' },
]

const addonItems = [
  { key: 'shoes', label: 'Climbing Shoes', price: 25000, icon: '👟' },
  { key: 'chalk', label: 'Chalk Bag', price: 10000, icon: '🤍' },
  { key: 'crashpad', label: 'Crash Pad', price: 50000, icon: '🛏️' },
]

export default function SlotPicker({ gym, onBook }: SlotPickerProps) {
  const [selectedSession, setSelectedSession] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  const [quantity, setQuantity] = useState(1)
  const [addons, setAddons] = useState<Record<string, number>>({})

  const selectedDate = new Date()
  selectedDate.setDate(selectedDate.getDate() + 1)
  const dateStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  const addonsTotal = Object.entries(addons).reduce((sum, [key, qty]) => {
    const item = addonItems.find(a => a.key === key)
    return sum + (item?.price || 0) * qty
  }, 0)
  const total = (gym.pricePerSession * quantity) + addonsTotal

  const slotCount = gym.slots[selectedSession]
  const maxSlot = gym.maxSlots[selectedSession]
  const pct = (slotCount / maxSlot) * 100

  return (
    <div className="space-y-4">
      {/* Session picker */}
      <div>
        <p className="text-slate-ash text-[11px] uppercase tracking-wider mb-2 font-light">Select Session — {dateStr}</p>
        <div className="grid grid-cols-3 gap-2">
          {sessions.map(s => {
            const remaining = gym.slots[s.key]
            const isFull = remaining === 0
            const isSelected = selectedSession === s.key
            return (
              <button
                key={s.key}
                onClick={() => !isFull && setSelectedSession(s.key)}
                disabled={isFull}
                className={`rounded-xl p-3 border transition-all touch-ripple ${
                  isSelected
                    ? 'border-lime/50 bg-lime/10'
                    : isFull
                    ? 'border-white/5 opacity-40 cursor-not-allowed'
                    : 'border-white/5 bg-granite hover:border-white/10'
                }`}
              >
                <div className="text-xl mb-1">{s.icon}</div>
                <div className={`text-xs ${isSelected ? 'text-lime font-bold' : 'text-chalk font-normal'}`}>
                  {s.label}
                </div>
                <div className="text-[10px] text-slate-ash mb-1 font-light">{s.time}</div>
                <div
                  className={`text-[10px] font-light ${
                    isFull ? 'text-redpoint font-bold' : pct > 50 ? 'text-lime' : 'text-project'
                  }`}
                >
                  {isFull ? 'FULL' : `${remaining} slots`}
                </div>
                {/* Mini quota bar */}
                <div className="mt-1.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(remaining / maxSlot) * 100}%`,
                      backgroundColor: isFull ? '#EF4444' : remaining / maxSlot > 0.5 ? '#CCFF00' : '#FF6B00',
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <p className="text-slate-ash text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1 font-light">
          <Users size={11} /> Climber Passes
        </p>
        <div className="flex items-center gap-4 bg-granite rounded-xl p-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 rounded-lg bg-crag flex items-center justify-center text-chalk touch-ripple font-light"
          >
            <Minus size={16} />
          </button>
          <span className="flex-1 text-center text-chalk font-bold text-lg">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(slotCount, quantity + 1))}
            className="w-9 h-9 rounded-lg bg-crag flex items-center justify-center text-chalk touch-ripple font-light"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Add-ons */}
      <div>
        <p className="text-slate-ash text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1 font-light">
          <ShoppingBag size={11} /> Rental Add-ons (Optional)
        </p>
        <div className="space-y-2">
          {addonItems.map(item => {
            const qty = addons[item.key] || 0
            return (
              <div key={item.key} className="flex items-center justify-between bg-granite rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="text-chalk text-sm font-normal">{item.label}</div>
                    <div className="text-slate-ash text-[11px] font-light">
                      +Rp {item.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddons(a => ({ ...a, [item.key]: Math.max(0, (a[item.key] || 0) - 1) }))}
                    className="w-7 h-7 rounded-lg bg-crag flex items-center justify-center text-slate-ash touch-ripple"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-chalk text-sm w-5 text-center font-bold">{qty}</span>
                  <button
                    onClick={() => setAddons(a => ({ ...a, [item.key]: (a[item.key] || 0) + 1 }))}
                    className="w-7 h-7 rounded-lg bg-crag flex items-center justify-center text-chalk touch-ripple"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Price summary */}
      <div className="bg-lime/5 border border-lime/10 rounded-xl p-4">
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-ash font-light">Day Pass ({quantity}x)</span>
            <span className="text-chalk font-normal">Rp {(gym.pricePerSession * quantity).toLocaleString('id-ID')}</span>
          </div>
          {Object.entries(addons).filter(([, qty]) => qty > 0).map(([key, qty]) => {
            const item = addonItems.find(a => a.key === key)!
            return (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-ash font-light">{item.label} ({qty}x)</span>
                <span className="text-chalk font-normal">Rp {(item.price * qty).toLocaleString('id-ID')}</span>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between border-t border-white/5 pt-3">
          <span className="text-chalk font-bold">Total</span>
          <span className="text-lime font-bold text-lg">Rp {total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Book CTA */}
      <button
        onClick={() =>
          onBook({
            gymId: gym.id,
            gymName: gym.name,
            session: selectedSession,
            sessionLabel: sessions.find(s => s.key === selectedSession)!.label,
            sessionTime: sessions.find(s => s.key === selectedSession)!.time,
            date: dateStr,
            quantity,
            addons,
            totalPrice: total,
          })
        }
        className="w-full h-14 bg-lime text-granite font-bold tracking-wide rounded-xl shadow-lime-glow text-base touch-ripple hover:bg-lime-dim transition-colors"
      >
        Checkout & Pay
      </button>
    </div>
  )
}
