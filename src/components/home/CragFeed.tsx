'use client'

import { motion } from 'framer-motion'
import { Mountain, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cragRegions } from '@/lib/mock-data'

export default function CragFeed() {
  return (
    <section className="px-4 md:px-0 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-chalk font-bold text-base md:text-xl tracking-tight">Top Indonesian Crags</h2>
          <p className="text-slate-ash text-[11px] md:text-xs font-light">Destinasi outdoor bouldering terbaik di Indonesia</p>
        </div>
        <Link href="/beta" className="flex items-center gap-1 text-lime text-xs md:text-sm font-light hover:underline tracking-wide">
          Beta Book <ChevronRight size={14} />
        </Link>
      </div>

      {/* Horizontal scroll on mobile / Grid on desktop */}
      <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto md:overflow-visible no-scrollbar pb-1 md:pb-0">
        {cragRegions.map((crag, i) => (
          <motion.div
            key={crag.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 w-52 md:w-auto"
          >
            <Link href={`/beta?crag=${crag.id}`}>
              <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden touch-ripple group hover:shadow-card-hover transition-all border border-white/10">
                {/* Full-frame image — No gradient */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${crag.image})` }}
                />

                {/* Editorial metadata — bottom glass card */}
                <div className="absolute bottom-3 left-3 right-3 p-3.5 glass bg-black/50 backdrop-blur-md rounded-xl border border-white/15">
                  <div className="text-[10px] font-light text-white/70 uppercase tracking-widest mb-0.5">
                    {crag.province.split(' ').pop()?.toUpperCase()}
                  </div>

                  <h3 className="text-chalk font-bold text-base md:text-lg leading-tight mb-2 group-hover:text-lime transition-colors">
                    {crag.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div>
                        <div className="text-lime text-sm md:text-base font-bold">{crag.problemCount}</div>
                        <div className="text-white/50 text-[9px] uppercase tracking-wide font-light">Problems</div>
                      </div>
                      <div>
                        <div className="text-chalk text-sm md:text-base font-bold">{crag.sectorCount}</div>
                        <div className="text-white/50 text-[9px] uppercase tracking-wide font-light">Sektors</div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-lime/20 border border-lime/30 flex items-center justify-center group-hover:bg-lime group-hover:text-granite transition-colors">
                      <Mountain size={14} className="text-lime group-hover:text-granite" />
                    </div>
                  </div>
                </div>

                {/* Top metadata */}
                <div className="absolute top-3 right-3 text-right">
                  <div className="text-[9px] font-light text-white/80 uppercase tracking-widest glass bg-black/50 px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-md">
                    {i === 0 ? 'WEST JAVA' : i === 1 ? 'WEST SUMATRA' : 'YOGYAKARTA'}
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
