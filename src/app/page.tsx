'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, CheckCircle2 } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

const SLIDES = [
  {
    id: 'slide-1',
    src: '/landing/slide-1-cover.jpg',
    alt: 'Jalur — Bouldering & Climbing Community Cover',
    title: 'Jalur Cover',
  },
  {
    id: 'slide-2',
    src: '/landing/slide-2-climber.jpg',
    alt: 'Outdoor Bouldering Roof Climber Action',
    title: 'Climber Action',
  },
  {
    id: 'slide-3',
    src: '/landing/slide-3-development.png',
    alt: 'Our Website Are (Still) Under Development',
    title: 'Under Development',
    hasHotspots: true,
  },
  {
    id: 'slide-4',
    src: '/landing/slide-4-discover.png',
    alt: 'Discover Soon — Climbers Illustration',
    title: 'Discover Soon',
  },
  {
    id: 'slide-5',
    src: '/landing/slide-5-form.png',
    alt: 'We\'ll Let You Know When It\'s Ready — Beta Testing Form',
    title: 'Join Beta Testing',
    hasForm: true,
  },
]

export default function HomePage() {
  const { isSandstone } = useTheme()
  const [activeSlide, setActiveSlide] = useState(0)

  // Interactive Beta Testing Waitlist State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      const existing = JSON.parse(localStorage.getItem('jalur_beta_waitlist') || '[]')
      existing.push({ name: name.trim(), email: email.trim(), date: new Date().toISOString() })
      localStorage.setItem('jalur_beta_waitlist', JSON.stringify(existing))
    } catch {
      // LocalStorage fallback
    }

    setIsSubmitted(true)
  }

  const scrollToSlide = (index: number) => {
    const el = document.getElementById(`slide-${index}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setActiveSlide(index)
    }
  }

  return (
    <div
      className={`relative w-full min-h-[calc(100dvh-56px-4.5rem)] snap-y snap-mandatory overflow-y-auto transition-colors duration-300 ${
        isSandstone ? 'bg-[#d2c5ae] text-[#1a1815]' : 'bg-[#1b141e] text-chalk'
      }`}
    >
      {/* 5 Full Frame Slides (1 to 5) */}
      {SLIDES.map((slide, idx) => (
        <section
          key={slide.id}
          id={`slide-${idx}`}
          className="relative w-full min-h-[calc(100dvh-56px-4.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex flex-col items-center justify-center py-2 px-3 sm:px-4 snap-start"
        >
          {/* Card Frame matching 9:16 mobile ratio, never cut off */}
          <div className="relative w-full max-w-[420px] aspect-[575/1024] max-h-[calc(100dvh-56px-4.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom)-20px)] flex items-center justify-center">
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-contain rounded-2xl md:rounded-3xl shadow-2xl select-none"
              loading={idx === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />

            {/* Slide 3: Interactive Hotspots on the 5 Pictograms */}
            {slide.hasHotspots && (
              <div className="absolute inset-0 pointer-events-auto">
                {/* 1. Mountain Peak -> Crags */}
                <Link
                  href="/crags"
                  title="Explore Crags"
                  className="absolute left-[38%] w-[24%] h-[8%] top-[20%] rounded-xl focus:outline-none hover:bg-white/10 active:bg-white/20 transition-colors"
                />
                {/* 2. Route Topo -> Beta */}
                <Link
                  href="/beta"
                  title="Beta Topo"
                  className="absolute left-[38%] w-[24%] h-[7%] top-[39%] rounded-xl focus:outline-none hover:bg-white/10 active:bg-white/20 transition-colors"
                />
                {/* 3. Plus -> Community */}
                <Link
                  href="/community"
                  title="Community & Connect"
                  className="absolute left-[38%] w-[24%] h-[6%] top-[57%] rounded-xl focus:outline-none hover:bg-white/10 active:bg-white/20 transition-colors"
                />
                {/* 4. Gym -> Gyms */}
                <Link
                  href="/gyms"
                  title="Climbing Gyms"
                  className="absolute left-[38%] w-[24%] h-[7%] top-[73%] rounded-xl focus:outline-none hover:bg-white/10 active:bg-white/20 transition-colors"
                />
                {/* 5. Boulder Rings -> Community */}
                <Link
                  href="/community"
                  title="Boulder Community"
                  className="absolute left-[38%] w-[24%] h-[7%] top-[90%] rounded-xl focus:outline-none hover:bg-white/10 active:bg-white/20 transition-colors"
                />
              </div>
            )}

            {/* Slide 5: Interactive Waitlist Form Overlaid on Graphic */}
            {slide.hasForm && (
              <div className="absolute inset-0 pointer-events-auto">
                {isSubmitted ? (
                  /* Success Overlay */
                  <div className="absolute left-[10%] right-[10%] top-[70%] bottom-[5%] bg-[#1a081d]/90 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 border border-lime/30 shadow-xl">
                    <CheckCircle2 size={32} className="text-lime" />
                    <div className="font-bold text-sm text-white">Terima Kasih!</div>
                    <div className="text-xs text-white/80 leading-relaxed font-light">
                      Email kamu sudah terdaftar. Kami akan mengabari saat sesi beta testing Jalur dibuka!
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="mt-2 text-[11px] underline opacity-75 hover:opacity-100 text-white"
                    >
                      Daftar email lain
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="contents">
                    {/* Name Input */}
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder=""
                      aria-label="Name"
                      className="absolute left-[21.5%] w-[67%] top-[73.2%] h-[4.7%] bg-transparent text-white px-3 text-xs sm:text-sm font-medium rounded-full focus:outline-none focus:ring-1 focus:ring-white/40"
                    />

                    {/* Email Input */}
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      aria-label="Email"
                      className="absolute left-[21.5%] w-[67%] top-[79.6%] h-[4.7%] bg-transparent text-white px-3 text-xs sm:text-sm font-medium rounded-full focus:outline-none focus:ring-1 focus:ring-white/40"
                    />

                    {/* Submit Button */}
                    <button
                      type="submit"
                      aria-label="Submit"
                      className="absolute left-[32.5%] w-[35%] top-[89.2%] h-[5.2%] bg-transparent cursor-pointer rounded-full active:scale-95 transition-transform"
                    />
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Clean Scroll Hint for Slide 1-4 (Static, no bounce animation) */}
          {idx < SLIDES.length - 1 && (
            <button
              type="button"
              onClick={() => scrollToSlide(idx + 1)}
              className="mt-2 flex items-center gap-1 text-[11px] font-mono tracking-wider opacity-60 hover:opacity-100 transition-opacity"
            >
              <span>Scroll</span>
              <ChevronDown size={14} />
            </button>
          )}

          {/* Slide 5: Quick Exploration Links */}
          {idx === SLIDES.length - 1 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 max-w-sm px-2">
              <Link
                href="/crags"
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider transition-colors border ${
                  isSandstone
                    ? 'border-[#1a1815]/30 text-[#1a1815] hover:bg-[#1a1815]/10'
                    : 'border-white/20 text-white/90 hover:bg-white/10'
                }`}
              >
                Explore Crags &rarr;
              </Link>
              <Link
                href="/beta"
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider transition-colors border ${
                  isSandstone
                    ? 'border-[#1a1815]/30 text-[#1a1815] hover:bg-[#1a1815]/10'
                    : 'border-white/20 text-white/90 hover:bg-white/10'
                }`}
              >
                Beta Topo &rarr;
              </Link>
              <Link
                href="/gyms"
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider transition-colors border ${
                  isSandstone
                    ? 'border-[#1a1815]/30 text-[#1a1815] hover:bg-[#1a1815]/10'
                    : 'border-white/20 text-white/90 hover:bg-white/10'
                }`}
              >
                Gyms &rarr;
              </Link>
            </div>
          )}
        </section>
      ))}

      {/* Floating Vertical Slide Indicator (Static, No animation) */}
      <aside
        aria-label="Slide Indicator"
        className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col gap-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToSlide(i)}
            title={`Slide ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              activeSlide === i ? 'bg-white' : 'bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </aside>
    </div>
  )
}
