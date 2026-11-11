'use client'

import { useState } from 'react'
import {
  Lock,
  Trophy,
  ShoppingBag,
  Clock,
  Calendar,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import type { Gym } from '@/lib/mock-data'
import SlotPicker, { type BookingData } from '@/components/gym/SlotPicker'

interface GymV2RoadmapPanelProps {
  gym: Gym
  onBook?: (booking: BookingData) => void
}

const V2_FEATURES = [
  {
    id: 'challenge',
    title: 'Gym Challenge & XP Beta',
    description:
      'Active gym problems at this wall. Log climbs and upload beta videos to collect Jalur XP.',
    badge: 'Coming in V2.0',
    icon: Trophy,
  },
  {
    id: 'booking-session',
    title: 'Booking Session',
    description: 'Daily Pass / Happy Hour / After Hour slot reservations.',
    note: 'Pricing may differ due to management policy',
    badge: 'Coming in V2.0',
    icon: Clock,
  },
  {
    id: 'booking-date',
    title: 'Booking Date',
    description: 'Weekday / Weekend climbing schedule selector.',
    note: 'Pricing may differ due to management policy',
    badge: 'Coming in V2.0',
    icon: Calendar,
  },
  {
    id: 'rent-gear',
    title: 'Rent Gear',
    description: 'Reserve rental Shoes, Chalk Bag, or Coach support on-site.',
    badge: 'Coming in V2.0',
    icon: ShoppingBag,
  },
  {
    id: 'membership',
    title: 'Join Membership',
    description: 'Monthly & annual gym membership registration directly via Jalur.',
    badge: 'Coming in V2.0',
    icon: BadgeCheck,
  },
]

export default function GymV2RoadmapPanel({ gym, onBook }: GymV2RoadmapPanelProps) {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const [showPrototype, setShowPrototype] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
            <Lock size={10} /> V2.0 Roadmap
          </span>
          <h3 className={`font-bold text-lg mt-2 ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
            Booking, Gear & Gym Challenge
          </h3>
          <p className={`text-xs ${isSandstone ? 'text-[#524e48]' : 'text-white/60'}`}>
            You can currently explore gym details, location, photos, wishlists, and ratings. Interactive booking, gear rental, challenges, and memberships launch in V2.0.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {V2_FEATURES.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border opacity-90 ${
                isSandstone
                  ? 'bg-[#FAF6EF] border-[#E0D6C6]'
                  : 'bg-[#1a1d22] border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSandstone ? 'bg-white border border-[#E0D6C6]' : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <Icon size={14} className="text-[#FF6B00]" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isSandstone ? 'text-[#1a1815]' : 'text-white'}`}>
                      {item.title}
                    </p>
                    <p className={`text-[11px] leading-snug mt-0.5 ${isSandstone ? 'text-[#524e48]' : 'text-white/60'}`}>
                      {item.description}
                    </p>
                    {item.note && (
                      <p className="text-[10px] font-medium text-amber-500 mt-1">
                        * {item.note}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSandstone
                      ? 'bg-white border-[#DDD3C4] text-[#7a746c]'
                      : 'bg-white/5 border-white/15 text-white/60'
                  }`}
                >
                  {item.badge}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Collapsible Prototype Preview */}
      <div className={`pt-2 border-t ${isSandstone ? 'border-[#E0D6C6]' : 'border-white/10'}`}>
        <button
          type="button"
          onClick={() => setShowPrototype((prev) => !prev)}
          className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors ${
            isSandstone
              ? 'bg-[#F5EFE6] border-[#DDD3C4] text-[#1a1815] hover:border-[#FF6B00]'
              : 'bg-white/5 border-white/10 text-white/80 hover:border-white/25'
          }`}
        >
          <span>Preview V2.0 Booking & Gear Prototype</span>
          {showPrototype ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showPrototype && (
          <div className="mt-4">
            <SlotPicker gym={gym} onBook={onBook || (() => {})} />
          </div>
        )}
      </div>
    </div>
  )
}
