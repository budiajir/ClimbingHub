'use server'

import { asc, desc, eq, ilike, or, sql } from 'drizzle-orm'
import {
  ascentLogs,
  communities,
  cragRegions,
  getDb,
  gyms,
  isDatabaseConfigured,
  routes,
  sectors,
  user,
} from '../db'
import type { UserRole } from '../permissions'

export interface SuperAdminStats {
  totalUsers: number
  climbersCount: number
  settersCount: number
  guidesCount: number
  gymAdminsCount: number
  superAdminsCount: number
  totalCrags: number
  totalRoutes: number
  totalGyms: number
  totalCommunities: number
  totalAscents: number
}

export interface SuperAdminUserItem {
  id: string
  name: string
  email: string
  role: UserRole
  handle: string | null
  ascentsCount: number
  createdAt: string
}

export interface SuperAdminCragItem {
  id: string
  name: string
  province: string
  city: string | null
  description: string | null
  imageUrl: string | null
  lat: number
  lng: number
  routesCount: number
  sectorsCount: number
  createdAt: string
  sectors: { id: string; name: string }[]
}

export interface SuperAdminRouteItem {
  id: string
  name: string
  grade: string
  discipline: string
  cragName: string
  sectorName: string
  setter: string | null
  ascentCount: number
  imageUrl: string | null
  createdAt: string
}

export interface SuperAdminGymItem {
  id: string
  name: string
  city: string
  province: string
  address: string
  phone: string
  instagram?: string | null
  imageUrl?: string | null
  pricePerSession?: number | null
  facilities?: string[]
  picName: string | null
  dailyVisitors: number
  todayRevenue: number
  createdAt: string
}

/**
 * 1. Fetch Overview Platform Statistics
 */
export async function getSuperAdminStatsAction(): Promise<SuperAdminStats> {
  if (!isDatabaseConfigured()) {
    return {
      totalUsers: 58,
      climbersCount: 52,
      settersCount: 3,
      guidesCount: 2,
      gymAdminsCount: 0,
      superAdminsCount: 1,
      totalCrags: 5,
      totalRoutes: 25,
      totalGyms: 3,
      totalCommunities: 3,
      totalAscents: 120,
    }
  }

  const db = getDb()

  try {
    const userRoleCounts = await db
      .select({
        role: user.role,
        count: sql<number>`count(*)::int`,
      })
      .from(user)
      .groupBy(user.role)

    let totalUsers = 0
    let climbersCount = 0
    let settersCount = 0
    let guidesCount = 0
    let gymAdminsCount = 0
    let superAdminsCount = 0

    userRoleCounts.forEach((r) => {
      const c = Number(r.count) || 0
      totalUsers += c
      if (r.role === 'climber' || r.role === 'registered') climbersCount += c
      else if (r.role === 'route_setter') settersCount += c
      else if (r.role === 'trip_guide') guidesCount += c
      else if (r.role === 'gym_admin') gymAdminsCount += c
      else if (r.role === 'super_admin') superAdminsCount += c
      else climbersCount += c
    })

    const [cragCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(cragRegions)

    const [routeCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(routes)

    const [gymCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(gyms)

    const [communityCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(communities)

    const [ascentCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ascentLogs)

    return {
      totalUsers,
      climbersCount,
      settersCount,
      guidesCount,
      gymAdminsCount,
      superAdminsCount,
      totalCrags: Number(cragCountRes?.count) || 0,
      totalRoutes: Number(routeCountRes?.count) || 0,
      totalGyms: Number(gymCountRes?.count) || 0,
      totalCommunities: Number(communityCountRes?.count) || 0,
      totalAscents: Number(ascentCountRes?.count) || 0,
    }
  } catch (error) {
    console.error('[getSuperAdminStatsAction] Error:', error)
    return {
      totalUsers: 58,
      climbersCount: 52,
      settersCount: 3,
      guidesCount: 2,
      gymAdminsCount: 0,
      superAdminsCount: 1,
      totalCrags: 5,
      totalRoutes: 25,
      totalGyms: 3,
      totalCommunities: 3,
      totalAscents: 120,
    }
  }
}

/**
 * 2. Fetch Users List for User Management
 */
export async function getSuperAdminUsersAction(
  searchQuery?: string
): Promise<SuperAdminUserItem[]> {
  if (!isDatabaseConfigured()) return []

  const db = getDb()

  try {
    let query = db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        handle: user.handle,
        ascentsCount: user.ascentsCount,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))

    if (searchQuery && searchQuery.trim().length > 0) {
      const term = `%${searchQuery.trim()}%`
      query = query.where(or(ilike(user.name, term), ilike(user.email, term))) as any
    }

    const rows = await query

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: (r.role as UserRole) || 'climber',
      handle: r.handle,
      ascentsCount: Number(r.ascentsCount || 0),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }))
  } catch (error) {
    console.error('[getSuperAdminUsersAction] Error:', error)
    return []
  }
}

