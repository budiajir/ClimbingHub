'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mountain,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  Compass,
  Layers,
  Upload,
  Image as ImageIcon,
  MousePointerClick,
  Undo2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react'
import { RouteDiscipline, Problem, PitchDetail, TopoMarker, CragRegion, cragRegions } from '@/lib/mock-data'

export interface NewRegionData {
  id: string
  name: string
  province: string
  image?: string
}

export interface NewSectorData {
  id: string
  name: string
  image?: string
}

interface AddRouteModalProps {
  onClose: () => void
  onAddRoute: (
    newRoute: Problem,
    regionId: string,
    sectorId: string,
    newRegionData?: NewRegionData,
    newSectorData?: NewSectorData
  ) => void
  initialRegionId?: string
  initialSectorId?: string
  regionsList?: CragRegion[]
}

export default function AddRouteModal({
  onClose,
  onAddRoute,
  initialRegionId,
  initialSectorId,
  regionsList,
}: AddRouteModalProps) {
  const availableRegions = regionsList && regionsList.length > 0 ? regionsList : cragRegions

  const [modalStep, setModalStep] = useState<'details' | 'topo'>('details')
  const [discipline, setDiscipline] = useState<RouteDiscipline>('bouldering')

  // Tebing Baru (New Crag) state
  const [isCreatingNewRegion, setIsCreatingNewRegion] = useState(false)
  const [newRegionName, setNewRegionName] = useState('')
  const [newRegionProvince, setNewRegionProvince] = useState('Jawa Barat')

  // Sektor Baru (New Sector) state
  const [isCreatingNewSector, setIsCreatingNewSector] = useState(false)
  const [newSectorName, setNewSectorName] = useState('')

  const [selectedRegionId, setSelectedRegionId] = useState(initialRegionId || availableRegions[0]?.id || 'citatah')
  const currentRegion = availableRegions.find(r => r.id === selectedRegionId) || availableRegions[0]
  const [selectedSectorId, setSelectedSectorId] = useState(initialSectorId || currentRegion?.sectors[0]?.id || '')
  const currentSector = currentRegion?.sectors.find(s => s.id === selectedSectorId) || currentRegion?.sectors[0]

  // Validation alert
  const [validationError, setValidationError] = useState<string | null>(null)

  // General fields
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('5.10c')
  const [fontGrade, setFontGrade] = useState('6b')
  const [fa, setFa] = useState('')
  const [description, setDescription] = useState('')
  const [accessInfo, setAccessInfo] = useState('')
  const [localContact, setLocalContact] = useState('')

  // Sport specific
  const [pitchLength, setPitchLength] = useState('22m')
  const [boltCount, setBoltCount] = useState(8)
  const [anchorType, setAnchorType] = useState('Double Ring Chain Anchor')

  // Multi-pitch specific
  const [totalPitches, setTotalPitches] = useState(3)
  const [totalHeight, setTotalHeight] = useState('120m')
  const [descentInfo, setDescentInfo] = useState('Rapel tali ganda 60m via stasiun anchor berantai.')
  const [pitches, setPitches] = useState<PitchDetail[]>([
    { pitchNumber: 1, grade: '5.9', length: '35m', description: 'Slab friction awalan' },
    { pitchNumber: 2, grade: '5.10c', length: '40m', description: 'Crux vertikal di pilar tengah' },
    { pitchNumber: 3, grade: '5.10a', length: '45m', description: 'Teras atas menuju finish' },
  ])

  // Boulder specific
  const [vGrade, setVGrade] = useState('V5')
  const [boulderFont, setBoulderFont] = useState('6C')
  const [padRecommendation, setPadRecommendation] = useState('2 Crashpads + 1 Spotter')
  const [landingQuality, setLandingQuality] = useState('Rata berpasir')
  const [startType, setStartType] = useState<'Sit Start (SS)' | 'Stand Start'>('Sit Start (SS)')

  // PHOTO & TOPO DRAWING STATE
  const [photoSource, setPhotoSource] = useState<'sector' | 'upload' | 'url'>('sector')
  const [uploadedImage, setUploadedImage] = useState<string>('')
  const [imageUrlInput, setImageUrlInput] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Active cliff photo to draw on
  const activePhoto =
    photoSource === 'upload' && uploadedImage
      ? uploadedImage
      : photoSource === 'url' && imageUrlInput
      ? imageUrlInput
      : currentSector?.image || currentRegion?.image || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80'

  // Topo Markers plotted on the photo
  const [markers, setMarkers] = useState<TopoMarker[]>([
    { id: 'm-start', type: 'S', x: 45, y: 88, label: 'S' },
    { id: 'm-bolt-1', type: 'B', x: 48, y: 55, label: 'B' },
    { id: 'm-top', type: 'T', x: 52, y: 18, label: 'T' },
  ])

  const [activeMarkerTool, setActiveMarkerTool] = useState<'S' | 'B' | 'T'>('B')

  const [isSuccess, setIsSuccess] = useState(false)

  // File upload handler (reads image to base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = event => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string)
          setPhotoSource('upload')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Interactive Plotting Click on Image
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10

    // Choose marker type based on active tool or auto-detection
    let newType: 'S' | 'B' | 'T' = activeMarkerTool
    if (markers.length === 0) newType = 'S'

    const existingPitches = markers.filter(m => m.type === 'P' || (discipline === 'multipitch' && m.type !== 'S' && m.type !== 'T')).length
    const pitchLabel = `P${existingPitches + 1}`

    const newMarker: TopoMarker = {
      id: `m-${Date.now()}`,
      type: discipline === 'multipitch' && newType === 'B' ? 'P' : newType,
      x,
      y,
      label: newType === 'S' ? 'S' : newType === 'T' ? 'T' : discipline === 'multipitch' ? pitchLabel : 'B',
    }

    setMarkers(prev => [...prev, newMarker])

    // Auto-advance tool: if user placed S, switch to B; if user placed B, can keep B
    if (newType === 'S') setActiveMarkerTool('B')
  }

  const handleUndoMarker = () => {
    setMarkers(prev => prev.slice(0, -1))
  }

  const handleResetMarkers = () => {
    setMarkers([])
    setActiveMarkerTool('S')
  }

  const handleSamplePath = () => {
    if (discipline === 'multipitch') {
      setMarkers([
        { id: 's1', type: 'S', x: 42, y: 90, label: 'S' },
        { id: 's2', type: 'P', x: 46, y: 68, label: 'P1' },
        { id: 's3', type: 'P', x: 50, y: 46, label: 'P2' },
        { id: 's4', type: 'P', x: 53, y: 28, label: 'P3' },
        { id: 's5', type: 'T', x: 50, y: 12, label: 'T' },
      ])
    } else {
      setMarkers([
        { id: 's1', type: 'S', x: 38, y: 88, label: 'S' },
        { id: 's2', type: 'B', x: 42, y: 64, label: 'B1' },
        { id: 's3', type: 'B', x: 48, y: 42, label: 'B2' },
        { id: 's4', type: 'T', x: 50, y: 15, label: 'T' },
      ])
    }
  }

  const handleAddPitch = () => {
    const nextNum = pitches.length + 1
    setPitches([
      ...pitches,
      { pitchNumber: nextNum, grade: '5.10a', length: '30m', description: `Pitch ${nextNum}` },
    ])
    setTotalPitches(nextNum)
  }

  const handleRemovePitch = (index: number) => {
    if (pitches.length <= 1) return
    const updated = pitches.filter((_, i) => i !== index).map((p, i) => ({ ...p, pitchNumber: i + 1 }))
    setPitches(updated)
    setTotalPitches(updated.length)
  }

  const handlePitchChange = (index: number, field: keyof PitchDetail, value: string | number) => {
    const updated = [...pitches]
    updated[index] = { ...updated[index], [field]: value }
    setPitches(updated)
  }

  const handleProceedToTopo = () => {
    if (isCreatingNewRegion && !newRegionName.trim()) {
      setValidationError('Silakan isi nama tebing baru.')
      return
    }
    if ((isCreatingNewRegion || isCreatingNewSector) && !newSectorName.trim()) {
      setValidationError('Silakan isi nama sektor baru.')
      return
    }
    if (!name.trim()) {
      setValidationError('Silakan isi nama jalur / rute pemanjatan.')
      return
    }
    setValidationError(null)
    setModalStep('topo')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setModalStep('details')
      return
    }

    let finalRegionId = selectedRegionId
    let finalSectorId = selectedSectorId
    let newRegionData: NewRegionData | undefined
    let newSectorData: NewSectorData | undefined

    if (isCreatingNewRegion) {
      finalRegionId = `crag-${Date.now()}`
      newRegionData = {
        id: finalRegionId,
        name: newRegionName.trim() || 'Tebing Baru',
        province: newRegionProvince.trim() || 'Indonesia',
        image: activePhoto,
      }
    }

    if (isCreatingNewSector || isCreatingNewRegion) {
      finalSectorId = `sector-${Date.now()}`
      newSectorData = {
        id: finalSectorId,
        name: newSectorName.trim() || 'Sektor 1',
        image: activePhoto,
      }
    }

    const newProblem: Problem = {
      id: `route-${Date.now()}`,
      name,
      discipline,
      grade: discipline === 'bouldering' ? vGrade : grade,
      fontGrade: discipline === 'bouldering' ? boulderFont : fontGrade,
      setter: 'Chief Route Curator (Owner)',
      fa: fa || 'Tim Ekspedisi Tebing Alam',
      faDate: new Date().toISOString().split('T')[0],
      description: description || 'Jalur tebing terverifikasi resmi oleh kurator ClimbingHub Indonesia.',
      imageUrl: activePhoto,
      accessInfo: accessInfo || (isCreatingNewRegion ? `${newRegionName} Access` : `${currentRegion?.name} Crag Access`),
      localContact: localContact || 'Pemandu Lokal / Pengelola Tebing',
      ascentCount: 0,
      gradeVotes: [{ grade: discipline === 'bouldering' ? vGrade : grade, votes: 1 }],
      markers: markers.length > 0 ? markers : [
        { id: 'm-start', type: 'S', x: 45, y: 85, label: 'S' },
        { id: 'm-top', type: 'T', x: 50, y: 15, label: 'T' },
      ],
      // Discipline specs:
      ...(discipline === 'sport' && {
        pitchLength,
        boltCount,
        anchorType,
      }),
      ...(discipline === 'multipitch' && {
        totalPitches: pitches.length,
        totalHeight,
        pitchBreakdown: pitches,
        descentInfo,
      }),
      ...(discipline === 'bouldering' && {
        padRecommendation,
        landingQuality,
        startType,
      }),
    }

    onAddRoute(newProblem, finalRegionId, finalSectorId, newRegionData, newSectorData)
    setIsSuccess(true)
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  // Compute SVG line path from markers
  const svgPathD =
    markers.length >= 2
      ? markers.reduce((acc, m, idx) => {
          return idx === 0 ? `M ${m.x} ${m.y}` : `${acc} L ${m.x} ${m.y}`
        }, '')
      : ''

  const lineColor = discipline === 'multipitch' ? '#FF6B00' : discipline === 'sport' ? '#CCFF00' : '#06B6D4'

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-2xl bg-crag border border-lime/30 rounded-3xl p-5 md:p-7 shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto no-scrollbar"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-granite flex items-center justify-center text-slate-ash hover:text-chalk transition-colors z-20"
        >
          <X size={16} />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-lime/20 border border-lime/40 text-lime flex items-center justify-center mx-auto text-3xl font-bold shadow-lime-glow">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-chalk font-bold text-2xl">Jalur & Topo Berhasil Diterbitkan!</h2>
            <p className="text-slate-ash text-xs font-light">
              Rute <b>{name}</b> ({discipline.toUpperCase()}) di{' '}
              <b>{isCreatingNewRegion ? newRegionName : currentRegion?.name}</b> ·{' '}
              <b>{isCreatingNewSector || isCreatingNewRegion ? newSectorName : currentSector?.name}</b>{' '}
              beserta foto & garis topo visual telah aktif di katalog tebing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header Badge */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-xs font-mono font-light uppercase mb-2">
                <ShieldCheck size={14} /> Kurator Resmi · Pemilik Website
              </div>
              <h2 className="text-chalk font-bold text-xl md:text-2xl">
                Tambah Jalur & Gambar Topo Tebing
              </h2>
            </div>

            {/* STEP TABS: [1. Detail Rute] <-> [2. Foto & Gambar Jalur Topo] */}
            <div className="grid grid-cols-2 bg-granite p-1 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setModalStep('details')}
                className={`py-2.5 px-3 text-xs rounded-xl flex items-center justify-center gap-2 transition-all ${
                  modalStep === 'details'
                    ? 'bg-lime text-granite font-bold shadow-lime-glow-sm'
                    : 'text-slate-ash hover:text-chalk font-light'
                }`}
              >
                <Mountain size={14} />
                <span>1. Detail & Spesifikasi</span>
              </button>
              <button
                type="button"
                onClick={handleProceedToTopo}
                className={`py-2.5 px-3 text-xs rounded-xl flex items-center justify-center gap-2 transition-all ${
                  modalStep === 'topo'
                    ? 'bg-lime text-granite font-bold shadow-lime-glow-sm'
                    : 'text-slate-ash hover:text-chalk font-light'
                }`}
              >
                <MousePointerClick size={14} />
                <span>2. Foto & Gambar Jalur ({markers.length} Titik)</span>
              </button>
            </div>

            {/* ========== STEP 1: ROUTE DETAILS & SPECS ========== */}
            {modalStep === 'details' && (
              <div className="space-y-4">
                {/* 3 DISCIPLINE SELECTOR PILLS */}
                <div>
                  <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-2">
                    Pilih Tipe / Disiplin Jalur Pemanjatan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'sport', label: '1. Sport Climbing', sub: 'Single Pitch (Tali)', icon: Mountain },
                      { key: 'multipitch', label: '2. Multi Pitch', sub: 'Dinding Bersambung', icon: Layers },
                      { key: 'bouldering', label: '3. Bouldering', sub: 'Bongkahan (Crashpad)', icon: Compass },
                    ].map(item => {
                      const Icon = item.icon
                      const isSelected = discipline === item.key
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setDiscipline(item.key as RouteDiscipline)}
                          className={`p-3 rounded-2xl border text-left transition-all touch-ripple ${
                            isSelected
                              ? 'bg-lime text-granite border-lime font-bold shadow-lime-glow-sm'
                              : 'bg-granite text-slate-ash hover:text-chalk border-white/5 font-light'
                          }`}
                        >
                          <Icon size={16} className={`mb-1 ${isSelected ? 'text-granite' : 'text-lime'}`} />
                          <div className="text-xs font-bold leading-tight">{item.label}</div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-granite/80' : 'text-slate-ash'}`}>
                            {item.sub}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* CRAG & SECTOR SELECTOR WITH NEW CRAG & SECTOR CREATION */}
                <div className="bg-granite/70 p-4 rounded-2xl border border-white/5 space-y-4">
                  {/* TEBING SECTION */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-ash uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <Mountain size={13} className="text-lime" />
                        Kawasan Tebing (Crag Region)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isCreatingNewRegion
                          setIsCreatingNewRegion(next)
                          if (next) {
                            setIsCreatingNewSector(true)
                          }
                          setValidationError(null)
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                          isCreatingNewRegion
                            ? 'bg-lime text-granite border-lime font-bold shadow-lime-glow-sm'
                            : 'bg-crag text-slate-ash border-white/10 hover:text-chalk hover:border-lime/30'
                        }`}
                      >
                        <Plus size={12} />
                        {isCreatingNewRegion ? 'Pilih Tebing yang Ada' : '+ Buat Tebing Baru'}
                      </button>
                    </div>

                    {!isCreatingNewRegion ? (
                      <select
                        value={selectedRegionId}
                        onChange={e => {
                          setSelectedRegionId(e.target.value)
                          const reg = availableRegions.find(r => r.id === e.target.value)
                          if (reg && reg.sectors[0]) setSelectedSectorId(reg.sectors[0].id)
                        }}
                        className="w-full bg-crag border border-white/10 rounded-xl px-3 py-2.5 text-chalk text-xs font-normal focus:outline-none focus:border-lime/40"
                      >
                        {availableRegions.map(crag => (
                          <option key={crag.id} value={crag.id}>
                            {crag.name} ({crag.province})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-3 rounded-xl bg-crag/90 border border-lime/30">
                        <div>
                          <label className="text-[10px] text-lime uppercase font-bold block mb-1">
                            Nama Tebing Baru *
                          </label>
                          <input
                            required
                            value={newRegionName}
                            onChange={e => {
                              setNewRegionName(e.target.value)
                              setValidationError(null)
                            }}
                            placeholder="cth: Tebing Parang, Tebing Uluwatu"
                            className="w-full bg-granite border border-white/10 rounded-lg px-3 py-1.5 text-xs text-chalk focus:outline-none focus:border-lime/40 placeholder:text-slate-ash/50"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-ash uppercase block mb-1">
                            Provinsi / Wilayah *
                          </label>
                          <input
                            required
                            value={newRegionProvince}
                            onChange={e => {
                              setNewRegionProvince(e.target.value)
                              setValidationError(null)
                            }}
                            placeholder="cth: Jawa Barat, Bali, DI Yogyakarta"
                            className="w-full bg-granite border border-white/10 rounded-lg px-3 py-1.5 text-xs text-chalk focus:outline-none focus:border-lime/40 placeholder:text-slate-ash/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SEKTOR SECTION */}
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-ash uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <Layers size={13} className="text-cyan-climb" />
                        Sektor Tebing
                      </label>
                      {!isCreatingNewRegion && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingNewSector(!isCreatingNewSector)
                            setValidationError(null)
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                            isCreatingNewSector
                              ? 'bg-cyan-climb text-granite border-cyan-climb font-bold'
                              : 'bg-crag text-slate-ash border-white/10 hover:text-chalk hover:border-cyan-climb/30'
                          }`}
                        >
                          <Plus size={12} />
                          {isCreatingNewSector ? 'Pilih Sektor yang Ada' : '+ Buat Sektor Baru'}
                        </button>
                      )}
                    </div>

                    {!isCreatingNewRegion && !isCreatingNewSector ? (
                      <select
                        value={selectedSectorId}
                        onChange={e => setSelectedSectorId(e.target.value)}
                        className="w-full bg-crag border border-white/10 rounded-xl px-3 py-2.5 text-chalk text-xs font-normal focus:outline-none focus:border-lime/40"
                      >
                        {currentRegion?.sectors.map(sector => (
                          <option key={sector.id} value={sector.id}>
                            {sector.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 rounded-xl bg-crag/90 border border-cyan-climb/30">
                        <label className="text-[10px] text-cyan-climb uppercase font-bold block mb-1">
                          Nama Sektor Baru {isCreatingNewRegion ? '(Sektor Pertama)' : ''} *
                        </label>
                        <input
                          required
                          value={newSectorName}
                          onChange={e => {
                            setNewSectorName(e.target.value)
                            setValidationError(null)
                          }}
                          placeholder="cth: Sektor A — Dinding Utama, Menara Barat, Goa Bawah"
                          className="w-full bg-granite border border-white/10 rounded-lg px-3 py-1.5 text-xs text-chalk focus:outline-none focus:border-cyan-climb/40 placeholder:text-slate-ash/50"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* GENERAL ROUTE INFO */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                      Nama Jalur / Rute
                    </label>
                    <input
                      required
                      placeholder="cth: Pilar Merah, Sunset Boulevard, Dragon Backbone"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-granite border border-white/5 rounded-xl px-3 py-2.5 text-chalk text-xs font-normal focus:outline-none focus:border-lime/40 placeholder:font-light"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                        First Ascensionist (FA)
                      </label>
                      <input
                        placeholder="cth: Adi Prasetyo (2022)"
                        value={fa}
                        onChange={e => setFa(e.target.value)}
                        className="w-full bg-granite border border-white/5 rounded-xl px-3 py-2 text-chalk text-xs font-normal focus:outline-none focus:border-lime/40"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                        Kontak Kuncen / Pemandu Lokal
                      </label>
                      <input
                        placeholder="cth: Pak Asep (+6281234567)"
                        value={localContact}
                        onChange={e => setLocalContact(e.target.value)}
                        className="w-full bg-granite border border-white/5 rounded-xl px-3 py-2 text-chalk text-xs font-normal focus:outline-none focus:border-lime/40"
                      />
                    </div>
                  </div>
                </div>

                {/* CONDITIONAL TECHNICAL SPECS */}
                {discipline === 'sport' && (
                  <div className="bg-granite/80 border border-lime/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-lime font-bold text-xs uppercase tracking-wider">
                      <Mountain size={14} /> Spesifikasi Sport Climbing (Single Pitch)
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-ash uppercase block mb-1">Grade YDS</label>
                        <input
                          value={grade}
                          onChange={e => setGrade(e.target.value)}
                          placeholder="5.10c"
                          className="w-full bg-crag border border-white/10 rounded-xl px-3 py-1.5 text-xs text-chalk font-mono focus:outline-none focus:border-lime/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-ash uppercase block mb-1">Grade French</label>
                        <input
                          value={fontGrade}
                          onChange={e => setFontGrade(e.target.value)}
                          placeholder="6b"
                          className="w-full bg-crag border border-white/10 rounded-xl px-3 py-1.5 text-xs text-chalk font-mono focus:outline-none focus:border-lime/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-ash uppercase block mb-1">Tinggi / Pitch (m)</label>
                        <input
                          value={pitchLength}
                          onChange={e => setPitchLength(e.target.value)}
                          placeholder="24m"
                          className="w-full bg-crag border border-white/10 rounded-xl px-3 py-1.5 text-xs text-chalk focus:outline-none focus:border-lime/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-ash uppercase block mb-1">Jumlah Bolt</label>
                        <input
                          type="number"
                          value={boltCount}
                          onChange={e => setBoltCount(Number(e.target.value))}
                          placeholder="9"
                          className="w-full bg-crag border border-white/10 rounded-xl px-3 py-1.5 text-xs text-chalk focus:outline-none focus:border-lime/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-ash uppercase block mb-1">Tipe Anchor Top Stasiun</label>
                      <input
                        value={anchorType}
                        onChange={e => setAnchorType(e.target.value)}
                        placeholder="Double Ring Chain Anchor / Stainless Steel Carabiners"
                        className="w-full bg-crag border border-white/10 rounded-xl px-3 py-1.5 text-xs text-chalk focus:outline-none focus:border-lime/40"
                      />
                    </div>
                  </div>
                )}

                {discipline === 'multipitch' && (
                  <div className="bg-granite/80 border border-project/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-project font-bold text-xs uppercase tracking-wider">
                        <Layers size={14} /> Spesifikasi Multi Pitch
                      </div>
                      <button
                        type="button"
                        onClick={handleAddPitch}
                        className="text-[11px] px-2.5 py-1 bg-project/10 text-project border border-project/30 rounded-lg hover:bg-project/20 transition-colors flex items-center gap-1 font-bold"
                      >
                        <Plus size={12} /> Tambah Pitch
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-ash uppercase block mb-1">Total Ketinggian (m)</label>
                        <input
                          value={totalHeight}
                          onChange={e => setTotalHeight(e.target.value)}
                          placeholder="160m"
                          className="w-full bg-crag border border-white/10 rounded-xl px-3 py-1.5 text-xs text-chalk focus:outline-none focus:border-project/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-ash uppercase block mb-1">Crux Grade</label>
                        <input
                          value={grade}
                          onChange={e => setGrade(e.target.value)}
                          placeholder="5.11a"
                          className="w-full bg-crag border border-white/10 rounded-xl px-3 py-1.5 text-xs text-chalk font-mono focus:outline-none focus:border-project/40"
                        />
                      </div>
                    </div>

                    {/* Pitches List */}
                    <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                      {pitches.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-crag p-2 rounded-xl border border-white/5">
                          <span className="w-6 h-6 rounded bg-granite text-project font-bold text-xs flex items-center justify-center flex-shrink-0">
                            P{p.pitchNumber}
                          </span>
                          <input
                            placeholder="Grade"
                            value={p.grade}
                            onChange={e => handlePitchChange(idx, 'grade', e.target.value)}
                            className="w-20 bg-granite border border-white/5 rounded px-2 py-1 text-xs text-chalk font-mono focus:outline-none"
                          />
                          <input
                            placeholder="Panjang"
                            value={p.length}
                            onChange={e => handlePitchChange(idx, 'length', e.target.value)}
                            className="w-20 bg-granite border border-white/5 rounded px-2 py-1 text-xs text-chalk focus:outline-none"
                          />
                          <input
                            placeholder="Catatan pitch"
                            value={p.description}
                            onChange={e => handlePitchChange(idx, 'description', e.target.value)}
                            className="flex-1 bg-granite border border-white/5 rounded px-2 py-1 text-xs text-chalk focus:outline-none"
                          />
                          {pitches.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePitch(idx)}
                              className="text-slate-ash hover:text-redpoint p-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {discipline === 'bouldering' && (
                  <div className="bg-granite/80 border border-cyan-climb/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-climb font-bold text-xs uppercase tracking-wider">
                      <Compass size={14} /> Spesifikasi Bouldering
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-ash uppercase block mb-1">V-Grade</label>
                        <input
                          value={vGrade}
                          onChange={e => setVGrade(e.target.value)}
                          placeholder="V5"
                          className="w-full bg-crag border border-white/10 rounded-xl px-3 py-1.5 text-xs text-chalk font-mono focus:outline-none focus:border-cyan-climb/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-ash uppercase block mb-1">Font Grade</label>
                        <input
                          value={boulderFont}
                          onChange={e => setBoulderFont(e.target.value)}
                          placeholder="6C"
                          className="w-full bg-crag border border-white/10 rounded-xl px-3 py-1.5 text-xs text-chalk font-mono focus:outline-none focus:border-cyan-climb/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-ash uppercase block mb-1">Tipe Start</label>
                        <select
                          value={startType}
                          onChange={e => setStartType(e.target.value as 'Sit Start (SS)' | 'Stand Start')}
                          className="w-full bg-crag border border-white/10 rounded-xl px-2 py-1.5 text-xs text-chalk focus:outline-none"
                        >
                          <option value="Sit Start (SS)">Sit Start (SS)</option>
                          <option value="Stand Start">Stand Start</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-ash uppercase block mb-1">Rekomendasi Pad</label>
                        <input
                          value={padRecommendation}
                          onChange={e => setPadRecommendation(e.target.value)}
                          placeholder="2 Crashpads"
                          className="w-full bg-crag border border-white/10 rounded-xl px-3 py-1.5 text-xs text-chalk focus:outline-none focus:border-cyan-climb/40"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Error Message */}
                {validationError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-redpoint/10 border border-redpoint/30 text-redpoint text-xs font-light">
                    <AlertCircle size={15} className="flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Next Step Button */}
                <button
                  type="button"
                  onClick={handleProceedToTopo}
                  className="w-full py-3.5 bg-lime text-granite font-bold tracking-wide rounded-xl shadow-lime-glow hover:bg-lime-dim transition-all text-xs flex items-center justify-center gap-2 mt-3"
                >
                  <span>Lanjut: Upload Foto & Gambar Jalur Topo</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ========== STEP 2: PHOTO UPLOAD & INTERACTIVE TOPO PLOTTER ========== */}
            {modalStep === 'topo' && (
              <div className="space-y-4">
                {/* Source Selection Buttons */}
                <div className="bg-granite p-3 rounded-2xl border border-white/5 space-y-2.5">
                  <span className="text-[11px] text-slate-ash uppercase tracking-wider font-light block">
                    Pilih Sumber Foto Tebing:
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPhotoSource('sector')}
                      className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                        photoSource === 'sector'
                          ? 'bg-lime/20 border-lime text-lime font-bold'
                          : 'bg-crag border-white/5 text-slate-ash hover:text-chalk'
                      }`}
                    >
                      <ImageIcon size={13} />
                      <span>Foto Sektor Bawaan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPhotoSource('upload')
                        fileInputRef.current?.click()
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                        photoSource === 'upload'
                          ? 'bg-lime/20 border-lime text-lime font-bold'
                          : 'bg-crag border-white/5 text-slate-ash hover:text-chalk'
                      }`}
                    >
                      <Upload size={13} />
                      <span>Upload dari File ({uploadedImage ? 'Terpasang' : 'Pilih Foto'})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhotoSource('url')}
                      className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                        photoSource === 'url'
                          ? 'bg-lime/20 border-lime text-lime font-bold'
                          : 'bg-crag border-white/5 text-slate-ash hover:text-chalk'
                      }`}
                    >
                      <span>Link URL</span>
                    </button>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {photoSource === 'url' && (
                    <input
                      placeholder="Tempel link URL foto tebing (https://...)"
                      value={imageUrlInput}
                      onChange={e => setImageUrlInput(e.target.value)}
                      className="w-full bg-crag border border-white/10 rounded-xl px-3 py-2 text-xs text-chalk focus:outline-none focus:border-lime/40"
                    />
                  )}
                </div>

                {/* CANVAS PLOTTING TOOLBAR */}
                <div className="flex items-center justify-between flex-wrap gap-2 bg-granite/70 p-2.5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-ash uppercase font-light mr-1">
                      Mode Titik:
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveMarkerTool('S')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                        activeMarkerTool === 'S'
                          ? 'bg-lime text-granite border-lime shadow-lime-glow-sm'
                          : 'bg-crag text-slate-ash border-white/5 hover:text-chalk'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-lime" /> Start (S)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMarkerTool('B')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                        activeMarkerTool === 'B'
                          ? discipline === 'multipitch'
                            ? 'bg-project text-white border-project shadow-[0_0_12px_rgba(255,107,0,0.6)]'
                            : 'bg-cyan-climb text-granite border-cyan-climb'
                          : 'bg-crag text-slate-ash border-white/5 hover:text-chalk'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          discipline === 'multipitch' ? 'bg-project' : 'bg-cyan-climb'
                        }`}
                      />
                      {discipline === 'multipitch' ? 'Stasiun Pitch (P1, P2...)' : 'Bolt (B)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMarkerTool('T')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                        activeMarkerTool === 'T'
                          ? 'bg-redpoint text-white border-redpoint'
                          : 'bg-crag text-slate-ash border-white/5 hover:text-chalk'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-redpoint" /> Top (T)
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleUndoMarker}
                      disabled={markers.length === 0}
                      className="p-1.5 rounded-lg bg-crag border border-white/5 text-slate-ash hover:text-chalk disabled:opacity-30"
                      title="Undo Titik Terakhir"
                    >
                      <Undo2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetMarkers}
                      disabled={markers.length === 0}
                      className="p-1.5 rounded-lg bg-crag border border-white/5 text-slate-ash hover:text-redpoint disabled:opacity-30"
                      title="Hapus Semua Titik"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleSamplePath}
                      className="text-[10px] px-2 py-1 rounded-lg bg-lime/10 text-lime border border-lime/20 hover:bg-lime/20 flex items-center gap-1 font-bold"
                    >
                      <Sparkles size={11} /> Auto Demo
                    </button>
                  </div>
                </div>

                {/* INTERACTIVE TOPO DRAWING CANVAS */}
                <div className="relative">
                  <div
                    onClick={handleCanvasClick}
                    className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden border border-lime/30 cursor-crosshair select-none bg-granite shadow-2xl group"
                  >
                    {/* Cliff Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center pointer-events-none"
                      style={{ backgroundImage: `url(${activePhoto})` }}
                    />
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />

                    {/* CONNECTED SVG NEON TOPO LINE */}
                    {svgPathD && (
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        {/* Glow outline */}
                        <path
                          d={svgPathD}
                          stroke={lineColor}
                          strokeWidth="2"
                          strokeDasharray="2.5 1.5"
                          strokeLinecap="round"
                          fill="none"
                          style={{
                            filter:
                              discipline === 'multipitch'
                                ? 'drop-shadow(0 0 6px rgba(255,107,0,0.8))'
                                : 'drop-shadow(0 0 6px rgba(204,255,0,0.8))',
                          }}
                        />
                        {/* Inner crisp line */}
                        <path
                          d={svgPathD}
                          stroke="#FFFFFF"
                          strokeWidth="0.8"
                          strokeDasharray="2.5 1.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    )}

                    {/* MULTI PITCH: Visual pitch segment badges during drawing */}
                    {discipline === 'multipitch' && markers.length >= 2 && (
                      markers.slice(0, -1).map((m, idx) => {
                        const nextM = markers[idx + 1]
                        const pitchNum = idx + 1
                        const midX = (m.x + nextM.x) / 2
                        const midY = (m.y + nextM.y) / 2
                        const offsetX = midX > 50 ? -12 : 12
                        const pitchInfo = pitches[idx]
                        return (
                          <div
                            key={`draw-pitch-${pitchNum}`}
                            style={{
                              left: `${Math.min(86, Math.max(14, midX + offsetX))}%`,
                              top: `${midY}%`,
                              transform: 'translate(-50%, -50%)',
                            }}
                            className="absolute pointer-events-none z-20"
                          >
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/85 border border-project/70 text-project font-mono text-[10px] font-bold shadow-xl">
                              <span className="w-1.5 h-1.5 rounded-full bg-project" />
                              <span>Pitch {pitchNum}</span>
                              {pitchInfo && (
                                <span className="text-white/80 font-normal">
                                  ({pitchInfo.grade})
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}

                    {/* PLOTTED MARKER PINS */}
                    {markers.map((m, idx) => (
                      <div
                        key={m.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center z-25"
                        style={{ left: `${m.x}%`, top: `${m.y}%` }}
                      >
                        <div
                          className={`rounded-full flex items-center justify-center font-black border-2 border-white/40 shadow-lg ${
                            m.type === 'P' || (discipline === 'multipitch' && m.type !== 'S' && m.type !== 'T')
                              ? 'w-7 h-7 text-[10px] bg-project text-white shadow-[0_0_12px_#FF6B00]'
                              : m.type === 'S'
                              ? 'w-6 h-6 text-[10px] bg-lime text-granite shadow-[0_0_10px_#CCFF00]'
                              : m.type === 'T'
                              ? 'w-6 h-6 text-[10px] bg-redpoint text-white shadow-[0_0_10px_#EF4444]'
                              : 'w-6 h-6 text-[10px] bg-cyan-climb text-granite shadow-[0_0_10px_#06B6D4]'
                          }`}
                        >
                          {m.label || m.type}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white mt-0.5" />
                      </div>
                    ))}

                    {/* Live Instruction Overlay */}
                    <div className="absolute bottom-2 left-3 right-3 pointer-events-none flex justify-between items-center text-[10px] font-mono text-white/90 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                      <span className="flex items-center gap-1.5">
                        <MousePointerClick size={12} className="text-lime" />
                        Klik foto untuk meletakkan titik{' '}
                        {activeMarkerTool === 'S'
                          ? 'Start Dasar'
                          : activeMarkerTool === 'T'
                          ? 'Top Out'
                          : discipline === 'multipitch'
                          ? 'Stasiun Belay Pitch'
                          : 'Bolt'}
                      </span>
                      <span className="text-lime font-bold">{markers.length} Titik Terpasang</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalStep('details')}
                    className="w-1/3 py-3.5 bg-granite border border-white/10 hover:border-lime/30 text-chalk font-light rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft size={15} />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="submit"
                    className="w-2/3 py-3.5 bg-lime text-granite font-bold tracking-wide rounded-xl shadow-lime-glow hover:bg-lime-dim transition-all text-xs flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>Terbitkan Rute & Topo Sekarang 🚀</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </motion.div>
    </div>
  )
}
