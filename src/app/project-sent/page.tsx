'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import {
  Award,
  ChevronLeft,
  Share2,
  Calendar,
  Users,
  UserCheck,
  Mountain,
  MapPin,
  Check,
  Sparkles,
  Camera,
  Upload,
  RotateCcw,
  Trash2,
  Eye,
  Compass,
  Plus,
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'
import { useCragRegions } from '@/lib/use-data'
import { AscentType } from '@/lib/tokens'
import { TopoMarker } from '@/lib/mock-data'
import {
  getUserAscents,
  saveUserAscent,
  deleteUserAscent,
  UserAscent,
} from '@/lib/user-ascents'
import SendCard, { SendCardData } from '@/components/beta/SendCard'
import AscentShareModal from '@/components/beta/AscentShareModal'
import ShareLinkModal from '@/components/common/ShareLinkModal'

const DEFAULT_TOPO_MARKERS: TopoMarker[] = [
  { id: 'm-start', type: 'S', x: 50, y: 84, label: 'Start' },
  { id: 'm-b1', type: 'B', x: 46, y: 65, label: 'Bolt 1' },
  { id: 'm-crux', type: 'Z', x: 54, y: 46, label: 'Crux' },
  { id: 'm-b2', type: 'B', x: 49, y: 29, label: 'Bolt 2' },
  { id: 'm-top', type: 'T', x: 52, y: 14, label: 'Anchor' },
]

const DEFAULT_PHOTO_URL =
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=900&q=80'

const ASCENT_STYLES: { id: AscentType; label: string; hint: string }[] = [
  { id: 'redpoint', label: 'Redpoint', hint: 'Completed after rehearsal' },
  { id: 'flash', label: 'Flash', hint: '1st try with beta' },
  { id: 'onsight', label: 'Onsight', hint: '1st try without beta' },
  { id: 'repeat', label: 'Repeat', hint: 'Repeated send' },
]

const QUICK_PARTNERS = [
  'Nana Herdiana',
  'Raka Pratama',
  'Dimas Wijaya',
  'Nadia Kusuma',
  'Solo / Self-Pad',
]

