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
  ChevronLeft,
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
  Lock,
  CreditCard,
  Receipt,
  EyeOff,
  Check,
  ArrowRight,
  Target,
  Scale,
  Download,
  Copy,
  Globe,
  Radio,
  Edit3,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { getUserAscents, saveUserAscent, UserAscent } from '@/lib/user-ascents'
import SendCard from '@/components/beta/SendCard'
import { getWishlist, removeFromWishlist, WishlistItem } from '@/lib/wishlist-store'
import { getWalletOrders, OrderWalletItem, updateOrderStatus } from '@/lib/wallet-store'
import { getUserGears, addUserGear, deleteUserGear, UserGearItem } from '@/lib/user-gear-store'
import { getDraftProblems, DraftProblemItem, deleteDraftProblem } from '@/lib/draft-problems-store'
import {
  getUserProjects,
  addUserProject,
  logProjectAttempt,
  tickProjectAsSent,
  deleteUserProject,
  UserProjectItem,
} from '@/lib/user-projects-store'
import { addCommunityPost } from '@/lib/community-posts-store'
import {
  getPersonalFeedPosts,
  getUserCustomAvatar,
  DEFAULT_USER_AVATAR,
  type PersonalFeedPost,
} from '@/lib/social-store'
import { QRCodeSVG } from 'qrcode.react'
import Pictogram from '@/components/common/Pictogram'

const DEFAULT_SAMPLE_ASCENTS: UserAscent[] = [
  {
    id: 'ascent-1',
    userId: 'user-1',
    problemId: 'p-1',
    problemName: 'Gugusan Bintang',
    grade: '5.12 B',
    fontGrade: '7b',
    setter: 'Ade Ahmad',
    location: 'Citatah 90 (A)',
    provinceCountry: 'Jawa Barat, ID',
    date: '15/04/26',
    time: '16:45',
    createdAt: '2026-04-15T16:45:00Z',
    ascentType: 'redpoint',
    gradeVote: '5.12 B',
    climberName: 'Ahmad Rizki Nugraha',
    attempts: '6 Attempts',
    duration: '3 Weeks',
    belayer: 'Nana Herdiana',
    photographer: 'Meizan Nataadiningrat',
    wallAngle: '115° Overhang',
    wallHeight: '18 m',
    boltsCount: '8 Bolts',
    photoUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    markers: [],
    discipline: 'lead',
  },
  {
    id: 'ascent-2',
    userId: 'user-1',
    problemId: 'p-2',
    problemName: 'El Capung Mantle',
    grade: 'V7 (7A+)',
    fontGrade: '7A+',
    setter: 'Curated Setter',
    location: 'Lembah Harau · Sarasah Bonta',
    provinceCountry: 'Sumatera Barat, ID',
    date: '28/03/26',
    time: '15:20',
    createdAt: '2026-03-28T15:20:00Z',
    ascentType: 'flash',
    gradeVote: 'V7',
    climberName: 'Ahmad Rizki Nugraha',
    attempts: '1 Attempt (Flash)',
    duration: '1 Day',
    belayer: 'Dimas Anggara',
    photographer: 'Budi Prasetyo',
    wallAngle: '125° Roof',
    wallHeight: '4.5 m',
    boltsCount: '0 (Boulder)',
    photoUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    markers: [],
    discipline: 'boulder',
  },
  {
    id: 'ascent-3',
    userId: 'user-1',
    problemId: 'p-3',
    problemName: 'Sikatan Dyno',
    grade: 'V6 (7A)',
    fontGrade: '7A',
    setter: 'Rizki & Local Crew',
    location: 'Tebing Siung · Pantai Siung',
    provinceCountry: 'DI Yogyakarta, ID',
    date: '10/02/26',
    time: '17:10',
    createdAt: '2026-02-10T17:10:00Z',
    ascentType: 'onsight',
    gradeVote: 'V6',
    climberName: 'Ahmad Rizki Nugraha',
    attempts: '1 Attempt (Onsight)',
    duration: 'Single Session',
    belayer: 'Sarah Amalia',
    photographer: 'Rani Wijaya',
    wallAngle: 'Vertical Wall',
    wallHeight: '5.2 m',
    boltsCount: '0 (Boulder)',
    photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    markers: [],
    discipline: 'boulder',
  },
]

function PersonalAccountContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const targetUserId = searchParams.get('user')
  const { user, role, openAuthModal } = useAuth()
  const { isSandstone } = useTheme()

  // Access Control & Staged View
  const isViewingOther = !!targetUserId && targetUserId !== user?.id && targetUserId !== 'self'
  const [previewPublicMode, setPreviewPublicMode] = useState(false)
  const isPersonalAccess = !isViewingOther && !previewPublicMode

  // Profile data states (Row 1, 2, 3, 4)
  const [firstName, setFirstName] = useState(isViewingOther ? 'Nana' : (user?.name?.split(' ')[0] || 'Ahmad'))
  const [lastName, setLastName] = useState(isViewingOther ? 'Herdiana' : 'Rizki Nugraha')
  const [username, setUsername] = useState(isViewingOther ? '@nana.climbs' : '@ahmad.rizki')
  const [homeBase, setHomeBase] = useState(isViewingOther ? 'Jakarta Selatan, DKI Jakarta' : 'Bandung, Jawa Barat')
  const [countryOfOrigin, setCountryOfOrigin] = useState('Indonesia')
  const [userAccountStatus, setUserAccountStatus] = useState<'Climber' | 'Route Setter' | 'Trip Guide' | 'Gym Manager'>('Route Setter')
  const [bioDescription, setBioDescription] = useState(
    isViewingOther
      ? 'Passionate limestone boulderer and multi-pitch enthusiast exploring Citatah and Harau.'
      : 'Weekend outdoor boulderer exploring Harau & Citatah. Route setting enthusiast dedicated to technical footwork, projecting, and community development.'
  )
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)

  const [customAvatar, setCustomAvatar] = useState<string | null>(null)
  const climberName = isViewingOther ? `${firstName} ${lastName}` : (user?.name || `${firstName} ${lastName}`)
  const avatarUrl = isViewingOther
    ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&q=80'
    : (customAvatar || user?.avatar || DEFAULT_USER_AVATAR)
  const hasNotifications = isPersonalAccess

  // Share Profile Link Modal state (Row 16)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [sharedToast, setSharedToast] = useState<string | null>(null)

  // Experience Stats (Row 8)
  const experienceData = {
    problemsSent: 42,
    cragsVisited: 14,
    gymVisited: 8,
    friendsConnected: 68,
  }

  // Monthly stats for experience chart
  const monthlyChartData = [
    { month: 'Nov', sent: 18, crags: 5, gyms: 3, friends: 22 },
    { month: 'Dec', sent: 24, crags: 7, gyms: 4, friends: 34 },
    { month: 'Jan', sent: 29, crags: 9, gyms: 5, friends: 45 },
    { month: 'Feb', sent: 35, crags: 11, gyms: 6, friends: 55 },
    { month: 'Mar', sent: 39, crags: 13, gyms: 7, friends: 62 },
    { month: 'Apr', sent: 42, crags: 14, gyms: 8, friends: 68 },
  ]

  // Performance Grades (Row 9)
  const performanceData = {
    maxBoulder: 'V8 (7B)',
    maxSport: '5.12c (7b+)',
    flashBoulder: 'V6 (7A)',
    flashSport: '5.11d (7a)',
    discipline: 'Bouldering & Sport Lead',
    pyramid: [
      { grade: 'V7–V8', count: 9, bar: '80%' },
      { grade: 'V5–V6', count: 15, bar: '95%' },
      { grade: 'V3–V4', count: 18, bar: '100%' },
    ],
  }

  // On-going Projects state (Row 10)
  const [projects, setProjects] = useState<UserProjectItem[]>([])
  const [showAddProjectModal, setShowAddProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectLocation, setNewProjectLocation] = useState('')
  const [newProjectGrade, setNewProjectGrade] = useState('V7 (7A+)')
  const [newProjectDiscipline, setNewProjectDiscipline] = useState<'boulder' | 'sport' | 'lead'>('boulder')
  const [newProjectHighpoint, setNewProjectHighpoint] = useState('')
  const [newProjectTargetDate, setNewProjectTargetDate] = useState('')
  const [newProjectImage, setNewProjectImage] = useState('')
  const [newProjectNotes, setNewProjectNotes] = useState('')

  // Sent Cards view mode: Slideshow (default) | Thumbnail | List (Row 12)
  const [sentCardViewMode, setSentCardViewMode] = useState<'slideshow' | 'thumbnail' | 'list'>('slideshow')
  const [slideshowIndex, setSlideshowIndex] = useState(0)
  const [activeSendCardModal, setActiveSendCardModal] = useState<UserAscent | null>(null)
  const [ascents, setAscents] = useState<UserAscent[]>([])

  // Order Wallet state (Row 5 - Personal access only)
  const [walletTab, setWalletTab] = useState<'draft' | 'active' | 'history'>('draft')
  const [walletOrders, setWalletOrders] = useState<OrderWalletItem[]>([])
  const [selectedQRModal, setSelectedQRModal] = useState<OrderWalletItem | null>(null)
  const [selectedReceiptModal, setSelectedReceiptModal] = useState<OrderWalletItem | null>(null)
  const [selectedCheckoutModal, setSelectedCheckoutModal] = useState<OrderWalletItem | null>(null)

  // Gear state (Row 11)
  const [gears, setGears] = useState<UserGearItem[]>([])
  const [showAddGearModal, setShowAddGearModal] = useState(false)
  const [newGearName, setNewGearName] = useState('')
  const [newGearBrand, setNewGearBrand] = useState('')
  const [newGearCategory, setNewGearCategory] = useState<UserGearItem['category']>('shoes')
  const [newGearImage, setNewGearImage] = useState('')

  // Wishlist state (Row 6 - Personal access only)
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [wishlistFilter, setWishlistFilter] = useState<'all' | 'crag' | 'problem' | 'gym' | 'trip' | 'event'>('all')

  // Route Drafts state (Row 7 - Personal access only)
  const [drafts, setDrafts] = useState<DraftProblemItem[]>([])
  const [personalFeedPosts, setPersonalFeedPosts] = useState<PersonalFeedPost[]>([])

  // Refresh data on mount & listeners
  useEffect(() => {
    const loadedAscents = getUserAscents()
    setAscents(loadedAscents.length > 0 ? loadedAscents : DEFAULT_SAMPLE_ASCENTS)

    setProjects(getUserProjects())
    setWalletOrders(getWalletOrders())
    setGears(getUserGears())
    setWishlist(getWishlist())
    setDrafts(getDraftProblems())
    setPersonalFeedPosts(getPersonalFeedPosts())
    setCustomAvatar(getUserCustomAvatar())

    const handleAscents = () => {
      const reloaded = getUserAscents()
      setAscents(reloaded.length > 0 ? reloaded : DEFAULT_SAMPLE_ASCENTS)
    }
    const handleProjects = () => setProjects(getUserProjects())
    const handleWallet = () => setWalletOrders(getWalletOrders())
    const handleGear = () => setGears(getUserGears())
    const handleWish = () => setWishlist(getWishlist())
    const handleDraft = () => setDrafts(getDraftProblems())
    const handlePersonalFeed = () => setPersonalFeedPosts(getPersonalFeedPosts())
    const handleAvatar = () => setCustomAvatar(getUserCustomAvatar())

    window.addEventListener('user-ascents-updated', handleAscents)
    window.addEventListener('user-projects-updated', handleProjects)
    window.addEventListener('wallet-updated', handleWallet)
    window.addEventListener('user-gear-updated', handleGear)
    window.addEventListener('wishlist-updated', handleWish)
    window.addEventListener('draft-problems-updated', handleDraft)
    window.addEventListener('personal-feed-updated', handlePersonalFeed)
    window.addEventListener('user-avatar-updated', handleAvatar)

    return () => {
      window.removeEventListener('user-ascents-updated', handleAscents)
      window.removeEventListener('user-projects-updated', handleProjects)
      window.removeEventListener('wallet-updated', handleWallet)
      window.removeEventListener('user-gear-updated', handleGear)
      window.removeEventListener('wishlist-updated', handleWish)
      window.removeEventListener('draft-problems-updated', handleDraft)
      window.removeEventListener('personal-feed-updated', handlePersonalFeed)
      window.removeEventListener('user-avatar-updated', handleAvatar)
    }
  }, [])

  const filteredOrders = walletOrders.filter((o) => o.status === walletTab)
  const filteredWishlist = wishlistFilter === 'all' ? wishlist : wishlist.filter((w) => w.type === wishlistFilter)

  // Copy Profile URL
  const handleCopyProfileUrl = () => {
    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/account?user=${isViewingOther ? targetUserId : (user?.id || 'climber-1')}` : 'https://jalur.world/account'
    navigator.clipboard.writeText(profileUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Direct Share Sent Card to Community Wall Feed (Row 12)
  const handleShareSentCardToCommunity = (ascent: UserAscent) => {
    addCommunityPost({
      id: `post-ascent-${Date.now()}`,
      userId: user?.id || 'climber-1',
      userName: ascent.climberName || climberName,
      userHandle: username,
      avatar: avatarUrl,
      hometown: homeBase.split(',')[0] || 'Bandung',
      timeAgo: 'Just now',
      activity: `Verified Send · ${ascent.problemName}`,
      location: ascent.location,
      grade: ascent.grade,
      caption: `Sent ${ascent.problemName} (${ascent.grade})! Verified certificate generated on Jalur.`,
      image: ascent.photoUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
      likes: 1,
      hasLiked: true,
      comments: [],
    })

    setSharedToast(`Sent Card "${ascent.problemName}" has been posted to Community Wall feed!`)
    setTimeout(() => setSharedToast(null), 3500)
  }

  // Create ongoing Project (Row 10)
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    addUserProject({
      id: `proj-${Date.now()}`,
      name: newProjectName,
      cragOrGym: newProjectLocation || 'Harau Valley · Granite',
      grade: newProjectGrade,
      discipline: newProjectDiscipline,
      progressPercent: 60,
      highpoint: newProjectHighpoint || 'Crux section reached',
      sessionsCount: 1,
      attemptsCount: 3,
      targetDate: newProjectTargetDate || 'Upcoming Trip',
      imageUrl: newProjectImage || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
      notes: newProjectNotes,
      createdAt: new Date().toISOString(),
      isSent: false,
    })

    setShowAddProjectModal(false)
    setNewProjectName('')
    setNewProjectLocation('')
    setNewProjectHighpoint('')
    setNewProjectTargetDate('')
    setNewProjectImage('')
    setNewProjectNotes('')
  }

  // Tick Project as Sent (converts to Send Card)
  const handleTickProject = (p: UserProjectItem) => {
    tickProjectAsSent(p.id)
    const newAscent = saveUserAscent({
      userId: user?.id || 'user-1',
      problemId: `prob-${p.id}`,
      problemName: p.name,
      grade: p.grade,
      fontGrade: p.grade,
      setter: 'Curated Setter',
      location: p.cragOrGym,
      provinceCountry: 'Indonesia',
      ascentType: 'redpoint',
      gradeVote: p.grade,
      photoUrl: p.imageUrl,
      markers: [],
      discipline: p.discipline,
      climberName: climberName,
      attempts: `${p.attemptsCount} Attempts`,
      duration: `${p.sessionsCount} Sessions`,
      note: p.notes,
    })
    setActiveSendCardModal(newAscent)
    setSharedToast(`Congratulations! "${p.name}" has been logged into your Sent Cards!`)
    setTimeout(() => setSharedToast(null), 3500)
  }

  // Create Gear
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

  // Complete Draft Order
  const handleCompletePayment = (orderId: string) => {
    updateOrderStatus(orderId, 'active')
    setSelectedCheckoutModal(null)
    setWalletTab('active')
  }

  return (
    <div className={`min-h-screen pb-28 pt-4 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 ${
      isSandstone ? 'text-[#1a1815]' : 'text-chalk'
    }`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {sharedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[130] px-4 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400"
          >
            <CheckCircle size={15} />
            <span>{sharedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* PUBLIC PREVIEW ALERT BANNER (If user is testing public view) */}
      {/* ============================================================ */}
      {previewPublicMode && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Eye size={18} className="text-amber-400 shrink-0" />
            <span>
              <strong>Public Profile Preview Active:</strong> Personal access sections (<strong>Order Wallet</strong>, <strong>Wishlist</strong>, and <strong>Route Draft</strong>) are strictly closed to the public and hidden below.
            </span>
          </div>
          <button
            onClick={() => setPreviewPublicMode(false)}
            className="px-3.5 py-1.5 rounded-xl font-bold bg-amber-500 text-black hover:bg-amber-400 self-start sm:self-auto transition-all shrink-0"
          >
            Exit Public Preview
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. HEADER (Page Title, Profile, Status, Description, Share)  */}
      {/* Row 1, 2, 3, 4, 16 in spreadsheet matrix                     */}
      {/* ============================================================ */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-card transition-colors ${
        isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          {/* Left Greeting & Comprehensive Profile Details */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {/* Row 1: Page Title (Hi, Name) */}
              <span className="text-xs uppercase tracking-widest font-semibold text-[#FF6B00]">
                {isPersonalAccess ? 'Personal Account' : 'Climber Profile'}
              </span>

              {/* Row 3: User Account Status (Climber/Route Setter/Trip Guide/Gym Manager) */}
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 flex items-center gap-1 shadow-sm">
                <Compass size={11} /> {userAccountStatus}
              </span>

              {isPersonalAccess ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck size={11} /> Personal Access
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/20 flex items-center gap-1">
                  <Eye size={11} /> Public View
                </span>
              )}
            </div>

            {/* Row 1: Hi, (Name) */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {isPersonalAccess ? `Hi, ${firstName}` : climberName}
            </h1>

            {/* Row 2: Profile (Username, First Name, Last Name, Home-base, Country of Origin) */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-90 pt-0.5">
              <span className="font-mono text-[#FF6B00] font-bold">{username}</span>
              <span>·</span>
              <span className="font-medium">{firstName} {lastName}</span>
              <span>·</span>
              <span className="flex items-center gap-1 opacity-80">
                <MapPin size={12} className="text-[#06B6D4]" />
                {homeBase}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 opacity-80">
                <Globe size={12} className="text-emerald-400" />
                {countryOfOrigin}
              </span>
            </div>

            {/* Row 4: Description (Bio) */}
            <p className="text-xs sm:text-sm opacity-80 font-light leading-relaxed pt-1 max-w-2xl">
              &quot;{bioDescription}&quot;
            </p>

            {/* CTA Buttons: Row 16 Share Link + Edit Profile + Preview Toggle */}
            <div className="pt-3 flex flex-wrap items-center gap-2">
              {/* Row 16: Share Link CTA Button (Yes) */}
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Share2 size={13} />
                <span>Share Profile</span>
              </button>

              {/* Edit Profile CTA */}
              {isPersonalAccess && (
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    isSandstone
                      ? 'border-[#1a1815]/20 hover:border-[#1a1815] text-[#1a1815]'
                      : 'border-white/20 hover:border-white text-white'
                  }`}
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              )}

              {/* Public Preview Toggle */}
              {!isViewingOther && (
                <button
                  onClick={() => setPreviewPublicMode(!previewPublicMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    previewPublicMode
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : isSandstone
                      ? 'border-[#1a1815]/20 hover:border-[#1a1815] text-[#1a1815]'
                      : 'border-white/20 hover:border-white text-white'
                  }`}
                  title="Toggle between personal owner view and public visitor view"
                >
                  {previewPublicMode ? (
                    <>
                      <EyeOff size={13} /> Exit Public Preview
                    </>
                  ) : (
                    <>
                      <Eye size={13} /> Preview as Public
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Circular Avatar with Notification Indicator */}
          <div className="relative self-start sm:self-center shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#FF6B00] shadow-xl p-0.5">
              <img
                src={avatarUrl}
                alt={climberName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
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
      {/* PUBLIC VIEW PRIVACY NOTICE (When not personal access)        */}
      {/* ============================================================ */}
      {!isPersonalAccess && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3.5 text-xs ${
          isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15 text-[#1a1815]' : 'bg-[#181D22] border-white/10 text-white'
        }`}>
          <div className="w-9 h-9 rounded-xl bg-[#F90657]/15 border border-[#F90657]/30 flex items-center justify-center text-[#F90657] shrink-0">
            <Lock size={18} />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">Personal Sections Protected</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
                Closed for public
              </span>
            </div>
            <p className="opacity-75 text-xs">
              <strong>Order Wallet</strong>, <strong>Wishlist</strong>, and <strong>Route Drafts</strong> are personal access only and closed for public viewing.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. EXPERIENCE SECTION (Row 8 in Matrix - Dynamic)            */}
      {/* Scope: Numbers of Problem Sent, Visited Gym, Crags, Friends  */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <Sparkles size={20} /> Experience
          </h2>
          <p className="text-xs opacity-70">
            Numbers of Problem Sent, Visited Gym, Visited Crags, Friends Connected
          </p>
        </div>

        {/* 4 Quantitative Achievement Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[
            { label: 'Problem Sent', value: experienceData.problemsSent, unit: 'routes', color: 'text-[#FF6B00]' },
            { label: 'Visited Crags', value: experienceData.cragsVisited, unit: 'crags', color: 'text-[#06B6D4]' },
            { label: 'Visited Gym', value: experienceData.gymVisited, unit: 'gyms', color: 'text-[#F90657]' },
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

              <line x1="20" y1="20" x2="480" y2="20" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
              <line x1="20" y1="65" x2="480" y2="65" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
              <line x1="20" y1="110" x2="480" y2="110" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />

              <polygon
                points="20,110 30,95 120,80 210,65 300,50 390,38 480,25 480,110"
                fill="url(#chartGradientOrange)"
              />

              <polyline
                points="30,95 120,80 210,65 300,50 390,38 480,25"
                fill="none"
                stroke="#FF6B00"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <polyline
                points="30,105 120,100 210,95 300,90 390,85 480,82"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

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
      {/* 3. PERFORMANCE SECTION (Row 9 in Matrix - Dynamic Grade)     */}
      {/* Scope: Max Boulder Grade, Sport Grade, Flash, Grade Pyramid  */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <Scale size={20} /> Performance (Grade)
          </h2>
          <p className="text-xs opacity-70">
            Personal climbing capability records, max grade, and route pyramid breakdown
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className={`p-4 rounded-2xl border ${
            isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
          }`}>
            <span className="text-[10px] opacity-70 uppercase tracking-wider block font-semibold">Max Boulder</span>
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#FF6B00] block mt-1">
              {performanceData.maxBoulder}
            </span>
            <span className="text-[10px] opacity-60">Font: 7B</span>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
          }`}>
            <span className="text-[10px] opacity-70 uppercase tracking-wider block font-semibold">Max Sport Lead</span>
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#06B6D4] block mt-1">
              {performanceData.maxSport}
            </span>
            <span className="text-[10px] opacity-60">French: 7b+</span>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
          }`}>
            <span className="text-[10px] opacity-70 uppercase tracking-wider block font-semibold">Flash Boulder</span>
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 block mt-1">
              {performanceData.flashBoulder}
            </span>
            <span className="text-[10px] opacity-60">Single attempt send</span>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
          }`}>
            <span className="text-[10px] opacity-70 uppercase tracking-wider block font-semibold">Discipline</span>
            <span className="text-sm sm:text-base font-bold text-chalk block mt-2 truncate">
              {performanceData.discipline}
            </span>
            <span className="text-[10px] opacity-60">Primary style</span>
          </div>
        </div>

        {/* Grade Distribution Pyramid */}
        <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 ${
          isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
        }`}>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80 block">
            Send Pyramid Distribution
          </span>
          <div className="space-y-2">
            {performanceData.pyramid.map((pyr, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <span className="w-16 font-mono font-bold text-[#FF6B00]">{pyr.grade}</span>
                <div className="flex-1 h-3 rounded-full bg-black/20 overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B00] to-[#F90657] rounded-full"
                    style={{ width: pyr.bar }}
                  />
                </div>
                <span className="w-16 text-right font-medium opacity-80">{pyr.count} sends</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pink divider */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 4. ON-GOING PROJECTS (Row 10 in Matrix - CTA Button: Yes)    */}
      {/* Scope: On going/unsent climbing project                      */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
                <Target size={20} /> Projects
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                On-Going Unsent
              </span>
            </div>
            <p className="text-xs opacity-70 mt-1">
              Active routes currently being projected. Log attempts, track crux breakthroughs, or tick as sent.
            </p>
          </div>

          {isPersonalAccess && (
            <button
              type="button"
              onClick={() => setShowAddProjectModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
            >
              <Plus size={14} /> Add New Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl border opacity-75 ${
            isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
          }`}>
            <p className="text-sm">No ongoing projects. Tap &apos;+ Add New Project&apos; to track a boulder route you are working on!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between transition-all space-y-3 ${
                  isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#FF6B00]/20 text-[#FF6B00]">
                          {proj.grade}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-amber-400">
                          {proj.discipline}
                        </span>
                      </div>
                      <h3 className="font-bold text-base mt-1">{proj.name}</h3>
                      <p className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-[#FF6B00]" /> {proj.cragOrGym}
                      </p>
                    </div>

                    {isPersonalAccess && (
                      <button
                        onClick={() => deleteUserProject(proj.id)}
                        className="text-white/40 hover:text-red-400 p-1 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Highpoint & Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="opacity-70">Highpoint / Crux:</span>
                      <span className="font-bold text-amber-400">{proj.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-[#FF6B00] rounded-full"
                        style={{ width: `${proj.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[11px] opacity-80 italic pt-0.5">
                      &quot;{proj.highpoint}&quot;
                    </p>
                  </div>

                  {/* Sessions & Attempts */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-black/5 dark:border-white/5 opacity-80">
                    <span>{proj.sessionsCount} Sessions · {proj.attemptsCount} Attempts</span>
                    {proj.targetDate && (
                      <span className="text-[11px] text-[#06B6D4]">Target: {proj.targetDate}</span>
                    )}
                  </div>
                </div>

                {/* Project CTA Buttons (Row 10: CTA Button: Yes) */}
                {isPersonalAccess && (
                  <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => logProjectAttempt(proj.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/20 hover:border-white transition-all flex items-center gap-1"
                    >
                      <span>+1 Attempt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTickProject(proj)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Check size={14} /> Tick as Sent!
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pink divider */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 5. SENT CARDS SECTION (Row 12: Slideshow default/Thumb/List) */}
      {/* Scope: Logbook of sent route/problems. View mode: Slideshow  */}
      {/* CTA Button: Yes (Direct share to Community Wall feed)        */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
                <Award size={20} /> Sent Cards
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                Verified Logbook
              </span>
            </div>
            <p className="text-xs opacity-70 mt-0.5">
              Logbook of sent routes/problems. View mode: Slideshow (default), Thumbnail, List.
            </p>
          </div>

          {/* View mode switcher: Slideshow (default) | Thumbnail | List */}
          <div className={`p-1 rounded-2xl flex border ${
            isSandstone ? 'bg-[#1a1815]/10 border-[#1a1815]/20' : 'bg-black/40 border-white/10'
          }`}>
            {(['slideshow', 'thumbnail', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSentCardViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  sentCardViewMode === mode
                    ? 'bg-[#FF6B00] text-white shadow-md'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {mode === 'slideshow' ? 'Slideshow' : mode === 'thumbnail' ? 'Thumbnails' : 'List'}
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
        ) : sentCardViewMode === 'slideshow' ? (
          /* SLIDESHOW (DEFAULT) VIEW MODE (Row 12 Requirement) */
          <div className="space-y-4 max-w-md mx-auto">
            {/* Carousel Container */}
            <div className="relative shadow-2xl rounded-3xl overflow-hidden group">
              <SendCard
                data={{
                  problemName: ascents[slideshowIndex].problemName,
                  grade: ascents[slideshowIndex].grade,
                  location: ascents[slideshowIndex].location,
                  provinceCountry: ascents[slideshowIndex].provinceCountry,
                  wallAngle: ascents[slideshowIndex].wallAngle,
                  wallHeight: ascents[slideshowIndex].wallHeight,
                  boltsCount: ascents[slideshowIndex].boltsCount,
                  discipline: ascents[slideshowIndex].discipline,
                  ascentType: ascents[slideshowIndex].ascentType,
                  attempts: ascents[slideshowIndex].attempts,
                  duration: ascents[slideshowIndex].duration,
                  photoUrl: ascents[slideshowIndex].photoUrl,
                  markers: ascents[slideshowIndex].markers,
                  climberName: ascents[slideshowIndex].climberName,
                  time: ascents[slideshowIndex].time,
                  date: ascents[slideshowIndex].date,
                  belayer: ascents[slideshowIndex].belayer,
                  photographer: ascents[slideshowIndex].photographer,
                }}
              />

              {/* Prev / Next Carousel Controls */}
              {ascents.length > 1 && (
                <>
                  <button
                    onClick={() => setSlideshowIndex((prev) => (prev > 0 ? prev - 1 : ascents.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-all shadow-md z-30"
                    aria-label="Previous Sent Card"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={() => setSlideshowIndex((prev) => (prev < ascents.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-all shadow-md z-30"
                    aria-label="Next Sent Card"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Slideshow Navigation Bar & Action CTAs (Row 12: Direct share to Community Wall feed) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-xs font-mono opacity-70">
                Card {slideshowIndex + 1} of {ascents.length}
              </span>

              <div className="flex items-center gap-2">
                {/* CTA: Direct share through-out to Community Wall feed */}
                <button
                  type="button"
                  onClick={() => handleShareSentCardToCommunity(ascents[slideshowIndex])}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center gap-1.5 shadow-sm"
                  title="Direct share to Jalur Community Wall feed"
                >
                  <Share2 size={13} />
                  <span>Share to Community Feed</span>
                </button>

                {/* CTA: Download Sent Card */}
                <a
                  href={ascents[slideshowIndex].photoUrl || '#'}
                  download={`SentCard-${ascents[slideshowIndex].problemName}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/20 hover:border-white transition-all flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        ) : sentCardViewMode === 'thumbnail' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ascents.map((asc, idx) => (
              <div
                key={asc.id}
                onClick={() => {
                  setSlideshowIndex(idx)
                  setActiveSendCardModal(asc)
                }}
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
        ) : (
          <div className="space-y-2">
            {ascents.map((asc, idx) => (
              <div
                key={asc.id}
                onClick={() => {
                  setSlideshowIndex(idx)
                  setActiveSendCardModal(asc)
                }}
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
        )}
      </section>

      {/* Pink divider */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 6. GEAR SECTION (Row 11 in Matrix - CTA Button: Yes)         */}
      {/* Scope: Owned Climbing Equipment with photo, title, subtitle  */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
              <Layers size={20} /> My Gear Collection
            </h2>
            <p className="text-xs opacity-70">
              Owned Climbing Equipment. Add your equipment collection with photo, title, and subtitle.
            </p>
          </div>

          {isPersonalAccess && (
            <button
              onClick={() => setShowAddGearModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus size={15} /> Add Gear
            </button>
          )}
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
                {isPersonalAccess && (
                  <button
                    onClick={() => deleteUserGear(g.id)}
                    title="Remove gear"
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white/70 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-[#FF6B00] font-semibold block">{g.categoryLabel}</span>
                  <h4 className="font-bold text-xs truncate mt-0.5">{g.name}</h4>
                  <p className="text-[10px] opacity-70 truncate">{g.brand} · {g.condition}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pink divider */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 7. ORDER WALLET [PERSONAL ACCESS ONLY · CLOSED FOR PUBLIC]    */}
      {/* Row 5 in Matrix - (Already Completed & Preserved)            */}
      {/* ============================================================ */}
      {isPersonalAccess && (
        <>
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
                    <Wallet size={20} /> Order Wallet
                  </h2>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 shadow-sm">
                    <Lock size={10} /> Personal access only (closed for public)
                  </span>
                </div>
                <p className="text-xs opacity-70 mt-1">
                  Draft + Active + History of purchasing activities & verified tickets
                </p>
              </div>

              <div className={`p-1 rounded-2xl flex border ${
                isSandstone ? 'bg-[#1a1815]/10 border-[#1a1815]/20' : 'bg-black/40 border-white/10'
              }`}>
                {(['draft', 'active', 'history'] as const).map((tab) => {
                  const count = walletOrders.filter((o) => o.status === tab).length
                  const labels = {
                    draft: 'Draft',
                    active: 'Active',
                    history: 'History',
                  }
                  return (
                    <button
                      key={tab}
                      onClick={() => setWalletTab(tab)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                        walletTab === tab
                          ? 'bg-[#FF6B00] text-white shadow-md'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {labels[tab]} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className={`p-8 text-center rounded-3xl border opacity-75 ${
                isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
              }`}>
                <p className="text-sm">No {walletTab} purchasing activities in your wallet.</p>
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
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          ord.status === 'draft'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : ord.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/10 text-white/70'
                        }`}>
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
                        <span className="text-[10px] opacity-60 block">
                          {ord.status === 'draft' ? 'Estimated Total' : 'Total Paid'}
                        </span>
                        <span className="text-sm font-bold text-[#FF6B00]">
                          Rp {ord.totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {ord.status === 'draft' ? (
                        <button
                          onClick={() => setSelectedCheckoutModal(ord)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <CreditCard size={14} /> Continue Checkout &rarr;
                        </button>
                      ) : ord.status === 'active' ? (
                        <button
                          onClick={() => setSelectedQRModal(ord)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <QrCode size={14} /> E-Ticket QR
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedReceiptModal(ord)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Receipt size={14} /> View Receipt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="border-t border-[#F90657]/30" />
        </>
      )}

      {/* ============================================================ */}
      {/* 8. WISHLIST [PERSONAL ACCESS ONLY · CLOSED FOR PUBLIC]        */}
      {/* Row 6 in Matrix - (Already Completed & Preserved)            */}
      {/* ============================================================ */}
      {isPersonalAccess && (
        <>
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
                    <Pictogram name="wishlisted" size={20} className="text-[#F90657]" /> Wishlist
                  </h2>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 shadow-sm">
                    <Lock size={10} /> Personal access only (closed for public)
                  </span>
                </div>
                <p className="text-xs opacity-70 mt-1">
                  List of saved interest such as plan to visit or climbing from: Crags / Problems / Gym / Trip / Event
                </p>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {(['all', 'crag', 'problem', 'gym', 'trip', 'event'] as const).map((filter) => {
                  const filterLabels = {
                    all: 'All',
                    crag: 'Crags',
                    problem: 'Problems',
                    gym: 'Gyms',
                    trip: 'Trips',
                    event: 'Events',
                  }
                  return (
                    <button
                      key={filter}
                      onClick={() => setWishlistFilter(filter)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all border whitespace-nowrap ${
                        wishlistFilter === filter
                          ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-sm'
                          : isSandstone
                          ? 'border-[#1a1815]/20 text-[#1a1815]/70 hover:border-[#1a1815]/50'
                          : 'border-white/10 text-slate-ash hover:text-white'
                      }`}
                    >
                      {filterLabels[filter]}
                    </button>
                  )
                })}
              </div>
            </div>

            {filteredWishlist.length === 0 ? (
              <div className={`p-8 text-center rounded-3xl border opacity-75 ${
                isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
              }`}>
                <p className="text-sm">No items in your wishlist for this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWishlist.map((item) => {
                  const linkHref =
                    item.type === 'crag'
                      ? `/crags/${item.id}`
                      : item.type === 'gym'
                      ? `/gyms/${item.id}`
                      : item.type === 'trip'
                      ? `/community`
                      : item.type === 'event'
                      ? `/community`
                      : `/beta?problem=${item.id}`

                  const ctaLabel =
                    item.type === 'crag'
                      ? 'Explore Crag'
                      : item.type === 'gym'
                      ? 'Book Gym Pass'
                      : item.type === 'trip'
                      ? 'View Trip Details'
                      : item.type === 'event'
                      ? 'Event & Registration'
                      : 'View Beta Topo'

                  const typePillColor =
                    item.type === 'crag'
                      ? 'text-[#FF6B00]'
                      : item.type === 'problem'
                      ? 'text-[#F90657]'
                      : item.type === 'gym'
                      ? 'text-[#06B6D4]'
                      : item.type === 'trip'
                      ? 'text-emerald-400'
                      : 'text-amber-400'

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
                          <Pictogram name="wishlisted" size={10} className="text-[#FF6B00]" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Mark</span>
                        </div>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          title="Remove from wishlist"
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white/80 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                        {item.grade && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 font-mono text-xs font-bold text-[#FF6B00]">
                            {item.grade}
                          </span>
                        )}
                        {item.price && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-bold text-emerald-400">
                            Rp {item.price.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>

                      <div className="p-3.5 space-y-2.5">
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${typePillColor}`}>
                            {item.type}
                          </span>
                          <h4 className="font-bold text-sm truncate">{item.title}</h4>
                          <p className="text-xs opacity-70 truncate">{item.subtitle || item.location}</p>
                          {item.date && (
                            <p className="text-[11px] text-[#06B6D4] font-medium pt-0.5">
                              {item.date}
                            </p>
                          )}
                        </div>

                        <Link
                          href={linkHref}
                          className="w-full py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white flex items-center justify-center gap-1 hover:bg-[#E5601F] transition-all shadow-sm"
                        >
                          <span>{ctaLabel}</span>
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <div className="border-t border-[#F90657]/30" />
        </>
      )}

      {/* ============================================================ */}
      {/* 9. ROUTE DRAFTS [PERSONAL ACCESS ONLY · CLOSED FOR PUBLIC]   */}
      {/* Row 7 in Matrix - (Already Completed & Preserved)            */}
      {/* ============================================================ */}
      {isPersonalAccess && (
        <>
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
                    <FileText size={20} /> Route Draft
                  </h2>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 shadow-sm">
                    <Lock size={10} /> Personal access only (closed for public)
                  </span>
                </div>
                <p className="text-xs opacity-70 mt-1">
                  Unfinished data submission for setting a route. Complete technical specifications before publishing.
                </p>
              </div>

              <Link
                href="/beta?action=submit"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-center"
              >
                <Plus size={14} /> New Route Draft
              </Link>
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
                          className="text-xs opacity-50 hover:text-red-400 transition-colors"
                          title="Delete draft"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <h4 className="font-bold text-base mt-1.5">{d.name}</h4>
                      <p className="text-xs opacity-70">{d.cragName} · {d.sectorName}</p>
                      {d.notes && (
                        <p className="text-xs opacity-80 italic mt-1">&quot;{d.notes}&quot;</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#FF6B00]">{d.grade}</span>

                      <Link
                        href={`/beta?action=submit&draft=${d.id}`}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center gap-1 shadow-sm"
                      >
                        <span>Continue Editing</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="border-t border-[#F90657]/30" />
        </>
      )}

      {/* ============================================================ */}
      {/* 10. STAGED ROADMAP HUB (Rows 13, 14, 15 - Future Versions)   */}
      {/* Row 13: Activity Badge (V3.0)                                */}
      {/* Row 14: Competition Achievement (V5.0 with KIAT ID)          */}
      {/* Row 15: Personal Feed (V3.0)                                 */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[#F90657]">
              Personal Account Roadmap
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
              V2.0 – V5.0 Staged Plan
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Row 13: Activity Badge (V3.0) */}
          <div className={`p-4 rounded-2xl border opacity-75 relative overflow-hidden ${
            isSandstone ? 'bg-[#f4efe6]/60 border-[#1a1815]/10' : 'bg-[#181D22]/60 border-white/5'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                V3.0 Roadmap
              </span>
              <Lock size={12} className="opacity-50" />
            </div>
            <h4 className="font-bold text-xs text-chalk">Activity Badge Collection</h4>
            <p className="text-[10px] opacity-70 mt-1 font-light">
              Collection of designated activity badges from Jalur with slideshow & direct share.
            </p>
          </div>

          {/* Row 15: Personal Feed (Synced from Community Create Post + V3.0 Standalone Feed) */}
          <div className={`p-4 rounded-2xl border relative overflow-hidden space-y-2 ${
            isSandstone ? 'bg-[#f4efe6]/80 border-[#1a1815]/15' : 'bg-[#181D22]/80 border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {personalFeedPosts.length > 0 ? `${personalFeedPosts.length} Synced Post` : 'V3.0 Roadmap'}
              </span>
              {personalFeedPosts.length === 0 && <Lock size={12} className="opacity-50" />}
            </div>
            <h4 className="font-bold text-xs text-chalk">Personal Posts Feed</h4>
            {personalFeedPosts.length > 0 ? (
              <div className="space-y-1.5">
                {personalFeedPosts.slice(0, 2).map((fp) => (
                  <div key={fp.id} className="p-2 rounded-xl bg-black/25 border border-white/10 text-[11px]">
                    <p className="font-bold text-[#FF6B00] truncate">{fp.activity} · {fp.location}</p>
                    <p className="opacity-80 line-clamp-2">{fp.caption}</p>
                  </div>
                ))}
                <Link href="/community" className="inline-block text-[11px] font-bold text-[#FF6B00] hover:underline">
                  Create another post in Community →
                </Link>
              </div>
            ) : (
              <p className="text-[10px] opacity-70 mt-1 font-light">
                Posts created via Community auto-publish here. Standalone Personal Feed launches in V3.0.
              </p>
            )}
          </div>

          {/* Row 14: Competition Achievement (V5.0) */}
          <div className={`p-4 rounded-2xl border opacity-75 relative overflow-hidden ${
            isSandstone ? 'bg-[#f4efe6]/60 border-[#1a1815]/10' : 'bg-[#181D22]/60 border-white/5'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                V5.0 Roadmap
              </span>
              <Lock size={12} className="opacity-50" />
            </div>
            <h4 className="font-bold text-xs text-chalk">Competition CV & KIAT ID</h4>
            <p className="text-[10px] opacity-70 mt-1 font-light">
              Curriculum vitae of official competitions, medals, and national ranking.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MODAL: SHARE PROFILE LINK (Row 16 in Matrix - CTA Button)    */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm popup-form-purple rounded-3xl p-6 border shadow-2xl space-y-4 text-center"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <Share2 size={16} className="text-[#FF6B00]" />
                  <span className="text-xs uppercase tracking-wider font-bold text-[#FF6B00]">
                    Share Profile
                  </span>
                </div>
                <button onClick={() => setShowShareModal(false)} className="text-white/60 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{climberName}</h3>
                <p className="text-xs text-white/70">{username} · {homeBase}</p>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-3.5 rounded-2xl mx-auto inline-block shadow-inner">
                <QRCodeSVG
                  value={typeof window !== 'undefined' ? `${window.location.origin}/account?user=${isViewingOther ? targetUserId : (user?.id || 'climber-1')}` : 'https://jalur.world/account'}
                  size={140}
                />
              </div>

              <div className="space-y-2 pt-1 text-left">
                {/* Copy URL Link Button */}
                <button
                  onClick={handleCopyProfileUrl}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} /> Link Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Profile URL Link
                    </>
                  )}
                </button>

                {/* Social Share Options */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${climberName}'s climbing profile on Jalur: https://jalur.world/account`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent('https://jalur.world/account')}&text=${encodeURIComponent(`Check out ${climberName}'s climbing profile on Jalur!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-[#0088cc]/20 border border-[#0088cc]/40 text-[#0088cc] hover:bg-[#0088cc]/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL: EDIT PROFILE (Row 2, 3, 4)                            */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showEditProfileModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditProfileModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md popup-form-purple rounded-3xl p-6 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-lg text-white">Edit Personal Profile</h3>
                <button onClick={() => setShowEditProfileModal(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setShowEditProfileModal(false)
                  setSharedToast('Profile updated successfully!')
                  setTimeout(() => setSharedToast(null), 3000)
                }}
                className="space-y-3.5 text-xs text-white"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-white/80 block mb-1 font-medium">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="text-white/80 block mb-1 font-medium">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00] font-mono"
                  />
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Account Status</label>
                  <select
                    value={userAccountStatus}
                    onChange={(e) => setUserAccountStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Climber">Climber</option>
                    <option value="Route Setter">Route Setter</option>
                    <option value="Trip Guide">Trip Guide</option>
                    <option value="Gym Manager">Gym Manager</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Home-base (City, Province)</label>
                  <input
                    type="text"
                    required
                    value={homeBase}
                    onChange={(e) => setHomeBase(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Country of Origin</label>
                  <input
                    type="text"
                    required
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Description (Climber Bio)</label>
                  <textarea
                    rows={3}
                    value={bioDescription}
                    onChange={(e) => setBioDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#FF6B00] text-white hover:bg-[#E5601F] shadow-lg transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL: ADD ONGOING PROJECT (Row 10 in Matrix)                 */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showAddProjectModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddProjectModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md popup-form-purple rounded-3xl p-6 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-lg text-white">Add On-Going Climbing Project</h3>
                <button onClick={() => setShowAddProjectModal(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs text-white">
                <div>
                  <label className="text-white/80 block mb-1 font-medium">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gorejat Mantle, Batu Belah Direct"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-white/80 block mb-1 font-medium">Target Grade</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. V7 (7A+)"
                      value={newProjectGrade}
                      onChange={(e) => setNewProjectGrade(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-white/80 block mb-1 font-medium">Discipline</label>
                    <select
                      value={newProjectDiscipline}
                      onChange={(e) => setNewProjectDiscipline(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                    >
                      <option value="boulder">Bouldering</option>
                      <option value="sport">Sport Climbing</option>
                      <option value="lead">Lead Climbing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Crag or Gym Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Harau Valley · Sarasah Bonta"
                    value={newProjectLocation}
                    onChange={(e) => setNewProjectLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Highpoint Progress Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Hold #8 reached, working on final mantle deadpoint"
                    value={newProjectHighpoint}
                    onChange={(e) => setNewProjectHighpoint(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Target Send Timeline</label>
                  <input
                    type="text"
                    placeholder="e.g. May 2026 Trip, Next Weekend"
                    value={newProjectTargetDate}
                    onChange={(e) => setNewProjectTargetDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Boulder Photo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newProjectImage}
                    onChange={(e) => setNewProjectImage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Beta / Crux Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Beta notes: Right heel hook, cold friction needed..."
                    value={newProjectNotes}
                    onChange={(e) => setNewProjectNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#FF6B00] text-white hover:bg-[#E5601F] shadow-lg transition-all"
                  >
                    Save to My Projects
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL: ADD GEAR (Row 11 in Matrix)                           */}
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

              <form onSubmit={handleCreateGear} className="space-y-3.5 text-xs text-white">
                <div>
                  <label className="text-white/80 block mb-1 font-medium">Gear Category</label>
                  <select
                    value={newGearCategory}
                    onChange={(e) => setNewGearCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
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
                  <label className="text-white/80 block mb-1 font-medium">Gear Name / Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solution Comp, Hirundos, GriGri"
                    value={newGearName}
                    onChange={(e) => setNewGearName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Brand / Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. La Sportiva, Petzl, Black Diamond"
                    value={newGearBrand}
                    onChange={(e) => setNewGearBrand(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Gear Photo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newGearImage}
                    onChange={(e) => setNewGearImage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/20 text-white outline-none focus:border-[#FF6B00]"
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
      {/* MODAL: QR CODE E-TICKET VIEW (For Active Orders)             */}
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
      {/* MODAL: TRANSACTION RECEIPT / INVOICE (For History Orders)    */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedReceiptModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReceiptModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm popup-form-purple rounded-3xl p-6 border shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <Receipt size={16} className="text-[#06B6D4]" />
                  <span className="text-xs uppercase tracking-wider font-bold text-[#06B6D4]">
                    Official Receipt
                  </span>
                </div>
                <button onClick={() => setSelectedReceiptModal(null)} className="text-white/60 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="text-left space-y-2">
                <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-1">
                  <span className="text-[10px] text-white/60 uppercase">Item Description</span>
                  <h4 className="font-bold text-sm text-white">{selectedReceiptModal.title}</h4>
                  <p className="text-xs text-white/70">{selectedReceiptModal.venueOrLocation}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                    <span className="text-[10px] text-white/60 block">Receipt Code</span>
                    <span className="font-mono font-bold text-white">{selectedReceiptModal.bookingCode}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                    <span className="text-[10px] text-white/60 block">Date</span>
                    <span className="font-medium text-white">{selectedReceiptModal.date}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/80">Total Paid (Settled)</span>
                  <span className="text-base font-bold text-[#FF6B00]">
                    Rp {selectedReceiptModal.totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedReceiptModal(null)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-white/15 hover:bg-white/25 text-white transition-all"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL: COMPLETE DRAFT CHECKOUT (For Draft Orders)            */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedCheckoutModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCheckoutModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm popup-form-purple rounded-3xl p-6 border shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <CreditCard size={16} className="text-[#FF6B00]" />
                  <span className="text-xs uppercase tracking-wider font-bold text-[#FF6B00]">
                    Complete Draft Order
                  </span>
                </div>
                <button onClick={() => setSelectedCheckoutModal(null)} className="text-white/60 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="text-left space-y-2">
                <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-1">
                  <span className="text-[10px] text-amber-400 font-semibold uppercase">Pending Checkout</span>
                  <h4 className="font-bold text-sm text-white">{selectedCheckoutModal.title}</h4>
                  <p className="text-xs text-white/70">{selectedCheckoutModal.venueOrLocation} · {selectedCheckoutModal.date}</p>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/80">Total Due</span>
                  <span className="text-base font-bold text-[#FF6B00]">
                    Rp {selectedCheckoutModal.totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleCompletePayment(selectedCheckoutModal.id)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check size={14} /> Confirm & Pay Now
                </button>
                <button
                  onClick={() => setSelectedCheckoutModal(null)}
                  className="w-full py-2 rounded-xl font-medium text-xs text-white/70 hover:text-white transition-all"
                >
                  Keep as Draft
                </button>
              </div>
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
                    markers: activeSendCardModal.markers,
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
