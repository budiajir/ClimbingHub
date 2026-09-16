'use client'

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
          <h1 className={`font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}>
            Community
          </h1>
          <p className={`text-xs md:text-sm font-light mt-1.5 ${
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
