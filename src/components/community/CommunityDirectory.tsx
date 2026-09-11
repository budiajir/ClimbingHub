'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Users, Instagram, MessageCircle } from 'lucide-react'
import { useCommunities } from '@/lib/use-data'
import { useTheme } from '@/lib/theme-context'

export default function CommunityDirectory() {
  const { communities } = useCommunities()
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const [filterCity, setFilterCity] = useState<string>('all')

  const cities = ['all', ...Array.from(new Set(communities.map(c => c.city)))]
  const filtered = filterCity === 'all' ? communities : communities.filter(c => c.city === filterCity)

  return (
    <div className="space-y-6">
      {/* City Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {cities.map(city => (
          <button
            key={city}
            onClick={() => setFilterCity(city)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs transition-all border ${
              filterCity === city
                ? isSandstone
                  ? 'bg-transparent border-[#1a1815] text-[#1a1815] font-bold'
                  : 'bg-transparent border-lime text-lime font-bold'
                : isSandstone
                  ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]/70 hover:border-[#1a1815]/40 font-light'
                  : 'bg-transparent border-white/10 text-slate-ash hover:text-chalk hover:border-white/20 font-light'
            }`}
          >
            {city === 'all' ? 'All Cities' : city}
          </button>
        ))}
      </div>

      {/* Main Grid: Full Width Squads & Clubs Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`font-bold text-base md:text-xl flex items-center gap-2 ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}>
            Climbing Squads & Clubs
            <span className={`text-xs font-light ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
              ({filtered.length} communities)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((comm, i) => (
            <motion.div
              key={comm.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-2xl overflow-hidden touch-ripple transition-all flex flex-col justify-between group ${
                isSandstone
                  ? 'bg-[#f4efe6] border border-[#1a1815]/20 shadow-sm hover:border-[#1a1815]/50'
                  : 'bg-crag border border-white/5 hover:border-lime/30 hover:shadow-card-hover'
              }`}
            >
              {/* Header image */}
              <div>
                <div
                  className="h-36 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${comm.image})` }}
                />

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-bold text-base leading-tight transition-colors ${
                        isSandstone ? 'text-[#1a1815] group-hover:text-black' : 'text-chalk group-hover:text-lime'
                      }`}>
                        {comm.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className={isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'} />
                        <span className={`text-xs font-light ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>
                          {comm.city}, {comm.province}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 border rounded-full px-2.5 py-1 ${
                      isSandstone
                        ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]'
                        : 'bg-granite border-white/5 text-chalk'
                    }`}>
                      <Users size={12} className={isSandstone ? 'text-[#1a1815]' : 'text-cyan-climb'} />
                      <span className="text-xs font-bold">{comm.memberCount}</span>
                    </div>
                  </div>

                  <p className={`text-xs font-light leading-relaxed mb-3 line-clamp-2 ${
                    isSandstone ? 'text-[#1a1815]/75' : 'text-slate-ash'
                  }`}>
                    {comm.description}
                  </p>

                  {/* Members preview */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {comm.members.slice(0, 3).map(m => (
                        <div
                          key={m.name}
                          className={`w-7 h-7 rounded-full border-2 bg-cover bg-center ${
                            isSandstone ? 'border-[#f4efe6]' : 'border-crag'
                          }`}
                          style={{ backgroundImage: `url(${m.avatar})` }}
                          title={m.name}
                        />
                      ))}
                    </div>
                    <span className={`text-[11px] font-light ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
                      +{comm.memberCount - 3} climbers
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 flex gap-2">
                <a
                  href={comm.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 flex items-center justify-center gap-1.5 h-10 bg-transparent border rounded-xl text-xs font-medium tracking-wide touch-ripple transition-colors ${
                    isSandstone
                      ? 'border-[#1a1815]/20 hover:border-[#1a1815]/60 text-[#1a1815]'
                      : 'border-white/10 hover:border-white/30 text-chalk'
                  }`}
                >
                  <MessageCircle size={15} className="text-[#25D366]" /> WhatsApp
                </a>
                <a
                  href={comm.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 flex items-center justify-center gap-1.5 h-10 bg-transparent border rounded-xl text-xs font-medium tracking-wide touch-ripple transition-colors ${
                    isSandstone
                      ? 'border-[#1a1815]/20 hover:border-[#1a1815]/60 text-[#1a1815]'
                      : 'border-white/10 hover:border-white/30 text-chalk'
                  }`}
                >
                  <Instagram size={15} className="text-[#E1306C]" /> Instagram
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
