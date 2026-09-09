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
  MessageCircle,
  Instagram,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { Problem } from '@/lib/mock-data'
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
        {/* SECTION 1: COMMUNITY                                         */}
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
            {communities.map(comm => (
              <div
                key={comm.id}
                className={`w-72 md:w-auto flex-shrink-0 rounded-2xl overflow-hidden transition-all flex flex-col justify-between group ${
                  isSandstone
                    ? 'bg-transparent border border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                    : 'bg-transparent border border-white/10 hover:border-lime/30 text-chalk'
                }`}
              >
                <div>
                  <div
                    className="h-36 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${comm.image})` }}
                  />

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
                  <a
                    href={comm.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 h-9 bg-transparent border rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      isSandstone
                        ? 'border-[#1a1815]/20 hover:border-[#1a1815]/60 text-[#1a1815]'
                        : 'border-white/10 hover:border-white/30 text-chalk'
                    }`}
                  >
                    <MessageCircle size={14} className="text-[#25D366]" /> WhatsApp
                  </a>
                  <a
                    href={comm.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 h-9 bg-transparent border rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      isSandstone
                        ? 'border-[#1a1815]/20 hover:border-[#1a1815]/60 text-[#1a1815]'
                        : 'border-white/10 hover:border-white/30 text-chalk'
                    }`}
                  >
                    <Instagram size={14} className="text-[#E1306C]" /> Instagram
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DIVIDER LINE */}
        <div className={isSandstone ? 'border-t border-[#1a1815]/20' : 'border-t border-white/10'} />

        {/* ============================================================ */}
        {/* SECTION 2: BOULDER GYM                                       */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div>
            <Link href="/gyms" className="group inline-block">
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight transition-colors ${
                isSandstone ? 'text-[#1a1815] group-hover:opacity-75' : 'text-chalk group-hover:text-cyan-climb'
              }`}>
                Boulder Gyms
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
            {gyms.map(gym => (
              <div
                key={gym.id}
                className={`w-72 md:w-auto flex-shrink-0 rounded-2xl overflow-hidden transition-all flex flex-col justify-between group ${
                  isSandstone
                    ? 'bg-transparent border border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                    : 'bg-transparent border border-white/10 hover:border-cyan-climb/40 text-chalk'
                }`}
              >
                <div>
                  <div
                    className="h-36 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${gym.image})` }}
                  >
                    <div className="absolute top-2.5 right-2.5 bg-black/60 px-2 py-0.5 rounded-lg border border-white/15 flex items-center gap-1 text-xs">
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
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DIVIDER LINE */}
        <div className={isSandstone ? 'border-t border-[#1a1815]/20' : 'border-t border-white/10'} />

        {/* ============================================================ */}
        {/* SECTION 3: CRAGS                                             */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div>
            <Link href="/beta" className="group inline-block">
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
            {cragRegions.map(crag => (
              <Link
                key={crag.id}
                href={`/beta?region=${crag.id}`}
                className={`w-72 md:w-auto flex-shrink-0 rounded-2xl overflow-hidden transition-all flex flex-col justify-between group border ${
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
            ))}
          </div>
        </section>

        {/* DIVIDER LINE */}
        <div className={isSandstone ? 'border-t border-[#1a1815]/20' : 'border-t border-white/10'} />

        {/* ============================================================ */}
        {/* SECTION 4: PROBLEMS                                          */}
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

          {/* Mobile: Horizontal scrollable cards / Desktop: 3-4 cols */}
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {featuredProblems.slice(0, 6).map(problem => {
              const gradeColor = gradeColors[problem.grade] || '#CCFF00'

              return (
                <Link
                  key={problem.id}
                  href={`/beta?region=${problem.regionId}&sector=${problem.sectorId}&problem=${problem.id}`}
                  className={`w-72 md:w-auto flex-shrink-0 rounded-2xl p-4 transition-all flex flex-col justify-between group ${
                    isSandstone
                      ? 'bg-transparent border border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                      : 'bg-transparent border border-white/10 hover:border-lime/30 text-chalk'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top: Boulder Badge & Grade */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${
                        isSandstone ? 'bg-transparent text-[#1a1815] border-[#1a1815]/30' : 'bg-transparent text-cyan-climb border-cyan-climb/40'
                      }`}>
                        <Compass size={10} /> BOULDER · {problem.startType || 'Sit Start'}
                      </span>

                      <div
                        className="px-2 py-0.5 rounded-md font-bold font-mono text-xs border"
                        style={{ borderColor: gradeColor, color: gradeColor, backgroundColor: 'transparent' }}
                      >
                        {problem.grade}
                      </div>
                    </div>

                    <div>
                      <h3 className={`font-bold text-base leading-tight transition-colors ${
                        isSandstone ? 'text-[#1a1815] group-hover:underline' : 'text-chalk group-hover:text-lime'
                      }`}>
                        {problem.name}
                      </h3>
                      <p className={`text-xs font-light mt-0.5 truncate ${
                        isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                      }`}>
                        {problem.cragName} · {problem.sectorName.split('—')[0]}
                      </p>
                    </div>

                    <p className={`text-xs font-light line-clamp-2 leading-relaxed ${
                      isSandstone ? 'text-[#1a1815]/75' : 'text-slate-ash'
                    }`}>
                      {problem.description}
                    </p>
                  </div>

                  <div className={`pt-3 border-t mt-3 flex items-center justify-between text-xs ${
                    isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
                  }`}>
                    <span className={`font-light text-[11px] ${
                      isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                    }`}>
                      {problem.ascentCount} logged sends
                    </span>
                    <span className={`font-bold flex items-center gap-0.5 ${
                      isSandstone ? 'text-[#1a1815]' : 'text-lime'
                    }`}>
                      View Topo <ChevronRight size={13} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

      </div>

      {/* Quick Log Modal */}
      {showLogModal && (
        <LogAscentModal
          problemName="Quick Send"
          grade="V4"
          fontGrade="6B"
          setter="Curated Setter"
          location="Indonesian Bouldering"
          onClose={() => setShowLogModal(false)}
          onSubmit={data => {
            const saved = saveUserAscent({
              userId: 'user-1',
              problemId: 'quick-send',
              problemName: 'Quick Send',
              grade: data.gradeVote || 'V4',
              fontGrade: '6B',
              setter: 'Curated Setter',
              location: 'Indonesian Bouldering',
              ascentType: data.type,
              gradeVote: data.gradeVote,
              note: data.note,
              photoUrl: data.photoUrl,
              markers: [],
              discipline: 'bouldering',
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
    </div>
  )
}
