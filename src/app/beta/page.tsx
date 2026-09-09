'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Mountain, ThumbsUp, Video, ShieldAlert, Sparkles, Layers, Compass, Plus, ShieldCheck, Info, MapPin } from 'lucide-react'
import { Problem, CragRegion, RouteDiscipline } from '@/lib/mock-data'
import { useCragRegions, insertRoute, insertCragRegion, insertSector } from '@/lib/use-data'
import { gradeColors } from '@/lib/tokens'
import TopoCanvas from '@/components/beta/TopoCanvas'
import ProblemSheet from '@/components/beta/ProblemSheet'
import LogAscentModal from '@/components/beta/LogAscentModal'
import AddRouteModal, { NewRegionData, NewSectorData } from '@/components/beta/AddRouteModal'
import RoadmapContributeModal from '@/components/beta/RoadmapContributeModal'
import { useAuth } from '@/lib/auth-context'
import { canLogAscent, canCreateCragRoute } from '@/lib/permissions'
import { useTheme } from '@/lib/theme-context'

type ViewLevel = 'regions' | 'sectors' | 'problems' | 'topo'

function BetaPageContent() {
  const searchParams = useSearchParams()
  const { role, openAuthModal } = useAuth()
  const { cragRegions, loading: cragsLoading } = useCragRegions()
  const { isSandstone, toggleTheme } = useTheme()
  const [regions, setRegions] = useState<CragRegion[]>([])
  const [level, setLevel] = useState<ViewLevel>('regions')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'card'>('list')
  const [expandedRegionId, setExpandedRegionId] = useState<string | null>(null)

  const [showSheet, setShowSheet] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [showAddRouteModal, setShowAddRouteModal] = useState(false)
  const [showRoadmapModal, setShowRoadmapModal] = useState(false)
  const [desktopTab, setDesktopTab] = useState<'overview' | 'beta' | 'specs' | 'access'>('overview')

  useEffect(() => {
    if (cragRegions && cragRegions.length > 0) {
      setRegions(cragRegions)
    }
  }, [cragRegions])

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
  }, [searchParams, regions])

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
    if (level === 'topo') { setLevel('problems'); setShowSheet(false) }
    else if (level === 'problems') { setLevel('sectors'); setSelectedSector(null) }
    else if (level === 'sectors') { setLevel('regions'); setSelectedRegion(null) }
  }

  const breadcrumb = [
    level !== 'regions' && region?.name,
    (level === 'problems' || level === 'topo') && sector?.name.split('—')[0].trim(),
    level === 'topo' && problem?.name,
  ].filter(Boolean).join(' › ')

  // In Beta Book: Focus exclusively on Bouldering
  const filteredProblems = sector
    ? sector.problems.filter(p => !p.discipline || p.discipline === 'bouldering')
    : []

  // Filter regions with bouldering problems or authentic boulder crags
  const displayedRegions = regions.map(r => {
    const boulderSectors = r.sectors.map(s => ({
      ...s,
      problems: s.problems.filter(p => !p.discipline || p.discipline === 'bouldering'),
    })).filter(s => s.problems.length > 0 || r.problemCount > 0)

    const totalBoulderProblems = boulderSectors.reduce((acc, s) => acc + s.problems.length, 0)
    return {
      ...r,
      sectors: boulderSectors,
      problemCount: totalBoulderProblems > 0 ? totalBoulderProblems : r.problemCount,
      sectorCount: boulderSectors.length > 0 ? boulderSectors.length : r.sectorCount,
    }
  }).filter(r => r.sectors.length > 0 || r.problemCount > 0)

  return (
    <div
      className={`min-h-[90vh] transition-colors duration-300 ${
        isSandstone
          ? 'bg-[#d2c5ae] text-[#1a1815]'
          : 'bg-[#12161A] text-chalk'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-2 md:py-4">
        {/* TOP LEVEL NAVIGATION & CONTROLS */}
        {level === 'regions' ? (
          <div className="space-y-4 mb-4">
            {/* Headline Row: Clean "Boulder" (large) & "VIEW MODE" toolbar (Always Single Row) */}
            <div className="flex items-center justify-between gap-2 pt-1">
              {/* Category / Discipline Title — Clean "Boulder" */}
              <div>
                <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${
                  isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                }`}>
                  Boulder
                </h1>
              </div>

              {/* VIEW MODE Section matching Illustrator mockup */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
                <span className={`text-[9px] sm:text-[10px] md:text-xs uppercase font-bold tracking-widest ${
                  isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                }`}>
                  VIEW MODE
                </span>

                <div className="flex items-center gap-1">
                  {/* Mode 1: Single Card */}
                  <button
                    onClick={() => setViewMode('card')}
                    title="Card Mode"
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'card'
                        ? isSandstone ? 'bg-[#1a1815]/15 text-[#1a1815]' : 'bg-lime/20 text-lime'
                        : isSandstone ? 'text-[#1a1815]/40 hover:text-[#1a1815]' : 'text-slate-ash hover:text-chalk'
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={viewMode === 'card' ? '2.5' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                  </button>

                  {/* Mode 2: Grid Mode (2x2) */}
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Grid Mode"
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? isSandstone ? 'bg-[#1a1815]/15 text-[#1a1815]' : 'bg-lime/20 text-lime'
                        : isSandstone ? 'text-[#1a1815]/40 hover:text-[#1a1815]' : 'text-slate-ash hover:text-chalk'
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={viewMode === 'grid' ? '2.5' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </button>

                  {/* Mode 3: List Mode (active in mockup with orange accent) */}
                  <button
                    onClick={() => setViewMode('list')}
                    title="Minimalist List Mode"
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? isSandstone ? 'bg-[#1a1815]/10 text-[#d95338]' : 'bg-lime/20 text-[#d95338]'
                        : isSandstone ? 'text-[#1a1815]/40 hover:text-[#1a1815]' : 'text-slate-ash hover:text-chalk'
                    }`}
                  >
                    <svg
                      width="20"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={viewMode === 'list' ? '#d95338' : 'currentColor'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="3" y1="5" x2="21" y2="5" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <line x1="3" y1="15" x2="21" y2="15" />
                      <line x1="3" y1="20" x2="21" y2="20" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
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
                  className="hidden lg:flex items-center gap-1.5 bg-lime text-granite px-4 py-2 rounded-xl text-xs font-bold shadow-lime-glow-sm hover:bg-lime-dim transition-colors"
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
              {/* 1. MINIMALIST LIST VIEW (Matching the Adobe Illustrator Mockup) */}
              {viewMode === 'list' && (
                <div className={`divide-y transition-colors my-2 ${
                  isSandstone
                    ? 'divide-[#1a1815]/25 border-t border-b border-[#1a1815]/25'
                    : 'divide-white/10 border-t border-b border-white/10'
                }`}>
                  {displayedRegions.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm opacity-60">No crags found for this category.</p>
                    </div>
                  ) : (
                    displayedRegions.map(r => {
                      const isExpanded = expandedRegionId === r.id
                      return (
                         <div key={r.id} className="py-3.5 md:py-4.5 transition-colors">
                          <div className="flex items-center justify-between gap-3">
                            {/* Left: Plus and Region Name */}
                            <button
                              onClick={() => setExpandedRegionId(isExpanded ? null : r.id)}
                              className="flex items-center gap-2 text-left flex-1 group"
                            >
                              <span className={`text-2xl md:text-3xl font-light leading-none transition-transform duration-200 ${
                                isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                              }`}>
                                {isExpanded ? '−' : '+'}
                              </span>
                              <span className={`text-xl md:text-3xl font-medium tracking-tight transition-opacity ${
                                isSandstone ? 'text-[#1a1815] group-hover:opacity-70' : 'text-chalk group-hover:text-lime'
                              }`}>
                                {r.name}
                              </span>
                            </button>

                            {/* Right: Quick Sector Navigation & Meta */}
                            <div className="flex items-center gap-2">
                              <span className={`text-xs md:text-sm font-light hidden sm:inline ${
                                isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                              }`}>
                                {r.province}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedRegion(r.id)
                                  setLevel('sectors')
                                }}
                                className={`px-3 py-1 md:py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                                  isSandstone
                                    ? 'border border-[#1a1815]/20 text-[#1a1815]/90 hover:bg-[#1a1815]/10'
                                    : 'bg-crag hover:bg-crag-light text-chalk border border-white/5'
                                }`}
                              >
                                <span className="text-[9px] font-medium">Problems</span>
                                <span className="text-[11px] md:text-xs font-bold">{r.problemCount}</span>
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Drawer / Accordion */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden pt-4 pb-2 pl-6 md:pl-8 space-y-3"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-xs font-bold uppercase tracking-wider ${
                                    isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                                  }`}>
                                    Sectors ({r.sectors.length}):
                                  </span>
                                  {r.sectors.map(s => (
                                    <button
                                      key={s.id}
                                      onClick={() => {
                                        setSelectedRegion(r.id)
                                        setSelectedSector(s.id)
                                        setLevel('problems')
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                        isSandstone
                                          ? 'bg-[#1a1815]/10 hover:bg-[#1a1815]/20 text-[#1a1815]'
                                          : 'bg-crag hover:bg-crag-light text-chalk border border-white/10'
                                      }`}
                                    >
                                      {s.name} ({s.problems.length})
                                    </button>
                                  ))}
                                </div>

                                {/* Top Routes Preview */}
                                {r.sectors[0]?.problems && r.sectors[0].problems.length > 0 && (
                                  <div className="space-y-1.5 pt-1">
                                    <p className={`text-[11px] font-bold uppercase tracking-wider ${
                                      isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                                    }`}>
                                      Popular Problems:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {r.sectors[0].problems.slice(0, 3).map(p => (
                                        <button
                                          key={p.id}
                                          onClick={() => {
                                            setSelectedRegion(r.id)
                                            setSelectedSector(r.sectors[0].id)
                                            setSelectedProblem(p.id)
                                            setLevel('topo')
                                            setShowSheet(true)
                                          }}
                                          className={`p-2.5 rounded-xl text-left flex items-center justify-between border transition-all ${
                                            isSandstone
                                              ? 'bg-white/40 border-[#1a1815]/15 hover:bg-white/70 text-[#1a1815]'
                                              : 'bg-granite border-white/5 hover:border-lime/30 text-chalk'
                                          }`}
                                        >
                                          <div className="min-w-0 pr-2">
                                            <p className="font-bold text-xs truncate">{p.name}</p>
                                            <p className="text-[10px] opacity-70 truncate">{p.startType || 'Sit Start'} · FA: {p.fa}</p>
                                          </div>
                                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-black/10">
                                            {p.grade}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Quick CTA to Topo */}
                                <div className="pt-2 flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedRegion(r.id)
                                      setLevel('sectors')
                                    }}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                      isSandstone
                                        ? 'bg-[#1a1815] text-[#d2c5ae] hover:bg-black'
                                        : 'bg-lime text-granite hover:bg-lime-dim'
                                    }`}
                                  >
                                    Open {r.name} Guide ›
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* 2. GRID VIEW (Compact 2-3 Columns) */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 my-4">
                  {displayedRegions.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedRegion(r.id)
                        setLevel('sectors')
                      }}
                      className={`text-left rounded-2xl overflow-hidden border transition-all group ${
                        isSandstone
                          ? 'bg-white/40 border-[#1a1815]/15 hover:border-[#1a1815]/40 text-[#1a1815]'
                          : 'bg-crag border-white/10 hover:border-lime/30 text-chalk'
                      }`}
                    >
                      <div
                        className="h-32 md:h-40 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${r.image})` }}
                      />
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-1 text-[10px] opacity-70 mb-1">
                          <span>{r.province}</span>
                          <span>{r.sectorCount} Sectors</span>
                        </div>
                        <h3 className="font-bold text-sm md:text-base truncate group-hover:underline">
                          {r.name}
                        </h3>
                        <p className="text-xs opacity-80 mt-1">{r.problemCount} Problems</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 3. CARD VIEW (Hero Clean Cards) */}
              {viewMode === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 my-4">
                  {displayedRegions.map((r, i) => (
                    <motion.button
                      key={r.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => {
                        setSelectedRegion(r.id)
                        setLevel('sectors')
                      }}
                      className={`w-full text-left rounded-2xl overflow-hidden transition-all flex flex-col justify-between group border ${
                        isSandstone
                          ? 'bg-transparent border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                          : 'bg-transparent border border-white/10 hover:border-lime/30 text-chalk'
                      }`}
                    >
                      <div>
                        <div className="h-44 md:h-52 overflow-hidden relative w-full">
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url(${r.image})` }}
                          />
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h2 className={`font-bold text-lg md:text-xl transition-colors ${
                                isSandstone ? 'text-[#1a1815] group-hover:underline' : 'text-chalk group-hover:text-lime'
                              }`}>
                                {r.name}
                              </h2>
                              <div className={`flex items-center gap-1 text-xs font-light ${
                                isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                              }`}>
                                <MapPin size={11} />
                                <span>{r.province}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              isSandstone ? 'border-[#1a1815]/30 text-[#1a1815]' : 'border-lime/40 text-lime'
                            }`}>
                              {r.sectorCount} Sectors
                            </span>
                          </div>

                          <p className={`text-xs font-light line-clamp-2 leading-relaxed ${
                            isSandstone ? 'text-[#1a1815]/75' : 'text-slate-ash'
                          }`}>
                            {(r as any).description || `Premier outdoor bouldering destination in ${r.province} with ${r.sectorCount} verified sectors.`}
                          </p>
                        </div>
                      </div>

                      <div className={`p-4 pt-0 flex items-center justify-between text-xs border-t ${
                        isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
                      }`}>
                        <span className={`font-light text-[11px] ${
                          isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                        }`}>
                          {r.problemCount} Verified Problems
                        </span>
                        <span className={`font-bold flex items-center gap-0.5 ${
                          isSandstone ? 'text-[#1a1815]' : 'text-lime'
                        }`}>
                          Open Guide <ChevronRight size={13} />
                        </span>
                      </div>
                    </motion.button>
                  ))}
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
                Select a crag sector to view verified boulder problems
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
                  Showing {filteredProblems.length} verified boulder problems
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
                <p className={`text-sm font-bold ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>No boulder problems in this sector yet</p>
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
          <motion.div key="topo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 md:px-0">
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
                      {/* Boulder Badge */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-climb/20 text-cyan-climb border border-cyan-climb/30 font-bold">
                          BOULDERING · {problem.startType || 'Sit Start'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-lime font-bold text-2xl">{problem.grade}</span>
                        <span className="text-slate-ash text-sm font-light">/ {problem.fontGrade}</span>
                      </div>
                      <h2 className="text-chalk font-bold text-2xl">{problem.name}</h2>
                      <p className="text-slate-ash text-xs font-light">FA: {problem.fa} · {problem.faDate}</p>
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
                      { key: 'beta' as const, label: 'Beta Video', icon: Video },
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
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-granite p-3 rounded-xl">
                          <span className="text-[10px] text-slate-ash uppercase block">Start Stance</span>
                          <span className="text-sm font-bold text-cyan-climb">{problem.startType || 'Sit Start'}</span>
                        </div>
                        <div className="bg-granite p-3 rounded-xl">
                          <span className="text-[10px] text-slate-ash uppercase block">Crashpads</span>
                          <span className="text-xs font-bold text-cyan-climb">{problem.padRecommendation || '2 Pads'}</span>
                        </div>
                      </div>
                      <div className="bg-granite p-3 rounded-xl">
                        <span className="text-[10px] text-slate-ash uppercase block">Landing Quality</span>
                        <span className="text-xs text-chalk">{problem.landingQuality || 'Flat grassy ground'}</span>
                      </div>
                    </div>
                  )}

                  {desktopTab === 'beta' && (
                    <div>
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

                {/* Bottom Action */}
                <button
                  onClick={triggerLogAscent}
                  className="w-full h-12 bg-lime text-granite font-light tracking-wide rounded-xl shadow-lime-glow text-sm hover:bg-lime-dim transition-colors mt-4 font-bold"
                >
                  Log My Ascent 🎉
                </button>
              </div>
            </div>

            {/* Mobile Bottom Sheet */}
            <div className="lg:hidden">
              <AnimatePresence>
                {showSheet && (
                  <ProblemSheet
                    problem={problem}
                    onLogAscent={triggerLogAscent}
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
            onClose={() => setShowLogModal(false)}
            onSubmit={data => {
              console.log('Ascent logged:', data)
              setShowLogModal(false)
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
