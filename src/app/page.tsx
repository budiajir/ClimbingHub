import { headers } from 'next/headers'
import LandingSwitcher from '@/components/home/LandingSwitcher'

export const dynamic = 'force-dynamic'

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string; view?: string }>
}) {
  let isJalurHost = false

  try {
    const headersList = await headers()
    const host = (headersList.get('host') || '').toLowerCase()
    const resolvedParams = searchParams ? await searchParams : {}

    isJalurHost =
      host.includes('jalur.world') ||
      host.startsWith('jalur.') ||
      resolvedParams?.preview === 'jalur' ||
      resolvedParams?.view === 'jalur'
  } catch {
    isJalurHost = false
  }

  return <LandingSwitcher initialIsJalur={isJalurHost} />
}
