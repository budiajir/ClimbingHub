'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Star, MapPin, Building2, Check, Clock } from 'lucide-react'
import Link from 'next/link'
import { useGyms } from '@/lib/use-data'

export default function GymsPage() {
  const { gyms } = useGyms()
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-chalk font-bold text-xl md:text-3xl flex items-center gap-2">
            Boulder Gym Directory <Building2 size={24} className="text-lime" />
          </h1>
          <p className="text-slate-ash text-xs md:text-sm font-light">Direktori & Reservasi Sesi Wall Climbing & Bouldering Indonesia</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-crag rounded-xl px-3.5 py-2.5 border border-white/5 w-full md:w-80 focus-within:border-lime/30 transition-colors">
          <Search size={16} className="text-slate-ash" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari gym atau kota..."
            className="flex-1 bg-transparent text-chalk text-xs md:text-sm font-normal placeholder:font-light placeholder:text-slate-ash/50 focus:outline-none"
          />
        </div>
      </div>

      {/* City Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {cities.map(city => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs transition-all ${
              selectedCity === city
                ? 'bg-lime text-granite shadow-lime-glow-sm font-bold'
                : 'bg-crag text-slate-ash hover:text-chalk border border-white/5 font-light'
            }`}
          >
            {city === 'all' ? 'Semua Kota' : city}
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
              <div className="bg-crag border border-white/5 rounded-2xl overflow-hidden touch-ripple hover:border-lime/30 hover:shadow-card-hover transition-all group flex flex-col h-full">
                <div className="relative h-48 md:h-52 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${gym.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-crag via-crag/20 to-transparent" />
                  <div className="absolute top-3 left-3 glass rounded-full px-2.5 py-1 flex items-center gap-1">
                    <Star size={11} className="text-lime fill-lime" />
                    <span className="text-chalk text-xs font-bold">{gym.rating}</span>
                    <span className="text-slate-ash text-[10px] font-light">({gym.reviewCount})</span>
                  </div>
                  <div className="absolute top-3 right-3 glass rounded-full px-2.5 py-1 flex items-center gap-1">
                    <MapPin size={10} className="text-slate-ash" />
                    <span className="text-chalk text-[10px] font-light">{gym.city}</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="text-chalk font-bold text-base group-hover:text-lime transition-colors">
                        {gym.name}
                      </h3>
                      <span className="text-lime font-bold text-sm">
                        Rp {(gym.pricePerSession / 1000).toFixed(0)}k<span className="text-[10px] font-light text-slate-ash">/sesi</span>
                      </span>
                    </div>
                    <p className="text-slate-ash text-xs font-normal line-clamp-2 mb-3">
                      {gym.description}
                    </p>

                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {gym.facilities.slice(0, 4).map(f => (
                        <span key={f} className="text-[10px] text-slate-ash font-light bg-granite px-2 py-0.5 rounded-md border border-white/5">
                          {f}
                        </span>
                      ))}
                      {gym.facilities.length > 4 && (
                        <span className="text-[10px] text-lime font-light bg-lime/10 px-2 py-0.5 rounded-md border border-lime/20">
                          +{gym.facilities.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="text-slate-ash text-xs font-light flex items-center gap-1">
                      <Clock size={12} className="text-lime" />
                      <span>{gym.slots.morning + gym.slots.afternoon + gym.slots.evening} slot tersedia</span>
                    </div>
                    <span className="text-lime text-xs font-light tracking-wide group-hover:underline">
                      Pesan Tiket →
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
