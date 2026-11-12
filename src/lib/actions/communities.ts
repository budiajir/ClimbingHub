'use server'

import { desc } from 'drizzle-orm'
import { communities, getDb, isDatabaseConfigured } from '../db'
import type { Community } from '../mock-data'

/**
 * Fetch all communities from the database.
 * Falls back to mock data if DATABASE_URL is not configured or the table is empty.
 */
export async function getCommunities(): Promise<Community[]> {
  try {
    if (!isDatabaseConfigured()) {
      const { communities: mockCommunities } = await import('../mock-data')
      return mockCommunities
    }

    const db = getDb()
    const rows = await db
      .select()
      .from(communities)
      .orderBy(desc(communities.memberCount))

    if (!rows || rows.length === 0) {
      const { communities: mockCommunities } = await import('../mock-data')
      return mockCommunities
    }

    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      province: c.province,
      image: c.imageUrl,
      memberCount: c.memberCount,
      homebase: c.homebase,
      description: c.description,
      whatsapp: c.whatsapp,
      instagram: c.instagram,
      tags: c.tags ?? [],
      members: c.members ?? [],
    }))
  } catch {
    const { communities: mockCommunities } = await import('../mock-data')
    return mockCommunities
  }
}
