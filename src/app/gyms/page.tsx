'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  Compass,
  ExternalLink,
  X,
  Heart,
  Map as MapIcon,
  LayoutGrid,
  List,
  GalleryHorizontal,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useGyms } from '@/lib/use-data'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'
import { Gym } from '@/lib/mock-data'
import dynamic from 'next/dynamic'
import ShareLinkModal from '@/components/common/ShareLinkModal'
import Pictogram from '@/components/common/Pictogram'
import GymLogoBadge from '@/components/gym/GymLogoBadge'
import GymStarRating from '@/components/gym/GymStarRating'
import { toggleWishlist, getWishlist } from '@/lib/wishlist-store'
import { getGymEffectiveRating, getGymGoogleMapsUrl } from '@/lib/gym-helpers'

const InteractiveIndonesiaMap = dynamic(
  () => import('@/components/common/InteractiveIndonesiaMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] sm:h-[480px] md:h-[380px] lg:h-[440px] rounded-3xl bg-[#181C20] animate-pulse flex items-center justify-center text-white/50 text-xs">
        Memuat Peta Interaktif Gyms...
      </div>
    ),
  }
)

export default function GymsPage() {
  const { gyms } = useGyms()
  const { theme } = useTheme()
  const { isAuthenticated, openAuthModal } = useAuth()
  const isSandstone = theme === 'sandstone'
  const [query, setQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedGymForMap, setSelectedGymForMap] = useState<Gym | null>(null)
  const [showMap, setShowMap] = useState(true)
  const [viewMode, setViewMode] = useState<'thumbnails' | 'list' | 'slideshow'>('thumbnails')
  const [slideshowIndex, setSlideshowIndex] = useState(0)
  const [shareTarget, setShareTarget] = useState<Gym | null>(null)
  const [sharePageOpen, setSharePageOpen] = useState(false)
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([])

  const handleToggleWishlist = (gymItem: Gym) => {
    if (!isAuthenticated) {
      openAuthModal('Silakan masuk atau daftar akun untuk menyimpan gym ke Wishlist.')
      return
    }
    toggleWishlist({
      id: gymItem.id,
      type: 'gym',
      title: gymItem.name,
      subtitle: `${gymItem.city} · Indoor Climbing`,
      image: gymItem.image,
      location: gymItem.address || gymItem.city,
    })
  }

  useEffect(() => {
    const syncWishlist = () => {
      setWishlistedIds(getWishlist().filter((w) => w.type === 'gym').map((w) => w.id))
    }
    syncWishlist()
    window.addEventListener('wishlist-updated', syncWishlist)
    window.addEventListener('gym-rating-updated', syncWishlist)
    return () => {
      window.removeEventListener('wishlist-updated', syncWishlist)
      window.removeEventListener('gym-rating-updated', syncWishlist)
    }
  }, [])

  const cities = ['all', ...Array.from(new Set(gyms.map(g => g.city)))]

  const filtered = gyms.filter(g => {
    const matchesQuery =
      g.name.toLowerCase().includes(query.toLowerCase()) ||
      g.city.toLowerCase().includes(query.toLowerCase())
    const matchesCity = selectedCity === 'all' || g.city === selectedCity
    return matchesQuery && matchesCity
  })

  return (
    <div className="max-w-7xl mx-auto p-4 md:px-6 lg:px-8 space-y-4">
      {/* 1. Header Title & Subtitle */}
      <div
        className={`border-b pb-3 ${
          isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1
              className={`font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight ${
                isSandstone ? 'text-[#1a1815]' : 'text-chalk'
              }`}
            >
              Climbing Gym
            </h1>
            <p
              className={`text-xs md:text-sm font-light mt-1 max-w-2xl ${
                isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
              }`}
            >
              Explore indoor climbing &amp; bouldering gyms across Indonesia — maps, locations, ratings, facility photos, wishlists, and route setters.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowMap(v => !v)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                showMap
                  ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                  : isSandstone
                  ? 'bg-transparent border-[#1a1815]/25 text-[#1a1815] hover:border-[#FF6B00]'
                  : 'bg-white/5 border-white/15 text-chalk hover:border-[#FF6B00]'
              }`}
            >
              <MapIcon size={14} /> {showMap ? 'Hide Map' : 'Show Map'}
            </button>
            <button
              type="button"
              onClick={() => setSharePageOpen(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                isSandstone
                  ? 'bg-transparent border-[#1a1815]/25 text-[#1a1815] hover:border-[#FF6B00]'
                  : 'bg-white/5 border-white/15 text-chalk hover:border-lime'
              }`}
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search Box — Disamakan dengan bentuk pill di "Problems" */}
      <div className="relative pt-1">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Discover gyms, cities, facilities..."
          className={`w-full py-2.5 px-6 rounded-full text-xs sm:text-sm outline-none transition-all border ${
            isSandstone
              ? 'bg-black/[0.03] text-[#1a1815] placeholder:text-[#1a1815]/40 border-[#1a1815]/25 focus:border-[#1a1815]'
              : 'bg-white/[0.05] text-chalk placeholder:text-white/40 border-white/15 focus:border-lime/50'
          }`}
        />
      </div>

      {/* 3. Interactive Indonesia Gyms Map (Toggleable CTA) */}
      {showMap && (
        <div className="my-4">
          <InteractiveIndonesiaMap
            mode="gyms"
            selectedProvince={selectedCity}
            onSelectProvince={(city) => setSelectedCity(city)}
          />
        </div>
      )}

      {/* 4. City Filter Pills & View Mode Switcher (Thumbnail / List / Slideshow) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {cities.map(city => (
            <button
              key={city}
              onClick={() => {
                setSelectedCity(city)
                setSlideshowIndex(0)
              }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs transition-all border ${
                selectedCity === city
                  ? isSandstone
                    ? 'bg-[#1a1815] border-[#1a1815] text-[#E2DACB] font-bold shadow-sm'
                    : 'bg-lime border-lime text-granite font-bold shadow-sm'
                  : isSandstone
                    ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]/70 hover:border-[#1a1815]/40 font-normal'
                    : 'bg-transparent border-white/10 text-slate-ash hover:text-chalk hover:border-white/20 font-light'
              }`}
            >
              {city === 'all' ? 'All Cities' : city}
            </button>
          ))}
        </div>

        {/* View Mode CTA */}
        <div
          className={`inline-flex items-center p-1 rounded-xl border self-start sm:self-auto ${
            isSandstone ? 'bg-[#FAF6EF] border-[#1a1815]/20' : 'bg-[#1B1E23] border-white/10'
          }`}
        >
          {(
            [
              { id: 'thumbnails', label: 'Thumbnails', icon: LayoutGrid },
              { id: 'list', label: 'List', icon: List },
              { id: 'slideshow', label: 'Slideshow', icon: GalleryHorizontal },
            ] as const
          ).map((mode) => {
            const Icon = mode.icon
            const active = viewMode === mode.id
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  active
                    ? isSandstone
                      ? 'bg-[#1a1815] text-white'
                      : 'bg-lime text-granite'
                    : isSandstone
                    ? 'text-[#524e48] hover:text-[#1a1815]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{mode.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Gym List / Thumbnails / Slideshow Views */}
      {filtered.length === 0 ? (
        <div
          className={`rounded-2xl p-10 text-center border ${
            isSandstone ? 'border-[#1a1815]/20 text-[#524e48]' : 'border-white/10 text-slate-ash'
          }`}
        >
          No climbing gyms match your current search or city filter.
        </div>
      ) : viewMode === 'slideshow' ? (
        (() => {
          const currentGym = filtered[slideshowIndex % filtered.length]
          const eff = getGymEffectiveRating(currentGym)
          const saved = wishlistedIds.includes(currentGym.id)
          return (
            <div
              className={`rounded-3xl overflow-hidden border shadow-card grid grid-cols-1 lg:grid-cols-12 ${
                isSandstone
                  ? 'bg-[#FFFDF9] border-[#1a1815]/20'
                  : 'bg-[#23262C] border-white/10'
              }`}
            >
              <div className="lg:col-span-7 relative h-72 sm:h-96 overflow-hidden">
                <img
                  src={currentGym.image}
                  alt={currentGym.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(currentGym)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-md transition-all ${
                      saved
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Pictogram
                      name={saved ? "wishlisted" : "wishlist"}
                      size={15}
                      className={saved ? "text-white" : "text-white"}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareTarget(currentGym)}
                    className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all"
                    title="Share Gym"
                  >
                    <Share2 size={15} />
                  </button>
                </div>

                {filtered.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSlideshowIndex(i => (i > 0 ? i - 1 : filtered.length - 1))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center border border-white/20 hover:bg-black"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSlideshowIndex(i => (i < filtered.length - 1 ? i + 1 : 0))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center border border-white/20 hover:bg-black"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/15">
                      {filtered.map((g, idx) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setSlideshowIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === slideshowIndex % filtered.length
                              ? 'bg-[#FF6B00] scale-125'
                              : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <GymLogoBadge gym={currentGym} size="md" />
                    <div className="min-w-0">
                      <Link
                        href={`/gyms/${currentGym.id}`}
                        className={`font-bold text-xl hover:underline block ${
                          isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                        }`}
                      >
                        {currentGym.name}
                      </Link>
                      <GymStarRating rating={eff.rating} reviewCount={eff.reviewCount} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedGymForMap(currentGym)}
                    className={`flex items-start gap-1.5 text-xs text-left hover:underline ${
                      isSandstone ? 'text-[#524e48]' : 'text-white/75'
                    }`}
                  >
                    <MapPin size={14} className="text-[#FF6B00] shrink-0 mt-0.5" />
                    <span>{currentGym.address || `${currentGym.city}, ${currentGym.province}`}</span>
                  </button>

                  <p className={`text-xs leading-relaxed ${isSandstone ? 'text-[#524e48]' : 'text-slate-ash'}`}>
                    {currentGym.description}
                  </p>

                  <div className="flex gap-1.5 flex-wrap">
                    {currentGym.facilities.map(f => (
                      <span
                        key={f}
                        className={`text-[10px] px-2 py-0.5 rounded-md border ${
                          isSandstone
                            ? 'border-[#1a1815]/20 text-[#1a1815]'
                            : 'border-white/10 text-slate-ash'
                        }`}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
                  <a
                    href={getGymGoogleMapsUrl(currentGym)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl text-xs font-bold border border-[#FF6B00]/40 text-[#FF6B00] hover:bg-[#FF6B00]/10 flex items-center gap-1.5"
                  >
                    <ExternalLink size={12} /> Google Maps
                  </a>
                  <Link
                    href={`/gyms/${currentGym.id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${
                      isSandstone ? 'bg-[#1a1815] text-white' : 'bg-lime text-granite'
                    }`}
                  >
                    Open Gym →
                  </Link>
                </div>
              </div>
            </div>
          )
        })()
      ) : viewMode === 'list' ? (
        <div className="space-y-3 pt-1">
          {filtered.map((gym) => {
            const eff = getGymEffectiveRating(gym)
            const saved = wishlistedIds.includes(gym.id)
            return (
              <div
                key={gym.id}
                className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isSandstone
                    ? 'bg-[#FFFDF9] border-[#1a1815]/20 hover:border-[#1a1815]/45'
                    : 'bg-[#23262C] border-white/10 hover:border-lime/40'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <GymLogoBadge gym={gym} size="md" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/gyms/${gym.id}`}
                        className={`font-bold text-base hover:underline ${
                          isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                        }`}
                      >
                        {gym.name}
                      </Link>
                      <GymStarRating rating={eff.rating} reviewCount={eff.reviewCount} size={12} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedGymForMap(gym)}
                      className={`inline-flex items-center gap-1 text-xs hover:underline text-left ${
                        isSandstone ? 'text-[#524e48]' : 'text-slate-ash'
                      }`}
                    >
                      <MapPin size={12} className="text-[#FF6B00] shrink-0" />
                      <span>{gym.address || `${gym.city}, ${gym.province}`}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(gym)}
                    className={`p-2 rounded-xl border transition-colors ${
                      saved
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                        : isSandstone
                        ? 'border-[#1a1815]/20 text-[#524e48] hover:text-rose-500'
                        : 'border-white/10 text-white/60 hover:text-rose-400'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Pictogram
                      name={saved ? "wishlisted" : "wishlist"}
                      size={14}
                      className={saved ? "text-[#F90657]" : "text-current"}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareTarget(gym)}
                    className={`p-2 rounded-xl border transition-colors ${
                      isSandstone
                        ? 'border-[#1a1815]/20 text-[#524e48] hover:text-[#FF6B00]'
                        : 'border-white/10 text-white/60 hover:text-lime'
                    }`}
                    title="Share Gym"
                  >
                    <Share2 size={14} />
                  </button>
                  <Link
                    href={`/gyms/${gym.id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${
                      isSandstone ? 'bg-[#1a1815] text-white' : 'bg-lime text-granite'
                    }`}
                  >
                    Open →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-1">
          {filtered.map((gym, i) => {
            const eff = getGymEffectiveRating(gym)
            const saved = wishlistedIds.includes(gym.id)
            return (
              <motion.div
                key={gym.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/gyms/${gym.id}`}>
                  <div
                    className={`rounded-2xl overflow-hidden touch-ripple transition-all group flex flex-col h-full border ${
                      isSandstone
                        ? 'bg-transparent border-[#1a1815]/20 hover:border-[#1a1815]/50'
                        : 'bg-transparent border-white/10 hover:border-lime/30'
                    }`}
                  >
                    {/* Gym Card Image + Quick Wishlist/Share */}
                    <div className="relative h-48 md:h-52 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${gym.image})` }}
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        <button
                          type="button"
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleToggleWishlist(gym)
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-md transition-all ${
                            saved
                              ? 'bg-rose-500 text-white border-rose-400'
                              : 'bg-black/55 text-white border-white/20 hover:bg-black/80'
                          }`}
                          title="Save to Wishlist"
                        >
                          <Pictogram
                            name={saved ? "wishlisted" : "wishlist"}
                            size={13}
                            className={saved ? "text-white" : "text-white"}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShareTarget(gym)
                          }}
                          className="w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all"
                          title="Share Gym"
                        >
                          <Share2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Gym Card Body */}
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        {/* Gym Logo & Judul Gym */}
                        <div className="flex items-center gap-2.5">
                          <GymLogoBadge gym={gym} size="sm" />
                          <h3
                            className={`font-bold text-base md:text-lg transition-colors line-clamp-1 ${
                              isSandstone
                                ? 'text-[#1a1815] group-hover:opacity-80'
                                : 'text-chalk group-hover:text-lime'
                            }`}
                          >
                            {gym.name}
                          </h3>
                        </div>

                        {/* Location & 5-Star Rating */}
                        <div className="flex flex-col gap-1.5 mt-2 mb-2.5">
                          <button
                            type="button"
                            onClick={e => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedGymForMap(gym)
                            }}
                            className={`inline-flex items-start gap-1 text-xs font-medium text-left transition-opacity hover:opacity-75 ${
                              isSandstone ? 'text-[#1a1815]/80' : 'text-slate-ash'
                            }`}
                            title="Tap to open in Google Maps or Apple Maps"
                          >
                            <MapPin
                              size={12}
                              className={`${isSandstone ? 'text-[#1a1815]' : 'text-lime'} shrink-0 mt-0.5`}
                            />
                            <span className="underline decoration-dotted underline-offset-2 line-clamp-1">
                              {gym.address || gym.city}
                            </span>
                          </button>

                          <GymStarRating
                            rating={eff.rating}
                            reviewCount={eff.reviewCount}
                            size={12}
                          />
                        </div>

                        {/* Description */}
                        <p
                          className={`text-xs font-normal line-clamp-2 mb-3 ${
                            isSandstone ? 'text-[#1a1815]/75' : 'text-slate-ash'
                          }`}
                        >
                          {gym.description}
                        </p>

                        {/* Facilities Badges */}
                        <div className="flex gap-1.5 flex-wrap mb-4">
                          {gym.facilities.slice(0, 4).map(f => (
                            <span
                              key={f}
                              className={`text-[10px] font-light px-2 py-0.5 rounded-md border ${
                                isSandstone
                                  ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]'
                                  : 'bg-transparent border-white/10 text-slate-ash'
                              }`}
                            >
                              {f}
                            </span>
                          ))}
                          {gym.facilities.length > 4 && (
                            <span
                              className={`text-[10px] font-light px-2 py-0.5 rounded-md border ${
                                isSandstone
                                  ? 'bg-transparent border-[#1a1815]/40 text-[#1a1815]'
                                  : 'bg-transparent border-lime/30 text-lime'
                              }`}
                            >
                              +{gym.facilities.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Harga V2.0 preview & Open Gym CTA */}
                      <div
                        className={`flex items-center justify-between pt-3 border-t ${
                          isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
                        }`}
                      >
                        <div>
                          <span
                            className={`text-[10px] block font-light leading-tight ${
                              isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                            }`}
                          >
                            Day Pass Est.
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span
                              className={`text-sm md:text-base font-bold ${
                                isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                              }`}
                            >
                              Rp {(gym.pricePerSession / 1000).toFixed(0)}k
                            </span>
                            <span
                              className={`text-[11px] font-light ${
                                isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                              }`}
                            >
                              /session
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all ${
                            isSandstone
                              ? 'border-[#1a1815]/30 text-[#1a1815] group-hover:border-[#1a1815] group-hover:bg-[#1a1815] group-hover:text-[#E2DACB]'
                              : 'border-lime/40 text-lime group-hover:border-lime group-hover:bg-lime group-hover:text-granite'
                          }`}
                        >
                          View Gym →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Share Link Modals (Page & Individual Gym) */}
      <ShareLinkModal
        open={sharePageOpen}
        onClose={() => setSharePageOpen(false)}
        title="Climbing Gym Directory — Jalur"
        subtitle="Indonesian Climbing & Bouldering Gyms"
        shareUrl="/gyms"
        categoryLabel="Share Gyms"
      />
      {shareTarget && (
        <ShareLinkModal
          open={!!shareTarget}
          onClose={() => setShareTarget(null)}
          title={shareTarget.name}
          subtitle={`${shareTarget.city} · ${shareTarget.address}`}
          shareUrl={`/gyms/${shareTarget.id}`}
          categoryLabel="Share Gym"
        />
      )}

      {/* MODAL PILIHAN GOOGLE MAPS / APPLE MAPS (Requirement 2) */}
      <AnimatePresence>
        {selectedGymForMap && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedGymForMap(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-sm rounded-2xl p-5 border shadow-2xl ${
                isSandstone
                  ? 'bg-[#E2DACB] border-[#1a1815]/20 text-[#1a1815]'
                  : 'bg-granite border-white/15 text-chalk'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-base">{selectedGymForMap.name}</h4>
                  <p
                    className={`text-xs mt-0.5 line-clamp-1 ${
                      isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                    }`}
                  >
                    {selectedGymForMap.address || selectedGymForMap.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGymForMap(null)}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <p
                className={`text-xs mb-3 font-medium ${
                  isSandstone ? 'text-[#1a1815]/80' : 'text-slate-ash'
                }`}
              >
                Open location in maps:
              </p>

              <div className="space-y-2">
                {/* Google Maps Option */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${selectedGymForMap.name}, ${selectedGymForMap.address || selectedGymForMap.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSelectedGymForMap(null)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isSandstone
                      ? 'bg-white/60 hover:bg-white border-[#1a1815]/15 text-[#1a1815]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-chalk'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                      <Compass size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold">Google Maps</div>
                      <div className="text-[10px] opacity-70">
                        Directions & live traffic
                      </div>
                    </div>
                  </div>
                  <ExternalLink size={14} className="opacity-50" />
                </a>

                {/* Apple Maps Option */}
                <a
                  href={`https://maps.apple.com/?q=${encodeURIComponent(
                    `${selectedGymForMap.name}, ${selectedGymForMap.address || selectedGymForMap.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSelectedGymForMap(null)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isSandstone
                      ? 'bg-white/60 hover:bg-white border-[#1a1815]/15 text-[#1a1815]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-chalk'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                      <MapPin size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold">Apple Maps</div>
                      <div className="text-[10px] opacity-70">
                        Open with Apple Maps app
                      </div>
                    </div>
                  </div>
                  <ExternalLink size={14} className="opacity-50" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

