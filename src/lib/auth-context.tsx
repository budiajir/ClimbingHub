'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { UserRole, ClimberUser, GymTenant } from './permissions'
import { useSession, signOut } from './auth-client'
import { getMyManagedGymAction } from './actions/auth-gym'

interface AuthContextType {
  role: UserRole
  user: ClimberUser | null
  gymTenant: GymTenant | null
  isAuthenticated: boolean
  isSessionPending: boolean
  isAuthModalOpen: boolean
  authModalReason: string
  setRole: (role: UserRole) => void
  loginAsGuest: () => void
  loginAsRegistered: (customUser?: Partial<ClimberUser>) => void
  loginAsGymAdmin: (customGym?: Partial<GymTenant>) => void
  loginAsSuperAdmin: () => void
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  registerGym: (data: {
    name: string
    city: string
    address: string
    phone: string
    picName: string
  }) => GymTenant
  openAuthModal: (reason?: string) => void
  closeAuthModal: () => void
}

const DEMO_COOKIE_NAME = 'jalur_demo_role'

const defaultUser: ClimberUser = {
  id: 'user-1',
  name: 'Ahmad Rizki',
  email: 'ahmad.rizki@climbhub.id',
  handle: '@ahmad_crusher',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
  gradeMax: 'V7 Crusher',
  ascentsCount: 42,
}

const defaultSuperAdmin: ClimberUser = {
  id: 'owner-1',
  name: 'Chief Route Curator',
  email: 'owner@climbhub.id',
  handle: '@climbhub_admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
  gradeMax: 'Platform Owner',
  ascentsCount: 156,
}

