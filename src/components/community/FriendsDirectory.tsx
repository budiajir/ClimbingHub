'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  MapPin,
  Mountain,
  Compass,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  Share2,
  MessageSquare,
  Camera,
  Upload,
  Check,
  X,
  RotateCcw,
  Award,
  Sparkles,
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'
import InviteFriendModal from '@/components/community/InviteFriendModal'
import ShareLinkModal from '@/components/common/ShareLinkModal'
import {
  getConnectedFriends,
  toggleFriendConnection,
  getUserCustomAvatar,
  saveUserCustomAvatar,
  DEFAULT_USER_AVATAR,
} from '@/lib/social-store'
import { getUserAscents } from '@/lib/user-ascents'

export interface ClimberProfile {
  id: string
  name: string
  handle: string
  hometown: string
  avatar: string
  preferredGrade: string
  discipline: string
  problemsSent: number
  cragsVisited: number
  gymsVisited: number
  friendsCount: number
  bio: string
}

export const CLIMBERS_DATA: ClimberProfile[] = [
  {
    id: 'climber-1',
    name: 'Budi Prasetyo',
    handle: '@budiclimb',
    hometown: 'Bandung, Jawa Barat',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    preferredGrade: 'V7 (7A+)',
    discipline: 'Bouldering & Sport',
    problemsSent: 84,
    cragsVisited: 14,
    gymsVisited: 8,
    friendsCount: 56,
    bio: 'Weekend outdoor boulderer exploring Harau & Citatah. Route setting enthusiast.',
  },
  {
    id: 'climber-2',
    name: 'Sarah Amalia',
    handle: '@sarah.climbs',
    hometown: 'Jakarta Selatan, DKI',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    preferredGrade: 'V6 (7A)',
    discipline: 'Indoor Bouldering',
    problemsSent: 62,
    cragsVisited: 9,
    gymsVisited: 12,
    friendsCount: 78,
    bio: 'Gym rat training at Indoclimb & Peak to Peak. Always looking for outdoor trip partners!',
  },
  {
    id: 'climber-3',
    name: 'Dimas Anggara',
    handle: '@dimas_boulder',
    hometown: 'Yogyakarta, DIY',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    preferredGrade: '7b+ (5.12c)',
    discipline: 'Lead & Multi-pitch',
    problemsSent: 110,
    cragsVisited: 22,
    gymsVisited: 6,
    friendsCount: 92,
    bio: 'Siung & Parang local guide. Big wall multi-pitch and coastal limestone climber.',
  },
  {
    id: 'climber-4',
    name: 'Rani Wijaya',
    handle: '@rani_rock',
    hometown: 'Surabaya, Jawa Timur',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    preferredGrade: 'V5 (6C)',
    discipline: 'Bouldering',
    problemsSent: 45,
    cragsVisited: 7,
    gymsVisited: 5,
    friendsCount: 34,
    bio: 'Passionate boulderer traveling across East Java crags and gyms.',
  },
  {
    id: 'climber-5',
    name: 'Guntur Putra',
    handle: '@guntur_climb',
    hometown: 'Padang, Sumatera Barat',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    preferredGrade: 'V9 (7C)',
    discipline: 'Bouldering & Trad',
    problemsSent: 142,
    cragsVisited: 19,
    gymsVisited: 4,
    friendsCount: 68,
    bio: 'Harau Valley resident setter. FA on multiple granite testpieces.',
  },
  {
    id: 'climber-6',
    name: 'Nadia Safitri',
    handle: '@nadia_climbs',
    hometown: 'Denpasar, Bali',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    preferredGrade: '6c (5.11a)',
    discipline: 'Sport Climbing',
    problemsSent: 53,
    cragsVisited: 8,
    gymsVisited: 7,
    friendsCount: 49,
    bio: 'Living in Bali, climbing Songan Kintamani and training at local gyms.',
  },
]

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&q=80',
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=240&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=240&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&q=80',
]

interface FriendsDirectoryProps {
  backHref?: string
  backLabel?: string
}

