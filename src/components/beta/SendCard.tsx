'use client'

import React from 'react'
import { AscentType } from '@/lib/tokens'
import { TopoMarker } from '@/lib/mock-data'

export interface SendCardData {
  problemName: string
  grade: string // e.g. "5.12 B" or "V8"
  location: string // e.g. "Pabeasan 90 (A)"
  provinceCountry?: string // e.g. "Jawa Barat, ID"
  wallAngle?: string // e.g. "110°"
  wallHeight?: string // e.g. "12 M"
  boltsCount?: string // e.g. "6 BOLTS"
  discipline?: string // e.g. "Lead", "Boulder", "Multipitch"
  ascentType: AscentType // e.g. "redpoint", "flash", "onsight", "repeat"
  attempts?: number | string // e.g. "5 Attempts" or 5
  duration?: string // e.g. "24 Weeks" or "3 Days"
  photoUrl?: string
  markers?: TopoMarker[]
  climberName?: string // e.g. "Arief Lala Hakiem"
  time?: string // e.g. "16:20"
  date?: string // e.g. "26/04/26"
  belayer?: string // e.g. "Nana Herdiana"
  photographer?: string // e.g. "Meizan Nataadiningrat"
}

export const SEND_CARD_RED = '#EE2B2B'

export const DEFAULT_SEND_CARD_PHOTO =
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=85'

export const DEFAULT_SEND_CARD_MARKERS: TopoMarker[] = [
  { id: 'def-s', type: 'S', x: 54, y: 85, label: 'Start' },
  { id: 'def-b1', type: 'B', x: 55.5, y: 74, label: 'Bolt 1' },
  { id: 'def-b2', type: 'B', x: 60, y: 61.5, label: 'Bolt 2' },
  { id: 'def-b3', type: 'B', x: 53, y: 47.5, label: 'Bolt 3' },
  { id: 'def-b4', type: 'B', x: 48.5, y: 36.5, label: 'Bolt 4' },
  { id: 'def-t', type: 'T', x: 54.5, y: 27, label: 'Anchor' },
]

export function formatSendCardAscentType(type: AscentType): string {
  switch (type) {
    case 'redpoint':
      return 'RED POINT'
    case 'flash':
      return 'FLASH'
    case 'onsight':
      return 'ONSIGHT'
    case 'repeat':
      return 'REPEAT'
    default:
      return 'SEND'
  }
}

export function formatSendCardAttempts(
  attempts?: number | string,
  type?: AscentType
): string {
  if (type === 'onsight' || type === 'flash') return '1ST ATTEMPT'
  if (!attempts) return '5 ATTEMPTS'
  if (typeof attempts === 'number') {
    return attempts === 1 ? '1 ATTEMPT' : `${attempts} ATTEMPTS`
  }
  const str = attempts.toString().trim().toUpperCase()
  return str.includes('ATTEMPT') ? str : `${str} ATTEMPTS`
}

export function formatSendCardSpecs(
  data: Pick<SendCardData, 'wallAngle' | 'wallHeight' | 'boltsCount' | 'discipline'>
): [string, string, string, string] {
  const wallAngle = (data.wallAngle || '110°').toUpperCase()
  const wallHeight = (data.wallHeight || '12 M').toUpperCase()
  const disciplineLower = (data.discipline || '').toLowerCase()
  const bolts = (
    data.boltsCount ||
    (disciplineLower.includes('boulder') ? '3 PADS' : '6 BOLTS')
  ).toUpperCase()
  const disciplineLabel = disciplineLower.includes('boulder')
    ? 'BOULDER'
    : disciplineLower.includes('multi')
    ? 'MULTI-PITCH'
    : 'LEAD'
  return [wallAngle, wallHeight, bolts, disciplineLabel]
}

export function formatSendCardNameLines(climberName?: string): [string, string] {
  const raw = (climberName || 'Arief Lala Hakiem').trim().toUpperCase()
  const parts = raw.split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return [parts[0] || 'ARIEF LALA', '']
  if (parts.length === 2) return [parts[0], parts[1]]
  return [parts.slice(0, 2).join(' '), parts.slice(2).join(' ')]
}

/**
 * Orders route markers into a continuous ascending path:
 * Start ('S') -> Intermediate holds/bolts (bottom-to-top) -> Top anchor ('T').
 */
export function orderRouteMarkers(markers?: TopoMarker[]): TopoMarker[] {
  const source =
    Array.isArray(markers) && markers.length >= 2 ? markers : DEFAULT_SEND_CARD_MARKERS

  const starts = source.filter((m) => m.type === 'S')
  const tops = source.filter((m) => m.type === 'T')
  const mids = source
    .filter((m) => m.type !== 'S' && m.type !== 'T')
    .slice()
    .sort((a, b) => Number(b.y) - Number(a.y))

  const ordered = [...starts, ...mids, ...tops]
  return ordered.length >= 2 ? ordered : DEFAULT_SEND_CARD_MARKERS
}

