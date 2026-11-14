'use client'

export type CommunityAuthorType = 'climber' | 'squad' | 'gym' | 'member'

export interface CommunityPost {
  id: string
  userId: string
  userName: string
  userHandle: string
  avatar: string
  hometown: string
  timeAgo: string
  activity: string
  location: string
  grade?: string
  caption: string
  image: string
  likes: number
  hasLiked?: boolean
  authorType?: CommunityAuthorType
  sharedUrl?: string
  comments: { user: string; text: string }[]
}

export const DEFAULT_COMMUNITY_POSTS: CommunityPost[] = []

const STORAGE_KEY = 'jalur_community_posts_v4'

export function getCommunityPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return DEFAULT_COMMUNITY_POSTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMMUNITY_POSTS))
      return DEFAULT_COMMUNITY_POSTS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_COMMUNITY_POSTS
  }
}

export function addCommunityPost(post: CommunityPost): void {
  if (typeof window === 'undefined') return
  const current = getCommunityPosts()
  const next = [post, ...current]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('community-posts-updated', { detail: next }))
}

export function togglePostLike(postId: string): CommunityPost[] {
  if (typeof window === 'undefined') return DEFAULT_COMMUNITY_POSTS
  const current = getCommunityPosts()
  const next = current.map((p) => {
    if (p.id !== postId) return p
    const hasLiked = !!p.hasLiked
    return {
      ...p,
      hasLiked: !hasLiked,
      likes: hasLiked ? p.likes - 1 : p.likes + 1,
    }
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('community-posts-updated', { detail: next }))
  return next
}
