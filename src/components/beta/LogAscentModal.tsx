'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Eye, Target, RefreshCw, MessageSquare } from 'lucide-react'
import { ascentColors, AscentType, gradeColors } from '@/lib/tokens'

interface LogAscentModalProps {
  problemName: string
  grade: string
  fontGrade: string
  onClose: () => void
  onSubmit: (data: { type: AscentType; gradeVote: string; note: string }) => void
}

const ascentTypes: { key: AscentType; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'flash', label: 'Flash', icon: Zap, desc: '1st attempt, with beta' },
  { key: 'onsight', label: 'Onsight', icon: Eye, desc: '1st attempt, no beta' },
  { key: 'redpoint', label: 'Redpoint', icon: Target, desc: 'Send after tries' },
  { key: 'repeat', label: 'Repeat', icon: RefreshCw, desc: 'Known send' },
]

const gradeOptions = ['V3', 'V4', 'V5', 'V6', 'V7']

export default function LogAscentModal({
  problemName,
  grade,
  fontGrade,
  onClose,
  onSubmit,
}: LogAscentModalProps) {
  const [selectedType, setSelectedType] = useState<AscentType>('redpoint')
  const [gradeVote, setGradeVote] = useState(grade)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      onSubmit({ type: selectedType, gradeVote, note })
      onClose()
    }, 1500)
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 flex items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          className="w-full bg-crag rounded-t-3xl p-5"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 rounded-full bg-crag-light" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-chalk font-bold text-lg">Log Ascent</h3>
              <p className="text-slate-ash text-sm font-light">{problemName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lime font-bold text-base">{grade}</span>
                <span className="text-slate-ash text-sm font-light">/ {fontGrade}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-crag-light flex items-center justify-center touch-ripple">
              <X size={16} className="text-slate-ash" />
            </button>
          </div>

          {/* Ascent type selector */}
          <div className="mb-5">
            <p className="text-slate-ash text-[11px] uppercase tracking-wider mb-2 font-light">Ascent Style</p>
            <div className="grid grid-cols-2 gap-2">
              {ascentTypes.map(({ key, label, icon: Icon, desc }) => {
                const colors = ascentColors[key]
                const isSelected = selectedType === key
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedType(key)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all touch-ripple ${
                      isSelected
                        ? 'border-current'
                        : 'border-white/5 bg-granite'
                    }`}
                    style={isSelected ? {
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      color: colors.text,
                    } : {}}
                  >
                    <Icon size={18} />
                    <div className="text-left">
                      <div className="text-sm font-bold">{label}</div>
                      <div className="text-[10px] font-light opacity-70">{desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grade Vote */}
          <div className="mb-5">
            <p className="text-slate-ash text-[11px] uppercase tracking-wider mb-2 font-light">Grade Consensus Vote</p>
            <div className="flex gap-2">
              {gradeOptions.map(g => {
                const color = gradeColors[g] || '#94A3B8'
                const isSelected = gradeVote === g
                return (
                  <button
                    key={g}
                    onClick={() => setGradeVote(g)}
                    className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all border touch-ripple`}
                    style={{
                      backgroundColor: isSelected ? color + '20' : 'transparent',
                      borderColor: isSelected ? color + '60' : 'rgba(255,255,0,0.05)',
                      color: isSelected ? color : '#94A3B8',
                    }}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Note */}
          <div className="mb-5">
            <p className="text-slate-ash text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1 font-light">
              <MessageSquare size={11} /> Personal Notes (Optional)
            </p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Crux on the 3rd move, used a solid left heel hook..."
              className="w-full bg-granite border border-white/5 rounded-xl p-3 text-chalk text-sm font-normal resize-none focus:outline-none focus:border-lime/30 placeholder:font-light placeholder:text-slate-ash/50"
              rows={2}
            />
          </div>

          {/* Submit */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="w-full h-13 bg-lime text-granite font-light tracking-wide rounded-xl shadow-lime-glow-sm touch-ripple hover:bg-lime-dim transition-colors"
              style={{ height: '52px' }}
            >
              Submit Ascent 🎉
            </button>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full h-13 bg-lime/10 border border-lime/30 rounded-xl flex items-center justify-center gap-2 text-lime font-bold"
              style={{ height: '52px' }}
            >
              <span>🎉</span> Ascent Logged! Crushing it!
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
