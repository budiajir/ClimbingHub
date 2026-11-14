'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  Compass,
  MessageCircle,
  Heart,
  Share2,
  MapPin,
  ChevronRight,
  UserPlus,
  Send,
  Plus,
  Check,
  MessageSquare,
} from 'lucide-react'
import CommunityDirectory from '@/components/community/CommunityDirectory'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'
import CreatePostModal from '@/components/community/CreatePostModal'
import InviteFriendModal from '@/components/community/InviteFriendModal'
import CommunityChatPanel from '@/components/community/CommunityChatPanel'
import ShareLinkModal from '@/components/common/ShareLinkModal'
import {
  getCommunityPosts,
  togglePostLike,
  type CommunityPost,
  type CommunityAuthorType,
} from '@/lib/community-posts-store'
import {
  getConnectedFriends,
  toggleFriendConnection,
} from '@/lib/social-store'

const WALL_EXTRA_POSTS: CommunityPost[] = [
  {
    id: 'wall-squad-1',
    userId: 'squad-bandung-karst',
    userName: 'Bandung Karst Collective',
    userHandle: '@bandung.karst',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    hometown: 'Bandung, Jawa Barat',
    timeAgo: '45m ago',
    activity: 'Squad Meetup · Open Crag Day',
    location: 'Tebing Citatah 125',
    grade: '5.10a – 5.12b',
    caption:
      'Open Sunday crag session at Sektor Timur! Members and newcomers welcome — crash pads, stick clips, and shared rope beta available at the meeting point from 07:00 WIB.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&q=80',
    likes: 34,
    hasLiked: false,
    authorType: 'squad',
    comments: [{ user: 'dimas.crags', text: 'I will bring 2 extra crash pads!' }],
  },
  {
    id: 'wall-gym-1',
    userId: 'boulder-cave-jakarta',
    userName: 'Boulder Cave Kemang',
    userHandle: '@bouldercave.jkt',
    avatar: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=150&q=80',
    hometown: 'Jakarta Selatan',
    timeAgo: '3h ago',
    activity: 'Fresh Reset · 18 New Problems',
    location: 'Main Cave & Slab Wall',
    grade: 'V1 – V8',
    caption:
      'Our route setters just wrapped this week’s comp-style slab & roof reset! Swing by tonight for the community test session.',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1000&q=80',
    likes: 51,
    hasLiked: false,
    authorType: 'gym',
    comments: [{ user: 'raka.boulders', text: 'The pink V5 dual-tex slab looks wicked!' }],
  },
]

const REGISTERED_CLIMBERS = [
  {
    id: 'climber-1',
    name: 'Raka Pratama',
    handle: '@raka.boulders',
    city: 'Jakarta Selatan',
    grade: 'V6 / 5.12a',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80',
    status: 'Active',
  },
  {
    id: 'climber-2',
    name: 'Nadia Kusuma',
    handle: '@nadia.sends',
    city: 'Bandung',
    grade: 'V7 / 5.12c',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80',
    status: 'At Gym',
  },
  {
    id: 'climber-3',
    name: 'Dimas Wijaya',
    handle: '@dimas.crags',
    city: 'Yogyakarta',
    grade: 'V5 / 5.11c',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&q=80',
    status: 'At Crag',
  },
  {
    id: 'climber-4',
    name: 'Rani Wulandari',
    handle: '@rani.climbs',
    city: 'Surabaya',
    grade: 'V4 / 5.11a',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=180&q=80',
    status: 'Online',
  },
  {
    id: 'climber-5',
    name: 'Guntur Pratama',
    handle: '@guntur.mp',
    city: 'Padang / Harau',
    grade: 'V6 / 5.12b',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=80',
    status: 'Outdoor',
  },
  {
    id: 'climber-6',
    name: 'Siti Aisyah',
    handle: '@siti.boulder',
    city: 'Bali',
    grade: 'V6 / 5.11d',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=80',
    status: 'At Crag',
  },
]
import Pictogram from '@/components/common/Pictogram'

