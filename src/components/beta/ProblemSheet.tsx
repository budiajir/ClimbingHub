'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  AlertCircle,
  ThumbsUp,
  ExternalLink,
  Mountain,
  Layers,
  Compass,
  Plus,
  ShieldCheck,
  MapPin,
  Anchor,
  Hand,
  Calendar,
  CheckCircle2,
  Video,
  Share2,
  Eye,
  EyeOff,
  Wrench,
  ArrowDownToLine,
  Backpack,
  Navigation,
  Youtube,
  Copy,
  Check,
  MessageCircle,
  Send,
  UserCheck,
  Sparkles,
} from 'lucide-react'
import { Problem, TopoMarker, CragRegion } from '@/lib/mock-data'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'
import { isInWishlist, toggleWishlist } from '@/lib/wishlist-store'
import {
  isUserCheckedInAtCrag,
  checkInUserAtCrag,
  checkOutUserFromCrag,
  getCragCheckInCount,
} from '@/lib/crag-checkin-store'
import {
  getGradeEquivalence,
  getProblemPhotos,
  getDefaultRequiredEquipment,
  getDefaultDescendingDetails,
  getDefaultApproachingDetails,
  getDefaultBoltUpdateInfo,
} from '@/lib/problem-helpers'
import { QRCodeSVG } from 'qrcode.react'
import Pictogram from '@/components/common/Pictogram'

interface ProblemSheetProps {
  problem: Problem
  region?: CragRegion
  onLogAscent: () => void
  onSetNewRoute?: () => void
  onClose: () => void
}

