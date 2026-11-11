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
import {
  SendCardData,
  SEND_CARD_RED,
  DEFAULT_SEND_CARD_PHOTO,
  orderRouteMarkers,
  trimmedLineSegment,
  formatSendCardSpecs,
  formatSendCardNameLines,
  formatSendCardAscentType,
  formatSendCardAttempts,
} from './SendCard'

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

  // Draw the high-res Send Card onto 1080x1920 Canvas matching SendCard design
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

    ctx.fillStyle = '#181A1F'
    ctx.fillRect(0, 0, W, H)

    const loadImage = (src: string): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        const img = new Image()
        if (!src.startsWith('data:')) {
          img.crossOrigin = 'anonymous'
        }
        img.onload = () => resolve(img.width > 0 ? img : null)
        img.onerror = () => resolve(null)
        img.src = src
      })

    // 1. Full-Bleed Action Photo (cover fit 1080x1920)
    const bgImageSrc = photoUrl || ascent.photoUrl || DEFAULT_SEND_CARD_PHOTO
    const [bgImg, logoImg] = await Promise.all([
      loadImage(bgImageSrc),
      loadImage('/jalur-logo-white.png'),
    ])

    if (bgImg) {
      const imgRatio = bgImg.width / bgImg.height
      const slotRatio = W / H
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
      ctx.drawImage(bgImg, sx, sy, sWidth, sHeight, 0, 0, W, H)
    }

    // 2. Subtle Top Gradient Scrim for legibility over outdoor rock
    const topGrad = ctx.createLinearGradient(0, 0, 0, 840)
    topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.64)')
    topGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)')
    topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = topGrad
    ctx.fillRect(0, 0, W, 840)

    // 3. Red Route Direction Overlay (Arah Jalur)
    if (showTopoLine) {
      const ordered = orderRouteMarkers(cardData.markers)
      const pts = ordered.map((m) => ({
        ...m,
        px: (Number(m.x) / 100) * W,
        py: (Number(m.y) / 100) * H,
      }))
      const markerR = 16.5
      const anchorGap = 19.5

      ctx.save()
      ctx.strokeStyle = SEND_CARD_RED
      ctx.fillStyle = SEND_CARD_RED
      ctx.lineWidth = 6.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const seg = trimmedLineSegment(p1.px, p1.py, p2.px, p2.py, markerR, markerR)
        if (seg) {
          ctx.beginPath()
          ctx.moveTo(seg.x1, seg.y1)
          ctx.lineTo(seg.x2, seg.y2)
          ctx.stroke()
        }
      }

      pts.forEach((pt) => {
        if (pt.type === 'S') {
          ctx.beginPath()
          ctx.arc(pt.px, pt.py, markerR, 0, Math.PI * 2)
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(pt.px, pt.py, markerR, 0, Math.PI, false)
          ctx.closePath()
          ctx.fill()
        } else if (pt.type === 'T') {
          ctx.beginPath()
          ctx.arc(pt.px - anchorGap, pt.py, markerR, 0, Math.PI * 2)
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(pt.px + anchorGap, pt.py, markerR, 0, Math.PI * 2)
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.arc(pt.px, pt.py, markerR, 0, Math.PI * 2)
          ctx.stroke()
        }
      })
      ctx.restore()
    }

    // 4. Top Editorial Header Overlay
    const marginX = 68
    const rightX = W - marginX

    // 4a. Logo "jalur." (top left)
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)'
    ctx.shadowBlur = 12
    if (logoImg) {
      const targetH = 56
      const targetW = (logoImg.width / logoImg.height) * targetH
      ctx.drawImage(logoImg, marginX, 68, targetW, targetH)
    } else {
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '900 54px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('jalur.', marginX, 114)
    }

    // 4b. Problem Title (below logo)
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '700 42px "BDO Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillText(cardData.problemName || 'Gugusan Bintang', marginX, 178, 560)

    // 4c. Large Grade (top right)
    ctx.textAlign = 'right'
    ctx.font = '900 122px "DIN Condensed", "Roboto Condensed", "Arial Narrow", "BDO Grotesk", sans-serif'
    ctx.fillText((cardData.grade || '5.12 B').toUpperCase(), rightX, 168)
    ctx.restore()

    // 4d. 4 Outlined Spec Pills across full width
    const specs = formatSendCardSpecs(cardData)
    const pillGap = 18
    const pillW = (W - marginX * 2 - pillGap * 3) / 4
    const pillH = 52
    const pillY = 216

    specs.forEach((spec, i) => {
      const px = marginX + i * (pillW + pillGap)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.roundRect(px, pillY, pillW, pillH, 26)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '700 24px "BDO Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(spec, px + pillW / 2, pillY + pillH / 2 + 1, pillW - 20)
    })

    // 4e. Climber Name (left) & Ascent Style + Attempts (right)
    const [nameLine1, nameLine2] = formatSendCardNameLines(cardData.climberName)
    const ascentLabel = formatSendCardAscentType(cardData.ascentType)
    const attemptsLabel = formatSendCardAttempts(cardData.attempts, cardData.ascentType)

    ctx.save()
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = 14
    ctx.textBaseline = 'alphabetic'
    ctx.font = '900 62px "DIN Condensed", "Roboto Condensed", "Arial Narrow", "BDO Grotesk", sans-serif'

    ctx.textAlign = 'left'
    ctx.fillText(nameLine1, marginX, 344, 540)
    if (nameLine2) {
      ctx.fillText(nameLine2, marginX, 404, 540)
    }

    ctx.textAlign = 'right'
    ctx.fillText(ascentLabel, rightX, 344, 420)
    ctx.fillText(attemptsLabel, rightX, 404, 420)
    ctx.restore()

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
                  Celebration card for your verified send 🎉
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
                <span className="text-xs font-light">Preparing high-resolution Send Card...</span>
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
                    💡 Tip: Press & hold image to Save to Photos on iPhone
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
              <span>{photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
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
              <span>Topo Line: {showTopoLine ? 'ON' : 'OFF'}</span>
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
                  <Check size={18} /> Saved / Shared Successfully!
                </>
              ) : savingStatus === 'saving' ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Preparing card...
                </>
              ) : (
                <>
                  <Share2 size={18} /> Save to Photos / Share
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
                <Download size={14} /> Download PNG
              </button>

              {onViewPersonalBetaBook ? (
                <button
                  onClick={() => {
                    onClose()
                    onViewPersonalBetaBook()
                  }}
                  className="flex-1 py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-ash hover:text-chalk text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Award size={14} className="text-[#E6392D]" /> My Send Cards
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-ash hover:text-chalk text-xs font-medium transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