export function trimmedLineSegment(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  trimStart: number,
  trimEnd: number
): { x1: number; y1: number; x2: number; y2: number } | null {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len <= trimStart + trimEnd + 0.5) return null
  const ux = dx / len
  const uy = dy / len
  return {
    x1: x1 + ux * trimStart,
    y1: y1 + uy * trimStart,
    x2: x2 - ux * trimEnd,
    y2: y2 - uy * trimEnd,
  }
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
  const photoSrc = data.photoUrl || DEFAULT_SEND_CARD_PHOTO
  const specs = formatSendCardSpecs(data)
  const [nameLine1, nameLine2] = formatSendCardNameLines(data.climberName)
  const ascentLabel = formatSendCardAscentType(data.ascentType)
  const attemptsLabel = formatSendCardAttempts(data.attempts, data.ascentType)

  const orderedMarkers = orderRouteMarkers(data.markers)
  const W = 360
  const H = 640
  const markerR = 5.5
  const anchorGap = 6.5

  const pts = orderedMarkers.map((m) => ({
    ...m,
    px: (Number(m.x) / 100) * W,
    py: (Number(m.y) / 100) * H,
  }))

  const displayStyle: React.CSSProperties = {
    fontFamily:
      "'DIN Condensed', 'Roboto Condensed', 'Arial Narrow', 'BDO Grotesk', sans-serif",
  }

  return (
    <div
      className={`relative w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl select-none bg-[#181A1F] ${className}`}
      style={{ aspectRatio: '9 / 16' }}
    >
      {/* 1. Full-Bleed Action Photo (example or user-uploaded climb photo) */}
      <img
        src={photoSrc}
        alt={data.problemName || 'Send Card'}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 2. Subtle Top Gradient Scrim so white typography stays legible over bright outdoor rock */}
      <div className="absolute inset-x-0 top-0 h-[44%] bg-gradient-to-b from-black/65 via-black/30 to-transparent pointer-events-none z-10" />

      {/* 3. Red Route Direction Overlay (Arah Jalur: Start -> Bolts/Crux -> Anchor Top) */}
      {showTopo && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox={`0 0 ${W} ${H}`}
          fill="none"
        >
          {/* Red segments trimmed cleanly at each circle edge */}
          {pts.slice(0, -1).map((p, idx) => {
            const next = pts[idx + 1]
            const seg = trimmedLineSegment(
              p.px,
              p.py,
              next.px,
              next.py,
              markerR,
              markerR
            )
            if (!seg) return null
            return (
              <line
                key={`seg-${p.id}-${next.id}-${idx}`}
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke={SEND_CARD_RED}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )
          })}

          {/* Route points along the red path */}
          {pts.map((m, idx) => {
            if (m.type === 'S') {
              return (
                <g key={`pt-${m.id}-${idx}`}>
                  <circle
                    cx={m.px}
                    cy={m.py}
                    r={markerR}
                    stroke={SEND_CARD_RED}
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d={`M ${m.px - markerR} ${m.py} A ${markerR} ${markerR} 0 0 0 ${
                      m.px + markerR
                    } ${m.py} Z`}
                    fill={SEND_CARD_RED}
                  />
                </g>
              )
            }

            if (m.type === 'T') {
              return (
                <g key={`pt-${m.id}-${idx}`}>
                  <circle
                    cx={m.px - anchorGap}
                    cy={m.py}
                    r={markerR}
                    stroke={SEND_CARD_RED}
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx={m.px + anchorGap}
                    cy={m.py}
                    r={markerR}
                    stroke={SEND_CARD_RED}
                    strokeWidth="2"
                    fill="none"
                  />
                </g>
              )
            }

            return (
              <circle
                key={`pt-${m.id}-${idx}`}
                cx={m.px}
                cy={m.py}
                r={markerR}
                stroke={SEND_CARD_RED}
                strokeWidth="2"
                fill="none"
              />
            )
          })}
        </svg>
      )}

      {/* 4. Top Editorial Overlay Header */}
      <div className="relative z-20 p-4 sm:p-5 flex flex-col">
        {/* Top Row: Jalur Wordmark + Problem Name (Left) & Large Grade (Right) */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <img
              src="/jalur-logo-white.png"
              alt="jalur."
              className="h-4 sm:h-5 w-auto object-contain mb-1.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]"
            />
            <h2 className="text-sm sm:text-base font-bold text-white leading-tight truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
              {data.problemName || 'Gugusan Bintang'}
            </h2>
          </div>

          <div
            style={displayStyle}
            className="text-3xl sm:text-4xl font-black uppercase text-white leading-[0.88] tracking-tight shrink-0 text-right drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
          >
            {(data.grade || '5.12 B').toUpperCase()}
          </div>
        </div>

        {/* Spec Row: 4 Equal Outlined Translucent Pills */}
        <div className="grid grid-cols-4 gap-1.5 mt-2.5">
          {specs.map((spec, i) => (
            <div
              key={i}
              className="py-[3px] px-1 rounded-full border border-white/65 bg-black/15 backdrop-blur-[1px] text-center text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
            >
              {spec}
            </div>
          ))}
        </div>

        {/* Bottom Header Row: Stacked Climber Name (Left) & Ascent Style + Attempts (Right) */}
        <div className="flex items-start justify-between gap-3 mt-2.5">
          <div
            style={displayStyle}
            className="text-lg sm:text-xl font-black uppercase leading-[0.94] tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] min-w-0"
          >
            <div className="truncate">{nameLine1}</div>
            {nameLine2 && <div className="truncate">{nameLine2}</div>}
          </div>

          <div
            style={displayStyle}
            className="text-lg sm:text-xl font-black uppercase leading-[0.94] tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] shrink-0 text-right"
          >
            <div>{ascentLabel}</div>
            <div>{attemptsLabel}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
