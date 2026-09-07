'use client'

import { Sparkles, Users } from 'lucide-react'
import CommunityDirectory from '@/components/community/CommunityDirectory'

export default function CommunityPage() {
  return (
    <div className="max-w-7xl mx-auto py-4 md:py-6 md:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-chalk font-bold text-xl md:text-3xl flex items-center gap-2">
            Climbing Communities & Squads <Sparkles size={22} className="text-lime" />
          </h1>
          <p className="text-slate-ash text-xs md:text-sm font-light mt-1">
            Direktori resmi boulder squad lokal dan komunitas panjat tebing di Indonesia
          </p>
        </div>
      </div>

      {/* Main Squad Directory */}
      <CommunityDirectory />
    </div>
  )
}
