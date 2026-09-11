'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, notFound } from 'next/navigation'
import { ChevronLeft, Star, MapPin, Phone, Instagram, Check, ShieldCheck, Sparkles, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { useGyms } from '@/lib/use-data'
import { useTheme } from '@/lib/theme-context'
import SlotPicker, { BookingData } from '@/components/gym/SlotPicker'
import ETicket from '@/components/gym/ETicket'

function generateBookingCode() {
  return 'CH' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function GymDetailPage() {
  const params = useParams()
  const { gyms, loading } = useGyms()
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const gym = gyms.find(g => g.id === params.id)
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [bookingCode] = useState(generateBookingCode())

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-ash text-sm font-light">Loading gym details...</p>
      </div>
    )
  }

  if (!gym) return notFound()

  return (
    <div className="max-w-7xl mx-auto md:px-6 lg:px-8 pb-12">
      {/* Back button for desktop */}
      <div className={`hidden md:flex items-center gap-2 py-4 border-b mb-6 ${
        isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
      }`}>
        <Link
          href="/gyms"
          className={`flex items-center gap-1.5 text-xs font-light tracking-wide transition-colors ${
            isSandstone ? 'text-[#1a1815]/70 hover:text-[#1a1815]' : 'text-slate-ash hover:text-lime'
          }`}
        >
          <ChevronLeft size={16} /> Back to Gym Directory
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
                  <span className="text-slate-ash text-xs font-light">({gym.reviewCount} reviews)</span>
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
            <div className={`rounded-2xl p-5 border ${
              isSandstone ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]' : 'bg-crag border-white/5'
            }`}>
              <h2 className={`font-bold text-base mb-2 ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>About Gym</h2>
              <p className={`text-sm font-normal leading-relaxed ${isSandstone ? 'text-[#1a1815]/80' : 'text-chalk/80'}`}>{gym.description}</p>
              <div className="mt-3 text-xs font-light flex items-center gap-1.5">
                <MapPin size={13} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
                <span className={isSandstone ? 'text-[#1a1815]/90' : 'text-chalk/90'}>{gym.address}</span>
              </div>
            </div>

            {/* Facilities */}
            <div className={`rounded-2xl p-5 border ${
              isSandstone ? 'bg-transparent border-[#1a1815]/20' : 'bg-crag border-white/5'
            }`}>
              <p className={`text-xs uppercase tracking-wider mb-3 font-light ${
                isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
              }`}>Amenities & Facilities</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {gym.facilities.map(f => (
                  <div key={f} className={`flex items-center gap-2 text-xs font-normal p-2.5 rounded-xl border ${
                    isSandstone
                      ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]'
                      : 'bg-granite border-white/5 text-chalk'
                  }`}>
                    <Check size={13} className={isSandstone ? 'text-[#1a1815]' : 'text-lime flex-shrink-0'} /> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Route Setters */}
            <div className={`rounded-2xl p-5 border ${
              isSandstone ? 'bg-transparent border-[#1a1815]/20' : 'bg-crag border-white/5'
            }`}>
              <p className={`text-xs uppercase tracking-wider mb-3 font-light ${
                isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
              }`}>Route Setters in Residence</p>
              <div className="flex flex-wrap gap-2">
                {gym.routeSetters.map(setter => (
                  <span key={setter} className={`text-xs font-medium px-3 py-1.5 rounded-xl border ${
                    isSandstone
                      ? 'text-[#1a1815] bg-[#1a1815]/10 border-[#1a1815]/20'
                      : 'text-cyan-climb bg-cyan-climb/10 border-cyan-climb/20'
                  }`}>
                    🧗‍♂️ {setter}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="flex gap-3">
              <a
                href={`tel:${gym.phone}`}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-light border touch-ripple transition-colors ${
                  isSandstone
                    ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815] hover:border-[#1a1815]/50'
                    : 'bg-crag border-white/5 text-slate-ash hover:text-chalk hover:border-lime/30'
                }`}
              >
                <Phone size={15} /> {gym.phone}
              </a>
              <a
                href={`https://instagram.com/${gym.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-light border touch-ripple transition-colors ${
                  isSandstone
                    ? 'bg-transparent border-[#1a1815]/20 text-pink-600 hover:border-pink-500/50'
                    : 'bg-crag border-white/5 text-pink-400 hover:border-pink-500/30'
                }`}
              >
                <Instagram size={15} /> {gym.instagram}
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="lg:col-span-5 px-4 md:px-0">
          <div className={`border rounded-3xl p-5 md:p-6 lg:sticky lg:top-24 shadow-card ${
            isSandstone
              ? 'bg-transparent border-[#1a1815]/25 text-[#1a1815]'
              : 'bg-crag border-white/10 lg:border-lime/20'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 mb-4 ${
              isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
            }`}>
              <div>
                <h2 className={`font-bold text-lg md:text-xl ${
                  isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                }`}>Book a Session</h2>
                <p className={`text-xs font-light ${
                  isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                }`}>Select time slot, climbers & rental add-ons</p>
              </div>
              <div className="text-right">
                <span className={`font-bold text-xl ${
                  isSandstone ? 'text-[#1a1815]' : 'text-lime'
                }`}>Rp {gym.pricePerSession.toLocaleString('id-ID')}</span>
                <span className={`text-xs font-light block ${
                  isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                }`}>/person</span>
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
