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
import SendCard from '@/components/beta/SendCard'
import AddRouteModal, { NewRegionData, NewSectorData } from '@/components/beta/AddRouteModal'
import RoadmapContributeModal from '@/components/beta/RoadmapContributeModal'
import { useAuth } from '@/lib/auth-context'
import { canLogAscent, canCreateCragRoute } from '@/lib/permissions'
import { useTheme } from '@/lib/theme-context'
import { UserAscent, getUserAscents, saveUserAscent, deleteUserAscent } from '@/lib/user-ascents'
import Pictogram from '@/components/common/Pictogram'

type ViewLevel = 'regions' | 'sectors' | 'problems' | 'topo'
type ProblemCategory = 'boulder' | 'lead' | 'multipitch'
type ViewMode = 'list' | 'slide' | 'grid'

interface CategoryTheme {
  id: ProblemCategory
  label: string
  primary: string
  lightText: string
  darkText: string
  bannerBg: string
  activePillBg: string
  desc: string
}

const CATEGORY_THEMES: Record<ProblemCategory, CategoryTheme> = {
  boulder: {
    id: 'boulder',
    label: 'BOULDER',
    primary: '#83358B', // Ungu / Purple
    lightText: '#83358B',
    darkText: '#C084FC',
    bannerBg: '#83358B',
    activePillBg: 'bg-[#83358B]',
    desc: 'Boulder problems has been discovered across Sumatra Island. Explore our findings from the list below',
  },
  lead: {
    id: 'lead',
    label: 'LEAD',
    primary: '#E05A1B', // Orange
    lightText: '#E05A1B',
    darkText: '#FB923C',
    bannerBg: '#E05A1B',
    activePillBg: 'bg-[#E05A1B]',
    desc: 'Sport & lead routes have been discovered across Indonesia crags. Explore our findings from the list below',
  },
  multipitch: {
    id: 'multipitch',
    label: 'MULTIPITCH',
    primary: '#0D9488', // Hijau Toska
    lightText: '#0D9488',
    darkText: '#2DD4BF',
    bannerBg: '#0D9488',
    activePillBg: 'bg-[#0D9488]',
    desc: 'Multi-pitch & big wall routes discovered across towering faces. Explore our findings from the list below',
  },
}

function SumatraSilhouetteSvg() {
  return (
    <svg viewBox="0 0 340 340" className="w-full max-w-[260px] sm:max-w-[300px] h-auto drop-shadow-md" fill="none">
      {/* Sumatra Island Silhouette */}
      <path
        d="M 95 125
           C 102 120, 110 126, 118 132
           C 124 130, 130 136, 138 144
           C 148 142, 155 151, 164 160
           C 172 158, 180 167, 190 176
           C 200 174, 208 185, 218 195
           C 222 201, 216 207, 221 213
           C 228 211, 236 220, 242 228
           C 246 234, 240 238, 242 244
           C 248 246, 254 256, 258 264
           C 260 270, 254 274, 256 280
           C 260 286, 263 294, 262 302
           C 260 310, 254 318, 251 326
           C 248 330, 242 328, 238 324
           C 234 316, 237 306, 233 298
           C 229 290, 223 284, 218 276
           C 213 270, 206 264, 202 256
           C 197 248, 191 240, 186 232
           C 181 224, 174 218, 168 210
           C 161 202, 154 194, 147 186
           C 140 178, 132 170, 125 162
           C 118 154, 110 146, 103 138
           C 98 132, 93 128, 95 125 Z"
        fill="#000000"
      />
      {/* 8 white location dots across sectors */}
      <circle cx="112" cy="136" r="3.2" fill="#FFFFFF" />
      <circle cx="118" cy="142" r="3.2" fill="#FFFFFF" />
      <circle cx="174" cy="186" r="3.2" fill="#FFFFFF" />
      <circle cx="214" cy="226" r="3.2" fill="#FFFFFF" />
      <circle cx="234" cy="240" r="3.2" fill="#FFFFFF" />
      <circle cx="236" cy="245" r="3.2" fill="#FFFFFF" />
      <circle cx="252" cy="298" r="3.2" fill="#FFFFFF" />
      <circle cx="254" cy="306" r="3.2" fill="#FFFFFF" />
    </svg>
  )
}

