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
    if (showTopoLine && ascent.markers && ascent.markers.length >= 2) {
      ctx.save()
      ctx.beginPath()

      const pts = ascent.markers.map(m => ({
        x: (m.x / 100) * W,
        y: (m.y / 100) * H,
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

      if (logoImg.width > 0) {
        // Draw white tinted logo
        ctx.save()
        ctx.filter = 'brightness(0) invert(1)'
        ctx.drawImage(logoImg, 72, 80, 160, 52)
        ctx.restore()
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

    // Location (Crag & Sector) - Top Right or below logo
    ctx.textAlign = 'right'
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '1.5px'
    ctx.fillText(ascent.location.toUpperCase(), W - 72, 105)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.font = '400 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('OFFICIAL CRAG ASCENT', W - 72, 135)

    // 5. Draw Bottom Section: Strava-Style Metrics & Route Info
    const baseY = H - 540

    // Style Badge Pill (e.g. FLASH ⚡️)
    ctx.save()
    const badgeText = `${styleInfo.label} ${styleInfo.icon}`
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    const badgeWidth = ctx.measureText(badgeText).width + 36
    const badgeHeight = 44
    const badgeX = 72
    const badgeY = baseY

    // Pill background
    ctx.fillStyle = styleInfo.color + '25'
    ctx.strokeStyle = styleInfo.color + '80'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 22)
    ctx.fill()
    ctx.stroke()

    // Pill text
    ctx.fillStyle = styleInfo.color
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(badgeText, badgeX + 18, badgeY + badgeHeight / 2 + 1)
    ctx.restore()

    // 1. Nama Jalur (Route Name) - Large Bold Headline
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '900 68px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
    ctx.shadowBlur = 12
    ctx.fillText(ascent.problemName, 72, baseY + 120)
    ctx.shadowBlur = 0

    // 2. Nama Route Setter
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '1px'
    const setterText = ascent.setter ? `SET BY ${ascent.setter.toUpperCase()}` : 'VERIFIED OUTDOOR BOULDER'
    ctx.fillText(setterText, 72, baseY + 165)

    // Divider Line (thin elegant line)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(72, baseY + 200)
    ctx.lineTo(W - 72, baseY + 200)
    ctx.stroke()

    // 3. Strava 3-Column Metrics (Grade, Discipline, Date)
    const statsY = baseY + 250
    const colWidth = (W - 144) / 3

    // Column 1: GRADE
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('GRADE', 72, statsY)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText(ascent.grade, 72, statsY + 60)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText(ascent.fontGrade ? `/ ${ascent.fontGrade}` : '', 72 + ctx.measureText(ascent.grade).width + 12, statsY + 60)

    // Column 2: ASCENT STYLE
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('DISCIPLINE', 72 + colWidth, statsY)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText((ascent.discipline || 'Boulder').toUpperCase(), 72 + colWidth, statsY + 60)

    // Column 3: TANGGAL (Date)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('DATE', 72 + colWidth * 2, statsY)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText(ascent.date, 72 + colWidth * 2, statsY + 60)

    // 4. Bottom Footer tag
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.letterSpacing = '3px'
    ctx.fillText('LOGGED ON BETA BOOK · JALUR CLIMBING COMMUNITY', W / 2, H - 65)

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

      // 1. Try Native Web Share API (opens iOS Share Sheet with "Save Image" to Photos!)
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Ascent: ${ascent.problemName} (${ascent.grade})`,
          text: `Crushed ${ascent.problemName} (${ascent.grade}) at ${ascent.location}! #JalurBeta #Climbing`,
        })
        setSavingStatus('saved')
        setTimeout(() => setSavingStatus('idle'), 3000)
        return
      }

      // 2. Direct File Download fallback (saves to phone downloads / camera roll)
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(blob)
      downloadLink.download = filename
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      setSavingStatus('saved')
      setTimeout(() => setSavingStatus('idle'), 3000)
    } catch (err) {
      console.warn('Share sheet cancelled or failed, falling back to download:', err)
      // Standard download fallback
      if (generatedDataUrl) {
        const link = document.createElement('a')
        link.href = generatedDataUrl
        link.download = `jalur-ascent-${ascent.problemName.toLowerCase().replace(/\s+/g, '-')}.png`
        link.click()
      }
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
            {/* Primary: Save to Phone / Download */}
            <button
              onClick={handleSaveToPhone}
              disabled={isGenerating}
              className="w-full py-3 px-4 rounded-xl bg-lime hover:bg-lime-dim text-granite font-bold text-sm flex items-center justify-center gap-2 shadow-lime-glow-sm transition-all touch-ripple"
            >
              {savingStatus === 'saved' ? (
                <>
                  <Check size={18} /> Tersimpan ke Galeri Foto!
                </>
              ) : savingStatus === 'saving' ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Menyiapkan gambar...
                </>
              ) : (
                <>
                  <Download size={18} /> Download / Save to Photos
                </>
              )}
            </button>

            {/* Secondary: View in My Beta Book */}
            {onViewPersonalBetaBook ? (
              <button
                onClick={() => {
                  onClose()
                  onViewPersonalBetaBook()
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 text-slate-ash hover:text-chalk text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Award size={14} className="text-lime" />
                Lihat di Beta Book Personal Saya
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 text-slate-ash hover:text-chalk text-xs font-medium transition-colors"
              >
                Selesai
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
