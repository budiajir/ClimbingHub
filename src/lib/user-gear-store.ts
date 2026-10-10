'use client'

export interface UserGearItem {
  id: string
  name: string
  brand: string
  category: 'shoes' | 'harness' | 'chalk' | 'crashpad' | 'belay' | 'helmet' | 'carabiner' | 'other'
  categoryLabel: string
  imageUrl: string
  purchaseYear?: string
  condition?: string
}

const DEFAULT_GEARS: UserGearItem[] = [
  {
    id: 'gear-1',
    name: 'Solution Comp',
    brand: 'La Sportiva',
    category: 'shoes',
    categoryLabel: 'Climbing Shoes',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    purchaseYear: '2025',
    condition: 'Excellent · Resoled Once',
  },
  {
    id: 'gear-2',
    name: 'Mondo Crash Pad',
    brand: 'Black Diamond',
    category: 'crashpad',
    categoryLabel: 'Crash Pad',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&q=80',
    purchaseYear: '2024',
    condition: 'Good Landing Foam',
  },
  {
    id: 'gear-3',
    name: 'GriGri +',
    brand: 'Petzl',
    category: 'belay',
    categoryLabel: 'Belay Device',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&q=80',
    purchaseYear: '2025',
    condition: 'Smooth Camming Action',
  },
  {
    id: 'gear-4',
    name: 'Sirocco Helmet',
    brand: 'Petzl',
    category: 'helmet',
    categoryLabel: 'Climbing Helmet',
    imageUrl: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600&q=80',
    purchaseYear: '2026',
    condition: 'Mint · Ultralight EPP',
  },
  {
    id: 'gear-5',
    name: 'Mojo Zip Chalk Bag',
    brand: 'Black Diamond',
    category: 'chalk',
    categoryLabel: 'Chalk Bag',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
    purchaseYear: '2024',
    condition: 'Classic Chalk Pot',
  },
]

const STORAGE_KEY = 'jalur_user_gears'

export function getUserGears(): UserGearItem[] {
  if (typeof window === 'undefined') return DEFAULT_GEARS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GEARS))
      return DEFAULT_GEARS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_GEARS
  }
}

export function addUserGear(gear: UserGearItem): void {
  if (typeof window === 'undefined') return
  const current = getUserGears()
  const next = [gear, ...current]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('user-gear-updated', { detail: next }))
}

export function deleteUserGear(id: string): void {
  if (typeof window === 'undefined') return
  const current = getUserGears()
  const next = current.filter((g) => g.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('user-gear-updated', { detail: next }))
}
