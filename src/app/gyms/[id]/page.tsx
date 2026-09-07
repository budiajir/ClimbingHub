'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, notFound } from 'next/navigation'
import { ChevronLeft, Star, MapPin, Phone, Instagram, Check, ShieldCheck, Sparkles, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { useGyms } from '@/lib/use-data'
import SlotPicker, { BookingData } from '@/components/gym/SlotPicker'
import ETicket from '@/components/gym/ETicket'

function generateBookingCode() {
  return 'CH' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function GymDetailPage() {
  const params = useParams()
  const { gyms, loading } = useGyms()
  const gym = gyms.find(g => g.id === params.id)
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [bookingCode] = useState(generateBookingCode())

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-ash text-sm font-light">Memuat informasi gym...</p>
      </div>
    )
  }

  if (!gym) return notFound()

  return (
    <div className="max-w-7xl mx-auto md:px-6 lg:px-8 pb-12">
      {/* Back button for desktop */}
      <div className="hidden md:flex items-center gap-2 py-4 border-b border-white/5 mb-6">
        <Link
          href="/gyms"
          className="flex items-center gap-1.5 text-xs text-slate-ash hover:text-lime font-light tracking-wide transition-colors"
        >
          <ChevronLeft size={16} /> Kembali ke Gym Directory
        </Link>
      </div>

      {/* Main Grid: 1 col on mobile, 12 cols on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column (12 cols mobile, 7 cols desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Banner */}
          <div className="relative h-64 md:h-80 md:rounded-3xl overflow-hidden -mt-14 md:mt-0" style={{ marginTop: undefined }}>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${gym.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-granite via-granite/30 to-transparent" />

            {/* Mobile Back button */}
            <Link
              href="/gyms"
              className="md:hidden absolute top-16 left-4 w-9 h-9 glass rounded-full flex items-center justify-center touch-ripple"
            >
              <ChevronLeft size={18} className="text-chalk" />
            </Link>

            {/* Gym name & Rating */}
            <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6">
              <h1 className="text-chalk font-bold text-2xl md:text-3xl lg:text-4xl">{gym.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <Star size={13} className="text-lime fill-lime" />
                  <span className="text-chalk font-bold text-sm">{gym.rating}</span>
                  <span className="text-slate-ash text-xs font-light">({gym.reviewCount} ulasan)</span>
                </div>
                <div className="flex items-center gap-1 text-slate-ash text-xs font-light bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <MapPin size={11} className="text-lime" /> {gym.city}, {gym.province}
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-4 md:px-0 space-y-6">
            {/* Description */}
            <div className="bg-crag rounded-2xl p-5 border border-white/5">
              <h2 className="text-chalk font-bold text-base mb-2">Tentang Gym</h2>
              <p className="text-chalk/80 text-sm font-normal leading-relaxed">{gym.description}</p>
              <div className="mt-3 text-xs text-slate-ash font-light flex items-center gap-1.5">
                <MapPin size={13} className="text-lime" />
                <span className="text-chalk/90">{gym.address}</span>
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-crag rounded-2xl p-5 border border-white/5">
              <p className="text-slate-ash text-xs uppercase tracking-wider mb-3 font-light">Fasilitas Lengkap</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {gym.facilities.map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-chalk font-normal bg-granite p-2.5 rounded-xl border border-white/5">
                    <Check size={13} className="text-lime flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Route Setters */}
            <div className="bg-crag rounded-2xl p-5 border border-white/5">
              <p className="text-slate-ash text-xs uppercase tracking-wider mb-3 font-light">Route Setters in Residence</p>
              <div className="flex flex-wrap gap-2">
                {gym.routeSetters.map(setter => (
                  <span key={setter} className="text-xs font-medium text-cyan-climb bg-cyan-climb/10 border border-cyan-climb/20 px-3 py-1.5 rounded-xl">
                    🧗‍♂️ {setter}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="flex gap-3">
              <a
                href={`tel:${gym.phone}`}
                className="flex-1 flex items-center justify-center gap-2 h-11 bg-crag rounded-xl text-sm font-light text-slate-ash border border-white/5 touch-ripple hover:text-chalk hover:border-lime/30 transition-colors"
              >
                <Phone size={15} /> {gym.phone}
              </a>
              <a
                href={`https://instagram.com/${gym.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 h-11 bg-crag rounded-xl text-sm font-light text-pink-400 border border-white/5 touch-ripple hover:border-pink-500/30 transition-colors"
              >
                <Instagram size={15} /> {gym.instagram}
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="lg:col-span-5 px-4 md:px-0">
          <div className="bg-crag border border-white/10 lg:border-lime/20 rounded-3xl p-5 md:p-6 lg:sticky lg:top-24 shadow-card">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div>
                <h2 className="text-chalk font-bold text-lg md:text-xl">Reservasi Sesi</h2>
                <p className="text-slate-ash text-xs font-light">Pilih jam, kuota & rental add-ons</p>
              </div>
              <div className="text-right">
                <span className="text-lime font-bold text-xl">Rp {gym.pricePerSession.toLocaleString('id-ID')}</span>
                <span className="text-slate-ash text-xs font-light block">/orang</span>
              </div>
            </div>

            {/* Integrated Slot Picker */}
            <SlotPicker gym={gym} onBook={setBooking} />
          </div>
        </div>
      </div>

      {/* E-Ticket overlay modal */}
      <AnimatePresence>
        {booking && (
          <ETicket
            booking={booking}
            bookingCode={bookingCode}
            onClose={() => setBooking(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
