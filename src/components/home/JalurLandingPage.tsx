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

  // Waitlist Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [submittedName, setSubmittedName] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setStatus('error')
      setMessage('Please enter your name.')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSubmittedName(name.trim())
        setSubmittedEmail(email.trim())
        setStatus('success')
        setMessage(data.message)
        setName('')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.message || 'Failed to submit. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setMessage('')
    setName('')
    setEmail('')
  }

  return (
    <div className="relative w-full min-h-screen bg-black overflow-x-hidden">
      {/* Floating Dots Navigation */}
      <nav
        aria-label="Slide Indicator"
        className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 p-0 bg-transparent border-none select-none"
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

      {/* 5 Foto / Artwork Nempel Tanpa Jarak */}
      <main className="w-full max-w-[540px] mx-auto p-0 flex flex-col leading-none font-[0]">
        {SLIDES.map((slide, idx) => {
          // Slide 0 - 3: Standard Posters
          if (idx !== 4) {
            return (
              <img
                key={slide.id}
                id={`img-slide-${idx}`}
                src={slide.src}
                alt={slide.alt}
                className="w-full h-auto block m-0 p-0 border-none rounded-none shadow-none align-top select-none"
                loading={idx === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            )
          }

          // Slide 4: Interactive Beta Waitlist Form Overlay
          return (
            <div
              key={slide.id}
              id={`img-slide-${idx}`}
              className="relative w-full block m-0 p-0 leading-none select-text"
            >
              {/* Artwork Background Base */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-auto block m-0 p-0 border-none rounded-none shadow-none align-top select-none pointer-events-none"
                loading="lazy"
                draggable={false}
              />

              {/* Interactive Form Layer */}
              {status === 'success' ? (
                /* Success Confirmation Card Overlay (Left-aligned, full English, BDO Grotesk, NO checkmark badge) */
                <div
                  className="absolute inset-x-[6%] rounded-3xl p-6 text-left flex flex-col items-start justify-center gap-2.5 shadow-2xl backdrop-blur-md bg-[#250E23]/98 border border-[#F90657]/45 animate-fade-in z-20 font-['BDO_Grotesk','BDOGrotesk','Space_Grotesk',sans-serif]"
                  style={{ top: '70%', bottom: '3.5%' }}
                >
                  <h4 className="font-bold text-base sm:text-lg text-white tracking-tight">
                    You&apos;re on the list!
                  </h4>
                  <p className="text-xs sm:text-[13px] text-white/90 leading-relaxed">
                    Thank you, <span className="font-bold text-[#F90657]">{submittedName}</span>! Your email (<span className="text-[#C4B59D] font-mono">{submittedEmail}</span>) has been recorded in our beta testing waitlist.
                  </p>
                  <p className="text-[11px] text-white/60">
                    We will notify you as soon as Jalur is ready for testing.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-1 px-5 py-2 rounded-full text-xs font-bold bg-[#C4B59D] hover:bg-[#D4C6AF] text-[#1E1119] transition-all shadow-md active:scale-95"
                  >
                    Register Another Email
                  </button>
                </div>
              ) : (
                /* Interactive Form Fields Overlay */
                <form onSubmit={handleSubmit} noValidate>
                  {/* Name Input Field */}
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    placeholder="Your name"
                    disabled={isLoading}
                    autoComplete="name"
                    spellCheck={false}
                    className="absolute text-base font-normal text-[#FAF5EE] px-5 sm:px-6 outline-none rounded-full bg-[#461C2A] border border-[rgba(220,205,195,0.45)] focus:border-[#F90657] focus:bg-[#3B1623] focus:shadow-[0_0_10px_rgba(249,6,87,0.35)] caret-[#F90657] transition-all placeholder:text-[#FAF5EE]/40 font-['BDO_Grotesk','BDOGrotesk','Space_Grotesk',sans-serif]"
                    style={{
                      left: '25.22%',
                      top: '73.05%',
                      width: '63.65%',
                      height: '4.785%',
                      fontSize: '16px', // Prevents iOS Safari auto-zoom
                    }}
                  />

                  {/* Email Input Field */}
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    placeholder="Your email"
                    disabled={isLoading}
                    autoComplete="email"
                    spellCheck={false}
                    className="absolute text-base font-normal text-[#FAF5EE] px-5 sm:px-6 outline-none rounded-full bg-[#461C2A] border border-[rgba(220,205,195,0.45)] focus:border-[#F90657] focus:bg-[#3B1623] focus:shadow-[0_0_10px_rgba(249,6,87,0.35)] caret-[#F90657] transition-all placeholder:text-[#FAF5EE]/40 font-['BDO_Grotesk','BDOGrotesk','Space_Grotesk',sans-serif]"
                    style={{
                      left: '25.22%',
                      top: '79.69%',
                      width: '63.65%',
                      height: '4.785%',
                      fontSize: '16px', // Prevents iOS Safari auto-zoom
                    }}
                  />

                  {/* Error Notification Bubble */}
                  {status === 'error' && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-medium shadow-xl z-20 flex items-center gap-1.5 max-w-[85%] text-center backdrop-blur-sm pointer-events-none font-['BDO_Grotesk','BDOGrotesk','Space_Grotesk',sans-serif]"
                      style={{ top: '85.4%' }}
                    >
                      <span>⚠️ {message}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute rounded-full text-xs sm:text-sm font-bold tracking-wider text-[#1E1119] bg-[#C4B59D] hover:bg-[#D4C6AF] active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer disabled:opacity-75 disabled:cursor-wait font-['BDO_Grotesk','BDOGrotesk','Space_Grotesk',sans-serif]"
                    style={{
                      left: '32.35%',
                      top: '89.16%',
                      width: '38.78%',
                      height: '4.49%',
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                        <span className="w-3.5 h-3.5 border-2 border-[#1E1119] border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </span>
                    ) : (
                      <span>Submit</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )
        })}
      </main>
    </div>
  )
}
