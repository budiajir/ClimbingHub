import 'dotenv/config'
import { config } from 'dotenv'
import { getDb, user, gyms, cragRegions, sectors, routes, communities, communityPosts } from '../lib/db'
import { cragRegions as mockCrags, gyms as mockGyms, communities as mockCommunities } from '../lib/mock-data'
import { normalizeIsoDate, normalizeRouteDiscipline } from '../lib/problem-helpers'

config({ path: '.env.local', override: false })

async function seed() {
  const db = getDb()

  console.log('Seeding users...')
  await db
    .insert(user)
    .values([
      {
        id: 'owner-1',
        name: 'Chief Route Curator',
        email: 'owner@climbhub.id',
        emailVerified: true,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
        role: 'super_admin',
        handle: '@climbhub_admin',
        gradeMax: 'Platform Owner',
        ascentsCount: 156,
      },
      {
        id: 'user-1',
        name: 'Ahmad Rizki',
        email: 'ahmad.rizki@climbhub.id',
        emailVerified: true,
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
        role: 'registered',
        handle: '@ahmad_crusher',
        gradeMax: 'V7 Crusher',
        ascentsCount: 42,
      },
    ])
    .onConflictDoNothing()

  console.log('Seeding gyms...')
  await db
    .insert(gyms)
    .values(
      mockGyms.map((g) => ({
        id: g.id,
        name: g.name,
        city: g.city,
        province: g.province,
        imageUrl: g.image,
        logoUrl: g.logo ?? null,
        galleryImageUrls: g.images ?? [],
        rating: String(g.rating ?? 0),
        reviewCount: g.reviewCount ?? 0,
        slotsMorning: g.slots.morning,
        slotsAfternoon: g.slots.afternoon,
        slotsEvening: g.slots.evening,
        maxSlotsMorning: g.maxSlots.morning,
        maxSlotsAfternoon: g.maxSlots.afternoon,
        maxSlotsEvening: g.maxSlots.evening,
        facilities: g.facilities ?? [],
        pricePerSession: g.pricePerSession ?? 0,
        address: g.address ?? '',
        routeSetters: g.routeSetters ?? [],
        description: g.description ?? '',
        phone: g.phone ?? '',
        instagram: g.instagram ?? '',
        gmapsUrl: g.gmapsUrl ?? null,
      }))
    )
    .onConflictDoNothing()

  console.log('Seeding crags, sectors, and routes...')
  for (const crag of mockCrags) {
    await db
      .insert(cragRegions)
      .values({
        id: crag.id,
        name: crag.name,
        province: crag.province,
        imageUrl: crag.image,
        description: crag.description ?? '',
        sectorCount: crag.sectorCount ?? crag.sectors.length,
        problemCount: crag.problemCount ?? 0,
        coordinates: crag.coordinates ?? null,
        gmapsUrl: crag.gmapsUrl ?? null,
        rockType: crag.rockType ?? crag.stoneTypology ?? null,
      })
      .onConflictDoNothing()

    for (const sector of crag.sectors) {
      await db
        .insert(sectors)
        .values({
          id: sector.id,
          cragId: crag.id,
          name: sector.name,
          imageUrl: sector.image ?? crag.image,
          description: sector.description ?? null,
        })
        .onConflictDoNothing()

      if (sector.problems.length > 0) {
        await db
          .insert(routes)
          .values(
            sector.problems.map((p) => ({
              id: p.id,
              sectorId: sector.id,
              name: p.name,
              discipline: normalizeRouteDiscipline(p.discipline),
              grade: p.grade,
              fontGrade: p.fontGrade ?? '',
              setter: p.setter ?? '',
              fa: p.fa ?? '',
              faDate: normalizeIsoDate(p.faDate),
              description: p.description ?? '',
              imageUrl: p.imageUrl ?? null,
              betaVideoUrl: p.betaVideoUrl ?? null,
              accessInfo: p.accessInfo ?? '',
              localContact: p.localContact ?? '',
              ascentCount: p.ascentCount ?? 0,
              gradeVotes: p.gradeVotes ?? [],
              markers: p.markers ?? [],
              pitchLength: p.pitchLength ?? null,
              boltCount: p.boltCount ?? null,
              anchorType: p.anchorType ?? null,
              totalPitches: p.totalPitches ?? null,
              totalHeight: p.totalHeight ?? null,
              pitchBreakdown: p.pitchBreakdown ?? null,
              descentInfo: p.descentInfo ?? null,
              padRecommendation: p.padRecommendation ?? null,
              landingQuality: p.landingQuality ?? null,
              startType: p.startType ?? null,
            }))
          )
          .onConflictDoNothing()
      }
    }
  }

  console.log('Seeding communities...')
  await db
    .insert(communities)
    .values(
      mockCommunities.map((c) => ({
        id: c.id,
        name: c.name,
        city: c.city,
        province: c.province,
        imageUrl: c.image,
        memberCount: c.memberCount ?? 0,
        homebase: c.homebase ?? '',
        description: c.description ?? '',
        whatsapp: c.whatsapp ?? '',
        instagram: c.instagram ?? '',
        tags: c.tags ?? [],
        members: c.members ?? [],
      }))
    )
    .onConflictDoNothing()

  console.log('Seed completed cleanly.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
