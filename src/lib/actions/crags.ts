'use server'

import { revalidatePath } from 'next/cache'
import { asc, desc, eq, inArray } from 'drizzle-orm'
import { cragRegions, getDb, isDatabaseConfigured, routes, sectors } from '../db'
import { normalizeCragName, normalizeIsoDate, normalizeRouteDiscipline } from '../problem-helpers'
import type { CragRegion, PitchDetail, Problem, RouteDiscipline, TopoMarker } from '../mock-data'

function mapRouteRow(row: typeof routes.$inferSelect): Problem {
  const parsedMarkers: TopoMarker[] = Array.isArray(row.markers)
    ? row.markers.map((m, i) => ({
        id: m?.id || `m-${i}`,
        x: typeof m?.x === 'number' ? m.x : Number(m?.x) || 50,
        y: typeof m?.y === 'number' ? m.y : Number(m?.y) || 50,
        type: (m?.type === 'H' ? 'B' : m?.type) || 'B',
        label: m?.label || '',
      }))
    : []

  return {
    id: row.id,
    name: row.name || 'Unnamed Route',
    discipline: (row.discipline as RouteDiscipline) || 'bouldering',
    grade: row.grade || 'V0',
    fontGrade: row.fontGrade || '',
    setter: row.setter || 'Community',
    fa: row.fa || '',
    faDate: row.faDate || '',
    description: row.description || '',
    imageUrl: row.imageUrl || undefined,
    betaVideoUrl: row.betaVideoUrl || undefined,
    accessInfo: row.accessInfo || '',
    localContact: row.localContact || '',
    ascentCount: Number(row.ascentCount || 0),
    gradeVotes: Array.isArray(row.gradeVotes) ? row.gradeVotes : [],
    markers: parsedMarkers,
    pitchLength: row.pitchLength || undefined,
    boltCount: row.boltCount ?? undefined,
    anchorType: row.anchorType || undefined,
    totalPitches: row.totalPitches ?? undefined,
    totalHeight: row.totalHeight || undefined,
    pitchBreakdown: (row.pitchBreakdown || undefined) as PitchDetail[] | undefined,
    descentInfo: row.descentInfo || undefined,
    padRecommendation: row.padRecommendation || undefined,
    landingQuality: row.landingQuality || undefined,
    startType:
      row.startType === 'Sit Start (SS)' || row.startType === 'Stand Start'
        ? row.startType
        : undefined,
  }
}

function assembleCragRegion(
  crag: typeof cragRegions.$inferSelect,
  sectorRows: (typeof sectors.$inferSelect)[],
  routeRows: (typeof routes.$inferSelect)[],
  mockCrags?: CragRegion[]
): CragRegion {
  const mockMatch = mockCrags?.find(
    (m) =>
      m.id === crag.id ||
      normalizeCragName(m.name) === normalizeCragName(crag.name)
  )

  const mappedSectors = sectorRows
    .filter((s) => s.cragId === crag.id)
    .map((sector) => {
      const mockSector = mockMatch?.sectors?.find(
        (ms) =>
          ms.id === sector.id ||
          normalizeCragName(ms.name) === normalizeCragName(sector.name)
      )
      const dbProblems = routeRows
        .filter((r) => r.sectorId === sector.id)
        .map(mapRouteRow)
      const problems =
        dbProblems.length > 0 ? dbProblems : mockSector?.problems || []

      return {
        id: sector.id,
        name: sector.name || mockSector?.name || 'Sector',
        image: sector.imageUrl || mockSector?.image || crag.imageUrl || '',
        description: sector.description || mockSector?.description || undefined,
        problems,
      }
    })

  const finalSectors =
    mappedSectors.length > 0 ? mappedSectors : mockMatch?.sectors || []

  return {
    ...mockMatch,
    id: crag.id,
    name: crag.name,
    province: crag.province,
    image: crag.imageUrl || mockMatch?.image || '',
    description: crag.description || mockMatch?.description || undefined,
    coordinates: crag.coordinates || mockMatch?.coordinates || undefined,
    gmapsUrl: crag.gmapsUrl || mockMatch?.gmapsUrl || undefined,
    rockType: crag.rockType || mockMatch?.rockType || undefined,
    sectorCount: crag.sectorCount ?? finalSectors.length,
    problemCount:
      crag.problemCount ??
      finalSectors.reduce((acc, s) => acc + (s.problems?.length || 0), 0),
    sectors: finalSectors,
  }
}

/**
 * Fetch all crag regions with nested sectors and routes.
 * Falls back to mock data if DATABASE_URL is missing.
 */
