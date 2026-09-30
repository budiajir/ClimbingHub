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
      <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-4">
        <AlertCircle size={32} />
      </div>
      <h2 className="font-bold text-2xl mb-2 text-current">Something Went Wrong</h2>
      <p className="opacity-75 text-sm max-w-sm mb-6">
        Failed to load climbing data. Please try again.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="bg-lime text-granite px-6 py-2.5 rounded-xl font-bold text-sm shadow-lime-glow-sm hover:bg-lime-dim transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl font-bold text-sm border border-current/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          Reload
        </button>
      </div>
    </div>
  )
}
