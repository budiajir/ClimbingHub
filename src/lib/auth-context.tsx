'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserRole, ClimberUser, GymTenant } from './permissions'

interface AuthContextType {
  role: UserRole
  user: ClimberUser | null
  gymTenant: GymTenant | null
  isAuthModalOpen: boolean
  authModalReason: string
  setRole: (role: UserRole) => void
  loginAsGuest: () => void
  loginAsRegistered: (customUser?: Partial<ClimberUser>) => void
  loginAsGymAdmin: (customGym?: Partial<GymTenant>) => void
  loginAsSuperAdmin: () => void
  logout: () => void
  registerGym: (data: { name: string; city: string; address: string; phone: string; picName: string }) => GymTenant
  openAuthModal: (reason?: string) => void
  closeAuthModal: () => void
}

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
  gradeMax: 'Pemilik Website',
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('guest')
  const [user, setUser] = useState<ClimberUser | null>(null)
  const [gymTenant, setGymTenant] = useState<GymTenant | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalReason, setAuthModalReason] = useState('')

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('climbhub_role') as UserRole | null
      const savedGym = localStorage.getItem('climbhub_gym')
      const savedUser = localStorage.getItem('climbhub_user')

      if (savedRole === 'super_admin') {
        setRoleState('super_admin')
        setUser(defaultSuperAdmin)
        setGymTenant(null)
      } else if (savedRole === 'gym_admin') {
        setRoleState('gym_admin')
        setGymTenant(savedGym ? JSON.parse(savedGym) : defaultGym)
        setUser(null)
      } else if (savedRole === 'registered') {
        setRoleState('registered')
        setUser(savedUser ? JSON.parse(savedUser) : defaultUser)
        setGymTenant(null)
      } else {
        setRoleState('guest')
        setUser(null)
        setGymTenant(null)
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole)
    try {
      localStorage.setItem('climbhub_role', newRole)
    } catch {}

    if (newRole === 'guest') {
      setUser(null)
      setGymTenant(null)
    } else if (newRole === 'registered') {
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
    setRole('guest')
  }

  const loginAsRegistered = (customUser?: Partial<ClimberUser>) => {
    const activeUser = { ...defaultUser, ...customUser }
    setUser(activeUser)
    setGymTenant(null)
    setRoleState('registered')
    try {
      localStorage.setItem('climbhub_role', 'registered')
      localStorage.setItem('climbhub_user', JSON.stringify(activeUser))
    } catch {}
    setIsAuthModalOpen(false)
  }

  const loginAsSuperAdmin = () => {
    setUser(defaultSuperAdmin)
    setGymTenant(null)
    setRoleState('super_admin')
    try {
      localStorage.setItem('climbhub_role', 'super_admin')
      localStorage.setItem('climbhub_user', JSON.stringify(defaultSuperAdmin))
    } catch {}
    setIsAuthModalOpen(false)
  }

  const loginAsGymAdmin = (customGym?: Partial<GymTenant>) => {
    const activeGym = { ...defaultGym, ...customGym }
    setGymTenant(activeGym)
    setUser(null)
    setRoleState('gym_admin')
    try {
      localStorage.setItem('climbhub_role', 'gym_admin')
      localStorage.setItem('climbhub_gym', JSON.stringify(activeGym))
    } catch {}
    setIsAuthModalOpen(false)
  }

  const registerGym = (data: { name: string; city: string; address: string; phone: string; picName: string }): GymTenant => {
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
    setUser(null)
    setRoleState('gym_admin')
    try {
      localStorage.setItem('climbhub_role', 'gym_admin')
      localStorage.setItem('climbhub_gym', JSON.stringify(newGym))
    } catch {}
    return newGym
  }

  const logout = () => {
    setRole('guest')
  }

  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason || 'Silakan masuk atau daftar akun untuk melanjutkan.')
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
        isAuthModalOpen,
        authModalReason,
        setRole,
        loginAsGuest,
        loginAsRegistered,
        loginAsGymAdmin,
        loginAsSuperAdmin,
        logout,
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
