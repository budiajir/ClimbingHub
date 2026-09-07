'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Mountain, BookOpen, Building2, Users, Plus, LogIn, LogOut, Store, Crown, User, Compass, Moon, Sun } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/lib/auth-context'
import { canLogAscent, canCreateCragRoute } from '@/lib/permissions'
import { useTheme } from '@/lib/theme-context'

interface TopBarProps {
  title?: string
  subtitle?: string
  showSearch?: boolean
  showBack?: boolean
  transparent?: boolean
  onLogAscent?: () => void
}

export default function TopBar({
  transparent = false,
  onLogAscent,
}: TopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { role, user, gymTenant, openAuthModal, logout } = useAuth()
  const { isSandstone, toggleTheme } = useTheme()
  const [showDrawer, setShowDrawer] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleNavClick = (href: string) => {
    setShowDrawer(false)
    router.push(href)
  }

  const handleLogAscentClick = () => {
    setShowDrawer(false)
    if (!canLogAscent(role)) {
      openAuthModal('Silakan masuk atau daftar akun untuk mencatat Log Ascent pemanjatan.')
    } else if (onLogAscent) {
      onLogAscent()
    } else {
      router.push('/beta')
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowDrawer(false)
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <>
      {/* MINIMALIST TOP BAR (Matching Illustrator Mockup) */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          transparent
            ? 'bg-transparent'
            : isSandstone
              ? 'bg-[#cfc2ab] text-[#1a1815]'
              : 'bg-[#12161A] text-chalk border-b border-white/5'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
          {/* Left: Solid Circle Logo Emblem */}
          <Link href="/" className="flex items-center gap-2 group" title="ClimbHub Indonesia">
            <div
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
                isSandstone
                  ? 'bg-[#1a1815] text-[#cfc2ab] shadow-sm group-hover:scale-105'
                  : 'bg-chalk text-granite shadow-lime-glow-sm group-hover:scale-105'
              }`}
            >
              <Mountain size={18} strokeWidth={2.4} />
            </div>
          </Link>

          {/* Right: Minimalist 2-Line Menu Icon (=) */}
          <button
            onClick={() => setShowDrawer(true)}
            className={`w-10 h-10 flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all touch-ripple ${
              isSandstone
                ? 'hover:bg-[#1a1815]/10 text-[#1a1815]'
                : 'hover:bg-white/10 text-chalk'
            }`}
            title="Buka Menu"
            aria-label="Buka Menu Navigasi"
          >
            <span
              className={`w-6 h-[2.5px] rounded-full transition-all ${
                isSandstone ? 'bg-[#1a1815]' : 'bg-chalk'
              }`}
            />
            <span
              className={`w-6 h-[2.5px] rounded-full transition-all ${
                isSandstone ? 'bg-[#1a1815]' : 'bg-chalk'
              }`}
            />
          </button>
        </div>
      </header>

      {/* ALL-IN-ONE 2-LINE SLIDE-OVER DRAWER MENU */}
      <AnimatePresence>
        {showDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`relative z-10 w-full max-w-sm h-full flex flex-col justify-between p-6 shadow-2xl border-l overflow-y-auto ${
                isSandstone
                  ? 'bg-[#ded3be] border-[#1a1815]/20 text-[#1a1815]'
                  : 'bg-[#181d22] border-white/10 text-chalk'
              }`}
              style={{
                paddingTop: 'max(env(safe-area-inset-top), 24px)',
                paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
              }}
            >
              {/* Drawer Top Header: Logo, Theme Switcher, Close X */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isSandstone ? 'bg-[#1a1815] text-[#ded3be]' : 'bg-lime text-granite'
                      }`}
                    >
                      <Mountain size={16} strokeWidth={2.4} />
                    </div>
                    <div>
                      <span className="font-bold text-sm block leading-none">ClimbHub</span>
                      <span className="text-[9px] font-bold tracking-widest opacity-60">INDONESIA</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Theme Switcher */}
                    <button
                      onClick={toggleTheme}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSandstone
                          ? 'bg-[#1a1815]/10 hover:bg-[#1a1815]/20 text-[#1a1815]'
                          : 'bg-crag hover:bg-crag-light text-chalk border border-white/10'
                      }`}
                      title="Ganti Tema (Sandstone / Dark)"
                    >
                      {isSandstone ? (
                        <>
                          <Moon size={13} />
                          <span>Dark</span>
                        </>
                      ) : (
                        <>
                          <Sun size={13} className="text-lime" />
                          <span>Sandstone</span>
                        </>
                      )}
                    </button>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowDrawer(false)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isSandstone
                          ? 'hover:bg-[#1a1815]/10 text-[#1a1815]'
                          : 'hover:bg-white/10 text-chalk'
                      }`}
                    >
                      <X size={20} strokeWidth={2.2} />
                    </button>
                  </div>
                </div>

                {/* Quick Search */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search
                    size={16}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isSandstone ? 'text-[#1a1815]/60' : 'text-slate-ash'
                    }`}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari spot boulder, tebing, gym..."
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none transition-all ${
                      isSandstone
                        ? 'bg-white/60 border-[#1a1815]/20 text-[#1a1815] placeholder:text-[#1a1815]/50 focus:border-[#1a1815]'
                        : 'bg-granite border-white/10 text-chalk placeholder:text-slate-ash focus:border-lime/40'
                    }`}
                  />
                </form>

                {/* Main Navigation Links */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 px-2 block">
                    Menu Utama
                  </span>

                  {[
                    { href: '/', label: 'Explore Tebing', sub: 'Eksplorasi destinasi panjat', icon: Compass },
                    { href: '/beta', label: 'Boulder & Topo', sub: 'Beta Book & database jalur', icon: BookOpen },
                    { href: '/gyms', label: 'Gym Directory', sub: 'Boulder & Climbing Gym', icon: Building2 },
                    { href: '/community', label: 'Community', sub: 'Forum & partner pemanjat', icon: Users },
                  ].map(item => {
                    const Icon = item.icon
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                          isActive
                            ? isSandstone
                              ? 'bg-[#1a1815] text-[#ded3be] font-bold shadow-sm'
                              : 'bg-lime text-granite font-bold shadow-lime-glow-sm'
                            : isSandstone
                              ? 'hover:bg-[#1a1815]/10 text-[#1a1815]'
                              : 'hover:bg-white/5 text-chalk'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isActive
                              ? isSandstone
                                ? 'bg-[#ded3be] text-[#1a1815]'
                                : 'bg-granite text-lime'
                              : isSandstone
                                ? 'bg-[#1a1815]/10 text-[#1a1815]'
                                : 'bg-crag text-chalk'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold leading-tight">{item.label}</div>
                          <div className={`text-[11px] ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                            {item.sub}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Action Links */}
                <div className="pt-2 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 px-2 block">
                    Aksi Cepat
                  </span>

                  <button
                    onClick={() => handleNavClick('/beta')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isSandstone
                        ? 'border border-[#1a1815]/20 hover:bg-[#1a1815]/10 text-[#1a1815]'
                        : 'bg-crag hover:bg-crag-light text-chalk border border-white/5'
                    }`}
                  >
                    <Plus size={15} />
                    <span>+ Tambah Jalur Boulder</span>
                  </button>

                  <button
                    onClick={handleLogAscentClick}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isSandstone
                        ? 'bg-[#d95338] text-white hover:bg-[#c2452c]'
                        : 'bg-lime text-granite shadow-lime-glow-sm hover:bg-lime-dim'
                    }`}
                  >
                    <BookOpen size={15} />
                    <span>Catat Log Ascent</span>
                  </button>
                </div>
              </div>

              {/* Drawer Bottom: User Profile / Auth Area */}
              <div className="pt-4 border-t border-black/10 dark:border-white/10">
                {role === 'guest' ? (
                  <button
                    onClick={() => {
                      setShowDrawer(false)
                      openAuthModal('Silakan masuk untuk mengakses profil dan logbook Anda.')
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${
                      isSandstone
                        ? 'bg-[#1a1815] text-[#ded3be] hover:bg-black'
                        : 'bg-lime text-granite shadow-lime-glow-sm hover:bg-lime-dim'
                    }`}
                  >
                    <LogIn size={16} />
                    <span>Masuk / Daftar Akun</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-crag flex items-center justify-center text-chalk overflow-hidden">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                        ) : role === 'super_admin' ? (
                          <Crown size={20} className="text-lime" />
                        ) : role === 'gym_admin' ? (
                          <Store size={20} className="text-project" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm truncate">{user?.name || 'Climber'}</div>
                        <div className="text-[11px] opacity-70 truncate">
                          {role === 'super_admin'
                            ? '👑 Pemilik Web / Kurator'
                            : role === 'gym_admin'
                              ? `🏢 ${gymTenant?.name || 'Admin POS'}`
                              : user?.handle || 'Climber'}
                        </div>
                      </div>
                    </div>

                    {role === 'gym_admin' && (
                      <button
                        onClick={() => handleNavClick('/admin')}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-project/20 text-project border border-project/30 hover:bg-project/30"
                      >
                        <Store size={14} /> Buka Dashboard POS
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout()
                        setShowDrawer(false)
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-redpoint hover:bg-redpoint/10 transition-colors"
                    >
                      <LogOut size={14} /> Keluar Akun
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
