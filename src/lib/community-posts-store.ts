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

export const DEFAULT_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    userId: 'climber-1',
    userName: 'Budi Prasetyo',
    userHandle: '@budiclimb',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    hometown: 'Bandung',
    timeAgo: '2 hours ago',
    activity: 'Flash Send · Problem Gorejat',
    location: 'Harau Valley · Sarasah Bonta',
    grade: 'V7 (7A+)',
    caption: 'Akhirnya send juga project lama di Sarasah Bonta! Friction batu granit Harau sore hari ini lagi gokil banget.',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=900&q=80',
    likes: 38,
    comments: [
      { user: 'Dimas Anggara', text: 'Gokil mantap brother!! Beta undercling nya dapet akhirnya' },
      { user: 'Sarah Amalia', text: 'Keren banget mas Budi!' },
    ],
  },
  {
    id: 'post-2',
    userId: 'climber-2',
    userName: 'Sarah Amalia',
    userHandle: '@sarah.climbs',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    hometown: 'Jakarta',
    timeAgo: '5 hours ago',
    activity: 'Session Training · Indoclimb FX Sudirman',
    location: 'Indoclimb FX Sudirman · Jakarta Pusat',
    caption: 'Sesi latihan malam bareng squad Boulder Bastards. Reset rute baru di overhang sector bikin pump banget!',
    image: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=900&q=80',
    likes: 45,
    comments: [
      { user: 'Rani Wijaya', text: 'Next week join lagi yaa sar!' },
    ],
  },
  {
    id: 'post-3',
    userId: 'climber-3',
    userName: 'Dimas Anggara',
    userHandle: '@dimas_boulder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    hometown: 'Yogyakarta',
    timeAgo: '1 day ago',
    activity: 'Outdoor Ascent · Tebing Siung Karst',
    location: 'Tebing Siung · Pantai Siung',
    grade: '6c (5.11a)',
    caption: 'Sesi sunset climbing di pinggir ombak Siung. Angin laut sejuk, anchor bersih dan view luar biasa.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    likes: 62,
    comments: [
      { user: 'Budi Prasetyo', text: 'Spot favorit jogja emang Siung!' },
    ],
  },
  {
    id: 'post-4',
    userId: 'climber-4',
    userName: 'Rani Wijaya',
    userHandle: '@rani_rock',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    hometown: 'Surabaya',
    timeAgo: '2 days ago',
    activity: 'Project Tick · Citatah 90 Boulder',
    location: 'Citatah 90 · Padalarang',
    grade: 'V5 (6C)',
    caption: 'Crux heel hook yang super technical di Citatah 90 akhirnya beres! Terima kasih teman-teman yang udah bantuin spot & pad stacking.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80',
    likes: 51,
    comments: [
      { user: 'Guntur Putra', text: 'Solid heel hook tekniknya Rani!' },
    ],
  },
]

const STORAGE_KEY = 'jalur_community_posts_v1'

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
