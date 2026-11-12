'use client'

import { useState, useEffect } from 'react'
import { getGyms } from './actions/gyms'
import {
  createRoute,
  getCragRegions,
  upsertCragRegion,
  upsertSector,
} from './actions/crags'
import { getCommunities } from './actions/communities'
import type {
  Gym,
  CragRegion,
  Community,
  Problem,
  TopoMarker,
  PitchDetail,
  RouteDiscipline,
  Sector,
} from './mock-data'
import {
  cragRegions as initialMockCrags,
  gyms as initialMockGyms,
  communities as initialMockCommunities,
} from './mock-data'

/**
 * Client-side hook to fetch gyms via Next.js Server Action.
 * Falls back to mock data if the database is empty or unconfigured.
 */
export function useGyms() {
  const [gyms, setGyms] = useState<Gym[]>(initialMockGyms)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getGyms()
        if (active && data.length > 0) {
          setGyms(data)
        }
      } catch {
        if (active) setGyms(initialMockGyms)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return { gyms, loading }
}

/**
 * Normalizes a crag or sector name for robust deduplication.
 * Strips out leading prefixes like "tebing", "crag", "sektor", "sector", and ignores case & extra spaces.
 */
export function normalizeCragName(str?: string | null): string {
  if (!str) return ''
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/^(tebing|crag|sektor|sector)\s+/i, '')
    .replace(/[\s\-_]+/g, ' ')
    .trim()
}

/**
 * Deduplicates and merges crags from multiple sources (database + mock data).
 */
export function mergeCragRegions(cragList: CragRegion[]): CragRegion[] {
  const merged: CragRegion[] = []

  for (const crag of cragList || []) {
    if (!crag || !crag.name) continue

    const cragIdStr = String(crag.id || '')
    const normName = normalizeCragName(crag.name)
    const normId = cragIdStr.toLowerCase().trim()

    const existingIndex = merged.findIndex((existing) => {
      if (!existing) return false
      const exIdStr = String(existing.id || '')
      const exNormName = normalizeCragName(existing.name)
      const exNormId = exIdStr.toLowerCase().trim()
      const exAliases = (existing.aliases || []).map((a) =>
        String(a || '').toLowerCase().trim()
      )

      return (
        (normId && exNormId === normId) ||
        (normName && exNormName === normName) ||
        (normId && exAliases.includes(normId)) ||
        (normName && exAliases.includes(normName))
      )
    })

    if (existingIndex === -1) {
      merged.push({
        ...crag,
        aliases: [crag.id],
      })
    } else {
      const existing = merged[existingIndex]
      const aliases = Array.from(
        new Set(
          [...(existing.aliases || [existing.id]), crag.id, ...(crag.aliases || [])].filter(
            Boolean
          )
        )
      )

      const isExistingTimestamp = String(existing.id || '').startsWith('crag-')
      const isIncomingTimestamp = String(crag.id || '').startsWith('crag-')
      const canonicalId = isExistingTimestamp && !isIncomingTimestamp ? crag.id : existing.id

      const name = existing.name || crag.name
      const province = existing.province || crag.province
      const image =
        existing.image && !existing.image.includes('placeholder')
          ? existing.image
          : crag.image || existing.image
      const description =
        existing.description && existing.description.length > (crag.description?.length || 0)
          ? existing.description
          : crag.description || existing.description

      const mergedSectors: Sector[] = [...(existing.sectors || [])]

      for (const incSec of crag.sectors || []) {
        if (!incSec) continue
        const incSecNorm = normalizeCragName(incSec.name)
        const incSecId = String(incSec.id || '').toLowerCase().trim()

        const existingSecIndex = mergedSectors.findIndex(
          (s) =>
            (incSecId && String(s.id || '').toLowerCase().trim() === incSecId) ||
            (incSecNorm && normalizeCragName(s.name) === incSecNorm)
        )

        if (existingSecIndex === -1) {
          mergedSectors.push(incSec)
        } else {
          const exSec = mergedSectors[existingSecIndex]
          const mergedProblems: Problem[] = [...(exSec.problems || [])]

          for (const incProb of incSec.problems || []) {
            if (!incProb) continue
            const incProbNorm = String(incProb.name || '').trim().toLowerCase()
            const incProbId = String(incProb.id || '').toLowerCase().trim()

            const hasProb = mergedProblems.some(
              (p) =>
                (incProbId && String(p.id || '').toLowerCase().trim() === incProbId) ||
                (incProbNorm && String(p.name || '').trim().toLowerCase() === incProbNorm)
            )

            if (!hasProb) {
              mergedProblems.push(incProb)
            }
          }

          mergedSectors[existingSecIndex] = {
            ...exSec,
            image: exSec.image || incSec.image,
            description: exSec.description || incSec.description,
            problems: mergedProblems,
          }
        }
      }

      const totalActualProblems = mergedSectors.reduce(
        (acc, s) => acc + (s.problems?.length || 0),
        0
      )
      const maxProblemCount = Math.max(
        existing.problemCount || 0,
        crag.problemCount || 0,
        totalActualProblems
      )

      merged[existingIndex] = {
        ...existing,
        ...crag,
        id: canonicalId,
        name,
        province,
        image,
        description,
        coordinates: existing.coordinates || crag.coordinates,
        gmapsUrl: existing.gmapsUrl || crag.gmapsUrl,
        mapEmbedUrl: existing.mapEmbedUrl || crag.mapEmbedUrl,
        howToGetThere: existing.howToGetThere || crag.howToGetThere,
        whoToContact: existing.whoToContact || crag.whoToContact,
        rockType: existing.rockType || crag.rockType,
        weatherForecast: existing.weatherForecast || crag.weatherForecast,
        sectors: mergedSectors,
        sectorCount: mergedSectors.length,
        problemCount: maxProblemCount,
        aliases,
      }
    }
  }

  return merged
}

/**
 * Client-side hook to fetch crag regions with nested sectors and routes via Server Action.
 */
export function useCragRegions() {
  const [cragRegions, setCragRegions] = useState<CragRegion[]>(() =>
    mergeCragRegions(initialMockCrags)
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const dbCrags = await getCragRegions()
        if (active && dbCrags.length > 0) {
          setCragRegions(mergeCragRegions([...initialMockCrags, ...dbCrags]))
        }
      } catch {
        if (active) setCragRegions(mergeCragRegions(initialMockCrags))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return { cragRegions, setCragRegions, loading }
}

/**
 * Client-side hook to fetch communities via Server Action.
 */
export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>(initialMockCommunities)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getCommunities()
        if (active && data.length > 0) {
          setCommunities(data)
        }
      } catch {
        if (active) setCommunities(initialMockCommunities)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return { communities, loading }
}

/**
 * Insert a new route via Drizzle Server Action.
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
  return createRoute(data)
}

/**
 * Insert a new crag region via Drizzle Server Action.
 */
export async function insertCragRegion(data: {
  id: string
  name: string
  province: string
  image?: string
}): Promise<{ id: string } | { error: string }> {
  return upsertCragRegion(data)
}

/**
 * Insert a new sector via Drizzle Server Action.
 */
export async function insertSector(data: {
  id: string
  cragId: string
  name: string
  image?: string
}): Promise<{ id: string } | { error: string }> {
  return upsertSector(data)
}
