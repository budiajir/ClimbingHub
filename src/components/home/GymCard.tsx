'use client'

import { motion } from 'framer-motion'
import { Star, Clock, MapPin, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { gyms } from '@/lib/mock-data'

function SlotBadge({ remaining, total }: { remaining: number; total: number }) {
  const pct = (remaining / total) * 100
  const color = pct > 50 ? 'text-lime' : pct > 20 ? 'text-project' : 'text-redpoint'
  const bg = pct > 50 ? 'bg-lime/10 border-lime/20' : pct > 20 ? 'bg-project/10 border-project/20' : 'bg-redpoint/10 border-redpoint/20'

  return (
    <span className={`text-[10px] font-light px-2 py-0.5 rounded-full border ${bg} ${color}`}>
      {remaining > 0 ? `${remaining} slot` : 'PENUH'}
    </span>
  )
}

export default function GymCard() {
  return (
    <section className="px-4 md:px-0 pb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-chalk font-bold text-base md:text-xl tracking-tight flex items-center gap-2">
            Featured Bouldering Gyms
          </h2>
          <p className="text-slate-ash text-[11px] md:text-xs font-light">Sesi tersedia & live quota booking hari ini</p>
        </div>
        <Link
          href="/gyms"
          className="flex items-center gap-1 text-lime text-xs md:text-sm font-light tracking-wide touch-ripple hover:underline"
        >
          Lihat Semua <ChevronRight size={14} />
        </Link>
      </div>

      {/* Gym cards: 1-col on mobile, 3-cols on desktop */}
      <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-6">
        {gyms.slice(0, 3).map((gym, i) => (
          <motion.div
            key={gym.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col h-full"
          >
            <Link href={`/gyms/${gym.id}`} className="flex-1">
              <div className="bg-crag rounded-2xl overflow-hidden touch-ripple hover:shadow-card-hover border border-white/5 hover:border-lime/30 transition-all flex flex-col h-full group">
                {/* Photo — Full-frame, no gradient */}
                <div className="relative h-44 md:h-52 overflow-hidden border-b border-white/5">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${gym.image})` }}
                  />

                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 glass bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 border border-white/10">
                    <Star size={11} className="text-lime fill-lime" />
                    <span className="text-chalk text-xs font-bold">{gym.rating}</span>
                    <span className="text-slate-ash text-[10px] font-light">({gym.reviewCount})</span>
                  </div>

                  {/* City badge */}
                  <div className="absolute top-3 left-3 glass bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 border border-white/10">
                    <MapPin size={10} className="text-slate-ash" />
                    <span className="text-chalk text-[10px] font-light">{gym.city}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5 md:p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-chalk font-bold text-sm md:text-base mb-1 group-hover:text-lime transition-colors">
                      {gym.name}
                    </h3>
                    <p className="text-slate-ash text-xs font-normal line-clamp-2 mb-3">
                      {gym.description}
                    </p>

                    {/* Slot counters */}
                    <div className="bg-granite rounded-xl p-2.5 mb-3 border border-white/5">
                      <div className="flex items-center gap-1 text-slate-ash text-[10px] uppercase tracking-wider mb-1.5 font-light">
                        <Clock size={11} className="text-lime" /> Live Quota Status
                      </div>
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-ash text-[10px] font-light">Pagi</span>
                          <SlotBadge remaining={gym.slots.morning} total={gym.maxSlots.morning} />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-ash text-[10px] font-light">Siang</span>
                          <SlotBadge remaining={gym.slots.afternoon} total={gym.maxSlots.afternoon} />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-ash text-[10px] font-light">Sore</span>
                          <SlotBadge remaining={gym.slots.evening} total={gym.maxSlots.evening} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="text-chalk font-bold text-base md:text-lg">
                        Rp {gym.pricePerSession.toLocaleString('id-ID')}
                      </span>
                      <span className="text-slate-ash text-[11px] font-light">/sesi</span>
                    </div>
                    <button className="bg-lime text-granite text-xs font-light tracking-wide px-4 py-2 rounded-xl hover:bg-lime-dim transition-all shadow-lime-glow-sm group-hover:scale-105 touch-ripple">
                      Book Sesi
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