export async function getCragRegions(): Promise<CragRegion[]> {
  try {
    if (!isDatabaseConfigured()) {
      const { cragRegions: mockCrags } = await import('../mock-data')
      return mockCrags
    }

    const db = getDb()
    const [cragRows, sectorRows, routeRows] = await Promise.all([
      db.select().from(cragRegions).orderBy(asc(cragRegions.name)),
      db.select().from(sectors),
      db.select().from(routes).orderBy(desc(routes.ascentCount)),
    ])

    if (!cragRows || cragRows.length === 0) {
      return []
    }

    const { cragRegions: mockCrags } = await import('../mock-data')
    return cragRows.map((crag) => assembleCragRegion(crag, sectorRows, routeRows, mockCrags))
  } catch {
    const { cragRegions: mockCrags } = await import('../mock-data')
    return mockCrags
  }
}

/**
 * Fetch a single crag region with sectors and routes.
 */
export async function getCragWithSectors(id: string): Promise<CragRegion | null> {
  try {
    if (!isDatabaseConfigured()) {
      const { cragRegions: mockCrags } = await import('../mock-data')
      return mockCrags.find((c) => c.id === id) ?? null
    }

    const db = getDb()
    const [crag] = await db.select().from(cragRegions).where(eq(cragRegions.id, id)).limit(1)
    if (!crag) return null

    const sectorRows = await db.select().from(sectors).where(eq(sectors.cragId, id))
    const sectorIds = sectorRows.map((s) => s.id)

    const routeRows =
      sectorIds.length > 0
        ? await db
            .select()
            .from(routes)
            .where(inArray(routes.sectorId, sectorIds))
            .orderBy(desc(routes.ascentCount))
        : []

    const { cragRegions: mockCrags } = await import('../mock-data')
    return assembleCragRegion(crag, sectorRows, routeRows, mockCrags)
  } catch {
    const { cragRegions: mockCrags } = await import('../mock-data')
    return mockCrags.find((c) => c.id === id) ?? null
  }
}

/**
 * Create a new route in PostgreSQL via Drizzle ORM.
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
    const db = getDb()
    const routeId = `route-${Date.now()}`

    await db.insert(routes).values({
      id: routeId,
      sectorId: data.sectorId,
      name: data.name,
      discipline: normalizeRouteDiscipline(data.discipline),
      grade: data.grade,
      fontGrade: data.fontGrade || '',
      setter: data.setter || '',
      fa: data.fa || '',
      faDate: normalizeIsoDate(data.faDate),
      description: data.description || '',
      imageUrl: data.imageUrl || null,
      accessInfo: data.accessInfo || '',
      localContact: data.localContact || '',
      ascentCount: 0,
      gradeVotes: [],
      markers: data.markers || [],
      pitchLength: data.pitchLength || null,
      boltCount: data.boltCount ?? null,
      anchorType: data.anchorType || null,
      totalPitches: data.totalPitches ?? null,
      totalHeight: data.totalHeight || null,
      pitchBreakdown: data.pitchBreakdown || null,
      descentInfo: data.descentInfo || null,
      padRecommendation: data.padRecommendation || null,
      landingQuality: data.landingQuality || null,
      startType: data.startType || null,
    })

    revalidatePath('/')
    revalidatePath('/crags')
    revalidatePath('/beta')
    return { id: routeId }
  } catch (err) {
    console.error('createRoute error:', err)
    return { error: 'Failed to save route. Please try again later.' }
  }
}

/**
 * Insert a crag region if it does not already exist.
 */
export async function upsertCragRegion(data: {
  id: string
  name: string
  province: string
  image?: string
}): Promise<{ id: string } | { error: string }> {
  try {
    const db = getDb()
    await db
      .insert(cragRegions)
      .values({
        id: data.id,
        name: data.name,
        province: data.province,
        imageUrl:
          data.image ||
          'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
        sectorCount: 1,
        problemCount: 1,
      })
      .onConflictDoNothing({ target: cragRegions.id })

    revalidatePath('/')
    revalidatePath('/crags')
    return { id: data.id }
  } catch (err) {
    console.error('upsertCragRegion error:', err)
    return { error: 'Failed to save new crag.' }
  }
}

/**
 * Insert a sector if it does not already exist.
 */
export async function upsertSector(data: {
  id: string
  cragId: string
  name: string
  image?: string
}): Promise<{ id: string } | { error: string }> {
  try {
    const db = getDb()
    await db
      .insert(sectors)
      .values({
        id: data.id,
        cragId: data.cragId,
        name: data.name,
        imageUrl:
          data.image ||
          'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
      })
      .onConflictDoNothing({ target: sectors.id })

    revalidatePath('/')
    revalidatePath('/crags')
    return { id: data.id }
  } catch (err) {
    console.error('upsertSector error:', err)
    return { error: 'Failed to save new sector.' }
  }
}