/**
 * 3. Update User Role (Climber, Route Setter, Trip Guide, Gym Admin, Super Admin)
 */
export async function updateUserRoleAction(
  userId: string,
  newRole: UserRole
): Promise<{ ok: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    await db
      .update(user)
      .set({
        role: newRole,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))

    return { ok: true }
  } catch (error) {
    console.error('[updateUserRoleAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal memperbarui role user.',
    }
  }
}

/**
 * 4. Fetch Crags with Sector & Route Counts
 */
export async function getSuperAdminCragsAction(): Promise<SuperAdminCragItem[]> {
  if (!isDatabaseConfigured()) return []

  const db = getDb()

  try {
    const cragRows = await db
      .select()
      .from(cragRegions)
      .orderBy(asc(cragRegions.name))

    const sectorRows = await db.select().from(sectors)
    const routeRows = await db
      .select({
        id: routes.id,
        sectorId: routes.sectorId,
      })
      .from(routes)

    return cragRows.map((crag) => {
      const mySectors = sectorRows.filter((s) => s.cragId === crag.id)
      const mySectorIds = new Set(mySectors.map((s) => s.id))
      const myRoutes = routeRows.filter((r) => mySectorIds.has(r.sectorId))

      return {
        id: crag.id,
        name: crag.name,
        province: crag.province,
        city: crag.province,
        description: crag.description,
        imageUrl: crag.imageUrl,
        lat: crag.coordinates?.lat || -2.5,
        lng: crag.coordinates?.lng || 118.0,
        routesCount: myRoutes.length,
        sectorsCount: mySectors.length,
        createdAt: crag.createdAt ? new Date(crag.createdAt).toISOString() : new Date().toISOString(),
        sectors: mySectors.map((s) => ({ id: s.id, name: s.name })),
      }
    })
  } catch (error) {
    console.error('[getSuperAdminCragsAction] Error:', error)
    return []
  }
}

/**
 * 5. Create New Crag (Tebing Baru)
 */
export async function createCragAction(data: {
  name: string
  province: string
  city?: string
  description?: string
  accessInfo?: string
  lat: number
  lng: number
  imageUrl?: string
}): Promise<{ ok: boolean; cragId?: string; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    const cragId = `crag-${slug}-${Date.now().toString(36)}`

    await db.insert(cragRegions).values({
      id: cragId,
      name: data.name.trim(),
      province: data.province.trim(),
      description: data.description?.trim() || '',
      coordinates: { lat: data.lat, lng: data.lng },
      imageUrl: data.imageUrl?.trim() || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
      sectorCount: 1,
      problemCount: 0,
    })

    // Automatically create a default main sector so routes can be added
    const sectorId = `sec-${cragId}-main`
    await db.insert(sectors).values({
      id: sectorId,
      cragId,
      name: 'Main Wall / Sektor Utama',
      imageUrl: '',
      description: 'Sektor Utama',
    })

    return { ok: true, cragId }
  } catch (error) {
    console.error('[createCragAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal membuat tebing baru.',
    }
  }
}