const defaultGym: GymTenant = {
  id: 'gym-vertigo',
  name: 'Vertigo Boulder Gym',
  city: 'Jakarta Selatan',
  province: 'DKI Jakarta',
  address: 'Jl. Kemang Raya No. 45, Jakarta Selatan',
  phone: '+6281234567890',
  picName: 'Adi Prasetyo (Owner)',
  registeredAt: '2026-01-15',
  dailyVisitors: 47,
  todayRevenue: 3525000,
  slots: { morning: 8, afternoon: 3, evening: 12 },
  maxSlots: { morning: 20, afternoon: 20, evening: 30 },
  prices: { morning: 75000, afternoon: 75000, evening: 85000 },
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function syncDemoRoleCookie(nextRole: UserRole) {
  if (typeof document === 'undefined') return
  if (nextRole === 'guest') {
    document.cookie = `${DEMO_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
  } else {
    document.cookie = `${DEMO_COOKIE_NAME}=${encodeURIComponent(nextRole)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
  }
}

function normalizeSessionRole(rawRole?: string | null): UserRole {
  if (rawRole === 'super_admin' || rawRole === 'gym_admin' || rawRole === 'registered') {
    return rawRole
  }
  return 'registered'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, isPending: isSessionPending, refetch } = useSession()
  const [role, setRoleState] = useState<UserRole>('guest')
  const [user, setUser] = useState<ClimberUser | null>(null)
  const [gymTenant, setGymTenant] = useState<GymTenant | null>(null)
  const [demoOverride, setDemoOverride] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalReason, setAuthModalReason] = useState('')
  const handledAuthQueryRef = useRef(false)

  // Sync authenticated Better Auth session or fall back to persisted demo state
  useEffect(() => {
    if (isSessionPending || demoOverride) return

    let cancelled = false
    const sessionUser = sessionData?.user as
      | (NonNullable<typeof sessionData>['user'] & {
          role?: string | null
          handle?: string | null
          gradeMax?: string | null
          ascentsCount?: number | null
        })
      | undefined

    if (sessionUser) {
      const sessionRole = normalizeSessionRole(sessionUser.role)
      const mappedUser: ClimberUser = {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        handle: sessionUser.handle || `@${sessionUser.email.split('@')[0]}`,
        avatar:
          sessionUser.image ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
        gradeMax: sessionUser.gradeMax || 'V4 Climber',
        ascentsCount: Number(sessionUser.ascentsCount || 0),
      }

      setRoleState(sessionRole)
      setUser(mappedUser)
      syncDemoRoleCookie('guest')

      if (sessionRole === 'gym_admin') {
        getMyManagedGymAction().then((ownedGym) => {
          if (cancelled) return
          if (ownedGym) {
            setGymTenant(ownedGym)
          } else {
            try {
              const savedGym = localStorage.getItem('climbhub_gym')
              setGymTenant(savedGym ? JSON.parse(savedGym) : { ...defaultGym, picName: mappedUser.name })
            } catch {
              setGymTenant({ ...defaultGym, picName: mappedUser.name })
            }
          }
        })
      } else {
        setGymTenant(null)
      }

      return () => {
        cancelled = true
      }
    }

    // Fallback to localStorage demo state when no Better Auth session exists
    try {
      const savedRole = localStorage.getItem('climbhub_role') as UserRole | null
      const savedGym = localStorage.getItem('climbhub_gym')
      const savedUser = localStorage.getItem('climbhub_user')

      if (savedRole === 'super_admin') {
        setRoleState('super_admin')
        setUser(defaultSuperAdmin)
        setGymTenant(null)
        syncDemoRoleCookie('super_admin')
      } else if (savedRole === 'gym_admin') {
        setRoleState('gym_admin')
        setGymTenant(savedGym ? JSON.parse(savedGym) : defaultGym)
        setUser(null)
        syncDemoRoleCookie('gym_admin')
      } else if (savedRole === 'registered') {
        setRoleState('registered')
        setUser(savedUser ? JSON.parse(savedUser) : defaultUser)
        setGymTenant(null)
        syncDemoRoleCookie('registered')
      } else {
        setRoleState('guest')
        setUser(null)
        setGymTenant(null)
        syncDemoRoleCookie('guest')
      }
    } catch {
      // Ignore localStorage errors
    }

    return () => {
      cancelled = true
    }
  }, [sessionData, isSessionPending, demoOverride])

  // Open AuthModal automatically when redirected by middleware (?auth=required)
  useEffect(() => {
    if (typeof window === 'undefined' || isSessionPending || handledAuthQueryRef.current) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth') === 'required') {
      handledAuthQueryRef.current = true
      if (!sessionData?.user && role === 'guest') {
        const nextPath = params.get('next')
        setAuthModalReason(
          nextPath
            ? `Silakan masuk terlebih dahulu untuk mengakses ${nextPath}.`
            : 'Silakan masuk terlebih dahulu untuk melanjutkan.'
        )
        setIsAuthModalOpen(true)
      }
    }
  }, [isSessionPending, sessionData?.user, role])

  const refreshSession = useCallback(async () => {
    setDemoOverride(false)
    await refetch()
  }, [refetch])

  const setRole = (newRole: UserRole) => {
    if (newRole === 'guest') {
      void logout()
      return
    }

    setDemoOverride(true)
    setRoleState(newRole)
    syncDemoRoleCookie(newRole)
    try {
      localStorage.setItem('climbhub_role', newRole)
    } catch {}

    if (newRole === 'registered') {
      setUser(defaultUser)
      setGymTenant(null)
    } else if (newRole === 'super_admin') {
      setUser(defaultSuperAdmin)
      setGymTenant(null)
    } else if (newRole === 'gym_admin') {
      setUser(null)
      setGymTenant(defaultGym)
    }
  }

  const loginAsGuest = () => {
    void logout()
  }

  const loginAsRegistered = (customUser?: Partial<ClimberUser>) => {
    const activeUser = { ...defaultUser, ...customUser }
    setDemoOverride(true)
    setUser(activeUser)
    setGymTenant(null)
    setRoleState('registered')
    syncDemoRoleCookie('registered')
    try {
      localStorage.setItem('climbhub_role', 'registered')
      localStorage.setItem('climbhub_user', JSON.stringify(activeUser))
    } catch {}
    setIsAuthModalOpen(false)
  }

  const loginAsSuperAdmin = () => {
    setDemoOverride(true)
    setUser(defaultSuperAdmin)
    setGymTenant(null)
    setRoleState('super_admin')
    syncDemoRoleCookie('super_admin')
    try {
      localStorage.setItem('climbhub_role', 'super_admin')
      localStorage.setItem('climbhub_user', JSON.stringify(defaultSuperAdmin))
    } catch {}
    setIsAuthModalOpen(false)
  }

  const loginAsGymAdmin = (customGym?: Partial<GymTenant>) => {
    const activeGym = { ...defaultGym, ...customGym }
    setDemoOverride(true)
    setGymTenant(activeGym)
    setUser(null)
    setRoleState('gym_admin')
    syncDemoRoleCookie('gym_admin')
    try {
      localStorage.setItem('climbhub_role', 'gym_admin')
      localStorage.setItem('climbhub_gym', JSON.stringify(activeGym))
    } catch {}
    setIsAuthModalOpen(false)
  }

  const registerGym = (data: {
    name: string
    city: string
    address: string
    phone: string
    picName: string
  }): GymTenant => {
    const newGym: GymTenant = {
      id: `gym-${Date.now()}`,
      name: data.name,
      city: data.city,
      province: 'Indonesia',
      address: data.address,
      phone: data.phone,
      picName: data.picName,
      registeredAt: new Date().toISOString().split('T')[0],
      dailyVisitors: 0,
      todayRevenue: 0,
      slots: { morning: 20, afternoon: 20, evening: 25 },
      maxSlots: { morning: 20, afternoon: 20, evening: 25 },
      prices: { morning: 65000, afternoon: 65000, evening: 75000 },
    }

    setDemoOverride(false)
    setGymTenant(newGym)
    setRoleState('gym_admin')
    if (!sessionData?.user) {
      setUser(null)
      syncDemoRoleCookie('gym_admin')
    }
    try {
      localStorage.setItem('climbhub_role', 'gym_admin')
      localStorage.setItem('climbhub_gym', JSON.stringify(newGym))
    } catch {}
    return newGym
  }

  const logout = async () => {
    setDemoOverride(false)
    setRoleState('guest')
    setUser(null)
    setGymTenant(null)
    syncDemoRoleCookie('guest')
    try {
      localStorage.setItem('climbhub_role', 'guest')
      localStorage.removeItem('climbhub_user')
      localStorage.removeItem('climbhub_gym')
    } catch {}
    try {
      await signOut()
      await refetch()
    } catch {
      // Ignore error when backend DB is not configured
    }
  }

  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason || 'Please sign in or create an account to continue.')
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        gymTenant,
        isAuthenticated: Boolean(sessionData?.user),
        isSessionPending,
        isAuthModalOpen,
        authModalReason,
        setRole,
        loginAsGuest,
        loginAsRegistered,
        loginAsGymAdmin,
        loginAsSuperAdmin,
        logout,
        refreshSession,
        registerGym,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
