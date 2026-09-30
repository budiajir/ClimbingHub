'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Star, MapPin, Compass, ExternalLink, X } from 'lucide-react'
import Link from 'next/link'
import { useGyms } from '@/lib/use-data'
import { useTheme } from '@/lib/theme-context'
import { Gym } from '@/lib/mock-data'

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
          placeholder="Search gym, city, or facility..."
          className={`w-full py-2.5 px-6 rounded-full text-xs sm:text-sm outline-none transition-all border ${
            isSandstone
              ? 'bg-black/[0.03] text-[#1a1815] placeholder:text-[#1a1815]/40 border-[#1a1815]/25 focus:border-[#1a1815]'
              : 'bg-white/[0.05] text-chalk placeholder:text-white/40 border-white/15 focus:border-lime/50'
          }`}
        />
      </div>

      {/* 3. Map Banner — Fullframe edge-to-edge (Disamakan dengan 'Crags' dan 'Problems') */}
      <div
        className={`-mx-4 sm:-mx-6 lg:-mx-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] rounded-none overflow-hidden my-4 relative shadow-md transition-colors duration-300 border-y ${
          isSandstone
            ? 'bg-[#C4B48A] border-[#1a1815]/15'
            : 'bg-[#181C20] border-white/10'
        }`}
      >
        <div className="relative py-6 sm:py-8 px-4 flex items-center justify-center min-h-[220px] sm:min-h-[280px] md:min-h-[340px] overflow-hidden">
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20 pointer-events-none" />

          {/* Map Graphic with Interactive City Dots */}
          <div className="relative w-full max-w-4xl aspect-[2.16/1] flex items-center justify-center">
            <img
              src="/images/indonesia-gyms-map.jpg"
              alt="Indonesia Climbing Gyms Map"
              className={`w-full h-full object-contain filter drop-shadow-md select-none ${
                isSandstone
                  ? 'mix-blend-multiply opacity-85'
                  : 'invert mix-blend-screen opacity-90'
              }`}
            />

            {/* City Pin: Jakarta (approx 28% left, 69% top) */}
            <button
              type="button"
              onClick={() => setSelectedCity(selectedCity === 'South Jakarta' ? 'all' : 'South Jakarta')}
              className="group absolute top-[68%] left-[28%] -translate-x-1/2 -translate-y-1/2 z-10 focus:outline-none"
              title="Jakarta Gyms"
            >
              <span className="absolute -inset-1 rounded-full bg-lime/40 animate-ping" />
              <span className="relative flex h-3 w-3 rounded-full bg-lime border-2 border-black" />
              <span className="absolute left-1/2 -bottom-5 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-white bg-black/85 px-1.5 py-0.5 rounded shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                Jakarta
              </span>
            </button>

            {/* City Pin: Bandung (approx 31% left, 71% top) */}
            <button
              type="button"
              onClick={() => setSelectedCity(selectedCity === 'Bandung' ? 'all' : 'Bandung')}
              className="group absolute top-[70%] left-[31%] -translate-x-1/2 -translate-y-1/2 z-10 focus:outline-none"
              title="Bandung Gyms"
            >
              <span className="absolute -inset-1 rounded-full bg-lime/40 animate-ping" />
              <span className="relative flex h-3 w-3 rounded-full bg-lime border-2 border-black" />
              <span className="absolute left-1/2 -bottom-5 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-white bg-black/85 px-1.5 py-0.5 rounded shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                Bandung
              </span>
            </button>

            {/* City Pin: Yogyakarta (approx 36% left, 73% top) */}
            <button
              type="button"
              onClick={() => setSelectedCity(selectedCity === 'Yogyakarta' ? 'all' : 'Yogyakarta')}
              className="group absolute top-[72%] left-[36%] -translate-x-1/2 -translate-y-1/2 z-10 focus:outline-none"
              title="Yogyakarta Gyms"
            >
              <span className="absolute -inset-1 rounded-full bg-lime/40 animate-ping" />
              <span className="relative flex h-3 w-3 rounded-full bg-lime border-2 border-black" />
              <span className="absolute left-1/2 -bottom-5 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-white bg-black/85 px-1.5 py-0.5 rounded shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                Yogyakarta
              </span>
            </button>

            {/* City Pin: Surabaya / East Java (approx 40% left, 72% top) */}
            <div
              className="group absolute top-[72%] left-[40%] -translate-x-1/2 -translate-y-1/2 z-10 opacity-70"
              title="East Java"
            >
              <span className="relative flex h-2 w-2 rounded-full bg-white/80 border border-black" />
            </div>

            {/* City Pin: Bali (approx 44% left, 74% top) */}
            <div
              className="group absolute top-[74%] left-[44%] -translate-x-1/2 -translate-y-1/2 z-10 opacity-70"
              title="Bali"
            >
              <span className="relative flex h-2 w-2 rounded-full bg-white/80 border border-black" />
            </div>
          </div>

          {/* Map bottom badges */}
          <div className="absolute bottom-2.5 left-3 sm:left-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white border border-white/15">
              <MapPin size={10} className="text-lime" />
              Indonesian Gym Network
            </span>
            <span className="text-[10px] text-black/60 dark:text-white/50 hidden sm:inline font-medium">
              Tap a city pin to filter
            </span>
          </div>

          <div className="absolute bottom-2.5 right-3 sm:right-4">
            <span className="text-[10px] font-bold text-black/70 dark:text-white/70 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">
              {gyms.length} Gyms Mapped
            </span>
          </div>
        </div>
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

                  {/* 4. Harga di pojok kiri atas (sesuai arahan) */}
                  <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 border border-white/20 shadow-sm z-10">
                    <span className="text-white text-xs font-bold">
                      Rp {(gym.pricePerSession / 1000).toFixed(0)}k
                    </span>
                    <span className="text-white/70 text-[10px] font-normal">
                      /session
                    </span>
                  </div>
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

                  {/* 5 & 6. Slot dihilangkan, Book Session dikasih outline button */}
                  <div
                    className={`flex items-center justify-end pt-3 border-t ${
                      isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
                    }`}
                  >
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

