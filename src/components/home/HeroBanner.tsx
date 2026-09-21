'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

interface HeroSlide {
  id: string
  image: string
  tag?: string
  title: string
  subtitle?: string
  link?: string
  ctaText?: string
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image: '/home-hero-bg.jpg',
    tag: 'EXPLORE INDONESIA',
    title: 'Jalur',
    subtitle: 'Ekosistem informasi tebing alam, topo interaktif, dan komunitas panjat Indonesia',
    link: '/crags',
    ctaText: 'Jelajahi Tebing',
  },
  {
    id: 'slide-2',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Fabio_Palma%2C_Cardiopalma%2C_7c%2C_Kalymnos.jpg',
    tag: 'LATEST POST · EXPEDITION',
    title: 'Lembah Harau Topo 2026',
    subtitle: '89 jalur boulder dan tebing granit monolit baru di Sumatera Barat telah dipetakan',
    link: '/crags/lembah-harau',
    ctaText: 'Lihat Topo Harau',
  },
  {
    id: 'slide-3',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Chris_Sharma_-_1.jpg',
    tag: 'LATEST POST · NEW ROUTE',
    title: 'Pantai Siung Karst Slab',
    subtitle: 'Panduan akses tebing pantai, kontak pengelola, dan prakiraan ombak laut selatan',
    link: '/crags/pantai-siung',
    ctaText: 'Panduan Tebing Siung',
  },
  {
    id: 'slide-4',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1600&q=80',
    tag: 'LATEST POST · CRAG GUIDE',
    title: 'Citatah 125 & Tebing 90',
    subtitle: 'Katalog rute sport climbing & trad klasik dengan konsensus grade komunitas',
    link: '/crags/citatah',
    ctaText: 'Eksplorasi Citatah',
  },
]

export default function HeroBanner() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentIdx(prev => (prev + 1) % HERO_SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIdx(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      nextSlide()
    }, 5500)
    return () => clearInterval(timer)
  }, [isPaused, nextSlide])

  const slide = HERO_SLIDES[currentIdx]

  return (
    <div
      className="relative w-full overflow-hidden h-[460px] sm:h-[540px] md:h-[620px] lg:h-[700px] flex items-center justify-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slideshow with Crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${slide.image}')`,
            backgroundPosition: 'center 45%',
          }}
        />
      </AnimatePresence>

      {/* Atmospheric dark gradient for contrast and readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-3 md:space-y-4">
        {slide.tag && (
          <motion.div
            key={`tag-${slide.id}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-mono font-bold tracking-wider uppercase bg-black/60 backdrop-blur-md text-lime border border-lime/30 shadow-md"
          >
            <span>{slide.tag}</span>
          </motion.div>
        )}

        <motion.h1
          key={`title-${slide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-chalk tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
        >
          {slide.title}
        </motion.h1>

        {slide.subtitle && (
          <motion.p
            key={`sub-${slide.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xs sm:text-sm md:text-base font-light text-white/90 max-w-xl mx-auto leading-relaxed drop-shadow-md"
          >
            {slide.subtitle}
          </motion.p>
        )}

        {slide.link && (
          <motion.div
            key={`cta-${slide.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-2"
          >
            <Link
              href={slide.link}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lime text-granite text-xs sm:text-sm font-bold shadow-lime-glow hover:bg-lime-dim transition-all"
            >
              <span>{slide.ctaText || 'Lihat Detail'}</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Desktop Next / Previous Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/15 text-white items-center justify-center transition-all group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/15 text-white items-center justify-center transition-all group"
      >
        <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Bottom Slide Indicator Dots */}
      <div className="absolute bottom-5 inset-x-0 z-20 flex items-center justify-center gap-2">
        {HERO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentIdx(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIdx === idx
                ? 'w-6 bg-lime shadow-lime-glow-sm'
                : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
