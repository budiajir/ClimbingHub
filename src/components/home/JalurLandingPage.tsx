'use client'

import { useState, useEffect } from 'react'

const SLIDES = [
  { id: 0, src: '/landing/slide-1-cover.jpg', alt: '1. Jalur - Cover Poster' },
  { id: 1, src: '/landing/slide-3-development.png', alt: '2. Our Website Are (Still) Under Development' },
  { id: 2, src: '/landing/slide-4-discover.png', alt: '3. Discover Soon' },
  { id: 3, src: '/landing/slide-2-climber.jpg', alt: '4. Outdoor Bouldering Roof Climber' },
  { id: 4, src: '/landing/slide-5-form.png', alt: "5. We'll Let You Know When It's Ready" },
]

export default function JalurLandingPage() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const elements = SLIDES.map((_, i) => document.getElementById(`img-slide-${i}`))
      const scrollPos = window.scrollY + window.innerHeight / 3
      elements.forEach((el, i) => {
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSlide(i)
          }
        }
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSlide = (index: number) => {
    const el = document.getElementById(`img-slide-${index}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setActiveSlide(index)
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-black overflow-x-hidden select-none">
      {/* Floating Dots Navigation - Hanya titik, tanpa box */}
      <nav
        aria-label="Slide Indicator"
        className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 p-0 bg-transparent border-none"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToSlide(i)}
            title={`Slide ${i + 1}`}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-150 drop-shadow-md ${
              activeSlide === i
                ? 'bg-orange-500 scale-150 shadow-[0_0_8px_rgba(255,102,0,0.8)]'
                : 'bg-white/40 hover:bg-white/80'
            }`}
          />
        ))}
      </nav>

      {/* Murni 5 Foto / Artwork Nempel Tanpa Jarak & Tanpa Komponen Ekstra */}
      <main className="w-full max-w-[540px] mx-auto p-0 flex flex-col leading-none font-[0]">
        {SLIDES.map((slide, idx) => (
          <img
            key={slide.id}
            id={`img-slide-${idx}`}
            src={slide.src}
            alt={slide.alt}
            className="w-full h-auto block m-0 p-0 border-none rounded-none shadow-none align-top"
            loading={idx === 0 ? 'eager' : 'lazy'}
            draggable={false}
          />
        ))}
      </main>
    </div>
  )
}
