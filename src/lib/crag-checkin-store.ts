'use client'

export interface CragCheckIn {
  cragId: string
  cragName: string
  userId: string
  userName: string
  userAvatar?: string
  checkInTime: string
  date: string
}

const STORAGE_KEY = 'jalur_crag_checkins_v1'

const DEFAULT_CHECKINS: Record<string, number> = {
  citatah: 18,
  harau: 14,
  siung: 9,
  parang: 12,
  kelapa: 6,
}

export function getCragCheckInCount(cragId: string): number {
  if (typeof window === 'undefined') return DEFAULT_CHECKINS[cragId] || 8
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_count_${cragId}`)
    if (raw) return parseInt(raw, 10)
    return DEFAULT_CHECKINS[cragId] || 8
  } catch {
    return DEFAULT_CHECKINS[cragId] || 8
  }
}

export function isUserCheckedInAtCrag(cragId: string, userId: string = 'user-1'): boolean {
  if (typeof window === 'undefined') return false
  try {
    const today = new Date().toISOString().split('T')[0]
    const raw = localStorage.getItem(`${STORAGE_KEY}_active_${userId}`)
    if (!raw) return false
    const parsed: CragCheckIn = JSON.parse(raw)
    return parsed.cragId === cragId && parsed.date === today
  } catch {
    return false
  }
}

export function checkInUserAtCrag(cragId: string, cragName: string, userId: string = 'user-1', userName: string = 'Ahmad Rizki Nugraha'): CragCheckIn {
  const today = new Date().toISOString().split('T')[0]
  const checkIn: CragCheckIn = {
    cragId,
    cragName,
    userId,
    userName,
    checkInTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    date: today,
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`${STORAGE_KEY}_active_${userId}`, JSON.stringify(checkIn))
    const currentCount = getCragCheckInCount(cragId)
    localStorage.setItem(`${STORAGE_KEY}_count_${cragId}`, String(currentCount + 1))
    window.dispatchEvent(new CustomEvent('crag-checkin-updated', { detail: { cragId, isCheckedIn: true } }))
  }

  return checkIn
}

export function checkOutUserFromCrag(cragId: string, userId: string = 'user-1'): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${STORAGE_KEY}_active_${userId}`)
    const currentCount = getCragCheckInCount(cragId)
    const nextCount = Math.max(0, currentCount - 1)
    localStorage.setItem(`${STORAGE_KEY}_count_${cragId}`, String(nextCount))
    window.dispatchEvent(new CustomEvent('crag-checkin-updated', { detail: { cragId, isCheckedIn: false } }))
  }
}
