'use client'

import { useEffect, useState } from 'react'
import ClimbingHubHomePage from '@/components/home/ClimbingHubHomePage'
import JalurLandingPage from '@/components/home/JalurLandingPage'

interface LandingSwitcherProps {
  initialIsJalur?: boolean
}

export default function LandingSwitcher({ initialIsJalur = false }: LandingSwitcherProps) {
  const [isJalur, setIsJalur] = useState(initialIsJalur)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname.toLowerCase()
      const searchParams = new URLSearchParams(window.location.search)

      const isJalurDomain =
        hostname.includes('jalur.world') ||
        hostname.startsWith('jalur.') ||
        searchParams.get('preview') === 'jalur' ||
        searchParams.get('view') === 'jalur'

      setIsJalur(isJalurDomain)
    }
  }, [])

  if (isJalur) {
    return <JalurLandingPage />
  }

  return <ClimbingHubHomePage />
}
