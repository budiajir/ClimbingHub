'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Eye, Target, RefreshCw, MessageSquare, Camera, Trash2, Sparkles } from 'lucide-react'
import { ascentColors, AscentType, gradeColors } from '@/lib/tokens'
import { TopoMarker } from '@/lib/mock-data'

interface LogAscentModalProps {
  problemName: string
  grade: string
  fontGrade: string
  setter?: string
  location?: string
  defaultImageUrl?: string
  markers?: TopoMarker[]
  problemId?: string
  discipline?: string
  onClose: () => void
  onSubmit: (data: {
    type: AscentType
    gradeVote: string
    note: string
    photoUrl?: string
  }) => void
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
  defaultImageUrl,
  onClose,
  onSubmit,
}: LogAscentModalProps) {
  const [selectedType, setSelectedType] = useState<AscentType>('redpoint')
  const [gradeVote, setGradeVote] = useState(grade)
  const [note, setNote] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string>(defaultImageUrl || '')
  const [hasCustomPhoto, setHasCustomPhoto] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => {
        if (ev.target?.result) {
          setPhotoUrl(ev.target.result as string)
          setHasCustomPhoto(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      onSubmit({
        type: selectedType,
        gradeVote,
        note,
        photoUrl: photoUrl || defaultImageUrl,
      })
      onClose()
    }, 800)
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          className="w-full sm:max-w-lg bg-crag rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 max-h-[92vh] overflow-y-auto no-scrollbar"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle on mobile */}
          <div className="flex justify-center mb-4 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-crag-light" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-1.5 text-lime text-xs font-bold uppercase tracking-wider mb-0.5">
                <Sparkles size={13} />
                <span>Log Verified Ascent</span>
              </div>
              <h3 className="text-chalk font-bold text-xl">{problemName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lime font-bold text-base">{grade}</span>
                <span className="text-slate-ash text-sm font-light">/ {fontGrade}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-ash hover:text-chalk transition-colors"
            >
              <X size={16} />
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

          {/* Send Photo Upload (For Strava Share Badge) */}
          <div className="mb-5 p-3 rounded-2xl bg-granite/70 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-chalk text-xs font-bold flex items-center gap-1.5">
                  <Camera size={13} className="text-lime" /> Foto Pendakian (Share Card)
                </p>
                <p className="text-slate-ash text-[10px] font-light">
                  Akan digenerate otomatis menjadi kartu grafis Strava-style
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-lime/15 hover:bg-lime/25 text-lime border border-lime/30 text-xs font-bold transition-colors"
              >
                {hasCustomPhoto ? 'Ganti Foto' : '+ Pilih Foto'}
              </button>
            </div>

            {photoUrl && (
              <div className="relative h-28 w-full rounded-xl overflow-hidden border border-white/10 group">
                <img
                  src={photoUrl}
                  alt="Send photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-between p-2 opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {hasCustomPhoto ? 'Foto Galeri Kamu' : 'Foto Resmi Boulder'}
                  </span>
                  {hasCustomPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl(defaultImageUrl || '')
                        setHasCustomPhoto(false)
                      }}
                      className="p-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-white"
                      title="Hapus foto"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            )}
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
                    className="flex-1 h-10 rounded-xl text-sm font-bold transition-all border touch-ripple"
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
              className="w-full h-13 bg-lime text-granite font-bold tracking-wide rounded-xl shadow-lime-glow-sm touch-ripple hover:bg-lime-dim transition-colors flex items-center justify-center gap-2"
              style={{ height: '52px' }}
            >
              <span>Submit Ascent & Dapatkan Share Card</span> 🎉
            </button>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full h-13 bg-lime/15 border border-lime/30 rounded-xl flex items-center justify-center gap-2 text-lime font-bold"
              style={{ height: '52px' }}
            >
              <Sparkles size={18} /> Ascent Berhasil Dicatat! Menyiapkan Kartu Hadiah...
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
