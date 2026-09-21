'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Problem, TopoMarker } from '@/lib/mock-data'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Mountain,
  Layers,
  Compass,
  Hand,
  Anchor,
  ThumbsUp,
  Video,
  AlertCircle,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

interface TopoCanvasProps {
  problem: Problem
  imageUrl: string
  onLogAscent?: () => void
  onSetNewRoute?: () => void
}

const markerStyle: Record<string, { bg: string; text: string; glow: string; label: string }> = {
  S: { bg: '#CCFF00', text: '#12161A', glow: 'rgba(204,255,0,0.6)', label: 'START' },
  B: { bg: '#06B6D4', text: '#12161A', glow: 'rgba(6,182,212,0.6)', label: 'BOLT' },
  Z: { bg: '#06B6D4', text: '#12161A', glow: 'rgba(6,182,212,0.6)', label: 'CRUX' },
  P: { bg: '#FF6B00', text: '#FFFFFF', glow: 'rgba(255,107,0,0.6)', label: 'PITCH' },
  T: { bg: '#EF4444', text: '#FFFFFF', glow: 'rgba(239,68,68,0.6)', label: 'TOP' },
}

function TopoMarkerPin({
  marker,
  index,
  isMultiPitch,
  totalMarkers,
}: {
  marker: TopoMarker
  index: number
  isMultiPitch: boolean
  totalMarkers: number
}) {
  const style = markerStyle[marker.type] || markerStyle.B
  const displayLabel =
    marker.label ||
    (isMultiPitch && marker.type === 'P'
      ? `P${index}`
      : isMultiPitch && marker.type === 'T'
      ? 'TOP'
      : marker.type)

  const tooltipLabel = isMultiPitch
    ? marker.type === 'S'
      ? 'Base / Start P1'
      : marker.type === 'T'
      ? `Summit / Top Out (P${totalMarkers - 1})`
      : `Belay Station ${displayLabel} (Anchor)`
    : `${style.label} (${marker.x.toFixed(0)}%, ${marker.y.toFixed(0)}%)`

  return (
    <motion.div
      className="absolute flex flex-col items-center cursor-pointer group"
      style={{
        left: `${marker.x}%`,
        top: `${marker.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 25,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.25 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Tooltip on Hover */}
      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-white/20 text-chalk text-[9px] font-mono px-2 py-0.5 rounded-lg pointer-events-none whitespace-nowrap shadow-2xl z-30">
        {tooltipLabel}
      </div>

      <div
        className={`rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white/40 transition-all ${
          isMultiPitch && marker.type === 'P'
            ? 'w-8 h-8 md:w-9 md:h-9 text-xs md:text-sm font-mono'
            : 'w-7 h-7 md:w-8 md:h-8 text-xs md:text-sm'
        }`}
        style={{
          backgroundColor: style.bg,
          color: style.text,
          boxShadow: `0 0 16px ${style.glow}`,
        }}
      >
        {displayLabel}
      </div>
      {/* Anchor line pin */}
      <div
        className="w-px h-3 md:h-4"
        style={{ backgroundColor: style.bg + '90' }}
      />
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: style.bg }}
      />
    </motion.div>
  )
}

export default function TopoCanvas({ problem, imageUrl, onLogAscent, onSetNewRoute }: TopoCanvasProps) {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const [scale, setScale] = useState(1)
  const [activePitch, setActivePitch] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeImage = problem.imageUrl || imageUrl

  const isMultiPitch = problem.discipline === 'multipitch'
  const isSport = problem.discipline === 'sport'
  const lineColor = isMultiPitch ? '#FF6B00' : isSport ? '#CCFF00' : '#06B6D4'
  const glowColor = isMultiPitch
    ? 'rgba(255,107,0,0.75)'
    : isSport
    ? 'rgba(204,255,0,0.7)'
    : 'rgba(6,182,212,0.7)'

  const category =
    problem.category ||
    (problem.discipline === 'sport' || problem.discipline === 'lead'
      ? 'lead'
      : problem.discipline === 'multipitch' || problem.discipline === 'trad'
      ? 'trad'
      : 'boulder')

  const heightDisplay = problem.height || problem.pitchLength || problem.totalHeight || (category === 'boulder' ? '4.2m' : '22m')
  const holdsCountDisplay = problem.holdsCount || (problem.markers && problem.markers.length > 0 ? problem.markers.length * 3 : 14)
  const holdDetailsDisplay =
    problem.holdDetails ||
    (category === 'boulder'
      ? 'Dual crimp sit start, balance footwork to undercling crux, jug top-out'
      : 'Positive crimp sequence leading to rest pocket, crimpy headwall to ring anchor')

  const isLeadOrTrad = category === 'lead' || category === 'trad' || problem.discipline === 'sport' || problem.discipline === 'multipitch'
  const anchorCountDisplay = problem.anchorCount || problem.boltCount || (isLeadOrTrad ? 9 : undefined)
  const anchorTypeDisplay = problem.anchorType || (isLeadOrTrad ? 'Double Ring Stainless Chain Anchor' : 'N/A (Bouldering Crashpad landing)')
  const totalVotes = (problem.gradeVotes || []).reduce((acc, v) => acc + v.votes, 0)

  // Full SVG line connecting all markers
  const svgPathD =
    problem.markers.length >= 2
      ? problem.markers.reduce((acc, m, idx) => {
          return idx === 0 ? `M ${m.x} ${m.y}` : `${acc} L ${m.x} ${m.y}`
        }, '')
      : ''

  // Pitch detail for the currently selected pitch
  const activePitchDetail =
    isMultiPitch && activePitch && problem.pitchBreakdown
      ? problem.pitchBreakdown.find((p) => p.pitchNumber === activePitch)
      : null

  const handleZoomIn = () => {
    setScale((s) => Math.min(Number((s + 0.5).toFixed(1)), 3))
  }

  const handleZoomOut = () => {
    setScale((s) => Math.max(Number((s - 0.5).toFixed(1)), 1))
  }

  const handleResetZoom = () => {
    setScale(1)
  }

  const handleDoubleTap = () => {
    setScale((s) => (s > 1 ? 1 : 2))
  }

  return (
    <div className="space-y-4">
      {/* ============================================================ */}
      {/* 1. PHOTO CANVAS AREA                                         */}
      {/* ============================================================ */}
      <div
        ref={containerRef}
        onDoubleClick={handleDoubleTap}
        className={`relative w-full overflow-hidden rounded-none md:rounded-2xl h-[56vh] sm:h-[500px] md:h-[560px] lg:h-[620px] border-y md:border transition-colors select-none ${
          isSandstone
            ? 'bg-[#1a1815]/10 border-[#1a1815]/20'
            : 'bg-black border-white/10'
        } ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      >
        {/* Pan and Zoom Layer */}
        <motion.div
          drag={scale > 1}
          dragConstraints={{
            left: -240 * (scale - 1),
            right: 240 * (scale - 1),
            top: -340 * (scale - 1),
            bottom: 340 * (scale - 1),
          }}
          dragElastic={0.1}
          dragMomentum={false}
          animate={{
            scale,
            x: scale === 1 ? 0 : undefined,
            y: scale === 1 ? 0 : undefined,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`absolute inset-0 w-full h-full origin-center ${
            scale > 1 ? 'touch-none cursor-grab active:cursor-grabbing' : 'cursor-default'
          }`}
        >
          {/* Topo Cliff Photo — Full frame */}
          <div
            className="absolute inset-0 bg-cover bg-center w-full h-full"
            style={{
              backgroundImage: `url(${activeImage})`,
            }}
          />

          {/* CONNECTED TOPO VECTOR PATH (SVG) — PURE WHITE LINE ONLY */}
          {svgPathD && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Clean crisp pure white dashed line */}
              <path
                d={svgPathD}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeDasharray="2.5 1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.85))' }}
              />

              {/* MULTI PITCH: Highlighted active pitch segment */}
              {isMultiPitch && activePitch && problem.markers.length >= 2 && (
                (() => {
                  const segIdx = activePitch - 1
                  const m1 = problem.markers[segIdx]
                  const m2 = problem.markers[segIdx + 1]
                  if (!m1 || !m2) return null
                  const highlightD = `M ${m1.x} ${m1.y} L ${m2.x} ${m2.y}`
                  return (
                    <g>
                      <path
                        d={highlightD}
                        stroke="#FFFFFF"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        fill="none"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.9))' }}
                      />
                    </g>
                  )
                })()
              )}
            </svg>
          )}

          {/* MULTI PITCH: Visual Pitch Labels along the route segments */}
          {isMultiPitch && problem.markers.length >= 2 && (
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              {problem.markers.slice(0, -1).map((m, idx) => {
                const nextM = problem.markers[idx + 1]
                const pitchNum = idx + 1
                const midX = (m.x + nextM.x) / 2
                const midY = (m.y + nextM.y) / 2
                const pitchDetail = problem.pitchBreakdown?.[idx]
                const isSelected = activePitch === pitchNum
                const offsetX = midX > 50 ? -12 : 12

                return (
                  <div
                    key={`pitch-badge-${pitchNum}`}
                    style={{
                      left: `${Math.min(86, Math.max(14, midX + offsetX))}%`,
                      top: `${midY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="absolute pointer-events-auto z-20"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActivePitch(isSelected ? null : pitchNum)
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl cursor-pointer transition-all backdrop-blur-md shadow-2xl ${
                        isSelected
                          ? 'bg-project text-white border-2 border-white scale-110 shadow-[0_0_18px_rgba(255,107,0,0.85)] font-bold'
                          : 'bg-black/85 border border-project/60 text-chalk hover:border-project hover:bg-black/95 hover:scale-105'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-white animate-ping' : 'bg-project'
                        }`}
                      />
                      <span className="font-mono font-black text-xs text-project">
                        Pitch {pitchNum}
                      </span>
                      {pitchDetail && (
                        <span className="font-mono text-[10px] text-chalk/90 font-medium">
                          · {pitchDetail.grade}{' '}
                          <span className="text-slate-ash font-normal">({pitchDetail.length})</span>
                        </span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Vector Markers / Pins (Start, Belay Stations P1-P3, Top) */}
          <div className="absolute inset-0 w-full h-full">
            {problem.markers.map((marker, idx) => (
              <TopoMarkerPin
                key={marker.id}
                marker={marker}
                index={idx}
                isMultiPitch={isMultiPitch}
                totalMarkers={problem.markers.length}
              />
            ))}
          </div>
        </motion.div>

        {/* FLOATING ZOOM CONTROLS */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/20 z-30 shadow-2xl">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-white transition-all touch-ripple"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-[11px] font-mono font-bold text-white transition-all"
            title="Click to reset zoom (1.0x)"
          >
            {scale.toFixed(1)}x
          </button>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-white transition-all touch-ripple"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn size={15} />
          </button>

          {scale > 1 && (
            <button
              onClick={handleResetZoom}
              className="w-8 h-8 rounded-lg bg-redpoint/20 hover:bg-redpoint/30 text-redpoint flex items-center justify-center transition-all"
              title="Reset Zoom"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>

        {/* MULTI PITCH: Top Pitch Navigator Bar */}
        {isMultiPitch && problem.pitchBreakdown && problem.pitchBreakdown.length > 0 && (
          <div className="absolute top-3 left-3 right-28 flex items-center gap-1.5 overflow-x-auto no-scrollbar z-30 pb-1">
            <button
              onClick={() => setActivePitch(null)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono transition-all flex-shrink-0 backdrop-blur-md ${
                activePitch === null
                  ? 'bg-project text-white font-bold shadow-lg border border-white/40'
                  : 'bg-black/75 text-slate-ash hover:text-chalk border border-white/10'
              }`}
            >
              All Pitches ({problem.pitchBreakdown.length}P)
            </button>
            {problem.pitchBreakdown.map((p) => {
              const isSelected = activePitch === p.pitchNumber
              return (
                <button
                  key={p.pitchNumber}
                  onClick={() => setActivePitch(isSelected ? null : p.pitchNumber)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono flex items-center gap-1.5 transition-all flex-shrink-0 backdrop-blur-md ${
                    isSelected
                      ? 'bg-project text-white font-bold shadow-lg border border-white/40 scale-105'
                      : 'bg-black/75 text-chalk/90 hover:text-chalk border border-white/10'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-project'
                    }`}
                  />
                  <span className="font-bold text-project">P{p.pitchNumber}</span>
                  <span className="text-slate-ash">·</span>
                  <span>{p.grade}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. ROUTE DETAILS & TOPO LEGEND (OUTSIDE / BELOW PHOTO BOX)    */}
      {/* ============================================================ */}
      <div
        className={`mx-4 md:mx-0 p-4 rounded-2xl border space-y-3 transition-colors ${
          isSandstone
            ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]'
            : 'bg-transparent border-white/10 text-chalk'
        }`}
      >
        {/* Header: Name, Grade & Discipline */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {/* Discipline Tag */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase ${
                  isSandstone
                    ? 'border-[#1a1815]/30 text-[#1a1815]'
                    : isSport
                    ? 'border-lime/40 text-lime'
                    : isMultiPitch
                    ? 'border-project/40 text-project'
                    : 'border-cyan-climb/40 text-cyan-climb'
                }`}
              >
                {isSport && <Mountain size={11} />}
                {isMultiPitch && <Layers size={11} />}
                {!isSport && !isMultiPitch && <Compass size={11} />}
                <span>
                  {isMultiPitch
                    ? `MULTI PITCH (${problem.totalPitches || 4} PITCHES)`
                    : isSport
                    ? 'SPORT CLIMBING'
                    : 'BOULDERING'}
                </span>
              </span>

              {problem.startType && !isMultiPitch && (
                <span
                  className={`text-[10px] font-light px-2 py-0.5 rounded-full border ${
                    isSandstone
                      ? 'border-[#1a1815]/20 text-[#1a1815]/70'
                      : 'border-white/10 text-slate-ash'
                  }`}
                >
                  {problem.startType}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              {problem.name}
            </h1>
            <p
              className={`text-xs font-light mt-0.5 ${
                isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
              }`}
            >
              FA: {problem.fa} · {problem.faDate}
            </p>
          </div>

          {/* Grade Badge */}
          <div
            className={`flex flex-col items-end px-3 py-1.5 rounded-xl border ${
              isSandstone
                ? 'border-[#1a1815]/30 text-[#1a1815]'
                : 'border-lime/40 text-lime'
            }`}
          >
            <span className="text-xl md:text-2xl font-black font-mono leading-none">
              {problem.grade}
            </span>
            <span
              className={`text-[10px] font-bold font-mono ${
                isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
              }`}
            >
              {problem.fontGrade}
            </span>
          </div>
        </div>

        {/* Topo Pin Legend Row */}
        <div
          className={`pt-2.5 border-t flex items-center justify-between gap-2 flex-wrap text-xs ${
            isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
          }`}
        >
          <span
            className={`text-[10px] uppercase font-bold tracking-widest ${
              isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
            }`}
          >
            Topo Legend:
          </span>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-lime text-granite flex items-center justify-center font-bold text-[9px]">
                S
              </span>
              <span
                className={`text-[11px] ${
                  isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                }`}
              >
                {isMultiPitch ? 'Base / Start' : 'Start'}
              </span>
            </div>

            {isSport && (
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-climb text-granite flex items-center justify-center font-bold text-[9px]">
                  B
                </span>
                <span
                  className={`text-[11px] ${
                    isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                  }`}
                >
                  Bolt
                </span>
              </div>
            )}

            {!isSport && !isMultiPitch && (
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-climb text-granite flex items-center justify-center font-bold text-[9px]">
                  Z
                </span>
                <span
                  className={`text-[11px] ${
                    isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                  }`}
                >
                  Crux / Zone
                </span>
              </div>
            )}

            {isMultiPitch && (
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-project text-white flex items-center justify-center font-bold text-[8px]">
                  P
                </span>
                <span
                  className={`text-[11px] ${
                    isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                  }`}
                >
                  Anchor
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-redpoint text-white flex items-center justify-center font-bold text-[9px]">
                T
              </span>
              <span
                className={`text-[11px] ${
                  isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                }`}
              >
                {isMultiPitch ? 'Summit' : 'Top Out'}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Pitch Active Pitch Detail Panel */}
        {isMultiPitch && activePitch && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl border mt-2 ${
              isSandstone
                ? 'border-project/40 bg-project/5 text-[#1a1815]'
                : 'border-project/40 bg-project/10 text-chalk'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="px-2 py-0.5 rounded bg-project text-white text-xs font-mono font-bold">
                PITCH {activePitch}
              </span>
              {activePitchDetail && (
                <span className="font-mono text-xs font-bold">
                  Grade: {activePitchDetail.grade} · Length: {activePitchDetail.length}
                </span>
              )}
            </div>
            <p className="text-xs font-light leading-relaxed">
              {activePitchDetail?.description ||
                `Pitch ${activePitch} climbing segment leading to the belay anchor.`}
            </p>
          </motion.div>
        )}

        {/* Log Ascent / Telah Menyelesaikan Rute Button */}
        {onLogAscent && (
          <div className="pt-3 border-t border-black/10 dark:border-white/10 mt-2">
            <button
              onClick={onLogAscent}
              className="w-full py-3 px-4 rounded-xl bg-lime hover:bg-lime-dim text-granite font-bold text-sm flex items-center justify-center gap-2 shadow-lime-glow-sm transition-all touch-ripple"
            >
              <span>🎉 Log Ascent / Telah Menyelesaikan Rute</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. QUICK SPECS STRIP (7. TINGGI, 8. PEGANGAN, 9. ANCHOR)     */}
      {/* ============================================================ */}
      <div className="mx-4 md:mx-0 grid grid-cols-3 gap-2.5 text-center">
        <div className={`p-3 rounded-2xl border ${isSandstone ? 'bg-white/60 border-[#1a1815]/15 shadow-sm' : 'bg-crag/50 border-white/5'}`}>
          <div className={`text-[10px] uppercase font-bold tracking-wider ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
            7. Tinggi Jalur
          </div>
          <div className={`text-base font-bold font-mono mt-1 ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
            {heightDisplay}
          </div>
        </div>

        <div className={`p-3 rounded-2xl border ${isSandstone ? 'bg-white/60 border-[#1a1815]/15 shadow-sm' : 'bg-crag/50 border-white/5'}`}>
          <div className={`text-[10px] uppercase font-bold tracking-wider ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
            8. Titik Pegangan
          </div>
          <div className={`text-base font-bold font-mono mt-1 ${isSandstone ? 'text-[#1a1815]' : 'text-cyan-400'}`}>
            ~{holdsCountDisplay} Holds
          </div>
        </div>

        <div className={`p-3 rounded-2xl border ${isSandstone ? 'bg-white/60 border-[#1a1815]/15 shadow-sm' : 'bg-crag/50 border-white/5'}`}>
          <div className={`text-[10px] uppercase font-bold tracking-wider ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
            9. Anchor / Pengaman
          </div>
          <div className={`text-base font-bold font-mono mt-1 truncate ${isSandstone ? 'text-[#1a1815]' : 'text-lime'}`}>
            {isLeadOrTrad ? `${anchorCountDisplay} Bolts` : 'Crashpad'}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. BAGIAN 1: SPECS & KARAKTERISTIK JALUR                      */}
      {/* ============================================================ */}
      <div
        className={`mx-4 md:mx-0 p-4 rounded-2xl border space-y-4 transition-colors ${
          isSandstone
            ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]'
            : 'bg-transparent border-white/10 text-chalk'
        }`}
      >
        <div className="flex items-center gap-2 pb-2.5 border-b border-current/10">
          <Layers size={16} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
          <h3 className="font-bold text-sm uppercase tracking-wider">
            1. Specs & Karakteristik Jalur
          </h3>
        </div>

        {/* Route Description */}
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${
            isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
          }`}>
            Karakteristik & Deskripsi Jalur
          </div>
          <p className={`text-xs md:text-sm leading-relaxed ${isSandstone ? 'text-[#1a1815]/85' : 'text-chalk/85'}`}>
            {problem.description || 'Jalur pemanjatan outdoor yang menantang dengan karakteristik batuan alami dan sequence teknikal.'}
          </p>
        </div>

        {/* 8. Titik + Karakter Pegangan */}
        <div className={`p-3.5 rounded-xl border ${
          isSandstone ? 'bg-[#1a1815]/5 border-[#1a1815]/10' : 'bg-granite/70 border-white/5'
        }`}>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold uppercase tracking-wider">
            <Hand size={14} className={isSandstone ? 'text-[#1a1815]' : 'text-cyan-400'} />
            <span>8. Karakter Pegangan & Posisi Start</span>
          </div>
          <p className={`text-xs leading-relaxed mb-2.5 ${isSandstone ? 'text-[#1a1815]/80' : 'text-slate-ash'}`}>
            {holdDetailsDisplay}
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono flex-wrap">
            <span className={`px-2 py-0.5 rounded ${
              isSandstone ? 'bg-white text-[#1a1815] border border-[#1a1815]/15' : 'bg-crag text-chalk'
            }`}>
              Total Titik: ~{holdsCountDisplay} Holds
            </span>
            <span className={`px-2 py-0.5 rounded ${
              isSandstone ? 'bg-white text-[#1a1815] border border-[#1a1815]/15' : 'bg-crag text-chalk'
            }`}>
              Start: {problem.startType || (category === 'boulder' ? 'Sit Start (SS)' : 'Ground Stand')}
            </span>
          </div>
        </div>

        {/* 9. Jumlah Anchor & Pengaman */}
        <div className={`p-3.5 rounded-xl border ${
          isSandstone ? 'bg-[#1a1815]/5 border-[#1a1815]/10' : 'bg-granite/70 border-white/5'
        }`}>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold uppercase tracking-wider">
            <Anchor size={14} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
            <span>9. Jumlah Anchor & Pengaman</span>
          </div>
          {isLeadOrTrad ? (
            <div className="space-y-1 text-xs">
              <p><span className="font-bold">Baut Pengaman:</span> {anchorCountDisplay} titik pengaman baut expansion.</p>
              <p><span className="font-bold">Tipe Anchor Top:</span> {anchorTypeDisplay}.</p>
            </div>
          ) : (
            <div className="space-y-1 text-xs">
              <p><span className="font-bold">Sistem Pendaratan:</span> {problem.landingQuality || 'Tanah datar rumput'}.</p>
              <p><span className="font-bold">Rekomendasi Crashpad:</span> {problem.padRecommendation || 'Minimal 2 crashpad & 1 spotter'}.</p>
            </div>
          )}
        </div>

        {/* Konsensus Grade Komunitas */}
        {problem.gradeVotes && problem.gradeVotes.length > 0 && (
          <div className={`p-3.5 rounded-xl border ${
            isSandstone ? 'bg-[#1a1815]/5 border-[#1a1815]/10' : 'bg-granite/70 border-white/5'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <ThumbsUp size={13} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
                <span>Konsensus Grade Komunitas</span>
              </div>
              <span className="text-[11px] font-mono opacity-70">
                {problem.ascentCount || 0} Ascents Terdata
              </span>
            </div>
            <div className="space-y-1.5">
              {problem.gradeVotes.map(v => {
                const pct = totalVotes > 0 ? Math.round((v.votes / totalVotes) * 100) : 0
                return (
                  <div key={v.grade} className="flex items-center gap-2 text-xs">
                    <span className="font-mono w-10 text-right opacity-70">{v.grade}</span>
                    <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                      isSandstone ? 'bg-[#1a1815]/10' : 'bg-crag-light'
                    }`}>
                      <div
                        className={`h-full rounded-full ${isSandstone ? 'bg-[#1a1815]' : 'bg-lime'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono w-8 text-right font-medium">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 5. BAGIAN 2: TOPO MARKERS SEQUENCE                           */}
      {/* ============================================================ */}
      <div
        className={`mx-4 md:mx-0 p-4 rounded-2xl border space-y-3 transition-colors ${
          isSandstone
            ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]'
            : 'bg-transparent border-white/10 text-chalk'
        }`}
      >
        <div className="flex items-center gap-2 pb-2.5 border-b border-current/10">
          <Compass size={16} className={isSandstone ? 'text-[#1a1815]' : 'text-cyan-400'} />
          <h3 className="font-bold text-sm uppercase tracking-wider">
            2. Topo Markers Sequence
          </h3>
        </div>

        <div className="space-y-2">
          {problem.markers.map((m, idx) => {
            const mStyle = markerStyle[m.type] || markerStyle.B
            return (
              <div
                key={m.id || idx}
                className={`flex items-center justify-between p-2.5 rounded-xl border ${
                  isSandstone ? 'bg-[#1a1815]/5 border-[#1a1815]/10' : 'bg-granite/70 border-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: mStyle.bg, color: mStyle.text }}
                  >
                    {m.type}
                  </span>
                  <span className="font-medium text-xs">
                    {m.label || mStyle.label}
                  </span>
                </div>
                <span className={`font-mono text-[11px] ${
                  isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                }`}>
                  Coord: {m.x}%, {m.y}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. BAGIAN 3: BETA & CRUX SEQUENCE                            */}
      {/* ============================================================ */}
      <div
        className={`mx-4 md:mx-0 p-4 rounded-2xl border space-y-4 transition-colors ${
          isSandstone
            ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]'
            : 'bg-transparent border-white/10 text-chalk'
        }`}
      >
        <div className="flex items-center gap-2 pb-2.5 border-b border-current/10">
          <Video size={16} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
          <h3 className="font-bold text-sm uppercase tracking-wider">
            3. Beta & Crux Sequence
          </h3>
        </div>

        {/* 10. Crux Sequence & Beta Tips */}
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
            isSandstone ? 'text-[#1a1815]' : 'text-lime'
          }`}>
            10. Crux Sequence & Beta Tips
          </div>
          <p className={`text-xs md:text-sm leading-relaxed p-3.5 rounded-xl border ${
            isSandstone
              ? 'bg-[#1a1815]/5 border-[#1a1815]/10 text-[#1a1815]/90'
              : 'bg-granite/70 border-white/5 text-chalk/90'
          }`}>
            {problem.betaText ||
              'Kunci jalur ini berada di transisi move ke-4. Tempatkan heel hook tinggi pada arête samping kiri, lakukan deadpoint terukur ke crimp mikro dengan tangan kanan, kemudian kunci core sebelum memindahkan kaki ke ledge kecil.'}
          </p>
        </div>

        {/* Video Beta Dokumentasi */}
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${
            isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
          }`}>
            Video Beta Dokumentasi
          </div>
          {problem.betaVideoUrl ? (
            <div className="rounded-2xl overflow-hidden aspect-video border border-current/15 shadow-lg bg-black">
              <iframe
                src={problem.betaVideoUrl}
                className="w-full h-full"
                allowFullScreen
                title={`Beta Video - ${problem.name}`}
              />
            </div>
          ) : (
            <div className={`aspect-video rounded-2xl border flex flex-col items-center justify-center gap-2.5 p-4 text-center ${
              isSandstone ? 'bg-[#1a1815]/5 border-[#1a1815]/10' : 'bg-granite/70 border-white/5'
            }`}>
              <Video size={32} className={isSandstone ? 'text-[#1a1815]/40' : 'text-slate-ash'} />
              <p className={`text-xs ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>
                Belum ada video beta resmi untuk jalur ini.
              </p>
              {onLogAscent && (
                <button
                  onClick={onLogAscent}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    isSandstone ? 'bg-[#1a1815] text-white hover:bg-black' : 'bg-lime text-granite hover:bg-lime-dim'
                  }`}
                >
                  <ExternalLink size={12} /> Log Ascent & Upload Beta
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 7. BAGIAN 4: AKSES & ETIKA TEBING                             */}
      {/* ============================================================ */}
      <div
        className={`mx-4 md:mx-0 p-4 rounded-2xl border space-y-3 transition-colors ${
          isSandstone
            ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815]'
            : 'bg-transparent border-white/10 text-chalk'
        }`}
      >
        <div className="flex items-center gap-2 pb-2.5 border-b border-current/10">
          <AlertCircle size={16} className="text-project" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-project">
            4. Akses & Etika Tebing
          </h3>
        </div>
        <p className="text-xs leading-relaxed opacity-90">
          {problem.accessInfo || 'Wajib melapor ke pos perizinan setempat. Dilarang meninggalkan sampah/kapur berlebih, dan gunakan alas pelindung ground bila diperlukan.'}
        </p>
        <div className={`p-3 rounded-xl border text-xs ${
          isSandstone ? 'bg-[#1a1815]/5 border-[#1a1815]/10' : 'bg-granite/70 border-white/5'
        }`}>
          <span className="font-bold block mb-0.5 opacity-70">Local Contact / Basecamp Coordinator:</span>
          <span className="font-medium">{problem.localContact || 'Pengelola Kawasan & Komunitas Pemanjat Tebing Lokal'}</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 8. PROBLEMS CALL TO ACTIONS (DUAL CTAs)                       */}
      {/* ============================================================ */}
      <div className="mx-4 md:mx-0 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 pb-6">
        {onLogAscent && (
          <button
            onClick={onLogAscent}
            className={`h-12 w-full rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-md active:scale-[0.98] ${
              isSandstone
                ? 'bg-[#1a1815] text-white hover:bg-black'
                : 'bg-lime text-granite hover:bg-lime-dim shadow-lime-glow'
            }`}
          >
            <span>🎉 Submit Sent (Log Ascent)</span>
          </button>
        )}

        {onSetNewRoute && (
          <button
            onClick={onSetNewRoute}
            className={`h-12 w-full rounded-xl flex items-center justify-center gap-2 text-sm font-bold border transition-all active:scale-[0.98] ${
              isSandstone
                ? 'border-[#1a1815]/40 text-[#1a1815] hover:bg-[#1a1815]/5'
                : 'border-white/20 text-chalk hover:bg-white/5 hover:border-lime/40'
            }`}
          >
            <Plus size={16} />
            <span>Set New Route</span>
          </button>
        )}
      </div>
    </div>
  )
}
