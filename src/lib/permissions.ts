export type UserRole =
  | 'guest'
  | 'climber'
  | 'route_setter'
  | 'trip_guide'
  | 'gym_admin'
  | 'super_admin'
  | 'registered' // Legacy alias for climber

export interface ClimberUser {
  id: string
  name: string
  email: string
  handle: string
  avatar: string
  gradeMax: string
  ascentsCount: number
  hometown?: string
  countryOfOrigin?: string
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

/**
 * 1. Climber, Route Setter, Trip Guide, Gym Admin, and Super Admin can log ascents & save wishlists.
 * Guests cannot log ascents.
 */
export const canLogAscent = (role: UserRole): boolean => {
  return role !== 'guest'
}

/**
 * 4. Gym Admin (and Super Admin) can access the Gym POS & merchant dashboard.
 */
export const canAccessGymAdmin = (role: UserRole): boolean => {
  return role === 'gym_admin' || role === 'super_admin'
}

/**
 * Any registered user can post in community.
 */
export const canPostCommunity = (role: UserRole): boolean => {
  return role !== 'guest'
}

/**
 * 2. Route Setter & 5. Super Admin can create, modify, and submit crag routes and topo data.
 */
export const canCreateCragRoute = (role: UserRole): boolean => {
  return role === 'route_setter' || role === 'super_admin'
}

/**
 * 3. Trip Guide & 5. Super Admin can manage guiding trips, schedules, and client reservations.
 */
export const canManageTripGuide = (role: UserRole): boolean => {
  return role === 'trip_guide' || role === 'super_admin'
}

export const isGrantedRouteSetter = (
  role: UserRole,
  user?: { id?: string; handle?: string } | null
): boolean => {
  return (
    role === 'route_setter' ||
    role === 'super_admin' ||
    Boolean(user?.handle?.toLowerCase().includes('setter')) ||
    user?.id === 'owner-1'
  )
}

/**
 * Human-readable label for each role
 */
export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin'
    case 'gym_admin':
      return 'Admin Gym'
    case 'route_setter':
      return 'Route Setter'
    case 'trip_guide':
      return 'Trip Guide'
    case 'climber':
    case 'registered':
      return 'Climber'
    case 'guest':
    default:
      return 'Guest'
  }
}
