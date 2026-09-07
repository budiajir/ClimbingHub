'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronUp, ChevronDown, UserCheck, Users, Building2, Eye, Crown } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { UserRole } from '@/lib/permissions'

export default function RoleSwitcher() {
  const { role, setRole, gymTenant, user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)

  const rolesConfig: { key: UserRole; label: string; icon: React.ElementType; color: string; desc: string }[] = [
    {
      key: 'guest',
      label: 'Public (Guest)',
      icon: Eye,
      color: 'text-slate-ash border-white/10',
      desc: 'Browsing crags, view gym, book tiket. Log Ascent & Tambah Jalur terkunci.',
    },
    {
      key: 'registered',
      label: 'Registered Climber',
      icon: UserCheck,
      color: 'text-cyan-climb border-cyan-climb/30',
      desc: 'Semua browsing + Log Ascent aktif. Tambah jalur diarahkan ke Roadmap Komunitas.',
    },
    {
      key: 'super_admin',
      label: 'Pemilik Web (Super Admin)',
      icon: Crown,
      color: 'text-lime border-lime/40',
      desc: 'Akses penuh kurasi tebing. Dapat menerbitkan jalur Sport, Multi Pitch, & Boulder.',
    },
    {
      key: 'gym_admin',
      label: 'Gym Admin',
      icon: Building2,
      color: 'text-project border-project/40',
      desc: 'Akses penuh ke dashboard private POS kasir & slot manager gym miliknya.',
    },
  ]

  const roleLabelMap: Record<UserRole, string> = {
    guest: 'Public',
    registered: 'Registered',
    super_admin: 'Owner (Admin)',
    gym_admin: 'Gym Admin',
  }

  return (
    <div className="fixed bottom-3 left-3 z-50 select-none">
      {/* Collapsed Pill */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="glass bg-black/80 backdrop-blur-md border border-white/15 hover:border-lime/40 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xl transition-all touch-ripple"
        >
          <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
          <span className="text-[11px] font-mono text-chalk font-light">
            Role: <b className="text-lime uppercase">{roleLabelMap[role]}</b>
          </span>
          <ChevronUp size={14} className="text-slate-ash" />
        </button>
      ) : (
        /* Expanded Role Switcher Card */
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          className="glass bg-granite/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 w-80 shadow-2xl space-y-3"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-lime" />
              <span className="text-xs font-bold text-chalk">Pilih Mode Pengguna (Demo)</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-ash hover:text-chalk p-0.5 rounded"
            >
              <ChevronDown size={15} />
            </button>
          </div>

          <div className="space-y-1.5">
            {rolesConfig.map(r => {
              const Icon = r.icon
              const isSelected = role === r.key
              return (
                <button
                  key={r.key}
                  onClick={() => {
                    setRole(r.key)
                    setIsExpanded(false)
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-lime/10 border-lime/40 shadow-lime-glow-sm'
                      : 'bg-crag/50 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <Icon size={14} className={isSelected ? 'text-lime' : 'text-slate-ash'} />
                      <span className={`text-xs ${isSelected ? 'text-lime font-bold' : 'text-chalk font-normal'}`}>
                        {r.label}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[9px] font-mono text-granite bg-lime px-1.5 py-0.2 rounded font-bold">
                        AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-ash font-light leading-relaxed pl-5">
                    {r.desc}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Current Persona Details */}
          <div className="pt-2 border-t border-white/5 text-[10px] text-slate-ash font-light">
            {role === 'guest' && <span>Status: Tamu Publik (Tanpa Sesi)</span>}
            {role === 'registered' && (
              <span>Climber: <b className="text-chalk">{user?.name || 'Ahmad Rizki'}</b> ({user?.gradeMax || 'V7 Crusher'})</span>
            )}
            {role === 'super_admin' && (
              <span>Kurator: <b className="text-lime">{user?.name || 'Chief Route Curator'}</b> (Pemilik Website)</span>
            )}
            {role === 'gym_admin' && (
              <span>Admin: <b className="text-project">{gymTenant?.name || 'Vertigo Boulder Gym'}</b></span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