export default function FriendsDirectory({
  backHref = '/',
  backLabel = 'Back to Home',
}: FriendsDirectoryProps) {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const { user, role } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'connected'>('all')
  const [viewMode, setViewMode] = useState<'thumbnail' | 'list'>('thumbnail')
  const [connectedIds, setConnectedIds] = useState<string[]>([])
  const [userAscentCount, setUserAscentCount] = useState(0)

  // Profile Picture Personalization state
  const [customAvatar, setCustomAvatar] = useState<string | null>(null)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [draftAvatarUrl, setDraftAvatarUrl] = useState('')
  const [avatarSavedToast, setAvatarSavedToast] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Invite & Share modals
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareClimberTarget, setShareClimberTarget] = useState<{
    title: string
    subtitle: string
    url: string
  } | null>(null)

  useEffect(() => {
    const syncFriends = () => setConnectedIds(getConnectedFriends())
    const syncAvatar = () => setCustomAvatar(getUserCustomAvatar())
    const syncAscents = () => setUserAscentCount(getUserAscents().length)

    syncFriends()
    syncAvatar()
    syncAscents()

    window.addEventListener('social-friends-updated', syncFriends)
    window.addEventListener('user-avatar-updated', syncAvatar)
    window.addEventListener('user-ascents-updated', syncAscents)
    return () => {
      window.removeEventListener('social-friends-updated', syncFriends)
      window.removeEventListener('user-avatar-updated', syncAvatar)
      window.removeEventListener('user-ascents-updated', syncAscents)
    }
  }, [])

  const activeAvatar = customAvatar || user?.avatar || DEFAULT_USER_AVATAR
  const connectedFriends = Object.fromEntries(connectedIds.map((id) => [id, true]))

  // Dynamic personal experience stats synced with logged ascents + connected friends
  const personalExperience = {
    problemsSent: 42 + userAscentCount,
    cragsVisited: 14,
    gymsVisited: 8,
    friendsConnected: 66 + connectedIds.length,
  }

  const toggleConnect = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFriendConnection(id)
  }

  const openAvatarPersonalizer = () => {
    setDraftAvatarUrl(activeAvatar)
    setShowAvatarModal(true)
  }

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDraftAvatarUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAvatar = () => {
    saveUserCustomAvatar(draftAvatarUrl)
    setShowAvatarModal(false)
    setAvatarSavedToast(true)
    setTimeout(() => setAvatarSavedToast(false), 2600)
  }

  const handleResetAvatar = () => {
    saveUserCustomAvatar('')
    setDraftAvatarUrl(user?.avatar || DEFAULT_USER_AVATAR)
    setShowAvatarModal(false)
    setAvatarSavedToast(true)
    setTimeout(() => setAvatarSavedToast(false), 2600)
  }

  const filteredClimbers = CLIMBERS_DATA.filter((c) => {
    if (filterMode === 'connected' && !connectedFriends[c.id]) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.hometown.toLowerCase().includes(q) ||
      c.preferredGrade.toLowerCase().includes(q)
    )
  })

  const surfaceCardClass = isSandstone
    ? 'bg-[#f4efe6] border-[#1a1815]/15 text-[#1a1815]'
    : 'bg-[#1a1f24] border-white/10 text-chalk'

  const subtlePanelClass = isSandstone
    ? 'bg-black/5 border-[#1a1815]/10'
    : 'bg-black/30 border-white/10'

  return (
    <div className="max-w-7xl mx-auto p-4 md:px-6 lg:px-8 space-y-6">
      {/* 1-Step Back Navigation Header */}
      <div className="flex items-center justify-between gap-3 py-2 border-b border-black/10 dark:border-white/10">
        <Link
          href={backHref}
          className={`flex items-center gap-1.5 py-1 -ml-1 group text-left transition-opacity hover:opacity-75 active:opacity-60 min-w-0 ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}
        >
          <ChevronLeft
            size={20}
            className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5"
          />
          <span className="text-sm sm:text-base font-light tracking-wide truncate">
            {backLabel}
          </span>
        </Link>

        {avatarSavedToast && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-bold">
            <Check size={13} />
            <span>Profile picture updated across account</span>
          </div>
        )}
      </div>

      {/* Main Header Row: Static Page Title + Description + Share Link CTA + Add Friend CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <h1
            className={`font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight ${
              isSandstone ? 'text-[#1a1815]' : 'text-chalk'
            }`}
          >
            Friends
          </h1>
          <p
            className={`text-xs md:text-sm font-light mt-1 ${
              isSandstone ? 'text-[#5b554b]' : 'text-slate-ash'
            }`}
          >
            Personalisasi foto profil anda, pantau pengalaman memanjat, dan terhubung dengan kenalan atau teman baru di Jalur.
          </p>
        </div>

        {/* Header Actions + View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/community?tab=clubs"
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSandstone
                ? 'border-[#1a1815]/15 bg-black/5 hover:border-[#FF6B00] text-[#1a1815]'
                : 'border-white/15 bg-white/5 hover:border-[#FF6B00] text-chalk'
            }`}
          >
            <Compass size={14} className="text-[#FF6B00]" />
            <span>Clubs &amp; Squads</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E5601F] text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            <UserPlus size={14} />
            <span>Add / Invite Friend</span>
          </button>
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSandstone
                ? 'border-[#1a1815]/15 bg-black/5 hover:border-[#FF6B00] text-[#1a1815]'
                : 'border-white/15 bg-white/5 hover:border-lime text-chalk'
            }`}
          >
            <Share2 size={14} />
            <span>Share Link</span>
          </button>
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border ${
              isSandstone ? 'bg-black/5 border-[#1a1815]/15' : 'bg-black/30 border-white/10'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('thumbnail')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'thumbnail'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'opacity-60 hover:opacity-100'
              }`}
              title="Thumbnail View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'opacity-60 hover:opacity-100'
              }`}
              title="List View"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* PERSONAL CARD: Profile Picture Personalization (CTA Button) + Dynamic Experience Preview */}
      <section className={`rounded-3xl border p-5 md:p-6 shadow-sm ${surfaceCardClass}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Profile Picture CTA */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={openAvatarPersonalizer}
              className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-[#FF6B00]/60 hover:border-[#FF6B00] transition-all shrink-0 cursor-pointer"
              title="Personalisasi pilihan foto anda"
            >
              <img
                src={activeAvatar}
                alt="Your profile"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={20} />
              </span>
            </button>

            <div className="min-w-0 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] text-[10px] font-bold uppercase tracking-wider">
                <Sparkles size={11} />
                <span>Personal Profile &amp; Experience Preview</span>
              </div>
              <h2 className="font-bold text-lg sm:text-xl truncate">
                {user?.name || 'Ahmad Rizki Nugraha'}
                <span className="text-xs font-mono font-normal opacity-60 ml-2 uppercase">
                  ({role})
                </span>
              </h2>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={openAvatarPersonalizer}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E5601F] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Camera size={13} />
                  <span>Personalisasi Foto Profil</span>
                </button>
                <Link
                  href="/account"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    isSandstone
                      ? 'border-[#1a1815]/20 hover:border-[#FF6B00]'
                      : 'border-white/15 hover:border-[#FF6B00]'
                  }`}
                >
                  <Award size={13} className="text-[#FF6B00]" />
                  <span>Open Account</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Dynamic Personal Experience Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:w-[460px] shrink-0">
            <div className={`rounded-2xl border p-3 text-center ${subtlePanelClass}`}>
              <div className="font-mono font-extrabold text-lg text-[#FF6B00]">
                {personalExperience.problemsSent}
              </div>
              <div className="text-[10px] uppercase tracking-wider opacity-65 font-semibold">
                Problems Sent
              </div>
            </div>
            <div className={`rounded-2xl border p-3 text-center ${subtlePanelClass}`}>
              <div className="font-mono font-extrabold text-lg">
                {personalExperience.cragsVisited}
              </div>
              <div className="text-[10px] uppercase tracking-wider opacity-65 font-semibold">
                Visited Crags
              </div>
            </div>
            <div className={`rounded-2xl border p-3 text-center ${subtlePanelClass}`}>
              <div className="font-mono font-extrabold text-lg">
                {personalExperience.gymsVisited}
              </div>
              <div className="text-[10px] uppercase tracking-wider opacity-65 font-semibold">
                Visited Gyms
              </div>
            </div>
            <div className={`rounded-2xl border p-3 text-center ${subtlePanelClass}`}>
              <div className="font-mono font-extrabold text-lg text-emerald-500">
                {personalExperience.friendsConnected}
              </div>
              <div className="text-[10px] uppercase tracking-wider opacity-65 font-semibold">
                Friends Connected
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search + All / Connected Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-45 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends or discover climbers by name, handle, city, or grade..."
            className={`w-full pl-10 pr-5 py-2.5 rounded-full border text-xs sm:text-sm outline-none transition-colors ${
              isSandstone
                ? 'border-[#1a1815]/15 bg-[#f4efe6] text-[#1a1815] placeholder:text-[#1a1815]/45 focus:border-[#FF6B00]'
                : 'border-white/10 bg-[#1a1f24] text-chalk placeholder:text-white/40 focus:border-[#FF6B00]'
            }`}
          />
        </div>

        <div
          className={`inline-flex items-center p-1 rounded-full border self-start ${
            isSandstone
              ? 'bg-[#f4efe6] border-[#1a1815]/15'
              : 'bg-[#1a1f24] border-white/10'
          }`}
        >
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-[#FF6B00] text-white'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            All Climbers ({CLIMBERS_DATA.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('connected')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterMode === 'connected'
                ? 'bg-emerald-600 text-white'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            My Friends ({connectedIds.length})
          </button>
        </div>
      </div>

      {/* FRIENDS / CLIMBERS LIST & THUMBNAILS */}
      {filteredClimbers.length === 0 ? (
        <div className={`rounded-3xl border p-10 text-center space-y-2 ${surfaceCardClass}`}>
          <Users size={28} className="mx-auto opacity-45" />
          <p className="text-sm font-bold">No matching friends or climbers found</p>
          <p className="text-xs opacity-65 font-light">
            Try clearing your search or switch to All Climbers to add new partners.
          </p>
        </div>
      ) : viewMode === 'thumbnail' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClimbers.map((c) => {
            const isConnected = !!connectedFriends[c.id]
            return (
              <div
                key={c.id}
                className={`rounded-3xl border p-5 flex flex-col justify-between hover:border-[#FF6B00]/50 transition-all shadow-md group relative overflow-hidden ${surfaceCardClass}`}
              >
                <div className="space-y-4">
                  {/* Top Profile Header */}
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/account?user=${c.id}`}
                      className="flex items-center gap-3.5 group/user min-w-0"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#FF6B00]/30 group-hover/user:border-[#FF6B00] transition-all shrink-0">
                        <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base group-hover/user:text-[#FF6B00] transition-colors truncate">
                          {c.name}
                        </h3>
                        <div className="text-xs opacity-60 font-light truncate">{c.handle}</div>
                        <div className="text-[11px] opacity-70 flex items-center gap-1 font-light mt-0.5 truncate">
                          <MapPin size={11} className="text-[#FF6B00] shrink-0" />
                          <span>{c.hometown}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Preferred Grade Badge */}
                    <div
                      className={`px-2.5 py-1 rounded-xl border font-mono font-bold text-xs text-[#FF6B00] shrink-0 ${subtlePanelClass}`}
                    >
                      {c.preferredGrade}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs opacity-75 font-light line-clamp-2 leading-relaxed">
                    {c.bio}
                  </p>

                  {/* Dynamic Friend Experience Preview */}
                  <div className={`grid grid-cols-4 gap-1.5 py-2.5 px-3 rounded-2xl border text-center ${subtlePanelClass}`}>
                    <div>
                      <div className="font-mono font-bold text-xs">{c.problemsSent}</div>
                      <div className="text-[9px] opacity-60 uppercase">Sent</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs">{c.cragsVisited}</div>
                      <div className="text-[9px] opacity-60 uppercase">Crags</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs">{c.gymsVisited}</div>
                      <div className="text-[9px] opacity-60 uppercase">Gyms</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs text-[#FF6B00]">
                        {c.friendsCount + (isConnected ? 1 : 0)}
                      </div>
                      <div className="text-[9px] opacity-60 uppercase">Friends</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Account, Chat, Share Link & Add Friend CTA */}
                <div className="pt-4 mt-3 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                  <Link
                    href={`/account?user=${c.id}`}
                    className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      isSandstone
                        ? 'border-[#1a1815]/15 hover:border-[#1a1815]/40'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    Account
                  </Link>

                  <Link
                    href={`/community?chat=${c.id}`}
                    className={`p-2 rounded-xl border hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all ${
                      isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
                    }`}
                    title={`Chat with ${c.name}`}
                  >
                    <MessageSquare size={14} />
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      setShareClimberTarget({
                        title: c.name,
                        subtitle: `${c.handle} · ${c.hometown} · ${c.preferredGrade}`,
                        url: `/account?user=${c.id}`,
                      })
                    }
                    className={`p-2 rounded-xl border hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all ${
                      isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
                    }`}
                    title={`Share ${c.name}`}
                  >
                    <Share2 size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => toggleConnect(c.id, e)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      isConnected
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                        : 'bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white shadow-md'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <UserCheck size={14} />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        <span>Add Friend</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClimbers.map((c) => {
            const isConnected = !!connectedFriends[c.id]
            return (
              <div
                key={c.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 hover:border-[#FF6B00]/50 transition-all group ${surfaceCardClass}`}
              >
                <Link
                  href={`/account?user=${c.id}`}
                  className="flex items-center gap-3.5 min-w-0 flex-1"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#FF6B00]/30 group-hover:border-[#FF6B00] transition-all shrink-0">
                    <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm group-hover:text-[#FF6B00] transition-colors truncate">
                        {c.name}
                      </h3>
                      <span className="text-xs opacity-60 font-light truncate">{c.handle}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border text-[#FF6B00] ${subtlePanelClass}`}
                      >
                        {c.preferredGrade}
                      </span>
                    </div>
                    <div className="text-[11px] opacity-65 font-light mt-0.5 truncate flex items-center gap-1.5">
                      <Mountain size={11} className="text-[#FF6B00] shrink-0" />
                      <span>
                        {c.hometown} · {c.problemsSent} Sent · {c.cragsVisited} Crags · {c.gymsVisited} Gyms
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setShareClimberTarget({
                        title: c.name,
                        subtitle: `${c.handle} · ${c.hometown} · ${c.preferredGrade}`,
                        url: `/account?user=${c.id}`,
                      })
                    }
                    className={`p-2 rounded-xl border text-xs transition-all ${
                      isSandstone
                        ? 'border-[#1a1815]/15 hover:border-[#FF6B00]'
                        : 'border-white/10 hover:border-[#FF6B00]'
                    }`}
                    title={`Share ${c.name}`}
                  >
                    <Share2 size={14} />
                  </button>

                  <Link
                    href={`/account?user=${c.id}`}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all ${
                      isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
                    }`}
                  >
                    Profile
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => toggleConnect(c.id, e)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isConnected
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                        : 'bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white shadow-md'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <UserCheck size={14} />
                        <span className="hidden sm:inline">Connected</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        <span>Add Friend</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Profile Picture Personalization Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-3xl border p-6 space-y-5 shadow-2xl ${
              isSandstone
                ? 'bg-[#fbf8f3] border-[#1a1815]/20 text-[#1a1815]'
                : 'bg-[#181D22] border-white/15 text-chalk'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-lg">Personalisasi Foto Profil</h3>
                <p className="text-xs opacity-70 font-light">
                  Pilih preset foto, unggah dari perangkat anda, atau masukkan URL gambar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Preview + Upload */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FF6B00] shrink-0 bg-black/20">
                <img
                  src={draftAvatarUrl || activeAvatar}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#FF6B00]/20 transition-all cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Upload Foto dari Perangkat</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAvatar}
                  className={`w-full px-3.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSandstone
                      ? 'border-[#1a1815]/15 hover:bg-black/5'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <RotateCcw size={12} />
                  <span>Reset ke Default</span>
                </button>
              </div>
            </div>

            {/* Preset gallery */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                Preset Foto Pemanjat
              </div>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((preset) => {
                  const selected = draftAvatarUrl === preset
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDraftAvatarUrl(preset)}
                      className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        selected ? 'border-[#FF6B00] scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                Custom Image URL
              </label>
              <input
                type="url"
                value={draftAvatarUrl.startsWith('data:') ? '' : draftAvatarUrl}
                onChange={(e) => setDraftAvatarUrl(e.target.value)}
                placeholder="https://..."
                className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${
                  isSandstone
                    ? 'bg-white border-[#1a1815]/15 focus:border-[#FF6B00]'
                    : 'bg-black/30 border-white/15 focus:border-[#FF6B00]'
                }`}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                  isSandstone ? 'border-[#1a1815]/15' : 'border-white/15'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E5601F] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Check size={14} />
                <span>Simpan Foto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite & Share Modals */}
      <InviteFriendModal open={showInviteModal} onClose={() => setShowInviteModal(false)} />
      <ShareLinkModal
        open={showShareModal || !!shareClimberTarget}
        onClose={() => {
          setShowShareModal(false)
          setShareClimberTarget(null)
        }}
        title={shareClimberTarget?.title || 'Jalur Friends & Climbers Directory'}
        subtitle={
          shareClimberTarget?.subtitle ||
          'Connect with climbers, friends, clubs, and belay partners across Indonesia'
        }
        shareUrl={shareClimberTarget?.url || '/friends'}
        categoryLabel={shareClimberTarget ? 'Share Friend' : 'Share Friends Page'}
      />
    </div>
  )
}
