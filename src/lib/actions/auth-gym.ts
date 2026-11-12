'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getServerSession } from '@/lib/auth'
import { getDb, gyms, isDatabaseConfigured, user } from '@/lib/db'
import type { GymTenant } from '@/lib/permissions'

export interface RegisterGymPartnerInput {
  name: string
  city: string
  province?: string
  address: string
  phone: string
  picName: string
}

function slugifyGymName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'partner-gym'
}

export async function registerGymPartnerAction(input: RegisterGymPartnerInput): Promise<{
  ok: boolean
  persisted: boolean
  gymId?: string
  error?: string
}> {
  if (!isDatabaseConfigured()) {
    return {
      ok: true,
      persisted: false,
      gymId: `gym-${slugifyGymName(input.name)}-${Date.now().toString(36)}`,
    }
  }

  const session = await getServerSession()
  if (!session?.user?.id) {
    return {
      ok: false,
      persisted: false,
      error: 'Sesi login partner tidak ditemukan. Silakan daftar atau masuk terlebih dahulu.',
    }
  }

  const gymId = `gym-${slugifyGymName(input.name)}-${Date.now().toString(36)}`
  const db = getDb()

  await db
    .update(user)
    .set({
      role: 'gym_admin',
      hometown: input.city,
      name: input.picName || session.user.name,
    })
    .where(eq(user.id, session.user.id))

  await db.insert(gyms).values({
    id: gymId,
    ownerId: session.user.id,
    name: input.name,
    city: input.city,
    province: input.province || input.city,
    imageUrl: '/images/gyms/default-gym.jpg',
    address: input.address,
    phone: input.phone,
    routeSetters: input.picName ? [input.picName] : [],
    facilities: ['Bouldering', 'Air Conditioning', 'Rental Shoes'],
    description: `${input.name} — Partner climbing gym dikelola oleh ${input.picName}.`,
  })

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/gyms')

  return {
    ok: true,
    persisted: true,
    gymId,
  }
}

export async function getMyManagedGymAction(): Promise<GymTenant | null> {
  if (!isDatabaseConfigured()) {
    return null
  }

  const session = await getServerSession()
  if (!session?.user?.id) {
    return null
  }

  try {
    const db = getDb()
    const [ownedGym] = await db
      .select()
      .from(gyms)
      .where(eq(gyms.ownerId, session.user.id))
      .limit(1)

    if (!ownedGym) {
      return null
    }

    const basePrice = ownedGym.pricePerSession || 75000

    return {
      id: ownedGym.id,
      name: ownedGym.name,
      city: ownedGym.city,
      province: ownedGym.province,
      address: ownedGym.address,
      phone: ownedGym.phone,
      picName: session.user.name,
      registeredAt: ownedGym.createdAt.toISOString().split('T')[0],
      dailyVisitors: 0,
      todayRevenue: 0,
      slots: {
        morning: ownedGym.slotsMorning,
        afternoon: ownedGym.slotsAfternoon,
        evening: ownedGym.slotsEvening,
      },
      maxSlots: {
        morning: ownedGym.maxSlotsMorning,
        afternoon: ownedGym.maxSlotsAfternoon,
        evening: ownedGym.maxSlotsEvening,
      },
      prices: {
        morning: basePrice,
        afternoon: basePrice,
        evening: basePrice,
      },
    }
  } catch {
    return null
  }
}
