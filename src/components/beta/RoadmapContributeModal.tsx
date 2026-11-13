'use client'

import { motion } from 'framer-motion'
import { X, Mountain, ShieldCheck, Clock, CheckCircle, Sparkles, Compass } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface RoadmapContributeModalProps {
  onClose: () => void
}

export default function RoadmapContributeModal({ onClose }: RoadmapContributeModalProps) {
  const { user } = useAuth()

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-lg bg-crag border border-lime/30 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-granite flex items-center justify-center text-slate-ash hover:text-chalk transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-lime/10 border border-lime/20 flex items-center justify-center text-lime mx-auto shadow-lime-glow-sm">
            <Mountain size={28} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-xs font-mono font-light uppercase">
            <Clock size={13} /> Route Setting Access
          </div>
          <h2 className="text-chalk font-bold text-xl md:text-2xl">
            Official Outdoor Crag Curation
          </h2>
          <p className="text-slate-ash text-xs md:text-sm font-light leading-relaxed">
            Terima kasih atas antusiasme Anda, <b>{user?.name || 'Climber'}</b>! Pembuatan dan penambahan data jalur tebing dikurasi khusus oleh akun <b>Route Setter</b> dan <b>Super Admin</b>.
          </p>
        </div>

        {/* Why this restriction exists */}
        <div className="bg-granite/70 border border-white/5 rounded-2xl p-4 space-y-3 text-xs text-slate-ash font-light leading-relaxed">
          <div className="text-chalk font-bold flex items-center gap-2">
            <ShieldCheck size={16} className="text-lime" />
            Standar Kurasi Jalur Terverifikasi
          </div>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <b className="text-chalk font-normal">Keamanan & Hardware Tebing</b>: Verifikasi baut/hanger, kualitas batuan, dan anchor resmi.
            </li>
            <li>
              <b className="text-chalk font-normal">Etika & Izin Wilayah Tebing</b>: Menghormati izin pengelola kawasan lokal dan etika bolting.
            </li>
            <li>
              <b className="text-chalk font-normal">Akurasi Topo & Konsensus Grade</b>: Menjaga standar grade dan mencegah duplikasi rute.
            </li>
          </ul>
        </div>

        {/* Route Setter info banner */}
        <div className="pt-2 border-t border-white/5 text-center space-y-2">
          <p className="text-xs text-slate-ash font-light">
            Apakah Anda seorang Route Setter berlisensi / pembuka jalur tebing?
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lime/10 border border-lime/30 text-lime text-xs font-bold">
            <ShieldCheck size={14} />
            <span>Daftar / Verifikasi Akun sebagai Route Setter</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
