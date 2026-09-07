'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Problem, TopoMarker } from '@/lib/mock-data'
import { topoMarkers } from '@/lib/tokens'
import { ZoomIn, ZoomOut, RotateCcw, Mountain, Layers, Compass, X } from 'lucide-react'

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
      ? 'Dasar Tebing / Start P1'
      : marker.type === 'T'
      ? `Stasiun Puncak / Top Out (P${totalMarkers - 1})`
      : `Stasiun Belay ${displayLabel} (Anchor)`
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
  const [scale, setScale] = useState(1)
  const [showLegend, setShowLegend] = useState(true)
  const [activePitch, setActivePitch] = useState<number | null>(null)

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

  return (
    <div className="relative w-full bg-granite overflow-hidden rounded-2xl h-[58vh] md:h-[540px] lg:h-[620px] border border-white/10 select-none">
      {/* Topo Cliff Photo — Full frame */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
        style={{
          backgroundImage: `url(${activeImage})`,
          transform: `scale(${scale})`,
        }}
      />

      {/* Subtle contrast overlay */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* CONNECTED TOPO VECTOR PATH (SVG) */}
      {svgPathD && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300"
          style={{ transform: `scale(${scale})` }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Base outer glow line */}
          <path
            d={svgPathD}
            stroke={lineColor}
            strokeWidth="2.4"
            strokeDasharray="2 1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ filter: `drop-shadow(0 0 7px ${glowColor})` }}
          />
          {/* Base inner crisp line */}
          <path
            d={svgPathD}
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeDasharray="2 1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
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
                  {/* Super vibrant glowing active segment */}
                  <path
                    d={highlightD}
                    stroke="#FF6B00"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(255,107,0,1))' }}
                  />
                  <path
                    d={highlightD}
                    stroke="#FFFFFF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              )
            })()
          )}
        </svg>
      )}

      {/* MULTI PITCH: Visual Pitch Labels along the route segments */}
      {isMultiPitch && problem.markers.length >= 2 && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300"
          style={{ transform: `scale(${scale})` }}
        >
          {problem.markers.slice(0, -1).map((m, idx) => {
            const nextM = problem.markers[idx + 1]
            const pitchNum = idx + 1
            const midX = (m.x + nextM.x) / 2
            const midY = (m.y + nextM.y) / 2
            const pitchDetail = problem.pitchBreakdown?.[idx]
            const isSelected = activePitch === pitchNum

            // Offset tag to the side so the line remains visible
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
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-300"
        style={{ transform: `scale(${scale})` }}
      >
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

      {/* MULTI PITCH: Horizontal Quick Pitch Navigator Bar */}
      {isMultiPitch && problem.pitchBreakdown && problem.pitchBreakdown.length > 0 && (
        <div className="absolute top-16 left-3 right-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar z-30 pb-1">
          <button
            onClick={() => setActivePitch(null)}
            className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all flex-shrink-0 backdrop-blur-md ${
              activePitch === null
                ? 'bg-project text-white font-bold shadow-lg border border-white/40'
                : 'bg-black/75 text-slate-ash hover:text-chalk border border-white/10'
            }`}
          >
            Semua Pitch ({problem.pitchBreakdown.length}P)
          </button>
          {problem.pitchBreakdown.map((p) => {
            const isSelected = activePitch === p.pitchNumber
            return (
              <button
                key={p.pitchNumber}
                onClick={() => setActivePitch(isSelected ? null : p.pitchNumber)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono flex items-center gap-1.5 transition-all flex-shrink-0 backdrop-blur-md ${
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
                <span className="text-white/50 text-[10px]">({p.length})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Desktop Zoom controls */}
      <div className="hidden md:flex absolute bottom-4 right-4 items-center gap-1.5 glass p-1.5 rounded-xl z-30">
        <button
          onClick={() => setScale((s) => Math.min(s + 0.25, 2.5))}
          className="w-8 h-8 rounded-lg bg-crag flex items-center justify-center text-chalk hover:bg-crag-light transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s - 0.25, 1))}
          className="w-8 h-8 rounded-lg bg-crag flex items-center justify-center text-chalk hover:bg-crag-light transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => setScale(1)}
          className="w-8 h-8 rounded-lg bg-crag flex items-center justify-center text-chalk hover:bg-crag-light transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Topo Legend */}
      {showLegend && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-3 right-3 glass bg-black/70 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col gap-2 z-30 max-w-[180px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-ash uppercase tracking-wider">
              Legenda Topo
            </span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-slate-ash hover:text-chalk p-0.5"
            >
              <X size={12} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-chalk font-light">
            <span className="w-5 h-5 rounded-full bg-lime text-granite flex items-center justify-center font-bold text-[10px]">
              S
            </span>
            <span>{isMultiPitch ? 'Dasar Jalur' : 'Titik Start'}</span>
          </div>
          {isSport && (
            <div className="flex items-center gap-2 text-[11px] text-chalk font-light">
              <span className="w-5 h-5 rounded-full bg-cyan-climb text-granite flex items-center justify-center font-bold text-[10px]">
                B
              </span>
              <span>Baut (Bolt)</span>
            </div>
          )}
          {isMultiPitch && (
            <div className="flex items-center gap-2 text-[11px] text-chalk font-light">
              <span className="w-5 h-5 rounded-full bg-project text-chalk flex items-center justify-center font-bold text-[9px] font-mono">
                P1..
              </span>
              <span>Stasiun Anchor</span>
            </div>
          )}
          {!isSport && !isMultiPitch && (
            <div className="flex items-center gap-2 text-[11px] text-chalk font-light">
              <span className="w-5 h-5 rounded-full bg-cyan-climb text-granite flex items-center justify-center font-bold text-[10px]">
                Z
              </span>
              <span>Crux / Zone</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[11px] text-chalk font-light">
            <span className="w-5 h-5 rounded-full bg-redpoint text-white flex items-center justify-center font-bold text-[10px]">
              T
            </span>
            <span>{isMultiPitch ? 'Puncak (Summit)' : 'Top Out'}</span>
          </div>
        </motion.div>
      )}

      {/* Grade & Discipline Pill — top left */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-30">
        <div className="glass bg-black/70 backdrop-blur-md rounded-2xl p-2.5 md:p-3 border border-white/10">
          <div className="text-[9px] font-mono text-slate-ash uppercase tracking-widest mb-1 flex items-center gap-1.5">
            {isSport && <Mountain size={11} className="text-lime" />}
            {isMultiPitch && <Layers size={11} className="text-project" />}
            {!isSport && !isMultiPitch && <Compass size={11} className="text-cyan-climb" />}
            <span>
              {isMultiPitch
                ? `MULTI PITCH (${problem.totalPitches || 4} PITCHES)`
                : isSport
                ? 'SPORT CLIMBING'
                : 'BOULDERING'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lime text-xl md:text-2xl font-black">{problem.grade}</span>
            <span className="text-slate-ash text-xs md:text-sm font-bold">/ {problem.fontGrade}</span>
          </div>
        </div>
      </div>

      {/* Problem name or Multi-Pitch Active Info Card — bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 bg-gradient-to-t from-granite via-granite/85 to-transparent z-20">
        {isMultiPitch && activePitch ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-crag/95 border border-project/50 rounded-2xl p-3 md:p-3.5 backdrop-blur-md flex items-start justify-between gap-3 shadow-2xl"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-project text-white text-xs font-mono font-bold">
                  PITCH {activePitch}
                </span>
                {activePitchDetail && (
                  <>
                    <span className="font-mono text-chalk text-xs font-bold">
                      Grade: {activePitchDetail.grade}
                    </span>
                    <span className="text-slate-ash text-xs font-light">
                      · Panjang: {activePitchDetail.length}
                    </span>
                  </>
                )}
              </div>
              <p className="text-chalk/90 text-xs font-light leading-relaxed">
                {activePitchDetail?.description ||
                  `Segmen pemanjatan Pitch ${activePitch} menuju stasiun anchor.`}
              </p>
            </div>
            <button
              onClick={() => setActivePitch(null)}
              className="text-slate-ash hover:text-chalk text-xs px-2.5 py-1 bg-granite rounded-lg border border-white/10 flex-shrink-0"
            >
              Tutup
            </button>
          </motion.div>
        ) : (
          <div>
            <div className="text-[10px] font-mono text-slate-ash uppercase tracking-widest mb-0.5">
              Jalur Pemanjatan Terpetakan
            </div>
            <h2 className="text-chalk font-black text-lg md:text-2xl">{problem.name}</h2>
          </div>
        )}
      </div>
    </div>
  )
}
