'use client'

import React from 'react'
import { MapPin } from 'lucide-react'
import { AscentType } from '@/lib/tokens'
import { TopoMarker } from '@/lib/mock-data'

export interface SendCardData {
  problemName: string
  grade: string // e.g. "5.12 B" or "V8"
  location: string // e.g. "Pabeasan 90 (A)"
  provinceCountry?: string // e.g. "Jawa Barat, ID"
  wallAngle?: string // e.g. "110°"
  wallHeight?: string // e.g. "12 m"
  boltsCount?: string // e.g. "6 Bolts"
  discipline?: string // e.g. "Lead", "Boulder", "Multipitch"
  ascentType: AscentType // e.g. "redpoint", "flash", "onsight", "repeat"
  attempts?: number | string // e.g. "13 Attempts" or 13
  duration?: string // e.g. "24 Weeks" or "3 Days"
  photoUrl?: string
  markers?: TopoMarker[]
  climberName?: string // e.g. "Arief Lala Hakiem"
  time?: string // e.g. "16:20"
  date?: string // e.g. "26/04/26"
  belayer?: string // e.g. "Nana Herdiana"
  photographer?: string // e.g. "Meizan Nataadiningrat"
}

interface SendCardProps {
  data: SendCardData
  showTopo?: boolean
  className?: string
}

