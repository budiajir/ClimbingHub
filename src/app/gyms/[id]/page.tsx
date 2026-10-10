'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight, Star, MapPin, Phone, Instagram, Check, ShieldCheck, Sparkles, Clock, Users, Heart } from 'lucide-react'
import Link from 'next/link'
import { useGyms } from '@/lib/use-data'
import { useTheme } from '@/lib/theme-context'
import SlotPicker, { BookingData } from '@/components/gym/SlotPicker'
import ETicket from '@/components/gym/ETicket'
import { isInWishlist, toggleWishlist } from '@/lib/wishlist-store'

function generateBookingCode() {
  return 'CH' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function GymDetailPage() {
  const params = useParams()
  const rawId = params?.id
  const paramId = (typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '') || ''
  const { gyms, loading } = useGyms()
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const gym = gyms.find(g => String(g.id || '').toLowerCase() === paramId.toLowerCase())
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [bookingCode] = useState(generateBookingCode())
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    if (gym?.id) {
      setIsWishlisted(isInWishlist(gym.id))
      const handleUpdate = () => setIsWishlisted(isInWishlist(gym.id))
      window.addEventListener('wishlist-updated', handleUpdate)
      return () => window.removeEventListener('wishlist-updated', handleUpdate)
    }
  }, [gym?.id])

  const handleToggleWishlist = () => {
    if (!gym) return
    const updated = toggleWishlist({
      id: gym.id,
      type: 'gym',
      title: gym.name,
      subtitle: `${gym.city}, ${gym.province}`,
      image: gym.image,
      location: gym.address,
    })
    setIsWishlisted(updated)
  }

  if (loading && !gym) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-ash text-sm font-light">Loading gym details...</p>
      </div>
    )
  }

  if (!gym) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold">Gym Not Found</h2>
        <p className="text-xs opacity-75 font-light">
          The climbing gym you requested ({paramId || 'unknown'}) could not be found.
        </p>
        <div className="pt-2">
          <Link
            href="/gyms"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-lime text-granite shadow-lime-glow-sm hover:bg-lime-dim transition-all"
          >
            Back to Gyms Directory
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-12 pt-2">
      {/* 1-Step Back Navigation Header */}
      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-black/10 dark:border-white/10 mb-4">
        <Link
          href="/gyms"
          className={`flex items-center gap-1.5 py-1 -ml-1 group text-left transition-opacity hover:opacity-75 active:opacity-60 min-w-0 ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}
        >
          <ChevronLeft size={20} className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm sm:text-base font-light tracking-wide truncate">
            Climbing Gym
          </span>
        </Link>
      </div>

      {/* Main Grid: 1 col on mobile, 12 cols on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column (12 cols mobile, 7 cols desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gym Title, Rating, and Address ABOVE the photo banner */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className={`font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight ${
                  isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                }`}>
                  {gym.name}
                </h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="font-bold text-white">{gym.rating}</span>
                    <span className="opacity-65 font-light">({gym.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs opacity-75 font-light">
                    <MapPin size={13} className="text-[#FF6B00] shrink-0" />
                    <span>{gym.address || `${gym.city}, ${gym.province}`}</span>
                  </div>
                </div>
              </div>

              {/* Save to Wishlist button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isWishlisted
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10'
                }`}
                title="Save to Wishlist"
              >
                <Heart size={14} className={isWishlisted ? 'fill-rose-400 text-rose-400' : ''} />
                <span>{isWishlisted ? 'Wishlisted' : 'Save to Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Full-Frame Photo Banner with Slideshow */}
          {(() => {
            const gymImages = Array.from(new Set([
              gym.image,
              ...(gym.images || []),
              'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=800&q=80',
            ].filter(Boolean)))
            return (
              <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-white/10 group select-none">
                <img
                  src={gymImages[activeImgIndex % gymImages.length]}
                  alt={gym.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Slideshow Arrows & Indicator Dots */}
                {gymImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImgIndex(i => (i > 0 ? i - 1 : gymImages.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-white/20 shadow-md cursor-pointer"
                      title="Previous image"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImgIndex(i => (i < gymImages.length - 1 ? i + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-white/20 shadow-md cursor-pointer"
                      title="Next image"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20">
                      {gymImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImgIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            activeImgIndex === idx ? 'bg-[#FF6B00] scale-125' : 'bg-white/40 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })()}

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
                }`}>Select time slot, climbers & add-ons</p>
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
