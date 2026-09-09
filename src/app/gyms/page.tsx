'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Star, MapPin, Building2, Check, Clock } from 'lucide-react'
import Link from 'next/link'
import { useGyms } from '@/lib/use-data'
import { useTheme } from '@/lib/theme-context'

export default function GymsPage() {
  const { gyms } = useGyms()
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const [query, setQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('all')

  const cities = ['all', ...Array.from(new Set(gyms.map(g => g.city)))]

  const filtered = gyms.filter(g => {
    const matchesQuery = g.name.toLowerCase().includes(query.toLowerCase()) || g.city.toLowerCase().includes(query.toLowerCase())
    const matchesCity = selectedCity === 'all' || g.city === selectedCity
    return matchesQuery && matchesCity
  })

  return (
    <div className="max-w-7xl mx-auto p-4 md:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
        isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
      }`}>
        <div>
          <h1 className={`font-bold text-xl md:text-3xl flex items-center gap-2 ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}>
            Boulder Gym Directory <Building2 size={24} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
          </h1>
          <p className={`text-xs md:text-sm font-light ${
            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
          }`}>
            Indonesian Climbing & Bouldering Gym Directory & Session Booking
          </p>
        </div>

        {/* Search Bar */}
        <div className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 border w-full md:w-80 transition-colors ${
          isSandstone
            ? 'bg-transparent border-[#1a1815]/20 focus-within:border-[#1a1815]'
            : 'bg-transparent border-white/10 focus-within:border-lime/40'
        }`}>
          <Search size={16} className={isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search gym or city..."
            className={`flex-1 bg-transparent text-xs md:text-sm font-normal focus:outline-none ${
              isSandstone
                ? 'text-[#1a1815] placeholder:text-[#1a1815]/40'
                : 'text-chalk placeholder:text-slate-ash/50'
            }`}
          />
        </div>
      </div>

      {/* City Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {cities.map(city => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs transition-all border ${
              selectedCity === city
                ? isSandstone
                  ? 'bg-transparent border-[#1a1815] text-[#1a1815] font-bold'
                  : 'bg-transparent border-lime text-lime font-bold'
                : isSandstone
                  ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]/70 hover:border-[#1a1815]/40'
                  : 'bg-transparent border-white/10 text-slate-ash hover:text-chalk hover:border-white/20 font-light'
            }`}
          >
            {city === 'all' ? 'All Cities' : city}
          </button>
        ))}
      </div>

      {/* Gym Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map((gym, i) => (
          <motion.div
            key={gym.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link href={`/gyms/${gym.id}`}>
              <div className={`rounded-2xl overflow-hidden touch-ripple transition-all group flex flex-col h-full border ${
                isSandstone
                  ? 'bg-transparent border-[#1a1815]/20 hover:border-[#1a1815]/50'
                  : 'bg-transparent border-white/10 hover:border-lime/30'
              }`}>
                <div className="relative h-48 md:h-52 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${gym.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 border border-white/15">
                    <Star size={11} className="text-lime fill-lime" />
                    <span className="text-chalk text-xs font-bold">{gym.rating}</span>
                    <span className="text-slate-ash text-[10px] font-light">({gym.reviewCount})</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 border border-white/15">
                    <MapPin size={10} className="text-slate-ash" />
                    <span className="text-chalk text-[10px] font-light">{gym.city}</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className={`font-bold text-base transition-colors ${
                        isSandstone ? 'text-[#1a1815] group-hover:opacity-80' : 'text-chalk group-hover:text-lime'
                      }`}>
                        {gym.name}
                      </h3>
                      <span className={`font-bold text-sm ${
                        isSandstone ? 'text-[#1a1815]' : 'text-lime'
                      }`}>
                        Rp {(gym.pricePerSession / 1000).toFixed(0)}k<span className={`text-[10px] font-light ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>/session</span>
                      </span>
                    </div>
                    <p className={`text-xs font-normal line-clamp-2 mb-3 ${
                      isSandstone ? 'text-[#1a1815]/75' : 'text-slate-ash'
                    }`}>
                      {gym.description}
                    </p>

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

                  <div className={`flex items-center justify-between pt-3 border-t ${
                    isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
                  }`}>
                    <div className={`text-xs font-light flex items-center gap-1 ${
                      isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                    }`}>
                      <Clock size={12} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
                      <span>{gym.slots.morning + gym.slots.afternoon + gym.slots.evening} slots available</span>
                    </div>
                    <span className={`text-xs font-medium tracking-wide group-hover:underline ${
                      isSandstone ? 'text-[#1a1815]' : 'text-lime'
                    }`}>
                      Book Session →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
