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
          name: g.name,
          city: g.city,
          province: g.province,
          image: g.image,
          rating: Number(g.rating),
          reviewCount: g.review_count,
          slots: { morning: g.slots_morning, afternoon: g.slots_afternoon, evening: g.slots_evening },
          maxSlots: { morning: g.max_slots_morning, afternoon: g.max_slots_afternoon, evening: g.max_slots_evening },
          facilities: g.facilities,
          pricePerSession: g.price_per_session,
          address: g.address,
          routeSetters: g.route_setters,
          description: g.description,
          phone: g.phone,
          instagram: g.instagram,
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
        const dbCrags = (cragsRes.data as any[]).map((crag: any) => ({
          id: crag.id,
          name: crag.name,
          province: crag.province,
          image: crag.image,
          sectorCount: crag.sector_count,
          problemCount: crag.problem_count,
          sectors: sectors
            .filter((s: any) => s.crag_id === crag.id)
            .map((sector: any) => ({
              id: sector.id,
              name: sector.name,
              image: sector.image,
              problems: routes
                .filter((r: any) => r.sector_id === sector.id)
                .map(mapRouteRow),
            })),
        }))

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
          name: c.name,
          city: c.city,
          province: c.province,
          image: c.image,
          memberCount: c.member_count,
          homebase: c.homebase,
          description: c.description,
          whatsapp: c.whatsapp,
          instagram: c.instagram,
          tags: c.tags,
          members: (c.members || []) as { name: string; avatar: string; role: string }[],
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
    return { error: 'Gagal menyimpan jalur. Coba lagi nanti.' }
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
    return { error: 'Gagal menyimpan tebing baru.' }
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
    return { error: 'Gagal menyimpan sektor baru.' }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRouteRow(row: any): Problem {
  return {
    id: row.id,
    name: row.name,
    discipline: row.discipline as RouteDiscipline,
    grade: row.grade,
    fontGrade: row.font_grade,
    setter: row.setter,
    fa: row.fa,
    faDate: row.fa_date || '',
    description: row.description,
    imageUrl: row.image_url || undefined,
    betaVideoUrl: row.beta_video_url || undefined,
    accessInfo: row.access_info,
    localContact: row.local_contact,
    ascentCount: row.ascent_count,
    gradeVotes: (row.grade_votes || []) as { grade: string; votes: number }[],
    markers: (row.markers || []) as TopoMarker[],
    pitchLength: row.pitch_length || undefined,
    boltCount: row.bolt_count || undefined,
    anchorType: row.anchor_type || undefined,
    totalPitches: row.total_pitches || undefined,
    totalHeight: row.total_height || undefined,
    pitchBreakdown: (row.pitch_breakdown || undefined) as PitchDetail[] | undefined,
    descentInfo: row.descent_info || undefined,
    padRecommendation: row.pad_recommendation || undefined,
    landingQuality: row.landing_quality || undefined,
    startType: row.start_type || undefined,
  }
}
