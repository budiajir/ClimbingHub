'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Play,
  AlertCircle,
  ThumbsUp,
  Award,
  ExternalLink,
  Mountain,
  Layers,
  Compass,
  Plus,
  ShieldCheck,
  MapPin,
  Ruler,
  Anchor,
  Hand,
  Calendar,
  CheckCircle2,
  Video,
  Info,
} from 'lucide-react'
import { Problem, TopoMarker } from '@/lib/mock-data'
import { useTheme } from '@/lib/theme-context'
import Pictogram from '@/components/common/Pictogram'

interface ProblemSheetProps {
  problem: Problem
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

export default function ProblemSheet({ problem, onLogAscent, onSetNewRoute, onClose }: ProblemSheetProps) {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const [activeTab, setActiveTab] = useState<'specs' | 'topo' | 'beta' | 'access'>('specs')

  const totalVotes = (problem.gradeVotes || []).reduce((acc, v) => acc + v.votes, 0)

  // 1. Category
  const category =
    problem.category ||
    (problem.discipline === 'sport' || problem.discipline === 'lead'
      ? 'lead'
      : problem.discipline === 'multipitch' || problem.discipline === 'trad'
      ? 'trad'
      : 'boulder')

  // 3. Setter + Tahun
  const setterDisplay = problem.setterYear || `${problem.setter || problem.fa || 'Local Climber'} (${problem.faDate || '2023'})`

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
    { key: 'specs', label: '1. Specs & Route' },
    { key: 'topo', label: '2. Photo & Topo' },
    { key: 'beta', label: '3. Beta & Crux' },
    { key: 'access', label: '4. Access & Ethics' },
  ]

