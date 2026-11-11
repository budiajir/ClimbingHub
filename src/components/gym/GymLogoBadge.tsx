'use client'

import type { Gym } from '@/lib/mock-data'
import { getGymLogoMeta } from '@/lib/gym-helpers'

interface GymLogoBadgeProps {
  gym: Gym
  size?: 'sm' | 'md' | 'lg'
}

export default function GymLogoBadge({ gym, size = 'md' }: GymLogoBadgeProps) {
  const meta = getGymLogoMeta(gym)

  const sizeClass =
    size === 'sm'
      ? 'w-9 h-9 text-xs rounded-xl'
      : size === 'lg'
      ? 'w-14 h-14 text-lg rounded-2xl'
      : 'w-11 h-11 text-sm rounded-xl'

  if (gym.logo) {
    return (
      <div
        className={`${sizeClass} overflow-hidden shrink-0 border border-white/20 shadow-md bg-white`}
      >
        <img src={gym.logo} alt={`${gym.name} Logo`} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClass} shrink-0 bg-gradient-to-br ${meta.bgClass} text-white font-black tracking-tight flex items-center justify-center shadow-md border border-white/20 relative overflow-hidden`}
      title={`${gym.name} Logo`}
    >
      <span className="relative z-10">{meta.initials}</span>
      <span
        className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-white/15"
        aria-hidden="true"
      />
    </div>
  )
}
