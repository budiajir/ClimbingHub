// Client-side social state: Friends, Community Chat (Friends / Route Setters / Trip Guides), and Invites

export type ChatRoleType = 'friend' | 'route_setter' | 'trip_guide'

export interface ChatContact {
  id: string
  name: string
  handle: string
  avatar: string
  roleType: ChatRoleType
  roleLabel: string
  location: string
  badge?: string
  online?: boolean
}

export interface ChatMessage {
  id: string
  contactId: string
  sender: 'me' | 'them'
  text: string
  timeLabel: string
  shareUrl?: string
  createdAt: string
}

export interface CommunityInvite {
  id: string
  targetName: string
  targetContact: string
  squadId?: string
  squadName?: string
  createdAt: string
  status: 'Sent'
}

const FRIENDS_STORAGE_KEY = 'jalur_connected_friends_v1'
const CHAT_STORAGE_KEY = 'jalur_chat_threads_v1'
const INVITES_STORAGE_KEY = 'jalur_community_invites_v1'

const DEFAULT_CONNECTED_FRIENDS: string[] = ['climber-1', 'climber-3']

export const DEFAULT_CHAT_CONTACTS: ChatContact[] = [
  {
    id: 'climber-1',
    name: 'Raka Pratama',
    handle: '@raka.boulders',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    roleType: 'friend',
    roleLabel: 'Climbing Partner',
    location: 'Jakarta Selatan',
    badge: 'V6 / 5.12a',
    online: true,
  },
  {
    id: 'climber-2',
    name: 'Nadia Kusuma',
    handle: '@nadia.sends',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
    roleType: 'friend',
    roleLabel: 'Friend',
    location: 'Bandung',
    badge: 'V7 / 5.12c',
    online: true,
  },
  {
    id: 'climber-3',
    name: 'Dimas Wijaya',
    handle: '@dimas.crags',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80',
    roleType: 'friend',
    roleLabel: 'Squad Lead',
    location: 'Yogyakarta',
    badge: 'V5 / 5.11c',
    online: false,
  },
  {
    id: 'setter-1',
    name: 'Andi Wahyu',
    handle: '@andi.setter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    roleType: 'route_setter',
    roleLabel: 'Certified Route Setter',
    location: 'Citatah & Tebing 125',
    badge: 'Jalur Setter',
    online: true,
  },
  {
    id: 'setter-2',
    name: 'Kadek Surya',
    handle: '@kadek.setroute',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
    roleType: 'route_setter',
    roleLabel: 'Lead & Boulder Setter',
    location: 'Bali & Jakarta Gyms',
    badge: 'Jalur Setter',
    online: true,
  },
  {
    id: 'guide-1',
    name: 'Bima Sakti',
    handle: '@bima.tripguide',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    roleType: 'trip_guide',
    roleLabel: 'Licensed Crag Trip Guide',
    location: 'Harau & Parang',
    badge: 'Trip Guide',
    online: true,
  },
  {
    id: 'guide-2',
    name: 'Tania Laras',
    handle: '@tania.dwsguide',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    roleType: 'trip_guide',
    roleLabel: 'Coastal Cliff Guide',
    location: 'Uluwatu, Bali',
    badge: 'Trip Guide',
    online: false,
  },
]

const DEFAULT_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'climber-1': [
    {
      id: 'm-1',
      contactId: 'climber-1',
      sender: 'them',
      text: 'Minggu pagi jadi merapat ke Tebing Citatah 125? Bawa quickdraw cadangan ya!',
      timeLabel: '09:15',
      createdAt: '2026-11-11T09:15:00.000Z',
    },
    {
      id: 'm-2',
      contactId: 'climber-1',
      sender: 'me',
      text: 'Gass! Gue bawa 12 draws sama tali 70m. Jam 7 kita ketemu di meeting point.',
      timeLabel: '09:22',
      createdAt: '2026-11-11T09:22:00.000Z',
    },
  ],
  'setter-1': [
    {
      id: 'm-3',
      contactId: 'setter-1',
      sender: 'them',
      text: 'Halo! Bolt #3 dan hanger anchor di Sektor Timur baru aja dicek ulang minggu ini. Aman untuk lead 5.11b.',
      timeLabel: 'Yesterday',
      createdAt: '2026-11-10T14:20:00.000Z',
    },
  ],
  'guide-1': [
    {
      id: 'm-4',
      contactId: 'guide-1',
      sender: 'them',
      text: 'Open slot buat akses Lembah Harau weekend depan. Info cuaca & kondisi batuan granit bisa tanya langsung di sini.',
      timeLabel: 'Yesterday',
      createdAt: '2026-11-10T11:05:00.000Z',
    },
  ],
}

