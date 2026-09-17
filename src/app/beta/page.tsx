'use client'

import { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Mountain, ThumbsUp, Video, ShieldAlert, Sparkles, Layers, Compass, Plus, ShieldCheck, Info, MapPin, Award, Trash2, Share2, Search } from 'lucide-react'
import { Problem, CragRegion, RouteDiscipline } from '@/lib/mock-data'
import { useCragRegions, insertRoute, insertCragRegion, insertSector } from '@/lib/use-data'
import { gradeColors } from '@/lib/tokens'
import TopoCanvas from '@/components/beta/TopoCanvas'
import ProblemSheet from '@/components/beta/ProblemSheet'
import LogAscentModal from '@/components/beta/LogAscentModal'
import AscentShareModal from '@/components/beta/AscentShareModal'
import AddRouteModal, { NewRegionData, NewSectorData } from '@/components/beta/AddRouteModal'
import RoadmapContributeModal from '@/components/beta/RoadmapContributeModal'
import { useAuth } from '@/lib/auth-context'
import { canLogAscent, canCreateCragRoute } from '@/lib/permissions'
import { useTheme } from '@/lib/theme-context'
import { UserAscent, getUserAscents, saveUserAscent, deleteUserAscent } from '@/lib/user-ascents'
import Pictogram from '@/components/common/Pictogram'

type ViewLevel = 'regions' | 'sectors' | 'problems' | 'topo'

function BetaPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { role, user, openAuthModal } = useAuth()
  const { cragRegions, loading: cragsLoading } = useCragRegions()
  const { isSandstone, toggleTheme } = useTheme()
  const [regions, setRegions] = useState<CragRegion[]>([])
  const [level, setLevel] = useState<ViewLevel>('regions')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDiscipline, setSelectedDiscipline] = useState<'all' | 'bouldering' | 'sport' | 'multipitch'>('all')

  const [showSheet, setShowSheet] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [activeShareAscent, setActiveShareAscent] = useState<UserAscent | null>(null)
  const [userAscents, setUserAscents] = useState<UserAscent[]>([])
  const [showMyAscentsView, setShowMyAscentsView] = useState(false)
  const [showAddRouteModal, setShowAddRouteModal] = useState(false)
  const [showRoadmapModal, setShowRoadmapModal] = useState(false)
  const [desktopTab, setDesktopTab] = useState<'overview' | 'beta' | 'specs' | 'access'>('overview')

  useEffect(() => {
    if (cragRegions && cragRegions.length > 0) {
      setRegions(cragRegions)
    }
  }, [cragRegions])

  useEffect(() => {
    setUserAscents(getUserAscents(user?.id))
  }, [user])

  // Listen to open-personal-beta-book event from TopBar account logo
  useEffect(() => {
    const handleOpenBetaBook = () => {
      setShowMyAscentsView(true)
      setLevel('regions')
      setShowSheet(false)
    }
    window.addEventListener('open-personal-beta-book', handleOpenBetaBook)
    return () => window.removeEventListener('open-personal-beta-book', handleOpenBetaBook)
  }, [])

  // Handle URL deep linking (e.g. /beta?region=...&sector=...&problem=...)
  useEffect(() => {
    if (!regions || regions.length === 0) return

    const problemParam = searchParams.get('problem') || searchParams.get('id')
    const sectorParam = searchParams.get('sector')
    const regionParam = searchParams.get('region') || searchParams.get('crag')

    if (problemParam) {
      const pParam = problemParam.toLowerCase()
      for (const reg of regions) {
        for (const sec of reg.sectors) {
          const match = sec.problems.find(p => p.id.toLowerCase() === pParam || p.name.toLowerCase() === pParam)
          if (match) {
            setSelectedRegion(reg.id)
            setSelectedSector(sec.id)
            setSelectedProblem(match.id)
            setLevel('topo')
            setShowSheet(true)
            return
          }
        }
      }
    } else if (sectorParam) {
      const sParam = sectorParam.toLowerCase()
      for (const reg of regions) {
        const secMatch = reg.sectors.find(s => s.id.toLowerCase() === sParam || s.name.toLowerCase() === sParam)
        if (secMatch) {
          setSelectedRegion(reg.id)
          setSelectedSector(secMatch.id)
          setLevel('problems')
          return
        }
      }
    } else if (regionParam) {
      const rParam = regionParam.toLowerCase()
      const regMatch = regions.find(r => r.id.toLowerCase() === rParam || r.name.toLowerCase() === rParam || r.id.toLowerCase().includes(rParam) || rParam.includes(r.id.toLowerCase()))
      if (regMatch) {
        setSelectedRegion(regMatch.id)
        setLevel('sectors')
      }
    }

    const viewParam = searchParams.get('view')
    if (viewParam === 'my-ascents' || viewParam === 'betabook') {
      setShowMyAscentsView(true)
      setLevel('regions')
      setShowSheet(false)
    } else if (viewParam === 'crags' || viewParam === 'boulders') {
      setShowMyAscentsView(false)
    }

    const actionParam = searchParams.get('action')
    if (actionParam === 'submit' || actionParam === 'add-route') {
      if (canCreateCragRoute(role)) {
        setShowAddRouteModal(true)
      } else if (role === 'registered') {
        setShowRoadmapModal(true)
      } else {
        openAuthModal('Please sign in or create an account to access route curation features.')
      }
    } else if (actionParam === 'log') {
      if (!selectedProblem) {
        const firstReg = regions[0]
        const firstSec = firstReg?.sectors[0]
        const firstProb = firstSec?.problems[0]
        if (firstProb) {
          setSelectedRegion(firstReg.id)
          setSelectedSector(firstSec.id)
          setSelectedProblem(firstProb.id)
          setLevel('topo')
          setShowSheet(true)
        }
      }
      if (!canLogAscent(role)) {
        openAuthModal('Please sign in or create an account to log your climbing ascents.')
      } else {
        setShowLogModal(true)
      }
    }
  }, [searchParams, regions, role])

  const triggerLogAscent = () => {
    if (!canLogAscent(role)) {
      openAuthModal('Please sign in or create an account to log your climbing ascents.')
    } else {
      setShowLogModal(true)
    }
  }

  const handleAddRouteClick = () => {
    if (canCreateCragRoute(role)) {
      setShowAddRouteModal(true)
    } else if (role === 'registered') {
      setShowRoadmapModal(true)
    } else {
      openAuthModal('Please sign in or create an account to access route curation features.')
    }
  }

  const handleAddRoute = async (
    newRoute: Problem,
    regionId: string,
    sectorId: string,
    newRegionData?: NewRegionData,
    newSectorData?: NewSectorData
  ) => {
    // 1. Optimistic update
    setRegions(prev => {
      if (newRegionData) {
        const newReg: CragRegion = {
          id: newRegionData.id,
          name: newRegionData.name,
          province: newRegionData.province,
          image: newRegionData.image || newRoute.imageUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
          sectorCount: 1,
          problemCount: 1,
          sectors: [
            {
              id: sectorId,
              name: newSectorData?.name || 'Sector 1',
              image: newSectorData?.image || newRoute.imageUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
              problems: [newRoute],
            },
          ],
        }
        return [newReg, ...prev]
      }

      if (newSectorData) {
        return prev.map(r => {
          if (r.id !== regionId) return r
          const newSec = {
            id: sectorId,
            name: newSectorData.name,
            image: newSectorData.image || newRoute.imageUrl || r.image,
            problems: [newRoute],
          }
          return {
            ...r,
            sectorCount: r.sectorCount + 1,
            problemCount: r.problemCount + 1,
            sectors: [newSec, ...r.sectors],
          }
        })
      }

      return prev.map(r => {
        if (r.id !== regionId) return r
        return {
          ...r,
          problemCount: r.problemCount + 1,
          sectors: r.sectors.map(s => {
            if (s.id !== sectorId) return s
            return {
              ...s,
              problems: [newRoute, ...s.problems],
            }
          }),
        }
      })
    })

    setSelectedRegion(regionId)
    setSelectedSector(sectorId)
    setSelectedProblem(newRoute.id)
    setLevel('topo')
    setShowSheet(true)

    // 2. Persist to Supabase in background
    try {
      if (newRegionData) {
        await insertCragRegion({
          id: newRegionData.id,
          name: newRegionData.name,
          province: newRegionData.province,
          image: newRegionData.image || newRoute.imageUrl,
        })
      }

      if (newSectorData || newRegionData) {
        await insertSector({
          id: sectorId,
          cragId: regionId,
          name: newSectorData?.name || 'Sector 1',
          image: newSectorData?.image || newRoute.imageUrl,
        })
      }

      await insertRoute({
        sectorId,
        name: newRoute.name,
        discipline: newRoute.discipline || 'bouldering',
        grade: newRoute.grade,
        fontGrade: newRoute.fontGrade,
        setter: newRoute.setter,
        fa: newRoute.fa,
        faDate: newRoute.faDate,
        description: newRoute.description,
        imageUrl: newRoute.imageUrl,
        accessInfo: newRoute.accessInfo,
        localContact: newRoute.localContact,
        markers: newRoute.markers,
        pitchLength: newRoute.pitchLength,
        boltCount: newRoute.boltCount,
        anchorType: newRoute.anchorType,
        totalPitches: newRoute.totalPitches,
        totalHeight: newRoute.totalHeight,
        pitchBreakdown: newRoute.pitchBreakdown,
        descentInfo: newRoute.descentInfo,
        padRecommendation: newRoute.padRecommendation,
        landingQuality: newRoute.landingQuality,
        startType: newRoute.startType,
      })
    } catch (err) {
      console.error('Failed to persist route to database:', err)
    }
  }

  const region = regions.find(r => r.id === selectedRegion)
  const sector = region?.sectors.find(s => s.id === selectedSector)
  const problem = sector?.problems.find(p => p.id === selectedProblem)

  const goBack = () => {
    if (level === 'topo') {
      setLevel('regions')
      setShowSheet(false)
      setSelectedProblem(null)
    } else if (level === 'problems') {
      setLevel('regions')
      setSelectedSector(null)
    } else if (level === 'sectors') {
      setLevel('regions')
      setSelectedRegion(null)
    }
  }

  const breadcrumb = [
    'Problems',
    region?.name,
    sector?.name.split('—')[0].trim(),
    problem?.name,
  ].filter(Boolean).join(' › ')

  // Flat list of all problems across all crags & sectors
  const allProblems = useMemo(() => {
    const list: { problem: Problem; region: CragRegion; sector: { id: string; name: string } }[] = []
    for (const r of regions) {
      for (const s of r.sectors) {
        for (const p of s.problems) {
          list.push({ problem: p, region: r, sector: s })
        }
      }
    }
    return list
  }, [regions])

  const filteredProblemsList = useMemo(() => {
    return allProblems.filter(({ problem: p, region: r, sector: s }) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        p.grade.toLowerCase().includes(q) ||
        (p.fontGrade && p.fontGrade.toLowerCase().includes(q)) ||
        r.name.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)

      const disc = p.discipline || 'bouldering'
      const matchDiscipline =
        selectedDiscipline === 'all' ||
        disc === selectedDiscipline ||
        (selectedDiscipline === 'bouldering' && (p.category === 'boulder' || !p.category)) ||
        (selectedDiscipline === 'sport' && p.category === 'lead') ||
        (selectedDiscipline === 'multipitch' && p.category === 'trad')

      return matchSearch && matchDiscipline
    })
  }, [allProblems, searchQuery, selectedDiscipline])

  const filteredProblems = sector ? sector.problems : []

  return (
    <div
      className={`min-h-[90vh] transition-colors duration-300 ${
        isSandstone
          ? 'bg-[#d2c5ae] text-[#1a1815]'
          : 'bg-[#23262C] text-chalk'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-2 md:py-4">
        {/* TOP LEVEL NAVIGATION & CONTROLS */}
        {level === 'regions' ? (
          <div className="space-y-4 mb-4">
            {showMyAscentsView ? (
              /* Sent Cards Header */
              <div className="flex items-center justify-between pt-1 border-b border-black/10 dark:border-white/10 pb-3">
                <div>
                  <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${
                    isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                  }`}>
                    Sent Cards
                  </h1>
                  <p className={`text-xs mt-0.5 ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>
                    {userAscents.length} Logged {userAscents.length === 1 ? 'Send' : 'Sends'}
                  </p>
                </div>
                <button
                  onClick={() => setShowMyAscentsView(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSandstone
                      ? 'border-[#1a1815]/20 hover:bg-[#1a1815]/10 text-[#1a1815]'
                      : 'border-white/10 hover:bg-white/10 text-chalk'
                  }`}
                >
                  Lihat Semua Jalur
                </button>
              </div>
            ) : (
              /* Headline Row: Clean "Problems" (large) & CTA to Set New Route */
              <div className="flex items-center justify-between gap-2 pt-1">
                <div>
                  <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${
                    isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                  }`}>
                    Problems
                  </h1>
                  <p className={`text-xs md:text-sm font-light mt-1 ${
                    isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                  }`}>
                    {allProblems.length} Jalur pemanjatan terverifikasi di seluruh Indonesia
                  </p>
                </div>

                {/* Action button: Set New Route */}
                <button
                  onClick={handleAddRouteClick}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-lime text-granite text-xs font-bold shadow-lime-glow-sm hover:bg-lime-dim transition-all flex-shrink-0"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">Set New Route</span>
                  <span className="sm:hidden">New Route</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Breadcrumb Header when in Sectors, Problems, or Topo */
          <div className="flex items-center justify-between gap-3 py-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={goBack}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isSandstone
                    ? 'bg-[#1a1815]/10 hover:bg-[#1a1815]/20 text-[#1a1815]'
                    : 'bg-crag hover:bg-crag-light text-chalk border border-white/5'
                }`}
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <span className={`text-xs md:text-sm font-light ${
                  isSandstone ? 'text-[#1a1815]/80' : 'text-slate-ash'
                }`}>
                  {breadcrumb}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isSandstone ? 'bg-[#1a1815]/10 text-[#1a1815]' : 'bg-crag text-chalk border border-white/10'
                }`}
              >
                {isSandstone ? '📜 Sandstone' : '🌑 Granite'}
              </button>

              {level === 'topo' && (
                <button
                  onClick={triggerLogAscent}
                  className="flex items-center gap-1.5 bg-lime text-granite px-3 py-1.5 rounded-xl text-xs font-bold shadow-lime-glow-sm hover:bg-lime-dim transition-colors"
                >
                  Log Ascent
                </button>
              )}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* LEVEL 1: REGIONS */}
          {level === 'regions' && (
            <motion.div
              key="regions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* PERSONAL BETA BOOK (MY ASCENTS) */}
              {showMyAscentsView && (
                <div className="space-y-4 my-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`font-bold text-xl ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
                        My Logged Ascents
                      </h2>
                      <p className={`text-xs font-light ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>
                        Daftar rute bouldering yang telah Anda taklukkan beserta kartu grafis Strava-style
                      </p>
                    </div>
                  </div>

                  {userAscents.length === 0 ? (
                    <div className={`rounded-2xl p-10 text-center border space-y-3 ${
                      isSandstone ? 'border-[#1a1815]/20 bg-white/20' : 'border-white/10 bg-crag'
                    }`}>
                      <Award size={40} className={`mx-auto ${isSandstone ? 'text-[#1a1815]/40' : 'text-slate-ash'}`} />
                      <h3 className={`font-bold text-base ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
                        Belum Ada Ascent yang Dicatat
                      </h3>
                      <p className={`text-xs max-w-md mx-auto font-light leading-relaxed ${
                        isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                      }`}>
                        Kunjungi rute bouldering di crag mana saja, lalu klik tombol <b>Log Ascent</b> untuk menyimpan riwayat pendakian dan langsung mendapatkan kartu hadiah otomatis!
                      </p>
                      <button
                        onClick={() => setShowMyAscentsView(false)}
                        className="px-4 py-2 bg-lime text-granite text-xs font-bold rounded-xl shadow-lime-glow-sm"
                      >
                        Jelajahi Jalur Crag
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userAscents.map(ascent => (
                        <div
                          key={ascent.id}
                          className={`rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
                            isSandstone
                              ? 'border-[#1a1815]/20 bg-white/30 text-[#1a1815]'
                              : 'border-white/10 bg-crag text-chalk'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="h-44 relative bg-black/40 overflow-hidden">
                            {ascent.photoUrl ? (
                              <img
                                src={ascent.photoUrl}
                                alt={ascent.problemName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-ash">
                                <Mountain size={32} />
                              </div>
                            )}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-lime backdrop-blur-sm border border-lime/30">
                                {ascent.ascentType.toUpperCase()}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-white backdrop-blur-sm border border-white/20">
                                {ascent.grade}
                              </span>
                              {ascent.videoUrl && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-amber-300 backdrop-blur-sm border border-amber-300/40 flex items-center gap-1">
                                  <Video size={10} /> VIDEO
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-3.5 space-y-1.5 flex-1">
                            <h3 className="font-bold text-base">{ascent.problemName}</h3>
                            <div className={`flex items-center gap-1 text-xs ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>
                              <MapPin size={12} />
                              <span className="truncate">{ascent.location}</span>
                            </div>
                            <div className={`text-[11px] font-light flex items-center justify-between pt-1 ${
                              isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                            }`}>
                              <span>Setter: {ascent.setter || 'Curated'}</span>
                              <span>{ascent.date}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className={`p-3 pt-2 border-t flex items-center justify-between gap-2 ${
                            isSandstone ? 'border-[#1a1815]/10' : 'border-white/5'
                          }`}>
                            <button
                              onClick={() => setActiveShareAscent(ascent)}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-lime hover:bg-lime-dim text-granite text-xs font-bold flex items-center justify-center gap-1.5 shadow-lime-glow-sm transition-all"
                            >
                              <Share2 size={13} />
                              <span>Download / Share Card</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus catatan ascent rute "${ascent.problemName}"?`)) {
                                  deleteUserAscent(ascent.id)
                                  setUserAscents(prev => prev.filter(a => a.id !== ascent.id))
                                }
                              }}
                              className={`p-2 rounded-xl border transition-colors ${
                                isSandstone
                                  ? 'border-[#1a1815]/20 hover:bg-red-500/10 text-red-600'
                                  : 'border-white/10 hover:bg-red-500/10 text-red-400'
                              }`}
                              title="Hapus Ascent"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DIRECT PROBLEMS LIST (Nama Jalur & Grade) */}
              {!showMyAscentsView && (
                <div className="space-y-4 my-2">
                  {/* Search and Category Filter Bar */}
                  <div className="space-y-3">
                    {/* Search */}
                    <div className="relative">
                      <Search
                        size={16}
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                          isSandstone ? 'text-[#1a1815]/40' : 'text-slate-ash'
                        }`}
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari nama jalur, grade (V4, 7a...), tebing, atau sektor..."
                        className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs md:text-sm border outline-none transition-all ${
                          isSandstone
                            ? 'bg-white/80 border-[#1a1815]/20 text-[#1a1815] placeholder:text-[#1a1815]/40 focus:border-[#1a1815]'
                            : 'bg-crag border-white/10 text-chalk placeholder:text-white/40 focus:border-lime/50'
                        }`}
                      />
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      {[
                        { id: 'all', label: 'Semua Jalur' },
                        { id: 'bouldering', label: 'Boulder' },
                        { id: 'sport', label: 'Lead' },
                        { id: 'multipitch', label: 'Trad / Multipitch' },
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedDiscipline(cat.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                            selectedDiscipline === cat.id
                              ? isSandstone
                                ? 'bg-[#1a1815] text-white border-[#1a1815] font-bold'
                                : 'bg-lime text-granite border-lime font-bold'
                              : isSandstone
                              ? 'bg-white/60 border-[#1a1815]/15 text-[#1a1815]/70 hover:text-[#1a1815]'
                              : 'bg-crag border-white/10 text-slate-ash hover:text-chalk'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clean List of Nama Jalur & Grade */}
                  <div
                    className={`divide-y transition-colors ${
                      isSandstone
                        ? 'divide-[#1a1815]/15 border-t border-b border-[#1a1815]/15'
                        : 'divide-white/10 border-t border-b border-white/10'
                    }`}
                  >
                    {filteredProblemsList.length === 0 ? (
                      <div className="py-16 text-center space-y-2">
                        <Mountain
                          size={36}
                          className={`mx-auto opacity-40 ${
                            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                          }`}
                        />
                        <p className="text-sm font-medium">Tidak ada jalur pemanjatan ditemukan</p>
                        <p className="text-xs opacity-60">
                          Coba ubah kata kunci pencarian atau kategori filter.
                        </p>
                      </div>
                    ) : (
                      filteredProblemsList.map(({ problem: p, region: r, sector: s }) => {
                        const gradeColor = gradeColors[p.grade] || '#CCFF00'

                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedRegion(r.id)
                              setSelectedSector(s.id)
                              setSelectedProblem(p.id)
                              setLevel('topo')
                              setShowSheet(true)
                            }}
                            className={`w-full text-left py-3.5 md:py-4 px-2.5 rounded-xl transition-all flex items-center justify-between gap-3 group ${
                              isSandstone ? 'hover:bg-black/5' : 'hover:bg-white/5'
                            }`}
                          >
                            {/* Left: Nama Jalur & Details */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-base md:text-lg font-bold tracking-tight transition-colors ${
                                    isSandstone
                                      ? 'text-[#1a1815] group-hover:underline'
                                      : 'text-chalk group-hover:text-lime'
                                  }`}
                                >
                                  {p.name}
                                </span>

                                <span
                                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                                    p.category === 'lead' || p.discipline === 'sport'
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                      : p.category === 'trad' || p.discipline === 'multipitch'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                  }`}
                                >
                                  {p.category ||
                                    (p.discipline === 'sport'
                                      ? 'lead'
                                      : p.discipline === 'multipitch'
                                      ? 'trad'
                                      : 'boulder')}
                                </span>
                              </div>

                              <div
                                className={`flex items-center gap-2 text-xs font-light truncate ${
                                  isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                                }`}
                              >
                                <span>
                                  {r.name} · {s.name.split('—')[0].trim()}
                                </span>
                                <span>•</span>
                                <span>
                                  Setter: {p.setterYear || p.setter || p.fa || 'Curated'}
                                </span>
                              </div>
                            </div>

                            {/* Right: Grade Badge & Chevron */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div
                                className="px-3 py-1.5 rounded-xl font-bold font-mono text-xs md:text-sm border flex items-center gap-1.5 shadow-sm"
                                style={{
                                  borderColor: `${gradeColor}50`,
                                  backgroundColor: `${gradeColor}15`,
                                  color: gradeColor,
                                }}
                              >
                                <span>{p.grade}</span>
                                {p.fontGrade && (
                                  <span className="opacity-70 text-[10px] font-normal">
                                    / {p.fontGrade}
                                  </span>
                                )}
                              </div>
                              <ChevronRight
                                size={18}
                                className={`transition-transform group-hover:translate-x-0.5 ${
                                  isSandstone
                                    ? 'text-[#1a1815]/40 group-hover:text-[#1a1815]'
                                    : 'text-white/40 group-hover:text-lime'
                                }`}
                              />
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        {/* Level 2: Sector Grid */}
        {level === 'sectors' && region && (
          <motion.div
            key="sectors"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="px-4 md:px-0 space-y-4"
          >
            <div>
              <h2 className={`font-bold text-xl md:text-2xl ${
                isSandstone ? 'text-[#1a1815]' : 'text-chalk'
              }`}>
                {region.name}
              </h2>
              <p className={`text-xs font-light ${
                isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
              }`}>
                Select a crag sector to view verified problems
              </p>
            </div>

            {region.sectors.length === 0 ? (
              <div className={`rounded-2xl p-12 text-center border space-y-3 ${
                isSandstone ? 'bg-transparent border-[#1a1815]/20' : 'bg-crag border-white/5'
              }`}>
                <Mountain size={36} className={isSandstone ? 'text-[#1a1815]/40 mx-auto' : 'text-slate-ash mx-auto'} />
                <p className={`text-sm font-light ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>
                  Sectors for this crag are currently being mapped.
                </p>
                {canCreateCragRoute(role) && (
                  <button
                    onClick={() => setShowAddRouteModal(true)}
                    className="px-4 py-2 bg-lime text-granite text-xs font-bold rounded-xl shadow-lime-glow-sm"
                  >
                    + Add First Problem
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {region.sectors.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => { setSelectedSector(s.id); setLevel('problems') }}
                    className={`w-full text-left rounded-2xl overflow-hidden touch-ripple transition-all group border ${
                      isSandstone
                        ? 'bg-transparent border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                        : 'bg-crag border-white/5 hover:border-lime/30 text-chalk'
                    }`}
                  >
                    <div
                      className="h-44 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${s.image})` }}
                    />
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className={`font-bold text-base transition-colors ${
                          isSandstone ? 'text-[#1a1815] group-hover:underline' : 'text-chalk group-hover:text-lime'
                        }`}>
                          {s.name}
                        </h3>
                        <p className={`text-xs font-light ${
                          isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                        }`}>
                          {s.problems.length} Mapped Problems
                        </p>
                      </div>
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                        isSandstone
                          ? 'border-[#1a1815]/20 text-[#1a1815] group-hover:bg-[#1a1815] group-hover:text-[#d2c5ae]'
                          : 'bg-granite border-white/5 text-slate-ash group-hover:bg-lime group-hover:text-granite'
                      }`}>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Level 3: Problem / Route List */}
        {level === 'problems' && sector && (
          <motion.div
            key="problems"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="px-4 md:px-0 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`font-bold text-xl md:text-2xl ${
                  isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                }`}>
                  {sector.name}
                </h2>
                <p className={`text-xs font-light ${
                  isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                }`}>
                  Showing {filteredProblems.length} verified problems
                </p>
              </div>

              {canCreateCragRoute(role) && (
                <button
                  onClick={() => setShowAddRouteModal(true)}
                  className="px-3 py-1.5 bg-lime text-granite rounded-xl text-xs font-bold shadow-lime-glow-sm flex items-center gap-1"
                >
                  <Plus size={14} /> Add to This Sector
                </button>
              )}
            </div>

            {filteredProblems.length === 0 ? (
              <div className={`rounded-2xl p-10 text-center border space-y-2 ${
                isSandstone ? 'bg-transparent border-[#1a1815]/20' : 'bg-crag border-white/5'
              }`}>
                <Mountain size={32} className={isSandstone ? 'text-[#1a1815]/40 mx-auto' : 'text-slate-ash mx-auto'} />
                <p className={`text-sm font-bold ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>No problems in this sector yet</p>
                <p className={`text-xs font-light ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>Explore other sectors or submit a new problem.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredProblems.map((p, i) => {
                  const gradeColor = gradeColors[p.grade] || '#94A3B8'

                  return (
                    <motion.button
                      key={p.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => { setSelectedProblem(p.id); setLevel('topo'); setShowSheet(true) }}
                      className={`w-full text-left rounded-2xl p-4 flex items-center gap-3.5 touch-ripple transition-all group relative overflow-hidden border ${
                        isSandstone
                          ? 'bg-transparent border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                          : 'bg-crag border-white/5 hover:bg-crag-light hover:border-lime/30 text-chalk'
                      }`}
                    >
                      {/* Grade pill */}
                      <div
                        className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: gradeColor + '20', border: `1px solid ${gradeColor}40` }}
                      >
                        <span className="font-bold text-sm md:text-base leading-none" style={{ color: gradeColor }}>
                          {p.grade}
                        </span>
                        <span className={`text-[10px] font-light mt-0.5 ${
                          isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                        }`}>{p.fontGrade}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Boulder Tag */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-climb/10 text-cyan-climb border border-cyan-climb/20 font-bold">
                            BOULDER · {p.startType === 'Sit Start (SS)' ? 'SS' : 'STAND'}
                          </span>
                        </div>

                        <h3 className={`font-bold text-sm md:text-base truncate transition-colors ${
                          isSandstone ? 'text-[#1a1815] group-hover:underline' : 'text-chalk group-hover:text-lime'
                        }`}>
                          {p.name}
                        </h3>
                        <p className={`text-[11px] font-light truncate ${
                          isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                        }`}>
                          FA: {p.fa} · {p.ascentCount} ascents
                        </p>
                      </div>
                      <ChevronRight size={18} className={`flex-shrink-0 ${
                        isSandstone ? 'text-[#1a1815]/60 group-hover:text-[#1a1815]' : 'text-slate-ash group-hover:text-lime'
                      }`} />
                    </motion.button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Level 4: Topo Viewer */}
        {level === 'topo' && problem && sector && (
          <motion.div key="topo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 md:px-0 pb-24 lg:pb-8">
            {/* Desktop Problem Switcher Pills */}
            <div className="hidden lg:flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
              <span className={`text-xs font-light uppercase tracking-wider mr-2 ${
                isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
              }`}>
                Problems in sector:
              </span>
              {sector.problems.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProblem(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                    selectedProblem === p.id
                      ? isSandstone
                        ? 'bg-[#1a1815] text-[#d2c5ae] font-bold'
                        : 'bg-lime text-granite shadow-lime-glow-sm font-bold'
                      : isSandstone
                        ? 'border border-[#1a1815]/20 text-[#1a1815] hover:bg-[#1a1815]/10 font-light'
                        : 'bg-crag text-slate-ash hover:text-chalk border border-white/5 font-light'
                  }`}
                >
                  {p.name} ({p.grade})
                </button>
              ))}
            </div>

            {/* Layout: Full canvas on mobile, 2-column split studio on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Topo Canvas */}
              <div className="lg:col-span-7">
                <TopoCanvas
                  problem={problem}
                  imageUrl={sector.image}
                  onLogAscent={triggerLogAscent}
                />
              </div>

              {/* Right Column: Desktop Inspector Panel */}
              <div className={`hidden lg:flex lg:col-span-5 flex-col rounded-2xl p-6 h-[640px] overflow-y-auto justify-between border ${
                isSandstone
                  ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]'
                  : 'bg-crag border-white/5 text-chalk'
              }`}>
                <div>
                  <div className={`flex items-start justify-between mb-4 border-b pb-4 ${
                    isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
                  }`}>
                    <div>
                      {/* 1. Category Badge */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-climb/20 text-cyan-climb border border-cyan-climb/30 font-bold uppercase">
                          {problem.category || (problem.discipline === 'sport' ? 'lead' : problem.discipline === 'multipitch' ? 'trad' : 'boulder')} · {problem.startType || 'Sit Start'}
                        </span>
                      </div>

                      {/* 6. Grade Jalur & 2. Nama Jalur */}
                      <div className="flex items-center gap-2">
                        <span className="text-lime font-bold text-2xl">{problem.grade}</span>
                        <span className="text-slate-ash text-sm font-light">/ {problem.fontGrade}</span>
                      </div>
                      <h2 className="text-chalk font-bold text-2xl">{problem.name}</h2>
                      {/* 3. Route Setter + Tahun */}
                      <p className="text-slate-ash text-xs font-light">
                        Setter: <span className="font-medium text-chalk">{problem.setterYear || `${problem.setter || problem.fa} (${problem.faDate || '2023'})`}</span>
                      </p>
                    </div>
                    <div className="bg-granite px-3 py-1.5 rounded-xl border border-white/5 text-right">
                      <div className="text-lime font-bold text-lg">{problem.ascentCount}</div>
                      <div className="text-slate-ash text-[10px] uppercase font-light">Total Sends</div>
                    </div>
                  </div>

                  {/* Desktop Inspector Tabs */}
                  <div className="grid grid-cols-4 bg-granite p-1 rounded-xl mb-4 border border-white/5">
                    {[
                      { key: 'overview' as const, label: 'Overview', icon: ThumbsUp },
                      { key: 'specs' as const, label: 'Specs', icon: Layers },
                      { key: 'beta' as const, label: 'Beta', icon: Video },
                      { key: 'access' as const, label: 'Access', icon: ShieldAlert },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setDesktopTab(key)}
                        className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs transition-all ${
                          desktopTab === key
                            ? 'bg-lime text-granite shadow-lime-glow-sm font-bold'
                            : 'text-slate-ash hover:text-chalk font-light'
                        }`}
                      >
                        <Icon size={12} /> {label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  {desktopTab === 'overview' && (
                    <div className="space-y-4">
                      <p className="text-chalk/80 text-sm font-normal leading-relaxed">{problem.description}</p>
                      <div className="bg-granite rounded-xl p-3 border border-white/5">
                        <div className="text-slate-ash text-xs font-light mb-2 flex items-center gap-1.5">
                          <ThumbsUp size={13} className="text-lime" /> Community Grade Consensus
                        </div>
                        <div className="space-y-1.5">
                          {problem.gradeVotes.map(v => (
                            <div key={v.grade} className="flex items-center gap-2 text-xs">
                              <span className="w-8 font-bold text-lime">{v.grade}</span>
                              <div className="flex-1 h-2 bg-crag rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-lime rounded-full"
                                  style={{ width: `${(v.votes / Math.max(1, problem.ascentCount)) * 100}%` }}
                                />
                              </div>
                              <span className="text-slate-ash text-[11px] w-6 text-right font-light">{v.votes}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {desktopTab === 'specs' && (
                    <div className="space-y-3">
                      {/* 7. Tinggi Jalur & 8. Titik Pegangan */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-granite p-3 rounded-xl">
                          <span className="text-[10px] text-slate-ash uppercase block">7. Tinggi Jalur</span>
                          <span className="text-sm font-bold text-lime font-mono">
                            {problem.height || problem.pitchLength || problem.totalHeight || '4.2m'}
                          </span>
                        </div>
                        <div className="bg-granite p-3 rounded-xl">
                          <span className="text-[10px] text-slate-ash uppercase block">8. Titik Pegangan</span>
                          <span className="text-sm font-bold text-cyan-climb font-mono">
                            ~{problem.holdsCount || (problem.markers?.length ? problem.markers.length * 3 : 14)} Holds
                          </span>
                        </div>
                      </div>

                      {/* 8. Hold Details */}
                      {problem.holdDetails && (
                        <div className="bg-granite p-3 rounded-xl">
                          <span className="text-[10px] text-slate-ash uppercase block mb-1">Karakter Pegangan</span>
                          <p className="text-xs text-chalk/90 leading-relaxed">{problem.holdDetails}</p>
                        </div>
                      )}

                      {/* 9. Jumlah Anchor (Lead) / Crashpads */}
                      <div className="bg-granite p-3 rounded-xl">
                        <span className="text-[10px] text-slate-ash uppercase block mb-1">9. Jumlah Anchor & Pengaman</span>
                        {problem.category === 'lead' || problem.category === 'trad' || problem.discipline === 'sport' || problem.discipline === 'multipitch' ? (
                          <div className="text-xs text-chalk space-y-1">
                            <div><span className="text-lime font-bold font-mono">{problem.anchorCount || problem.boltCount || 9} Bolts</span> (Stainless Expansion)</div>
                            <div className="text-slate-ash text-[11px]">{problem.anchorType || 'Double Ring Chain Anchor'}</div>
                          </div>
                        ) : (
                          <div className="text-xs text-chalk space-y-1">
                            <div><span className="text-cyan-climb font-bold">{problem.padRecommendation || '2 Crashpads'}</span> recommended</div>
                            <div className="text-slate-ash text-[11px]">Pendaratan: {problem.landingQuality || 'Flat grassy ground'}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {desktopTab === 'beta' && (
                    <div className="space-y-3">
                      {/* 10. Beta Text */}
                      {problem.betaText && (
                        <div className="bg-granite p-3 rounded-xl border border-white/5">
                          <span className="text-[10px] text-lime uppercase font-bold block mb-1">Crux & Sequence Beta</span>
                          <p className="text-xs text-chalk/90 leading-relaxed">{problem.betaText}</p>
                        </div>
                      )}

                      {/* Beta Video */}
                      {problem.betaVideoUrl ? (
                        <div className="rounded-xl overflow-hidden aspect-video border border-white/5">
                          <iframe
                            src={problem.betaVideoUrl}
                            className="w-full h-full"
                            allowFullScreen
                            title="Beta Video"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-granite rounded-xl flex flex-col items-center justify-center gap-2">
                          <Video size={28} className="text-slate-ash" />
                          <p className="text-slate-ash text-sm font-light">No beta video recorded yet</p>
                        </div>
                      )}
                    </div>
                  )}

                  {desktopTab === 'access' && (
                    <div className="space-y-3">
                      <div className="bg-project/10 border border-project/20 rounded-xl p-3 flex gap-3">
                        <ShieldAlert size={16} className="text-project flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-project text-xs font-bold mb-1">Access & Crag Etiquette</p>
                          <p className="text-chalk/80 text-xs font-normal leading-relaxed">{problem.accessInfo}</p>
                        </div>
                      </div>
                      <div className="bg-granite rounded-xl p-3">
                        <p className="text-slate-ash text-[11px] uppercase tracking-wider mb-1 font-light">Local Contact / Area Host</p>
                        <p className="text-chalk text-xs font-medium">{problem.localContact}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Problems Call To Actions (2 CTAs): 1. Submit Sent | 2. Set New Route */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {/* CTA 1: Submit Sent */}
                  <button
                    onClick={triggerLogAscent}
                    className="h-12 bg-lime text-granite font-bold rounded-xl shadow-lime-glow text-xs sm:text-sm hover:bg-lime-dim transition-all flex items-center justify-center gap-1.5"
                  >
                    Submit Sent 🎉
                  </button>

                  {/* CTA 2: Set New Route */}
                  <button
                    onClick={() => {
                      if (canCreateCragRoute(role)) {
                        setShowAddRouteModal(true)
                      } else {
                        setShowRoadmapModal(true)
                      }
                    }}
                    className="h-12 border border-white/20 text-chalk font-bold rounded-xl hover:bg-white/5 hover:border-lime/40 text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus size={15} />
                    Set New Route
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Sheet */}
            <div className="lg:hidden">
              <AnimatePresence>
                {showSheet && (
                  <ProblemSheet
                    problem={problem}
                    onLogAscent={triggerLogAscent}
                    onSetNewRoute={() => {
                      if (canCreateCragRoute(role)) {
                        setShowAddRouteModal(true)
                      } else {
                        setShowRoadmapModal(true)
                      }
                    }}
                    onClose={() => setShowSheet(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Ascent Modal */}
      <AnimatePresence>
        {showLogModal && problem && (
          <LogAscentModal
            problemName={problem.name}
            grade={problem.grade}
            fontGrade={problem.fontGrade}
            setter={problem.setter || problem.fa}
            location={`${region?.name || 'Crag'} · ${sector?.name || 'Sector'}`}
            defaultImageUrl={problem.imageUrl || sector?.image || region?.image}
            markers={problem.markers}
            problemId={problem.id}
            discipline={problem.discipline || 'bouldering'}
            onClose={() => setShowLogModal(false)}
            onSubmit={data => {
              const saved = saveUserAscent({
                userId: user?.id || 'guest',
                problemId: problem.id,
                problemName: problem.name,
                grade: data.gradeVote || problem.grade,
                fontGrade: problem.fontGrade,
                setter: problem.setter || problem.fa || 'Curated Crag',
                location: `${region?.name || 'Crag'} · ${sector?.name || 'Sector'}`,
                ascentType: data.type,
                gradeVote: data.gradeVote,
                note: data.note,
                photoUrl: data.photoUrl || problem.imageUrl || sector?.image,
                videoUrl: data.videoUrl,
                markers: problem.markers || [],
                discipline: problem.discipline || 'bouldering',
              })
              setUserAscents(prev => [saved, ...prev])
              setShowLogModal(false)
              setActiveShareAscent(saved)
            }}
          />
        )}
      </AnimatePresence>

      {/* Ascent Share Modal (Strava-Style Share Card Reward) */}
      <AnimatePresence>
        {activeShareAscent && (
          <AscentShareModal
            ascent={activeShareAscent}
            onClose={() => setActiveShareAscent(null)}
            onViewPersonalBetaBook={() => {
              setActiveShareAscent(null)
              setLevel('regions')
              setShowMyAscentsView(true)
            }}
          />
        )}
      </AnimatePresence>

      {/* Add Route Modal (Super Admin / Website Owner) */}
      <AnimatePresence>
        {showAddRouteModal && (
          <AddRouteModal
            initialRegionId={selectedRegion || undefined}
            initialSectorId={selectedSector || undefined}
            regionsList={regions}
            onClose={() => setShowAddRouteModal(false)}
            onAddRoute={handleAddRoute}
          />
        )}
      </AnimatePresence>

      {/* Roadmap Contribute Modal (Registered Climber) */}
      <AnimatePresence>
        {showRoadmapModal && (
          <RoadmapContributeModal onClose={() => setShowRoadmapModal(false)} />
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}

export default function BetaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Mountain className="animate-spin text-lime" size={32} /></div>}>
      <BetaPageContent />
    </Suspense>
  )
}
