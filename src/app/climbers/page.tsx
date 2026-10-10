'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  MapPin,
  Mountain,
  Award,
  Compass,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

interface ClimberProfile {
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

const CLIMBERS_DATA: ClimberProfile[] = [
  {
    id: 'climber-1',
    name: 'Budi Prasetyo',
    handle: '@budiclimb',
    hometown: 'Bandung, Jawa Barat',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    preferredGrade: '6c (5.11a)',
    discipline: 'Sport Climbing',
    problemsSent: 53,
    cragsVisited: 8,
    gymsVisited: 7,
    friendsCount: 49,
    bio: 'Living in Bali, climbing Songan Kintamani and training at local gyms.',
  },
]

export default function ClimbersPage() {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'thumbnail' | 'list'>('thumbnail')
  const [connectedFriends, setConnectedFriends] = useState<Record<string, boolean>>({
    'climber-1': true,
  })

  const toggleConnect = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setConnectedFriends(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const filteredClimbers = CLIMBERS_DATA.filter(c => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.hometown.toLowerCase().includes(q) ||
      c.preferredGrade.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-7xl mx-auto p-4 md:px-6 lg:px-8 space-y-6">
      {/* 1-Step Back Navigation Header */}
      <div className="flex items-center justify-between gap-3 py-2 border-b border-black/10 dark:border-white/10">
        <Link
          href="/community"
          className={`flex items-center gap-1.5 py-1 -ml-1 group text-left transition-opacity hover:opacity-75 active:opacity-60 min-w-0 ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}
        >
          <ChevronLeft size={20} className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm sm:text-base font-light tracking-wide truncate">
            Back to Community
          </span>
        </Link>
      </div>

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-chalk">
            Climber
          </h1>
          <p className="text-xs md:text-sm font-light text-slate-ash mt-1">
            Discover climbers, connect with partners, and preview personal profiles
          </p>
        </div>

        {/* View Mode Switcher: Thumbnail vs List */}
        <div className="flex items-center gap-1 bg-black/30 dark:bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('thumbnail')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'thumbnail'
                ? 'bg-[#FF6B00] text-white shadow-sm'
                : 'opacity-60 hover:opacity-100 text-chalk'
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
                : 'opacity-60 hover:opacity-100 text-chalk'
            }`}
            title="List View"
          >
            <ListIcon size={16} />
          </button>
        </div>
      </div>

      {/* Discover Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Discover climbers by name, handle, city, or grade..."
          className="w-full px-5 py-2.5 rounded-full border border-white/10 bg-[#1a1f24] text-xs sm:text-sm text-chalk placeholder:text-white/40 outline-none focus:border-[#FF6B00] transition-colors"
        />
      </div>

      {/* RENDER CLIMBERS LIST / THUMBNAILS */}
      {viewMode === 'thumbnail' ? (
        /* Thumbnail View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClimbers.map(c => {
            const isConnected = !!connectedFriends[c.id]
            return (
              <div
                key={c.id}
                className="rounded-3xl border border-white/10 bg-[#1a1f24] p-5 flex flex-col justify-between hover:border-[#FF6B00]/40 transition-all shadow-md group relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top Profile Header */}
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/account?user=${c.id}`}
                      className="flex items-center gap-3.5 group/user min-w-0"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 group-hover/user:border-[#FF6B00] transition-all shrink-0">
                        <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-chalk group-hover/user:text-[#FF6B00] transition-colors truncate">
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
                    <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 font-mono font-bold text-xs text-[#FF6B00] shrink-0">
                      {c.preferredGrade}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs opacity-75 font-light line-clamp-2 leading-relaxed">
                    {c.bio}
                  </p>

                  {/* Experience Stats Preview */}
                  <div className="grid grid-cols-4 gap-1.5 py-2.5 px-3 rounded-2xl bg-black/30 border border-white/5 text-center">
                    <div>
                      <div className="font-mono font-bold text-xs text-chalk">{c.problemsSent}</div>
                      <div className="text-[9px] opacity-60 uppercase">Sent</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs text-chalk">{c.cragsVisited}</div>
                      <div className="text-[9px] opacity-60 uppercase">Crags</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs text-chalk">{c.gymsVisited}</div>
                      <div className="text-[9px] opacity-60 uppercase">Gyms</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs text-[#FF6B00]">{c.friendsCount}</div>
                      <div className="text-[9px] opacity-60 uppercase">Friends</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: View Profile & Connect Friend Button */}
                <div className="pt-4 mt-3 border-t border-white/10 flex items-center gap-2">
                  <Link
                    href={`/account?user=${c.id}`}
                    className="flex-1 py-2 px-3 rounded-xl border border-white/10 hover:border-white/30 text-xs text-chalk font-bold text-center transition-all"
                  >
                    View Account
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => toggleConnect(c.id, e)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      isConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
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
                        <span>Connect Friend</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredClimbers.map(c => {
            const isConnected = !!connectedFriends[c.id]
            return (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl border border-white/10 bg-[#1a1f24] flex items-center justify-between gap-3 hover:border-[#FF6B00]/40 transition-all group"
              >
                <Link
                  href={`/account?user=${c.id}`}
                  className="flex items-center gap-3.5 min-w-0 flex-1"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 group-hover:border-[#FF6B00] transition-all shrink-0">
                    <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-chalk group-hover:text-[#FF6B00] transition-colors truncate">
                        {c.name}
                      </h3>
                      <span className="text-xs opacity-60 font-light truncate">{c.handle}</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/5 border border-white/10 text-[#FF6B00]">
                        {c.preferredGrade}
                      </span>
                    </div>
                    <div className="text-[11px] opacity-60 font-light mt-0.5 truncate">
                      {c.hometown} · {c.problemsSent} Sent · {c.cragsVisited} Crags
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/account?user=${c.id}`}
                    className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-chalk hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all"
                  >
                    Profile
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => toggleConnect(c.id, e)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
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
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
