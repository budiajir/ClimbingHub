import { CragRegion, Problem } from './mock-data'

export interface GradeEquivalence {
  vScale: string
  font: string
  yds: string
  french: string
  levelLabel: string
}

const BOULDER_CONVERSION: Record<string, GradeEquivalence> = {
  V0: { vScale: 'V0', font: '4', yds: '5.10a', french: '6a', levelLabel: 'Beginner' },
  V1: { vScale: 'V1', font: '5', yds: '5.10c', french: '6a+', levelLabel: 'Beginner' },
  V2: { vScale: 'V2', font: '5+', yds: '5.11a', french: '6b+', levelLabel: 'Novice' },
  V3: { vScale: 'V3', font: '6A', yds: '5.11c', french: '6c+', levelLabel: 'Intermediate' },
  V4: { vScale: 'V4', font: '6B', yds: '5.12a', french: '7a+', levelLabel: 'Intermediate' },
  V5: { vScale: 'V5', font: '6C', yds: '5.12b', french: '7b', levelLabel: 'Advanced' },
  V6: { vScale: 'V6', font: '7A', yds: '5.12d', french: '7c', levelLabel: 'Advanced' },
  V7: { vScale: 'V7', font: '7A+', yds: '5.13a', french: '7c+', levelLabel: 'Expert' },
  V8: { vScale: 'V8', font: '7B', yds: '5.13b', french: '8a', levelLabel: 'Expert' },
  V9: { vScale: 'V9', font: '7C', yds: '5.13d', french: '8b', levelLabel: 'Elite' },
  V10: { vScale: 'V10', font: '7C+', yds: '5.14a', french: '8b+', levelLabel: 'Elite' },
}

const SPORT_CONVERSION: Record<string, GradeEquivalence> = {
  '5.9': { vScale: 'V0', font: '4', yds: '5.9', french: '5c', levelLabel: 'Beginner' },
  '5.10a': { vScale: 'V0', font: '4+', yds: '5.10a', french: '6a', levelLabel: 'Beginner' },
  '5.10b': { vScale: 'V1', font: '5', yds: '5.10b', french: '6a+', levelLabel: 'Novice' },
  '5.10c': { vScale: 'V1', font: '5', yds: '5.10c', french: '6b', levelLabel: 'Novice' },
  '5.11a': { vScale: 'V2', font: '5+', yds: '5.11a', french: '6c', levelLabel: 'Intermediate' },
  '5.11b': { vScale: 'V3', font: '6A', yds: '5.11b', french: '6c+', levelLabel: 'Intermediate' },
  '5.11c': { vScale: 'V3', font: '6A+', yds: '5.11c', french: '7a', levelLabel: 'Intermediate' },
  '5.12a': { vScale: 'V4', font: '6B+', yds: '5.12a', french: '7a+', levelLabel: 'Advanced' },
  '5.12b': { vScale: 'V5', font: '6C', yds: '5.12b', french: '7b', levelLabel: 'Advanced' },
  '5.12c': { vScale: 'V6', font: '7A', yds: '5.12c', french: '7b+', levelLabel: 'Advanced' },
  '5.12d': { vScale: 'V6', font: '7A', yds: '5.12d', french: '7c', levelLabel: 'Expert' },
  '5.13a': { vScale: 'V7', font: '7A+', yds: '5.13a', french: '7c+', levelLabel: 'Expert' },
  '5.13b': { vScale: 'V8', font: '7B', yds: '5.13b', french: '8a', levelLabel: 'Elite' },
}

export function getGradeEquivalence(grade: string, fontGrade?: string): GradeEquivalence {
  const clean = (grade || '').trim()
  const upper = clean.toUpperCase().split(' ')[0]

  if (BOULDER_CONVERSION[upper]) {
    const conv = BOULDER_CONVERSION[upper]
    return {
      ...conv,
      font: fontGrade || conv.font,
    }
  }

  const lower = clean.toLowerCase().split(' ')[0]
  if (SPORT_CONVERSION[lower]) {
    const conv = SPORT_CONVERSION[lower]
    return {
      ...conv,
      font: fontGrade || conv.font,
    }
  }

  return {
    vScale: upper.startsWith('V') ? upper : 'V4',
    font: fontGrade || '6B+',
    yds: clean.startsWith('5.') ? clean : '5.11d',
    french: '7a+',
    levelLabel: 'Technical Route',
  }
}

export interface CategorizedProblemPhoto {
  label: string
  url: string
  caption: string
}

