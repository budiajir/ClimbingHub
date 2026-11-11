'use client'

import { useState, useEffect } from 'react'
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
  Heart,
  MessageSquare,
  ShieldCheck,
  Settings as SettingsIcon,
  User,
  Plus,
  Radio,
  Clock,
  Award,
  Lock,
} from 'lucide-react'
import Link from 'next/link'
import { Problem, Community } from '@/lib/mock-data'
import RequestToJoinModal from '@/components/community/RequestToJoinModal'
import { useGyms, useCragRegions, useCommunities } from '@/lib/use-data'
import { gradeColors } from '@/lib/tokens'
import { useAuth } from '@/lib/auth-context'
import { canLogAscent } from '@/lib/permissions'
import { useTheme } from '@/lib/theme-context'
import { getCommunityPosts, togglePostLike, CommunityPost } from '@/lib/community-posts-store'
import Pictogram from '@/components/common/Pictogram'

export default function HomePage() {
  const { role, openAuthModal, user } = useAuth()
  const { isSandstone } = useTheme()
  const [showLogModal, setShowLogModal] = useState(false)
  const [activeShareAscent, setActiveShareAscent] = useState<UserAscent | null>(null)
  const [selectedJoinCommunity, setSelectedJoinCommunity] = useState<Community | null>(null)
  const { gyms } = useGyms()
  const { cragRegions } = useCragRegions()
  const { communities } = useCommunities()

  // Live Community Newsfeed Posts
  const [newsfeedPosts, setNewsfeedPosts] = useState<CommunityPost[]>([])

  useEffect(() => {
    setNewsfeedPosts(getCommunityPosts())

    const handleNewsfeedUpdate = () => {
      setNewsfeedPosts(getCommunityPosts())
    }
    window.addEventListener('community-posts-updated', handleNewsfeedUpdate)
    return () => {
      window.removeEventListener('community-posts-updated', handleNewsfeedUpdate)
    }
  }, [])

  const handleToggleLike = (id: string) => {
    const updated = togglePostLike(id)
    setNewsfeedPosts(updated)
  }

  const handleFABPress = () => {
    if (!canLogAscent(role)) {
      openAuthModal('Please sign in or create an account to log your climbing ascents.')
    } else {
      setShowLogModal(true)
    }
  }

  // Flatten featured problems across crags
  const featuredProblems = (cragRegions || []).flatMap(r =>
    (r.sectors || []).flatMap(s =>
      (s.problems || []).map(p => ({
        ...p,
        regionId: r.id,
        sectorId: s.id,
        cragName: r.name || '',
        sectorName: s.name || '',
        cragImage: r.image || '',
        sectorImage: s.image || '',
      }))
    )
  )

  return (
    <div className={`pb-20 md:pb-28 transition-colors duration-300 ${
      isSandstone ? 'bg-[#d2c5ae] text-[#1a1815]' : 'bg-[#23262C] text-chalk'
    }`}>
      {/* 1. TOP HERO BANNER (With Logo Title Home button in TopBar) */}
      <HeroBanner />

      {/* MAIN VERTICAL FEED (V1.0 ROADMAP SEQUENCE) */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-10 md:space-y-14 pt-6 md:pt-8">

        {/* ============================================================ */}
        {/* ITEM 2: NEWSFEED (V1.0 ACTIVE)                               */}
        {/* Scope: Feed displaying updates, posts, and climbing activity */}
        {/* CTA Button: Yes                                              */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/community" className="group inline-block">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F90657] transition-opacity group-hover:opacity-80">
                  Newsfeed
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  V1.0 Live Feed
                </span>
              </div>
            </Link>
          </div>
          <p className={`text-xs md:text-sm font-light -mt-2 ${
            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
          }`}>
            A feed displaying updates, posts, and activity from the climbing community.
          </p>

          {/* Newsfeed Cards (Horizontal scrollable on mobile, 2-3 grid on desktop) */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 md:mx-0 md:px-0 items-stretch">
            {newsfeedPosts.slice(0, 3).map((post) => (
              <div
                key={post.id}
                className={`w-80 md:w-auto flex-shrink-0 rounded-2xl border flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all ${
                  isSandstone
                    ? 'bg-[#f4efe6] border-[#1a1815]/15 text-[#1a1815]'
                    : 'bg-[#181D22] border-white/10 text-chalk'
                }`}
              >
                {/* Post Author Bar */}
                <div className="p-3.5 flex items-center justify-between border-b border-black/5 dark:border-white/5">
                  <Link
                    href={`/account?user=${post.userId}`}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#FF6B00] flex-shrink-0 group-hover:scale-105 transition-transform">
                      <img src={post.avatar} alt={post.userName} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs truncate group-hover:text-[#FF6B00] transition-colors">
                        {post.userName}
                      </h4>
                      <p className="text-[10px] opacity-60 truncate">
                        {post.hometown} · {post.timeAgo}
                      </p>
                    </div>
                  </Link>

                  {post.grade && (
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 shrink-0">
                      {post.grade}
                    </span>
                  )}
                </div>

                {/* Media Image */}
                <div className="relative h-44 w-full overflow-hidden bg-black/40">
                  <img
                    src={post.image}
                    alt="Activity"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white flex items-center gap-1 border border-white/10">
                    <MapPin size={10} className="text-[#FF6B00]" />
                    <span className="truncate max-w-[200px]">{post.location}</span>
                  </div>
                </div>

                {/* Content & Social Action */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] block mb-1">
                      {post.activity}
                    </span>
                    <p className="text-xs line-clamp-2 leading-relaxed opacity-90 font-light">
                      {post.caption}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                          post.hasLiked ? 'text-rose-500' : 'opacity-70 hover:text-rose-400'
                        }`}
                      >
                        <Heart size={13} className={post.hasLiked ? 'fill-rose-500' : ''} />
                        <span>{post.likes}</span>
                      </button>

                      <span className="flex items-center gap-1 text-[11px] opacity-60">
                        <MessageSquare size={13} />
                        <span>{post.comments.length}</span>
                      </span>
                    </div>

                    <Link
                      href="/community"
                      className="text-[11px] font-bold text-[#FF6B00] hover:underline flex items-center gap-0.5"
                    >
                      <span>Join Discussion</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button: Yes */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              onClick={handleFABPress}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all"
            >
              <Plus size={14} />
              <span>Share Activity Update</span>
            </button>

            <Link
              href="/community"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all shadow-sm"
            >
              <span>Explore Full Community Feed</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* PINK DIVIDER LINE */}
        <div className="border-t border-[#F90657]/30" />

        {/* ============================================================ */}
        {/* ITEM 3: CRAGS (V1.0 ACTIVE)                                  */}
        {/* Scope: Outdoor climbing areas, routes, topos, access details */}
        {/* CTA Button: Yes                                              */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/crags" className="group inline-block">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F90657] transition-opacity group-hover:opacity-80">
                  Crags
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  V1.0
                </span>
              </div>
            </Link>
          </div>
          <p className={`text-xs md:text-sm font-light -mt-2 ${
            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
          }`}>
            Information and guides for outdoor climbing areas, including routes, topos, and access details.
          </p>

          {/* Mobile: Horizontal scrollable cards / Desktop: 3-4 cols */}
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 md:mx-0 md:px-0 items-stretch">
            {cragRegions.map((crag) => (
              <div
                key={crag.id}
                className="w-72 md:w-auto flex-shrink-0 flex flex-col h-[356px] md:h-auto md:min-h-[356px]"
              >
                <Link
                  href={`/crags/${crag.id}`}
                  className={`h-full rounded-2xl overflow-hidden flex flex-col justify-between group border shadow-sm hover:shadow-md transition-colors duration-200 ${
                    isSandstone
                      ? 'bg-transparent border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                      : 'bg-transparent border border-white/10 hover:border-[#FF6B00]/40 text-chalk'
                  }`}
                >
                  <div className="h-36 md:h-40 overflow-hidden relative flex-shrink-0 w-full">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${crag.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 min-h-[40px]">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-base truncate transition-colors duration-200 ${
                            isSandstone ? 'text-[#1a1815] group-hover:underline' : 'text-chalk group-hover:text-[#FF6B00]'
                          }`}>
                            {crag.name}
                          </h3>
                          <div className={`flex items-center gap-1 text-xs font-light truncate ${
                            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                          }`}>
                            <MapPin size={11} className="flex-shrink-0" />
                            <span className="truncate">{crag.province}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-ash/80 flex-shrink-0 whitespace-nowrap">
                          {crag.sectorCount} Sectors
                        </span>
                      </div>

                      <p className={`text-xs font-light line-clamp-2 leading-relaxed h-9 overflow-hidden mt-2 ${
                        isSandstone ? 'text-[#1a1815]/75' : 'text-slate-ash'
                      }`}>
                        {crag.description || `Premier outdoor bouldering destination in ${crag.province} with ${crag.sectorCount} verified sectors.`}
                      </p>
                    </div>

                    <div className={`pt-3 flex items-center justify-between text-xs border-t mt-auto flex-shrink-0 ${
                      isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
                    }`}>
                      <span className={`font-light text-[11px] truncate ${
                        isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                      }`}>
                        {crag.problemCount} Verified Problems
                      </span>
                      <span className="font-bold flex items-center gap-0.5 flex-shrink-0 text-[#FF6B00]">
                        <span>Explore Crags</span>
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* CTA Button: Yes */}
          <div className="flex justify-end pt-2">
            <Link
              href="/crags"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all shadow-sm"
            >
              <span>Discover More Crags</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* PINK DIVIDER LINE */}
        <div className="border-t border-[#F90657]/30" />

        {/* ============================================================ */}
        {/* ITEM 4: PROBLEMS (V1.0 ACTIVE)                               */}
        {/* Scope: Specific problems, grades, descriptions, user logs    */}
        {/* CTA Button: Yes                                              */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/beta" className="group inline-block">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F90657] transition-opacity group-hover:opacity-80">
                  Problems
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  V1.0
                </span>
              </div>
            </Link>
          </div>
          <p className={`text-xs md:text-sm font-light -mt-2 ${
            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
          }`}>
            Information and details on specific climbing and boulder problems, including grades, descriptions, and user logs.
          </p>

          {/* Mobile: Horizontal scrollable portrait cards / Desktop: 3-4 cols */}
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 md:mx-0 md:px-0 items-stretch">
            {featuredProblems.slice(0, 8).map((problem) => {
              const gradeColor = gradeColors[problem.grade] || '#CCFF00'
              const photoUrl = problem.imageUrl || problem.sectorImage || problem.cragImage || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80'
              const rawMarkers = Array.isArray(problem.markers) ? problem.markers : []
              const markers = rawMarkers.length >= 2
                ? rawMarkers.map((m) => ({
                    x: typeof m?.x === 'number' ? m.x : (Number(m?.x) || 50),
                    y: typeof m?.y === 'number' ? m.y : (Number(m?.y) || 50),
                    type: m?.type || 'B',
                  }))
                : [
                    { x: 28, y: 80, type: 'S' },
                    { x: 48, y: 52, type: 'Z' },
                    { x: 68, y: 22, type: 'T' }
                  ]

              return (
                <div
                  key={problem.id}
                  className="relative aspect-[3/4] w-64 md:w-auto flex-shrink-0 group rounded-2xl flex flex-col"
                >
                  <Link
                    href={`/beta?region=${problem.regionId}&sector=${problem.sectorId}&problem=${problem.id}`}
                    className={`relative w-full h-full rounded-2xl overflow-hidden flex flex-col justify-between border shadow-md hover:shadow-xl transition-colors duration-200 ${
                      isSandstone
                        ? 'border-[#1a1815]/20 hover:border-[#1a1815]/60'
                        : 'border-white/10 hover:border-[#FF6B00]/40'
                    }`}
                  >
                    {/* Portrait Background Photo */}
                    <img
                      src={photoUrl}
                      alt={problem.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Gradient overlays for readability */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/95 via-black/65 to-transparent pointer-events-none z-10" />

                    {/* Animated SVG Topo Line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      <polyline
                        points={markers.map((m) => `${m.x}%,${m.y}%`).join(' ')}
                        fill="none"
                        stroke="#FE7733"
                        strokeWidth="6"
                        opacity="0.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-opacity duration-300 group-hover:opacity-60"
                      />
                      <polyline
                        points={markers.map((m) => `${m.x}%,${m.y}%`).join(' ')}
                        fill="none"
                        stroke="#FE7733"
                        strokeWidth="3.5"
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-topo-dash"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.85))' }}
                      />
                    </svg>

                    {/* Marker Points */}
                    {markers.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}
                        className="absolute pointer-events-none z-10 flex items-center justify-center"
                      >
                        {(m.type === 'T' || m.type === 'S') && (
                          <span
                            className={`absolute w-7 h-7 rounded-full animate-anchor-pulse ${
                              m.type === 'T' ? 'bg-rose-500/50 ring-1 ring-rose-400/80' : 'bg-emerald-500/50 ring-1 ring-emerald-400/80'
                            }`}
                          />
                        )}
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-md z-10 ${
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
                        <Compass size={10} className="text-[#FF6B00]" /> {problem.discipline ? problem.discipline.toUpperCase() : 'BOULDER'}
                      </span>

                      <div
                        className="px-2 py-0.5 rounded-md font-bold font-mono text-xs backdrop-blur-md bg-black/70 border shadow-sm"
                        style={{ borderColor: gradeColor, color: gradeColor }}
                      >
                        {problem.grade}
                      </div>
                    </div>

                    {/* Card Bottom: Route Name, Location, Sends */}
                    <div className="relative z-20 p-3.5 space-y-1">
                      <h3 className="font-bold text-base md:text-lg text-white leading-tight drop-shadow-sm group-hover:text-[#FF6B00] transition-colors duration-200 truncate">
                        {problem.name}
                      </h3>
                      <p className="text-xs text-white/75 truncate font-light">
                        {problem.cragName} · {(problem.sectorName || '').split('—')[0]}
                      </p>

                      <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
                        <span className="font-light text-[11px] text-white/70">
                          {problem.ascentCount} logged sends
                        </span>
                        <span className="font-bold text-[#FF6B00] flex items-center gap-0.5 text-xs flex-shrink-0">
                          <span>Explore Problems</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>

          {/* CTA Button: Yes */}
          <div className="flex justify-end pt-2">
            <Link
              href="/beta"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all shadow-sm"
            >
              <span>Discover More Problems</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* PINK DIVIDER LINE */}
        <div className="border-t border-[#F90657]/30" />

        {/* ============================================================ */}
        {/* ITEM 5: CONNECT (V1.0: ADD FRIEND & SENT PROJECT)            */}
        {/* Scope: Finding, messaging, connecting with other climbers    */}
        {/* CTA Button: Yes (Add Friend, Sent Project)                   */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F90657]">
                  Connect
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  V1.0 Active
                </span>
              </div>
              <p className={`text-xs md:text-sm font-light mt-0.5 ${
                isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
              }`}>
                A feature for finding, messaging, and connecting with other climbers and potential partners.
              </p>
            </div>

            {/* Staged Roadmap Pill */}
            <div className="flex items-center gap-2 text-[10px] font-mono opacity-70">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                V1.0: Friends & Sends
              </span>
              <span className="opacity-50">·</span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 opacity-75">
                V2.0: Trip · V5.0: Rent Gear
              </span>
            </div>
          </div>

          {/* Connect Action Cards (CTA Button: Yes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Action 1: Add Friend */}
            <Link
              href="/climbers"
              className={`p-5 rounded-2xl border flex flex-col justify-between group transition-all hover:-translate-y-0.5 ${
                isSandstone
                  ? 'bg-[#f4efe6] border-[#1a1815]/15 hover:border-[#FF6B00]'
                  : 'bg-[#181D22] border-white/10 hover:border-[#FF6B00]/40'
              }`}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00]">
                  <UserPlus size={20} />
                </div>
                <h3 className="font-bold text-base group-hover:text-[#FF6B00] transition-colors">
                  Add Friend & Partner
                </h3>
                <p className="text-xs opacity-70 leading-relaxed font-light">
                  Browse climber profiles, connect with belay buddies, and grow your local squad network.
                </p>
              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/10 mt-3 flex items-center justify-between text-xs font-bold text-[#FF6B00]">
                <span>Find Climbers</span>
                <ChevronRight size={14} />
              </div>
            </Link>

            {/* Action 2: Sent Project */}
            <button
              type="button"
              onClick={handleFABPress}
              className={`p-5 rounded-2xl border flex flex-col justify-between text-left group transition-all hover:-translate-y-0.5 ${
                isSandstone
                  ? 'bg-[#f4efe6] border-[#1a1815]/15 hover:border-[#F90657]'
                  : 'bg-[#181D22] border-white/10 hover:border-[#F90657]/40'
              }`}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#F90657]/15 flex items-center justify-center text-[#F90657]">
                  <Award size={20} />
                </div>
                <h3 className="font-bold text-base group-hover:text-[#F90657] transition-colors">
                  Project Sent (Log Ascent)
                </h3>
                <p className="text-xs opacity-70 leading-relaxed font-light">
                  Log your completed send, grade vote, and generate an official verified Send Card certificate.
                </p>
              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/10 mt-3 flex items-center justify-between text-xs font-bold text-[#F90657]">
                <span>Log Send Card</span>
                <ChevronRight size={14} />
              </div>
            </button>

            {/* Action 3: Set Problems / Set Route (Route Setters Only) */}
            <Link
              href="/set-route"
              className={`p-5 rounded-2xl border flex flex-col justify-between group transition-all hover:-translate-y-0.5 sm:col-span-2 md:col-span-1 ${
                isSandstone
                  ? 'bg-[#f4efe6] border-[#1a1815]/15 hover:border-[#06B6D4]'
                  : 'bg-[#181D22] border-white/10 hover:border-[#06B6D4]/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/15 flex items-center justify-center text-[#06B6D4]">
                    <Compass size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Route Setters Only
                  </span>
                </div>
                <h3 className="font-bold text-base group-hover:text-[#06B6D4] transition-colors">
                  Set Problems / Set Route
                </h3>
                <p className="text-xs opacity-70 leading-relaxed font-light">
                  Limited access for granted Route Setters (Topo, Photo, Route Data, Rock Profile &amp; Grade).
                </p>
              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/10 mt-3 flex items-center justify-between text-xs font-bold text-[#06B6D4]">
                <span>Open Set Route</span>
                <ChevronRight size={14} />
              </div>
            </Link>
          </div>
        </section>

        {/* PINK DIVIDER LINE */}
        <div className="border-t border-[#F90657]/30" />

        {/* ============================================================ */}
        {/* ITEM 6: CLIMBING GYM (V1.0 ACTIVE)                           */}
        {/* Scope: Locations, facilities, route setters, booking passes  */}
        {/* CTA Button: Yes                                              */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/gyms" className="group inline-block">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F90657] transition-opacity group-hover:opacity-80">
                  Climbing Gym
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  V1.0
                </span>
              </div>
            </Link>
          </div>
          <p className={`text-xs md:text-sm font-light -mt-2 ${
            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
          }`}>
            Locations, facilities, route setter and events from climbing gyms with detailed informations.
          </p>

          {/* Mobile: Horizontal scrollable cards / Desktop: 3-4 cols */}
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 md:mx-0 md:px-0 items-stretch">
            {gyms.map((gym) => (
              <div
                key={gym.id}
                className="w-72 md:w-auto flex-shrink-0 flex flex-col h-[320px] md:h-auto md:min-h-[320px]"
              >
                <div
                  className={`h-full rounded-2xl overflow-hidden flex flex-col justify-between group border shadow-sm hover:shadow-md transition-colors duration-200 ${
                    isSandstone
                      ? 'bg-transparent border border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                      : 'bg-transparent border border-white/10 hover:border-[#FF6B00]/40 text-chalk'
                  }`}
                >
                  <div className="h-36 overflow-hidden relative flex-shrink-0 w-full">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${gym.image})` }}
                    />
                    <div className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/15 flex items-center gap-1 text-xs shadow-md">
                      <Star size={11} className="text-[#FF6B00] fill-[#FF6B00]" />
                      <span className="font-bold text-chalk">{gym.rating}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="min-h-[40px]">
                        <h3 className={`font-bold text-base truncate transition-colors duration-200 ${
                          isSandstone ? 'text-[#1a1815] group-hover:underline' : 'text-chalk group-hover:text-[#FF6B00]'
                        }`}>
                          {gym.name}
                        </h3>
                        <div className={`flex items-center gap-1 text-xs font-light truncate ${
                          isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                        }`}>
                          <MapPin size={11} className="flex-shrink-0" />
                          <span className="truncate">{gym.city}</span>
                        </div>
                      </div>

                      <div className={`flex items-center justify-between text-xs pt-2 border-t mt-2 ${
                        isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
                      }`}>
                        <span className={`font-light ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>Starts from</span>
                        <span className="font-bold font-mono text-[#FF6B00]">
                          Rp {(gym.pricePerSession ?? 0).toLocaleString('en-US')}/session
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 mt-auto flex-shrink-0">
                      <Link
                        href={`/gyms/${gym.id}`}
                        className="w-full h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all bg-[#FF6B00] text-white hover:bg-[#E5601F] shadow-sm"
                      >
                        <span>Book Gym Pass</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button: Yes */}
          <div className="flex justify-end pt-2">
            <Link
              href="/gyms"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all shadow-sm"
            >
              <span>Discover More Gyms</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* PINK DIVIDER LINE */}
        <div className="border-t border-[#F90657]/30" />

        {/* ============================================================ */}
        {/* ITEM 7: COMMUNITY (V1.0 ACTIVE)                              */}
        {/* Scope: Find friends, clubs, squads, share activities         */}
        {/* CTA Button: Yes                                              */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/community" className="group inline-block">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F90657] transition-opacity group-hover:opacity-80">
                  Community
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  V1.0
                </span>
              </div>
            </Link>
          </div>
          <p className={`text-xs md:text-sm font-light -mt-2 ${
            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
          }`}>
            Find friends, clubs or squads townhall of like minded people to get connected, share activities and updating latest projects.
          </p>

          {/* Mobile: Horizontal scrollable cards / Desktop: 3 cols */}
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 md:mx-0 md:px-0 items-stretch">
            {communities.map((comm) => (
              <div
                key={comm.id}
                className="w-72 md:w-auto flex-shrink-0 flex flex-col h-[340px] md:h-auto md:min-h-[340px]"
              >
                <div
                  className={`h-full rounded-2xl overflow-hidden flex flex-col justify-between group border shadow-sm hover:shadow-md transition-colors duration-200 ${
                    isSandstone
                      ? 'bg-transparent border border-[#1a1815]/20 hover:border-[#1a1815]/50 text-[#1a1815]'
                      : 'bg-transparent border border-white/10 hover:border-[#FF6B00]/40 text-chalk'
                  }`}
                >
                  <div className="h-36 overflow-hidden relative flex-shrink-0 w-full">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${comm.image})` }}
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 min-h-[40px]">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-base truncate transition-colors duration-200 ${
                            isSandstone ? 'text-[#1a1815] group-hover:text-black' : 'text-chalk group-hover:text-[#FF6B00]'
                          }`}>
                            {comm.name}
                          </h3>
                          <div className={`flex items-center gap-1 text-xs font-light truncate ${
                            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                          }`}>
                            <MapPin size={11} className="flex-shrink-0" />
                            <span className="truncate">{comm.city}, {comm.province}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-ash flex-shrink-0">
                          <Users size={12} className="text-[#06B6D4]" />
                          <span>{comm.memberCount} members</span>
                        </div>
                      </div>

                      <p className={`text-xs font-light line-clamp-2 leading-relaxed h-9 overflow-hidden mt-2 ${
                        isSandstone ? 'text-[#1a1815]/75' : 'text-slate-ash'
                      }`}>
                        {comm.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-auto flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedJoinCommunity(comm)}
                        className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all bg-[#FF6B00] text-white hover:bg-[#E5601F] shadow-sm"
                      >
                        <UserPlus size={14} /> Request to Join
                      </button>
                      <a
                        href={comm.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-[#E1306C]/40 text-[#E1306C] hover:bg-[#E1306C]/10"
                      >
                        <Instagram size={14} /> Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button: Yes */}
          <div className="flex justify-end pt-2">
            <Link
              href="/community"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all shadow-sm"
            >
              <span>Discover More Community</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* PINK DIVIDER LINE */}
        <div className="border-t border-[#F90657]/30" />

        {/* ============================================================ */}
        {/* ITEM 8, 9, 10, 11: PLATFORM HUB & ROADMAP (V1.0 - V5.0)      */}
        {/* 8. Personal Account (Yes) | 9. Settings (Yes)                */}
        {/* 10. Shop (Not Yet - V4.0) | 11. Event (Not Yet - V3.0)       */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#F90657]">
                Jalur Platform Hub
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                Staged V1.0 – V5.0
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* 8. Personal Account (CTA Button: Yes) */}
            <Link
              href="/account"
              className={`p-5 rounded-2xl border flex flex-col justify-between group transition-all hover:-translate-y-0.5 ${
                isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00]">
                    <User size={16} />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                    V1.0 Live
                  </span>
                </div>
                <h4 className="font-bold text-sm group-hover:text-[#FF6B00] transition-colors">
                  Personal Account
                </h4>
                <p className="text-[11px] opacity-70 mt-1 font-light">
                  Personal page with records of experience, transaction wallet, gear collection.
                </p>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/10 mt-3 flex items-center justify-between text-xs font-bold text-[#FF6B00]">
                <span>Open Account</span>
                <ChevronRight size={13} />
              </div>
            </Link>

            {/* 9. Settings (CTA Button: Yes) */}
            <Link
              href="/settings"
              className={`p-5 rounded-2xl border flex flex-col justify-between group transition-all hover:-translate-y-0.5 ${
                isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F90657]/15 flex items-center justify-center text-[#F90657]">
                    <SettingsIcon size={16} />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                    V1.0 Live
                  </span>
                </div>
                <h4 className="font-bold text-sm group-hover:text-[#F90657] transition-colors">
                  Settings & Policies
                </h4>
                <p className="text-[11px] opacity-70 mt-1 font-light">
                  Page of general personalization (Theme, Grades) and platform regulations.
                </p>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/10 mt-3 flex items-center justify-between text-xs font-bold text-[#F90657]">
                <span>Manage Settings</span>
                <ChevronRight size={13} />
              </div>
            </Link>

            {/* 11. Event (CTA Button: Not Yet - V3.0) */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between opacity-75 relative overflow-hidden ${
              isSandstone ? 'bg-[#f4efe6]/60 border-[#1a1815]/10' : 'bg-[#181D22]/60 border-white/5'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                    <Clock size={16} />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    V3.0 Roadmap
                  </span>
                </div>
                <h4 className="font-bold text-sm text-chalk">
                  Events & Comp
                </h4>
                <p className="text-[11px] opacity-70 mt-1 font-light">
                  Competitions, workshops, exhibitions & bouldering conferences.
                </p>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/10 mt-3 flex items-center justify-between text-[11px] font-medium opacity-60">
                <span>Coming in V3.0</span>
                <Lock size={12} />
              </div>
            </div>

            {/* 10. Shop (CTA Button: Not Yet - V4.0) */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between opacity-75 relative overflow-hidden ${
              isSandstone ? 'bg-[#f4efe6]/60 border-[#1a1815]/10' : 'bg-[#181D22]/60 border-white/5'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
                    <Layers size={16} />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    V4.0 Roadmap
                  </span>
                </div>
                <h4 className="font-bold text-sm text-chalk">
                  Jalur Collab Shop
                </h4>
                <p className="text-[11px] opacity-70 mt-1 font-light">
                  Special collection from Jalur in collaborations with curated brands.
                </p>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/10 mt-3 flex items-center justify-between text-[11px] font-medium opacity-60">
                <span>Coming in V4.0</span>
                <Lock size={12} />
              </div>
            </div>
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
              userId: user?.id || 'user-1',
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
              climberName: data.climberName || user?.name || 'Ahmad Rizki',
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
