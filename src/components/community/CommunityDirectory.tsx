'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Users, Instagram, MessageCircle } from 'lucide-react'
import { useCommunities } from '@/lib/use-data'

export default function CommunityDirectory() {
  const { communities } = useCommunities()
  const [filterCity, setFilterCity] = useState<string>('all')

  const cities = ['all', ...Array.from(new Set(communities.map(c => c.city)))]
  const filtered = filterCity === 'all' ? communities : communities.filter(c => c.city === filterCity)

  return (
    <div className="space-y-6">
      {/* City Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 md:px-0">
        {cities.map(city => (
          <button
            key={city}
            onClick={() => setFilterCity(city)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs transition-all ${
              filterCity === city
                ? 'bg-lime text-granite shadow-lime-glow-sm font-bold'
                : 'bg-crag text-slate-ash hover:text-chalk border border-white/5 font-light'
            }`}
          >
            {city === 'all' ? 'Semua Kota' : city}
          </button>
        ))}
      </div>

      {/* Main Grid: Full Width Squads & Clubs Directory */}
      <div className="px-4 md:px-0 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-chalk font-bold text-base md:text-xl flex items-center gap-2">
            Climbing Squads & Clubs
            <span className="text-slate-ash text-xs font-light">({filtered.length} komunitas)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((comm, i) => (
            <motion.div
              key={comm.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-crag border border-white/5 rounded-2xl overflow-hidden touch-ripple hover:border-lime/30 hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              {/* Header image */}
              <div>
                <div
                  className="h-36 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${comm.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-crag/95 via-crag/40 to-transparent" />
                  {/* Tags */}
                  <div className="absolute top-2.5 right-2.5 flex gap-1 flex-wrap justify-end">
                    {comm.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] font-light glass px-2 py-0.5 rounded-md text-chalk/90 uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-chalk font-bold text-base leading-tight group-hover:text-lime transition-colors">
                        {comm.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-slate-ash" />
                        <span className="text-slate-ash text-xs font-light">{comm.city}, {comm.province}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-granite border border-white/5 rounded-full px-2.5 py-1">
                      <Users size={12} className="text-cyan-climb" />
                      <span className="text-chalk text-xs font-bold">{comm.memberCount}</span>
                    </div>
                  </div>

                  <p className="text-slate-ash text-xs font-normal leading-relaxed mb-3 line-clamp-2">{comm.description}</p>

                  {/* Members preview */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-2">
                      {comm.members.slice(0, 3).map(m => (
                        <div
                          key={m.name}
                          className="w-7 h-7 rounded-full border-2 border-crag bg-cover bg-center"
                          style={{ backgroundImage: `url(${m.avatar})` }}
                          title={m.name}
                        />
                      ))}
                    </div>
                    <span className="text-slate-ash text-[11px] font-light">+{comm.memberCount - 3} climbers</span>
                  </div>

                  {/* Homebase */}
                  <div className="text-xs text-slate-ash mb-4 bg-granite p-2 rounded-xl border border-white/5 font-light">
                    🏟️ Homebase: <span className="text-chalk font-normal">{comm.homebase}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 flex gap-2">
                <a
                  href={comm.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl text-[#25D366] text-xs font-light tracking-wide touch-ripple hover:bg-[#25D366]/20 transition-colors"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
                <a
                  href={comm.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400 text-xs font-light tracking-wide touch-ripple hover:bg-pink-500/20 transition-colors"
                >
                  <Instagram size={15} /> Instagram
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
