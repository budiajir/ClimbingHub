'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Lock,
  Plus,
  Share2,
  MapPin,
  Layers,
  CheckCircle2,
  Compass,
  Camera,
  Phone,
  Mountain,
  Award,
  Trash2,
  Send,
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'
import { isGrantedRouteSetter } from '@/lib/permissions'
import { useCragRegions } from '@/lib/use-data'
import { getDraftProblems, deleteDraftProblem, type DraftProblemItem } from '@/lib/draft-problems-store'
import { addCommunityPost } from '@/lib/community-posts-store'
import type { Problem, CragRegion, Sector } from '@/lib/mock-data'
import AddRouteModal from '@/components/beta/AddRouteModal'
import ShareLinkModal from '@/components/common/ShareLinkModal'

interface PublishedRouteAnnouncement {
  id: string
  name: string
  cragName: string
  sectorName: string
  discipline: string
  grade: string
  rockProfile: string
  localContact: string
  imageUrl?: string
  publishedAt: string
  announcedToWall?: boolean
}

const PUBLISHED_STORAGE_KEY = 'jalur_published_routes_v1'

const DEFAULT_ANNOUNCEMENTS: PublishedRouteAnnouncement[] = [
  {
    id: 'pub-1',
    name: 'Tebing Timur Overhang',
    cragName: 'Citatah 125 & 90',
    sectorName: 'Sector A — Main Wall',
    discipline: 'sport',
    grade: '5.11d',
    rockProfile: 'Karst Limestone',
    localContact: 'Andi Wahyu (+62812-3456-7890)',
    imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    publishedAt: '2026-11-10',
  },
]

const FORM_FIELDS_CHECKLIST = [
  { label: 'Topo', desc: 'Interactive S / B / P / T route line mapping', icon: Compass },
  { label: 'Upload Photo', desc: 'Wall texture, holds & approach photography', icon: Camera },
  { label: 'Route Data', desc: 'Discipline, pitches, bolts, anchor & FA credits', icon: Layers },
  { label: 'Crags Location', desc: 'Existing crag & sector or create new site', icon: MapPin },
  { label: 'Contact', desc: 'Local guide, ranger or caretaker number', icon: Phone },
  { label: 'Rock Profile', desc: 'Limestone, Granite, Andesite, Basalt & Sandstone', icon: Mountain },
  { label: 'Grade', desc: 'YDS, French Sport & V-Scale Font conversion', icon: Award },
]