interface FriendPost {
  id: string
  userId: string
  userName: string
  userHandle: string
  avatar: string
  hometown: string
  timeAgo: string
  activity: string
  location: string
  grade?: string
  caption: string
  image: string
  likes: number
  hasLiked?: boolean
  comments: { user: string; text: string }[]
}

const INITIAL_FRIEND_POSTS: FriendPost[] = [
  {
    id: 'post-1',
    userId: 'climber-1',
    userName: 'Budi Prasetyo',
    userHandle: '@budiclimb',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    hometown: 'Bandung',
    timeAgo: '2 jam yang lalu',
    activity: 'Flash Send · Problem Gorejat',
    location: 'Harau Valley · Sarasah Bonta',
    grade: 'V7 (7A+)',
    caption: 'Akhirnya send juga project lama di Sarasah Bonta! Friction batu granit Harau hari ini lagi gokil banget pas sore hari.',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=900&q=80',
    likes: 38,
    comments: [
      { user: 'Dimas Anggara', text: 'Gokil mantap brother!! Beta undercling nya dapet akhirnya' },
      { user: 'Sarah Amalia', text: 'Keren banget mas Budi!' },
    ],
  },
  {
    id: 'post-2',
    userId: 'climber-2',
    userName: 'Sarah Amalia',
    userHandle: '@sarah.climbs',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    hometown: 'Jakarta',
    timeAgo: '5 jam yang lalu',
    activity: 'Session Training · Indoclimb FX Sudirman',
    location: 'Indoclimb FX Sudirman · Jakarta',
    caption: 'Sesi latihan malam bareng squad Boulder Bastards. Reset rute baru di overhang sector bikin pump banget!',
    image: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=900&q=80',
    likes: 45,
    comments: [
      { user: 'Rani Wijaya', text: 'Next week join lagi yaa sar!' },
    ],
  },
  {
    id: 'post-3',
    userId: 'climber-3',
    userName: 'Dimas Anggara',
    userHandle: '@dimas_boulder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    hometown: 'Yogyakarta',
    timeAgo: '1 hari yang lalu',
    activity: 'Outdoor Ascent · Tebing Siung Karst',
    location: 'Tebing Siung · Pantai Siung',
    grade: '6c (5.11a)',
    caption: 'Sesi sunset climbing di pinggir ombak Siung. Angin laut sejuk, anchor bersih dan view luar biasa.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    likes: 62,
    comments: [
      { user: 'Budi Prasetyo', text: 'Spot favorit jogja emang Siung!' },
    ],
  },
]