function LeadCragSilhouetteSvg() {
  return (
    <svg viewBox="0 0 340 340" className="w-full max-w-[260px] sm:max-w-[300px] h-auto drop-shadow-md" fill="none">
      {/* Dramatic Karst Cliff Silhouette */}
      <path
        d="M 45 320
           L 70 240
           L 95 250
           L 115 180
           L 140 200
           L 165 110
           L 180 130
           L 205 75
           L 225 95
           L 240 150
           L 265 210
           L 280 190
           L 300 260
           L 315 320
           Z"
        fill="#000000"
      />
      {/* White dots for sport bolts & anchors */}
      <circle cx="170" cy="280" r="3.5" fill="#FFFFFF" />
      <circle cx="175" cy="235" r="3.5" fill="#FFFFFF" />
      <circle cx="182" cy="190" r="3.5" fill="#FFFFFF" />
      <circle cx="192" cy="145" r="3.5" fill="#FFFFFF" />
      <circle cx="205" cy="95" r="4.5" fill="#FFFFFF" />
      <path d="M 170 280 L 175 235 L 182 190 L 192 145 L 205 95" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
      <circle cx="125" cy="220" r="3" fill="#FFFFFF" />
      <circle cx="130" cy="195" r="3" fill="#FFFFFF" />
      <circle cx="255" cy="240" r="3" fill="#FFFFFF" />
      <circle cx="260" cy="215" r="3" fill="#FFFFFF" />
    </svg>
  )
}

function MultipitchWallSilhouetteSvg() {
  return (
    <svg viewBox="0 0 340 340" className="w-full max-w-[260px] sm:max-w-[300px] h-auto drop-shadow-md" fill="none">
      {/* Massive Big Wall Monolith */}
      <path
        d="M 55 320
           L 75 270
           L 65 220
           L 85 160
           L 100 110
           L 130 70
           L 195 60
           L 235 90
           L 250 150
           L 265 220
           L 255 270
           L 275 320
           Z"
        fill="#000000"
      />
      {/* Pitch station dots & line */}
      <circle cx="155" cy="290" r="3.5" fill="#FFFFFF" />
      <circle cx="150" cy="220" r="3.5" fill="#FFFFFF" />
      <circle cx="165" cy="150" r="3.5" fill="#FFFFFF" />
      <circle cx="160" cy="85" r="4.5" fill="#FFFFFF" />
      <path d="M 155 290 L 150 220 L 165 150 L 160 85" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" opacity="0.9" />
      {/* Variation pitch */}
      <circle cx="205" cy="250" r="3" fill="#FFFFFF" />
      <circle cx="215" cy="180" r="3" fill="#FFFFFF" />
      <circle cx="210" cy="110" r="3" fill="#FFFFFF" />
      <path d="M 205 250 L 215 180 L 210 110" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.75" />
    </svg>
  )
}

function BetaPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { role, user, openAuthModal } = useAuth()
  const { cragRegions, loading: cragsLoading } = useCragRegions()
  const { isSandstone } = useTheme()
  const [regions, setRegions] = useState<CragRegion[]>([])
  const [level, setLevel] = useState<ViewLevel>('regions')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory>('boulder')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  const currentTheme = CATEGORY_THEMES[selectedCategory]
  const themeTextColor = isSandstone ? currentTheme.lightText : currentTheme.darkText

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
      if (selectedSector) {
        setLevel('problems')
      } else if (selectedRegion) {
        setLevel('sectors')
      } else {
        setLevel('regions')
      }
      setShowSheet(false)
      setSelectedProblem(null)
    } else if (level === 'problems') {
      if (selectedRegion) {
        setLevel('sectors')
      } else {
        setLevel('regions')
      }
      setSelectedSector(null)
    } else if (level === 'sectors') {
      setLevel('regions')
      setSelectedRegion(null)
    }
  }

  const backLabel = useMemo(() => {
    if (level === 'topo') {
      return sector?.name.split('—')[0].trim() || region?.name || 'Problems'
    }
    if (level === 'problems') {
      return region?.name || 'Sectors'
    }
    if (level === 'sectors') {
      return 'Crags'
    }
    return 'Back'
  }, [level, sector, region])

  // Flat list of all problems across all crags & sectors
  const allProblems = useMemo(() => {
    const list: { problem: Problem; region: CragRegion; sector: { id: string; name: string; image?: string } }[] = []
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
    return allProblems
      .filter(({ problem: p, region: r, sector: s }) => {
        const q = searchQuery.toLowerCase().trim()
        const matchSearch =
          q === '' ||
          p.name.toLowerCase().includes(q) ||
          p.grade.toLowerCase().includes(q) ||
          (p.fontGrade && p.fontGrade.toLowerCase().includes(q)) ||
          r.name.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)

        const disc = p.discipline || 'bouldering'
        const matchCategory =
          (selectedCategory === 'boulder' &&
            (disc === 'bouldering' || p.category === 'boulder' || (!p.discipline && !p.category))) ||
          (selectedCategory === 'lead' &&
            (disc === 'sport' || p.category === 'lead')) ||
          (selectedCategory === 'multipitch' &&
            (disc === 'multipitch' || p.category === 'trad'))

        return matchSearch && matchCategory
      })
      .sort((a, b) => {
        if (selectedCategory === 'boulder') {
          // Prioritize Harau Valley problems so Gorejat & Sima Maung are at top
          if (a.region.id === 'harau' && b.region.id !== 'harau') return -1
          if (b.region.id === 'harau' && a.region.id !== 'harau') return 1
        }
        return 0
      })
  }, [allProblems, searchQuery, selectedCategory])

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
              /* Headline Row: Clean "Problems" with View Mode Switcher Icons */
              <div className="flex items-center justify-between gap-3 pt-1 pb-1">
                <h1
                  className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight ${
                    isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                  }`}
                >
                  Problems
                </h1>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* View Mode Switcher Icons: Slide, Grid, List */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {/* 1. Slide Mode */}
                    <button
                      onClick={() => setViewMode('slide')}
                      className={`p-1.5 rounded-lg transition-all ${
                        viewMode === 'slide' ? 'scale-110' : 'opacity-40 hover:opacity-80'
                      }`}
                      style={{
                        color: viewMode === 'slide' ? themeTextColor : 'currentColor',
                      }}
                      title="Slide View (Portrait Card)"
                      aria-label="Slide View"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="5" y="3" width="14" height="18" rx="2" />
                      </svg>
                    </button>

                    {/* 2. Grid Mode */}
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-all ${
                        viewMode === 'grid' ? 'scale-110' : 'opacity-40 hover:opacity-80'
                      }`}
                      style={{
                        color: viewMode === 'grid' ? themeTextColor : 'currentColor',
                      }}
                      title="Grid View"
                      aria-label="Grid View"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                    </button>

                    {/* 3. List Mode */}
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-all ${
                        viewMode === 'list' ? 'scale-110' : 'opacity-40 hover:opacity-80'
                      }`}
                      style={{
                        color: viewMode === 'list' ? themeTextColor : 'currentColor',
                      }}
                      title="List View"
                      aria-label="List View"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="18" x2="20" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* Action button: Set New Route */}
                  <button
                    onClick={handleAddRouteClick}
                    className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all border opacity-80 hover:opacity-100 flex items-center gap-1"
                    style={{
                      borderColor: currentTheme.primary + '60',
                      color: themeTextColor,
                    }}
                    title="Set New Route"
                  >
                    <Plus size={15} />
                    <span className="hidden sm:inline">Add Route</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 1-Step Back Navigation Header when in Sectors, Problems, or Topo */
          <div className="flex items-center justify-between gap-3 py-2.5 border-b border-black/10 dark:border-white/10 mb-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 group text-left transition-opacity hover:opacity-85 min-w-0"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                  isSandstone
                    ? 'bg-[#1a1815]/10 group-hover:bg-[#1a1815]/20 text-[#1a1815]'
                    : 'bg-crag group-hover:bg-crag-light text-chalk border border-white/5'
                }`}
              >
                <ChevronLeft size={18} />
              </div>
              <span
                className={`text-xs md:text-sm font-semibold truncate max-w-[200px] sm:max-w-xs md:max-w-md ${
                  isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                }`}
              >
                {backLabel}
              </span>
            </button>

            <div className="flex items-center gap-2">
              {level === 'topo' && (
                <button
                  onClick={triggerLogAscent}
                  className="flex items-center gap-1.5 bg-lime text-granite px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lime-glow-sm hover:bg-lime-dim transition-colors"
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
              {/* PERSONAL SENT CARDS (MY ASCENTS) */}
              {showMyAscentsView && (
                <div className="space-y-6 my-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`font-black text-2xl tracking-tight ${isSandstone ? 'text-[#1a1815]' : 'text-white'}`}>
                        Sent Cards Koleksi Saya
                      </h2>
                      <p className={`text-xs font-light mt-0.5 ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>
                        Koleksi kartu resmi pendakian (Send Cards) rute-rute yang telah Anda selesaikan
                      </p>
                    </div>
                  </div>

                  {userAscents.length === 0 ? (
                    <div className={`rounded-3xl p-10 text-center border space-y-3 ${
                      isSandstone ? 'border-[#1a1815]/20 bg-white/20' : 'border-white/10 bg-[#17191E]'
                    }`}>
                      <Award size={44} className={`mx-auto ${isSandstone ? 'text-[#1a1815]/40' : 'text-[#E6392D]'}`} />
                      <h3 className={`font-bold text-lg ${isSandstone ? 'text-[#1a1815]' : 'text-white'}`}>
                        Belum Ada Send Card yang Dicatat
                      </h3>
                      <p className={`text-xs max-w-md mx-auto font-light leading-relaxed ${
                        isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                      }`}>
                        Pilih rute crag mana saja, lalu klik tombol <b>Log Verified Ascent</b> untuk mencatat send Anda dan langsung mencetak kartu resmi Send Card!
                      </p>
                      <button
                        onClick={() => setShowMyAscentsView(false)}
                        className="px-5 py-2.5 bg-[#E6392D] hover:bg-[#D32F2F] text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
                      >
                        Jelajahi Jalur Crag
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userAscents.map(ascent => (
                        <div
                          key={ascent.id}
                          className="flex flex-col items-center group"
                        >
                          {/* Authentic Send Card Component */}
                          <div
                            onClick={() => setActiveShareAscent(ascent)}
                            className="w-full max-w-[340px] cursor-pointer transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl rounded-3xl overflow-hidden"
                          >
                            <SendCard
                              data={{
                                problemName: ascent.problemName,
                                grade: ascent.grade,
                                location: ascent.location,
                                provinceCountry: ascent.provinceCountry || 'Jawa Barat, ID',
                                wallAngle: ascent.wallAngle || '110°',
                                wallHeight: ascent.wallHeight || '12 m',
                                boltsCount:
                                  ascent.boltsCount ||
                                  (ascent.discipline?.toLowerCase().includes('boulder')
                                    ? '3 Crashpads'
                                    : '6 Bolts'),
                                discipline: ascent.discipline || 'Lead',
                                ascentType: ascent.ascentType,
                                attempts: ascent.attempts,
                                duration: ascent.duration,
                                photoUrl: ascent.photoUrl,
                                markers: ascent.markers,
                                climberName: ascent.climberName,
                                time: ascent.time,
                                date: ascent.date,
                                belayer: ascent.belayer,
                                photographer: ascent.photographer,
                              }}
                              showTopo={true}
                            />
                          </div>

                          {/* Action Buttons Below Card */}
                          <div className="w-full max-w-[340px] mt-3 flex items-center gap-2">
                            <button
                              onClick={() => setActiveShareAscent(ascent)}
                              className="flex-1 py-2 px-3 rounded-xl bg-[#E6392D] hover:bg-[#D32F2F] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all touch-ripple"
                            >
                              <Share2 size={13} />
                              <span>Unduh / Bagikan Card</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus Send Card untuk rute "${ascent.problemName}"?`)) {
                                  deleteUserAscent(ascent.id)
                                  setUserAscents(prev => prev.filter(a => a.id !== ascent.id))
                                }
                              }}
                              className={`p-2 rounded-xl border transition-colors ${
                                isSandstone
                                  ? 'border-[#1a1815]/20 hover:bg-red-500/10 text-red-600'
                                  : 'border-white/10 hover:bg-red-500/10 text-red-400'
                              }`}
                              title="Hapus Send Card"
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

              {/* DIRECT PROBLEMS LIST (Kategori & Theme) */}
              {!showMyAscentsView && (
                <div className="space-y-3.5 my-2">
                  {/* 1. Category Switcher Tabs (BOULDER, LEAD, MULTIPITCH) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
                    {(['boulder', 'lead', 'multipitch'] as ProblemCategory[]).map(catId => {
                      const cat = CATEGORY_THEMES[catId]
                      const isActive = selectedCategory === catId
                      return (
                        <button
                          key={catId}
                          onClick={() => {
                            setSelectedCategory(catId)
                            setActiveSlideIndex(0)
                          }}
                          className={`py-2 px-3 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-sm text-center ${
                            isActive
                              ? `${cat.activePillBg} text-white shadow-md`
                              : isSandstone
                              ? 'bg-[#83868B] text-white hover:bg-[#73767B]'
                              : 'bg-[#475569] text-white/90 hover:bg-[#526177]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* 2. Pill-shaped Search Bar ("Discover") */}
                  <div className="relative pt-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Discover"
                      className={`w-full py-2.5 px-6 rounded-full text-xs sm:text-sm outline-none transition-all border ${
                        isSandstone
                          ? 'bg-black/[0.03] text-[#1a1815] placeholder:text-[#1a1815]/40'
                          : 'bg-white/[0.05] text-chalk placeholder:text-white/40'
                      }`}
                      style={{
                        borderColor: currentTheme.primary + '55',
                      }}
                    />
                  </div>

                  {/* 3. Category Feature Graphic Hero Banner */}
                  <div
                    className="w-full rounded-2xl overflow-hidden my-3 relative shadow-md transition-colors duration-300"
                    style={{ backgroundColor: currentTheme.bannerBg }}
                  >
                    <div className="py-6 sm:py-8 px-4 flex items-center justify-center min-h-[220px] sm:min-h-[280px]">
                      {selectedCategory === 'boulder' && <SumatraSilhouetteSvg />}
                      {selectedCategory === 'lead' && <LeadCragSilhouetteSvg />}
                      {selectedCategory === 'multipitch' && <MultipitchWallSilhouetteSvg />}
                    </div>
                  </div>

                  {/* 4. Stats & Description Block */}
                  <div className="flex items-center gap-4 py-2 sm:py-3">
                    <div
                      className="text-5xl sm:text-6xl font-light tracking-tight flex-shrink-0"
                      style={{ color: themeTextColor }}
                    >
                      {selectedCategory === 'boulder' ? '26' : filteredProblemsList.length}
                    </div>
                    <p
                      className="text-xs sm:text-sm leading-snug font-normal max-w-sm sm:max-w-md"
                      style={{ color: themeTextColor }}
                    >
                      {currentTheme.desc}
                    </p>
                  </div>

                  {/* Divider Line */}
                  <div
                    className="w-full border-b mb-1"
                    style={{ borderColor: currentTheme.primary + '40' }}
                  />

                  {/* 5. VIEW MODES */}
                  {/* View Mode A: EDITORIAL LIST (Matches mockup media_1789638006371.jpg) */}
                  {viewMode === 'list' && (
                    <div className="divide-y" style={{ borderColor: currentTheme.primary + '35' }}>
                      {filteredProblemsList.length === 0 ? (
                        <div className="py-16 text-center space-y-2">
                          <Mountain
                            size={36}
                            className="mx-auto opacity-40"
                            style={{ color: themeTextColor }}
                          />
                          <p className="text-sm font-medium" style={{ color: themeTextColor }}>
                            Tidak ada jalur pemanjatan ditemukan
                          </p>
                          <p className="text-xs opacity-60" style={{ color: themeTextColor }}>
                            Coba ubah kata kunci pencarian.
                          </p>
                        </div>
                      ) : (
                        filteredProblemsList.map(({ problem: p, region: r, sector: s }) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedRegion(r.id)
                              setSelectedSector(s.id)
                              setSelectedProblem(p.id)
                              setLevel('topo')
                              setShowSheet(true)
                            }}
                            className="w-full text-left py-3.5 sm:py-4 flex items-center justify-between gap-4 transition-opacity hover:opacity-75 group border-b"
                            style={{ borderColor: currentTheme.primary + '35' }}
                          >
                            <div className="flex items-baseline gap-3 sm:gap-6 min-w-0 flex-1">
                              <span
                                className="text-2xl sm:text-3xl font-normal tracking-tight truncate"
                                style={{ color: themeTextColor }}
                              >
                                {p.name}
                              </span>
                              <span
                                className="text-xs sm:text-sm font-normal opacity-70 whitespace-nowrap"
                                style={{ color: themeTextColor }}
                              >
                                {r.name}
                              </span>
                            </div>

                            <span
                              className="text-2xl sm:text-3xl font-bold font-mono flex-shrink-0"
                              style={{ color: themeTextColor }}
                            >
                              {p.grade}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {/* View Mode B: PORTRAIT CARDS SLIDESHOW (With Topo) */}
                  {viewMode === 'slide' && filteredProblemsList.length > 0 && (
                    <div className="space-y-4 py-3">
                      <div
                        className="relative overflow-hidden rounded-3xl max-w-sm mx-auto aspect-[3/4] shadow-xl border transition-all"
                        style={{ borderColor: currentTheme.primary + '50' }}
                      >
                        <img
                          src={
                            filteredProblemsList[activeSlideIndex]?.problem.imageUrl ||
                            filteredProblemsList[activeSlideIndex]?.sector.image ||
                            filteredProblemsList[activeSlideIndex]?.region.image
                          }
                          alt={filteredProblemsList[activeSlideIndex]?.problem.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

                        {/* Top Header Badge */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-md uppercase tracking-wider"
                            style={{ backgroundColor: currentTheme.primary }}
                          >
                            {currentTheme.label}
                          </span>
                          <span className="text-xl font-bold font-mono text-white bg-black/60 px-3 py-1 rounded-xl backdrop-blur-md border border-white/20">
                            {filteredProblemsList[activeSlideIndex]?.problem.grade}
                          </span>
                        </div>

                        {/* Bottom Info & Action */}
                        <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
                          <div>
                            <h3 className="text-3xl font-bold tracking-tight">
                              {filteredProblemsList[activeSlideIndex]?.problem.name}
                            </h3>
                            <p className="text-xs opacity-80 mt-0.5">
                              {filteredProblemsList[activeSlideIndex]?.region.name} · {filteredProblemsList[activeSlideIndex]?.sector.name.split('—')[0].trim()}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              const item = filteredProblemsList[activeSlideIndex]
                              if (item) {
                                setSelectedRegion(item.region.id)
                                setSelectedSector(item.sector.id)
                                setSelectedProblem(item.problem.id)
                                setLevel('topo')
                                setShowSheet(true)
                              }
                            }}
                            className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-opacity hover:opacity-90"
                            style={{ backgroundColor: currentTheme.primary, color: '#FFFFFF' }}
                          >
                            <span>Lihat Topo & Beta</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Carousel controls */}
                      <div className="flex items-center justify-center gap-4 pt-1">
                        <button
                          onClick={() => setActiveSlideIndex(prev => (prev > 0 ? prev - 1 : filteredProblemsList.length - 1))}
                          className="p-2.5 rounded-full border transition-all hover:scale-105"
                          style={{ borderColor: currentTheme.primary + '50', color: themeTextColor }}
                          aria-label="Previous problem"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-xs font-mono font-medium" style={{ color: themeTextColor }}>
                          {activeSlideIndex + 1} / {filteredProblemsList.length}
                        </span>
                        <button
                          onClick={() => setActiveSlideIndex(prev => (prev < filteredProblemsList.length - 1 ? prev + 1 : 0))}
                          className="p-2.5 rounded-full border transition-all hover:scale-105"
                          style={{ borderColor: currentTheme.primary + '50', color: themeTextColor }}
                          aria-label="Next problem"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* View Mode C: CARDS GRID */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 py-3">
                      {filteredProblemsList.map(({ problem: p, region: r, sector: s }) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedRegion(r.id)
                            setSelectedSector(s.id)
                            setSelectedProblem(p.id)
                            setLevel('topo')
                            setShowSheet(true)
                          }}
                          className="text-left rounded-2xl overflow-hidden border transition-all hover:scale-[1.02] flex flex-col justify-between group shadow-sm"
                          style={{
                            borderColor: currentTheme.primary + '40',
                            backgroundColor: isSandstone ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.03)',
                          }}
                        >
                          <div className="aspect-[4/3] w-full relative bg-black/40 overflow-hidden">
                            <img
                              src={p.imageUrl || s.image || r.image}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div
                              className="absolute top-2 right-2 px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono text-white shadow-sm"
                              style={{ backgroundColor: currentTheme.primary }}
                            >
                              {p.grade}
                            </div>
                          </div>
                          <div className="p-3 space-y-0.5">
                            <h4 className="font-bold text-sm truncate group-hover:underline" style={{ color: themeTextColor }}>
                              {p.name}
                            </h4>
                            <p className="text-[11px] opacity-70 truncate" style={{ color: themeTextColor }}>
                              {r.name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
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
          <motion.div key="topo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-24 lg:pb-8">
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
              <div className="lg:col-span-7 -mx-4 md:mx-0">
                <TopoCanvas
                  problem={problem}
                  imageUrl={problem.imageUrl || sector.image}
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
            provinceCountry={region?.province ? `${region.province}, ID` : 'Jawa Barat, ID'}
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
                provinceCountry: data.provinceCountry || (region?.province ? `${region.province}, ID` : 'Jawa Barat, ID'),
                ascentType: data.type,
                gradeVote: data.gradeVote,
                note: data.note,
                photoUrl: data.photoUrl || problem.imageUrl || sector?.image,
                videoUrl: data.videoUrl,
                markers: problem.markers || [],
                discipline: problem.discipline || 'bouldering',
                climberName: data.climberName || user?.name || 'Arief Lala Hakiem',
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
