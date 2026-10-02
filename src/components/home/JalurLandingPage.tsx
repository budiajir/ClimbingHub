'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

interface SlideItem {
  id: number
  src: string
  alt: string
  hasHotspots?: boolean
  hasForm?: boolean
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    src: '/landing/slide-1-cover.jpg',
    alt: '1. Jalur - Cover Poster',
  },
  {
    id: 2,
    src: '/landing/slide-3-development.png',
    alt: '2. Our Website Are (Still) Under Development',
    hasHotspots: true,
  },
  {
    id: 3,
    src: '/landing/slide-4-discover.png',
    alt: '3. Discover Soon',
  },
  {
    id: 4,
    src: '/landing/slide-2-climber.jpg',
    alt: '4. Outdoor Bouldering Roof Climber',
  },
  {
    id: 5,
    src: '/landing/slide-5-form.png',
    alt: "5. We'll Let You Know When It's Ready",
    hasForm: true,
  },
]

export default function JalurLandingPage() {
  const [activeSlide, setActiveSlide] = useState(0)

  // Waitlist Form State (Slide 5)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      const waitlist = JSON.parse(localStorage.getItem('jalur_waitlist') || '[]')
      waitlist.push({
        name,
        email,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('jalur_waitlist', JSON.stringify(waitlist))
    } catch {
      // LocalStorage fallback
    }

    setIsSubmitted(true)
  }

  const scrollToSlide = (index: number) => {
    const el = document.getElementById(`jalur-slide-${index}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setActiveSlide(index)
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-[#140517] overflow-x-hidden select-none">
      {/* Seamless Continuous Strip Container - 0 Gap */}
      <main className="w-full max-w-[540px] mx-auto p-0 flex flex-col">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            id={`jalur-slide-${idx}`}
            className="relative w-full m-0 p-0 leading-none block overflow-hidden"
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-auto block m-0 p-0 border-none rounded-none shadow-none align-top"
              loading={idx === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />

            {/* Slide 2: Interactive Hotspots on the 5 Pictograms */}
            {slide.hasHotspots && (
              <div className="absolute inset-0 pointer-events-auto">
                <Link
                  href="/crags"
                  title="Explore Crags"
                  className="absolute left-[38%] w-[24%] h-[8%] top-[20%] rounded-xl focus:outline-none hover:bg-white/10 active:bg-white/20 transition-colors"
                />
                <Link
                  href="/beta"
                  title="Beta Topo"
                  className="absolute left-[38%] w-[24%] h-[7%] top-[39%] rounded-xl focus:outline-none hover:bg-white/10 active:bg-white/20 transition-colors"
                />
                <Link
                  href="/community"
                  title="Community & Connect"
                  className="absolute left-[38%] w-[24%] h-[6%] top-[57%] rounded-xl focus:outline-none hover:bg-white/10 active:bg-white/20 transition-colors"
                />
                <Link
                  href="/gyms"
                  title="Climbing Gyms"
                  className="absolute left-[38%] w-[24%] h-[7%] top-[73%] rounded-xl focus:outline-none hover:bg-white/10 active:bg-white/20 transition-colors"
                />
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
                  <div className="absolute left-[10%] right-[10%] top-[70%] bottom-[6%] bg-[#1a081d]/95 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 border border-orange-500/40 shadow-xl leading-normal">
                    <CheckCircle2 size={32} className="text-orange-500" />
                    <div className="font-bold text-sm text-white">Terima Kasih!</div>
                    <div className="text-xs text-white/85 leading-relaxed font-light">
                      Email kamu sudah terdaftar. Kami akan mengabari saat sesi beta testing Jalur dibuka!
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="mt-2 text-[11px] underline opacity-80 hover:opacity-100 text-white"
                    >
                      Daftar email lain
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="contents">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder=""
                      aria-label="Name"
                      className="absolute left-[21.5%] w-[67%] top-[73.2%] h-[4.8%] bg-transparent text-white px-3 text-xs sm:text-sm font-medium rounded-full focus:outline-none focus:ring-1 focus:ring-white/40 border border-white/20"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      aria-label="Email"
                      className="absolute left-[21.5%] w-[67%] top-[79.6%] h-[4.8%] bg-transparent text-white px-3 text-xs sm:text-sm font-medium rounded-full focus:outline-none focus:ring-1 focus:ring-white/40 border border-white/20"
                    />
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
        ))}
      </main>

      {/* Floating Vertical Slide Indicator */}
      <aside
        aria-label="Slide Indicator"
        className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col gap-2.5 p-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToSlide(i)}
            title={`Slide ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-colors ${
              activeSlide === i ? 'bg-orange-500 scale-125' : 'bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </aside>

      {/* Clean Footer seamlessly below Slide 5 */}
      <footer className="w-full max-w-[540px] mx-auto py-6 px-4 flex items-center justify-center gap-4 text-[11px] tracking-wider uppercase text-white/50 bg-[#240626]">
        <span>&copy; 2026 Jalur</span>
        <a href="https://www.instagram.com/jalur.world/" target="_blank" rel="noopener" className="text-orange-500 hover:underline">
          @jalur.world
        </a>
      </footer>
    </div>
  )
}