export function getProblemPhotos(problem: Problem, fallbackImg?: string): CategorizedProblemPhoto[] {
  if (problem.problemPhotos && problem.problemPhotos.length > 0) {
    return problem.problemPhotos.map((p) => ({
      label: p.label,
      url: p.url,
      caption: p.caption || p.label,
    }))
  }

  const mainUrl = problem.imageUrl || fallbackImg || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80'
  const extraImages: string[] = Array.isArray((problem as any).images) ? (problem as any).images : []

  return [
    {
      label: 'Foto Jalur Utama',
      url: mainUrl,
      caption: `Full route overview and line topography for ${problem.name}`,
    },
    {
      label: 'Detail Pegangan (Crux)',
      url: extraImages[0] || 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=1000&q=80',
      caption: problem.holdDetails || 'Close-up of key start holds, micro-crimps, and friction grain',
    },
    {
      label: 'Kondisi Sekitar',
      url: extraImages[1] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&q=80',
      caption: problem.landingQuality
        ? `Landing zone & surrounding environment: ${problem.landingQuality}`
        : 'Surrounding belay stance, shade coverage, and sector base terrain',
    },
    {
      label: 'Akses Topping Out & Trekking Turun',
      url: extraImages[2] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=80',
      caption: problem.descentInfo || 'Exit trail, mantle ledge, and safe descent trekking route',
    },
  ]
}

export function getDefaultRequiredEquipment(category: 'boulder' | 'lead' | 'trad', problem: Problem): { item: string; spec: string }[] {
  if (problem.requiredEquipment && problem.requiredEquipment.length > 0) {
    return problem.requiredEquipment
  }

  if (category === 'boulder') {
    return [
      { item: 'Crash Pad Bouldering', spec: problem.padRecommendation || 'Min. 2–3 Crashpad (tebal ≥ 10 cm, high-density foam)' },
      { item: 'Sepatu Panjat (Climbing Shoes)', spec: 'Karet vibram/sticky rubber, fit presisi untuk edging & heel-hook' },
      { item: 'Chalk Bag & Soft Brush', spec: 'Chalk bag pinggang + sikat bulu halus (Nylon/Boar Hair, dilarang sikat kawat)' },
      { item: 'Spotter & Ground Tarp', spec: 'Minimal 1 spotter aktif & alas terpal bersih di bawah pad' },
    ]
  }

  if (category === 'lead') {
    const bolts = problem.boltCount || problem.anchorCount || 9
    return [
      { item: 'Tali Dinamis (Single Rope)', spec: 'Panjang 60m – 70m, diameter 9.5mm – 9.8mm (sertifikasi UIAA/CE)' },
      { item: 'Quickdraws Set', spec: `${bolts + 2} unit Quickdraws (termasuk 2x long/alpine draw 30cm untuk mencegah rope drag)` },
      { item: 'Harness & Belay Device', spec: 'Seat harness nyaman + Assisted-braking belay device (GriGri / Reverso)' },
      { item: 'Helm Panjat Tebing', spec: 'Helm standar EN 12492 wajib untuk pemanjat maupun belayer' },
      { item: 'Personal Anchor System (PAS)', spec: 'PAS/Sling 120cm + 2x Screwgate Carabiner untuk prosedur cleaning di anchor' },
    ]
  }

  return [
    { item: 'Tali Dinamis Panjang (Single/Half)', spec: 'Panjang 60m – 70m (disarankan Double/Half Rope untuk rute berliku & rappel penuh)' },
    { item: 'Quickdraws & Alpine Draws', spec: '12x Quickdraws standar + 4x Alpine Draws 60cm untuk mengurangi gesekan tali multi-pitch' },
    { item: 'Belay & Rappel Kit', spec: 'Tube belay device mode guide (ATC Guide / Reverso) + Prusik cord (6mm) untuk backup rappel' },
    { item: 'Multi-Pitch Anchor System', spec: '2x Dyneema Sling 120cm, 1x Cordalette 5m (7mm), dan 4x HMS Locking Carabiners' },
    { item: 'Helm & Radio Komunikasi (HT)', spec: 'Helm standar EN 12492 + HT / Peluit komunikasi antar stasiun belay' },
  ]
}

