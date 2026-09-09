'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Problem, TopoMarker } from '@/lib/mock-data'
import { ZoomIn, ZoomOut, RotateCcw, Mountain, Layers, Compass } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

interface TopoCanvasProps {
  problem: Problem
  imageUrl: string
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

export default function TopoCanvas({ problem, imageUrl }: TopoCanvasProps) {
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
        className={`relative w-full overflow-hidden rounded-2xl h-[52vh] sm:h-[500px] md:h-[560px] lg:h-[620px] border transition-colors select-none ${
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
        className={`p-4 rounded-2xl border space-y-3 transition-colors ${
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
      </div>
    </div>
  )
}
