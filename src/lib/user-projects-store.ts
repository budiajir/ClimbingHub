'use client'

export interface UserProjectItem {
  id: string
  name: string
  cragOrGym: string
  grade: string
  discipline: 'boulder' | 'sport' | 'lead'
  progressPercent: number
  highpoint: string
  sessionsCount: number
  attemptsCount: number
  targetDate?: string
  imageUrl: string
  notes?: string
  createdAt: string
  isSent: boolean
}

const DEFAULT_PROJECTS: UserProjectItem[] = [
  {
    id: 'proj-1',
    name: 'Gorejat Mantle Crux',
    cragOrGym: 'Harau Valley · Sarasah Bonta',
    grade: 'V8 (7B)',
    discipline: 'boulder',
    progressPercent: 80,
    highpoint: 'Hold #8 (Matched slopey lip, working on final mantle deadpoint)',
    sessionsCount: 4,
    attemptsCount: 14,
    targetDate: 'May 2026 Trip',
    imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    notes: 'Butuh friction sore hari dingin. Heel hook kanan kunci stability sebelum slap ke pinch.',
    createdAt: '2026-03-20',
    isSent: false,
  },
  {
    id: 'proj-2',
    name: 'Batu Belah Direct Line',
    cragOrGym: 'Citatah 90 (A) · Padalarang',
    grade: 'V6 (7A)',
    discipline: 'boulder',
    progressPercent: 65,
    highpoint: 'Crux crimp #5 linked from start',
    sessionsCount: 2,
    attemptsCount: 8,
    targetDate: 'Next Weekend',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    notes: 'Micro crimp tajam karst limestone. Spotting wajib dua pad di landing zone.',
    createdAt: '2026-04-02',
    isSent: false,
  },
]

const STORAGE_KEY = 'jalur_user_ongoing_projects_v1'

export function getUserProjects(): UserProjectItem[] {
  if (typeof window === 'undefined') return DEFAULT_PROJECTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS))
      return DEFAULT_PROJECTS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_PROJECTS
  }
}

export function addUserProject(project: UserProjectItem): void {
  if (typeof window === 'undefined') return
  const current = getUserProjects()
  const next = [project, ...current]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('user-projects-updated', { detail: next }))
}

export function logProjectAttempt(id: string, note?: string): void {
  if (typeof window === 'undefined') return
  const current = getUserProjects()
  const next = current.map((p) => {
    if (p.id !== id) return p
    return {
      ...p,
      attemptsCount: p.attemptsCount + 1,
      notes: note || p.notes,
    }
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('user-projects-updated', { detail: next }))
}

export function tickProjectAsSent(id: string): UserProjectItem | undefined {
  if (typeof window === 'undefined') return
  const current = getUserProjects()
  const target = current.find((p) => p.id === id)
  const next = current.filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('user-projects-updated', { detail: next }))
  return target
}

export function deleteUserProject(id: string): void {
  if (typeof window === 'undefined') return
  const current = getUserProjects()
  const next = current.filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('user-projects-updated', { detail: next }))
}
