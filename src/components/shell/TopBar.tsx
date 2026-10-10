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
import Pictogram from '@/components/common/Pictogram'

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
  const [activeDropdownKey, setActiveDropdownKey] = useState<string | null>(null)
  const [showRoleSelector, setShowRoleSelector] = useState(false)

  const handleNavClick = (href: string) => {
    setShowDrawer(false)
    if (href.includes('view=my-ascents')) {
      if (role === 'guest') {
        openAuthModal('Please sign in or register to view your Sent Cards.')
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
              ? 'glass-header-sandstone text-[#1a1815]'
              : 'glass-header-dark text-chalk'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-14 md:h-16 grid grid-cols-3 items-center">
          {/* Left: User Account Button (Personal Account) */}
          <div className="flex items-center justify-start">
            <button
              onClick={() => {
                if (role === 'guest') {
                  openAuthModal('Please sign in or register to access your Personal Account.')
                } else {
                  router.push('/account')
                }
              }}
              className={`relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all border ${
                isSandstone
                  ? 'border-[#1a1815]/30 hover:border-[#1a1815] text-[#1a1815] hover:bg-[#1a1815]/10'
                  : 'border-white/20 hover:border-[#FF6B00] text-chalk hover:text-[#FF6B00] hover:bg-white/5'
              }`}
              title={role === 'guest' ? 'Sign In / Account' : `${user?.name || 'Climber'} · Personal Account`}
              aria-label="Personal Account"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : role === 'super_admin' ? (
                <Crown size={18} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
              ) : role === 'gym_admin' ? (
                <Store size={18} className={isSandstone ? 'text-[#1a1815]' : 'text-project'} />
              ) : (
                <Pictogram name="profile-picture" size={20} />
              )}
              {/* Notification dot on top-right of profile avatar */}
              {role !== 'guest' && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
              )}
            </button>
          </div>

          {/* Center: Typography Logo (Halaman Utama) */}
          <div className="flex items-center justify-center">
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              className="relative flex items-center justify-center group py-1 px-3 rounded-xl transition-all"
              title="Home · Jalur"
              aria-label="Home"
            >
              <img
                src={isSandstone ? '/jalur-logo-dark.png' : '/jalur-logo-white.png'}
                alt="Jalur - Home"
                className="h-8 md:h-10 max-h-11 w-auto object-contain transition-all duration-200 group-hover:scale-105 active:scale-95"
              />
            </Link>
          </div>

          {/* Right: Jalur Pictogram Menu Icon */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowDrawer(true)}
              className={`w-10 h-10 flex items-center justify-center p-2 rounded-xl transition-all ${
                isSandstone
                  ? 'hover:bg-[#1a1815]/10 text-[#1a1815]'
                  : 'hover:bg-white/10 text-chalk'
              }`}
              title="Open Menu"
              aria-label="Open Navigation Menu"
            >
              <Pictogram name="menu" size={24} />
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
                    <Pictogram name="x" size={22} />
                  </button>
                </div>

                {/* 2. SEARCH INPUT: Rounded Pill with 'DISCOVER' Placeholder */}
                <form onSubmit={handleSearchSubmit} className="pt-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="DISCOVER"
                      className={`w-full py-2.5 px-5 text-xs font-normal tracking-widest uppercase rounded-full border outline-none transition-all ${
                        isSandstone
                          ? 'bg-transparent border-[#1a1815]/25 text-[#1a1815] placeholder:text-[#1a1815]/40 focus:border-[#1a1815]'
                          : 'bg-transparent border-white/20 text-chalk placeholder:text-white/40 focus:border-[#FF6B00]'
                      }`}
                    />
                  </div>
                </form>

                {/* 3. EDITORIAL ACCORDION DROPDOWN NAVIGATION LINKS */}
                <nav className="pt-2 sm:pt-4 space-y-3 sm:space-y-4 max-h-[58vh] overflow-y-auto no-scrollbar pr-1">
                  {[
                    {
                      key: 'faq',
                      label: 'F.A.Q',
                      content: (
                        <div className="space-y-3 pt-2 text-xs opacity-85 leading-relaxed">
                          <div>
                            <p className="font-bold">How do I log a verified ascent?</p>
                            <p className="font-light mt-0.5">Open Problems, select your completed route, and click Log Ascent. Upload your action photo or video clip to generate your official Send Card.</p>
                          </div>
                          <div>
                            <p className="font-bold">Can I add an outdoor crag route?</p>
                            <p className="font-light mt-0.5">Outdoor crags are curated to maintain topography accuracy and community safety. Submit route additions via + Set New Route.</p>
                          </div>
                          <div>
                            <p className="font-bold">How do I book a session pass at a Bouldering Gym?</p>
                            <p className="font-light mt-0.5">Visit Gyms directory, select preferred date and session slot, and checkout. Your E-Ticket QR is stored directly in your Order Wallet.</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'privacy',
                      label: 'Privacy',
                      content: (
                        <div className="space-y-3 pt-2 text-xs opacity-85 leading-relaxed">
                          <div>
                            <p className="font-bold">Information We Collect</p>
                            <p className="font-light mt-0.5">Climber profile details, ascent logs, and gym booking records.</p>
                          </div>
                          <div>
                            <p className="font-bold">Media & Video Usage</p>
                            <p className="font-light mt-0.5">Uploaded photos and videos are strictly used for ascent verification and personal Send Card generation. All copyrights remain 100% with the climber.</p>
                          </div>
                          <div>
                            <p className="font-bold">Data Security</p>
                            <p className="font-light mt-0.5">We never sell personal information to third parties. All transaction records adhere to end-to-end encrypted standards.</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'guideline',
                      label: 'Community Guideline',
                      content: (
                        <div className="space-y-3 pt-2 text-xs opacity-85 leading-relaxed">
                          <div>
                            <p className="font-bold">Leave No Trace (LNT)</p>
                            <p className="font-light mt-0.5">Pack out all trash without exception. Never alter natural rock formations or disturb flora surrounding the boulder zones.</p>
                          </div>
                          <div>
                            <p className="font-bold">Clean Chalk & Tick Marks</p>
                            <p className="font-light mt-0.5">Always brush off heavy chalk buildup and tick marks after your session using a soft brush.</p>
                          </div>
                          <div>
                            <p className="font-bold">Gym & Crag Etiquette</p>
                            <p className="font-light mt-0.5">Give space to active climbers, never stand underneath a fall zone, and maintain positive psyche.</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'cancellation',
                      label: 'Cancellation Policy',
                      content: (
                        <div className="space-y-3 pt-2 text-xs opacity-85 leading-relaxed">
                          <div>
                            <p className="font-bold">Cancellation Deadline</p>
                            <p className="font-light mt-0.5">Cancellations or reschedule requests can be made up to 24 hours prior to reserved session start time.</p>
                          </div>
                          <div>
                            <p className="font-bold">Free Reschedule</p>
                            <p className="font-light mt-0.5">Every gym pass includes 1 free schedule change to another available slot within 30 days of purchase.</p>
                          </div>
                          <div>
                            <p className="font-bold">No-Show Policy</p>
                            <p className="font-light mt-0.5">Failure to attend without prior notice forfeits the ticket.</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'refund',
                      label: 'Refund Policy',
                      content: (
                        <div className="space-y-3 pt-2 text-xs opacity-85 leading-relaxed">
                          <div>
                            <p className="font-bold">Full Refund (100%)</p>
                            <p className="font-light mt-0.5">Provided if facility closure occurs due to gym management decisions or emergency maintenance.</p>
                          </div>
                          <div>
                            <p className="font-bold">Processing Timelines</p>
                            <p className="font-light mt-0.5">Approved refunds are credited back to the original payment method within 3 to 5 business days.</p>
                          </div>
                          <div>
                            <p className="font-bold">Credit Voucher</p>
                            <p className="font-light mt-0.5">Option for balance credit voucher for future sessions with no expiration date.</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'contact',
                      label: 'Contact',
                      content: (
                        <div className="space-y-2 pt-2 text-xs opacity-85 leading-relaxed">
                          <p className="font-light">Official Support Channels:</p>
                          <p>
                            <span className="font-bold">Email: </span>
                            <a href="mailto:support@jalur.world" className="text-[#FF6B00] underline">
                              support@jalur.world
                            </a>
                          </p>
                          <p>
                            <span className="font-bold">Instagram: </span>
                            <a
                              href="https://instagram.com/jalur.world"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#FF6B00] underline"
                            >
                              @jalur.world
                            </a>
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: 'about',
                      label: 'About',
                      content: (
                        <div className="pt-2 text-xs opacity-85 leading-relaxed font-light">
                          Jalur is a modern bouldering and rock climbing platform uniting outdoor crag guides, technical route betas, verified send logs, gym bookings, and community networking across Indonesia.
                        </div>
                      ),
                    },
                  ].map(item => {
                    const isOpen = activeDropdownKey === item.key
                    return (
                      <div key={item.key} className="border-b border-white/5 pb-2">
                        <button
                          type="button"
                          onClick={() => setActiveDropdownKey(isOpen ? null : item.key)}
                          className={`w-full flex items-center justify-between text-left text-[22px] sm:text-[26px] font-normal leading-tight tracking-tight transition-all ${
                            isSandstone
                              ? 'text-[#1a1815] hover:opacity-60'
                              : isOpen
                              ? 'text-[#FF6B00]'
                              : 'text-chalk hover:text-[#FF6B00]'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="text-sm opacity-60 font-mono">{isOpen ? '—' : '+'}</span>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              {item.content}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
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
                    {showRoleSelector ? 'Close' : 'Switch Role'}
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