export function getConnectedFriends(): string[] {
  if (typeof window === 'undefined') return DEFAULT_CONNECTED_FRIENDS
  try {
    const raw = localStorage.getItem(FRIENDS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(DEFAULT_CONNECTED_FRIENDS))
      return DEFAULT_CONNECTED_FRIENDS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : DEFAULT_CONNECTED_FRIENDS
  } catch {
    return DEFAULT_CONNECTED_FRIENDS
  }
}

export function isFriendConnected(id: string): boolean {
  return getConnectedFriends().includes(id)
}

export function toggleFriendConnection(id: string): boolean {
  if (typeof window === 'undefined') return false
  const current = getConnectedFriends()
  const exists = current.includes(id)
  const next = exists ? current.filter((item) => item !== id) : [...current, id]
  try {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('social-friends-updated'))
  } catch {
    // ignore storage errors
  }
  return !exists
}

export function getChatContacts(): ChatContact[] {
  return DEFAULT_CHAT_CONTACTS
}

function getAllChatThreads(): Record<string, ChatMessage[]> {
  if (typeof window === 'undefined') return DEFAULT_CHAT_MESSAGES
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(DEFAULT_CHAT_MESSAGES))
      return DEFAULT_CHAT_MESSAGES
    }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : DEFAULT_CHAT_MESSAGES
  } catch {
    return DEFAULT_CHAT_MESSAGES
  }
}

export function getChatMessages(contactId: string): ChatMessage[] {
  const threads = getAllChatThreads()
  return threads[contactId] || []
}

export function sendChatMessage(contactId: string, text: string, shareUrl?: string): ChatMessage {
  const now = new Date()
  const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    contactId,
    sender: 'me',
    text: text.trim(),
    timeLabel,
    shareUrl,
    createdAt: now.toISOString(),
  }

  if (typeof window !== 'undefined') {
    const threads = getAllChatThreads()
    const existing = threads[contactId] || []
    const nextThreads = {
      ...threads,
      [contactId]: [...existing, newMsg],
    }
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(nextThreads))
      window.dispatchEvent(new CustomEvent('social-chat-updated'))
    } catch {
      // ignore storage errors
    }
  }

  return newMsg
}

export function getCommunityInvites(): CommunityInvite[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(INVITES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function sendCommunityInvite(input: {
  targetName: string
  targetContact: string
  squadId?: string
  squadName?: string
}): CommunityInvite {
  const invite: CommunityInvite = {
    id: `inv-${Date.now()}`,
    targetName: input.targetName.trim(),
    targetContact: input.targetContact.trim(),
    squadId: input.squadId,
    squadName: input.squadName,
    createdAt: new Date().toISOString(),
    status: 'Sent',
  }

  if (typeof window !== 'undefined') {
    const current = getCommunityInvites()
    try {
      localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify([invite, ...current]))
      window.dispatchEvent(new CustomEvent('social-invites-updated'))
    } catch {
      // ignore storage errors
    }
  }

  return invite
}

export interface PersonalFeedPost {
  id: string
  userName: string
  activity: string
  location: string
  grade?: string
  caption: string
  image: string
  createdAt: string
}

const PERSONAL_FEED_KEY = 'jalur_personal_feed_v1'

export function getPersonalFeedPosts(): PersonalFeedPost[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PERSONAL_FEED_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveToPersonalFeed(post: PersonalFeedPost): void {
  if (typeof window === 'undefined') return
  const current = getPersonalFeedPosts()
  const deduped = current.filter((p) => p.id !== post.id)
  try {
    localStorage.setItem(PERSONAL_FEED_KEY, JSON.stringify([post, ...deduped]))
    window.dispatchEvent(new CustomEvent('personal-feed-updated'))
  } catch {
    // ignore storage errors
  }
}

const USER_AVATAR_KEY = 'jalur_user_avatar_v1'

export const DEFAULT_USER_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&q=80'

export function getUserCustomAvatar(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const val = localStorage.getItem(USER_AVATAR_KEY)
    return val && val.trim() ? val.trim() : null
  } catch {
    return null
  }
}

export function saveUserCustomAvatar(url: string): void {
  if (typeof window === 'undefined') return
  try {
    const cleaned = url.trim()
    if (cleaned) {
      localStorage.setItem(USER_AVATAR_KEY, cleaned)
    } else {
      localStorage.removeItem(USER_AVATAR_KEY)
    }
    window.dispatchEvent(new CustomEvent('user-avatar-updated'))
  } catch {
    // ignore storage errors
  }
}

