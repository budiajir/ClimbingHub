'use client'

export default function HeroBanner() {
  return (
    <div className="relative w-full overflow-hidden h-[65vh] md:h-[80vh] lg:h-[86vh] flex items-center justify-center">
      {/* Background Photo — 100% Full Frame polos tanpa gradasi & tanpa cards */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/home-hero-bg.jpg')`,
          backgroundPosition: 'center 45%',
        }}
      />

      {/* Judul Polos: ClimbingHub Indonesia */}
      <div className="relative z-10 text-center px-4 select-none">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-chalk tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          ClimbingHub Indonesia
        </h1>
      </div>
    </div>
  )
}
