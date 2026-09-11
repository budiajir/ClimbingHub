'use client'

import { Sparkles } from 'lucide-react'
import CommunityDirectory from '@/components/community/CommunityDirectory'
import { useTheme } from '@/lib/theme-context'

export default function CommunityPage() {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'

  return (
    <div className="max-w-7xl mx-auto p-4 md:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
        isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
      }`}>
        <div>
          <h1 className={`font-bold text-xl md:text-3xl flex items-center gap-2 ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}>
            Climbing Communities & Squads <Sparkles size={24} className={isSandstone ? 'text-[#1a1815]' : 'text-lime'} />
          </h1>
          <p className={`text-xs md:text-sm font-light ${
            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
          }`}>
            Official directory of local bouldering squads and climbing clubs across Indonesia
          </p>
        </div>
      </div>

      {/* Main Squad Directory */}
      <CommunityDirectory />
    </div>
  )
}
