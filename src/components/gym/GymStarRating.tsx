'use client'

import { Star } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

interface GymStarRatingProps {
  rating: number
  reviewCount?: number
  interactive?: boolean
  userRating?: number | null
  onRate?: (stars: number) => void
  size?: number
}

export default function GymStarRating({
  rating,
  reviewCount,
  interactive = false,
  userRating = null,
  onRate,
  size = 14,
}: GymStarRatingProps) {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const activeScore = interactive && userRating ? userRating : Math.round(rating)

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= activeScore
          if (interactive && onRate) {
            return (
              <button
                key={star}
                type="button"
                onClick={() => onRate(star)}
                className="p-0.5 hover:scale-110 transition-transform"
                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  size={size}
                  className={
                    filled
                      ? 'text-amber-400 fill-amber-400'
                      : isSandstone
                      ? 'text-[#C6BEB1]'
                      : 'text-white/25'
                  }
                />
              </button>
            )
          }
          return (
            <Star
              key={star}
              size={size}
              className={
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : isSandstone
                  ? 'text-[#C6BEB1]'
                  : 'text-white/25'
              }
            />
          )
        })}
      </div>
      <span className={`text-xs font-bold ${isSandstone ? 'text-[#1a1815]' : 'text-chalk'}`}>
        {rating.toFixed(1)}
      </span>
      {typeof reviewCount === 'number' && (
        <span className={`text-[11px] ${isSandstone ? 'text-[#7a746c]' : 'text-white/55'}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  )
}
