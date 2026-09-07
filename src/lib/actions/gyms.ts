'use server'

import { getSupabaseServerClient } from '../supabase'
import type { Gym } from '../mock-data'

/**
 * Fetch all gyms from the database.
 * Falls back to mock data if the database is empty or unreachable.
 */
export async function getGyms(): Promise<Gym[]> {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .order('rating', { ascending: false })

    if (error) throw error
    if (!data || data.length === 0) {
      // Fallback to mock data
      const { gyms } = await import('../mock-data')
      return gyms
    }

    return (data as any[]).map((g: any) => ({
      id: g.id,
      name: g.name,
      city: g.city,
      province: g.province,
      image: g.image,
      rating: Number(g.rating),
      reviewCount: g.review_count,
      slots: {
        morning: g.slots_morning,
        afternoon: g.slots_afternoon,
        evening: g.slots_evening,
      },
      maxSlots: {
        morning: g.max_slots_morning,
        afternoon: g.max_slots_afternoon,
        evening: g.max_slots_evening,
      },
      facilities: g.facilities,
      pricePerSession: g.price_per_session,
      address: g.address,
      routeSetters: g.route_setters,
      description: g.description,
      phone: g.phone,
      instagram: g.instagram,
    }))
  } catch {
    // Fallback to mock data on any error
    const { gyms } = await import('../mock-data')
    return gyms
  }
}

/**
 * Fetch a single gym by ID.
 */
export async function getGymById(id: string): Promise<Gym | null> {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return null

    const gymData = data as any
    return {
      id: gymData.id,
      name: gymData.name,
      city: gymData.city,
      province: gymData.province,
      image: gymData.image,
      rating: Number(gymData.rating),
      reviewCount: gymData.review_count,
      slots: {
        morning: gymData.slots_morning,
        afternoon: gymData.slots_afternoon,
        evening: gymData.slots_evening,
      },
      maxSlots: {
        morning: gymData.max_slots_morning,
        afternoon: gymData.max_slots_afternoon,
        evening: gymData.max_slots_evening,
      },
      facilities: gymData.facilities,
      pricePerSession: gymData.price_per_session,
      address: gymData.address,
      routeSetters: gymData.route_setters,
      description: gymData.description,
      phone: gymData.phone,
      instagram: gymData.instagram,
    }
  } catch {
    // Fallback to mock data
    const { gyms } = await import('../mock-data')
    return gyms.find((g) => g.id === id) ?? null
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
  const supabase = getSupabaseServerClient()
  const columnMap = {
    morning: 'slots_morning',
    afternoon: 'slots_afternoon',
    evening: 'slots_evening',
  } as const

  const { error } = await supabase
    .from('gyms')
    .update({ [columnMap[slot]]: newCount })
    .eq('id', gymId)

  if (error) throw error
  return { success: true }
}
