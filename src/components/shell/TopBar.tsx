'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Search,
  Mountain,
  BookOpen,
  Building2,
  Users,
  Plus,
  LogIn,
  LogOut,
  Store,
  Crown,
  User,
  Compass,
  Moon,
  Sun,
  Eye,
  UserCheck,
  Check,
  Award,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/lib/auth-context'
import { canLogAscent, canCreateCragRoute, UserRole } from '@/lib/permissions'
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
  const { role, setRole, user, gymTenant, openAuthModal, logout } = useAuth()
  const { isSandstone, toggleTheme } = useTheme()
  const [showDrawer, setShowDrawer] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleNavClick = (href: string) => {
    setShowDrawer(false)
    if (href.includes('view=my-ascents')) {
      if (role === 'guest') {
        openAuthModal('Please sign in or register to view your Personal Beta Book.')
        return
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-personal-beta-book'))
      }
    }
    router.push(href)
  }

  const handleLogAscentClick = () => {
    setShowDrawer(false)
    if (!canLogAscent(role)) {
      openAuthModal('Please sign in or create an account to log your ascents.')
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

  const rolesConfig: { key: UserRole; label: string; sub: string; icon: React.ElementType }[] = [
    { key: 'guest', label: 'Public (Guest)', sub: 'Read-only access', icon: Eye },
    { key: 'registered', label: 'Climber', sub: 'Active ascent logger', icon: UserCheck },
    { key: 'super_admin', label: 'Super Admin', sub: 'Owner & curator', icon: Crown },
    { key: 'gym_admin', label: 'Gym Admin', sub: 'POS & slot dashboard', icon: Store },
  ]

  return (
    <>
      {/* MINIMALIST TOP BAR (Left: Account, Center: Jalur Logo, Right: Menu =) */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          transparent
            ? 'bg-transparent'
            : isSandstone
              ? 'bg-[#cfc2ab] text-[#1a1815]'
              : 'bg-[#23262C] text-chalk border-b border-white/5'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-14 md:h-16 grid grid-cols-3 items-center">
          {/* Left: User Account Button (Personal Beta Book) */}
          <div className="flex items-center justify-start">
            <button
              onClick={() => {
                if (role === 'guest') {
                  openAuthModal('Please sign in or register to view your Personal Beta Book and logged ascents.')
                } else {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-personal-beta-book'))
                  }
                  router.push('/beta?view=my-ascents')
                }
              }}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all border ${
                isSandstone
                  ? 'border-[#1a1815]/30 hover:border-[#1a1815] text-[#1a1815] hover:bg-[#1a1815]/10'
                  : 'border-white/20 hover:border-lime text-chalk hover:text-lime hover:bg-white/5'
              }`}
              title={role === 'guest' ? 'Sign In / Personal Beta Book' : `${user?.name || 'Climber'} · Personal Beta Book`}
              aria-label="Personal Beta Book"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
              ) : role === 'super_admin' ? (
                <Crown size={18} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
              ) : role === 'gym_admin' ? (
                <Store size={18} className={isSandstone ? 'text-[#1a1815]' : 'text-project'} />
              ) : (
                <User size={18} />
              )}
            </button>
          </div>

          {/* Center: Typography Logo */}
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center justify-center group" title="Jalur">
              <img
                src="/jalur-logo.png"
                alt="Jalur"
                className={`h-9 md:h-11 max-h-12 w-auto object-contain transition-transform group-hover:scale-105 ${
                  isSandstone ? 'mix-blend-multiply' : 'invert mix-blend-screen'
                }`}
              />
            </Link>
          </div>

          {/* Right: Minimalist 2-Line Menu Icon (=) */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowDrawer(true)}
              className={`w-10 h-10 flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all ${
                isSandstone
                  ? 'hover:bg-[#1a1815]/10 text-[#1a1815]'
                  : 'hover:bg-white/10 text-chalk'
              }`}
              title="Open Menu"
              aria-label="Open Navigation Menu"
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
              className={`relative z-10 w-full max-w-sm h-full flex flex-col justify-between p-5 md:p-6 shadow-2xl border-l overflow-y-auto ${
                isSandstone
                  ? 'bg-[#ded3be] border-[#1a1815]/20 text-[#1a1815]'
                  : 'bg-[#181d22] border-white/10 text-chalk'
              }`}
              style={{
                paddingTop: 'max(env(safe-area-inset-top), 20px)',
                paddingBottom: 'max(env(safe-area-inset-bottom), 120px)',
              }}
            >
              {/* Drawer Top Header: Logo, Theme Switcher, Close X */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                  {/* Left: User Account Info */}
                  <button
                    onClick={() => {
                      setShowDrawer(false)
                      if (role === 'guest') {
                        openAuthModal('Please sign in or register to view your Personal Beta Book and logged ascents.')
                      } else {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-personal-beta-book'))
                        }
                        router.push('/beta?view=my-ascents')
                      }
                    }}
                    className="flex items-center gap-2.5 text-left group min-w-0 mr-2"
                    title={role === 'guest' ? 'Click to Sign In / Sign Up' : 'Personal Beta Book'}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105 ${
                        isSandstone ? 'border-[#1a1815]/30 text-[#1a1815] bg-black/5' : 'border-white/20 text-chalk bg-white/5'
                      }`}
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                      ) : role === 'super_admin' ? (
                        <Crown size={15} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
                      ) : role === 'gym_admin' ? (
                        <Store size={15} className={isSandstone ? 'text-[#1a1815]' : 'text-project'} />
                      ) : (
                        <User size={15} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs block leading-tight truncate group-hover:underline">
                        {role === 'guest' ? 'Guest Account' : user?.name || 'Climber'}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-wider opacity-60 block truncate">
                        {role === 'guest' ? 'Click to Sign In' : role === 'super_admin' ? '👑 Super Admin' : role === 'gym_admin' ? '🏢 Gym Admin' : '🧗 Climber · Beta Book'}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Theme Switcher: Granite / Sandstone */}
                    <button
                      onClick={toggleTheme}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        isSandstone
                          ? 'border-[#1a1815]/30 bg-transparent text-[#1a1815] hover:bg-[#1a1815]/10'
                          : 'border-white/15 bg-transparent text-chalk hover:bg-white/10'
                      }`}
                      title="Toggle Theme (Sandstone / Graphite)"
                    >
                      {isSandstone ? (
                        <>
                          <Moon size={13} />
                          <span>Graphite</span>
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
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isSandstone
                          ? 'hover:bg-[#1a1815]/10 text-[#1a1815]'
                          : 'hover:bg-white/10 text-chalk'
                      }`}
                      aria-label="Close Menu"
                    >
                      <X size={18} strokeWidth={2.2} />
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
                    placeholder="Search boulder spots, crags, gyms..."
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border outline-none transition-all ${
                      isSandstone
                        ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815] placeholder:text-[#1a1815]/50 focus:border-[#1a1815]'
                        : 'bg-transparent border-white/10 text-chalk placeholder:text-slate-ash focus:border-lime/40'
                    }`}
                  />
                </form>

                {/* Main Navigation Links */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 px-2 block">
                    Main Menu
                  </span>

                  {[
                    { href: '/', label: 'Explore Crags', sub: 'Discover climbing destinations', icon: Compass },
                    { href: '/beta', label: 'Boulders & Topo', sub: 'Beta Book & route database', icon: BookOpen },
                    { href: '/beta?view=my-ascents', label: 'Personal Beta Book', sub: 'Your logged sends & ascent cards', icon: Award },
                    { href: '/gyms', label: 'Gym Directory', sub: 'Bouldering & climbing gyms', icon: Building2 },
                    { href: '/community', label: 'Community', sub: 'Climber network & partners', icon: Users },
                  ].map(item => {
                    const Icon = item.icon
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all border ${
                          isActive
                            ? isSandstone
                              ? 'bg-transparent border-[#1a1815] text-[#1a1815] font-bold'
                              : 'bg-transparent border-lime text-lime font-bold shadow-lime-glow-sm'
                            : isSandstone
                              ? 'bg-transparent border-transparent hover:border-[#1a1815]/20 text-[#1a1815]'
                              : 'bg-transparent border-transparent hover:border-white/10 text-chalk'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                            isActive
                              ? isSandstone
                                ? 'border-[#1a1815] text-[#1a1815]'
                                : 'border-lime text-lime'
                              : isSandstone
                                ? 'border-[#1a1815]/20 text-[#1a1815]'
                                : 'border-white/10 text-chalk'
                          }`}
                        >
                          <Icon size={16} />
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

                {/* ROLE SWITCHER / USER MODE */}
                <div className="pt-2 space-y-2 border-t border-black/10 dark:border-white/10">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 block">
                      Switch User Role
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-mono font-bold ${
                      isSandstone ? 'border-[#1a1815]/30 text-[#1a1815]' : 'border-lime/30 text-lime'
                    }`}>
                      Active: {role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {rolesConfig.map(r => {
                      const Icon = r.icon
                      const isSelected = role === r.key
                      return (
                        <button
                          key={r.key}
                          onClick={() => setRole(r.key)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? isSandstone
                                ? 'bg-[#1a1815] text-[#ded3be] border-[#1a1815] shadow-sm font-bold'
                                : 'bg-lime text-granite border-lime font-bold shadow-lime-glow-sm'
                              : isSandstone
                                ? 'bg-transparent border-[#1a1815]/20 text-[#1a1815] hover:border-[#1a1815]/50'
                                : 'bg-transparent border-white/10 text-slate-ash hover:text-chalk hover:border-white/30'
                          }`}
                        >
                          <Icon size={14} className="flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate leading-tight">{r.label}</div>
                            <div className={`text-[9px] truncate ${isSelected ? 'opacity-90' : 'opacity-60'}`}>
                              {r.sub}
                            </div>
                          </div>
                          {isSelected && <Check size={12} className="flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Action Links */}
                <div className="pt-2 space-y-1.5 border-t border-black/10 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 px-2 block">
                    Quick Actions
                  </span>

                  {role === 'gym_admin' && (
                    <button
                      onClick={() => handleNavClick('/admin')}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border border-cyan-500/40 text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                    >
                      <Store size={14} /> Open Gym POS Cashier Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => handleNavClick('/beta')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSandstone
                        ? 'border-[#1a1815]/30 hover:border-[#1a1815] text-[#1a1815] bg-transparent'
                        : 'border-white/15 hover:border-white/30 text-chalk bg-transparent'
                    }`}
                  >
                    <Plus size={15} />
                    <span>+ Submit Boulder Problem</span>
                  </button>

                  <button
                    onClick={handleLogAscentClick}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSandstone
                        ? 'border-[#d95338] text-[#d95338] hover:bg-[#d95338]/10 bg-transparent'
                        : 'border-lime text-lime hover:bg-lime/10 bg-transparent'
                    }`}
                  >
                    <BookOpen size={15} />
                    <span>Log Boulder Ascent</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
