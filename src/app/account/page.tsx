'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  User,
  MapPin,
  Calendar,
  Award,
  Wallet,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Compass,
  Mountain,
  Users,
  Eye,
  Camera,
  QrCode,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  Heart,
  X,
  Share2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { getUserAscents, UserAscent } from '@/lib/user-ascents'
import SendCard from '@/components/beta/SendCard'
import { getWishlist, removeFromWishlist, WishlistItem } from '@/lib/wishlist-store'
import { getWalletOrders, OrderWalletItem } from '@/lib/wallet-store'
import { getUserGears, addUserGear, deleteUserGear, UserGearItem } from '@/lib/user-gear-store'
import { getDraftProblems, DraftProblemItem, deleteDraftProblem } from '@/lib/draft-problems-store'
import { QRCodeSVG } from 'qrcode.react'
import Pictogram from '@/components/common/Pictogram'

function PersonalAccountContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const targetUserId = searchParams.get('user')
  const { user, role, openAuthModal } = useAuth()
  const { isSandstone } = useTheme()

  // Profile data
  const isSelf = !targetUserId || targetUserId === user?.id || targetUserId === 'self'
  const climberName = isSelf ? (user?.name || 'Ahmad Rizki') : 'Nana Herdiana'
  const fullName = isSelf ? 'Ahmad Rizki Nugraha' : 'Nana Herdiana Kusuma'
  const homeCity = isSelf ? 'Bandung, Jawa Barat' : 'Jakarta Selatan, DKI Jakarta'
  const avatarUrl = isSelf
    ? (user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&q=80')
    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&q=80'
  const hasNotifications = isSelf // Notification red dot on profile picture

  // Experience Stats
  const experienceData = {
    problemsSent: 42,
    cragsVisited: 14,
    gymVisited: 8,
    friendsConnected: 68,
  }

  // Monthly stats for experience line chart
  const monthlyChartData = [
    { month: 'Nov', sent: 18, crags: 5, gyms: 3, friends: 22 },
    { month: 'Dec', sent: 24, crags: 7, gyms: 4, friends: 34 },
    { month: 'Jan', sent: 29, crags: 9, gyms: 5, friends: 45 },
    { month: 'Feb', sent: 35, crags: 11, gyms: 6, friends: 55 },
    { month: 'Mar', sent: 39, crags: 13, gyms: 7, friends: 62 },
    { month: 'Apr', sent: 42, crags: 14, gyms: 8, friends: 68 },
  ]

  // Sent Cards view mode: list | thumbnail | full
  const [sentCardViewMode, setSentCardViewMode] = useState<'list' | 'thumbnail' | 'full'>('thumbnail')
  const [activeSendCardModal, setActiveSendCardModal] = useState<UserAscent | null>(null)

  // Wallet state
  const [walletTab, setWalletTab] = useState<'active' | 'history'>('active')
  const [walletOrders, setWalletOrders] = useState<OrderWalletItem[]>([])
  const [selectedQRModal, setSelectedQRModal] = useState<OrderWalletItem | null>(null)

  // Gear state
  const [gears, setGears] = useState<UserGearItem[]>([])
  const [showAddGearModal, setShowAddGearModal] = useState(false)
  const [newGearName, setNewGearName] = useState('')
  const [newGearBrand, setNewGearBrand] = useState('')
  const [newGearCategory, setNewGearCategory] = useState<UserGearItem['category']>('shoes')
  const [newGearImage, setNewGearImage] = useState('')

  // Wishlist state
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [wishlistFilter, setWishlistFilter] = useState<'all' | 'crag' | 'problem' | 'gym'>('all')

  // Drafts state
  const [drafts, setDrafts] = useState<DraftProblemItem[]>([])

  // User ascents
  const [ascents, setAscents] = useState<UserAscent[]>([])

  // Refresh data on mount & listeners
  useEffect(() => {
    setAscents(getUserAscents())
    setWalletOrders(getWalletOrders())
    setGears(getUserGears())
    setWishlist(getWishlist())
    setDrafts(getDraftProblems())

    const handleWallet = () => setWalletOrders(getWalletOrders())
    const handleGear = () => setGears(getUserGears())
    const handleWish = () => setWishlist(getWishlist())
    const handleDraft = () => setDrafts(getDraftProblems())

    window.addEventListener('wallet-updated', handleWallet)
    window.addEventListener('user-gear-updated', handleGear)
    window.addEventListener('wishlist-updated', handleWish)
    window.addEventListener('draft-problems-updated', handleDraft)

    return () => {
      window.removeEventListener('wallet-updated', handleWallet)
      window.removeEventListener('user-gear-updated', handleGear)
      window.removeEventListener('wishlist-updated', handleWish)
      window.removeEventListener('draft-problems-updated', handleDraft)
    }
  }, [])

  const filteredOrders = walletOrders.filter((o) => o.status === walletTab)
  const filteredWishlist = wishlistFilter === 'all' ? wishlist : wishlist.filter((w) => w.type === wishlistFilter)

  const handleCreateGear = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGearName.trim()) return

    const categoryLabels: Record<UserGearItem['category'], string> = {
      shoes: 'Climbing Shoes',
      harness: 'Climbing Harness',
      chalk: 'Chalk Bag',
      crashpad: 'Crash Pad',
      belay: 'Belay Device',
      helmet: 'Helmet',
      carabiner: 'Carabiners & Draws',
      other: 'Climbing Gear',
    }

    const item: UserGearItem = {
      id: `gear-${Date.now()}`,
      name: newGearName,
      brand: newGearBrand || 'Custom Gear',
      category: newGearCategory,
      categoryLabel: categoryLabels[newGearCategory] || 'Climbing Gear',
      imageUrl: newGearImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      purchaseYear: '2026',
      condition: 'Good Condition',
    }

    addUserGear(item)
    setShowAddGearModal(false)
    setNewGearName('')
    setNewGearBrand('')
    setNewGearImage('')
  }

  return (
    <div className={`min-h-screen pb-28 pt-4 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 ${
      isSandstone ? 'text-[#1a1815]' : 'text-chalk'
    }`}>
      {/* ============================================================ */}
      {/* 1. PERSONAL HEADER (Hi, name + Circular Avatar + Red Dot)   */}
      {/* ============================================================ */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-card transition-colors ${
        isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Left Greeting & Identity */}
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#FF6B00]">
              Personal Account
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Hi, {climberName}
            </h1>
            <p className="text-base font-medium opacity-90">{fullName}</p>
            <div className="flex items-center gap-1.5 text-xs opacity-70 pt-0.5">
              <MapPin size={13} className="text-[#FF6B00] flex-shrink-0" />
              <span>{homeCity}</span>
            </div>
          </div>

          {/* Right Circular Avatar with Notification Indicator */}
          <div className="relative self-start sm:self-center">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#FF6B00] shadow-xl p-0.5">
              <img
                src={avatarUrl}
                alt={climberName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {/* Red Notification Dot on top-right */}
            {hasNotifications && (
              <span
                className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-[#181D22] rounded-full shadow-md animate-pulse"
                title="Unread notifications"
              />
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. EXPERIENCE SECTION (Counters + SVG Progression Line Chart) */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <Sparkles size={20} /> Experience
          </h2>
          <p className="text-xs opacity-70">
            Personal achievements and progression milestone record
          </p>
        </div>

        {/* 4 Quantitative Achievement Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[
            { label: 'Problems Sent', value: experienceData.problemsSent, unit: 'routes', color: 'text-[#FF6B00]' },
            { label: 'Crags Visited', value: experienceData.cragsVisited, unit: 'crags', color: 'text-[#06B6D4]' },
            { label: 'Gym Visited', value: experienceData.gymVisited, unit: 'gyms', color: 'text-[#F90657]' },
            { label: 'Friends Connected', value: experienceData.friendsConnected, unit: 'climbers', color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border ${
                isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
              }`}
            >
              <span className="text-[11px] opacity-70 font-light block">{stat.label}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl sm:text-3xl font-extrabold ${stat.color}`}>{stat.value}</span>
                <span className="text-[11px] opacity-60 font-light">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Progression Line Chart Visualization */}
        <div className={`p-5 rounded-3xl border space-y-3 ${
          isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">
              6-Month Send Progression Curve
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-[#FF6B00]">
                <span className="w-2.5 h-0.5 bg-[#FF6B00] rounded-full inline-block" /> Sends
              </span>
              <span className="flex items-center gap-1.5 text-[#06B6D4]">
                <span className="w-2.5 h-0.5 bg-[#06B6D4] rounded-full inline-block" /> Crags
              </span>
            </div>
          </div>

          <div className="h-44 w-full relative pt-2">
            <svg viewBox="0 0 500 140" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradientOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="20" y1="20" x2="480" y2="20" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
              <line x1="20" y1="65" x2="480" y2="65" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
              <line x1="20" y1="110" x2="480" y2="110" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />

              {/* Area fill */}
              <polygon
                points="20,110 30,95 120,80 210,65 300,50 390,38 480,25 480,110"
                fill="url(#chartGradientOrange)"
              />

              {/* Problems Sent Line (Orange) */}
              <polyline
                points="30,95 120,80 210,65 300,50 390,38 480,25"
                fill="none"
                stroke="#FF6B00"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Crags Visited Line (Cyan) */}
              <polyline
                points="30,105 120,100 210,95 300,90 390,85 480,82"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Coordinate Dots */}
              {[
                { x: 30, y: 95, val: 18 },
                { x: 120, y: 80, val: 24 },
                { x: 210, y: 65, val: 29 },
                { x: 300, y: 50, val: 35 },
                { x: 390, y: 38, val: 39 },
                { x: 480, y: 25, val: 42 },
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.x} cy={pt.y} r="4.5" fill="#FF6B00" stroke="#181D22" strokeWidth="2" />
                  <text x={pt.x} y={pt.y - 8} fontSize="9" textAnchor="middle" fill="#FF6B00" fontWeight="bold">
                    {pt.val}
                  </text>
                </g>
              ))}
            </svg>

            {/* X-axis Month labels */}
            <div className="flex justify-between px-2 pt-1 text-[10px] opacity-60">
              {monthlyChartData.map((d) => (
                <span key={d.month}>{d.month}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pink divider */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 3. ORDER WALLET (Trip Plan, Rent Gear, Gym Booking)          */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
              <Wallet size={20} /> Order Wallet
            </h2>
            <p className="text-xs opacity-70">
              Active booking passes and verified transaction receipts
            </p>
          </div>

          {/* Active vs History Switcher */}
          <div className={`p-1 rounded-2xl flex border ${
            isSandstone ? 'bg-[#1a1815]/10 border-[#1a1815]/20' : 'bg-black/40 border-white/10'
          }`}>
            <button
              onClick={() => setWalletTab('active')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                walletTab === 'active'
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Active ({walletOrders.filter((o) => o.status === 'active').length})
            </button>
            <button
              onClick={() => setWalletTab('history')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                walletTab === 'history'
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              History ({walletOrders.filter((o) => o.status === 'history').length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl border opacity-75 ${
            isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
          }`}>
            <p className="text-sm">No {walletTab} orders in your wallet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF6B00]/15 text-[#FF6B00]">
                      {ord.categoryLabel}
                    </span>
                    <span className="font-mono text-xs font-bold opacity-80">
                      {ord.bookingCode}
                    </span>
                  </div>

                  <h3 className="font-bold text-base leading-snug">{ord.title}</h3>

                  <div className="text-xs opacity-75 space-y-1 pt-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#FF6B00]" /> {ord.venueOrLocation}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#06B6D4]" /> {ord.date} {ord.time ? `· ${ord.time}` : ''}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] opacity-60 block">Total Paid</span>
                    <span className="text-sm font-bold text-[#FF6B00]">
                      Rp {ord.totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedQRModal(ord)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <QrCode size={14} /> E-Ticket QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pink divider */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 4. GEAR SECTION (Ditempatkan sebelum Sent Card)              */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
              <Layers size={20} /> My Gear Collection
            </h2>
            <p className="text-xs opacity-70">
              Personal climbing gear & equipment collection
            </p>
          </div>

          <button
            onClick={() => setShowAddGearModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus size={15} /> Add Gear
          </button>
        </div>

        {/* Gear Thumbnails Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {gears.map((g) => (
            <div
              key={g.id}
              className={`rounded-2xl border overflow-hidden flex flex-col group transition-all relative ${
                isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
              }`}
            >
              <div className="h-32 w-full relative overflow-hidden bg-black/20">
                <img
                  src={g.imageUrl}
                  alt={g.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => deleteUserGear(g.id)}
                  title="Remove gear"
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white/70 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-[#FF6B00] font-semibold block">{g.categoryLabel}</span>
                  <h4 className="font-bold text-xs truncate mt-0.5">{g.name}</h4>
                  <p className="text-[10px] opacity-70 truncate">{g.brand}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pink divider */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 5. SENT CARDS SECTION (View Modes: List, Thumbnail, Full)    */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
              <Award size={20} /> Sent Cards
            </h2>
            <p className="text-xs opacity-70">
              Verified rock climbing & bouldering send card certificates
            </p>
          </div>

          {/* View mode switcher: list, thumbnail, full */}
          <div className={`p-1 rounded-2xl flex border ${
            isSandstone ? 'bg-[#1a1815]/10 border-[#1a1815]/20' : 'bg-black/40 border-white/10'
          }`}>
            {(['thumbnail', 'list', 'full'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSentCardViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  sentCardViewMode === mode
                    ? 'bg-[#FF6B00] text-white shadow-md'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {mode === 'thumbnail' ? 'Thumbnails' : mode === 'list' ? 'List' : 'Full View'}
              </button>
            ))}
          </div>
        </div>

        {/* Sent Cards Render */}
        {ascents.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl border opacity-75 ${
            isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
          }`}>
            <p className="text-sm">No Sent Cards recorded yet. Complete a route in Problems to log your send!</p>
          </div>
        ) : sentCardViewMode === 'thumbnail' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ascents.map((asc) => (
              <div
                key={asc.id}
                onClick={() => setActiveSendCardModal(asc)}
                className={`cursor-pointer rounded-2xl border overflow-hidden group transition-all hover:-translate-y-1 ${
                  isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
                }`}
              >
                <div className="h-40 w-full relative overflow-hidden bg-stone-900">
                  <img
                    src={asc.photoUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80'}
                    alt={asc.problemName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/75 text-white font-mono font-bold text-xs">
                    {asc.grade}
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm truncate">{asc.problemName}</h4>
                  <p className="text-[11px] opacity-70 truncate">{asc.location}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] opacity-60">
                    <span className="capitalize">{asc.ascentType}</span>
                    <span>{asc.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sentCardViewMode === 'list' ? (
          <div className="space-y-2">
            {ascents.map((asc) => (
              <div
                key={asc.id}
                onClick={() => setActiveSendCardModal(asc)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:border-[#FF6B00]/40 ${
                  isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={asc.photoUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=200&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{asc.problemName}</h4>
                    <p className="text-xs opacity-70 truncate">{asc.location} · {asc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-mono font-bold text-sm px-2.5 py-1 rounded-lg bg-[#FF6B00]/20 text-[#FF6B00]">
                    {asc.grade}
                  </span>
                  <ChevronRight size={16} className="opacity-40" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {ascents.map((asc) => (
              <div key={asc.id} className="rounded-3xl overflow-hidden shadow-2xl">
                <SendCard
                  data={{
                    problemName: asc.problemName,
                    grade: asc.grade,
                    location: asc.location,
                    provinceCountry: asc.provinceCountry,
                    wallAngle: asc.wallAngle,
                    wallHeight: asc.wallHeight,
                    boltsCount: asc.boltsCount,
                    discipline: asc.discipline,
                    ascentType: asc.ascentType,
                    attempts: asc.attempts,
                    duration: asc.duration,
                    photoUrl: asc.photoUrl,
                    climberName: asc.climberName,
                    time: asc.time,
                    date: asc.date,
                    belayer: asc.belayer,
                    photographer: asc.photographer,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pink divider */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 6. WISHLIST SECTION (Crags, Problems, Gyms)                 */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
              <Pictogram name="wishlisted" size={20} className="text-[#F90657]" /> Wishlist
            </h2>
            <p className="text-xs opacity-70">
              Saved crags, boulder problems, and climbing gyms
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {(['all', 'crag', 'problem', 'gym'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setWishlistFilter(filter)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all border ${
                  wishlistFilter === filter
                    ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                    : isSandstone
                    ? 'border-[#1a1815]/20 text-[#1a1815]/70 hover:border-[#1a1815]/50'
                    : 'border-white/10 text-slate-ash hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'crag' ? 'Crags' : filter === 'problem' ? 'Problems' : 'Gyms'}
              </button>
            ))}
          </div>
        </div>

        {filteredWishlist.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl border opacity-75 ${
            isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
          }`}>
            <p className="text-sm">No items in your wishlist yet. Tap &apos;Save to Wishlist&apos; on any Crag, Problem, or Gym!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWishlist.map((item) => {
              const linkHref =
                item.type === 'crag'
                  ? `/crags/${item.id}`
                  : item.type === 'gym'
                  ? `/gyms/${item.id}`
                  : `/beta?problem=${item.id}`

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between group transition-all ${
                    isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
                  }`}
                >
                  <div className="h-32 relative overflow-hidden bg-black/20">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#FF6B00] flex items-center gap-1 border border-[#FF6B00]/30 shadow-sm">
                      <Pictogram name="wishlisted" size={10} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Mark</span>
                    </div>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      title="Remove from wishlist"
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white/80 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                    {item.grade && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 font-mono text-xs font-bold text-[#FF6B00]">
                        {item.grade}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider">
                        {item.type}
                      </span>
                      <h4 className="font-bold text-sm truncate">{item.title}</h4>
                      <p className="text-xs opacity-70 truncate">{item.subtitle || item.location}</p>
                    </div>

                    <Link
                      href={linkHref}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white flex items-center justify-center gap-1 hover:bg-[#E5601F] transition-all"
                    >
                      <span>Explore</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Pink divider */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 7. SET PROBLEMS DRAFTS SECTION                                */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <FileText size={20} /> Route Drafts (Set Problems)
          </h2>
          <p className="text-xs opacity-70">
            Unfinished problem routes saved as draft. Complete technical specifications before publishing to preserve route accuracy.
          </p>
        </div>

        {drafts.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl border opacity-75 ${
            isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
          }`}>
            <p className="text-sm">No route drafts saved. Routes can be saved as draft from &apos;+ Set New Route&apos;.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {drafts.map((d) => (
              <div
                key={d.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                  isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">
                      Draft ({d.progressPercent}% Complete)
                    </span>
                    <button
                      onClick={() => deleteDraftProblem(d.id)}
                      className="text-xs opacity-50 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h4 className="font-bold text-base mt-1.5">{d.name}</h4>
                  <p className="text-xs opacity-70">{d.cragName} · {d.sectorName}</p>
                  <p className="text-xs opacity-80 italic mt-1">&quot;{d.notes}&quot;</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#FF6B00]">{d.grade}</span>
                  <Link
                    href={`/beta?action=submit&draft=${d.id}`}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all"
                  >
                    Continue Editing &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* MODAL: ADD GEAR                                              */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showAddGearModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddGearModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md popup-form-purple rounded-3xl p-6 border shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-lg text-white">Add Personal Climbing Gear</h3>
                <button onClick={() => setShowAddGearModal(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateGear} className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-white/80 block mb-1">Gear Category</label>
                  <select
                    value={newGearCategory}
                    onChange={(e) => setNewGearCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs outline-none focus:border-[#FF6B00]"
                  >
                    <option value="shoes">Climbing Shoes</option>
                    <option value="harness">Harness</option>
                    <option value="chalk">Chalk Bag</option>
                    <option value="crashpad">Crash Pad</option>
                    <option value="belay">Belay Device</option>
                    <option value="helmet">Helmet</option>
                    <option value="carabiner">Carabiners & Quickdraws</option>
                    <option value="other">Other Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-white/80 block mb-1">Gear Name / Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solution Comp, Hirundos, GriGri"
                    value={newGearName}
                    onChange={(e) => setNewGearName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-white/80 block mb-1">Brand / Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. La Sportiva, Petzl, Black Diamond"
                    value={newGearBrand}
                    onChange={(e) => setNewGearBrand(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-white/80 block mb-1">Gear Photo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newGearImage}
                    onChange={(e) => setNewGearImage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#FF6B00] text-white hover:bg-[#E5601F] shadow-lg transition-all"
                  >
                    Save to My Gear
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL: QR CODE E-TICKET VIEW                                 */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedQRModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQRModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm popup-form-purple rounded-3xl p-6 border shadow-2xl text-center space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs uppercase tracking-wider font-bold text-[#FF6B00]">
                  {selectedQRModal.categoryLabel}
                </span>
                <button onClick={() => setSelectedQRModal(null)} className="text-white/60 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{selectedQRModal.title}</h3>
                <p className="text-xs text-white/70 mt-0.5">{selectedQRModal.venueOrLocation}</p>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-2xl mx-auto inline-block shadow-inner">
                <QRCodeSVG
                  value={JSON.stringify({
                    bookingCode: selectedQRModal.bookingCode,
                    title: selectedQRModal.title,
                    date: selectedQRModal.date,
                  })}
                  size={160}
                />
              </div>

              <div>
                <p className="text-xs text-white/60">Booking Verification Code</p>
                <p className="font-mono font-bold text-lg text-[#FF6B00] tracking-wider">
                  {selectedQRModal.bookingCode}
                </p>
                <p className="text-[11px] text-white/60 mt-1">Show this QR code upon check-in or equipment pickup.</p>
              </div>

              <button
                onClick={() => setSelectedQRModal(null)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all"
              >
                Close Ticket
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL: FULL SEND CARD POPUP                                  */}
      {/* ============================================================ */}
      <AnimatePresence>
        {activeSendCardModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSendCardModal(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm max-h-[92vh] overflow-y-auto no-scrollbar rounded-3xl"
            >
              <div className="relative">
                <button
                  onClick={() => setActiveSendCardModal(null)}
                  className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-black"
                >
                  <X size={18} />
                </button>
                <SendCard
                  data={{
                    problemName: activeSendCardModal.problemName,
                    grade: activeSendCardModal.grade,
                    location: activeSendCardModal.location,
                    provinceCountry: activeSendCardModal.provinceCountry,
                    wallAngle: activeSendCardModal.wallAngle,
                    wallHeight: activeSendCardModal.wallHeight,
                    boltsCount: activeSendCardModal.boltsCount,
                    discipline: activeSendCardModal.discipline,
                    ascentType: activeSendCardModal.ascentType,
                    attempts: activeSendCardModal.attempts,
                    duration: activeSendCardModal.duration,
                    photoUrl: activeSendCardModal.photoUrl,
                    climberName: activeSendCardModal.climberName,
                    time: activeSendCardModal.time,
                    date: activeSendCardModal.date,
                    belayer: activeSendCardModal.belayer,
                    photographer: activeSendCardModal.photographer,
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PersonalAccountPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#111417] flex items-center justify-center text-white text-xs">Loading...</div>}>
      <PersonalAccountContent />
    </React.Suspense>
  )
}
