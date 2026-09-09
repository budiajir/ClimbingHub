'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-redpoint/10 border border-redpoint/20 flex items-center justify-center text-redpoint mb-4">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-chalk font-bold text-2xl mb-2">Something Went Wrong</h2>
      <p className="text-slate-ash text-sm max-w-sm mb-6">
        Failed to load climbing data. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="bg-lime text-granite px-6 py-2.5 rounded-xl font-bold text-sm shadow-lime-glow-sm hover:bg-lime-dim transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
