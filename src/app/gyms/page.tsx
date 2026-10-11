'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Star, MapPin, Compass, ExternalLink, X, Heart } from 'lucide-react'
import Link from 'next/link'
import { useGyms } from '@/lib/use-data'
import { useTheme } from '@/lib/theme-context'
import { Gym } from '@/lib/mock-data'
import dynamic from 'next/dynamic'

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
  const isSandstone = theme === 'sandstone'
  const [query, setQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedGymForMap, setSelectedGymForMap] = useState<Gym | null>(null)

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
        <h1
          className={`font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}
        >
          Climbing Gym
        </h1>
        <p
          className={`text-xs md:text-sm font-light mt-1 ${
            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
          }`}
        >
          Indonesian Climbing & Bouldering Gym Directory & Session Booking
        </p>
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

      {/* 3. Interactive Indonesia Gyms Map */}
      <div className="my-4">
        <InteractiveIndonesiaMap
          mode="gyms"
          selectedProvince={selectedCity}
          onSelectProvince={(city) => setSelectedCity(city)}
        />
      </div>

      {/* 4. City Filter Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {cities.map(city => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
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

      {/* 5. Gym Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-1">
        {filtered.map((gym, i) => (
          <motion.div
            key={gym.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link href={`/gyms/${gym.id}`}>
              <div
                className={`rounded-2xl overflow-hidden touch-ripple transition-all group flex flex-col h-full border ${
                  isSandstone
                    ? 'bg-transparent border-[#1a1815]/20 hover:border-[#1a1815]/50'
                    : 'bg-transparent border-white/10 hover:border-lime/30'
                }`}
              >
                {/* Gym Card Image */}
                <div className="relative h-48 md:h-52 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${gym.image})` }}
                  />
                </div>

                {/* Gym Card Body */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Gym Title */}
                    <h3
                      className={`font-bold text-base md:text-lg transition-colors ${
                        isSandstone
                          ? 'text-[#1a1815] group-hover:opacity-80'
                          : 'text-chalk group-hover:text-lime'
                      }`}
                    >
                      {gym.name}
                    </h3>

                    {/* 2 & 3. Location di bawah judul gym (tappable for maps option) & Rate sejajar dengan location */}
                    <div className="flex items-center gap-2.5 mt-1.5 mb-2.5 flex-wrap">
                      {/* Location button with open in maps option */}
                      <button
                        type="button"
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedGymForMap(gym)
                        }}
                        className={`inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-75 ${
                          isSandstone ? 'text-[#1a1815]/80' : 'text-slate-ash'
                        }`}
                        title="Tap to open in Google Maps or Apple Maps"
                      >
                        <MapPin
                          size={12}
                          className={isSandstone ? 'text-[#1a1815]' : 'text-lime'}
                        />
                        <span className="underline decoration-dotted underline-offset-2">
                          {gym.city}
                        </span>
                      </button>

                      {/* Separator dot */}
                      <span
                        className={`text-[10px] ${
                          isSandstone ? 'text-[#1a1815]/30' : 'text-white/20'
                        }`}
                      >
                        •
                      </span>

                      {/* Rate sejajar dengan location */}
                      <div className="flex items-center gap-1 text-xs">
                        <Star size={11} className="text-lime fill-lime" />
                        <span
                          className={`font-bold ${
                            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                          }`}
                        >
                          {gym.rating}
                        </span>
                        <span
                          className={`text-[10px] font-light ${
                            isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                          }`}
                        >
                          ({gym.reviewCount})
                        </span>
                      </div>
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

                  {/* Harga 'Start From' & Book Session outline button */}
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
                        Start From
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
                      Book Session →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

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

