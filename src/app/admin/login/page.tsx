'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Store, Lock, Mail, ChevronLeft, Sparkles, Building2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const { loginAsGymAdmin } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    loginAsGymAdmin({
      name: 'Vertigo Boulder Gym',
      city: 'Jakarta Selatan',
      picName: email.split('@')[0] || 'Admin Gym',
    })
    router.push('/admin')
  }

  const handleDemo = () => {
    loginAsGymAdmin()
    router.push('/admin')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-ash hover:text-chalk font-light transition-colors"
      >
        <ChevronLeft size={15} /> Kembali ke Beranda
      </Link>

      <div className="bg-crag border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-lime/10 border border-lime/20 flex items-center justify-center text-lime mx-auto shadow-lime-glow-sm">
            <Store size={24} />
          </div>
          <h1 className="text-chalk font-bold text-xl md:text-2xl">
            Login Mitra Climbing Gym
          </h1>
          <p className="text-slate-ash text-xs font-light">
            Portal private untuk kasir POS, scanner QR ticket, dan manajemen slot sesi gym Anda.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
              Email Pengelola Gym
            </label>
            <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
              <Mail size={15} className="text-slate-ash" />
              <input
                required
                type="email"
                placeholder="manager@bouldergym.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
              Kata Sandi
            </label>
            <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
              <Lock size={15} className="text-slate-ash" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-lime text-granite font-light tracking-wide rounded-xl shadow-lime-glow-sm hover:bg-lime-dim transition-all text-xs font-bold mt-2"
          >
            Masuk ke Dashboard Gym
          </button>
        </form>

        <div className="pt-3 border-t border-white/5">
          <button
            onClick={handleDemo}
            className="w-full py-2.5 bg-granite border border-white/10 hover:border-lime/30 text-chalk text-xs rounded-xl flex items-center justify-center gap-2 transition-all group"
          >
            <Sparkles size={14} className="text-lime group-hover:scale-110 transition-transform" />
            <span className="font-light">Masuk Instan (Demo Admin Vertigo Gym)</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-ash font-light">
            Belum punya akun mitra?{' '}
            <Link href="/admin/register" className="text-lime hover:underline font-bold">
              Daftarkan Gym Baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
