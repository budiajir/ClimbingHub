'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Shield, Plus, Minus, Package, Calendar, MapPin, Phone, User, Camera, ShieldCheck } from 'lucide-react'
import { CragRegion } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { addWalletOrder } from '@/lib/wallet-store'

interface RentEquipmentModalProps {
  isOpen: boolean
  crag: CragRegion | null
  onClose: () => void
}

interface EquipmentItem {
  id: string
  name: string
  pricePerDay: number
  category: 'boulder' | 'lead' | 'safety'
  desc: string
  image: string
}

const EQUIPMENT_CATALOG: EquipmentItem[] = [
  {
    id: 'crashpad',
    name: 'Bouldering Crashpad (Mad Rock / Black Diamond)',
    pricePerDay: 50000,
    category: 'boulder',
    desc: 'Heavy-duty 4-inch drop cushioning for outdoor highball & sit starts.',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'harness',
    name: 'Climbing Harness (Petzl / Black Diamond)',
    pricePerDay: 35000,
    category: 'safety',
    desc: 'UIAA certified climbing harness, sizes S/M/L, inspected gear.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'rope-60m',
    name: 'Dynamic Single Rope 60m (9.8mm)',
    pricePerDay: 90000,
    category: 'lead',
    desc: '60m dynamic single rope (9.8mm) for sport lead climbing.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'quickdraw-set',
    name: 'Quickdraw Set (10 pcs Stainless)',
    pricePerDay: 60000,
    category: 'lead',
    desc: 'Set of 10 quickdraws for bolt hangers on sport routes.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'helmet',
    name: 'Climbing Helmet (Petzl / Mammut)',
    pricePerDay: 25000,
    category: 'safety',
    desc: 'Certified head protection against impacts and rockfall.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'belay-device',
    name: 'Belay Device (ATC / GriGri + HMS Carabiner)',
    pricePerDay: 25000,
    category: 'lead',
    desc: 'Assisted braking device + HMS locking carabiner.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  },
]

export default function RentEquipmentModal({ isOpen, crag, onClose }: RentEquipmentModalProps) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'

  const [quantities, setQuantities] = useState<Record<string, number>>({
    crashpad: 1,
  })
  const [days, setDays] = useState(1)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [city, setCity] = useState(crag?.province || 'Bandung')
  const [pickupPoint, setPickupPoint] = useState('Basecamp Crag (Resmi)')
  const [returnPoint, setReturnPoint] = useState('Basecamp Crag (Resmi)')
  const [renterName, setRenterName] = useState(user?.name || 'Climber')
  const [phone, setPhone] = useState('08123456789')
  const [idNumber, setIdNumber] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !crag) return null

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0
      const next = Math.max(0, current + delta)
      return { ...prev, [id]: next }
    })
  }

  const totalPerDay = EQUIPMENT_CATALOG.reduce((sum, item) => {
    const q = quantities[item.id] || 0
    return sum + q * item.pricePerDay
  }, 0)

  const grandTotal = totalPerDay * days
  const totalItemCount = Object.values(quantities).reduce((a, b) => a + b, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (totalItemCount === 0) return

    // Save rental order to Personal Account Order Wallet
    const bookingCode = `RG-${Math.floor(1000 + Math.random() * 9000)}`
    addWalletOrder({
      id: `ord-rent-${Date.now()}`,
      type: 'rent',
      status: 'active',
      title: `Outdoor Gear Rental — ${crag.name}`,
      categoryLabel: 'Rent Gear',
      venueOrLocation: `${city} (${pickupPoint})`,
      bookingCode,
      qrData: `CH-RENT-${bookingCode}-${crag.id}`,
      date: `${startDate || 'Today'} (${days} Days)`,
      totalPrice: grandTotal,
      quantity: totalItemCount,
      details: {
        renter: `${renterName} (${phone})`,
        pickup: pickupPoint,
        returnPt: returnPoint,
        items: Object.entries(quantities)
          .filter(([, q]) => q > 0)
          .map(([id, q]) => {
            const itm = EQUIPMENT_CATALOG.find(e => e.id === id)
            return `${q}x ${itm?.name || id}`
          }),
      },
      createdAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + days * 86400000).toISOString(),
    })

    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onClose()
    }, 2000)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window with Purple Background (.popup-form-purple) */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg rounded-3xl border p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar popup-form-purple text-white"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl border border-[#FF6B00]/40 bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight text-white">Rent Gear & Equipment</h3>
                <p className="text-xs text-white/70 font-light">{crag.name} Basecamp</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg"
              >
                <CheckCircle2 size={32} />
              </motion.div>
              <h4 className="font-bold text-base text-white">Peminjaman Alat Berhasil Dikonfirmasi!</h4>
              <p className="text-xs text-white/80 max-w-sm mx-auto leading-relaxed">
                Bukti pemesanan & QR Code telah otomatis disimpan di <b>Order Wallet</b> halaman <b>Personal Account</b> Anda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {/* Foto Kondisi Alat Thumbnail */}
              <div className="p-3 rounded-2xl bg-white/5 border border-purple-500/20 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-black/40">
                  <img
                    src="https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=200&q=80"
                    alt="Gear Condition"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <ShieldCheck size={14} /> Kondisi Alat 100% Siap Pakai
                  </div>
                  <p className="text-[11px] text-white/70 font-light mt-0.5 leading-snug">
                    UIAA Certified, rutin diinspeksi kebersihannya, dan bebas cacat struktural sebelum diserahterimakan.
                  </p>
                </div>
              </div>

              {/* Equipment Items List */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80">
                  Pilih Alat Panjat
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar pr-1">
                  {EQUIPMENT_CATALOG.map(item => {
                    const q = quantities[item.id] || 0
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                          q > 0
                            ? 'border-[#FF6B00]/60 bg-[#FF6B00]/10'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-white truncate">{item.name}</div>
                          <div className="text-[11px] text-white/60 leading-tight">{item.desc}</div>
                          <div className="font-mono text-xs font-semibold text-[#FF6B00] mt-1">
                            Rp {item.pricePerDay.toLocaleString('id-ID')} <span className="text-[10px] text-white/50 font-sans">/ hari</span>
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, -1)}
                            disabled={q === 0}
                            className="w-7 h-7 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-white transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="font-mono font-bold w-4 text-center text-white">{q}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, 1)}
                            className="w-7 h-7 rounded-lg border border-[#FF6B00]/40 bg-[#FF6B00]/20 hover:bg-[#FF6B00]/40 text-[#FF6B00] flex items-center justify-center transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Kota & Titik Pengambilan & Pengembalian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                    Pilihan Kota / Wilayah
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Bandung" className="bg-[#24123a]">Bandung (Citatah)</option>
                    <option value="Padang / Harau" className="bg-[#24123a]">Padang / Harau (Sumatera Barat)</option>
                    <option value="Yogyakarta" className="bg-[#24123a]">Yogyakarta (Siung)</option>
                    <option value="Purwakarta" className="bg-[#24123a]">Purwakarta (Gn. Parang)</option>
                    <option value="Jakarta" className="bg-[#24123a]">Jakarta (Drop Point)</option>
                    <option value="Bali" className="bg-[#24123a]">Bali (Kintamani / Songan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                    Titik Ambil & Pengembalian
                  </label>
                  <select
                    value={pickupPoint}
                    onChange={(e) => {
                      setPickupPoint(e.target.value)
                      setReturnPoint(e.target.value)
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Basecamp Crag (Resmi)" className="bg-[#24123a]">Basecamp Crag (Resmi)</option>
                    <option value="Homestay Partner" className="bg-[#24123a]">Homestay Partner Terdekat</option>
                    <option value="Rental Hub Kota" className="bg-[#24123a]">Rental Hub Pusat Kota</option>
                    <option value="Diantar ke Lokasi (COD)" className="bg-[#24123a]">Diantar ke Lokasi (COD)</option>
                  </select>
                </div>
              </div>

              {/* Tanggal & Durasi Sewa */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                    Tanggal Pengambilan
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                    Durasi Sewa (Hari)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    required
                    value={days}
                    onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Kontak Penyewa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                    Nama Lengkap Penyewa
                  </label>
                  <input
                    type="text"
                    required
                    value={renterName}
                    onChange={(e) => setRenterName(e.target.value)}
                    placeholder="Nama sesuai KTP"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
                    Kontak WhatsApp / No. HP
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-white/70 block">
                    Total Biaya Sewa ({totalItemCount} alat, {days} hari)
                  </span>
                  <span className="font-bold text-xs text-white">
                    Titik: {pickupPoint}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-[#FF6B00]">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={totalItemCount === 0}
                className="w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white shadow-lg transition-all disabled:opacity-40 cursor-pointer"
              >
                <Package size={16} />
                <span>Konfirmasi Sewa Alat & Simpan ke Wallet</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