function GradeBar({
  grade,
  votes,
  totalVotes,
  isSandstone,
}: {
  grade: string
  votes: number
  totalVotes: number
  isSandstone: boolean
}) {
  const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`font-mono w-10 text-right font-light ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
        {grade}
      </span>
      <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isSandstone ? 'bg-[#1a1815]/10' : 'bg-crag-light'}`}>
        <div
          className={`h-full rounded-full ${isSandstone ? 'bg-[#1a1815]' : 'bg-lime'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-mono w-8 text-right font-normal ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
        {pct}%
      </span>
    </div>
  )
}

export default function ProblemSheet({ problem, region, onLogAscent, onSetNewRoute, onClose }: ProblemSheetProps) {
  const { theme } = useTheme()
  const { user } = useAuth()
  const isSandstone = theme === 'sandstone'
  const [activeTab, setActiveTab] = useState<'specs' | 'topo' | 'beta' | 'access'>('topo')
  const [showTopo, setShowTopo] = useState(true)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const cragId = region?.id || `crag-${problem.id}`
  const cragDisplayName = region?.name || 'Climbing Crag'
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInCount, setCheckInCount] = useState(0)

  useEffect(() => {
    setWishlisted(isInWishlist(problem.id))
    const onUpdate = () => setWishlisted(isInWishlist(problem.id))
    window.addEventListener('wishlist-updated', onUpdate)
    return () => window.removeEventListener('wishlist-updated', onUpdate)
  }, [problem.id])

  useEffect(() => {
    setIsCheckedIn(isUserCheckedInAtCrag(cragId, user?.id || 'user-1'))
    setCheckInCount(getCragCheckInCount(cragId))
  }, [cragId, user?.id])

  useEffect(() => {
    setPhotoIdx(0)
    setShowTopo(true)
    setShowSharePanel(false)
  }, [problem.id])

  const totalVotes = (problem.gradeVotes || []).reduce((acc, v) => acc + v.votes, 0)

  // 1. Category
  const category =
    problem.category ||
    (problem.discipline === 'sport' || problem.discipline === 'lead'
      ? 'lead'
      : problem.discipline === 'multipitch' || problem.discipline === 'trad'
      ? 'trad'
      : 'boulder')

  const normalizedCategory: 'boulder' | 'lead' | 'trad' =
    category === 'lead' || category === 'trad' ? category : 'boulder'

  const yearSetDisplay = problem.yearSet || problem.faDate?.match(/\d{4}/)?.[0] || '2021'
  const gradeEq = getGradeEquivalence(problem.grade, problem.fontGrade)
  const categorizedPhotos = getProblemPhotos(problem, '/crags/citatah.jpg')
  const activePhotoObj = categorizedPhotos[photoIdx] || categorizedPhotos[0]
  const boltInfo = getDefaultBoltUpdateInfo(normalizedCategory, problem)
  const descendingInfo = getDefaultDescendingDetails(normalizedCategory, problem)
  const approachInfo = getDefaultApproachingDetails(problem, region)
  const requiredEquipment = getDefaultRequiredEquipment(normalizedCategory, problem)
  const etiquette = problem.climbingEtiquette || region?.climbingEtiquette || {
    governmentRegulations: [
      'Register at the local forestry / tourism counter and pay official crag retribution.',
      'Obtain necessary climbing permits for multi-pitch walls or conservation zones.',
    ],
    localNorms: [
      'Greet local residents & village caretakers politely; respect nearby prayer hours and village paths.',
      'Park only at official community parking spots and support local basecamp stalls.',
    ],
    environmentalRules: [
      'Strict Leave No Trace: carry out all trash, wrappers, tape, and micro-litter.',
      'Brush off excessive white chalk tick marks after sending.',
    ],
  }

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/beta?problem=${encodeURIComponent(problem.id)}`
      : `https://jalur.world/beta?problem=${encodeURIComponent(problem.id)}`
  const shareText = `Check out "${problem.name}" (${problem.grade}${gradeEq.font ? ` / ${gradeEq.font}` : ''}) on Jalur!`

  const handleToggleWishlist = () => {
    const next = toggleWishlist({
      id: problem.id,
      type: 'problem',
      title: problem.name,
      subtitle: `${problem.grade} · ${problem.discipline || 'Bouldering'}`,
      image: activePhotoObj?.url || problem.imageUrl || '/crags/citatah.jpg',
      location: cragDisplayName,
      grade: problem.grade,
      discipline: problem.discipline,
    })
    setWishlisted(next)
  }

  const handleToggleCheckIn = () => {
    if (isCheckedIn) {
      checkOutUserFromCrag(cragId, user?.id || 'user-1')
      setIsCheckedIn(false)
      setCheckInCount((prev) => Math.max(0, prev - 1))
    } else {
      checkInUserAtCrag(
        cragId,
        cragDisplayName,
        user?.id || 'user-1',
        user?.name || 'Ahmad Rizki Nugraha'
      )
      setIsCheckedIn(true)
      setCheckInCount((prev) => prev + 1)
    }
  }

  // 3. Setter + Tahun
  const setterDisplay = problem.setterYear || `${problem.setter || problem.fa || 'Local Climber'} (${problem.faDate || yearSetDisplay})`

  // 7. Tinggi Jalur
  const heightDisplay = problem.height || problem.pitchLength || problem.totalHeight || (category === 'boulder' ? '4.2m' : '22m')

  // 8. Titik + Jumlah Pegangan
  const holdsCountDisplay = problem.holdsCount || (problem.markers && problem.markers.length > 0 ? problem.markers.length * 3 : 14)
  const holdDetailsDisplay =
    problem.holdDetails ||
    (category === 'boulder'
      ? 'Dual crimp sit start, balance footwork to undercling crux, jug top-out'
      : 'Positive crimp sequence leading to rest pocket, crimpy headwall to ring anchor')

  // 9. Jumlah Anchor (lead)
  const isLeadOrTrad = category === 'lead' || category === 'trad' || problem.discipline === 'sport' || problem.discipline === 'multipitch'
  const anchorCountDisplay = problem.anchorCount || problem.boltCount || (isLeadOrTrad ? 9 : undefined)
  const anchorTypeDisplay = problem.anchorType || (isLeadOrTrad ? 'Double Ring Stainless Chain Anchor' : 'N/A (Bouldering Crashpad landing)')

  const tabs: { key: 'specs' | 'topo' | 'beta' | 'access'; label: string }[] = [
    { key: 'topo', label: 'Photo & Topo' },
    { key: 'specs', label: 'Specs & Grade' },
    { key: 'beta', label: 'Beta & Video' },
    { key: 'access', label: 'Approach & Etiquette' },
  ]

  // Topo marker style helper
  const markerColors: Record<string, { bg: string; text: string; label: string }> = {
    S: { bg: '#CCFF00', text: '#12161A', label: 'Start' },
    B: { bg: '#06B6D4', text: '#12161A', label: 'Hanger' },
    H: { bg: '#06B6D4', text: '#12161A', label: 'Hanger' },
    Z: { bg: '#FE7733', text: '#FFFFFF', label: 'Crux' },
    P: { bg: '#A855F7', text: '#FFFFFF', label: 'Pitch' },
    T: { bg: '#EF4444', text: '#FFFFFF', label: 'Top' },
  }

  const markers = problem.markers || [
    { id: 'm-1', type: 'S' as const, x: 25, y: 82, label: 'Start' },
    { id: 'm-2', type: 'Z' as const, x: 42, y: 52, label: 'Crux' },
    { id: 'm-3', type: 'T' as const, x: 60, y: 18, label: 'Top' },
  ]

  return (
    <motion.div
      className={`fixed bottom-0 left-0 right-0 rounded-t-3xl border-t z-40 overflow-hidden shadow-2xl transition-colors ${
        isSandstone
          ? 'bg-[#fbf7ee] text-[#1a1815] border-[#1a1815]/20'
          : 'bg-[#23262C] text-chalk border-white/10'
      }`}
      style={{ maxHeight: '88vh' }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className={`w-12 h-1.5 rounded-full ${isSandstone ? 'bg-[#1a1815]/20' : 'bg-white/20'}`} />
      </div>

      {/* Header: Category, Nama Jalur, Setter + Tahun, Grade */}
      <div className="px-4 md:px-6 pt-1 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* 1. Category Badge & 6. Grade Jalur */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                  category === 'lead'
                    ? isSandstone
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    : category === 'trad'
                    ? isSandstone
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : isSandstone
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-lime/20 text-lime border-lime/30'
                }`}
              >
                {category === 'lead' ? (
                  <Mountain size={11} />
                ) : category === 'trad' ? (
                  <Layers size={11} />
                ) : (
                  <Compass size={11} />
                )}
                {category.toUpperCase()} ROUTE
              </span>

              {/* 6. Grade Jalur */}
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                  isSandstone
                    ? 'bg-white text-[#1a1815] border-[#1a1815]/20 shadow-sm'
                    : 'bg-crag text-chalk border-white/10'
                }`}
              >
                {problem.grade} {problem.fontGrade ? `(${problem.fontGrade})` : ''}
              </span>
            </div>

            {/* 2. Nama Jalur */}
            <h3 className={`font-bold text-xl leading-tight truncate ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
              {problem.name}
            </h3>

            {/* 3. Route Setter + Tahun & Link to Full Topo */}
            <div className="flex items-center gap-3 flex-wrap mt-0.5">
              <p className={`text-xs font-light ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>
                Setter: <span className="font-medium">{setterDisplay}</span>
              </p>
              <Link
                href={`/beta?problem=${problem.id}`}
                className="text-xs font-bold text-[#FF6B00] hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Topo Fullscreen</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${
              isSandstone
                ? 'bg-[#1a1815]/5 hover:bg-[#1a1815]/10 text-[#1a1815]'
                : 'bg-white/10 hover:bg-white/20 text-chalk'
            }`}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Spec Strip: Height, Holds, Anchor / Protection */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-dashed border-current/15 text-center">
          <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-white/60 border-[#1a1815]/10' : 'bg-crag/50 border-white/5'}`}>
            <div className={`text-[10px] uppercase font-light ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
              Route Height
            </div>
            <div className={`text-sm font-bold font-mono mt-0.5 ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
              {heightDisplay}
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-white/60 border-[#1a1815]/10' : 'bg-crag/50 border-white/5'}`}>
            <div className={`text-[10px] uppercase font-light ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
              Holds & Grip
            </div>
            <div className={`text-sm font-bold font-mono mt-0.5 ${isSandstone ? 'text-[#1a1815]' : 'text-cyan-400'}`}>
              ~{holdsCountDisplay} Holds
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-white/60 border-[#1a1815]/10' : 'bg-crag/50 border-white/5'}`}>
            <div className={`text-[10px] uppercase font-light ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
              Anchor / Protection
            </div>
            <div className={`text-sm font-bold font-mono mt-0.5 truncate ${isSandstone ? 'text-[#1a1815]' : 'text-lime'}`}>
              {isLeadOrTrad ? `${anchorCountDisplay} Bolts` : 'Crashpad'}
            </div>
          </div>
        </div>

        {/* Action Bar: Check In Crag, Save to Wishlist, Share Link */}
        <div className="flex items-center gap-2 flex-wrap mt-2.5">
          <button
            type="button"
            onClick={handleToggleCheckIn}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
              isCheckedIn
                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                : isSandstone
                ? 'bg-[#059669]/10 text-[#047857] border-[#059669]/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30'
            }`}
          >
            {isCheckedIn ? <CheckCircle2 size={13} /> : <MapPin size={13} />}
            <span>{isCheckedIn ? 'Checked In' : 'Check In Crag'}</span>
            {checkInCount > 0 && (
              <span className="px-1.5 rounded-full bg-black/20 font-mono text-[10px]">
                {checkInCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
              wishlisted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'border-[#FF6B00]/50 text-[#FF6B00] hover:bg-[#FF6B00]/10'
            }`}
          >
            <Pictogram
              name={wishlisted ? 'wishlisted' : 'wishlist'}
              size={13}
              className={wishlisted ? 'text-rose-400' : 'text-[#FF6B00]'}
            />
            <span>{wishlisted ? 'Wishlisted' : 'Wishlist'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSharePanel((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
              showSharePanel
                ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                : isSandstone
                ? 'border-[#1a1815]/20 text-[#1a1815] hover:bg-black/5'
                : 'border-white/15 text-chalk hover:bg-white/5'
            }`}
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
        </div>

        {/* Inline Share Link Panel (QR, Copy URL, WhatsApp, Telegram) */}
        {showSharePanel && (
          <div
            className={`mt-2.5 p-3 rounded-2xl border space-y-2.5 ${
              isSandstone ? 'bg-white border-[#1a1815]/15' : 'bg-crag border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-white flex-shrink-0">
                <QRCodeSVG value={shareUrl} size={64} />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className={`flex-1 min-w-0 px-2.5 py-1.5 rounded-lg text-[11px] font-mono border outline-none ${
                      isSandstone
                        ? 'bg-black/5 border-[#1a1815]/15 text-[#1a1815]'
                        : 'bg-black/30 border-white/15 text-chalk'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareUrl)
                        setCopiedLink(true)
                        setTimeout(() => setCopiedLink(false), 2000)
                      } catch {
                        // ignore
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#FF6B00] text-white text-[11px] font-bold flex items-center gap-1 flex-shrink-0"
                  >
                    {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                  >
                    <MessageCircle size={12} />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 text-white text-[11px] font-bold"
                  >
                    <Send size={12} />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className={`flex px-4 md:px-6 gap-2 border-b overflow-x-auto no-scrollbar ${
        isSandstone ? 'border-[#1a1815]/10 bg-[#1a1815]/5' : 'border-white/5 bg-crag/30'
      }`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-xs transition-all touch-ripple flex-shrink-0 font-medium ${
              activeTab === tab.key
                ? isSandstone
                  ? 'text-[#1a1815] border-b-2 border-[#1a1815] font-bold'
                  : 'text-lime border-b-2 border-lime font-bold'
                : isSandstone
                ? 'text-[#1a1815]/60 hover:text-[#1a1815]'
                : 'text-slate-ash hover:text-chalk'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="overflow-y-auto px-4 md:px-6 py-4" style={{ maxHeight: 'calc(88vh - 290px)' }}>
        <AnimatePresence mode="wait">
          {/* TAB 1: SPECS, GRADE EQUIVALENCE, BOLTS, DESCENDING & EQUIPMENT */}
          {activeTab === 'specs' && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Grade Equivalence Chart */}
              <div className={`p-3.5 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                    Grade Equivalence Chart
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00]">
                    {gradeEq.levelLabel}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-black/5 border-[#1a1815]/10' : 'bg-granite border-white/5'}`}>
                    <div className="text-[9px] uppercase font-bold opacity-60">Boulder (V-Scale)</div>
                    <div className="text-xs font-mono font-bold mt-0.5">{gradeEq.vScale}</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-black/5 border-[#1a1815]/10' : 'bg-granite border-white/5'}`}>
                    <div className="text-[9px] uppercase font-bold opacity-60">Fontainebleau</div>
                    <div className="text-xs font-mono font-bold mt-0.5">{gradeEq.font}</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-black/5 border-[#1a1815]/10' : 'bg-granite border-white/5'}`}>
                    <div className="text-[9px] uppercase font-bold opacity-60">YDS (Rope)</div>
                    <div className="text-xs font-mono font-bold mt-0.5">{gradeEq.yds}</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-black/5 border-[#1a1815]/10' : 'bg-granite border-white/5'}`}>
                    <div className="text-[9px] uppercase font-bold opacity-60">French Sport</div>
                    <div className="text-xs font-mono font-bold mt-0.5">{gradeEq.french}</div>
                  </div>
                </div>
              </div>

              {/* Year Set & Updated Bolts Record */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">
                    <Calendar size={12} />
                    <span>Year of Route Setted</span>
                  </div>
                  <div className="text-base font-black font-mono">{yearSetDisplay}</div>
                  <p className="text-[11px] opacity-70 mt-0.5">FA: {problem.fa}</p>
                </div>
                <div className={`p-3 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">
                    <Wrench size={12} />
                    <span>Year of Updated Bolts</span>
                  </div>
                  <div className={`text-base font-black font-mono ${boltInfo.isBolted ? 'text-emerald-500' : 'opacity-80'}`}>
                    {boltInfo.year}
                  </div>
                  <p className="text-[11px] opacity-75 mt-0.5 leading-snug">{boltInfo.notes}</p>
                </div>
              </div>

              {/* Descending Details */}
              <div className={`p-3.5 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <ArrowDownToLine size={14} className={isSandstone ? 'text-[#1a1815]' : 'text-cyan-400'} />
                    <span className="text-xs font-bold uppercase tracking-wider">Descending Details</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400">
                    {descendingInfo.method}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${isSandstone ? 'text-[#1a1815]/85' : 'text-chalk/85'}`}>
                  {descendingInfo.description}
                </p>
              </div>

              {/* Required Safety Equipment */}
              <div className={`p-3.5 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Backpack size={14} className="text-[#FF6B00]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Required Equipment (Types &amp; Sizes)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requiredEquipment.map((eq, i) => (
                    <div
                      key={`${eq.item}-${i}`}
                      className={`p-2 rounded-xl border text-xs ${
                        isSandstone ? 'bg-black/5 border-[#1a1815]/10' : 'bg-granite border-white/5'
                      }`}
                    >
                      <div className="font-bold">{eq.item}</div>
                      <div className="text-[11px] font-mono opacity-75">{eq.spec}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route Description */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                  isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                }`}>
                  Route Characteristics &amp; Description
                </h4>
                <p className={`text-sm font-normal leading-relaxed ${isSandstone ? 'text-[#1a1815]/85' : 'text-chalk/85'}`}>
                  {problem.description || 'Challenging outdoor climbing route featuring natural rock characteristics and technical sequencing.'}
                </p>
              </div>

              {/* Holds Details */}
              <div className={`p-3.5 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Hand size={15} className={isSandstone ? 'text-[#1a1815]' : 'text-cyan-400'} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
                    Holds &amp; Grip Details
                  </span>
                </div>
                <p className={`text-xs leading-relaxed mb-2 ${isSandstone ? 'text-[#1a1815]/80' : 'text-slate-ash'}`}>
                  {holdDetailsDisplay}
                </p>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className={`px-2 py-0.5 rounded ${isSandstone ? 'bg-[#1a1815]/5 text-[#1a1815]' : 'bg-granite text-chalk'}`}>
                    Total Holds: ~{holdsCountDisplay} Holds
                  </span>
                  <span className={`px-2 py-0.5 rounded ${isSandstone ? 'bg-[#1a1815]/5 text-[#1a1815]' : 'bg-granite text-chalk'}`}>
                    Start: {problem.startType || (category === 'boulder' ? 'Sit Start (SS)' : 'Ground Stand')}
                  </span>
                </div>
              </div>

              {/* Anchor / Protection Details */}
              <div className={`p-3.5 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Anchor size={15} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
                    Anchors &amp; Protection
                  </span>
                </div>
                {isLeadOrTrad ? (
                  <div className="space-y-1.5 text-xs">
                    <p className={isSandstone ? 'text-[#1a1815]/85' : 'text-chalk/85'}>
                      <span className="font-bold">Bolts / Hangers:</span> {anchorCountDisplay} stainless expansion bolt protection points.
                    </p>
                    <p className={isSandstone ? 'text-[#1a1815]/85' : 'text-chalk/85'}>
                      <span className="font-bold">Top Anchor Type:</span> {anchorTypeDisplay}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    <p className={isSandstone ? 'text-[#1a1815]/85' : 'text-chalk/85'}>
                      <span className="font-bold">Landing Zone:</span> {problem.landingQuality || 'Flat dirt & grass'}.
                    </p>
                    <p className={isSandstone ? 'text-[#1a1815]/85' : 'text-chalk/85'}>
                      <span className="font-bold">Crashpad Recommendation:</span> {problem.padRecommendation || 'Minimum 2 crashpads & 1 spotter'}.
                    </p>
                  </div>
                )}
              </div>

              {/* Consensus Grade Votes */}
              <div className={`p-3.5 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <ThumbsUp size={13} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
                    <span className={`text-xs font-light ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>
                      Community Grade Consensus
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
                    {problem.ascentCount || 0} Recorded Ascents
                  </span>
                </div>
                <div className="space-y-1.5">
                  {(problem.gradeVotes || []).map((v) => (
                    <GradeBar
                      key={v.grade}
                      grade={v.grade}
                      votes={v.votes}
                      totalVotes={totalVotes}
                      isSandstone={isSandstone}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: CATEGORIZED PHOTOS & INTERACTIVE TOPO */}
          {activeTab === 'topo' && (
            <motion.div
              key="topo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* Categorized Photo Switcher Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {categorizedPhotos.map((photo, idx) => (
                  <button
                    key={photo.label}
                    type="button"
                    onClick={() => {
                      setPhotoIdx(idx)
                      setShowTopo(idx === 0)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all flex-shrink-0 ${
                      photoIdx === idx
                        ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                        : isSandstone
                        ? 'bg-black/5 border-[#1a1815]/15 text-[#1a1815]/75'
                        : 'bg-white/5 border-white/10 text-chalk/75'
                    }`}
                  >
                    {photo.label}
                  </button>
                ))}
              </div>

              {/* Photo & Topo Canvas */}
              <div className={`relative rounded-2xl overflow-hidden border aspect-[4/3] bg-black ${
                isSandstone ? 'border-[#1a1815]/20' : 'border-white/10'
              }`}>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${activePhotoObj?.url || problem.imageUrl || '/crags/citatah.jpg'})` }}
                />
                <div className="absolute inset-0 bg-black/25" />

                {/* Topo Overlay Toggle Button inside Photo */}
                <button
                  type="button"
                  onClick={() => setShowTopo((prev) => !prev)}
                  className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-bold border border-white/20"
                >
                  {showTopo ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{showTopo ? 'Topo: ON' : 'Topo: OFF'}</span>
                </button>

                {/* Topo Jalur SVG Route Line */}
                {showTopo && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                    <polyline
                      points={markers.map((m) => `${m.x}%,${m.y}%`).join(' ')}
                      fill="none"
                      stroke={isSandstone ? '#1a1815' : '#FE7733'}
                      strokeWidth="3.5"
                      strokeDasharray="6 3"
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
                    />
                  </svg>
                )}

                {/* Topo Markers Overlay */}
                {showTopo && markers.map((m, idx) => {
                  const mStyle = markerColors[m.type] || markerColors.B
                  return (
                    <div
                      key={m.id || idx}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-20 group"
                      style={{ left: `${m.x}%`, top: `${m.y}%` }}
                    >
                      <div
                        className="w-6 h-6 rounded-full font-mono font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-lg"
                        style={{ backgroundColor: mStyle.bg, color: mStyle.text }}
                      >
                        {m.type}
                      </div>
                      <span className="absolute -bottom-5 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {m.label || mStyle.label} ({m.x}%, {m.y}%)
                      </span>
                    </div>
                  )
                })}

                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white flex items-center gap-2">
                  <span>S = Start</span>
                  {category === 'boulder' && <span>Z = Crux</span>}
                  {isLeadOrTrad && <span>H = Hanger</span>}
                  {category === 'trad' && <span>P = Pitch</span>}
                  <span>T = Top</span>
                </div>
              </div>

              {activePhotoObj?.caption && (
                <p className={`text-[11px] px-3 py-2 rounded-xl border ${
                  isSandstone ? 'bg-white border-[#1a1815]/10 text-[#1a1815]/80' : 'bg-crag border-white/5 text-slate-ash'
                }`}>
                  <strong className="text-[#FF6B00] mr-1">{activePhotoObj.label}:</strong>
                  {activePhotoObj.caption}
                </p>
              )}

              {/* Marker Points Breakdown */}
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'
              }`}>
                <div className={`font-bold uppercase tracking-wider text-[11px] mb-1 ${
                  isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                }`}>
                  Topo Markers Sequence
                </div>
                {markers.map((m, idx) => (
                  <div key={m.id || idx} className="flex items-center justify-between py-0.5 border-b border-current/10 last:border-0">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full text-[9px] font-mono font-bold flex items-center justify-center"
                        style={{
                          backgroundColor: (markerColors[m.type] || markerColors.B).bg,
                          color: (markerColors[m.type] || markerColors.B).text,
                        }}
                      >
                        {m.type}
                      </span>
                      <span className={isSandstone ? 'text-[#1a1815]' : 'text-chalk'}>
                        {m.label || (markerColors[m.type] || markerColors.B).label}
                      </span>
                    </span>
                    <span className={`font-mono text-[10px] ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
                      Coord: {m.x}%, {m.y}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: BETA (CRUX & JALUR YOUTUBE VIDEO) */}
          {activeTab === 'beta' && (
            <motion.div
              key="beta"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Beta Sequence Text */}
              <div className={`p-4 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSandstone ? 'text-[#1a1815]' : 'text-lime'}`}>
                    Crux Sequence &amp; Beta Tips
                  </span>
                </div>
                <p className={`text-sm leading-relaxed font-normal ${isSandstone ? 'text-[#1a1815]/90' : 'text-chalk/90'}`}>
                  {problem.betaText ||
                    'The crux of this route is at the 4th move transition. Place a high heel hook on the left arête, execute a precise deadpoint to a micro crimp with your right hand, engage your core, and shift feet onto the small ledge.'}
                </p>
              </div>

              {/* Beta Video Player / Jalur YouTube Embed */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Youtube size={15} className="text-red-500" />
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${
                      isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
                    }`}>
                      Beta Video · Jalur Official YouTube
                    </h4>
                  </div>
                  <a
                    href={problem.betaVideoUrl ? problem.betaVideoUrl.replace('/embed/', '/watch?v=') : 'https://www.youtube.com/@JalurClimbing'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-red-500 hover:underline inline-flex items-center gap-1"
                  >
                    <span>@JalurClimbing</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                {problem.betaVideoUrl ? (
                  <div className="rounded-2xl overflow-hidden aspect-video border border-current/15 shadow-lg bg-black">
                    <iframe
                      src={problem.betaVideoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title={`Jalur Official YouTube Beta - ${problem.name}`}
                    />
                  </div>
                ) : (
                  <div className={`aspect-video rounded-2xl border flex flex-col items-center justify-center gap-2.5 p-4 text-center ${
                    isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'
                  }`}>
                    <Youtube size={32} className="text-red-500" />
                    <p className={`text-xs ${isSandstone ? 'text-[#1a1815]/75' : 'text-slate-ash'}`}>
                      Linked to Jalur YouTube Channel (@JalurClimbing). Official send reference video coming soon.
                    </p>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <a
                        href={`https://www.youtube.com/results?search_query=Jalur+Climbing+${encodeURIComponent(problem.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        <Youtube size={13} /> Open Jalur YouTube
                      </a>
                      <button
                        onClick={onLogAscent}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          isSandstone ? 'bg-[#1a1815] text-white hover:bg-black' : 'bg-lime text-granite hover:bg-lime-dim'
                        }`}
                      >
                        <Video size={12} /> Log Ascent &amp; Upload Beta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: APPROACHING PROBLEMS & CLIMBING ETIQUETTE */}
          {activeTab === 'access' && (
            <motion.div
              key="access"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* Approaching Problems */}
              <div className={`p-3.5 rounded-2xl border space-y-2.5 ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Navigation size={14} className="text-[#FF6B00]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Approaching Problems</span>
                  </div>
                  {approachInfo.gmapsUrl && (
                    <a
                      href={approachInfo.gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#FF6B00] text-white inline-flex items-center gap-1"
                    >
                      <MapPin size={11} /> Maps
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-black/5 border-[#1a1815]/10' : 'bg-granite border-white/5'}`}>
                    <span className="text-[10px] font-bold uppercase text-[#FF6B00] block">Meeting Point</span>
                    <span className="opacity-85">{approachInfo.fromMeetingPoint}</span>
                  </div>
                  <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-black/5 border-[#1a1815]/10' : 'bg-granite border-white/5'}`}>
                    <span className="text-[10px] font-bold uppercase text-cyan-400 block">Parking Spot</span>
                    <span className="opacity-85">{approachInfo.fromParkingSpot}</span>
                  </div>
                </div>
                <ol className="space-y-1 text-xs">
                  {approachInfo.pointToPointSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="opacity-85">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 3-Pillar Climbing Etiquette */}
              <div className="grid grid-cols-1 gap-2.5">
                <div className={`p-3 rounded-2xl border ${isSandstone ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-project/10 border-project/20 text-chalk'}`}>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-project mb-1">
                    <ShieldCheck size={13} />
                    <span>Government &amp; Permits</span>
                  </div>
                  <ul className="space-y-0.5 text-xs opacity-90 list-disc pl-4">
                    {etiquette.governmentRegulations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className={`p-3 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                    <UserCheck size={13} />
                    <span>Local Community Norms</span>
                  </div>
                  <ul className="space-y-0.5 text-xs opacity-85 list-disc pl-4">
                    {etiquette.localNorms.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>

                <div className={`p-3 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    <Sparkles size={13} />
                    <span>Environmental &amp; Leave No Trace</span>
                  </div>
                  <ul className="space-y-0.5 text-xs opacity-85 list-disc pl-4">
                    {etiquette.environmentalRules.map((eRule, i) => (
                      <li key={i}>{eRule}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border flex gap-2.5 ${
                isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'
              }`}>
                <AlertCircle size={16} className="text-project flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold mb-0.5">Crag Access Note &amp; Local Contact</p>
                  <p className="text-xs leading-relaxed opacity-85 mb-1">
                    {problem.accessInfo || 'Check in with the local ranger station / basecamp coordinator upon arrival.'}
                  </p>
                  <p className="text-xs font-semibold">
                    {problem.localContact || 'Crag Management & Local Climbing Community'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PROBLEMS CALL TO ACTIONS (2 CTAs): 1. Submit Sent | 2. Set New Route */}
      <div className={`p-4 md:px-6 border-t ${
        isSandstone ? 'bg-[#f4efe4] border-[#1a1815]/10' : 'bg-granite border-white/10'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* CTA 1: Submit Sent */}
          <button
            onClick={onLogAscent}
            className={`h-12 w-full rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-md active:scale-[0.98] ${
              isSandstone
                ? 'bg-[#1a1815] text-white hover:bg-black'
                : 'bg-lime text-granite hover:bg-lime-dim shadow-lime-glow'
            }`}
          >
            <span>Submit Sent</span>
            <span className="text-[11px] opacity-80 font-normal hidden xs:inline">(Log Ascent)</span>
          </button>

          {/* CTA 2: Set New Route */}
          <button
            onClick={onSetNewRoute || onLogAscent}
            className={`h-12 w-full rounded-xl flex items-center justify-center gap-2 text-sm font-bold border transition-all active:scale-[0.98] ${
              isSandstone
                ? 'border-[#1a1815]/40 text-[#1a1815] hover:bg-[#1a1815]/5'
                : 'border-white/20 text-chalk hover:bg-white/5 hover:border-lime/40'
            }`}
          >
            <Plus size={16} />
            <span>Set New Route</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
