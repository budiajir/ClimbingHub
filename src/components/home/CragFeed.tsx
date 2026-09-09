'use client'

import { motion } from 'framer-motion'
import { MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cragRegions } from '@/lib/mock-data'
import { useTheme } from '@/lib/theme-context'

export default function CragFeed() {
  const { isSandstone } = useTheme()

  return (
    <section className="px-4 md:px-0 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`font-bold text-base md:text-xl tracking-tight ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}>
            Top Indonesian Crags
          </h2>
          <p className={`text-[11px] md:text-xs font-light ${
            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
          }`}>
            Premier outdoor bouldering destinations in Indonesia
          </p>
        </div>
        <Link
          href="/beta"
          className={`flex items-center gap-1 text-xs md:text-sm font-light hover:underline tracking-wide ${
            isSandstone ? 'text-[#1a1815] font-semibold' : 'text-lime'
          }`}
        >
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
            className="flex-shrink-0 w-64 md:w-auto"
          >
            <Link
              href={`/beta?region=${crag.id}`}
              className={`rounded-2xl overflow-hidden transition-all flex flex-col justify-between group border block ${
                isSandstone
                  ? 'bg-transparent border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                  : 'bg-transparent border border-white/10 hover:border-lime/30 text-chalk'
              }`}
            >
              <div>
                <div className="h-36 md:h-40 overflow-hidden relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${crag.image})` }}
                  />
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-bold text-base transition-colors ${
                        isSandstone ? 'text-[#1a1815] group-hover:underline' : 'text-chalk group-hover:text-lime'
                      }`}>
                        {crag.name}
                      </h3>
                      <div className={`flex items-center gap-1 text-xs font-light ${
                        isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                      }`}>
                        <MapPin size={11} />
                        <span>{crag.province}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSandstone ? 'border-[#1a1815]/30 text-[#1a1815]' : 'border-lime/40 text-lime'
                    }`}>
                      {crag.sectorCount} Sectors
                    </span>
                  </div>

                  <p className={`text-xs font-light line-clamp-2 leading-relaxed ${
                    isSandstone ? 'text-[#1a1815]/75' : 'text-slate-ash'
                  }`}>
                    {crag.description || `Premier outdoor bouldering destination in ${crag.province} with ${crag.sectorCount} verified sectors.`}
                  </p>
                </div>
              </div>

              <div className={`p-4 pt-0 flex items-center justify-between text-xs border-t ${
                isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
              }`}>
                <span className={`font-light text-[11px] ${
                  isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                }`}>
                  {crag.problemCount} Verified Problems
                </span>
                <span className={`font-bold flex items-center gap-0.5 ${
                  isSandstone ? 'text-[#1a1815]' : 'text-lime'
                }`}>
                  View Topo <ChevronRight size={13} />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
