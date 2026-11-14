import type { Gym } from './mock-data'

export interface GymLogoMeta {
  initials: string
  bgClass: string
  accentHex: string
  tagline: string
}

export type GymPhotoCategory = 'suasana' | 'fasilitas' | 'pintu_masuk' | 'area_tunggu'

export interface GymCategorizedPhoto {
  id: string
  category: GymPhotoCategory
  categoryLabel: string
  url: string
  caption: string
}

export interface GymUserRating {
  gymId: string
  rating: number
  comment?: string
  ratedAt: string
}

const GYM_RATINGS_STORAGE_KEY = 'jalur_gym_ratings_v1'

const LOGO_PALETTES = [
  { bgClass: 'from-[#FF6B00] to-[#B84700]', accentHex: '#FF6B00' },
  { bgClass: 'from-[#0D9488] to-[#065F46]', accentHex: '#0D9488' },
  { bgClass: 'from-[#4F46E5] to-[#312E81]', accentHex: '#6366F1' },
  { bgClass: 'from-[#D97706] to-[#92400E]', accentHex: '#F59E0B' },
  { bgClass: 'from-[#E11D48] to-[#881337]', accentHex: '#FB7185' },
]

export function getGymLogoMeta(gym: Gym): GymLogoMeta {
  const words = gym.name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : gym.name.slice(0, 2).toUpperCase()

  const hash = gym.id
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const palette = LOGO_PALETTES[hash % LOGO_PALETTES.length]

  return {
    initials,
    bgClass: palette.bgClass,
    accentHex: palette.accentHex,
    tagline: `${gym.city} Indoor Gym`,
  }
}

export const GYM_PHOTO_CATEGORY_LABELS: Record<GymPhotoCategory, string> = {
  suasana: 'Suasana & Wall',
  fasilitas: 'Fasilitas',
  pintu_masuk: 'Pintu Masuk',
  area_tunggu: 'Area Tunggu',
}

export function getGymCategorizedPhotos(gym: Gym): GymCategorizedPhoto[] {
  const gallery = [
    gym.image,
    ...(gym.images || []),
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1000&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&q=80',
    'https://images.unsplash.com/photo-1507034589621-94e11a1903d2?w=1000&q=80',
  ].filter(Boolean)

  return [
    {
      id: `${gym.id}-suasana`,
      category: 'suasana',
      categoryLabel: GYM_PHOTO_CATEGORY_LABELS.suasana,
      url: gallery[0],
      caption: `Suasana dinding pemanjatan & boulder sector utama di ${gym.name}.`,
    },
    {
      id: `${gym.id}-fasilitas`,
      category: 'fasilitas',
      categoryLabel: GYM_PHOTO_CATEGORY_LABELS.fasilitas,
      url: gallery[1] || gallery[0],
      caption: `Fasilitas latihan: ${gym.facilities.slice(0, 3).join(', ')}.`,
    },
    {
      id: `${gym.id}-pintu-masuk`,
      category: 'pintu_masuk',
      categoryLabel: GYM_PHOTO_CATEGORY_LABELS.pintu_masuk,
      url: gallery[2] || gallery[0],
      caption: `Akses pintu masuk utama & meja check-in di ${gym.city}.`,
    },
    {
      id: `${gym.id}-area-tunggu`,
      category: 'area_tunggu',
      categoryLabel: GYM_PHOTO_CATEGORY_LABELS.area_tunggu,
      url: gallery[3] || gallery[0],
      caption: 'Area tunggu, locker room, dan ruang istirahat climber.',
    },
  ]
}

export function getGymGoogleMapsUrl(gym: Gym): string {
  if (gym.gmapsUrl) return gym.gmapsUrl
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${gym.name}, ${gym.address}, ${gym.city}`)}`
}

export function getGymAppleMapsUrl(gym: Gym): string {
  return `https://maps.apple.com/?q=${encodeURIComponent(`${gym.name}, ${gym.address}, ${gym.city}`)}`
}

function getStoredRatings(): Record<string, GymUserRating> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(GYM_RATINGS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function getGymUserRating(gymId: string): GymUserRating | null {
  const all = getStoredRatings()
  return all[gymId] || null
}

export function saveGymUserRating(gymId: string, rating: number, comment?: string): GymUserRating {
  const clamped = Math.max(1, Math.min(5, Math.round(rating)))
  const record: GymUserRating = {
    gymId,
    rating: clamped,
    comment: comment?.trim() || undefined,
    ratedAt: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    const all = getStoredRatings()
    try {
      localStorage.setItem(GYM_RATINGS_STORAGE_KEY, JSON.stringify({ ...all, [gymId]: record }))
      window.dispatchEvent(new CustomEvent('gym-rating-updated'))
    } catch {
      // ignore storage errors
    }
  }

  return record
}

export function getGymEffectiveRating(gym: Gym): {
  rating: number
  reviewCount: number
  userRated: number | null
} {
  const userRating = getGymUserRating(gym.id)
  if (!userRating) {
    return { rating: gym.rating, reviewCount: gym.reviewCount, userRated: null }
  }
  const combined = ((gym.rating * gym.reviewCount) + userRating.rating) / (gym.reviewCount + 1)
  return {
    rating: Number(combined.toFixed(1)),
    reviewCount: gym.reviewCount + 1,
    userRated: userRating.rating,
  }
}