/**
 * 5b. Update Existing Crag (Edit Tebing)
 */
export async function updateCragAction(
  id: string,
  data: {
    name: string
    province: string
    city?: string
    description?: string
    lat: number
    lng: number
    imageUrl?: string
  }
): Promise<{ ok: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    await db
      .update(cragRegions)
      .set({
        name: data.name.trim(),
        province: data.province.trim(),
        description: data.description?.trim() || '',
        coordinates: { lat: data.lat, lng: data.lng },
        imageUrl: data.imageUrl?.trim() || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
      })
      .where(eq(cragRegions.id, id))

    return { ok: true }
  } catch (error) {
    console.error('[updateCragAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal memperbarui tebing.',
    }
  }
}

/**
 * 5c. Delete Crag (Hapus Tebing)
 */
export async function deleteCragAction(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    await db.delete(cragRegions).where(eq(cragRegions.id, id))
    return { ok: true }
  } catch (error) {
    console.error('[deleteCragAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal menghapus tebing.',
    }
  }
}

/**
 * 6. Fetch Routes List for Moderation
 */
export async function getSuperAdminRoutesAction(
  searchQuery?: string
): Promise<SuperAdminRouteItem[]> {
  if (!isDatabaseConfigured()) return []

  const db = getDb()

  try {
    const routeRows = await db
      .select({
        id: routes.id,
        name: routes.name,
        grade: routes.grade,
        discipline: routes.discipline,
        setter: routes.setter,
        ascentCount: routes.ascentCount,
        imageUrl: routes.imageUrl,
        createdAt: routes.createdAt,
        sectorId: routes.sectorId,
      })
      .from(routes)
      .orderBy(desc(routes.createdAt))
      .limit(100)

    const cragRows = await db.select({ id: cragRegions.id, name: cragRegions.name }).from(cragRegions)
    const sectorRows = await db.select({ id: sectors.id, name: sectors.name, cragId: sectors.cragId }).from(sectors)

    const cragMap = new Map(cragRows.map((c) => [c.id, c.name]))
    const sectorMap = new Map(sectorRows.map((s) => [s.id, { name: s.name, cragId: s.cragId }]))

    let filtered = routeRows.map((r) => {
      const sec = sectorMap.get(r.sectorId)
      const cragName = sec?.cragId ? cragMap.get(sec.cragId) || 'Outdoor Crag' : 'Outdoor Crag'
      const sectorName = sec?.name || 'General Sector'

      return {
        id: r.id,
        name: r.name,
        grade: r.grade,
        discipline: r.discipline,
        cragName,
        sectorName,
        setter: r.setter,
        ascentCount: Number(r.ascentCount || 0),
        imageUrl: r.imageUrl,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      }
    })

    if (searchQuery && searchQuery.trim().length > 0) {
      const term = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.cragName.toLowerCase().includes(term) ||
          r.grade.toLowerCase().includes(term)
      )
    }

    return filtered
  } catch (error) {
    console.error('[getSuperAdminRoutesAction] Error:', error)
    return []
  }
}

/**
 * 7. Create New Route (Jalur Baru)
 */
export async function createRouteAction(data: {
  cragId: string
  sectorId?: string
  name: string
  grade: string
  discipline: 'sport' | 'multipitch' | 'bouldering'
  description?: string
  imageUrl?: string
  setter?: string
  boltCount?: number
  anchorType?: string
  pitchLength?: string
}): Promise<{ ok: boolean; routeId?: string; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    let targetSectorId = data.sectorId

    // If no sectorId provided, find first sector for this crag or create one
    if (!targetSectorId) {
      const existingSectors = await db
        .select()
        .from(sectors)
        .where(eq(sectors.cragId, data.cragId))
        .limit(1)

      if (existingSectors.length > 0) {
        targetSectorId = existingSectors[0].id
      } else {
        targetSectorId = `sec-${data.cragId}-${Date.now().toString(36)}`
        await db.insert(sectors).values({
          id: targetSectorId,
          cragId: data.cragId,
          name: 'Main Sector',
          imageUrl: '',
          description: '',
        })
      }
    }

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    const routeId = `route-${slug}-${Date.now().toString(36)}`

    await db.insert(routes).values({
      id: routeId,
      sectorId: targetSectorId,
      name: data.name.trim(),
      grade: data.grade.trim(),
      discipline: data.discipline,
      description: data.description?.trim() || '',
      imageUrl: data.imageUrl?.trim() || null,
      setter: data.setter?.trim() || 'Super Admin',
      boltCount: data.boltCount ?? null,
      anchorType: data.anchorType?.trim() || null,
      pitchLength: data.pitchLength?.trim() || null,
      ascentCount: 0,
    })

    return { ok: true, routeId }
  } catch (error) {
    console.error('[createRouteAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal membuat jalur baru.',
    }
  }
}

