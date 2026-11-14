'use server'

import { desc, eq } from 'drizzle-orm'
import { getDb, gyms, isDatabaseConfigured } from '../db'
import type { Gym } from '../mock-data'

function mapGymRow(g: typeof gyms.$inferSelect): Gym {
  return {
    id: g.id,
    name: g.name,
    city: g.city,
    province: g.province,
    image: g.imageUrl,
    images: g.galleryImageUrls?.length ? g.galleryImageUrls : undefined,
    logo: g.logoUrl || undefined,
    gmapsUrl: g.gmapsUrl || undefined,
    rating: Number(g.rating || 0),
    reviewCount: g.reviewCount,
    slots: {
      morning: g.slotsMorning,
      afternoon: g.slotsAfternoon,
      evening: g.slotsEvening,
    },
    maxSlots: {
      morning: g.maxSlotsMorning,
      afternoon: g.maxSlotsAfternoon,
      evening: g.maxSlotsEvening,
    },
    facilities: g.facilities ?? [],
    pricePerSession: g.pricePerSession,
    address: g.address,
    routeSetters: g.routeSetters ?? [],
    description: g.description,
    phone: g.phone,
    instagram: g.instagram,
  }
}

/**
 * Fetch all gyms from the database.
 * Falls back to mock data if DATABASE_URL is not configured or the table is empty.
 */
export async function getGyms(): Promise<Gym[]> {
  try {
    if (!isDatabaseConfigured()) {
      const { gyms: mockGyms } = await import('../mock-data')
      return mockGyms
    }

    const db = getDb()
    const rows = await db.select().from(gyms).orderBy(desc(gyms.rating))

    if (!rows || rows.length === 0) {
      return []
    }

    return rows.map(mapGymRow)
  } catch {
    const { gyms: mockGyms } = await import('../mock-data')
    return mockGyms
  }
}

/**
 * Fetch a single gym by ID.
 */
export async function getGymById(id: string): Promise<Gym | null> {
  try {
    if (!isDatabaseConfigured()) {
      const { gyms: mockGyms } = await import('../mock-data')
      return mockGyms.find((g) => g.id === id) ?? null
    }

    const db = getDb()
    const [row] = await db.select().from(gyms).where(eq(gyms.id, id)).limit(1)
    if (!row) return null

    return mapGymRow(row)
  } catch {
    const { gyms: mockGyms } = await import('../mock-data')
    return mockGyms.find((g) => g.id === id) ?? null
  }
}

/**
 * Update gym slot availability.
 */
export async function updateGymSlots(
  gymId: string,
  slot: 'morning' | 'afternoon' | 'evening',
  newCount: number
) {
  const db = getDb()
  const updatePayload =
    slot === 'morning'
      ? { slotsMorning: newCount }
      : slot === 'afternoon'
      ? { slotsAfternoon: newCount }
      : { slotsEvening: newCount }

  await db.update(gyms).set(updatePayload).where(eq(gyms.id, gymId))
  return { success: true }
}
