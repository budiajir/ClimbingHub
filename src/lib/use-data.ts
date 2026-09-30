'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from './supabase'
import type { Gym, CragRegion, Community, Problem, TopoMarker, PitchDetail, RouteDiscipline } from './mock-data'

/**
 * Client-side hook to fetch gyms from the database.
 * Falls back to mock data if the database is empty or unreachable.
 */
export function useGyms() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('gyms')
          .select('*')
          .order('rating', { ascending: false })

        if (error) throw error
        if (!data || data.length === 0) throw new Error('empty')

        setGyms((data as any[]).map((g: any) => ({
          id: g.id,
          name: g.name || 'Climbing Gym',
          city: g.city || '',
          province: g.province || '',
          image: g.image || '',
          rating: Number(g.rating || 0),
          reviewCount: Number(g.review_count || 0),
          slots: {
            morning: Number(g.slots_morning || 0),
            afternoon: Number(g.slots_afternoon || 0),
            evening: Number(g.slots_evening || 0),
          },
          maxSlots: {
            morning: Number(g.max_slots_morning || 0),
            afternoon: Number(g.max_slots_afternoon || 0),
            evening: Number(g.max_slots_evening || 0),
          },
          facilities: Array.isArray(g.facilities) ? g.facilities : [],
          pricePerSession: Number(g.price_per_session || 0),
          address: g.address || '',
          routeSetters: Array.isArray(g.route_setters) ? g.route_setters : [],
          description: g.description || '',
          phone: g.phone || '',
          instagram: g.instagram || '',
        })))
      } catch {
        const { gyms: mockGyms } = await import('./mock-data')
        setGyms(mockGyms)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { gyms, loading }
}

/**
 * Client-side hook to fetch crag regions with nested sectors and routes.
 */
export function useCragRegions() {
  const [cragRegions, setCragRegions] = useState<CragRegion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseBrowserClient()

        const [cragsRes, sectorsRes, routesRes] = await Promise.all([
          supabase.from('crag_regions').select('*').order('name'),
          supabase.from('sectors').select('*'),
          supabase.from('routes').select('*').order('ascent_count', { ascending: false }),
        ])

        if (cragsRes.error) throw cragsRes.error
        if (!cragsRes.data || cragsRes.data.length === 0) throw new Error('empty')

        const sectors = (sectorsRes.data || []) as any[]
        const routes = (routesRes.data || []) as any[]

        const { cragRegions: mockCrags } = await import('./mock-data')
        const dbCrags = (cragsRes.data as any[]).map((crag: any) => {
          const mockMatch = mockCrags.find(m => m.id.toLowerCase() === String(crag.id).toLowerCase())
          const cragSectors = sectors.filter((s: any) => s.crag_id === crag.id)

          // If db has sectors for this crag, map them; otherwise fall back to mockMatch sectors
          let finalSectors = (mockMatch?.sectors || []).map(s => ({
            ...s,
            problems: Array.isArray(s.problems) ? s.problems : [],
          }))

          if (cragSectors.length > 0) {
            finalSectors = cragSectors.map((sector: any) => {
              const secRoutes = routes
                .filter((r: any) => r.sector_id === sector.id)
                .map(mapRouteRow)
              const mockSector = mockMatch?.sectors?.find(ms => ms.id.toLowerCase() === String(sector.id).toLowerCase())
              return {
                id: sector.id,
                name: sector.name || mockSector?.name || 'Sector',
                image: sector.image || mockSector?.image || crag.image || '',
                problems: secRoutes.length > 0 ? secRoutes : (mockSector?.problems || []),
              }
            })
          }

          return {
            ...mockMatch,
            id: crag.id,
            name: crag.name || mockMatch?.name || '',
            province: crag.province || mockMatch?.province || '',
            image: crag.image || mockMatch?.image || '',
            description: crag.description || mockMatch?.description || '',
            sectorCount: crag.sector_count ?? mockMatch?.sectorCount ?? finalSectors.length,
            problemCount: crag.problem_count ?? mockMatch?.problemCount ?? 0,
            sectors: finalSectors,
          }
        })

        const dbIds = new Set(dbCrags.map((c: any) => c.id.toLowerCase()))
        const additionalMocks = mockCrags.filter(m => !dbIds.has(m.id.toLowerCase()))
        setCragRegions([...dbCrags, ...additionalMocks])
      } catch {
        const { cragRegions: mockCrags } = await import('./mock-data')
        setCragRegions(mockCrags)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { cragRegions, setCragRegions, loading }
}

