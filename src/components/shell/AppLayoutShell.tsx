'use client'

import React from 'react'
import { useTheme } from '@/lib/theme-context'
import TopBar from './TopBar'
import MobileNav from './MobileNav'

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const { isSandstone } = useTheme()

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isSandstone
          ? 'bg-[#d2c5ae] text-[#1a1815]'
          : 'bg-[#12161A] text-chalk'
      }`}
    >
      <TopBar showSearch />
      <main
        className="min-h-screen"
        style={{
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
