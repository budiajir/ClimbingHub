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
  Zap,
  Eye,
  Target,
  RefreshCw,
  Award,
} from 'lucide-react'
import { UserAscent } from '@/lib/user-ascents'
import { ascentColors } from '@/lib/tokens'

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
  const [copied, setCopied] = useState(false)
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Ascent style metadata
  const styleInfo = {
    flash: { label: 'FLASH', icon: '⚡️', color: '#B1FA63' },
    onsight: { label: 'ONSIGHT', icon: '👁️', color: '#38BDF8' },
    redpoint: { label: 'REDPOINT', icon: '🎯', color: '#FE7733' },
    repeat: { label: 'REPEAT', icon: '🔄', color: '#A78BFA' },
  }[ascent.ascentType] || { label: 'SEND', icon: '🔥', color: '#B1FA63' }

  // Draw the Strava-style ascent card onto 1080x1920 high-res canvas
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

    // 1. Draw Background
    ctx.fillStyle = '#181A1F'
    ctx.fillRect(0, 0, W, H)

    const bgImageSrc = photoUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=85'

    try {
      const bgImg = new Image()
      bgImg.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve()
        bgImg.onerror = () => resolve() // Continue even if load fails
        bgImg.src = bgImageSrc
      })

      if (bgImg.width > 0 && bgImg.height > 0) {
        // Draw with cover fit
        const imgRatio = bgImg.width / bgImg.height
        const canvasRatio = W / H
        let sWidth = bgImg.width
        let sHeight = bgImg.height
        let sx = 0
        let sy = 0

        if (imgRatio > canvasRatio) {
          sWidth = bgImg.height * canvasRatio
          sx = (bgImg.width - sWidth) / 2
        } else {
          sHeight = bgImg.width / canvasRatio
          sy = (bgImg.height - sHeight) / 2
        }

        ctx.drawImage(bgImg, sx, sy, sWidth, sHeight, 0, 0, W, H)
      }
    } catch {
      // Background gradient fallback
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#23262C')
      grad.addColorStop(1, '#121417')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }

    // 2. Gradients for high contrast typography (Strava aesthetic)
    // Top vignette
    const topGrad = ctx.createLinearGradient(0, 0, 0, 480)
    topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)')
    topGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)')
    topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = topGrad
    ctx.fillRect(0, 0, W, 480)

    // Bottom vignette
    const bottomGrad = ctx.createLinearGradient(0, H - 760, 0, H)
    bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
    bottomGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.75)')
    bottomGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.92)')
    bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.98)')
    ctx.fillStyle = bottomGrad
    ctx.fillRect(0, H - 760, W, 760)

    // 3. Draw Topo Route Line (Line Jalur)
    // Map markers to safe photo area (y: 220 to 1380) so route markers and lines NEVER collide with bottom card or route name!
    const topoTop = 220
    const topoBottom = 1380
    const topoHeight = topoBottom - topoTop
    const topoLeft = 80
    const topoWidth = W - 160

    if (showTopoLine && ascent.markers && ascent.markers.length >= 2) {
      ctx.save()
      ctx.beginPath()

      const pts = ascent.markers.map(m => ({
        x: topoLeft + (m.x / 100) * topoWidth,
        y: topoTop + (m.y / 100) * topoHeight,
        type: m.type,
      }))

      // Glowing outer route stroke
      ctx.shadowColor = '#FE7733'
      ctx.shadowBlur = 24
      ctx.strokeStyle = '#FE7733'
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y)
      }
      ctx.stroke()

      // Inner crisp white highlight line
      ctx.shadowBlur = 0
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw Marker Pins (Start & Top)
      pts.forEach((p, idx) => {
        const isStart = p.type === 'S' || idx === 0
        const isTop = p.type === 'T' || idx === pts.length - 1

        const pinColor = isStart ? '#B1FA63' : isTop ? '#FE7733' : '#38BDF8'
        const pinText = isStart ? 'S' : isTop ? 'TOP' : `${idx + 1}`

        ctx.shadowColor = pinColor
        ctx.shadowBlur = 18

        // Outer glow ring
        ctx.fillStyle = pinColor
        ctx.beginPath()
        ctx.arc(p.x, p.y, isTop ? 28 : 22, 0, Math.PI * 2)
        ctx.fill()

        // Inner dark core
        ctx.shadowBlur = 0
        ctx.fillStyle = '#121417'
        ctx.beginPath()
        ctx.arc(p.x, p.y, isTop ? 22 : 17, 0, Math.PI * 2)
        ctx.fill()

        // Pin label text
        ctx.fillStyle = pinColor
        ctx.font = `bold ${isTop ? '15px' : '17px'} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(pinText, p.x, p.y + 1)
      })

      ctx.restore()
    }

    // 4. Draw Header Section: JALUR Logo & Location
    try {
      const logoImg = new Image()
      logoImg.crossOrigin = 'anonymous'
      await new Promise<void>((resolve) => {
        logoImg.onload = () => resolve()
        logoImg.onerror = () => resolve()
        logoImg.src = '/jalur-logo.png'
      })

      if (logoImg.width > 0 && logoImg.height > 0) {
        // Render crisp pure white logo with transparent background using offscreen canvas (NO white box!)
        const off = document.createElement('canvas')
        off.width = logoImg.width
        off.height = logoImg.height
        const offCtx = off.getContext('2d')
        if (offCtx) {
          offCtx.drawImage(logoImg, 0, 0)
          const imgData = offCtx.getImageData(0, 0, off.width, off.height)
          const d = imgData.data
          for (let i = 0; i < d.length; i += 4) {
            const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3
            d[i] = 255
            d[i + 1] = 255
            d[i + 2] = 255
            d[i + 3] = Math.max(0, 255 - brightness)
          }
          offCtx.putImageData(imgData, 0, 0)
          ctx.drawImage(off, 72, 75, 175, 58)
        }
      } else {
        // Fallback typography logo
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '900 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        ctx.textAlign = 'left'
        ctx.letterSpacing = '2px'
        ctx.fillText('JALUR', 72, 120)
      }
    } catch {
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '900 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('JALUR', 72, 120)
    }

    // Location (Crag & Sector) - Top Right
    ctx.textAlign = 'right'
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '1.5px'
    ctx.fillText(ascent.location.toUpperCase(), W - 72, 105)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.font = '400 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('OFFICIAL CRAG ASCENT', W - 72, 135)

    // 5. Draw Bottom Card: Strava-Style Metrics & Route Info (Frosted & collision-free)
    const cardX = 48
    const cardY = 1420
    const cardW = W - 96
    const cardH = 430
    const cardR = 32

    // Frosted dark card backdrop to protect text from any background artifacts
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetY = 10
    ctx.fillStyle = 'rgba(18, 20, 26, 0.90)'
    ctx.beginPath()
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR)
    ctx.fill()

    // Elegant subtle card border
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()

    // Card Row 1: Style Badge (Left) & Setter Name (Right)
    const row1Y = cardY + 32
    ctx.save()
    const badgeText = `${styleInfo.label} ${styleInfo.icon}`
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    const badgeWidth = ctx.measureText(badgeText).width + 32
    const badgeHeight = 40
    const badgeX = cardX + 32
    const badgeY = row1Y

    // Badge Pill
    ctx.fillStyle = styleInfo.color + '25'
    ctx.strokeStyle = styleInfo.color + '90'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 20)
    ctx.fill()
    ctx.stroke()

    // Badge Text
    ctx.fillStyle = styleInfo.color
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(badgeText, badgeX + 16, badgeY + badgeHeight / 2 + 1)

    // Route Setter (Right-aligned, auto-truncated so it NEVER collides with badge)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const setterText = ascent.setter ? `SET BY ${ascent.setter.toUpperCase()}` : 'VERIFIED OUTDOOR BOULDER'
    const maxSetterWidth = cardW - badgeWidth - 100
    let truncatedSetter = setterText
    if (ctx.measureText(truncatedSetter).width > maxSetterWidth) {
      while (ctx.measureText(truncatedSetter + '...').width > maxSetterWidth && truncatedSetter.length > 5) {
        truncatedSetter = truncatedSetter.slice(0, -1)
      }
      truncatedSetter += '...'
    }
    ctx.fillText(truncatedSetter, cardX + cardW - 32, badgeY + badgeHeight / 2 + 1)
    ctx.restore()

    // Card Row 2: Route Name (Large Bold Headline)
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '900 58px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 10
    let nameToDraw = ascent.problemName
    const maxNameWidth = cardW - 64
    if (ctx.measureText(nameToDraw).width > maxNameWidth) {
      ctx.font = '900 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
    ctx.fillText(nameToDraw, cardX + 32, cardY + 130)
    ctx.shadowBlur = 0

    // Card Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cardX + 32, cardY + 165)
    ctx.lineTo(cardX + cardW - 32, cardY + 165)
    ctx.stroke()

    // Card Row 3: 3 Non-colliding Columns (Grade, Discipline, Date)
    const statsLabelY = cardY + 205
    const statsValueY = cardY + 255

    // Col 1: GRADE (Left-aligned at cardX + 32)
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('GRADE', cardX + 32, statsLabelY)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText(ascent.grade, cardX + 32, statsValueY)

    if (ascent.fontGrade) {
      const gradeW = ctx.measureText(ascent.grade).width
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillText(`/ ${ascent.fontGrade}`, cardX + 32 + gradeW + 10, statsValueY)
    }

    // Col 2: DISCIPLINE (Center-aligned at W / 2)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('DISCIPLINE', W / 2, statsLabelY)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '800 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '1px'
    ctx.fillText((ascent.discipline || 'BOULDER').toUpperCase(), W / 2, statsValueY)

    // Col 3: DATE (Right-aligned at cardX + cardW - 32)
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('DATE', cardX + cardW - 32, statsLabelY)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '800 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '0.5px'
    ctx.fillText(ascent.date, cardX + cardW - 32, statsValueY)

    // Footer tag inside card
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('LOGGED ON BETA BOOK · JALUR CLIMBING COMMUNITY', W / 2, cardY + cardH - 35)

    // Export to Data URL
    const url = canvas.toDataURL('image/png', 0.95)
    setGeneratedDataUrl(url)
    setIsGenerating(false)
  }, [ascent, photoUrl, showTopoLine, styleInfo])

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
    const filename = `jalur-ascent-${ascent.problemName.toLowerCase().replace(/\s+/g, '-')}.png`
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

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(resolve, 'image/png', 0.95)
      })

      if (!blob) throw new Error('Blob creation failed')

      const filename = `jalur-ascent-${ascent.problemName.toLowerCase().replace(/\s+/g, '-')}.png`
      const file = new File([blob], filename, { type: 'image/png' })

      // 1. Try Native Web Share API (opens native iOS Share Sheet with "Save Image" to Photos!)
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Ascent: ${ascent.problemName} (${ascent.grade})`,
            text: `Crushed ${ascent.problemName} (${ascent.grade}) at ${ascent.location}! #JalurBeta #Climbing`,
          })
          setSavingStatus('saved')
          setTimeout(() => setSavingStatus('idle'), 3000)
          return
        } catch (shareErr: any) {
          // If user cancelled/dismissed iOS share sheet, do NOT force fallback download into Files
          if (shareErr?.name === 'AbortError') {
            setSavingStatus('idle')
            return
          }
          throw shareErr
        }
      }

      // 2. Direct File Download fallback (for desktop or browsers without Web Share)
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
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Hidden high-res canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Container */}
        <motion.div
          className="relative w-full max-w-md bg-[#181A1F] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col my-auto max-h-[96vh]"
          initial={{ scale: 0.92, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-lime/20 text-lime">
                <Sparkles size={16} />
              </span>
              <div>
                <h3 className="text-chalk font-bold text-base leading-tight">Ascent Share Card</h3>
                <p className="text-slate-ash text-[11px] font-light">Auto-generated reward for your send 🎉</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-ash hover:text-chalk transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Card Preview (9:16 Aspect Phone Frame) */}
          <div className="relative my-3 flex justify-center items-center overflow-hidden rounded-2xl bg-black/50 border border-white/5 shadow-inner">
            {isGenerating && !generatedDataUrl ? (
              <div className="h-80 flex flex-col items-center justify-center gap-2 text-slate-ash">
                <RefreshCw size={24} className="animate-spin text-lime" />
                <span className="text-xs font-light">Generating high-res card...</span>
              </div>
            ) : (
              <div className="relative group w-full flex justify-center py-1">
                <img
                  src={generatedDataUrl}
                  alt="Ascent Badge Preview"
                  className="w-auto h-[50vh] max-h-[460px] object-contain rounded-xl shadow-2xl transition-transform"
                />
                <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                  <span className="bg-black/70 backdrop-blur-sm text-[10px] text-white/80 px-2.5 py-1 rounded-full border border-white/10">
                    💡 Tip: Tekan lama foto untuk Save to Photos di iPhone
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
              <Camera size={14} className="text-lime" />
              <span>{photoUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
            </button>

            {/* 2. Toggle Topo Line */}
            <button
              onClick={() => setShowTopoLine(!showTopoLine)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                showTopoLine
                  ? 'border-lime/40 bg-lime/15 text-lime'
                  : 'border-white/10 bg-white/5 text-slate-ash hover:text-chalk'
              }`}
            >
              <Layers size={14} />
              <span>Line Jalur: {showTopoLine ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Primary: Native Share / Save to Camera Roll */}
            <button
              onClick={handleSaveToPhone}
              disabled={isGenerating}
              className="w-full py-3 px-4 rounded-xl bg-lime hover:bg-lime-dim text-granite font-bold text-sm flex items-center justify-center gap-2 shadow-lime-glow-sm transition-all touch-ripple"
            >
              {savingStatus === 'saved' ? (
                <>
                  <Check size={18} /> Berhasil Dibagikan / Disimpan!
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
                  <Award size={14} className="text-lime" /> Beta Book Saya
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

            {/* iPhone Safari Photos Guidance Note */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-chalk">
                <span>💡</span>
                <span>Tips Masuk ke Galeri Foto iPhone:</span>
              </div>
              <p className="text-[10px] text-slate-ash leading-relaxed">
                Di iPhone Safari, klik tombol <b>Simpan ke Foto / Bagikan</b> lalu pilih menu <strong className="text-chalk">"Save Image / Simpan Gambar"</strong>. Atau Anda juga bisa <b>tekan & tahan (hold)</b> gambar kartu di atas lalu pilih <strong className="text-lime">"Simpan ke Foto"</strong> agar masuk langsung ke Galeri Foto.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
