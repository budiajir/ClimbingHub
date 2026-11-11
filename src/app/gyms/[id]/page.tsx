'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, notFound } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Instagram,
  Check,
  ShieldCheck,
  Sparkles,
  Clock,
  Users,
  Heart,
  Share2,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { useGyms } from '@/lib/use-data'
import { useTheme } from '@/lib/theme-context'
import { type BookingData } from '@/components/gym/SlotPicker'
import ETicket from '@/components/gym/ETicket'
import { isInWishlist, toggleWishlist } from '@/lib/wishlist-store'
import Pictogram from '@/components/common/Pictogram'
import GymLogoBadge from '@/components/gym/GymLogoBadge'
import GymStarRating from '@/components/gym/GymStarRating'
import GymV2RoadmapPanel from '@/components/gym/GymV2RoadmapPanel'
import ShareLinkModal from '@/components/common/ShareLinkModal'
import {
  getGymCategorizedPhotos,
  getGymGoogleMapsUrl,
  getGymAppleMapsUrl,
  getGymEffectiveRating,
  saveGymUserRating,
  type GymPhotoCategory,
} from '@/lib/gym-helpers'

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
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<'all' | GymPhotoCategory>('all')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [userRatingStars, setUserRatingStars] = useState<number | null>(null)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingSavedNotice, setRatingSavedNotice] = useState(false)
  const [effectiveRating, setEffectiveRating] = useState<{
    rating: number
    reviewCount: number
    userRated: number | null
  } | null>(null)

  useEffect(() => {
    if (gym?.id) {
      setIsWishlisted(isInWishlist(gym.id))
      const syncRating = () => {
        const eff = getGymEffectiveRating(gym)
        setEffectiveRating(eff)
        if (eff.userRated) setUserRatingStars(eff.userRated)
      }
      syncRating()
      const handleUpdate = () => setIsWishlisted(isInWishlist(gym.id))
      window.addEventListener('wishlist-updated', handleUpdate)
      window.addEventListener('gym-rating-updated', syncRating)
      return () => {
        window.removeEventListener('wishlist-updated', handleUpdate)
        window.removeEventListener('gym-rating-updated', syncRating)
      }
    }
  }, [gym])

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
          {/* Gym Title, Logo, Rating, and Address ABOVE the photo banner */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <GymLogoBadge gym={gym} size="lg" />
                <div>
                  <h1 className={`font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight ${
                    isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                  }`}>
                    {gym.name}
                  </h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs ${
                      isSandstone ? 'bg-[#FAF6EF] border-[#E0D6C6]' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <GymStarRating
                      rating={effectiveRating?.rating ?? gym.rating}
                      reviewCount={effectiveRating?.reviewCount ?? gym.reviewCount}
                      size={13}
                    />
                  </div>
                  <a
                    href={getGymGoogleMapsUrl(gym)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FF6B00] hover:underline"
                    title="Open location in Google Maps"
                  >
                    <MapPin size={13} className="shrink-0" />
                    <span>{gym.address || `${gym.city}, ${gym.province}`}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
              </div>

              {/* Action CTAs: Wishlist + Share Link */}
              <div className="flex items-center gap-2 shrink-0">
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
                  <Pictogram
                    name={isWishlisted ? "wishlisted" : "wishlist"}
                    size={14}
                    className={isWishlisted ? "text-rose-400" : "text-[#FF6B00]"}
                  />
                  <span>{isWishlisted ? 'Wishlisted' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isSandstone
                      ? 'border-[#1a1815]/25 text-[#1a1815] hover:border-[#FF6B00] hover:text-[#FF6B00]'
                      : 'border-white/15 text-chalk hover:border-lime hover:text-lime'
                  }`}
                  title="Share Gym Link"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Categorized Photo Slideshow (Suasana, Fasilitas, Pintu Masuk, Area Tunggu) */}
          {(() => {
            const allPhotos = getGymCategorizedPhotos(gym)
            const shownPhotos =
              selectedPhotoCategory === 'all'
                ? allPhotos
                : allPhotos.filter((p) => p.category === selectedPhotoCategory)
            const currentPhoto = shownPhotos[activeImgIndex % shownPhotos.length] || allPhotos[0]
            return (
              <div className="space-y-2.5">
                {/* Photo Category Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  {(
                    [
                      { id: 'all', label: 'All Photos' },
                      { id: 'suasana', label: 'Suasana & Wall' },
                      { id: 'fasilitas', label: 'Fasilitas' },
                      { id: 'pintu_masuk', label: 'Pintu Masuk' },
                      { id: 'area_tunggu', label: 'Area Tunggu' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedPhotoCategory(cat.id)
                        setActiveImgIndex(0)
                      }}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${
                        selectedPhotoCategory === cat.id
                          ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                          : isSandstone
                          ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#524e48]'
                          : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-white/10 group select-none">
                  <img
                    src={currentPhoto.url}
                    alt={`${gym.name} - ${currentPhoto.categoryLabel}`}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

                  <div className="absolute bottom-11 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                    <div className="px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-md border border-white/15">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] block">
                        {currentPhoto.categoryLabel}
                      </span>
                      <p className="text-xs text-white/90">{currentPhoto.caption}</p>
                    </div>
                  </div>

                  {/* Slideshow Arrows & Indicator Dots */}
                  {shownPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImgIndex((i) => (i > 0 ? i - 1 : shownPhotos.length - 1))
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-white/20 shadow-md cursor-pointer"
                        title="Previous image"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImgIndex((i) => (i < shownPhotos.length - 1 ? i + 1 : 0))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all border border-white/20 shadow-md cursor-pointer"
                        title="Next image"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20">
                        {shownPhotos.map((p, idx) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setActiveImgIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              activeImgIndex % shownPhotos.length === idx
                                ? 'bg-[#FF6B00] scale-125'
                                : 'bg-white/40 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Details Section */}
          <div className="px-4 md:px-0 space-y-6">
            {/* Description + Full Location Maps CTA */}
            <div className={`rounded-2xl p-5 border space-y-3 ${
              isSandstone ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]' : 'bg-crag border-white/5'
            }`}>
              <h2 className={`font-bold text-base ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>About Gym</h2>
              <p className={`text-sm font-normal leading-relaxed ${isSandstone ? 'text-[#1a1815]/80' : 'text-chalk/80'}`}>{gym.description}</p>
              <div
                className={`pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
                }`}
              >
                <div className="text-xs flex items-start gap-1.5">
                  <MapPin size={14} className="text-[#FF6B00] shrink-0 mt-0.5" />
                  <span>{gym.address || `${gym.city}, ${gym.province}`}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getGymGoogleMapsUrl(gym)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] inline-flex items-center gap-1"
                  >
                    Google Maps <ExternalLink size={11} />
                  </a>
                  <a
                    href={getGymAppleMapsUrl(gym)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border inline-flex items-center gap-1 ${
                      isSandstone
                        ? 'border-[#1a1815]/25 text-[#1a1815]'
                        : 'border-white/15 text-chalk'
                    }`}
                  >
                    Apple Maps <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>

            {/* End-of-Session 5-Star Rating Widget */}
            <div
              className={`rounded-2xl p-5 border space-y-3 ${
                isSandstone
                  ? 'bg-[#FAF6EF] border-[#E0D6C6] text-[#1a1815]'
                  : 'bg-[#1B1E23] border-white/10 text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="font-bold text-base">Rate Your Climbing Session</h2>
                  <p className={`text-xs ${isSandstone ? 'text-[#524e48]' : 'text-white/60'}`}>
                    Share your post-session star rating for {gym.name}.
                  </p>
                </div>
                <GymStarRating
                  interactive
                  rating={effectiveRating?.rating ?? gym.rating}
                  userRating={userRatingStars}
                  onRate={(stars) => {
                    setUserRatingStars(stars)
                    saveGymUserRating(gym.id, stars, ratingComment)
                    setRatingSavedNotice(true)
                    setTimeout(() => setRatingSavedNotice(false), 2000)
                  }}
                  size={18}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Optional post-session note (wall reset quality, staff, chalk air...)"
                  className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none ${
                    isSandstone
                      ? 'bg-white border-[#DDD3C4] text-[#1a1815]'
                      : 'bg-[#23262C] border-white/15 text-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const stars = userRatingStars || 5
                    setUserRatingStars(stars)
                    saveGymUserRating(gym.id, stars, ratingComment)
                    setRatingSavedNotice(true)
                    setTimeout(() => setRatingSavedNotice(false), 2000)
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#E5601F] text-white shrink-0"
                >
                  Save Rating
                </button>
              </div>
              {ratingSavedNotice && (
                <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                  <Check size={13} /> Thank you! Your {userRatingStars}-star session rating has been saved.
                </p>
              )}
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

        {/* Right Column: Sticky V2.0 Roadmap & Prototype Hub */}
        <div className="lg:col-span-5 px-4 md:px-0">
          <div className={`border rounded-3xl p-5 md:p-6 lg:sticky lg:top-24 shadow-card ${
            isSandstone
              ? 'bg-transparent border-[#1a1815]/25 text-[#1a1815]'
              : 'bg-crag border-white/10 lg:border-lime/20'
          }`}>
            <GymV2RoadmapPanel gym={gym} onBook={setBooking} />
          </div>
        </div>
      </div>

      {/* Share Link Modal */}
      <ShareLinkModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={gym.name}
        subtitle={`${gym.city} · ${gym.address}`}
        shareUrl={`/gyms/${gym.id}`}
        categoryLabel="Share Gym"
      />

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