/**
 * 8. Delete Route (Hapus Jalur)
 */
export async function deleteRouteAction(
  routeId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    await db.delete(routes).where(eq(routes.id, routeId))
    return { ok: true }
  } catch (error) {
    console.error('[deleteRouteAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal menghapus jalur.',
    }
  }
}

/**
 * 9. Fetch Gym Partners for Admin
 */
export async function getSuperAdminGymsAction(): Promise<SuperAdminGymItem[]> {
  if (!isDatabaseConfigured()) return []

  const db = getDb()

  try {
    const gymRows = await db
      .select()
      .from(gyms)
      .orderBy(asc(gyms.name))

    return gymRows.map((g) => {
      const visitors = (g.slotsMorning || 0) + (g.slotsAfternoon || 0) + (g.slotsEvening || 0)
      const revenue = visitors * (g.pricePerSession || 65000)

      return {
        id: g.id,
        name: g.name,
        city: g.city,
        province: g.province,
        address: g.address,
        phone: g.phone,
        instagram: g.instagram,
        imageUrl: g.imageUrl,
        pricePerSession: g.pricePerSession,
        facilities: g.facilities || [],
        picName: 'Gym Operator',
        dailyVisitors: visitors,
        todayRevenue: revenue,
        createdAt: g.createdAt ? new Date(g.createdAt).toISOString() : new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('[getSuperAdminGymsAction] Error:', error)
    return []
  }
}

/**
 * 9b. Create New Gym Partner
 */
export async function createGymAction(data: {
  name: string
  city: string
  province: string
  address: string
  phone: string
  instagram?: string
  imageUrl?: string
  pricePerSession?: number
  facilities?: string[]
}): Promise<{ ok: boolean; gymId?: string; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    const gymId = `gym-${slug}-${Date.now().toString(36)}`

    await db.insert(gyms).values({
      id: gymId,
      name: data.name.trim(),
      city: data.city.trim(),
      province: data.province.trim(),
      address: data.address.trim(),
      phone: data.phone.trim(),
      instagram: data.instagram?.trim() || '',
      imageUrl: data.imageUrl?.trim() || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
      pricePerSession: data.pricePerSession || 65000,
      facilities: data.facilities && data.facilities.length > 0 ? data.facilities : ['Bouldering Wall', 'Lead Wall', 'Rental Shoes', 'Locker Room'],
      rating: '5.0',
      reviewCount: 1,
      slotsMorning: 5,
      slotsAfternoon: 8,
      slotsEvening: 12,
    })

    return { ok: true, gymId }
  } catch (error) {
    console.error('[createGymAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal menambahkan gym baru.',
    }
  }
}

/**
 * 9c. Update Existing Gym Partner
 */
export async function updateGymAction(
  id: string,
  data: {
    name: string
    city: string
    province: string
    address: string
    phone: string
    instagram?: string
    imageUrl?: string
    pricePerSession?: number
    facilities?: string[]
  }
): Promise<{ ok: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    await db
      .update(gyms)
      .set({
        name: data.name.trim(),
        city: data.city.trim(),
        province: data.province.trim(),
        address: data.address.trim(),
        phone: data.phone.trim(),
        instagram: data.instagram?.trim() || '',
        imageUrl: data.imageUrl?.trim() || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
        pricePerSession: data.pricePerSession || 65000,
        facilities: data.facilities && data.facilities.length > 0 ? data.facilities : ['Bouldering Wall', 'Lead Wall', 'Rental Shoes', 'Locker Room'],
      })
      .where(eq(gyms.id, id))

    return { ok: true }
  } catch (error) {
    console.error('[updateGymAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal memperbarui data gym.',
    }
  }
}

/**
 * 9d. Delete Gym Partner
 */
export async function deleteGymAction(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    await db.delete(gyms).where(eq(gyms.id, id))
    return { ok: true }
  } catch (error) {
    console.error('[deleteGymAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal menghapus data gym.',
    }
  }
}

