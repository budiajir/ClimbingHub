export type UserRole = 'guest' | 'registered' | 'gym_admin' | 'super_admin'

export interface ClimberUser {
  id: string
  name: string
  email: string
  handle: string
  avatar: string
  gradeMax: string
  ascentsCount: number
}

export interface GymTenant {
  id: string
  name: string
  city: string
  province: string
  address: string
  phone: string
  picName: string
  registeredAt: string
  dailyVisitors: number
  todayRevenue: number
  slots: { morning: number; afternoon: number; evening: number }
  maxSlots: { morning: number; afternoon: number; evening: number }
  prices: { morning: number; afternoon: number; evening: number }
}

export const canLogAscent = (role: UserRole): boolean => {
  return role === 'registered' || role === 'super_admin' || role === 'gym_admin'
}

export const canAccessGymAdmin = (role: UserRole): boolean => {
  return role === 'gym_admin' || role === 'super_admin'
}

export const canPostCommunity = (role: UserRole): boolean => {
  return role === 'registered' || role === 'super_admin' || role === 'gym_admin'
}

/**
 * Only Super Admin / Website Owner can create crag routes currently.
 * In the future roadmap, registered users will also be granted submission rights.
 */
export const canCreateCragRoute = (role: UserRole): boolean => {
  return role === 'super_admin'
}
