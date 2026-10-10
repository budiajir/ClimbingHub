'use client'

export interface WishlistItem {
  id: string
  type: 'crag' | 'problem' | 'gym' | 'community'
  title: string
  subtitle?: string
  image?: string
  grade?: string
  location?: string
  discipline?: string
  savedAt?: string
}

const DEFAULT_WISHLIST: WishlistItem[] = [
  {
    id: 'citatah',
    type: 'crag',
    title: 'Citatah 125 & 90',
    subtitle: 'West Java · Karst Limestone',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    location: 'Padalarang, Bandung Barat',
    savedAt: '2026-03-10',
  },
  {
    id: 'harau',
    type: 'crag',
    title: 'Harau Valley',
    subtitle: 'West Sumatra · Granite Megaliths',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    location: 'Lima Puluh Kota, Sumatera Barat',
    savedAt: '2026-03-12',
  },
  {
    id: 'p-1',
    type: 'problem',
    title: 'Gugusan Bintang',
    subtitle: 'Citatah 90 (A)',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    grade: '5.12 B',
    location: 'Bandung Barat, Jawa Barat',
    savedAt: '2026-03-15',
  },
  {
    id: 'gym-boulder-indoors',
    type: 'gym',
    title: 'IndoClimb FX Sudirman',
    subtitle: 'Jakarta Pusat · Full Bouldering & Lead',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    location: 'Jakarta Pusat, DKI Jakarta',
    savedAt: '2026-03-18',
  },
]

const STORAGE_KEY = 'jalur_wishlist_items'

export function getWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return DEFAULT_WISHLIST
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WISHLIST))
      return DEFAULT_WISHLIST
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_WISHLIST
  }
}

export function isInWishlist(id: string): boolean {
  const list = getWishlist()
  return list.some((item) => item.id.toLowerCase() === id.toLowerCase())
}

export function addToWishlist(item: WishlistItem): void {
  if (typeof window === 'undefined') return
  const list = getWishlist()
  if (list.some((i) => i.id.toLowerCase() === item.id.toLowerCase())) return
  const next = [item, ...list]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: next }))
}

export function removeFromWishlist(id: string): void {
  if (typeof window === 'undefined') return
  const list = getWishlist()
  const next = list.filter((i) => i.id.toLowerCase() !== id.toLowerCase())
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: next }))
}

export function toggleWishlist(item: WishlistItem): boolean {
  if (isInWishlist(item.id)) {
    removeFromWishlist(item.id)
    return false
  } else {
    addToWishlist(item)
    return true
  }
}
