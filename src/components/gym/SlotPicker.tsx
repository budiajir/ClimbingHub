'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, Plus, Minus, ShoppingBag, CheckCircle, Sparkles } from 'lucide-react'
import { Gym } from '@/lib/mock-data'
import { addWalletOrder } from '@/lib/wallet-store'

interface SlotPickerProps {
  gym: Gym
  onBook: (booking: BookingData) => void
}

export interface BookingData {
  gymId: string
  gymName: string
  session: 'day' | 'night'
  sessionLabel: string
  sessionTime: string
  date: string
  quantity: number
  addons: Record<string, number>
  totalPrice: number
}

const addonItems = [
  { key: 'shoes', label: 'Climbing Shoes', price: 25000, icon: '👟' },
  { key: 'chalk', label: 'Chalk Bag', price: 10000, icon: '🤍' },
  { key: 'trainer', label: 'Private Trainer', price: 75000, icon: '🧗‍♂️' },
]

export default function SlotPicker({ gym, onBook }: SlotPickerProps) {
  // Date picker: default tomorrow
  const tomorrow = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }, [])

  const [dateInput, setDateInput] = useState<string>(tomorrow)
  const [selectedSession, setSelectedSession] = useState<'day' | 'night'>('day')
  const [quantity, setQuantity] = useState(1)
  const [addons, setAddons] = useState<Record<string, number>>({})

  // Determine if chosen date is weekend
  const isWeekend = useMemo(() => {
    if (!dateInput) return false
    const parsed = new Date(dateInput + 'T00:00:00')
    const day = parsed.getDay()
    return day === 0 || day === 6 // 0 is Sunday, 6 is Saturday
  }, [dateInput])

  // Formatted date string for display
  const formattedDateStr = useMemo(() => {
    if (!dateInput) return ''
    const parsed = new Date(dateInput + 'T00:00:00')
    return parsed.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [dateInput])

  // Dynamic session pricing based on Day/Night and Weekday/Weekend
  const basePrice = gym.pricePerSession || 85000
  const sessionPricing = useMemo(() => {
    const dayPrice = isWeekend ? basePrice + 20000 : basePrice
    const nightPrice = isWeekend ? basePrice + 35000 : basePrice + 15000
    return {
      day: dayPrice,
      night: nightPrice,
    }
  }, [basePrice, isWeekend])

  const sessions = [
    {
      key: 'day' as const,
      label: 'Day Session',
      time: '09:00 – 15:00',
      price: sessionPricing.day,
      desc: isWeekend ? 'Weekend Daytime Rate' : 'Weekday Daytime Rate',
      icon: '☀️',
    },
    {
      key: 'night' as const,
      label: 'Night Session',
      time: '15:00 – 22:00',
      price: sessionPricing.night,
      desc: isWeekend ? 'Weekend Evening / Peak Rate' : 'Weekday Evening Rate',
      icon: '🌙',
    },
  ]

  const currentSessionPrice = sessionPricing[selectedSession]
  const addonsTotal = Object.entries(addons).reduce((sum, [key, qty]) => {
    const item = addonItems.find(a => a.key === key)
    return sum + (item?.price || 0) * qty
  }, 0)

  const total = currentSessionPrice * quantity + addonsTotal

  const handleCheckout = () => {
    const activeSession = sessions.find(s => s.key === selectedSession)!
    const bookingPayload: BookingData = {
      gymId: gym.id,
      gymName: gym.name,
      session: selectedSession,
      sessionLabel: activeSession.label,
      sessionTime: activeSession.time,
      date: formattedDateStr,
      quantity,
      addons,
      totalPrice: total,
    }

    // Auto-save receipt & QR code into Personal Account Order Wallet
    const bookingCode = `CH-${Math.floor(1000 + Math.random() * 9000)}`
    addWalletOrder({
      id: `ord-gym-${Date.now()}`,
      type: 'gym',
      status: 'active',
      title: `${gym.name} — ${activeSession.label}`,
      categoryLabel: 'Gym Booking',
      venueOrLocation: `${gym.city}, ${gym.province}`,
      bookingCode,
      qrData: `CH-GYM-${bookingCode}-${gym.id}`,
      date: formattedDateStr,
      time: activeSession.time,
      totalPrice: total,
      quantity,
      details: {
        addons: Object.entries(addons)
          .filter(([, q]) => q > 0)
          .map(([k, q]) => {
            const item = addonItems.find(a => a.key === k)
            return `${item?.label || k} (${q}x)`
          }),
      },
      createdAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 86400000).toISOString(),
    })

    onBook(bookingPayload)
  }

  return (
    <div className="space-y-4">
      {/* 1. Date Picker */}
      <div className="space-y-1.5">
        <label className="text-slate-ash text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5">
          <Calendar size={13} className="text-[#FF6B00]" />
          Pilih Tanggal Booking
        </label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateInput}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#1a1f24] text-chalk text-xs sm:text-sm font-medium outline-none focus:border-[#FF6B00] transition-colors"
          />
          <span
            className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap border shrink-0 ${
              isWeekend
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {isWeekend ? 'Weekend' : 'Weekday'}
          </span>
        </div>
        <p className="text-[11px] opacity-70">
          Jadwal terpilih: <b>{formattedDateStr}</b> · Tarif {isWeekend ? 'Weekend otomatis aktif' : 'Weekday otomatis aktif'}
        </p>
      </div>

      {/* 2. Session Picker with Day vs Night Dynamic Price (Slots removed) */}
      <div className="space-y-2">
        <p className="text-slate-ash text-[11px] uppercase tracking-wider font-bold flex items-center justify-between">
          <span>Pilih Session</span>
          <span className="text-[10px] text-[#FF6B00] normal-case font-normal">Harga otomatis sesuai siang/malam</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {sessions.map(s => {
            const isSelected = selectedSession === s.key
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedSession(s.key)}
                className={`rounded-2xl p-3.5 border transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/40 bg-[#FF6B00]/10 shadow-md'
                    : 'border-white/10 bg-[#1a1f24] hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{s.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-[#FF6B00] text-white' : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div className="font-mono text-xs opacity-80">{s.time}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10">
                  <div className="text-[10px] opacity-60 font-light">{s.desc}</div>
                  <div className="text-sm sm:text-base font-bold text-white font-mono mt-0.5">
                    Rp {s.price.toLocaleString('id-ID')}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Climber Passes Quantity */}
      <div className="space-y-1.5">
        <p className="text-slate-ash text-[11px] uppercase tracking-wider font-bold flex items-center gap-1">
          <Users size={12} className="text-[#FF6B00]" /> Jumlah Climber
        </p>
        <div className="flex items-center gap-4 bg-[#1a1f24] border border-white/10 rounded-2xl p-2.5">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-chalk transition-all"
          >
            <Minus size={15} />
          </button>
          <div className="flex-1 text-center">
            <span className="text-chalk font-bold text-lg font-mono">{quantity}</span>
            <span className="text-[11px] opacity-60 block">Climber Pass</span>
          </div>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-9 h-9 rounded-xl bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white flex items-center justify-center transition-all shadow-sm"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* 4. Add-ons: Shoes, Chalk, Private Trainer (Crashpad removed) */}
      <div className="space-y-2">
        <p className="text-slate-ash text-[11px] uppercase tracking-wider font-bold flex items-center gap-1">
          <ShoppingBag size={12} className="text-[#FF6B00]" /> Add-ons & Private Trainer (Opsional)
        </p>
        <div className="space-y-2">
          {addonItems.map(item => {
            const qty = addons[item.key] || 0
            return (
              <div
                key={item.key}
                className="flex items-center justify-between bg-[#1a1f24] border border-white/10 rounded-2xl p-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-chalk text-sm font-bold">{item.label}</div>
                    <div className="text-slate-ash text-[11px] font-mono">
                      +Rp {item.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAddons(a => ({
                        ...a,
                        [item.key]: Math.max(0, (a[item.key] || 0) - 1),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-ash transition-all"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-chalk text-sm w-5 text-center font-bold font-mono">{qty}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAddons(a => ({
                        ...a,
                        [item.key]: (a[item.key] || 0) + 1,
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-[#FF6B00]/20 hover:bg-[#FF6B00]/40 text-[#FF6B00] flex items-center justify-center transition-all"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Price Breakdown Summary */}
      <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="opacity-70">
            {selectedSession === 'day' ? 'Day Session' : 'Night Session'} ({quantity}x)
          </span>
          <span className="font-mono font-bold text-chalk">
            Rp {(currentSessionPrice * quantity).toLocaleString('id-ID')}
          </span>
        </div>
        {Object.entries(addons)
          .filter(([, qty]) => qty > 0)
          .map(([key, qty]) => {
            const item = addonItems.find(a => a.key === key)!
            return (
              <div key={key} className="flex justify-between text-xs">
                <span className="opacity-70">
                  {item.label} ({qty}x)
                </span>
                <span className="font-mono font-bold text-chalk">
                  Rp {(item.price * qty).toLocaleString('id-ID')}
                </span>
              </div>
            )
          })}
        <div className="flex justify-between border-t border-white/10 pt-2 text-sm sm:text-base">
          <span className="font-bold text-white">Total Booking</span>
          <span className="font-mono font-black text-[#FF6B00] text-lg">
            Rp {total.toLocaleString('id-ID')}
          </span>
        </div>
        <p className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1">
          <CheckCircle size={11} /> Bukti pembayaran & QR Code akan otomatis disimpan ke Order Wallet Anda
        </p>
      </div>

      {/* 6. Checkout CTA Button */}
      <button
        type="button"
        onClick={handleCheckout}
        className="w-full h-12 sm:h-14 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold tracking-wide rounded-2xl shadow-lg text-sm sm:text-base touch-ripple transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Checkout & Bayar Sekarang</span>
        <span className="font-mono opacity-90">(Rp {total.toLocaleString('id-ID')})</span>
      </button>
    </div>
  )
}
