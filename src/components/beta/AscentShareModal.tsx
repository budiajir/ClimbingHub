'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Download,
  Share2,
  Camera,
  Layers,
  Check,
  Sparkles,
  RefreshCw,
  Award,
} from 'lucide-react'
import { UserAscent } from '@/lib/user-ascents'
import SendCard, { SendCardData } from './SendCard'

interface AscentShareModalProps {
  ascent: UserAscent
  onClose: () => void
  onViewPersonalBetaBook?: () => void
}

export default function AscentShareModal({
  ascent,
  onClose,
  onViewPersonalBetaBook,
}: AscentShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string>(ascent.photoUrl || '')
  const [showTopoLine, setShowTopoLine] = useState(true)
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(true)
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Card data for React SendCard and Canvas
  const cardData: SendCardData = {
    problemName: ascent.problemName || 'Gugusan Bintang',
    grade: ascent.grade || '5.12 B',
    location: ascent.location || 'Pabeasan 90 (A)',
    provinceCountry: ascent.provinceCountry || 'Jawa Barat, ID',
    wallAngle: ascent.wallAngle || '110°',
    wallHeight: ascent.wallHeight || '12 m',
    boltsCount:
      ascent.boltsCount ||
      (ascent.discipline?.toLowerCase().includes('boulder') ? '3 Crashpads' : '6 Bolts'),
    discipline: ascent.discipline || 'Lead',
    ascentType: ascent.ascentType || 'redpoint',
    attempts: ascent.attempts || (ascent.ascentType === 'redpoint' ? '13 Attempts' : '1st Attempt'),
    duration: ascent.duration || '24 Weeks',
    photoUrl: photoUrl || ascent.photoUrl,
    markers: ascent.markers,
    climberName: ascent.climberName || 'Arief Lala Hakiem',
    time: ascent.time || '16:20',
    date: ascent.date || '26/04/26',
    belayer: ascent.belayer || 'Nana Herdiana',
    photographer: ascent.photographer || 'Meizan Nataadiningrat',
  }

  // Draw the high-res Send Card onto 1080x1920 Canvas
  const renderBadge = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsGenerating(true)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 1080
    const H = 1920
    canvas.width = W
    canvas.height = H

    // 1. Overall Base
    ctx.fillStyle = '#1C1917'
    ctx.fillRect(0, 0, W, H)

    // 2. Subtle Left Margin Vertical Ruler Ticks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.lineWidth = 2.5
    for (let y = 35; y <= 1885; y += 38) {
      ctx.beginPath()
      ctx.moveTo(22, y)
      ctx.lineTo(44, y)
      ctx.stroke()
    }

    // 3. TOP ZONE: Sandstone Beige Header (y = 0 to 360)
    ctx.fillStyle = '#CBBBA4'
    ctx.fillRect(0, 0, W, 360)

    // Logo: "jalur.WORLD"
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('jalur.', 76, 85)
    const logoW = ctx.measureText('jalur.').width
    ctx.font = 'italic 300 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.fillText('WORLD', 76 + logoW + 8, 83)

    // Location (Crag & Province) - Top Right
    const locationCrag = cardData.location.split('·')[0].trim() || 'Pabeasan 90 (A)'
    const locationProvince = cardData.provinceCountry || 'Jawa Barat, ID'
    ctx.textAlign = 'right'
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText(locationCrag, 1004, 76)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.font = '400 19px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText(locationProvince, 1004, 106)

    // Route Name & Grade
    ctx.fillStyle = '#E6392D'
    ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'left'
    let drawnName = cardData.problemName
    if (ctx.measureText(drawnName).width > 540) {
      ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
    ctx.fillText(drawnName, 76, 215)

    // Massive Grade in Red
    ctx.fillStyle = '#E6392D'
    ctx.font = '900 100px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(cardData.grade, 1004, 215)

    // 4 Spec Pills
    const wallAngle = cardData.wallAngle || '110°'
    const wallHeight = cardData.wallHeight || '12 m'
    const bolts = cardData.boltsCount || '6 Bolts'
    const disciplineLabel =
      cardData.discipline?.toLowerCase().includes('boulder')
        ? 'Boulder'
        : cardData.discipline?.toLowerCase().includes('multi')
        ? 'Multi-Pitch'
        : 'Lead'

    const specs = [wallAngle, wallHeight, bolts, disciplineLabel]
    const pillW = 215
    const pillH = 54
    const pillGap = (W - 76 - 76 - pillW * 4) / 3
    specs.forEach((spec, i) => {
      const px = 76 + i * (pillW + pillGap)
      const py = 265
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(px, py, pillW, pillH, 27)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(spec, px + pillW / 2, py + 36)
    })

    // 4. MIDDLE ZONE: Action Photo (y = 360 to 1520, height = 1160)
    const midY = 360
    const midH = 1160
    const bgImageSrc =
      photoUrl ||
      ascent.photoUrl ||
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=85'

    try {
      const bgImg = new Image()
      bgImg.crossOrigin = 'anonymous'
      await new Promise<void>(resolve => {
        bgImg.onload = () => resolve()
        bgImg.onerror = () => resolve()
        bgImg.src = bgImageSrc
      })

      if (bgImg.width > 0 && bgImg.height > 0) {
        const imgRatio = bgImg.width / bgImg.height
        const slotRatio = W / midH
        let sWidth = bgImg.width
        let sHeight = bgImg.height
        let sx = 0
        let sy = 0

        if (imgRatio > slotRatio) {
          sWidth = bgImg.height * slotRatio
          sx = (bgImg.width - sWidth) / 2
        } else {
          sHeight = bgImg.width / slotRatio
          sy = (bgImg.height - sHeight) / 2
        }

        ctx.drawImage(bgImg, sx, sy, sWidth, sHeight, 0, midY, W, midH)
      }
    } catch {
      ctx.fillStyle = '#23262C'
      ctx.fillRect(0, midY, W, midH)
    }

    // Top & Bottom vignette inside photo area
    const photoGradTop = ctx.createLinearGradient(0, midY, 0, midY + 250)
    photoGradTop.addColorStop(0, 'rgba(0, 0, 0, 0.45)')
    photoGradTop.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = photoGradTop
    ctx.fillRect(0, midY, W, 250)

    const photoGradBottom = ctx.createLinearGradient(0, midY + midH - 250, 0, midY + midH)
    photoGradBottom.addColorStop(0, 'rgba(0, 0, 0, 0)')
    photoGradBottom.addColorStop(1, 'rgba(0, 0, 0, 0.55)')
    ctx.fillStyle = photoGradBottom
    ctx.fillRect(0, midY + midH - 250, W, 250)

    // Top-Left Bold Typography:
    // "Red Point/"
    // "13 Attempts/"
    // "24 Weeks/"
    const ascentStyle =
      ascent.ascentType === 'redpoint'
        ? 'Red Point'
        : ascent.ascentType === 'flash'
        ? 'Flash'
        : ascent.ascentType === 'onsight'
        ? 'Onsight'
        : ascent.ascentType === 'repeat'
        ? 'Repeat'
        : 'Send'

    const attempts =
      ascent.ascentType === 'flash' || ascent.ascentType === 'onsight'
        ? '1st Attempt'
        : cardData.attempts
        ? cardData.attempts.toString().toLowerCase().includes('attempt')
          ? cardData.attempts.toString()
          : `${cardData.attempts} Attempts`
        : '13 Attempts'

    const duration = cardData.duration || '24 Weeks'

    ctx.save()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 92px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'left'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)'
    ctx.shadowBlur = 14
    ctx.fillText(`${ascentStyle}/`, 76, midY + 120)
    ctx.fillText(`${attempts}/`, 76, midY + 225)
    ctx.fillText(`${duration}/`, 76, midY + 330)
    ctx.restore()

    // Right-Side Topo Route Line (Vector)
    if (showTopoLine) {
      ctx.save()
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const topoPts = [
        { x: 910, y: midY + 880 },
        { x: 925, y: midY + 760 },
        { x: 945, y: midY + 630 },
        { x: 930, y: midY + 480 },
        { x: 890, y: midY + 370 },
        { x: 910, y: midY + 280 },
        { x: 920, y: midY + 240 },
      ]

      ctx.beginPath()
      ctx.moveTo(topoPts[0].x, topoPts[0].y)
      for (let i = 1; i < topoPts.length; i++) {
        ctx.lineTo(topoPts[i].x, topoPts[i].y)
      }
      ctx.stroke()

      // Circular markers
      topoPts.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.fill()
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 3.5
        ctx.stroke()
      })

      // Double-ring anchor chain station at top (8-shape)
      const topPt = topoPts[topoPts.length - 1]
      ctx.beginPath()
      ctx.arc(topPt.x - 10, topPt.y, 8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(topPt.x + 10, topPt.y, 8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // 5. BOTTOM ZONE: Solid Red (y = 1520 to 1920, height = 400)
    const botY = 1520
    ctx.fillStyle = '#E6392D'
    ctx.fillRect(0, botY, W, 400)

    // Climber Name
    const climberName = cardData.climberName || 'Arief Lala Hakiem'
    const nameParts = climberName.split(' ')
    const firstName = nameParts.length > 2 ? nameParts.slice(0, 2).join(' ') : nameParts[0] || 'Arief Lala'
    const lastName = nameParts.length > 2 ? nameParts.slice(2).join(' ') : nameParts.slice(1).join(' ') || 'Hakiem'

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '300 68px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(firstName, 1004, botY + 125)
    ctx.fillText(lastName, 1004, botY + 205)

    // 2-Column Metadata Grid
    const formattedTime = cardData.time || '16:20'
    const formattedDate = cardData.date || '26/04/26'
    const belayerName = cardData.belayer || 'Nana Herdiana'
    const photoCredit = cardData.photographer || 'Meizan Nataadiningrat'

    ctx.font = '300 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'left'
    // Column 1 (x = 440)
    ctx.fillText(`(T) ${formattedTime}`, 440, botY + 285)
    ctx.fillText(`(B) ${belayerName}`, 440, botY + 345)
    // Column 2 (x = 730)
    ctx.fillText(`(D) ${formattedDate}`, 730, botY + 285)
    ctx.fillText(`(P) ${photoCredit}`, 730, botY + 345)

    // Export to Data URL
    const url = canvas.toDataURL('image/png', 0.95)
    setGeneratedDataUrl(url)
    setIsGenerating(false)
  }, [ascent, photoUrl, showTopoLine, cardData])

  // Trigger render on mount and updates
  useEffect(() => {
    renderBadge()
  }, [renderBadge])

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => {
        if (ev.target?.result) {
          setPhotoUrl(ev.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Direct file download helper
  const triggerDirectDownload = () => {
    const filename = `jalur-send-card-${ascent.problemName.toLowerCase().replace(/\s+/g, '-')}.png`
    if (generatedDataUrl) {
      const link = document.createElement('a')
      link.href = generatedDataUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Save / Share handler
  const handleSaveToPhone = async () => {
    setSavingStatus('saving')

    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error('Canvas not ready')

      const blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(resolve, 'image/png', 0.95)
      })

      if (!blob) throw new Error('Blob creation failed')

      const filename = `jalur-send-card-${ascent.problemName.toLowerCase().replace(/\s+/g, '-')}.png`
      const file = new File([blob], filename, { type: 'image/png' })

      // 1. Try Native Web Share API
      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: `Send Card: ${ascent.problemName} (${ascent.grade})`,
            text: `Send Card for ${ascent.problemName} (${ascent.grade}) at ${ascent.location}! #Jalur #SendCard`,
          })
          setSavingStatus('saved')
          setTimeout(() => setSavingStatus('idle'), 3000)
          return
        } catch (shareErr: any) {
          if (shareErr?.name === 'AbortError') {
            setSavingStatus('idle')
            return
          }
          throw shareErr
        }
      }

      // 2. Direct File Download fallback
      triggerDirectDownload()
      setSavingStatus('saved')
      setTimeout(() => setSavingStatus('idle'), 3000)
    } catch (err) {
      console.warn('Share or download error:', err)
      triggerDirectDownload()
      setSavingStatus('saved')
      setTimeout(() => setSavingStatus('idle'), 3000)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Hidden high-res canvas (1080x1920) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Container */}
        <motion.div
          className="relative w-full max-w-md bg-[#181A1F] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-y-auto no-scrollbar"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom) + 16px, 20px)',
          }}
          initial={{ scale: 0.92, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#E6392D]/20 text-[#E6392D]">
                <Sparkles size={16} />
              </span>
              <div>
                <h3 className="text-chalk font-bold text-base leading-tight">Official Send Card</h3>
                <p className="text-slate-ash text-[11px] font-light">
                  Kartu selebrasi pendakian jalur Anda 🎉
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-ash hover:text-chalk transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Card Preview */}
          <div className="relative my-3 flex justify-center items-center overflow-hidden rounded-2xl bg-black/50 border border-white/5 shadow-inner p-1">
            {isGenerating && !generatedDataUrl ? (
              <div className="h-64 sm:h-80 flex flex-col items-center justify-center gap-2 text-slate-ash">
                <RefreshCw size={24} className="animate-spin text-[#E6392D]" />
                <span className="text-xs font-light">Menyiapkan Send Card resolusi tinggi...</span>
              </div>
            ) : (
              <div className="relative group w-full flex justify-center py-1">
                <img
                  src={generatedDataUrl}
                  alt="Send Card Preview"
                  className="w-auto h-[40vh] sm:h-[48vh] max-h-[440px] object-contain rounded-2xl shadow-2xl transition-transform"
                />
                <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                  <span className="bg-black/75 backdrop-blur-sm text-[10px] text-white/90 px-2.5 py-1 rounded-full border border-white/10">
                    💡 Tip: Tekan & tahan foto untuk Save to Photos di iPhone
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* 1. Change Photo */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-chalk text-xs font-medium transition-all"
            >
              <Camera size={14} className="text-[#E6392D]" />
              <span>{photoUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
            </button>

            {/* 2. Toggle Topo Line */}
            <button
              onClick={() => setShowTopoLine(!showTopoLine)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                showTopoLine
                  ? 'border-[#E6392D]/40 bg-[#E6392D]/15 text-[#E6392D]'
                  : 'border-white/10 bg-white/5 text-slate-ash hover:text-chalk'
              }`}
            >
              <Layers size={14} />
              <span>Line Topo: {showTopoLine ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Primary: Native Share / Save to Camera Roll */}
            <button
              onClick={handleSaveToPhone}
              disabled={isGenerating}
              className="w-full py-3 px-4 rounded-xl bg-[#E6392D] hover:bg-[#D32F2F] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all touch-ripple"
            >
              {savingStatus === 'saved' ? (
                <>
                  <Check size={18} /> Berhasil Disimpan / Dibagikan!
                </>
              ) : savingStatus === 'saving' ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Menyiapkan kartu...
                </>
              ) : (
                <>
                  <Share2 size={18} /> Simpan ke Foto / Bagikan
                </>
              )}
            </button>

            {/* Direct Download button */}
            <div className="flex gap-2">
              <button
                onClick={triggerDirectDownload}
                disabled={isGenerating || !generatedDataUrl}
                className="flex-1 py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-ash hover:text-chalk text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Download size={14} /> Unduh File PNG
              </button>

              {onViewPersonalBetaBook ? (
                <button
                  onClick={() => {
                    onClose()
                    onViewPersonalBetaBook()
                  }}
                  className="flex-1 py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-ash hover:text-chalk text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Award size={14} className="text-[#E6392D]" /> Sent Cards Saya
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-ash hover:text-chalk text-xs font-medium transition-colors"
                >
                  Selesai
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