/**
 * Client-side hook to fetch communities.
 */
export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .order('member_count', { ascending: false })

        if (error) throw error
        if (!data || data.length === 0) throw new Error('empty')

        setCommunities((data as any[]).map((c: any) => ({
          id: c.id,
          name: c.name || 'Community',
          city: c.city || '',
          province: c.province || '',
          image: c.image || '',
          memberCount: Number(c.member_count || 0),
          homebase: c.homebase || '',
          description: c.description || '',
          whatsapp: c.whatsapp || '',
          instagram: c.instagram || '',
          tags: Array.isArray(c.tags) ? c.tags : [],
          members: Array.isArray(c.members) ? c.members : [],
        })))
      } catch {
        const { communities: mockComm } = await import('./mock-data')
        setCommunities(mockComm)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { communities, loading }
}

/**
 * Insert a new route into the database.
 */
export async function insertRoute(data: {
  sectorId: string
  name: string
  discipline: RouteDiscipline
  grade: string
  fontGrade?: string
  setter?: string
  fa?: string
  faDate?: string
  description?: string
  imageUrl?: string
  accessInfo?: string
  localContact?: string
  markers?: TopoMarker[]
  pitchLength?: string
  boltCount?: number
  anchorType?: string
  totalPitches?: number
  totalHeight?: string
  pitchBreakdown?: PitchDetail[]
  descentInfo?: string
  padRecommendation?: string
  landingQuality?: string
  startType?: string
}): Promise<{ id: string } | { error: string }> {
  try {
    const supabase = getSupabaseBrowserClient()
    const routeId = `route-${Date.now()}`

    const { error } = await supabase.from('routes').insert({
      id: routeId,
      sector_id: data.sectorId,
      name: data.name,
      discipline: data.discipline,
      grade: data.grade,
      font_grade: data.fontGrade || '',
      setter: data.setter || '',
      fa: data.fa || '',
      fa_date: data.faDate || null,
      description: data.description || '',
      image_url: data.imageUrl || null,
      access_info: data.accessInfo || '',
      local_contact: data.localContact || '',
      ascent_count: 0,
      grade_votes: [],
      markers: (data.markers || []) as unknown as Record<string, unknown>[],
      pitch_length: data.pitchLength || null,
      bolt_count: data.boltCount || null,
      anchor_type: data.anchorType || null,
      total_pitches: data.totalPitches || null,
      total_height: data.totalHeight || null,
      pitch_breakdown: (data.pitchBreakdown || null) as unknown as Record<string, unknown>[] | null,
      descent_info: data.descentInfo || null,
      pad_recommendation: data.padRecommendation || null,
      landing_quality: data.landingQuality || null,
      start_type: data.startType || null,
    })

    if (error) throw error
    return { id: routeId }
  } catch (err) {
    console.error('insertRoute error:', err)
    return { error: 'Failed to save route. Please try again later.' }
  }
}

/**
 * Insert a new crag region into the database.
 */
export async function insertCragRegion(data: {
  id: string
  name: string
  province: string
  image?: string
}): Promise<{ id: string } | { error: string }> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from('crag_regions').insert({
      id: data.id,
      name: data.name,
      province: data.province,
      image: data.image || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
      sector_count: 1,
      problem_count: 1,
    })
    if (error) throw error
    return { id: data.id }
  } catch (err) {
    console.error('insertCragRegion error:', err)
    return { error: 'Failed to save new crag.' }
  }
}