export default function CommunityPage() {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const { isAuthenticated, openAuthModal } = useAuth()

  const [activeTab, setActiveTab] = useState<'timeline' | 'chat' | 'clubs' | 'climbers'>('timeline')
  const [wallFilter, setWallFilter] = useState<'all' | CommunityAuthorType>('all')
  const [friendSearch, setFriendSearch] = useState('')
  const [storePosts, setStorePosts] = useState<CommunityPost[]>([])
  const [legacyPosts, setLegacyPosts] = useState<FriendPost[]>(INITIAL_FRIEND_POSTS)
  const [extraPosts, setExtraPosts] = useState<CommunityPost[]>(WALL_EXTRA_POSTS)
  const [connectedFriends, setConnectedFriends] = useState<string[]>([])
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [extraComments, setExtraComments] = useState<Record<string, { user: string; text: string }[]>>({})
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharePostTarget, setSharePostTarget] = useState<{
    title: string
    subtitle: string
    url: string
  } | null>(null)
  const [chatContactId, setChatContactId] = useState<string | null>(null)

  useEffect(() => {
    const syncCommunity = () => {
      setStorePosts(getCommunityPosts())
      setConnectedFriends(getConnectedFriends())
    }
    syncCommunity()
    window.addEventListener('community-posts-updated', syncCommunity)
    window.addEventListener('social-friends-updated', syncCommunity)

    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search)
      const tab = sp.get('tab')
      const contact = sp.get('chat') || sp.get('contact')
      if (contact) {
        setChatContactId(contact)
        setActiveTab('chat')
      } else if (tab === 'chat' || tab === 'clubs' || tab === 'climbers' || tab === 'timeline') {
        setActiveTab(tab)
      }
    }

    return () => {
      window.removeEventListener('community-posts-updated', syncCommunity)
      window.removeEventListener('social-friends-updated', syncCommunity)
    }
  }, [])

  const allWallPosts: CommunityPost[] = useMemo(() => {
    const merged: CommunityPost[] = [
      ...storePosts.map(p => ({ ...p, authorType: p.authorType || 'climber' })),
      ...extraPosts,
      ...legacyPosts.map(lp => ({ ...lp, authorType: 'member' as CommunityAuthorType })),
    ]
    const seen = new Set<string>()
    return merged.filter(item => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  }, [storePosts, extraPosts, legacyPosts])

  const handleToggleLike = (postId: string) => {
    if (!isAuthenticated) {
      openAuthModal('Silakan masuk atau buat akun untuk menyukai postingan.')
      return
    }
    if (storePosts.some(p => p.id === postId)) {
      togglePostLike(postId)
      return
    }
    if (extraPosts.some(p => p.id === postId)) {
      setExtraPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, hasLiked: !p.hasLiked, likes: p.hasLiked ? p.likes - 1 : p.likes + 1 }
            : p
        )
      )
      return
    }
    setLegacyPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p
        const hasLiked = p.hasLiked
        return {
          ...p,
          hasLiked: !hasLiked,
          likes: hasLiked ? p.likes - 1 : p.likes + 1,
        }
      })
    )
  }

  const handleAddComment = (postId: string) => {
    if (!isAuthenticated) {
      openAuthModal('Silakan masuk atau buat akun untuk menulis komentar.')
      return
    }
    const text = (commentInputs[postId] || '').trim()
    if (!text) return
    setExtraComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), { user: 'You', text }],
    }))
    setCommentInputs(prev => ({ ...prev, [postId]: '' }))
  }

  const filteredPosts = allWallPosts.filter(p => {
    const typeMatch = wallFilter === 'all' || (p.authorType || 'climber') === wallFilter
    if (!typeMatch) return false
    if (!friendSearch) return true
    const q = friendSearch.toLowerCase()
    return (
      p.userName.toLowerCase().includes(q) ||
      p.userHandle.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.caption.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-7xl mx-auto p-4 md:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div
        className={`flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b pb-4 ${
          isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
        }`}
      >
        <div>
          <h1
            className={`font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight ${
              isSandstone ? 'text-[#1a1815]' : 'text-chalk'
            }`}
          >
            Community
          </h1>
          <p
            className={`text-xs md:text-sm font-light mt-1.5 max-w-2xl ${
              isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
            }`}
          >
            Community Wall from climbers, squads &amp; clubs, gyms, and members — plus direct chat with friends, route setters &amp; trip guides.
          </p>
        </div>

        {/* Community Action CTAs */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal('Silakan masuk atau daftar akun untuk membuat postingan komunitas.')
                return
              }
              setShowCreatePost(true)
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E5601F] text-white font-bold text-xs shadow-lg transition-all"
          >
            <Plus size={15} /> Create Post
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal('Silakan masuk atau daftar akun untuk mengundang teman manjat.')
                return
              }
              setShowInviteModal(true)
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
              isSandstone
                ? 'border-[#1a1815]/25 text-[#1a1815] hover:border-[#FF6B00]'
                : 'border-white/15 text-chalk hover:border-[#FF6B00]'
            }`}
          >
            <UserPlus size={14} className="text-[#FF6B00]" /> Invite Friend
          </button>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
              isSandstone
                ? 'border-[#1a1815]/25 text-[#1a1815] hover:border-[#FF6B00]'
                : 'border-white/15 text-chalk hover:border-lime'
            }`}
          >
            <Share2 size={14} /> Share
          </button>

          <Link
            href="/climbers"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
              isSandstone
                ? 'bg-[#1a1815] border-[#1a1815] text-white'
                : 'bg-lime/15 border-lime/40 text-lime hover:bg-lime/25'
            }`}
          >
            <span>Climbers</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Tabs: Community Wall, Chat, Squads & Clubs, Climbers */}
      <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar border-b pb-2 ${
        isSandstone ? 'border-[#1a1815]/15' : 'border-white/10'
      }`}>
        {[
          { id: 'timeline', label: 'Community Wall', icon: Users },
          { id: 'chat', label: 'Chat (Friends, Setters & Guides)', icon: MessageSquare },
          { id: 'clubs', label: 'Squads & Clubs', icon: Compass },
          { id: 'climbers', label: 'Climbers Thumbnails', icon: UserPlus },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === 'chat' && !isAuthenticated) {
                  openAuthModal('Silakan masuk atau daftar akun untuk membuka ruang obrolan chat komunitas.')
                  return
                }
                setActiveTab(tab.id as typeof activeTab)
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                active
                  ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md'
                  : isSandstone
                  ? 'border-[#1a1815]/20 text-[#524e48] hover:text-[#1a1815] bg-transparent'
                  : 'border-white/10 text-chalk/70 hover:text-chalk bg-transparent'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: COMMUNITY WALL */}
      {activeTab === 'timeline' ? (
        <div className="space-y-6">
          {/* Quick Discover Climbers & Search */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs uppercase font-bold tracking-wider opacity-70">
                Registered Climbers &amp; Wall Activity
              </span>
              <Link href="/climbers" className="text-xs text-[#FF6B00] font-bold hover:underline">
                View Full Climbers Directory &rarr;
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Search Community Wall by climber, squad, gym, location, or caption..."
                className={`flex-1 px-5 py-2.5 rounded-full border text-xs sm:text-sm outline-none transition-colors ${
                  isSandstone
                    ? 'bg-white border-[#DDD3C4] text-[#1a1815] placeholder:text-[#7a746c] focus:border-[#FF6B00]'
                    : 'bg-[#1a1f24] border-white/10 text-chalk placeholder:text-white/40 focus:border-[#FF6B00]'
                }`}
              />
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {(
                  [
                    { id: 'all', label: 'All Feed' },
                    { id: 'climber', label: 'Climbers' },
                    { id: 'squad', label: 'Squads & Clubs' },
                    { id: 'gym', label: 'Gyms' },
                    { id: 'member', label: 'Members' },
                  ] as const
                ).map((wf) => (
                  <button
                    key={wf.id}
                    type="button"
                    onClick={() => setWallFilter(wf.id)}
                    className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                      wallFilter === wf.id
                        ? isSandstone
                          ? 'bg-[#1a1815] border-[#1a1815] text-white'
                          : 'bg-lime border-lime text-granite'
                        : isSandstone
                        ? 'bg-transparent border-[#DDD3C4] text-[#524e48]'
                        : 'bg-transparent border-white/10 text-white/65 hover:text-white'
                    }`}
                  >
                    {wf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Friend Avatars Thumbnail Strip */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
              {REGISTERED_CLIMBERS.map(f => {
                const isFriend = connectedFriends.includes(f.id)
                return (
                  <div
                    key={f.id}
                    className={`flex flex-col items-center gap-1.5 min-w-[92px] p-2.5 rounded-2xl border ${
                      isSandstone ? 'bg-[#FAF6EF] border-[#E0D6C6]' : 'bg-[#1a1f24] border-white/10'
                    }`}
                  >
                    <Link
                      href={`/account?user=${f.id}`}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 border-2 border-[#FF6B00] group-hover:scale-105 transition-transform">
                        <img src={f.avatar} alt={f.name} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <span className={`text-[11px] font-bold truncate max-w-[80px] ${
                        isSandstone ? 'text-[#1a1815]' : 'text-chalk group-hover:text-[#FF6B00]'
                      }`}>
                        {f.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-[#FF6B00] font-mono">{f.status}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          openAuthModal('Silakan masuk atau daftar akun untuk menambahkan teman manjat.')
                          return
                        }
                        toggleFriendConnection(f.id)
                      }}
                      className={`w-full py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                        isFriend
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                          : 'bg-[#FF6B00] text-white hover:bg-[#E5601F]'
                      }`}
                    >
                      {isFriend ? <Check size={10} /> : <UserPlus size={10} />}
                      <span>{isFriend ? 'Friend' : 'Add'}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Community Wall Feed */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {filteredPosts.map(post => {
              const sourceType = post.authorType || 'climber'
              const authorHref =
                sourceType === 'gym'
                  ? `/gyms/${post.userId}`
                  : sourceType === 'squad'
                  ? `/community/${post.userId}`
                  : `/account?user=${post.userId}`
              const isFriend = connectedFriends.includes(post.userId)
              const combinedComments = [...post.comments, ...(extraComments[post.id] || [])]

              return (
                <div
                  key={post.id}
                  className={`rounded-3xl border overflow-hidden shadow-lg space-y-3 ${
                    isSandstone
                      ? 'bg-[#FFFDF9] border-[#E0D6C6] text-[#1a1815]'
                      : 'bg-[#1a1f24] border-white/10 text-chalk'
                  }`}
                >
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between gap-2 flex-wrap">
                    <Link href={authorHref} className="flex items-center gap-3 group min-w-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-white/20 group-hover:ring-2 group-hover:ring-[#FF6B00] transition-all shrink-0">
                        <img src={post.avatar} alt={post.userName} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-sm group-hover:text-[#FF6B00] transition-colors ${
                            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
                          }`}>
                            {post.userName}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-[#FF6B00]">
                            {sourceType === 'squad'
                              ? 'Squad & Club'
                              : sourceType === 'gym'
                              ? 'Gym'
                              : sourceType === 'member'
                              ? 'Member'
                              : 'Climber'}
                          </span>
                        </div>
                        <div className="text-[10px] opacity-65 flex items-center gap-1 font-light">
                          <MapPin size={10} className="text-[#FF6B00]" />
                          <span>{post.hometown}</span>
                          <span>·</span>
                          <span>{post.timeAgo}</span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      {(sourceType === 'climber' || sourceType === 'member') && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAuthenticated) {
                              openAuthModal('Silakan masuk atau daftar akun untuk menambahkan teman manjat.')
                              return
                            }
                            toggleFriendConnection(post.userId)
                          }}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 transition-all ${
                            isFriend
                              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-500'
                              : 'border-[#FF6B00]/50 text-[#FF6B00] hover:bg-[#FF6B00]/10'
                          }`}
                        >
                          {isFriend ? <Check size={11} /> : <UserPlus size={11} />}
                          <span>{isFriend ? 'Friend' : 'Add Friend'}</span>
                        </button>
                      )}
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 inline-block">
                          {post.activity}
                        </span>
                        {post.grade && (
                          <span className="text-[10px] font-mono font-bold block opacity-75 mt-0.5">
                            {post.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post Media */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/50">
                    <img src={post.image} alt="Activity" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      <MapPin size={11} className="text-[#FF6B00]" />
                      <span>{post.location}</span>
                    </div>
                  </div>

                  {/* Post Body & Actions */}
                  <div className="p-4 pt-1 space-y-3">
                    <p className={`text-xs sm:text-sm leading-relaxed font-light ${
                      isSandstone ? 'text-[#524e48]' : 'text-chalk/90'
                    }`}>
                      {post.caption}
                    </p>

                    <div className={`flex items-center justify-between pt-2 border-t text-xs ${
                      isSandstone ? 'border-[#E0D6C6]' : 'border-white/10'
                    }`}>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                            post.hasLiked ? 'text-rose-400' : 'opacity-80 hover:text-rose-400'
                          }`}
                        >
                          <Heart size={16} className={post.hasLiked ? 'fill-rose-400' : ''} />
                          <span>{post.likes} Likes</span>
                        </button>

                        <div className="flex items-center gap-1.5 opacity-80 font-bold">
                          <MessageCircle size={16} />
                          <span>{combinedComments.length} Comments</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSharePostTarget({
                            title: `${post.userName} · ${post.activity}`,
                            subtitle: `${post.location}${post.grade ? ` · ${post.grade}` : ''}`,
                            url: '/community',
                          })
                        }
                        className="flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:underline"
                      >
                        <Share2 size={14} /> Share
                      </button>
                    </div>

                    {/* Comments */}
                    {combinedComments.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {combinedComments.map((c, i) => (
                          <div
                            key={i}
                            className={`text-xs p-2 rounded-xl ${
                              isSandstone ? 'bg-[#F5EFE6]' : 'bg-white/5'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{c.user}:</span>
                            <span className="opacity-80 font-light">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id)
                        }}
                        placeholder="Add a comment..."
                        className={`flex-1 px-3.5 py-2 rounded-xl border text-xs outline-none focus:border-[#FF6B00] ${
                          isSandstone
                            ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                            : 'bg-[#161a1e] border-white/10 text-chalk placeholder:text-white/40'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 rounded-xl bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all cursor-pointer"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : activeTab === 'chat' ? (
        /* TAB 2: DIRECT CHAT (Friends, Route Setters, Trip Guides) */
        <CommunityChatPanel initialContactId={chatContactId} />
      ) : activeTab === 'clubs' ? (
        /* TAB 3: SQUADS & CLUBS DIRECTORY */
        <CommunityDirectory />
      ) : (
        /* TAB 4: CLIMBERS THUMBNAILS */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className={`text-xs ${isSandstone ? 'text-[#524e48]' : 'text-white/65'}`}>
              Registered personal climber accounts across Indonesia — add friends, open their profile, or start a chat.
            </p>
            <Link
              href="/climbers"
              className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
            >
              Open Full Climbers &amp; List Mode <ChevronRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REGISTERED_CLIMBERS.map(c => {
              const isFriend = connectedFriends.includes(c.id)
              return (
                <div
                  key={c.id}
                  className={`rounded-2xl p-4 border flex flex-col justify-between gap-4 ${
                    isSandstone
                      ? 'bg-[#FFFDF9] border-[#E0D6C6] text-[#1a1815]'
                      : 'bg-[#23262C] border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Link href={`/account?user=${c.id}`} className="shrink-0">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#FF6B00]"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/account?user=${c.id}`} className="font-bold text-sm hover:underline block truncate">
                        {c.name}
                      </Link>
                      <p className="text-[11px] opacity-65 truncate">{c.handle} · {c.city}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00]">
                        {c.grade}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFriendConnection(c.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isFriend
                          ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-500'
                          : 'bg-[#FF6B00] text-white hover:bg-[#E5601F]'
                      }`}
                    >
                      {isFriend ? <Check size={13} /> : <UserPlus size={13} />}
                      <span>{isFriend ? 'Connected' : 'Add Friend'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChatContactId(c.id)
                        setActiveTab('chat')
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                        isSandstone ? 'border-[#DDD3C4] text-[#1a1815]' : 'border-white/15 text-white'
                      }`}
                    >
                      <MessageSquare size={13} /> Chat
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modals: Create Post, Invite Friend, Share Link */}
      <CreatePostModal open={showCreatePost} onClose={() => setShowCreatePost(false)} />
      <InviteFriendModal open={showInviteModal} onClose={() => setShowInviteModal(false)} />
      <ShareLinkModal
        open={showShareModal || !!sharePostTarget}
        onClose={() => {
          setShowShareModal(false)
          setSharePostTarget(null)
        }}
        title={sharePostTarget?.title || 'Jalur Climbing Community'}
        subtitle={sharePostTarget?.subtitle || 'Community Wall, Squads & Clubs, Climbers & Chat'}
        shareUrl={sharePostTarget?.url || '/community'}
        categoryLabel="Share Community"
      />
    </div>
  )
}
