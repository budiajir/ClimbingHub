'use client'

import { AscentType } from './tokens'
import { TopoMarker } from './mock-data'

export interface UserAscent {
  id: string
  userId: string
  problemId: string
  problemName: string
  grade: string
  fontGrade: string
  setter: string
  location: string // e.g. "Lembah Harau · Echo Valley"
  date: string // e.g. "09 Sep 2026"
  createdAt: string // ISO
  ascentType: AscentType
  gradeVote: string
  note?: string
  photoUrl?: string
  markers: TopoMarker[]
  discipline?: string
}

const STORAGE_KEY = 'climbhub_user_ascents'

export function getUserAscents(userId?: string): UserAscent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const all: UserAscent[] = JSON.parse(raw)
    if (userId) {
      return all.filter(a => a.userId === userId)
    }
    return all
  } catch (err) {
    console.error('Error loading user ascents:', err)
    return []
  }
}

export function saveUserAscent(data: Omit<UserAscent, 'id' | 'createdAt' | 'date'> & { date?: string }): UserAscent {
  if (typeof window === 'undefined') {
    return {
      ...data,
      id: `ascent-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString(),
    }
  }

  const existing = getUserAscents()
  const dateFormatted = data.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const newAscent: UserAscent = {
    ...data,
    id: `ascent-${Date.now()}`,
    date: dateFormatted,
    createdAt: new Date().toISOString(),
  }

  const updated = [newAscent, ...existing]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Error saving user ascent to localStorage:', err)
  }

  return newAscent
}

export function deleteUserAscent(id: string): void {
  if (typeof window === 'undefined') return
  const existing = getUserAscents()
  const updated = existing.filter(a => a.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Error deleting user ascent:', err)
  }
}