export default function SendCard({
  data,
  showTopo = true,
  className = '',
}: SendCardProps) {
  // Format Ascent Type title
  const formatAscentType = (type: AscentType): string => {
    switch (type) {
      case 'redpoint':
        return 'Red Point'
      case 'flash':
        return 'Flash'
      case 'onsight':
        return 'Onsight'
      case 'repeat':
        return 'Repeat'
      default:
        return 'Send'
    }
  }

  // Format attempts line
  const formatAttempts = (attempts?: number | string, type?: AscentType): string => {
    if (type === 'onsight' || type === 'flash') return '1st Attempt'
    if (!attempts) return '13 Attempts'
    if (typeof attempts === 'number') {
      return attempts === 1 ? '1 Attempt' : `${attempts} Attempts`
    }
    const str = attempts.toString().trim()
    return str.toLowerCase().includes('attempt') ? str : `${str} Attempts`
  }

  // Format duration line
  const formatDuration = (duration?: string): string => {
    if (!duration || duration.trim() === '') return '24 Weeks'
    return duration.trim()
  }

  // Climber name lines
  const climberName = data.climberName || 'Arief Lala Hakiem'
  const nameParts = climberName.split(' ')
  const firstName = nameParts.length > 2 ? nameParts.slice(0, 2).join(' ') : nameParts[0] || 'Arief Lala'
  const lastName = nameParts.length > 2 ? nameParts.slice(2).join(' ') : nameParts.slice(1).join(' ') || 'Hakiem'

  // Image source fallback
  const photoSrc =
    data.photoUrl ||
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=85'

  // Format date DD/MM/YY
  const formattedDate = data.date || '26/04/26'
  const formattedTime = data.time || '16:20'
  const belayerName = data.belayer || 'Nana Herdiana'
  const photoCredit = data.photographer || 'Meizan Nataadiningrat'

  // Route specs
  const wallAngle = data.wallAngle || '110°'
  const wallHeight = data.wallHeight || '12 m'
  const bolts = data.boltsCount || (data.discipline?.toLowerCase().includes('boulder') ? '3 Crashpads' : '6 Bolts')
  const disciplineLabel =
    data.discipline?.toLowerCase().includes('boulder')
      ? 'Boulder'
      : data.discipline?.toLowerCase().includes('multi')
      ? 'Multi-Pitch'
      : 'Lead'

  const locationCrag = data.location.split('·')[0].trim() || 'Pabeasan 90 (A)'
  const locationProvince = data.provinceCountry || 'Jawa Barat, ID'

  return (
    <div
      className={`relative w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl flex flex-col select-none ${className}`}
      style={{
        aspectRatio: '9 / 18.2',
        backgroundColor: '#1C1917',
      }}
    >
      {/* 1. Subtle Left Edge Vertical Ruler Ticks */}
      <div className="absolute left-2.5 top-3 bottom-3 w-3 flex flex-col justify-between items-center opacity-40 z-30 pointer-events-none">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="w-2.5 h-[1.5px] bg-white rounded-full" />
        ))}
      </div>

      {/* 2. TOP ZONE: Sandstone Beige Header */}
      <div
        className="relative px-6 pl-8 pt-5 pb-4 flex flex-col justify-between z-20 flex-shrink-0"
        style={{
          backgroundColor: '#CBBBA4',
        }}
      >
        {/* Row 1: Logo & Location */}
        <div className="flex items-start justify-between">
          {/* Logo */}
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              jalur.
            </span>
            <span className="text-xs sm:text-sm font-light italic text-white/90">
              WORLD
            </span>
          </div>

          {/* Location */}
          <div className="flex items-start gap-1.5 text-right">
            <MapPin size={15} className="text-white/80 mt-0.5 flex-shrink-0" />
            <div className="leading-tight">
              <div className="text-xs sm:text-sm font-medium text-white/90">
                {locationCrag}
              </div>
              <div className="text-[10px] sm:text-xs text-white/70">
                {locationProvince}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Route Name & Massive Grade */}
        <div className="flex items-baseline justify-between mt-2 mb-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#E6392D] max-w-[65%] truncate">
            {data.problemName || 'Gugusan Bintang'}
          </h2>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-mono tracking-tight text-[#E6392D] flex-shrink-0">
            {data.grade || '5.12 B'}
          </span>
        </div>

        {/* Row 3: 4 Spec Pills */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {[wallAngle, wallHeight, bolts, disciplineLabel].map((spec, i) => (
            <div
              key={i}
              className="py-1 px-1.5 rounded-full border border-white/40 bg-white/10 text-center text-[10px] sm:text-xs font-medium text-white truncate"
            >
              {spec}
            </div>
          ))}
        </div>
      </div>

      {/* 3. MIDDLE ZONE: Climber Action Photo with Typography & Topo Overlay */}
      <div className="relative flex-1 w-full overflow-hidden bg-stone-900">
        <img
          src={photoSrc}
          alt={data.problemName}
          className="w-full h-full object-cover"
        />

        {/* Dark subtle vignette to guarantee text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top-Left Bold Typographic Overlay */}
        <div className="absolute top-6 left-8 z-20 pointer-events-none">
          <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.05] drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)]">
            <div>{formatAscentType(data.ascentType)}/</div>
            <div>{formatAttempts(data.attempts, data.ascentType)}/</div>
            <div>{formatDuration(data.duration)}/</div>
          </div>
        </div>

        {/* Right-Side Topo Route Line (Vector) */}
        {showTopo && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 400 600"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Topo line on the right rock face */}
              <path
                d="M 345 470 L 350 430 L 358 390 L 353 320 L 338 280 L 345 250 L 348 238"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
              />
              {/* Circular markers along line */}
              <circle cx="345" cy="470" r="4.5" stroke="#FFFFFF" strokeWidth="2" fill="transparent" />
              <circle cx="350" cy="430" r="4.5" stroke="#FFFFFF" strokeWidth="2" fill="transparent" />
              <circle cx="358" cy="390" r="4.5" stroke="#FFFFFF" strokeWidth="2" fill="transparent" />
              <circle cx="353" cy="320" r="4.5" stroke="#FFFFFF" strokeWidth="2" fill="transparent" />
              <circle cx="338" cy="280" r="4.5" stroke="#FFFFFF" strokeWidth="2" fill="transparent" />
              <circle cx="345" cy="250" r="4.5" stroke="#FFFFFF" strokeWidth="2" fill="transparent" />

              {/* Double-ring anchor chain station at top (8-shape) */}
              <circle cx="345" cy="238" r="4" stroke="#FFFFFF" strokeWidth="2" fill="transparent" />
              <circle cx="352" cy="238" r="4" stroke="#FFFFFF" strokeWidth="2" fill="transparent" />
            </svg>
          </div>
        )}
      </div>

      {/* 4. BOTTOM ZONE: Solid Red Zone with Climber Name & Metadata Grid */}
      <div
        className="relative px-6 pl-8 py-5 sm:py-6 flex flex-col justify-between z-20 flex-shrink-0"
        style={{
          backgroundColor: '#E6392D',
        }}
      >
        {/* Climber Name */}
        <div className="text-right sm:text-center sm:ml-auto">
          <h3 className="text-2xl sm:text-3xl font-normal text-white tracking-wide leading-tight">
            <div>{firstName}</div>
            <div>{lastName}</div>
          </h3>
        </div>

        {/* Two-Column Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm text-white font-light mt-4 pt-2">
          {/* Column 1 */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-1 truncate">
              <span className="opacity-90 font-medium">(T)</span>
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-baseline gap-1 truncate">
              <span className="opacity-90 font-medium">(B)</span>
              <span className="truncate">{belayerName}</span>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-1 truncate">
              <span className="opacity-90 font-medium">(D)</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-baseline gap-1 truncate">
              <span className="opacity-90 font-medium">(P)</span>
              <span className="truncate">{photoCredit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