  // Topo marker style helper
  const markerColors: Record<string, { bg: string; text: string; label: string }> = {
    S: { bg: '#CCFF00', text: '#12161A', label: 'Start' },
    B: { bg: '#06B6D4', text: '#12161A', label: 'Bolt' },
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

            {/* 3. Route Setter + Tahun */}
            <p className={`text-xs mt-0.5 font-light ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>
              Setter: <span className="font-medium">{setterDisplay}</span>
            </p>
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

        {/* Quick Spec Strip: 7. Height, 8. Holds, 9. Anchor / Protection */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-dashed border-current/15 text-center">
          <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-white/60 border-[#1a1815]/10' : 'bg-crag/50 border-white/5'}`}>
            <div className={`text-[10px] uppercase font-light ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
              7. Route Height
            </div>
            <div className={`text-sm font-bold font-mono mt-0.5 ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
              {heightDisplay}
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-white/60 border-[#1a1815]/10' : 'bg-crag/50 border-white/5'}`}>
            <div className={`text-[10px] uppercase font-light ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
              8. Holds & Grip
            </div>
            <div className={`text-sm font-bold font-mono mt-0.5 ${isSandstone ? 'text-[#1a1815]' : 'text-cyan-400'}`}>
              ~{holdsCountDisplay} Holds
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${isSandstone ? 'bg-white/60 border-[#1a1815]/10' : 'bg-crag/50 border-white/5'}`}>
            <div className={`text-[10px] uppercase font-light ${isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'}`}>
              9. Anchor / Protection
            </div>
            <div className={`text-sm font-bold font-mono mt-0.5 truncate ${isSandstone ? 'text-[#1a1815]' : 'text-lime'}`}>
              {isLeadOrTrad ? `${anchorCountDisplay} Bolts` : 'Crashpad'}
            </div>
          </div>
        </div>
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
      <div className="overflow-y-auto px-4 md:px-6 py-4" style={{ maxHeight: 'calc(88vh - 275px)' }}>
        <AnimatePresence mode="wait">
          {/* TAB 1: SPECS & JALUR DETAIL */}
          {activeTab === 'specs' && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Route Description */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                  isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                }`}>
                  Route Characteristics & Description
                </h4>
                <p className={`text-sm font-normal leading-relaxed ${isSandstone ? 'text-[#1a1815]/85' : 'text-chalk/85'}`}>
                  {problem.description || 'Challenging outdoor climbing route featuring natural rock characteristics and technical sequencing.'}
                </p>
              </div>

              {/* 8. Holds Details */}
              <div className={`p-3.5 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Hand size={15} className={isSandstone ? 'text-[#1a1815]' : 'text-cyan-400'} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
                    8. Holds & Grip Details
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

              {/* 9. Anchor / Protection Details */}
              <div className={`p-3.5 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Anchor size={15} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
                    9. Anchors & Protection
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

          {/* TAB 2: FOTO & TOPO JALUR */}
          {activeTab === 'topo' && (
            <motion.div
              key="topo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* 4. Foto Jalur & 5. Topo Jalur Canvas */}
              <div className={`relative rounded-2xl overflow-hidden border aspect-[4/3] bg-black ${
                isSandstone ? 'border-[#1a1815]/20' : 'border-white/10'
              }`}>
                {/* 4. Foto Jalur */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${problem.imageUrl || '/crags/citatah.jpg'})` }}
                />
                <div className="absolute inset-0 bg-black/25" />

                {/* 5. Topo Jalur SVG Route Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                  <polyline
                    points={markers.map((m) => `${m.x}%,${m.y}%`).join(' ')}
                    fill="none"
                    stroke={isSandstone ? '#1a1815' : '#B1FA63'}
                    strokeWidth="3.5"
                    strokeDasharray="6 3"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
                  />
                </svg>

                {/* Topo Markers Overlay */}
                {markers.map((m, idx) => {
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
                  <span>Z = Crux</span>
                  <span>B = Bolt</span>
                  <span>T = Top</span>
                </div>
              </div>

              {/* Marker Points Breakdown */}
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'
              }`}>
                <div className={`font-bold uppercase tracking-wider text-[11px] mb-1 ${
                  isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                }`}>
                  5. Topo Markers Sequence
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

          {/* TAB 3: 10. BETA (CRUX & VIDEO) */}
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
                    10. Crux Sequence & Beta Tips
                  </span>
                </div>
                <p className={`text-sm leading-relaxed font-normal ${isSandstone ? 'text-[#1a1815]/90' : 'text-chalk/90'}`}>
                  {problem.betaText ||
                    'The crux of this route is at the 4th move transition. Place a high heel hook on the left arête, execute a precise deadpoint to a micro crimp with your right hand, engage your core, and shift feet onto the small ledge.'}
                </p>
              </div>

              {/* Beta Video Player / Embed */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                  isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                }`}>
                  Beta Video Documentation
                </h4>
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
                    isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'
                  }`}>
                    <Video size={32} className={isSandstone ? 'text-[#1a1815]/40' : 'text-slate-ash'} />
                    <p className={`text-xs ${isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'}`}>
                      No official beta video recorded for this route yet.
                    </p>
                    <button
                      onClick={onLogAscent}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        isSandstone ? 'bg-[#1a1815] text-white hover:bg-black' : 'bg-lime text-granite hover:bg-lime-dim'
                      }`}
                    >
                      <ExternalLink size={12} /> Log Ascent & Upload Beta
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: ACCESS & GUIDELINES */}
          {activeTab === 'access' && (
            <motion.div
              key="access"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              <div className={`p-4 rounded-2xl border flex gap-3 ${
                isSandstone ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-project/10 border-project/20 text-chalk'
              }`}>
                <AlertCircle size={18} className="text-project flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold mb-1">Climbing Ethics & Regulations</p>
                  <p className="text-xs leading-relaxed opacity-90">
                    {problem.accessInfo || 'Check in with the local ranger station / basecamp coordinator upon arrival. Pack out all trash, brush off excess chalk, and use a landing ground tarp where appropriate.'}
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isSandstone ? 'bg-white border-[#1a1815]/10' : 'bg-crag border-white/5'}`}>
                <p className={`text-[11px] uppercase tracking-wider mb-1 font-light ${
                  isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                }`}>
                  Local Contact / Basecamp Coordinator
                </p>
                <p className={`text-sm font-semibold ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
                  {problem.localContact || 'Crag Management & Local Climbing Community'}
                </p>
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
            <span>Submit Sent 🎉</span>
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