export default function SetRoutePage() {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const { role, user, openAuthModal } = useAuth()
  const { cragRegions, setCragRegions } = useCragRegions()
  const hasSetterAccess = isGrantedRouteSetter(role, user)

  const [showFormModal, setShowFormModal] = useState(false)
  const [drafts, setDrafts] = useState<DraftProblemItem[]>([])
  const [publishedRoutes, setPublishedRoutes] = useState<PublishedRouteAnnouncement[]>([])
  const [shareTarget, setShareTarget] = useState<{
    title: string
    subtitle: string
    url: string
  } | null>(null)
  const [sharePageOpen, setSharePageOpen] = useState(false)

  useEffect(() => {
    setDrafts(getDraftProblems())
    const syncDrafts = () => setDrafts(getDraftProblems())
    window.addEventListener('draft-problems-updated', syncDrafts)

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(PUBLISHED_STORAGE_KEY)
        if (!raw) {
          localStorage.setItem(PUBLISHED_STORAGE_KEY, JSON.stringify(DEFAULT_ANNOUNCEMENTS))
          setPublishedRoutes(DEFAULT_ANNOUNCEMENTS)
        } else {
          const parsed = JSON.parse(raw)
          setPublishedRoutes(Array.isArray(parsed) ? parsed : DEFAULT_ANNOUNCEMENTS)
        }
      } catch {
        setPublishedRoutes(DEFAULT_ANNOUNCEMENTS)
      }
    }

    return () => window.removeEventListener('draft-problems-updated', syncDrafts)
  }, [])

  const persistPublished = (items: PublishedRouteAnnouncement[]) => {
    setPublishedRoutes(items)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PUBLISHED_STORAGE_KEY, JSON.stringify(items))
      } catch {
        // ignore storage errors
      }
    }
  }

  const handleAddRoute = (
    newProblem: Problem,
    regionId: string,
    sectorId: string,
    newRegionData?: { name: string; province: string; image?: string },
    newSectorData?: { name: string; image?: string }
  ) => {
    const fallbackImg =
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80'
    let resolvedCragName = cragRegions.find(r => r.id === regionId)?.name || 'New Crag'
    let resolvedSectorName = 'New Sector'

    setCragRegions((prev: CragRegion[]) => {
      if (newRegionData) {
        resolvedCragName = newRegionData.name
        resolvedSectorName = newSectorData?.name || 'Sector 1'
        const regionImg = newRegionData.image || fallbackImg
        const newSector: Sector = {
          id: sectorId,
          name: resolvedSectorName,
          image: newSectorData?.image || regionImg,
          problems: [newProblem],
        }
        const createdRegion: CragRegion = {
          id: regionId,
          name: newRegionData.name,
          province: newRegionData.province,
          image: regionImg,
          sectorCount: 1,
          problemCount: 1,
          sectors: [newSector],
        }
        return [createdRegion, ...prev]
      }

      return prev.map(reg => {
        if (reg.id !== regionId) return reg
        resolvedCragName = reg.name
        const exists = reg.sectors.some(s => s.id === sectorId)
        if (!exists && newSectorData) {
          resolvedSectorName = newSectorData.name
          const addedSec: Sector = {
            id: sectorId,
            name: resolvedSectorName,
            image: newSectorData.image || reg.image || fallbackImg,
            problems: [newProblem],
          }
          return {
            ...reg,
            sectorCount: reg.sectorCount + 1,
            problemCount: reg.problemCount + 1,
            sectors: [addedSec, ...reg.sectors],
          }
        }
        return {
          ...reg,
          problemCount: reg.problemCount + 1,
          sectors: reg.sectors.map(sec => {
            if (sec.id !== sectorId) return sec
            resolvedSectorName = sec.name
            return { ...sec, problems: [newProblem, ...sec.problems] }
          }),
        }
      })
    })

    const announcement: PublishedRouteAnnouncement = {
      id: `pub-${Date.now()}`,
      name: newProblem.name,
      cragName: resolvedCragName,
      sectorName: resolvedSectorName,
      discipline: newProblem.discipline,
      grade: newProblem.grade,
      rockProfile: newProblem.rockProfile || 'Karst Limestone',
      localContact: newProblem.localContact || 'Jalur Caretaker',
      imageUrl: newProblem.imageUrl,
      publishedAt: new Date().toISOString().split('T')[0],
      announcedToWall: false,
    }
    persistPublished([announcement, ...publishedRoutes])
  }

  const handleBroadcastAnnouncement = (item: PublishedRouteAnnouncement) => {
    addCommunityPost({
      id: `post-pub-${item.id}`,
      userId: user?.id || 'setter-1',
      userName: user?.name || 'Jalur Route Setter',
      userHandle: user?.handle || '@jalur.setter',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      hometown: item.cragName,
      timeAgo: 'Just now',
      activity: `New Route Created · ${item.name}`,
      location: `${item.cragName} · ${item.sectorName}`,
      grade: item.grade,
      caption: `Announcement: New ${item.discipline} route "${item.name}" (${item.rockProfile}) is now live! Caretaker contact: ${item.localContact}.`,
      image: item.imageUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
      likes: 1,
      hasLiked: true,
      authorType: 'climber',
      comments: [],
    })
    persistPublished(
      publishedRoutes.map(p => (p.id === item.id ? { ...p, announcedToWall: true } : p))
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:px-6 lg:px-8 space-y-6 pb-16">
      {/* Header (Page Title, Description, Access Badge, Share Link) */}
      <div
        className={`flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b pb-4 ${
          isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <ShieldCheck size={12} /> Route Setters Access Only · Granted by Jalur
            </span>
          </div>
          <h1
            className={`font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight ${
              isSandstone ? 'text-[#1a1815]' : 'text-chalk'
            }`}
          >
            Set Route
          </h1>
          <p
            className={`text-xs md:text-sm font-light max-w-2xl ${
              isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
            }`}
          >
            Dedicated Route Setter submission studio — upload wall photos, draw interactive topo lines, set rock profiles, assign caretaker contacts, and publish verified route announcements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {hasSetterAccess ? (
            <button
              type="button"
              onClick={() => setShowFormModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E5601F] text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              <Plus size={15} /> Open Set Route Form
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                openAuthModal(
                  'Set Route is restricted to official Route Setters granted by Jalur.'
                )
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E5601F] text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              <Lock size={14} /> Sign In as Granted Route Setter
            </button>
          )}

          <button
            type="button"
            onClick={() => setSharePageOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
              isSandstone
                ? 'border-[#1a1815]/25 text-[#1a1815] hover:border-[#FF6B00]'
                : 'border-white/15 text-chalk hover:border-lime'
            }`}
          >
            <Share2 size={14} /> Share Link
          </button>
        </div>
      </div>

      {/* Role Gate Banner if Not Granted */}
      {!hasSetterAccess && (
        <div
          className={`rounded-3xl p-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isSandstone
              ? 'bg-amber-50 border-amber-300 text-[#1a1815]'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-100'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Lock size={20} className="text-amber-500" />
            </div>
            <div>
              <h2 className="font-bold text-base">
                Route Setter Access Only · Granted by Jalur
              </h2>
              <p className="text-xs opacity-80 mt-1 max-w-2xl leading-relaxed">
                Publishing new routes and topo data is limited to verified Route Setters &amp; Gym Managers granted permission by the Jalur team. Regular climbers can still log ascents on existing Problems or sign in with an approved Route Setter account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              openAuthModal(
                'Switch to an approved Route Setter or Gym Manager account granted by Jalur.'
              )
            }
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs shrink-0 hover:bg-amber-400 transition-colors"
          >
            Switch / Sign In
          </button>
        </div>
      )}

      {/* Set Route Form Data Architecture Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className={`font-bold text-lg ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
            Set Route Submission Specification
          </h2>
          {hasSetterAccess && (
            <button
              type="button"
              onClick={() => setShowFormModal(true)}
              className="text-xs font-bold text-[#FF6B00] hover:underline"
            >
              Launch Interactive Setter Studio →
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FORM_FIELDS_CHECKLIST.map((field) => {
            const Icon = field.icon
            return (
              <div
                key={field.label}
                className={`p-4 rounded-2xl border space-y-1.5 ${
                  isSandstone
                    ? 'bg-[#FFFDF9] border-[#E0D6C6] text-[#1a1815]'
                    : 'bg-[#1a1f24] border-white/10 text-chalk'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center">
                    <Icon size={15} />
                  </div>
                  <span className="font-bold text-sm">{field.label}</span>
                </div>
                <p className={`text-xs ${isSandstone ? 'text-[#524e48]' : 'text-white/65'}`}>
                  {field.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Publish Route Announcements Feed */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className={`font-bold text-lg ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
              Published Route Announcements
            </h2>
            <p className={`text-xs ${isSandstone ? 'text-[#524e48]' : 'text-white/60'}`}>
              Live announcement log of newly created routes — broadcast to Community Wall or share directly.
            </p>
          </div>
          <Link href="/beta" className="text-xs font-bold text-[#FF6B00] hover:underline">
            Browse Problems →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publishedRoutes.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl p-4 border flex flex-col justify-between gap-3 ${
                isSandstone
                  ? 'bg-[#FFFDF9] border-[#E0D6C6] text-[#1a1815]'
                  : 'bg-[#1a1f24] border-white/10 text-chalk'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={
                    item.imageUrl ||
                    'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&q=80'
                  }
                  alt={item.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-white/10"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      <CheckCircle2 size={10} /> New Route Created
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] font-bold">
                      {item.grade}
                    </span>
                  </div>
                  <h3 className="font-bold text-base truncate">{item.name}</h3>
                  <p className={`text-xs ${isSandstone ? 'text-[#524e48]' : 'text-white/65'}`}>
                    {item.cragName} · {item.sectorName}
                  </p>
                  <p className={`text-[11px] ${isSandstone ? 'text-[#7a746c]' : 'text-white/50'}`}>
                    Rock: {item.rockProfile} · Contact: {item.localContact} · {item.publishedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  disabled={item.announcedToWall}
                  onClick={() => handleBroadcastAnnouncement(item)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    item.announcedToWall
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      : 'bg-[#FF6B00] hover:bg-[#E5601F] text-white'
                  }`}
                >
                  <Send size={12} />
                  <span>
                    {item.announcedToWall ? 'Posted on Community Wall ✓' : 'Announce on Community Wall'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setShareTarget({
                      title: `${item.name} (${item.grade})`,
                      subtitle: `${item.cragName} · ${item.rockProfile}`,
                      url: '/beta',
                    })
                  }
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                    isSandstone
                      ? 'border-[#DDD3C4] text-[#1a1815] hover:border-[#FF6B00]'
                      : 'border-white/15 text-chalk hover:border-lime'
                  }`}
                >
                  <Share2 size={13} /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Saved Route Drafts for Setters */}
      {hasSetterAccess && drafts.length > 0 && (
        <section className="space-y-3">
          <h2 className={`font-bold text-lg ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
            Saved Route Drafts ({drafts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  isSandstone
                    ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                    : 'bg-[#1a1f24] border-white/10 text-chalk'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm truncate">{draft.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF6B00]/15 text-[#FF6B00] font-bold">
                      {draft.grade}
                    </span>
                  </div>
                  <p className={`text-xs ${isSandstone ? 'text-[#524e48]' : 'text-white/60'}`}>
                    {draft.cragName} · {draft.sectorName} ({draft.progressPercent}%)
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#FF6B00] text-white text-xs font-bold"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDraftProblem(draft.id)}
                    className="p-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    title="Delete Draft"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Set Route Modal */}
      <AnimatePresence>
        {showFormModal && (
          <AddRouteModal
            regionsList={cragRegions}
            onClose={() => setShowFormModal(false)}
            onAddRoute={handleAddRoute}
          />
        )}
      </AnimatePresence>

      {/* Share Modals */}
      <ShareLinkModal
        open={sharePageOpen || !!shareTarget}
        onClose={() => {
          setSharePageOpen(false)
          setShareTarget(null)
        }}
        title={shareTarget?.title || 'Jalur Set Route Studio'}
        subtitle={
          shareTarget?.subtitle ||
          'Route Setter studio for Topo, Wall Photos, Rock Profile & Grade publishing'
        }
        shareUrl={shareTarget?.url || '/set-route'}
        categoryLabel="Share Set Route"
      />
    </div>
  )
}
