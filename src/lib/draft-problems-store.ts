'use client'

export interface DraftProblemItem {
  id: string
  name: string
  cragName: string
  sectorName: string
  grade: string
  discipline: string
  imageUrl?: string
  notes?: string
  progressPercent: number
  savedAt: string
  isComplete: boolean
}

const DEFAULT_DRAFTS: DraftProblemItem[] = [
  {
    id: 'draft-1',
    name: 'Batu Belah Project',
    cragName: 'Citatah 90 (A)',
    sectorName: 'Sector Bouldering Timur',
    grade: 'V5 / 6c',
    discipline: 'boulder',
    imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=80',
    notes: 'Belum ditambahkan titik crux dan anchor station topo.',
    progressPercent: 65,
    savedAt: '2026-04-08',
    isComplete: false,
  },
  {
    id: 'draft-2',
    name: 'Lembah Harau Multipitch Pitch 2',
    cragName: 'Harau Valley',
    sectorName: 'Tarantang Wall',
    grade: '5.11 C',
    discipline: 'multipitch',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
    notes: 'Perlu konfirmasi jumlah hanger dan panjang pitch.',
    progressPercent: 40,
    savedAt: '2026-04-02',
    isComplete: false,
  },
]

const STORAGE_KEY = 'jalur_draft_problems'

export function getDraftProblems(): DraftProblemItem[] {
  if (typeof window === 'undefined') return DEFAULT_DRAFTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DRAFTS))
      return DEFAULT_DRAFTS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_DRAFTS
  }
}

export function saveDraftProblem(draft: DraftProblemItem): void {
  if (typeof window === 'undefined') return
  const current = getDraftProblems()
  const filtered = current.filter((d) => d.id !== draft.id)
  const next = [draft, ...filtered]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('draft-problems-updated', { detail: next }))
}

export function deleteDraftProblem(id: string): void {
  if (typeof window === 'undefined') return
  const current = getDraftProblems()
  const next = current.filter((d) => d.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('draft-problems-updated', { detail: next }))
}
