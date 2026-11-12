'use server'

import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { TopoMarkerJson } from '@/db/schema'
import { getServerSession } from '@/lib/auth'
import { ascentLogs, communities, communityPhotos, getDb, isDatabaseConfigured, routes, user } from '@/lib/db'

function isBase64DataUrl(url?: string | null): boolean {
  return Boolean(url && url.trim().toLowerCase().startsWith('data:'))
}

export async function saveCommunityPhotoAction(input: {
  communityId: string
  imageUrl: string
  caption: string
  uploaderName: string
  uploaderAvatarUrl?: string
}): Promise<{ ok: boolean; persisted: boolean; photoId?: string; error?: string }> {
  if (isBase64DataUrl(input.imageUrl) || isBase64DataUrl(input.uploaderAvatarUrl)) {
    return {
      ok: false,
      persisted: false,
      error: 'Gambar harus berupa URL Cloudinary (bukan data base64).',
    }
  }

  if (!isDatabaseConfigured()) {
    return { ok: true, persisted: false }
  }

  try {
    const db = getDb()
    const [existingCommunity] = await db
      .select({ id: communities.id })
      .from(communities)
      .where(eq(communities.id, input.communityId))
      .limit(1)

    if (!existingCommunity) {
      return { ok: true, persisted: false }
    }

    const session = await getServerSession()
    const photoId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    await db.insert(communityPhotos).values({
      id: photoId,
      communityId: input.communityId,
      userId: session?.user?.id ?? null,
      imageUrl: input.imageUrl,
      caption: input.caption.trim(),
      uploaderName: input.uploaderName.trim() || 'Climber',
      uploaderAvatarUrl: input.uploaderAvatarUrl || null,
      likesCount: 1,
    })

    revalidatePath('/community')
    revalidatePath(`/community/${input.communityId}`)

    return { ok: true, persisted: true, photoId }
  } catch (err) {
    console.error('saveCommunityPhotoAction error:', err)
    return { ok: true, persisted: false }
  }
}

export async function saveAscentLogAction(input: {
  routeId: string
  ascentType: 'redpoint' | 'flash' | 'onsight' | 'repeat'
  gradeOpinion?: string
  notes?: string
  imageUrl?: string
  videoUrl?: string
  climberName?: string
  attempts?: string
  duration?: string
  belayer?: string
  photographer?: string
  wallAngle?: string
  wallHeight?: string
  boltsCount?: string
  locationLabel?: string
  provinceCountry?: string
  markers?: TopoMarkerJson[]
}): Promise<{ ok: boolean; persisted: boolean; error?: string }> {
  if (isBase64DataUrl(input.imageUrl) || isBase64DataUrl(input.videoUrl)) {
    return {
      ok: false,
      persisted: false,
      error: 'Media Send Card harus berupa URL (bukan data base64).',
    }
  }

  if (!isDatabaseConfigured()) {
    return { ok: true, persisted: false }
  }

  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { ok: true, persisted: false }
    }

    const db = getDb()
    const [existingRoute] = await db
      .select({ id: routes.id })
      .from(routes)
      .where(eq(routes.id, input.routeId))
      .limit(1)

    if (!existingRoute) {
      return { ok: true, persisted: false }
    }

    await db.insert(ascentLogs).values({
      userId: session.user.id,
      routeId: input.routeId,
      ascentType: input.ascentType,
      gradeOpinion: input.gradeOpinion || null,
      notes: input.notes || null,
      imageUrl: input.imageUrl || null,
      videoUrl: input.videoUrl || null,
      climberName: input.climberName || session.user.name,
      attempts: input.attempts || null,
      duration: input.duration || null,
      belayer: input.belayer || null,
      photographer: input.photographer || null,
      wallAngle: input.wallAngle || null,
      wallHeight: input.wallHeight || null,
      boltsCount: input.boltsCount || null,
      locationLabel: input.locationLabel || null,
      provinceCountry: input.provinceCountry || null,
      markers: input.markers || [],
    })

    await db
      .update(user)
      .set({ ascentsCount: sql`${user.ascentsCount} + 1` })
      .where(eq(user.id, session.user.id))

    revalidatePath('/beta')
    revalidatePath('/project-sent')
    revalidatePath('/account')

    return { ok: true, persisted: true }
  } catch (err) {
    console.error('saveAscentLogAction error:', err)
    return { ok: true, persisted: false }
  }
}

export async function updateUserAvatarAction(
  imageUrl: string
): Promise<{ ok: boolean; persisted: boolean; error?: string }> {
  if (isBase64DataUrl(imageUrl)) {
    return {
      ok: false,
      persisted: false,
      error: 'Foto profil harus berupa URL Cloudinary (bukan data base64).',
    }
  }

  if (!isDatabaseConfigured()) {
    return { ok: true, persisted: false }
  }

  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { ok: true, persisted: false }
    }

    const db = getDb()
    await db
      .update(user)
      .set({ image: imageUrl.trim() || null })
      .where(eq(user.id, session.user.id))

    revalidatePath('/friends')
    revalidatePath('/climbers')
    revalidatePath('/account')

    return { ok: true, persisted: true }
  } catch (err) {
    console.error('updateUserAvatarAction error:', err)
    return { ok: true, persisted: false }
  }
}
