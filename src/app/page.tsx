'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import HeroBanner from '@/components/home/HeroBanner'
import LogAscentModal from '@/components/beta/LogAscentModal'
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
  const { isSandstone, toggleTheme } = useTheme()
  const [showLogModal, setShowLogModal] = useState(false)
  const { gyms } = useGyms()
  const { cragRegions } = useCragRegions()
  const { communities } = useCommunities()

  const handleFABPress = () => {
    if (!canLogAscent(role)) {
      openAuthModal('Silakan masuk atau daftar akun untuk mencatat Log Ascent pemanjatan Anda.')
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
      isSandstone ? 'bg-[#d2c5ae] text-[#1a1815]' : 'bg-[#12161A] text-chalk'
    }`}>
      {/* 1. TOP HERO BANNER (Clean, Polos Judul ClimbingHub Indonesia di atas foto tebing) */}
      <HeroBanner />

      {/* QUICK THEME TOGGLE BANNER */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-4">
        <div className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
          isSandstone
            ? 'bg-white/40 border-[#1a1815]/15 text-[#1a1815]'
            : 'bg-crag/80 border-white/5 text-chalk'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isSandstone ? 'bg-[#d95338]' : 'bg-lime'}`} />
            <span className={`text-xs font-medium tracking-wide ${isSandstone ? 'text-[#1a1815]/80' : 'text-slate-ash'}`}>
              {isSandstone ? 'Mode Topo Guidebook (Sandstone) Aktif' : 'Mode Dark Granite Aktif'}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all touch-ripple border ${
              isSandstone
                ? 'bg-transparent border-[#1a1815]/30 text-[#1a1815] hover:border-[#1a1815]'
                : 'bg-transparent border-lime/40 text-lime hover:border-lime'
            }`}
          >
            <span>{isSandstone ? 'Ganti ke 🌑 Dark' : 'Ganti ke 📜 Sandstone'}</span>
          </button>
        </div>
      </div>

      {/* MAIN VERTICAL FEED ACCORDING TO USER SKETCH */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-10 md:space-y-14 pt-6 md:pt-8">

        {/* ============================================================ */}
        {/* SECTION 1: COMMUNITY (Sesuai Sketsa: "Community" + Cards)    */}
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
              Squad bouldering lokal, teman mabar, dan koneksi komunitas
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
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-2.5 right-2.5 flex gap-1">
                      {comm.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] bg-black/60 backdrop-blur-sm border border-white/20 px-2 py-0.5 rounded-md text-chalk uppercase font-light">
                          {tag}
                        </span>
                      ))}
                    </div>
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

                    <div className={`text-[11px] p-2 rounded-xl border font-light truncate ${
                      isSandstone ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]' : 'bg-transparent border-white/10 text-slate-ash'
                    }`}>
                      🏟️ <span className="font-normal">{comm.homebase}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex gap-2">
                  <a
                    href={comm.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-9 bg-transparent border border-[#25D366] rounded-xl text-[#16a34a] dark:text-[#25D366] text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#25D366]/10 transition-colors"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                  <a
                    href={comm.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-9 bg-transparent border border-[#E1306C] rounded-xl text-[#E1306C] text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#E1306C]/10 transition-colors"
                  >
                    <Instagram size={14} /> Instagram
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PEMBATAS GARIS (Sesuai Garis Horizontal Sketsa) */}
        <div className={isSandstone ? 'border-t border-[#1a1815]/20' : 'border-t border-white/10'} />

        {/* ============================================================ */}
        {/* SECTION 2: BOULDER GYM (Sesuai Sketsa: "Boulder Gym" + Cards)*/}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div>
            <Link href="/gyms" className="group inline-block">
              <h2 className={`text-2xl md:text-3xl font-bold tracking-tight transition-colors ${
                isSandstone ? 'text-[#1a1815] group-hover:opacity-75' : 'text-chalk group-hover:text-cyan-climb'
              }`}>
                Boulder Gym
              </h2>
            </Link>
            <p className={`text-xs md:text-sm font-light mt-0.5 ${
              isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
            }`}>
              Direktori climbing gym, fasilitas modern, dan live kuota sesi
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/15 flex items-center gap-1 text-xs">
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
                      <span className={`font-light ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>Mulai dari</span>
                      <span className={`font-bold font-mono ${isSandstone ? 'text-[#1a1815]' : 'text-lime'}`}>
                        Rp {gym.pricePerSession.toLocaleString('id-ID')}/sesi
                      </span>
                    </div>

                    {/* Live Slot Bar */}
                    <div className={`p-2 rounded-xl border text-[11px] flex justify-between items-center font-light ${
                      isSandstone ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]' : 'bg-transparent border-white/10 text-slate-ash'
                    }`}>
                      <span>Sore Kuota:</span>
                      <span className={`font-bold font-mono ${isSandstone ? 'text-[#1a1815]' : 'text-cyan-climb'}`}>
                        {gym.slots.evening} / {gym.maxSlots.evening} Slot Tersisa
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
                    <span>Pesan Sesi Gym</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PEMBATAS GARIS (Sesuai Garis Horizontal Sketsa) */}
        <div className={isSandstone ? 'border-t border-[#1a1815]/20' : 'border-t border-white/10'} />

        {/* ============================================================ */}
        {/* SECTION 3: CRAGS (Sesuai Sketsa: "Crags" + Cards)            */}
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
              Destinasi tebing alam, formasi karst, dan akses pemanjatan outdoor
            </p>
          </div>

          {/* Mobile: Horizontal scrollable cards / Desktop: 3 cols */}
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {cragRegions.map(crag => (
              <Link
                key={crag.id}
                href={`/beta?region=${crag.id}`}
                className="w-72 md:w-auto flex-shrink-0 group block"
              >
                <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden border border-white/10 group-hover:border-project/40 transition-all shadow-xl">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${crag.image})` }}
                  />
                  <div className="absolute inset-0 bg-black/40" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-[10px] font-light">
                    <span className="glass bg-black/60 px-2.5 py-1 rounded-md text-white border border-white/10 uppercase">
                      {crag.province}
                    </span>
                    <span className="glass bg-black/60 px-2.5 py-1 rounded-md text-lime border border-lime/30 font-bold uppercase">
                      {crag.sectorCount} Sektor
                    </span>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-3 left-3 right-3 p-3.5 glass bg-black/60 backdrop-blur-md rounded-xl border border-white/15">
                    <h3 className="text-chalk font-bold text-lg group-hover:text-lime transition-colors leading-tight">
                      {crag.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-white/80 font-light">
                        {crag.problemCount} Jalur Terverifikasi
                      </span>
                      <span className="text-lime font-bold flex items-center gap-0.5">
                        Buka Topo <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PEMBATAS GARIS (Sesuai Garis Horizontal Sketsa) */}
        <div className={isSandstone ? 'border-t border-[#1a1815]/20' : 'border-t border-white/10'} />

        {/* ============================================================ */}
        {/* SECTION 4: PROBLEMS (Sesuai Sketsa: "Problems" + Cards)      */}
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
              Katalog jalur boulder & topo tebing Indonesia
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
                      {problem.ascentCount} climber send
                    </span>
                    <span className={`font-bold flex items-center gap-0.5 ${
                      isSandstone ? 'text-[#1a1815]' : 'text-lime'
                    }`}>
                      Lihat Topo <ChevronRight size={13} />
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
          problemName="Quick Log"
          grade="V4"
          fontGrade="6B"
          onClose={() => setShowLogModal(false)}
          onSubmit={data => {
            console.log('Logged:', data)
            setShowLogModal(false)
          }}
        />
      )}
    </div>
  )
}
