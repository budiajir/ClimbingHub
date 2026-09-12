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
import PolicyModal, { PolicyKey } from './PolicyModal'

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
  const [policyKey, setPolicyKey] = useState<PolicyKey | null>(null)
  const [showRoleSelector, setShowRoleSelector] = useState(false)

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

      {/* ALL-IN-ONE 2-LINE SLIDE-OVER DRAWER MENU (MOCKUP LAYOUT) */}
      <AnimatePresence>
        {showDrawer && (
          <div className="fixed inset-0 z-40 flex justify-end">
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
              className={`relative z-10 w-full max-w-sm sm:max-w-md h-full flex flex-col justify-between p-6 sm:p-7 shadow-2xl border-l overflow-y-auto ${
                isSandstone
                  ? 'bg-[#ded3be] border-[#1a1815]/20 text-[#1a1815]'
                  : 'bg-[#181d22] border-white/10 text-chalk'
              }`}
              style={{
                paddingTop: 'max(env(safe-area-inset-top), 24px)',
                paddingBottom: 'max(env(safe-area-inset-bottom) + 80px, 96px)',
              }}
            >
              <div className="space-y-6">
                {/* 1. TOP ROW: Segmented Pill Theme Switcher [ Granite | Sandstone ] & Clean Close X */}
                <div className="flex items-center justify-between pt-1">
                  {/* Segmented Pill */}
                  <div
                    className={`inline-flex items-center rounded-full p-1 border transition-colors ${
                      isSandstone
                        ? 'border-[#1a1815]/25 bg-[#cfc2ab]'
                        : 'border-white/20 bg-black/40'
                    }`}
                  >
                    {/* Granite Option */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isSandstone) toggleTheme()
                      }}
                      className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        !isSandstone
                          ? 'bg-black text-white shadow-sm'
                          : 'text-[#1a1815]/70 hover:text-[#1a1815]'
                      }`}
                    >
                      Granite
                    </button>

                    {/* Sandstone Option */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!isSandstone) toggleTheme()
                      }}
                      className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        isSandstone
                          ? 'bg-[#1a1815] text-[#ded3be] shadow-sm'
                          : 'text-slate-ash hover:text-chalk'
                      }`}
                    >
                      Sandstone
                    </button>
                  </div>

                  {/* Clean Close X Button */}
                  <button
                    onClick={() => setShowDrawer(false)}
                    className={`p-1.5 transition-opacity ${
                      isSandstone
                        ? 'text-[#1a1815] hover:opacity-60'
                        : 'text-chalk hover:opacity-60'
                    }`}
                    aria-label="Close Menu"
                  >
                    <X size={26} strokeWidth={1.4} />
                  </button>
                </div>

                {/* 2. SEARCH INPUT: Rounded Pill with 'SEARCH' Placeholder */}
                <form onSubmit={handleSearchSubmit} className="pt-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="SEARCH"
                      className={`w-full py-2.5 px-5 text-xs font-normal tracking-widest uppercase rounded-full border outline-none transition-all ${
                        isSandstone
                          ? 'bg-transparent border-[#1a1815]/25 text-[#1a1815] placeholder:text-[#1a1815]/40 focus:border-[#1a1815]'
                          : 'bg-transparent border-white/20 text-chalk placeholder:text-white/40 focus:border-lime/40'
                      }`}
                    />
                  </div>
                </form>

                {/* 3. EDITORIAL TEXT NAVIGATION LINKS */}
                <nav className="pt-2 sm:pt-4 space-y-3 sm:space-y-4">
                  {[
                    { key: 'faq', label: 'F.A.Q' },
                    { key: 'privacy', label: 'Privacy' },
                    { key: 'guideline', label: 'Community Guideline' },
                    { key: 'cancellation', label: 'Cancellation Policy' },
                    { key: 'refund', label: 'Refund Policy' },
                    { key: 'contact', label: 'Contact' },
                    { key: 'about', label: 'About' },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setPolicyKey(item.key as PolicyKey)
                      }}
                      className={`block w-full text-left text-[24px] sm:text-[28px] md:text-[30px] font-normal leading-tight tracking-tight transition-all hover:translate-x-1.5 ${
                        isSandstone
                          ? 'text-[#1a1815] hover:opacity-60'
                          : 'text-chalk hover:text-lime'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 4. SUBTLE FOOTER: Role Switcher & User Account */}
              <div className="pt-6 border-t border-black/10 dark:border-white/10 space-y-2.5 mt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold ${
                        isSandstone
                          ? 'border-[#1a1815]/20 bg-black/5 text-[#1a1815]'
                          : 'border-white/20 bg-white/5 text-chalk'
                      }`}
                    >
                      {role === 'super_admin' ? '👑' : role === 'gym_admin' ? '🏢' : role === 'registered' ? '🧗' : '👁'}
                    </div>
                    <span className="text-xs font-medium">
                      {role === 'guest' ? 'Guest' : user?.name || 'Climber'}
                      <span className="opacity-50 text-[10px] ml-1.5 font-mono">({role})</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setShowRoleSelector(!showRoleSelector)}
                    className={`text-[11px] font-medium underline transition-opacity ${
                      isSandstone ? 'text-[#1a1815] hover:opacity-70' : 'text-lime hover:opacity-70'
                    }`}
                  >
                    {showRoleSelector ? 'Tutup' : 'Switch Role'}
                  </button>
                </div>

                {showRoleSelector && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-1.5 pt-1.5"
                  >
                    {rolesConfig.map(r => {
                      const isSelected = role === r.key
                      return (
                        <button
                          key={r.key}
                          onClick={() => {
                            setRole(r.key)
                            setShowRoleSelector(false)
                          }}
                          className={`px-3 py-2 rounded-xl text-left text-xs border transition-all ${
                            isSelected
                              ? isSandstone
                                ? 'bg-[#1a1815] text-[#ded3be] border-[#1a1815] font-bold'
                                : 'bg-lime text-granite border-lime font-bold'
                              : isSandstone
                                ? 'border-[#1a1815]/15 text-[#1a1815] hover:border-[#1a1815]/30'
                                : 'border-white/10 text-slate-ash hover:text-chalk'
                          }`}
                        >
                          <div className="font-bold truncate">{r.label}</div>
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Policy Modal Dialog */}
      <PolicyModal
        isOpen={policyKey !== null}
        activeKey={policyKey}
        onClose={() => setPolicyKey(null)}
      />
    </>
  )
}
