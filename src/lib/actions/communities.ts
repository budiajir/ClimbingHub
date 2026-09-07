'use server'

import { getSupabaseServerClient } from '../supabase'
import type { Community } from '../mock-data'

/**
 * Fetch all communities from the database.
 * Falls back to mock data if the database is empty.
 */
export async function getCommunities(): Promise<Community[]> {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false })

    if (error) throw error
    if (!data || data.length === 0) {
      const { communities } = await import('../mock-data')
      return communities
    }

    return (data as any[]).map((c: any) => ({
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
    }))
  } catch {
    const { communities } = await import('../mock-data')
    return communities
  }
}
