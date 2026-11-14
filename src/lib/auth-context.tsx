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

function normalizeSessionRole(rawRole?: string | null): UserRole {
  if (
    rawRole === 'super_admin' ||
    rawRole === 'gym_admin' ||
    rawRole === 'route_setter' ||
    rawRole === 'trip_guide' ||
    rawRole === 'climber'
  ) {
    return rawRole
  }
  if (rawRole === 'registered') {
    return 'climber'
  }
  return 'climber'
}

function clearLegacyDemoCookie() {
  if (typeof document === 'undefined') return
  document.cookie = 'jalur_demo_role=; path=/; max-age=0; SameSite=Lax'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, isPending: isSessionPending, refetch } = useSession()
  const [role, setRoleState] = useState<UserRole>('guest')
  const [user, setUser] = useState<ClimberUser | null>(null)
  const [gymTenant, setGymTenant] = useState<GymTenant | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalReason, setAuthModalReason] = useState('')
  const handledAuthQueryRef = useRef(false)

  // Ensure legacy demo cookies are removed
  useEffect(() => {
    clearLegacyDemoCookie()
  }, [])

  // Sync authenticated Better Auth session
  useEffect(() => {
    if (isSessionPending) return

    let cancelled = false
    const sessionUser = sessionData?.user as
      | (NonNullable<typeof sessionData>['user'] & {
          role?: string | null
          handle?: string | null
          gradeMax?: string | null
          ascentsCount?: number | null
          hometown?: string | null
          countryOfOrigin?: string | null
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
        hometown: sessionUser.hometown || undefined,
        countryOfOrigin: sessionUser.countryOfOrigin || undefined,
      }

      setRoleState(sessionRole)
      setUser(mappedUser)

      if (sessionRole === 'gym_admin') {
        getMyManagedGymAction().then((ownedGym) => {
          if (cancelled) return
          if (ownedGym) {
            setGymTenant(ownedGym)
          } else {
            setGymTenant(null)
          }
        })
      } else {
        setGymTenant(null)
      }

      return () => {
        cancelled = true
      }
    }

    // Unauthenticated (Guest / Not logged in)
    setRoleState('guest')
    setUser(null)
    setGymTenant(null)
    clearLegacyDemoCookie()

    return () => {
      cancelled = true
    }
  }, [sessionData, isSessionPending])

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
    await refetch()
  }, [refetch])

  const setRole = (newRole: UserRole) => {
    if (newRole === 'guest') {
      void logout()
      return
    }
    setRoleState(newRole)
  }

  const loginAsGuest = () => {
    void logout()
  }

  // Deprecated demo shortcuts: now redirect to authentic sign in
  const loginAsRegistered = () => {
    openAuthModal('Silakan masuk atau buat akun untuk melanjutkan.')
  }

  const loginAsSuperAdmin = () => {
    openAuthModal('Silakan masuk dengan akun Super Admin.')
  }

  const loginAsGymAdmin = () => {
    openAuthModal('Silakan masuk dengan akun Gym Admin.')
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

    setGymTenant(newGym)
    setRoleState('gym_admin')
    return newGym
  }

  const logout = async () => {
    setRoleState('guest')
    setUser(null)
    setGymTenant(null)
    clearLegacyDemoCookie()
    try {
      localStorage.removeItem('climbhub_role')
      localStorage.removeItem('climbhub_user')
      localStorage.removeItem('climbhub_gym')
    } catch {}
    try {
      await signOut()
      await refetch()
    } catch {
      // Ignore error when network is disconnected
    }
  }

  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason || 'Silakan masuk atau buat akun untuk melanjutkan.')
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