/**
 * Insert a new sector into the database.
 */
export async function insertSector(data: {
  id: string
  cragId: string
  name: string
  image?: string
}): Promise<{ id: string } | { error: string }> {
  try {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from('sectors').insert({
      id: data.id,
      crag_id: data.cragId,
      name: data.name,
      image: data.image || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
    })
    if (error) throw error
    return { id: data.id }
  } catch (err) {
    console.error('insertSector error:', err)
    return { error: 'Failed to save new sector.' }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRouteRow(row: any): Problem {
  let parsedMarkers: TopoMarker[] = []
  if (Array.isArray(row.markers)) {
    parsedMarkers = row.markers.map((m: any, i: number) => ({
      id: m?.id || `m-${i}`,
      x: typeof m?.x === 'number' ? m.x : (Number(m?.x) || 50),
      y: typeof m?.y === 'number' ? m.y : (Number(m?.y) || 50),
      type: m?.type || 'B',
      label: m?.label || '',
    }))
  } else if (typeof row.markers === 'string' && row.markers.trim()) {
    try {
      const parsed = JSON.parse(row.markers)
      if (Array.isArray(parsed)) {
        parsedMarkers = parsed.map((m: any, i: number) => ({
          id: m?.id || `m-${i}`,
          x: typeof m?.x === 'number' ? m.x : (Number(m?.x) || 50),
          y: typeof m?.y === 'number' ? m.y : (Number(m?.y) || 50),
          type: m?.type || 'B',
          label: m?.label || '',
        }))
      }
    } catch {
      parsedMarkers = []
    }
  }

  let parsedGradeVotes: { grade: string; votes: number }[] = []
  if (Array.isArray(row.grade_votes)) {
    parsedGradeVotes = row.grade_votes
  } else if (typeof row.grade_votes === 'string' && row.grade_votes.trim()) {
    try {
      const parsed = JSON.parse(row.grade_votes)
      if (Array.isArray(parsed)) parsedGradeVotes = parsed
    } catch {
      parsedGradeVotes = []
    }
  }

  let parsedPitchBreakdown: PitchDetail[] | undefined = undefined
  if (Array.isArray(row.pitch_breakdown)) {
    parsedPitchBreakdown = row.pitch_breakdown
  } else if (typeof row.pitch_breakdown === 'string' && row.pitch_breakdown.trim()) {
    try {
      const parsed = JSON.parse(row.pitch_breakdown)
      if (Array.isArray(parsed)) parsedPitchBreakdown = parsed
    } catch {
      parsedPitchBreakdown = undefined
    }
  }

  return {
    id: row.id,
    name: row.name || 'Unnamed Route',
    discipline: (row.discipline as RouteDiscipline) || 'bouldering',
    grade: row.grade || 'V0',
    fontGrade: row.font_grade || '',
    setter: row.setter || 'Community',
    fa: row.fa || '',
    faDate: row.fa_date || '',
    description: row.description || '',
    imageUrl: row.image_url || undefined,
    betaVideoUrl: row.beta_video_url || undefined,
    accessInfo: row.access_info || '',
    localContact: row.local_contact || '',
    ascentCount: Number(row.ascent_count || 0),
    gradeVotes: parsedGradeVotes,
    markers: parsedMarkers,
    pitchLength: row.pitch_length || undefined,
    boltCount: row.bolt_count ? Number(row.bolt_count) : undefined,
    anchorType: row.anchor_type || undefined,
    totalPitches: row.total_pitches ? Number(row.total_pitches) : undefined,
    totalHeight: row.total_height || undefined,
    pitchBreakdown: parsedPitchBreakdown,
    descentInfo: row.descent_info || undefined,
    padRecommendation: row.pad_recommendation || undefined,
    landingQuality: row.landing_quality || undefined,
    startType: row.start_type || undefined,
  }
}