export function getDefaultDescendingDetails(category: 'boulder' | 'lead' | 'trad', problem: Problem): {
  method: string
  description: string
} {
  if (problem.descendingDetails) {
    return problem.descendingDetails
  }

  if (problem.descentInfo) {
    return {
      method: category === 'boulder' ? 'Topping Out & Walk-off Trekking' : 'Rappelling / Lower Off',
      description: problem.descentInfo,
    }
  }

  if (category === 'boulder') {
    return {
      method: 'Topping Out & Trekking Turun',
      description:
        'Selesaikan pemanjatan dengan mantle di bibir top-out hingga berdiri seimbang di atas blok batu, kemudian ikuti jalur trekking turun di sisi belakang boulder menuju titik awal crash pad.',
    }
  }

  if (category === 'lead') {
    return {
      method: 'Lower Off / Rappelling via Double Ring Anchor',
      description:
        'Clip dua carabiner pengaman ke stasiun rantai Double Ring Anchor di top jalur. Pastikan belayer mengeksekusi lower-off secara perlahan atau lakukan rappelling jika menggunakan tali 60m pada rute >28 meter.',
    }
  }

  return {
    method: 'Multi-Stage Rappelling & Walk-off Trail',
    description:
      'Turun melalui jalur stasiun rappel berantai (gunakan backup simpul prusik dan simpul pengaman pada ujung tali). Untuk puncak summit utama, tersedia jalur trekking walk-off menuju basecamp.',
  }
}

export function getDefaultApproachingDetails(problem: Problem, region?: CragRegion): {
  fromMeetingPoint: string
  fromParkingSpot: string
  pointToPointSteps: string[]
  gmapsUrl?: string
} {
  if (problem.approachingDetails) {
    return {
      fromMeetingPoint: problem.approachingDetails.fromMeetingPoint || region?.meetingPoint?.name || 'Basecamp Titik Kumpul',
      fromParkingSpot: problem.approachingDetails.fromParkingSpot || region?.howToGetThere?.parkingInfo || 'Designated Crag Parking Lot',
      pointToPointSteps: problem.approachingDetails.pointToPointSteps || [],
      gmapsUrl: region?.gmapsUrl,
    }
  }

  const sectorLabel = problem.sectorName || region?.name || 'Sektor Utama'

  return {
    fromMeetingPoint: `${region?.meetingPoint?.name || region?.whoToContact?.basecampName || 'Basecamp Pengelola'}: ${
      region?.meetingPoint?.notes || 'Briefing tim, cek peralatan pengaman, dan registrasi kunjungan.'
    }`,
    fromParkingSpot: `${
      region?.howToGetThere?.hikeDuration || '5–12 menit trekking ringan'
    } dari ${region?.parkingSpot?.locationDetails || region?.howToGetThere?.parkingInfo || 'area parkir utama basecamp'}.`,
    pointToPointSteps: [
      `Titik 1 (Parking / Meeting Point): Mulai dari ${region?.meetingPoint?.name || 'Basecamp Utama'} setelah memarkir kendaraan dan konfirmasi logbook.`,
      `Titik 2 (Approach Trail): Ikuti jalur setapak berpapan petunjuk menuju ${sectorLabel}.`,
      `Titik 3 (Base of Problem): Tiba di dasar tebing/boulder "${problem.name}" (${problem.accessInfo || 'area landai siap pasang pad / tie-in'}).`,
    ],
    gmapsUrl: region?.gmapsUrl,
  }
}

export function getDefaultBoltUpdateInfo(category: 'boulder' | 'lead' | 'trad', problem: Problem): {
  year: string
  notes: string
  isBolted: boolean
} {
  if (problem.boltsUpdatedYear || problem.boltsUpdateNotes) {
    return {
      year: problem.boltsUpdatedYear || '2025',
      notes: problem.boltsUpdateNotes || 'Verified anchor & stainless hardware inspection completed.',
      isBolted: category !== 'boulder',
    }
  }

  if (category === 'boulder') {
    return {
      year: 'N/A (Natural Boulder)',
      notes: 'Jalur bouldering murni tanpa pemasangan bolt permanen. Pengamanan mengandalkan crash pad dan spotter.',
      isBolted: false,
    }
  }

  return {
    year: '2025',
    notes: 'Re-bolted dengan expansion/glue-in bolt Stainless Steel 316L berstandar UIAA serta Double-Ring Top Anchor oleh tim perawatan jalur lokal & FPTI.',
    isBolted: true,
  }
}

/**
 * Normalizes route discipline aliases ('lead', 'trad', 'boulder') to the database enum values.
 */
export function normalizeRouteDiscipline(raw?: string): 'sport' | 'multipitch' | 'bouldering' {
  const value = String(raw || '').toLowerCase().trim()
  if (value === 'sport' || value === 'lead') return 'sport'
  if (value === 'multipitch' || value === 'trad') return 'multipitch'
  return 'bouldering'
}

/**
 * Returns an ISO YYYY-MM-DD date string or null if empty/non-ISO so PostgreSQL DATE inserts stay safe.
 */
export function normalizeIsoDate(raw?: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null
}