function formatTodayInput(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatCardDate(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) return '26/04/26'
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y.slice(-2)}`
}

export default function ProjectSentPage() {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const { user } = useAuth()
  const { cragRegions } = useCragRegions()

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Flatten available crag problems for optional auto-fill
  const catalogProblems = useMemo(() => {
    return (cragRegions || []).flatMap((region) =>
      (region.sectors || []).flatMap((sector) =>
        (sector.problems || []).map((problem) => ({
          id: problem.id,
          name: problem.name,
          grade: problem.grade,
          fontGrade: problem.fontGrade || problem.grade,
          discipline: problem.discipline || problem.category || 'lead',
          setter: problem.setter || 'Ade Ahmad',
          location: `${sector.name || region.name}`,
          provinceCountry: `${region.province || 'Indonesia'}, ID`,
          photoUrl: problem.imageUrl || sector.image || region.image || DEFAULT_PHOTO_URL,
          markers:
            problem.markers && problem.markers.length > 0
              ? problem.markers
              : DEFAULT_TOPO_MARKERS,
        }))
      )
    )
  }, [cragRegions])

  // Form states matching exact spreadsheet rows:
  // Problem Title, Grade, Attempt (style), Topo, Route Setter, Attempts (count), Date, Partner
  const [selectedProblemId, setSelectedProblemId] = useState<string>('custom')
  const [problemTitle, setProblemTitle] = useState('Gugusan Bintang')
  const [grade, setGrade] = useState('5.12 B')
  const [attemptStyle, setAttemptStyle] = useState<AscentType>('redpoint')
  const [topoMarkers, setTopoMarkers] = useState<TopoMarker[]>(DEFAULT_TOPO_MARKERS)
  const [activeMarkerTool, setActiveMarkerTool] = useState<'S' | 'Z' | 'B' | 'T' | null>(null)
  const [topoPhotoUrl, setTopoPhotoUrl] = useState(DEFAULT_PHOTO_URL)
  const [routeSetter, setRouteSetter] = useState('Ade Ahmad')
  const [attemptsCount, setAttemptsCount] = useState<number>(3)
  const [sentDate, setSentDate] = useState<string>(formatTodayInput)
  const [partner, setPartner] = useState('Nana Herdiana')
  const [location, setLocation] = useState('Citatah 90 (A)')
  const [discipline, setDiscipline] = useState('Lead')

  // Saved cards + Modals
  const [savedAscents, setSavedAscents] = useState<UserAscent[]>([])
  const [activeSentCardModal, setActiveSentCardModal] = useState<UserAscent | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareTarget, setShareTarget] = useState<{
    title: string
    subtitle: string
    url: string
  } | null>(null)
  const [justSubmittedId, setJustSubmittedId] = useState<string | null>(null)

  useEffect(() => {
    const sync = () => setSavedAscents(getUserAscents())
    sync()
    window.addEventListener('user-ascents-updated', sync)
    return () => window.removeEventListener('user-ascents-updated', sync)
  }, [])

  // Handle problem catalog preset selection
  const handleSelectCatalogProblem = (id: string) => {
    setSelectedProblemId(id)
    if (id === 'custom') return
    const found = catalogProblems.find((p) => p.id === id)
    if (!found) return
    setProblemTitle(found.name)
    setGrade(found.grade)
    setRouteSetter(found.setter)
    setLocation(found.location)
    setDiscipline(
      found.discipline.charAt(0).toUpperCase() + found.discipline.slice(1)
    )
    setTopoPhotoUrl(found.photoUrl)
    setTopoMarkers(found.markers)
  }

  // Interactive click on Topo canvas to place/replace a marker
  const handleTopoImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeMarkerTool) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)

    setTopoMarkers((prev) => {
      // Keep single S or T if placed again, allow multiple B / Z
      if (activeMarkerTool === 'S' || activeMarkerTool === 'T') {
        const filtered = prev.filter((m) => m.type !== activeMarkerTool)
        return [
          ...filtered,
          {
            id: `m-${activeMarkerTool}-${Date.now()}`,
            type: activeMarkerTool,
            x,
            y,
            label: activeMarkerTool === 'S' ? 'Start' : 'Top',
          },
        ]
      }
      return [
        ...prev,
        {
          id: `m-${activeMarkerTool}-${Date.now()}`,
          type: activeMarkerTool,
          x,
          y,
          label: activeMarkerTool === 'Z' ? 'Crux' : 'Bolt',
        },
      ]
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTopoPhotoUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const attemptsDisplay =
    attemptsCount <= 1 ? '1st Attempt' : `${attemptsCount} Attempts`

  const liveCardData: SendCardData = {
    problemName: problemTitle || 'Untitled Problem',
    grade: grade || '5.11a',
    location: location || 'Citatah 90 (A)',
    provinceCountry: 'Indonesia, ID',
    wallAngle: '105°',
    wallHeight: '12 m',
    boltsCount: `${topoMarkers.filter((m) => m.type === 'B' || m.type === 'H').length || 5} Bolts`,
    discipline: discipline || 'Lead',
    ascentType: attemptStyle,
    attempts: attemptsDisplay,
    duration: '1 Session',
    photoUrl: topoPhotoUrl,
    markers: topoMarkers,
    climberName: user?.name || 'Ahmad Rizki Nugraha',
    time: new Date().toTimeString().slice(0, 5),
    date: formatCardDate(sentDate),
    belayer: partner || 'Nana Herdiana',
    photographer: routeSetter ? `Set by ${routeSetter}` : 'Jalur Crew',
  }

  const previewAscentForModal: UserAscent = {
    id: 'preview-current',
    userId: user?.id || 'user-1',
    problemId: selectedProblemId === 'custom' ? `custom-${Date.now()}` : selectedProblemId,
    problemName: liveCardData.problemName,
    grade: liveCardData.grade,
    fontGrade: liveCardData.grade,
    setter: routeSetter || 'Jalur Route Setter',
    location: liveCardData.location,
    provinceCountry: liveCardData.provinceCountry,
    date: liveCardData.date || '26/04/26',
    time: liveCardData.time,
    createdAt: new Date().toISOString(),
    ascentType: attemptStyle,
    gradeVote: liveCardData.grade,
    photoUrl: topoPhotoUrl,
    markers: topoMarkers,
    discipline: liveCardData.discipline,
    climberName: liveCardData.climberName,
    attempts: attemptsDisplay,
    duration: liveCardData.duration,
    belayer: partner || 'Nana Herdiana',
    photographer: liveCardData.photographer,
    wallAngle: liveCardData.wallAngle,
    wallHeight: liveCardData.wallHeight,
    boltsCount: liveCardData.boltsCount,
  }

  const handleSubmitSentForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!problemTitle.trim()) return

    const saved = saveUserAscent({
      userId: user?.id || 'user-1',
      problemId:
        selectedProblemId === 'custom' ? `sent-${Date.now()}` : selectedProblemId,
      problemName: problemTitle.trim(),
      grade: grade.trim() || 'V5',
      fontGrade: grade.trim() || '6C',
      setter: routeSetter.trim() || 'Jalur Route Setter',
      location: location.trim() || 'Citatah',
      provinceCountry: 'Indonesia, ID',
      date: formatCardDate(sentDate),
      time: new Date().toTimeString().slice(0, 5),
      ascentType: attemptStyle,
      gradeVote: grade.trim() || 'V5',
      note: `Partner: ${partner || '-'} · Route Setter: ${routeSetter || '-'}`,
      photoUrl: topoPhotoUrl,
      markers: topoMarkers,
      discipline,
      climberName: user?.name || 'Ahmad Rizki Nugraha',
      attempts: attemptsDisplay,
      duration: '1 Session',
      belayer: partner.trim() || 'Solo',
      photographer: routeSetter ? `Setter: ${routeSetter}` : 'Jalur Archive',
      wallAngle: '105°',
      wallHeight: '12 m',
      boltsCount: `${topoMarkers.filter((m) => m.type === 'B' || m.type === 'H').length || 5} Bolts`,
    })

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-ascents-updated'))
    }

    setJustSubmittedId(saved.id)
    setActiveSentCardModal(saved)
    setTimeout(() => setJustSubmittedId(null), 4000)
  }

  const handleDeleteSent = (id: string) => {
    deleteUserAscent(id)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-ascents-updated'))
    }
  }

  const cardSurface = isSandstone
    ? 'bg-[#f4efe6] border-[#1a1815]/15 text-[#1a1815]'
    : 'bg-[#181D22] border-white/10 text-chalk'

  const inputSurface = isSandstone
    ? 'bg-white border-[#1a1815]/15 text-[#1a1815] focus:border-[#FF6B00]'
    : 'bg-black/30 border-white/15 text-chalk focus:border-[#FF6B00]'

  return (
    <div className="max-w-7xl mx-auto p-4 md:px-6 lg:px-8 space-y-6 pb-20">
      {/* 1-Step Back Header */}
      <div className="flex items-center justify-between gap-3 py-2 border-b border-black/10 dark:border-white/10">
        <Link
          href="/"
          className={`flex items-center gap-1.5 py-1 -ml-1 group transition-opacity hover:opacity-75 ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}
        >
          <ChevronLeft
            size={20}
            className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5"
          />
          <span className="text-sm sm:text-base font-light tracking-wide">
            Back to Home
          </span>
        </Link>

        {justSubmittedId && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-bold">
            <Check size={13} />
            <span>Project Sent tersimpan &amp; Sent Card siap diunduh</span>
          </div>
        )}
      </div>

      {/* Main Header: Static Page Title, Description, Sent Card CTA & Share Link CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F90657]/15 text-[#F90657] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Award size={11} />
            <span>Primary Feature</span>
          </div>
          <h1
            className={`font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight ${
              isSandstone ? 'text-[#1a1815]' : 'text-chalk'
            }`}
          >
            Project Sent
          </h1>
          <p
            className={`text-xs md:text-sm font-light mt-1 ${
              isSandstone ? 'text-[#5b554b]' : 'text-slate-ash'
            }`}
          >
            Catat jalur atau boulder problem yang berhasil diselesaikan, atur topo &amp; partner, buat Sent Card, lalu bagikan link-nya.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              setActiveSentCardModal(savedAscents[0] || previewAscentForModal)
            }
            className="px-4 py-2.5 rounded-xl bg-[#F90657] hover:bg-[#d8054b] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Award size={14} />
            <span>Sent Card</span>
          </button>
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSandstone
                ? 'border-[#1a1815]/15 bg-black/5 hover:border-[#FF6B00] text-[#1a1815]'
                : 'border-white/15 bg-white/5 hover:border-[#FF6B00] text-chalk'
            }`}
          >
            <Share2 size={14} />
            <span>Share Link</span>
          </button>
        </div>
      </div>

      {/* SENT SUBMISSION FORM + LIVE SENT CARD PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Sent Submission Form (Problem Title, Grade, Attempt, Topo, Route Setter, Attempts, Date, Partner) */}
        <form
          onSubmit={handleSubmitSentForm}
          className={`lg:col-span-7 rounded-3xl border p-5 md:p-6 space-y-5 shadow-sm ${cardSurface}`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Sparkles size={17} className="text-[#FF6B00]" />
                <span>Sent Submission Form</span>
              </h2>
              <p className="text-xs opacity-65 font-light">
                Pilih jalur dari direktori atau isi manual detail send anda.
              </p>
            </div>
            <Link
              href="/account"
              className="text-xs font-bold text-[#FF6B00] hover:underline shrink-0"
            >
              My Account Logbook ({savedAscents.length})
            </Link>
          </div>

          {/* Preset Catalog Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider opacity-75 block">
              Quick Fill from Crags / Problems Directory (Optional)
            </label>
            <select
              value={selectedProblemId}
              onChange={(e) => handleSelectCatalogProblem(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${inputSurface}`}
            >
              <option value="custom">Manual Entry (Custom Problem)</option>
              {catalogProblems.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.grade}) — {p.location}
                </option>
              ))}
            </select>
          </div>

          {/* Row 1: Problem Title + Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider opacity-75 block">
                Problem Title *
              </label>
              <input
                type="text"
                required
                value={problemTitle}
                onChange={(e) => setProblemTitle(e.target.value)}
                placeholder="e.g. Gugusan Bintang"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${inputSurface}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider opacity-75 block">
                Grade *
              </label>
              <input
                type="text"
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. V7 or 5.12 B"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold outline-none ${inputSurface}`}
              />
            </div>
          </div>

          {/* Row 2: Attempt Style (Redpoint / Flash / Onsight / Repeat) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider opacity-75 block">
              Attempt (Ascent Style)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ASCENT_STYLES.map((style) => {
                const active = attemptStyle === style.id
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      setAttemptStyle(style.id)
                      if (style.id === 'flash' || style.id === 'onsight') {
                        setAttemptsCount(1)
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-sm'
                        : isSandstone
                          ? 'bg-white border-[#1a1815]/15 hover:border-[#FF6B00]'
                          : 'bg-black/25 border-white/10 hover:border-[#FF6B00]'
                    }`}
                  >
                    <div className="font-bold text-xs">{style.label}</div>
                    <div
                      className={`text-[10px] leading-tight mt-0.5 ${
                        active ? 'text-white/85' : 'opacity-60'
                      }`}
                    >
                      {style.hint}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Row 3: Interactive Topo Builder & Photo */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                Topo &amp; Route Line Markers
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {(['S', 'Z', 'B', 'T'] as const).map((tool) => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() =>
                      setActiveMarkerTool(activeMarkerTool === tool ? null : tool)
                    }
                    className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                      activeMarkerTool === tool
                        ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                        : isSandstone
                          ? 'bg-white border-[#1a1815]/15'
                          : 'bg-black/30 border-white/15'
                    }`}
                  >
                    + Mark {tool}
                  </button>
                ))}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                    isSandstone
                      ? 'bg-white border-[#1a1815]/15 hover:border-[#FF6B00]'
                      : 'bg-black/30 border-white/15 hover:border-[#FF6B00]'
                  }`}
                >
                  <Upload size={11} />
                  <span>Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTopoMarkers(DEFAULT_TOPO_MARKERS)}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                    isSandstone ? 'border-[#1a1815]/15' : 'border-white/15'
                  }`}
                  title="Reset default topo line"
                >
                  <RotateCcw size={11} />
                </button>
              </div>
            </div>

            <div
              onClick={handleTopoImageClick}
              className={`relative h-56 w-full rounded-2xl overflow-hidden border border-black/15 dark:border-white/15 ${
                activeMarkerTool ? 'cursor-crosshair ring-2 ring-[#FF6B00]' : ''
              }`}
            >
              <img
                src={topoPhotoUrl}
                alt="Route Topo Preview"
                className="w-full h-full object-cover"
              />
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                {topoMarkers.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#FF6B00"
                    strokeWidth="0.9"
                    strokeDasharray="2 1.2"
                    points={[...topoMarkers]
                      .sort((a, b) => b.y - a.y)
                      .map((m) => `${m.x},${m.y}`)
                      .join(' ')}
                  />
                )}
              </svg>
              {topoMarkers.map((m) => (
                <div
                  key={m.id}
                  style={{ left: `${m.x}%`, top: `${m.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shadow border border-white/70 pointer-events-none ${
                    m.type === 'S'
                      ? 'bg-emerald-500'
                      : m.type === 'T'
                        ? 'bg-[#F90657]'
                        : m.type === 'Z'
                          ? 'bg-amber-500'
                          : 'bg-[#FF6B00]'
                  }`}
                >
                  {m.type}
                </div>
              ))}
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-sm text-[10px] text-white/90">
                {activeMarkerTool
                  ? `Tap image to place "${activeMarkerTool}" marker`
                  : `${topoMarkers.length} Topo markers active · Select "+ Mark S/Z/B/T" above to edit`}
              </div>
            </div>
          </div>

          {/* Row 4: Route Setter + Attempts Count + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider opacity-75 block">
                Route Setter
              </label>
              <input
                type="text"
                value={routeSetter}
                onChange={(e) => setRouteSetter(e.target.value)}
                placeholder="e.g. Ade Ahmad"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${inputSurface}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider opacity-75 block">
                Attempts (Count)
              </label>
              <input
                type="number"
                min={1}
                max={999}
                value={attemptsCount}
                onChange={(e) =>
                  setAttemptsCount(Math.max(1, Number(e.target.value) || 1))
                }
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold outline-none ${inputSurface}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider opacity-75 block">
                Date
              </label>
              <input
                type="date"
                value={sentDate}
                onChange={(e) => setSentDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none ${inputSurface}`}
              />
            </div>
          </div>

          {/* Row 5: Partner (Belayer / Climbing Partner) + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider opacity-75 block">
                Partner (Belayer / Spotter)
              </label>
              <input
                type="text"
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                placeholder="Climbing partner name"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${inputSurface}`}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_PARTNERS.map((pName) => (
                  <button
                    key={pName}
                    type="button"
                    onClick={() => setPartner(pName)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                      partner === pName
                        ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                        : isSandstone
                          ? 'border-[#1a1815]/15 hover:border-[#FF6B00]'
                          : 'border-white/15 hover:border-[#FF6B00]'
                    }`}
                  >
                    {pName}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider opacity-75 block">
                Crag / Gym Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Citatah 90 (A)"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${inputSurface}`}
              />
              <div className="flex items-center gap-1.5 pt-1">
                {(['Lead', 'Boulder', 'Multipitch'] as const).map((disc) => (
                  <button
                    key={disc}
                    type="button"
                    onClick={() => setDiscipline(disc)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                      discipline === disc
                        ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                        : isSandstone
                          ? 'border-[#1a1815]/15 hover:border-[#FF6B00]'
                          : 'border-white/15 hover:border-[#FF6B00]'
                    }`}
                  >
                    {disc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Submit CTA */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 dark:border-white/10">
            <button
              type="submit"
              className="flex-1 min-w-[220px] py-3 px-5 rounded-2xl bg-[#FF6B00] hover:bg-[#E5601F] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Check size={16} />
              <span>Submit Project Sent &amp; Generate Sent Card</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSentCardModal(previewAscentForModal)}
              className="py-3 px-4 rounded-2xl bg-[#F90657]/15 border border-[#F90657]/40 text-[#F90657] hover:bg-[#F90657] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Eye size={14} />
              <span>Preview Card</span>
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: Live Sent Card Preview + CTAs */}
        <div className={`lg:col-span-5 rounded-3xl border p-5 space-y-4 ${cardSurface}`}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-base">Live Sent Card Preview</h2>
              <p className="text-[11px] opacity-65 font-light">
                Otomatis ter-update mengikuti data di Sent Submission Form.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#F90657]/15 text-[#F90657] font-mono text-[10px] font-bold uppercase">
              {attemptStyle}
            </span>
          </div>

          <div className="max-w-[300px] mx-auto">
            <SendCard data={liveCardData} showTopo />
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setActiveSentCardModal(previewAscentForModal)}
              className="py-2.5 px-3 rounded-xl bg-[#F90657] hover:bg-[#d8054b] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Award size={14} />
              <span>Download Sent Card</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setShareTarget({
                  title: `Project Sent: ${liveCardData.problemName} (${liveCardData.grade})`,
                  subtitle: `${attemptStyle.toUpperCase()} · ${attemptsDisplay} · Setter: ${routeSetter || '-'} · Partner: ${partner || '-'}`,
                  url: '/project-sent',
                })
              }
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isSandstone
                  ? 'border-[#1a1815]/20 hover:border-[#FF6B00]'
                  : 'border-white/15 hover:border-[#FF6B00]'
              }`}
            >
              <Share2 size={14} />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* SAVED SENT CARDS HISTORY */}
      <section className={`rounded-3xl border p-5 md:p-6 space-y-4 ${cardSurface}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3">
          <div>
            <h2 className="font-bold text-lg">Saved Sent Cards ({savedAscents.length})</h2>
            <p className="text-xs opacity-65 font-light">
              Riwayat project sent anda — klik Sent Card untuk mengunduh gambar atau Share Link ke teman.
            </p>
          </div>
          <Link
            href="/account"
            className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
          >
            <Compass size={13} />
            <span>Open Full Logbook on Account</span>
          </Link>
        </div>

        {savedAscents.length === 0 ? (
          <div className="py-10 text-center space-y-2 opacity-75">
            <Award size={28} className="mx-auto text-[#F90657]" />
            <p className="text-sm font-bold">Belum ada Sent Card tersimpan</p>
            <p className="text-xs font-light">
              Isi Sent Submission Form di atas lalu klik &quot;Submit Project Sent&quot; untuk menambahkan Sent Card pertama anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {savedAscents.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 ${
                  isSandstone
                    ? 'bg-white border-[#1a1815]/10'
                    : 'bg-black/25 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#F90657]/15 text-[#F90657] font-mono text-[10px] font-bold uppercase">
                        {item.ascentType}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#FF6B00]">
                        {item.grade}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mt-1 truncate">{item.problemName}</h3>
                    <div className="text-xs opacity-65 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin size={11} className="text-[#FF6B00] shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  {item.photoUrl && (
                    <img
                      src={item.photoUrl}
                      alt={item.problemName}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] opacity-75 pt-1">
                  <div>
                    <span className="opacity-60">Setter: </span>
                    <span className="font-semibold">{item.setter || '-'}</span>
                  </div>
                  <div>
                    <span className="opacity-60">Attempts: </span>
                    <span className="font-semibold">{item.attempts || '-'}</span>
                  </div>
                  <div>
                    <span className="opacity-60">Date: </span>
                    <span className="font-semibold">{item.date}</span>
                  </div>
                  <div>
                    <span className="opacity-60">Partner: </span>
                    <span className="font-semibold">{item.belayer || '-'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSentCardModal(item)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#F90657] hover:bg-[#d8054b] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Award size={13} />
                    <span>Sent Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setShareTarget({
                        title: `Sent Card: ${item.problemName} (${item.grade})`,
                        subtitle: `${item.ascentType.toUpperCase()} at ${item.location} · Partner: ${item.belayer || '-'}`,
                        url: '/project-sent',
                      })
                    }
                    className={`p-2 rounded-xl border hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all cursor-pointer ${
                      isSandstone ? 'border-[#1a1815]/15' : 'border-white/15'
                    }`}
                    title="Share Sent Card Link"
                  >
                    <Share2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSent(item.id)}
                    className={`p-2 rounded-xl border hover:border-red-500 hover:text-red-500 transition-all cursor-pointer ${
                      isSandstone ? 'border-[#1a1815]/15' : 'border-white/15'
                    }`}
                    title="Delete entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sent Card Certificate & Download Modal */}
      {activeSentCardModal && (
        <AscentShareModal
          ascent={activeSentCardModal}
          onClose={() => setActiveSentCardModal(null)}
        />
      )}

      {/* Share Link Modal */}
      <ShareLinkModal
        open={showShareModal || !!shareTarget}
        onClose={() => {
          setShowShareModal(false)
          setShareTarget(null)
        }}
        title={shareTarget?.title || 'Project Sent — Jalur Climbing Logbook'}
        subtitle={
          shareTarget?.subtitle ||
          'Log your climbing sends, generate official Sent Cards, and share with friends.'
        }
        shareUrl={shareTarget?.url || '/project-sent'}
        categoryLabel="Share Project Sent"
      />
    </div>
  )
}
