'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, AlertCircle, ThumbsUp, ChevronRight, Award, ExternalLink, Mountain, Layers, Compass, ShieldCheck } from 'lucide-react'
import { Problem } from '@/lib/mock-data'

interface ProblemSheetProps {
  problem: Problem
  onLogAscent: () => void
  onClose: () => void
}

function GradeBar({ grade, votes, totalVotes }: { grade: string; votes: number; totalVotes: number }) {
  const pct = Math.round((votes / totalVotes) * 100)
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-mono text-slate-ash w-10 text-right font-light">{grade}</span>
      <div className="flex-1 h-1.5 bg-crag-light rounded-full overflow-hidden">
        <div className="h-full bg-lime rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-chalk w-8 text-right font-normal">{pct}%</span>
    </div>
  )
}

export default function ProblemSheet({ problem, onLogAscent, onClose }: ProblemSheetProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'beta' | 'specs' | 'access'>('overview')

  const totalVotes = problem.gradeVotes.reduce((acc, v) => acc + v.votes, 0)

  const tabs: { key: 'overview' | 'beta' | 'specs' | 'access'; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'specs', label: 'Specs' },
    { key: 'beta', label: 'Beta Video' },
    { key: 'access', label: 'Access & Guidelines' },
  ]

  const discipline = problem.discipline || 'bouldering'

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-crag rounded-t-3xl border-t border-white/10 z-40 overflow-hidden shadow-2xl"
      style={{ maxHeight: '78vh' }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-crag-light" />
      </div>

      {/* Header with Discipline Tag */}
      <div className="flex items-start justify-between px-4 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-climb/20 text-cyan-climb border border-cyan-climb/30 font-bold">
              <Compass size={11} /> BOULDERING · {problem.startType || 'Sit Start'}
            </span>
            <span className="text-xs font-mono font-bold text-chalk bg-granite px-2 py-0.5 rounded-md border border-white/5">
              {problem.grade} ({problem.fontGrade})
            </span>
          </div>
          <h3 className="text-chalk font-bold text-lg leading-tight">{problem.name}</h3>
          <p className="text-slate-ash text-xs font-light">FA: {problem.fa} · {problem.faDate}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-crag-light text-slate-ash touch-ripple">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-1 mb-1 border-b border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-xs transition-all touch-ripple flex-shrink-0 ${
              activeTab === tab.key
                ? 'text-lime border-b-2 border-lime font-bold'
                : 'text-slate-ash font-light'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(78vh - 180px)' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Description */}
              <p className="text-chalk/85 text-sm font-normal leading-relaxed">{problem.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Ascents', value: problem.ascentCount, color: 'text-lime' },
                  { label: 'Route Setter', value: problem.setter.split(' ')[0], color: 'text-cyan-climb' },
                  { label: 'Votes', value: totalVotes, color: 'text-chalk' },
                ].map(stat => (
                  <div key={stat.label} className="bg-granite rounded-xl p-2.5 text-center">
                    <div className={`font-bold text-base ${stat.color}`}>{stat.value}</div>
                    <div className="text-slate-ash text-[10px] font-light">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Grade Consensus */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp size={13} className="text-slate-ash" />
                  <span className="text-slate-ash text-xs font-light">Community Grade Consensus</span>
                </div>
                <div className="space-y-1.5">
                  {problem.gradeVotes.map(v => (
                    <GradeBar key={v.grade} grade={v.grade} votes={v.votes} totalVotes={totalVotes} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Bouldering Specs */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-granite p-3 rounded-xl">
                    <span className="text-[10px] text-slate-ash uppercase block">Start Stance</span>
                    <span className="text-sm font-bold text-cyan-climb">{problem.startType || 'Sit Start (SS)'}</span>
                  </div>
                  <div className="bg-granite p-3 rounded-xl">
                    <span className="text-[10px] text-slate-ash uppercase block">Recommended Pads</span>
                    <span className="text-xs font-bold text-cyan-climb">{problem.padRecommendation || '2 Pads'}</span>
                  </div>
                </div>
                <div className="bg-granite p-3 rounded-xl">
                  <span className="text-[10px] text-slate-ash uppercase block">Landing Conditions</span>
                  <span className="text-xs font-normal text-chalk">{problem.landingQuality || 'Flat grassy ground'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'beta' && (
            <motion.div
              key="beta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {problem.betaVideoUrl ? (
                <div className="rounded-xl overflow-hidden aspect-video">
                  <iframe
                    src={problem.betaVideoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="Beta Video"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-granite rounded-xl flex flex-col items-center justify-center gap-2">
                  <Award size={28} className="text-slate-ash" />
                  <p className="text-slate-ash text-sm font-light">No beta video yet</p>
                  <button className="text-lime text-xs font-light flex items-center gap-1">
                    <ExternalLink size={12} /> Upload Beta
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'access' && (
            <motion.div
              key="access"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="bg-project/10 border border-project/20 rounded-xl p-3 flex gap-3">
                <AlertCircle size={16} className="text-project flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-project text-xs font-bold mb-1">Access & Guidelines</p>
                  <p className="text-chalk/80 text-sm font-normal leading-relaxed">{problem.accessInfo}</p>
                </div>
              </div>

              <div className="bg-crag-light rounded-xl p-3">
                <p className="text-slate-ash text-[11px] uppercase tracking-wider mb-1 font-light">Local Contact / Area Host</p>
                <p className="text-chalk text-sm font-medium">{problem.localContact}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action button */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={onLogAscent}
          className="w-full h-12 bg-lime text-granite font-light tracking-wide rounded-xl shadow-lime-glow text-sm hover:bg-lime-dim transition-colors font-bold"
        >
          Log My Ascent 🎉
        </button>
      </div>
    </motion.div>
  )
}
