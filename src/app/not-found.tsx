'use client'

import Link from 'next/link'
import { Mountain } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-lime/10 border border-lime/20 flex items-center justify-center text-lime mb-4">
        <Mountain size={32} />
      </div>
      <h2 className="text-chalk font-black text-2xl mb-2">Halaman Tidak Ditemukan (404)</h2>
      <p className="text-slate-ash text-sm max-w-sm mb-6">
        Jalur atau tebing yang Anda cari mungkin belum terpetakan atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="bg-lime text-granite px-6 py-2.5 rounded-xl font-bold text-sm shadow-lime-glow-sm hover:bg-lime-dim transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