export interface SuperAdminCommunityItem {
  id: string
  name: string
  city: string
  province: string
  imageUrl: string
  memberCount: number
  homebase: string
  description: string
  whatsapp: string
  instagram: string
  tags: string[]
  createdAt: string
}

/**
 * 10. Fetch Communities for Super Admin
 */
export async function getSuperAdminCommunitiesAction(): Promise<SuperAdminCommunityItem[]> {
  if (!isDatabaseConfigured()) return []

  const db = getDb()

  try {
    const rows = await db
      .select()
      .from(communities)
      .orderBy(desc(communities.memberCount))

    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      province: c.province,
      imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=80',
      memberCount: c.memberCount || 0,
      homebase: c.homebase || '',
      description: c.description || '',
      whatsapp: c.whatsapp || '',
      instagram: c.instagram || '',
      tags: c.tags || [],
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    }))
  } catch (error) {
    console.error('[getSuperAdminCommunitiesAction] Error:', error)
    return []
  }
}

/**
 * 11. Create New Community
 */
export async function createCommunityAction(input: {
  name: string
  city: string
  province: string
  homebase: string
  description: string
  whatsapp: string
  instagram: string
  imageUrl?: string
  tags?: string[]
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const id = `comm-${slug || Date.now().toString(36)}`

    await db.insert(communities).values({
      id,
      name: input.name.trim(),
      city: input.city.trim(),
      province: input.province.trim(),
      homebase: input.homebase.trim(),
      description: input.description.trim(),
      whatsapp: input.whatsapp.trim(),
      instagram: input.instagram.trim(),
      imageUrl: input.imageUrl?.trim() || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
      tags: input.tags && input.tags.length > 0 ? input.tags : ['Bouldering', 'Sport Climbing'],
      memberCount: 1,
      members: [],
    })

    return { ok: true, id }
  } catch (error) {
    console.error('[createCommunityAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal membuat komunitas baru.',
    }
  }
}

/**
 * 12. Update Community
 */
export async function updateCommunityAction(
  id: string,
  input: {
    name: string
    city: string
    province: string
    homebase: string
    description: string
    whatsapp: string
    instagram: string
    imageUrl?: string
    tags?: string[]
  }
): Promise<{ ok: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    await db
      .update(communities)
      .set({
        name: input.name.trim(),
        city: input.city.trim(),
        province: input.province.trim(),
        homebase: input.homebase.trim(),
        description: input.description.trim(),
        whatsapp: input.whatsapp.trim(),
        instagram: input.instagram.trim(),
        imageUrl: input.imageUrl?.trim() || undefined,
        tags: input.tags && input.tags.length > 0 ? input.tags : undefined,
      })
      .where(eq(communities.id, id))

    return { ok: true }
  } catch (error) {
    console.error('[updateCommunityAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal memperbarui komunitas.',
    }
  }
}

/**
 * 13. Delete Community
 */
export async function deleteCommunityAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database belum terhubung.' }
  }

  const db = getDb()

  try {
    await db.delete(communities).where(eq(communities.id, id))
    return { ok: true }
  } catch (error) {
    console.error('[deleteCommunityAction] Error:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal menghapus komunitas.',
    }
  }
}
