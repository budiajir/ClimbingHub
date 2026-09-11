'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Store, Lock, Mail, ChevronLeft, Sparkles, Building2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/theme-context'

export default function AdminLoginPage() {
  const { loginAsGymAdmin } = useAuth()
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    loginAsGymAdmin({
      name: 'Vertigo Boulder Gym',
      city: 'South Jakarta',
      picName: email.split('@')[0] || 'Gym Admin',
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
        className={`inline-flex items-center gap-1.5 text-xs font-light transition-colors ${
          isSandstone ? 'text-[#1a1815]/70 hover:text-[#1a1815]' : 'text-slate-ash hover:text-chalk'
        }`}
      >
        <ChevronLeft size={15} /> Back to Home
      </Link>

      <div className={`border rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 ${
        isSandstone ? 'bg-transparent border-[#1a1815]/25 text-[#1a1815]' : 'bg-crag border-white/10'
      }`}>
        <div className="text-center space-y-2">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto shadow-lime-glow-sm ${
            isSandstone ? 'bg-[#1a1815]/10 border-[#1a1815]/20 text-[#1a1815]' : 'bg-lime/10 border-lime/20 text-lime'
          }`}>
            <Store size={24} />
          </div>
          <h1 className={`font-bold text-xl md:text-2xl ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}>
            Gym Partner Sign In
          </h1>
          <p className={`text-xs font-light ${
            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
          }`}>
            Private portal for POS cashier, QR ticket scanner, and session quota management.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
              Gym Manager Email
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
              Password
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
            className="w-full py-3 bg-lime text-granite font-bold tracking-wide rounded-xl shadow-lime-glow-sm hover:bg-lime-dim transition-all text-xs mt-2"
          >
            Sign In to Gym Dashboard
          </button>
        </form>

        <div className="pt-3 border-t border-white/5">
          <button
            onClick={handleDemo}
            className="w-full py-2.5 bg-granite border border-white/10 hover:border-lime/30 text-chalk text-xs rounded-xl flex items-center justify-center gap-2 transition-all group"
          >
            <Sparkles size={14} className="text-lime group-hover:scale-110 transition-transform" />
            <span className="font-light">Instant Demo Access (Vertigo Gym Admin)</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-ash font-light">
            Don't have a partner account?{' '}
            <Link href="/admin/register" className="text-lime hover:underline font-bold">
              Register New Gym
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
