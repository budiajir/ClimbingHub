'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import HeroBanner from '@/components/home/HeroBanner'
import LogAscentModal from '@/components/beta/LogAscentModal'
import AscentShareModal from '@/components/beta/AscentShareModal'
import { UserAscent, saveUserAscent } from '@/lib/user-ascents'
import {
  Users,
  Mountain,
  ChevronRight,
  MapPin,
  Star,
  Layers,
  Compass,
  Instagram,
  UserPlus,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { Problem, Community } from '@/lib/mock-data'
import RequestToJoinModal from '@/components/community/RequestToJoinModal'
import { useGyms, useCragRegions, useCommunities } from '@/lib/use-data'
import { gradeColors } from '@/lib/tokens'
import { useAuth } from '@/lib/auth-context'
import { canLogAscent } from '@/lib/permissions'
import { useTheme } from '@/lib/theme-context'

export default function HomePage() {
  const { role, openAuthModal } = useAuth()
  const { isSandstone } = useTheme()
  const [showLogModal, setShowLogModal] = useState(false)
  const [activeShareAscent, setActiveShareAscent] = useState<UserAscent | null>(null)
  const [selectedJoinCommunity, setSelectedJoinCommunity] = useState<Community | null>(null)
  const { gyms } = useGyms()
  const { cragRegions } = useCragRegions()
  const { communities } = useCommunities()

  const handleFABPress = () => {
    if (!canLogAscent(role)) {
      openAuthModal('Please sign in or create an account to log your climbing ascents.')
    } else {
      setShowLogModal(true)
    }
  }

  // Flatten featured problems across crags
  const featuredProblems = cragRegions.flatMap(r =>
    r.sectors.flatMap(s =>
      s.problems.map(p => ({
        ...p,
        regionId: r.id,
        sectorId: s.id,
        cragName: r.name,
        sectorName: s.name,
        cragImage: r.image,
        sectorImage: s.image,
      }))
    )
  )

  return (
    <div className={`pb-16 md:pb-24 transition-colors duration-300 ${
      isSandstone ? 'bg-[#d2c5ae] text-[#1a1815]' : 'bg-[#23262C] text-chalk'
    }`}>
      {/* 1. TOP HERO BANNER */}
      <HeroBanner />

      {/* MAIN VERTICAL FEED */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-10 md:space-y-14 pt-6 md:pt-8">

        {/* ============================================================ */}
        {/* SECTION 1: CRAGS                                             */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div>
            <Link href="/crags" className="group inline-block">
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight transition-colors ${
                isSandstone ? 'text-[#1a1815] group-hover:opacity-75' : 'text-chalk group-hover:text-lime'
              }`}>
                Crags
              </h2>
            </Link>
            <p className={`text-xs md:text-sm font-light mt-0.5 ${
              isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
            }`}>
              Natural crags, karst formations, and outdoor climbing destinations
            </p>
          </div>

          {/* Mobile: Horizontal scrollable cards / Desktop: 3-4 cols */}
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {cragRegions.map((crag, idx) => (
              <motion.div
                key={crag.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
                className="w-72 md:w-auto flex-shrink-0"
              >
                <Link
                  href={`/crags/${crag.id}`}
                  className={`h-full rounded-2xl overflow-hidden transition-all flex flex-col justify-between group border shadow-sm hover:shadow-lg ${
                    isSandstone
                      ? 'bg-transparent border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                      : 'bg-transparent border border-white/10 hover:border-lime/30 text-chalk'
                  }`}
                >
                  <div>
                    <div className="h-36 md:h-40 overflow-hidden relative">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-108"
                        style={{ backgroundImage: `url(${crag.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
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
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                          isSandstone ? 'border-[#1a1815]/30 text-[#1a1815] group-hover:bg-[#1a1815]/10' : 'border-lime/40 text-lime group-hover:bg-lime/10'
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
                    <span className={`font-bold flex items-center gap-0.5 transition-colors ${
                      isSandstone ? 'text-[#1a1815]' : 'text-lime'
                    }`}>
                      <span>Explore Crags</span>
                      <ChevronRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* DIVIDER LINE */}
        <div className={isSandstone ? 'border-t border-[#1a1815]/20' : 'border-t border-white/10'} />

        {/* ============================================================ */}
        {/* SECTION 2: PROBLEMS                                          */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div>
            <Link href="/beta" className="group inline-block">
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight transition-colors ${
                isSandstone ? 'text-[#1a1815] group-hover:opacity-75' : 'text-chalk group-hover:text-lime'
              }`}>
                Problems
              </h2>
            </Link>
            <p className={`text-xs md:text-sm font-light mt-0.5 ${
              isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
            }`}>
              Catalog of verified boulder problems & topo betas
            </p>
          </div>

          {/* Mobile: Horizontal scrollable portrait cards / Desktop: 3-4 cols */}
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {featuredProblems.slice(0, 8).map((problem, idx) => {
              const gradeColor = gradeColors[problem.grade] || '#CCFF00'
              const photoUrl = problem.imageUrl || problem.sectorImage || problem.cragImage || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80'
              const markers = (problem.markers && problem.markers.length >= 2)
                ? problem.markers
                : [
                    { x: 28, y: 80, type: 'S' },
                    { x: 48, y: 52, type: 'Z' },
                    { x: 68, y: 22, type: 'T' }
                  ]

              return (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -8, scale: 1.015, transition: { duration: 0.25, ease: 'easeOut' } }}
                  className="relative aspect-[3/4] w-64 md:w-auto flex-shrink-0 group rounded-2xl"
                >
                  <Link
                    href={`/beta?region=${problem.regionId}&sector=${problem.sectorId}&problem=${problem.id}`}
                    className={`relative w-full h-full rounded-2xl overflow-hidden flex flex-col justify-between border shadow-md hover:shadow-2xl transition-all ${
                      isSandstone
                        ? 'border-[#1a1815]/20 hover:border-[#1a1815]/60'
                        : 'border-white/10 hover:border-lime/40'
                    }`}
                  >
                    {/* Portrait Background Photo with smooth zoom */}
                    <img
                      src={photoUrl}
                      alt={problem.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient overlays for readability */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/95 via-black/65 to-transparent pointer-events-none z-10" />

                    {/* Subtle Shimmer highlight on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    </div>

                    {/* Animated SVG Topo Line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      {/* Underlying soft glow line */}
                      <polyline
                        points={markers.map((m) => `${m.x}%,${m.y}%`).join(' ')}
                        fill="none"
                        stroke="#B1FA63"
                        strokeWidth="6"
                        opacity="0.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-opacity duration-300 group-hover:opacity-60"
                      />
                      {/* Marching dash topo route line */}
                      <polyline
                        points={markers.map((m) => `${m.x}%,${m.y}%`).join(' ')}
                        fill="none"
                        stroke="#B1FA63"
                        strokeWidth="3.5"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-topo-dash"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.85))' }}
                      />
                    </svg>

                    {/* Animated Marker Points with Radar Pulse */}
                    {markers.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}
                        className="absolute pointer-events-none z-10 flex items-center justify-center"
                      >
                        {/* Radar Pulse ring for Start & Top Finish hold */}
                        {(m.type === 'T' || m.type === 'S') && (
                          <span
                            className={`absolute w-7 h-7 rounded-full animate-anchor-pulse ${
                              m.type === 'T' ? 'bg-rose-500/50 ring-1 ring-rose-400/80' : 'bg-emerald-500/50 ring-1 ring-emerald-400/80'
                            }`}
                          />
                        )}
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-md z-10 transition-transform duration-300 group-hover:scale-110 ${
                            m.type === 'S'
                              ? 'bg-emerald-500 text-white ring-1.5 ring-white'
                              : m.type === 'T'
                              ? 'bg-rose-500 text-white ring-1.5 ring-white'
                              : 'bg-lime text-granite ring-1.5 ring-black'
                          }`}
                        >
                          {m.type || (mIdx + 1)}
                        </div>
                      </div>
                    ))}

                    {/* Card Top: Discipline & Grade badges */}
                    <div className="relative z-20 p-3.5 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white/90 border border-white/20 flex items-center gap-1 shadow-sm">
                        <Compass size={10} className="text-lime animate-spin-slow" /> {problem.discipline ? problem.discipline.toUpperCase() : 'BOULDER'}
                      </span>

                      <div
                        className="px-2 py-0.5 rounded-md font-bold font-mono text-xs backdrop-blur-md bg-black/70 border shadow-sm transition-transform duration-300 group-hover:scale-105"
                        style={{ borderColor: gradeColor, color: gradeColor }}
                      >
                        {problem.grade}
                      </div>
                    </div>

                    {/* Card Bottom: Route Name, Location, Sends */}
                    <div className="relative z-20 p-3.5 space-y-1">
                      <h3 className="font-bold text-base md:text-lg text-white leading-tight drop-shadow-sm group-hover:text-lime transition-colors">
                        {problem.name}
                      </h3>
                      <p className="text-xs text-white/75 truncate font-light">
                        {problem.cragName} · {problem.sectorName.split('—')[0]}
                      </p>

                      <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
                        <span className="font-light text-[11px] text-white/70">
                          {problem.ascentCount} logged sends
                        </span>
                        <span className="font-bold text-lime flex items-center gap-0.5 text-xs">
                          <span>Explore Crags</span>
                          <ChevronRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* DIVIDER LINE */}
        <div className={isSandstone ? 'border-t border-[#1a1815]/20' : 'border-t border-white/10'} />

        {/* ============================================================ */}
        {/* SECTION 3: CLIMBING GYM                                      */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div>
            <Link href="/gyms" className="group inline-block">
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight transition-colors ${
                isSandstone ? 'text-[#1a1815] group-hover:opacity-75' : 'text-chalk group-hover:text-cyan-climb'
              }`}>
                Climbing Gym
              </h2>
            </Link>
            <p className={`text-xs md:text-sm font-light mt-0.5 ${
              isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
            }`}>
              Climbing gym directory, modern facilities, and live session slots
            </p>
          </div>

          {/* Mobile: Horizontal scrollable cards / Desktop: 3-4 cols */}
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {gyms.map((gym, idx) => (
              <motion.div
                key={gym.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
                className="w-72 md:w-auto flex-shrink-0"
              >
                <div
                  className={`h-full rounded-2xl overflow-hidden transition-all flex flex-col justify-between group border shadow-sm hover:shadow-lg ${
                    isSandstone
                      ? 'bg-transparent border border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                      : 'bg-transparent border border-white/10 hover:border-cyan-climb/40 text-chalk'
                  }`}
                >
                  <div>
                    <div className="h-36 overflow-hidden relative">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-108"
                        style={{ backgroundImage: `url(${gym.image})` }}
                      />
                      <div className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/15 flex items-center gap-1 text-xs shadow-md">
                        <Star size={11} className="text-lime fill-lime" />
                        <span className="font-bold text-chalk">{gym.rating}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div>
                        <h3 className={`font-bold text-base transition-colors truncate ${
                          isSandstone ? 'text-[#1a1815] group-hover:underline' : 'text-chalk group-hover:text-cyan-climb'
                        }`}>
                          {gym.name}
                        </h3>
                        <div className={`flex items-center gap-1 text-xs font-light truncate ${
                          isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                        }`}>
                          <MapPin size={11} />
                          <span>{gym.city}</span>
                        </div>
                      </div>

                      <div className={`flex items-center justify-between text-xs pt-1 border-t ${
                        isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
                      }`}>
                        <span className={`font-light ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>Starts from</span>
                        <span className={`font-bold font-mono ${isSandstone ? 'text-[#1a1815]' : 'text-lime'}`}>
                          Rp {gym.pricePerSession.toLocaleString('en-US')}/session
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      href={`/gyms/${gym.id}`}
                      className={`w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors border ${
                        isSandstone
                          ? 'bg-transparent border-[#1a1815] text-[#1a1815] hover:bg-[#1a1815]/10'
                          : 'bg-transparent border-cyan-climb/60 hover:bg-cyan-climb/10 text-cyan-climb'
                      }`}
                    >
                      <span>Book Gym Pass</span>
                      <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* DIVIDER LINE */}
        <div className={isSandstone ? 'border-t border-[#1a1815]/20' : 'border-t border-white/10'} />

        {/* ============================================================ */}
        {/* SECTION 4: COMMUNITY                                         */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div>
            <Link href="/community" className="group inline-block">
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight transition-colors ${
                isSandstone ? 'text-[#1a1815] group-hover:opacity-75' : 'text-chalk group-hover:text-lime'
              }`}>
                Community
              </h2>
            </Link>
            <p className={`text-xs md:text-sm font-light mt-0.5 ${
              isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
            }`}>
              Local bouldering squads, session buddies, and climber networks
            </p>
          </div>

          {/* Mobile: Horizontal scrollable cards / Desktop: 3 cols */}
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {communities.map((comm, idx) => (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
                className="w-72 md:w-auto flex-shrink-0"
              >
                <div
                  className={`h-full rounded-2xl overflow-hidden transition-all flex flex-col justify-between group border shadow-sm hover:shadow-lg ${
                    isSandstone
                      ? 'bg-transparent border border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                      : 'bg-transparent border border-white/10 hover:border-lime/30 text-chalk'
                  }`}
                >
                  <div>
                    <div className="h-36 overflow-hidden relative">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-108"
                        style={{ backgroundImage: `url(${comm.image})` }}
                      />
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-bold text-base transition-colors ${
                            isSandstone ? 'text-[#1a1815] group-hover:text-black' : 'text-chalk group-hover:text-lime'
                          }`}>
                            {comm.name}
                          </h3>
                          <div className={`flex items-center gap-1 text-xs font-light ${
                            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                          }`}>
                            <MapPin size={11} />
                            <span>{comm.city}, {comm.province}</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                          isSandstone ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]' : 'bg-transparent border-white/10 text-chalk'
                        }`}>
                          <Users size={11} className={isSandstone ? 'text-[#1a1815]' : 'text-cyan-climb'} />
                          <span className="text-xs font-bold">{comm.memberCount}</span>
                        </div>
                      </div>

                      <p className={`text-xs font-light line-clamp-2 leading-relaxed ${
                        isSandstone ? 'text-[#1a1815]/75' : 'text-slate-ash'
                      }`}>
                        {comm.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedJoinCommunity(comm)}
                      className={`flex-1 h-9 bg-transparent border rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors touch-ripple ${
                        isSandstone
                          ? 'border-[#1a1815]/20 hover:border-[#1a1815]/60 text-[#1a1815]'
                          : 'border-white/10 hover:border-lime/40 text-chalk'
                      }`}
                    >
                      <UserPlus size={14} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} /> Request to Join
                    </button>
                    <a
                      href={comm.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 h-9 bg-transparent border rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors touch-ripple ${
                        isSandstone
                          ? 'border-[#1a1815]/20 hover:border-[#1a1815]/60 text-[#1a1815]'
                          : 'border-white/10 hover:border-white/30 text-chalk'
                      }`}
                    >
                      <Instagram size={14} className="text-[#E1306C]" /> Instagram
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>

      {/* Quick Log Modal */}
      {showLogModal && (
        <LogAscentModal
          problemName="Quick Send"
          grade="5.12 B"
          fontGrade="7b"
          setter="Curated Setter"
          location="Pabeasan 90 (A)"
          provinceCountry="Jawa Barat, ID"
          onClose={() => setShowLogModal(false)}
          onSubmit={data => {
            const saved = saveUserAscent({
              userId: 'user-1',
              problemId: 'quick-send',
              problemName: 'Quick Send',
              grade: data.gradeVote || '5.12 B',
              fontGrade: '7b',
              setter: 'Curated Setter',
              location: 'Pabeasan 90 (A)',
              provinceCountry: data.provinceCountry || 'Jawa Barat, ID',
              ascentType: data.type,
              gradeVote: data.gradeVote,
              note: data.note,
              photoUrl: data.photoUrl,
              videoUrl: data.videoUrl,
              markers: [],
              discipline: 'lead',
              climberName: data.climberName || 'Arief Lala Hakiem',
              attempts: data.attempts,
              duration: data.duration,
              belayer: data.belayer,
              photographer: data.photographer,
              wallAngle: data.wallAngle,
              wallHeight: data.wallHeight,
              boltsCount: data.boltsCount,
              time: data.time,
              date: data.date,
            })
            setShowLogModal(false)
            setActiveShareAscent(saved)
          }}
        />
      )}

      {/* Ascent Share Modal */}
      {activeShareAscent && (
        <AscentShareModal
          ascent={activeShareAscent}
          onClose={() => setActiveShareAscent(null)}
        />
      )}

      {/* Request To Join Modal */}
      <RequestToJoinModal
        isOpen={!!selectedJoinCommunity}
        community={selectedJoinCommunity}
        onClose={() => setSelectedJoinCommunity(null)}
        onSuccess={() => {}}
      />
    </div>
  )
}
