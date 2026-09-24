'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Zap,
  Eye,
  Target,
  RefreshCw,
  MessageSquare,
  Camera,
  Trash2,
  Sparkles,
  User,
  Clock,
  Calendar,
  Compass,
  Shield,
  Layers,
  Award,
  ChevronRight,
  Sliders,
} from 'lucide-react'
import { ascentColors, AscentType, gradeColors } from '@/lib/tokens'
import { TopoMarker } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'
import SendCard, { SendCardData } from './SendCard'

export interface LogAscentSubmitData {
  type: AscentType
  gradeVote: string
  note: string
  photoUrl?: string
  videoUrl?: string
  climberName?: string
  attempts?: number | string
  duration?: string
  belayer?: string
  photographer?: string
  wallAngle?: string
  wallHeight?: string
  boltsCount?: string
  provinceCountry?: string
  time?: string
  date?: string
}

interface LogAscentModalProps {
  problemName: string
  grade: string
  fontGrade: string
  setter?: string
  location?: string
  provinceCountry?: string
  defaultImageUrl?: string
  markers?: TopoMarker[]
  problemId?: string
  discipline?: string
  wallAngle?: string
  wallHeight?: string
  boltsCount?: string
  onClose: () => void
  onSubmit: (data: LogAscentSubmitData) => void
}

const ascentTypes: { key: AscentType; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'redpoint', label: 'Red Point', icon: Target, desc: 'Send after tries' },
  { key: 'flash', label: 'Flash', icon: Zap, desc: '1st try with beta' },
  { key: 'onsight', label: 'Onsight', icon: Eye, desc: '1st try no beta' },
  { key: 'repeat', label: 'Repeat', icon: RefreshCw, desc: 'Known send' },
]

const attemptPresets = ['1st Attempt', '3 Attempts', '7 Attempts', '13 Attempts', '20+ Attempts']
const durationPresets = ['Today', '1 Session', '3 Days', '2 Weeks', '24 Weeks']

