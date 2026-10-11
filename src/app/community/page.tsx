'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  Compass,
  MessageCircle,
  Heart,
  Share2,
  MapPin,
  Award,
  Sparkles,
  ChevronRight,
  UserPlus,
  Send,
  Camera,
} from 'lucide-react'
import CommunityDirectory from '@/components/community/CommunityDirectory'
import { useTheme } from '@/lib/theme-context'
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
      { user: 'Dimas Anggara', text: 'Gokil mantap brother!! Beta undercling nya dapet akhirnya 🔥' },
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

  const [activeTab, setActiveTab] = useState<'timeline' | 'clubs'>('timeline')
  const [friendSearch, setFriendSearch] = useState('')
  const [posts, setPosts] = useState<FriendPost[]>(INITIAL_FRIEND_POSTS)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  const handleToggleLike = (postId: string) => {
    setPosts(prev =>
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
    const text = (commentInputs[postId] || '').trim()
    if (!text) return

    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p
        return {
          ...p,
          comments: [...p.comments, { user: 'You', text }],
        }
      })
    )
    setCommentInputs(prev => ({ ...prev, [postId]: '' }))
  }

  const filteredPosts = posts.filter(p => {
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
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
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
            className={`text-xs md:text-sm font-light mt-1.5 ${
              isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
            }`}
          >
            Friends activity timeline, climber profiles, and local bouldering squads across Indonesia
          </p>
        </div>

        {/* Link to Climbers Page Module */}
        <Link
          href="/climbers"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold text-xs shadow-lg transition-all shrink-0"
        >
          <UserPlus size={16} />
          <span>Discover Climbers</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Tabs: Friends Timeline vs Squads & Clubs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
            activeTab === 'timeline'
              ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md'
              : 'border-white/10 text-chalk/70 hover:text-chalk bg-transparent'
          }`}
        >
          <Users size={15} />
          <span>Friends Timeline</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('clubs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
            activeTab === 'clubs'
              ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md'
              : 'border-white/10 text-chalk/70 hover:text-chalk bg-transparent'
          }`}
        >
          <Compass size={15} />
          <span>Squads & Clubs Directory</span>
        </button>
      </div>

      {/* TAB 1: FRIENDS TIMELINE */}
      {activeTab === 'timeline' ? (
        <div className="space-y-6">
          {/* Quick Discover & Search Friends */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs uppercase font-bold tracking-wider opacity-70">
                Temukan & Cari Akun Friend
              </span>
              <Link href="/climbers" className="text-xs text-[#FF6B00] font-bold hover:underline">
                Lihat Semua Climbers &rarr;
              </Link>
            </div>

            {/* Discover Search Input */}
            <div className="relative">
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Discover friends by name, handle, or location..."
                className="w-full px-5 py-2.5 rounded-full border border-white/10 bg-[#1a1f24] text-xs sm:text-sm text-chalk placeholder:text-white/40 outline-none focus:border-[#FF6B00] transition-colors"
              />
            </div>

            {/* Quick Friend Avatars Row (Clicking opens /account?user=[id]) */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
              {[
                { id: 'climber-1', name: 'Budi P.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', status: 'Active' },
                { id: 'climber-2', name: 'Sarah A.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', status: 'At Gym' },
                { id: 'climber-3', name: 'Dimas A.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', status: 'At Crag' },
                { id: 'climber-4', name: 'Rani W.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', status: 'Online' },
                { id: 'climber-5', name: 'Guntur P.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', status: 'Outdoor' },
              ].map(f => (
                <Link
                  key={f.id}
                  href={`/account?user=${f.id}`}
                  className="flex flex-col items-center gap-1 min-w-[70px] group cursor-pointer"
                >
                  <div className="w-13 h-13 rounded-full overflow-hidden p-0.5 border-2 border-[#FF6B00] group-hover:scale-105 transition-transform">
                    <img src={f.avatar} alt={f.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <span className="text-[11px] font-bold text-chalk group-hover:text-[#FF6B00] transition-colors truncate max-w-[70px]">
                    {f.name}
                  </span>
                  <span className="text-[9px] text-[#FF6B00] font-mono">{f.status}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                className="rounded-3xl border border-white/10 bg-[#1a1f24] overflow-hidden shadow-lg space-y-3"
              >
                {/* Post Header: Clicking Friend opens Personal Account */}
                <div className="p-4 flex items-center justify-between">
                  <Link
                    href={`/account?user=${post.userId}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-white/20 group-hover:ring-2 group-hover:ring-[#FF6B00] transition-all">
                      <img src={post.avatar} alt={post.userName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-chalk group-hover:text-[#FF6B00] transition-colors">
                          {post.userName}
                        </span>
                        <span className="text-[11px] opacity-60 font-light">{post.userHandle}</span>
                      </div>
                      <div className="text-[10px] opacity-60 flex items-center gap-1 font-light">
                        <MapPin size={10} className="text-[#FF6B00]" />
                        <span>{post.hometown}</span>
                        <span>·</span>
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Activity Badge */}
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 inline-block">
                      {post.activity}
                    </span>
                    {post.grade && (
                      <span className="text-[10px] font-mono font-bold block text-white/80 mt-0.5">
                        {post.grade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Post Media (Full-width photo) */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/50">
                  <img src={post.image} alt="Activity" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <MapPin size={11} className="text-[#FF6B00]" />
                    <span>{post.location}</span>
                  </div>
                </div>

                {/* Post Body: Caption & Actions */}
                <div className="p-4 pt-1 space-y-3">
                  <p className="text-xs sm:text-sm leading-relaxed text-chalk/90 font-light">
                    {post.caption}
                  </p>

                  {/* Actions: Likes, Comments */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                        post.hasLiked ? 'text-rose-400' : 'text-chalk/80 hover:text-rose-400'
                      }`}
                    >
                      <Heart size={16} className={post.hasLiked ? 'fill-rose-400' : ''} />
                      <span>{post.likes} Likes</span>
                    </button>

                    <div className="flex items-center gap-1.5 opacity-80 font-bold">
                      <MessageCircle size={16} />
                      <span>{post.comments.length} Comments</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-1.5 pt-1">
                    {post.comments.map((c, i) => (
                      <div key={i} className="text-xs bg-white/5 p-2 rounded-xl">
                        <span className="font-bold text-white mr-1.5">{c.user}:</span>
                        <span className="opacity-80 font-light">{c.text}</span>
                      </div>
                    ))}
                  </div>

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
                      placeholder="Add a comment for friend..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-white/10 bg-[#161a1e] text-xs text-chalk placeholder:text-white/40 outline-none focus:border-[#FF6B00]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComment(post.id)}
                      className="p-2 rounded-xl bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 transition-all cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* TAB 2: SQUADS & CLUBS DIRECTORY */
        <CommunityDirectory />
      )}
    </div>
  )
}
