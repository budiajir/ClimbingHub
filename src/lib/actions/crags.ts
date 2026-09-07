'use server'

import { getSupabaseServerClient } from '../supabase'
import type { CragRegion, Problem, RouteDiscipline, TopoMarker, PitchDetail } from '../mock-data'

/**
 * Fetch all crag regions with nested sectors and routes.
 * Falls back to mock data if the database is empty.
 */
export async function getCragRegions(): Promise<CragRegion[]> {
  try {
    const supabase = getSupabaseServerClient()

    // Fetch crag regions
    const { data: crags, error: cragError } = await supabase
      .from('crag_regions')
      .select('*')
      .order('name')

    if (cragError) throw cragError
    if (!crags || crags.length === 0) {
      const { cragRegions } = await import('../mock-data')
      return cragRegions
    }

    // Fetch all sectors
    const { data: sectors, error: sectorError } = await supabase
      .from('sectors')
      .select('*')

    if (sectorError) throw sectorError

    // Fetch all routes
    const { data: routes, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .order('ascent_count', { ascending: false })

    if (routeError) throw routeError

    // Assemble nested structure
    return (crags as any[]).map((crag: any) => {
      const cragSectors = ((sectors || []) as any[])
        .filter((s: any) => s.crag_id === crag.id)
        .map((sector: any) => ({
          id: sector.id,
          name: sector.name,
          image: sector.image,
          problems: ((routes || []) as any[])
            .filter((r: any) => r.sector_id === sector.id)
            .map(mapRouteRow),
        }))

      return {
        id: crag.id,
        name: crag.name,
        province: crag.province,
        image: crag.image,
        sectorCount: crag.sector_count,
        problemCount: crag.problem_count,
        sectors: cragSectors,
      }
    })
  } catch {
    const { cragRegions } = await import('../mock-data')
    return cragRegions
  }
}

/**
 * Fetch a single crag region with sectors and routes.
 */
export async function getCragWithSectors(id: string): Promise<CragRegion | null> {
  try {
    const supabase = getSupabaseServerClient()

    const { data: cragData, error: cragError } = await supabase
      .from('crag_regions')
      .select('*')
      .eq('id', id)
      .single()

    if (cragError) throw cragError
    if (!cragData) return null
    const crag = cragData as any

    const { data: sectors } = await supabase
      .from('sectors')
      .select('*')
      .eq('crag_id', id)

    const sectorList = (sectors || []) as any[]
    const sectorIds = sectorList.map((s: any) => s.id)

    const { data: routes } = await supabase
      .from('routes')
      .select('*')
      .in('sector_id', sectorIds.length > 0 ? sectorIds : ['__none__'])
      .order('ascent_count', { ascending: false })

    const routeList = (routes || []) as any[]

    return {
      id: crag.id,
      name: crag.name,
      province: crag.province,
      image: crag.image,
      sectorCount: crag.sector_count,
      problemCount: crag.problem_count,
      sectors: sectorList.map((sector: any) => ({
        id: sector.id,
        name: sector.name,
        image: sector.image,
        problems: routeList
          .filter((r: any) => r.sector_id === sector.id)
          .map(mapRouteRow),
      })),
    }
  } catch {
    const { cragRegions } = await import('../mock-data')
    return cragRegions.find((c) => c.id === id) ?? null
  }
}

/**
 * Create a new route (super_admin only — enforce on caller).
 */
export async function createRoute(data: {
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
  // Sport
  pitchLength?: string
  boltCount?: number
  anchorType?: string
  // Multi pitch
  totalPitches?: number
  totalHeight?: string
  pitchBreakdown?: PitchDetail[]
  descentInfo?: string
  // Bouldering
  padRecommendation?: string
  landingQuality?: string
  startType?: string
}): Promise<{ id: string } | { error: string }> {
  try {
    const supabase = getSupabaseServerClient()

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
    console.error('createRoute error:', err)
    return { error: 'Gagal menyimpan jalur. Coba lagi nanti.' }
  }
}

/**
 * Map a database route row to the client-side Problem interface.
 */
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
    // Sport
    pitchLength: row.pitch_length || undefined,
    boltCount: row.bolt_count || undefined,
    anchorType: row.anchor_type || undefined,
    // Multi pitch
    totalPitches: row.total_pitches || undefined,
    totalHeight: row.total_height || undefined,
    pitchBreakdown: (row.pitch_breakdown || undefined) as PitchDetail[] | undefined,
    descentInfo: row.descent_info || undefined,
    // Bouldering
    padRecommendation: row.pad_recommendation || undefined,
    landingQuality: row.landing_quality || undefined,
    startType: row.start_type || undefined,
  }
}