export default function LogAscentModal({
  problemName,
  grade,
  fontGrade,
  setter,
  location = 'Pabeasan 90 (A)',
  provinceCountry = 'Jawa Barat, ID',
  defaultImageUrl,
  markers = [],
  problemId,
  discipline = 'Lead',
  wallAngle: initWallAngle,
  wallHeight: initWallHeight,
  boltsCount: initBoltsCount,
  onClose,
  onSubmit,
}: LogAscentModalProps) {
  const { user } = useAuth()

  // Format initial date & time
  const now = new Date()
  const initTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const initDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`

  // Smart defaults for specs based on discipline
  const isBoulder = discipline?.toLowerCase().includes('boulder')
  const defaultAngle = initWallAngle || (isBoulder ? '120°' : '110°')
  const defaultHeight = initWallHeight || (isBoulder ? '4.5 m' : '12 m')
  const defaultBolts = initBoltsCount || (isBoulder ? '3 Crashpads' : '6 Bolts')

  // Form State
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form')
  const [selectedType, setSelectedType] = useState<AscentType>('redpoint')
  const [attempts, setAttempts] = useState<string>('13 Attempts')
  const [duration, setDuration] = useState<string>('24 Weeks')
  const [climberName, setClimberName] = useState<string>(user?.name || 'Arief Lala Hakiem')
  const [belayer, setBelayer] = useState<string>('Nana Herdiana')
  const [photographer, setPhotographer] = useState<string>('Meizan Nataadiningrat')
  const [time, setTime] = useState<string>(initTime)
  const [date, setDate] = useState<string>(initDate)
  const [wallAngle, setWallAngle] = useState<string>(defaultAngle)
  const [wallHeight, setWallHeight] = useState<string>(defaultHeight)
  const [boltsCount, setBoltsCount] = useState<string>(defaultBolts)
  const [gradeVote, setGradeVote] = useState(grade)
  const [note, setNote] = useState('')

  // Media
  const [photoUrl, setPhotoUrl] = useState<string>(defaultImageUrl || '')
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [isVideo, setIsVideo] = useState(false)
  const [hasCustomPhoto, setHasCustomPhoto] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showAdvancedSpecs, setShowAdvancedSpecs] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Grade Options
  const gradeOptions = isBoulder
    ? ['V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9']
    : ['5.10 A', '5.11 B', '5.12 A', '5.12 B', '5.13 A', '5.13 C']

  // Auto-adjust attempts when style changes
  const handleSelectType = (key: AscentType) => {
    setSelectedType(key)
    if (key === 'flash' || key === 'onsight') {
      setAttempts('1st Attempt')
      setDuration('Today')
    } else if (key === 'redpoint' && (attempts === '1st Attempt' || attempts === '1 Attempt')) {
      setAttempts('13 Attempts')
      setDuration('24 Weeks')
    }
  }

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type.startsWith('video/')) {
      setIsVideo(true)
      const url = URL.createObjectURL(file)
      setVideoUrl(url)

      // Capture frame from video for send card
      const video = document.createElement('video')
      video.crossOrigin = 'anonymous'
      video.src = url
      video.muted = true
      video.playsInline = true
      video.currentTime = 0.5

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, (video.duration || 2) / 2)
      }

      video.onseeked = () => {
        try {
          const c = document.createElement('canvas')
          c.width = video.videoWidth || 720
          c.height = video.videoHeight || 1280
          const ctx = c.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, c.width, c.height)
            const thumbUrl = c.toDataURL('image/jpeg', 0.85)
            setPhotoUrl(thumbUrl)
            setHasCustomPhoto(true)
          }
        } catch (err) {
          console.warn('Could not extract video frame, keeping default photo:', err)
        }
      }
    } else {
      setIsVideo(false)
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

  // Prepared data for SendCard preview
  const currentCardData: SendCardData = {
    problemName,
    grade: gradeVote || grade,
    location,
    provinceCountry,
    wallAngle,
    wallHeight,
    boltsCount,
    discipline: isBoulder ? 'Boulder' : discipline?.toLowerCase().includes('multi') ? 'Multi-Pitch' : 'Lead',
    ascentType: selectedType,
    attempts,
    duration,
    photoUrl: photoUrl || defaultImageUrl,
    markers,
    climberName,
    time,
    date,
    belayer,
    photographer,
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      onSubmit({
        type: selectedType,
        gradeVote,
        note,
        photoUrl: photoUrl || defaultImageUrl,
        videoUrl: videoUrl || undefined,
        climberName,
        attempts,
        duration,
        belayer,
        photographer,
        wallAngle,
        wallHeight,
        boltsCount,
        provinceCountry,
        time,
        date,
      })
      onClose()
    }, 600)
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          className="w-full sm:max-w-xl bg-[#17191E] text-chalk rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[90vh] sm:max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom) + 20px, 32px)',
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle on mobile */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Top Header Bar */}
          <div className="px-5 pt-4 pb-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[#E6392D] text-xs font-bold uppercase tracking-wider mb-0.5">
                <Sparkles size={13} />
                <span>Log Verified Ascent & Send Card</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-white font-bold text-xl">{problemName}</h3>
                <span className="text-[#E6392D] font-extrabold text-lg">{grade}</span>
                {fontGrade && <span className="text-slate-ash text-xs font-light">/ {fontGrade}</span>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-ash hover:text-chalk transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs (Form vs Send Card Preview) */}
          <div className="px-5 pt-3 pb-1 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                activeTab === 'form'
                  ? 'bg-white/10 border-white/20 text-white shadow-sm'
                  : 'bg-transparent border-transparent text-slate-ash hover:text-white'
              }`}
            >
              <span>📝 Ascent Details</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                activeTab === 'preview'
                  ? 'bg-[#E6392D]/20 border-[#E6392D]/40 text-[#E6392D] shadow-sm'
                  : 'bg-transparent border-transparent text-slate-ash hover:text-white'
              }`}
            >
              <Award size={14} />
              <span>🎴 Live Send Card Preview</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 overflow-y-auto space-y-5">
            {activeTab === 'preview' ? (
              /* LIVE SEND CARD PREVIEW TAB */
              <div className="space-y-4">
                <div className="p-2 bg-black/40 rounded-2xl border border-white/5 flex justify-center">
                  <SendCard data={currentCardData} showTopo={true} className="scale-[0.92] sm:scale-100 transform-origin-top" />
                </div>
                <p className="text-center text-[11px] text-slate-ash">
                  The Send Card format above reflects the official card generated automatically upon submission.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-ash hover:text-white transition-colors"
                >
                  ← Back to Edit Ascent Details
                </button>
              </div>
            ) : (
              /* FORM DETAILS TAB */
              <>
                {/* 1. Ascent Style Selector */}
                <div>
                  <label className="block text-slate-ash text-[11px] uppercase tracking-wider mb-2 font-medium">
                    Ascent Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ascentTypes.map(({ key, label, icon: Icon, desc }) => {
                      const colors = ascentColors[key]
                      const isSelected = selectedType === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectType(key)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                            isSelected ? 'border-current' : 'border-white/5 bg-[#20232A]'
                          }`}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: colors.bg,
                                  borderColor: colors.border,
                                  color: colors.text,
                                }
                              : {}
                          }
                        >
                          <Icon size={18} />
                          <div>
                            <div className="text-sm font-bold">{label}</div>
                            <div className="text-[10px] font-light opacity-70">{desc}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Climber Action Photo & Typographic Overlay Preview */}
                <div className="p-3.5 rounded-2xl bg-[#20232A] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-xs font-bold flex items-center gap-1.5">
                        <Camera size={14} className="text-[#E6392D]" />
                        <span>Climbing Action Photo</span>
                      </p>
                      <p className="text-slate-ash text-[10px] font-light">
                        Bold typography & topo line will be overlaid onto this photo
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#E6392D]/15 hover:bg-[#E6392D]/25 text-[#E6392D] border border-[#E6392D]/30 text-xs font-bold transition-colors"
                    >
                      {hasCustomPhoto ? (isVideo ? 'Change Video' : 'Change Photo') : '+ Upload Action Photo'}
                    </button>
                  </div>

                  {/* Photo with Overlay Preview */}
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border border-white/10 group bg-stone-900">
                    <img
                      src={
                        photoUrl ||
                        'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=85'
                      }
                      alt="Action preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Left ruler ticks */}
                    <div className="absolute left-2 top-2 bottom-2 w-2 flex flex-col justify-between items-center opacity-40 pointer-events-none">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="w-2 h-[1px] bg-white rounded-full" />
                      ))}
                    </div>

                    {/* Top-Left Bold Typographic Overlay Preview */}
                    <div className="absolute top-3 left-6 z-10 pointer-events-none drop-shadow-md">
                      <div className="text-xl sm:text-2xl font-black text-white leading-tight">
                        <div>
                          {selectedType === 'redpoint'
                            ? 'Red Point/'
                            : selectedType === 'flash'
                            ? 'Flash/'
                            : selectedType === 'onsight'
                            ? 'Onsight/'
                            : 'Repeat/'}
                        </div>
                        <div>{attempts.trim().endsWith('/') ? attempts : `${attempts}/`}</div>
                        <div>{duration.trim().endsWith('/') ? duration : `${duration}/`}</div>
                      </div>
                    </div>

                    {/* Right Topo Line overlay preview */}
                    <div className="absolute right-4 top-4 bottom-4 w-12 pointer-events-none">
                      <svg className="w-full h-full" viewBox="0 0 50 150" fill="none">
                        <path
                          d="M 35 130 L 38 100 L 42 70 L 36 40 L 32 15"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle cx="35" cy="130" r="3" stroke="#FFF" strokeWidth="1.5" />
                        <circle cx="38" cy="100" r="3" stroke="#FFF" strokeWidth="1.5" />
                        <circle cx="42" cy="70" r="3" stroke="#FFF" strokeWidth="1.5" />
                        <circle cx="36" cy="40" r="3" stroke="#FFF" strokeWidth="1.5" />
                        <circle cx="28" cy="15" r="3" stroke="#FFF" strokeWidth="1.5" />
                        <circle cx="36" cy="15" r="3" stroke="#FFF" strokeWidth="1.5" />
                      </svg>
                    </div>

                    {/* Badges / Delete */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] text-white/90 bg-black/75 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {isVideo ? '🎬 Video Clip' : hasCustomPhoto ? 'Your Gallery Photo' : 'Route Photo'}
                      </span>
                      {hasCustomPhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoUrl(defaultImageUrl || '')
                            setVideoUrl('')
                            setIsVideo(false)
                            setHasCustomPhoto(false)
                          }}
                          className="pointer-events-auto p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white"
                          title="Remove photo"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Send Card Overlay Fields (Attempts & Duration) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Attempts */}
                  <div className="p-3 rounded-2xl bg-[#20232A] border border-white/5 space-y-2">
                    <label className="block text-slate-ash text-[11px] uppercase tracking-wider font-medium">
                      Attempts
                    </label>
                    <input
                      type="text"
                      value={attempts}
                      onChange={e => setAttempts(e.target.value)}
                      placeholder="13 Attempts"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-[#E6392D]/50"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {attemptPresets.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAttempts(preset)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                            attempts === preset
                              ? 'bg-white/20 border-white/30 text-white font-semibold'
                              : 'bg-white/5 border-white/5 text-slate-ash hover:text-white'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="p-3 rounded-2xl bg-[#20232A] border border-white/5 space-y-2">
                    <label className="block text-slate-ash text-[11px] uppercase tracking-wider font-medium">
                      Project Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      placeholder="24 Weeks"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-[#E6392D]/50"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {durationPresets.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setDuration(preset)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                            duration === preset
                              ? 'bg-white/20 border-white/30 text-white font-semibold'
                              : 'bg-white/5 border-white/5 text-slate-ash hover:text-white'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Bottom Zone Fields: Climber, Belayer (B), Photographer (P), Time (T), Date (D) */}
                <div className="p-3.5 rounded-2xl bg-[#20232A] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-xs font-bold flex items-center gap-1.5">
                      <User size={14} className="text-[#E6392D]" />
                      <span>Identity & Partners (Bottom Red Zone)</span>
                    </p>
                    <span className="text-[10px] text-slate-ash font-light">Printed on Send Card</span>
                  </div>

                  {/* Climber Name */}
                  <div>
                    <label className="block text-slate-ash text-[10px] uppercase tracking-wider mb-1">
                      Climber Name
                    </label>
                    <input
                      type="text"
                      value={climberName}
                      onChange={e => setClimberName(e.target.value)}
                      placeholder="Arief Lala Hakiem"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm font-medium focus:outline-none focus:border-[#E6392D]/50"
                    />
                  </div>

                  {/* 2-Column Partner & Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* (T) Time */}
                    <div>
                      <label className="block text-slate-ash text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock size={11} /> (T) Time
                      </label>
                      <input
                        type="text"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        placeholder="16:20"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#E6392D]/50"
                      />
                    </div>

                    {/* (D) Date */}
                    <div>
                      <label className="block text-slate-ash text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar size={11} /> (D) Date
                      </label>
                      <input
                        type="text"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        placeholder="26/04/26"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#E6392D]/50"
                      />
                    </div>

                    {/* (B) Belayer */}
                    <div>
                      <label className="block text-slate-ash text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Shield size={11} /> (B) Belayer / Spotter
                      </label>
                      <input
                        type="text"
                        value={belayer}
                        onChange={e => setBelayer(e.target.value)}
                        placeholder="Nana Herdiana"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#E6392D]/50"
                      />
                    </div>

                    {/* (P) Photographer */}
                    <div>
                      <label className="block text-slate-ash text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Camera size={11} /> (P) Photographer / Partner
                      </label>
                      <input
                        type="text"
                        value={photographer}
                        onChange={e => setPhotographer(e.target.value)}
                        placeholder="Meizan Nataadiningrat"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#E6392D]/50"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Route Technical Specs Accordion (Wall Angle, Height, Bolts) */}
                <div className="rounded-2xl bg-[#20232A] border border-white/5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSpecs(!showAdvancedSpecs)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-ash hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sliders size={13} className="text-[#E6392D]" />
                      <span>Route Technical Specs (Top 4 Pills on Send Card)</span>
                    </span>
                    <span className="text-[11px] text-slate-ash flex items-center gap-1">
                      {wallAngle} · {wallHeight} · {boltsCount}
                      <ChevronRight
                        size={13}
                        className={`transition-transform ${showAdvancedSpecs ? 'rotate-90' : ''}`}
                      />
                    </span>
                  </button>

                  {showAdvancedSpecs && (
                    <div className="p-3.5 pt-0 grid grid-cols-3 gap-2 border-t border-white/5 mt-1">
                      <div>
                        <label className="block text-slate-ash text-[10px] mb-1">Wall Angle</label>
                        <input
                          type="text"
                          value={wallAngle}
                          onChange={e => setWallAngle(e.target.value)}
                          placeholder="110°"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-ash text-[10px] mb-1">Route Height</label>
                        <input
                          type="text"
                          value={wallHeight}
                          onChange={e => setWallHeight(e.target.value)}
                          placeholder="12 m"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-ash text-[10px] mb-1">Bolts / Pads</label>
                        <input
                          type="text"
                          value={boltsCount}
                          onChange={e => setBoltsCount(e.target.value)}
                          placeholder="6 Bolts"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Grade Vote */}
                <div>
                  <label className="block text-slate-ash text-[11px] uppercase tracking-wider mb-2 font-medium">
                    Your Grade Consensus
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {gradeOptions.map(g => {
                      const isSelected = gradeVote === g
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGradeVote(g)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-[#E6392D]/20 border-[#E6392D] text-[#E6392D]'
                              : 'bg-[#20232A] border-white/5 text-slate-ash hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 7. Personal Notes */}
                <div>
                  <label className="block text-slate-ash text-[11px] uppercase tracking-wider mb-2 font-medium flex items-center gap-1">
                    <MessageSquare size={12} /> Beta / Crux Notes (Optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Crux at 3rd bolt, solid left heel hook..."
                    className="w-full bg-[#20232A] border border-white/5 rounded-xl p-3 text-white text-xs font-normal resize-none focus:outline-none focus:border-[#E6392D]/50 placeholder:text-slate-ash/50"
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer Submit Button */}
          <div className="px-5 pt-3 border-t border-white/10">
            {!submitted ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full h-12 bg-[#E6392D] hover:bg-[#D32F2F] text-white font-bold tracking-wide rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 touch-ripple"
              >
                <span>Submit Ascent & Generate Send Card</span> 🎉
              </button>
            ) : (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full h-12 bg-[#E6392D]/20 border border-[#E6392D]/40 rounded-xl flex items-center justify-center gap-2 text-[#E6392D] font-bold text-sm"
              >
                <Sparkles size={18} /> Ascent Logged Successfully! Preparing Send Card...
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

