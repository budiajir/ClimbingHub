'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, User, Mail, ShieldCheck, ArrowRight, Sparkles, Building2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function AuthModal() {
  const { isAuthModalOpen, authModalReason, closeAuthModal, loginAsRegistered } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  if (!isAuthModalOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginAsRegistered({
      name: name || 'Ahmad Rizki',
      email: email || 'climber@climbhub.id',
    })
  }

  const handleQuickDemo = () => {
    loginAsRegistered({
      name: 'Ahmad Rizki',
      gradeMax: 'V7 Crusher',
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="w-full max-w-md bg-crag border border-white/10 rounded-3xl p-6 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-granite flex items-center justify-center text-slate-ash hover:text-chalk transition-colors"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="mb-5">
            <div className="w-10 h-10 rounded-2xl bg-lime/10 border border-lime/20 flex items-center justify-center text-lime mb-3 shadow-lime-glow-sm">
              <Lock size={18} />
            </div>
            <h3 className="text-chalk font-bold text-xl">
              {tab === 'login' ? 'Sign in to Jalur' : 'Create Climber Account'}
            </h3>
            <p className="text-slate-ash text-xs font-light mt-1">
              {authModalReason || 'Unlock Ascent Logging, save wishlist crags, and join community sessions.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 bg-granite p-1 rounded-xl mb-4 border border-white/5">
            <button
              onClick={() => setTab('login')}
              className={`py-2 text-xs rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-lime text-granite font-bold shadow-lime-glow-sm'
                  : 'text-slate-ash hover:text-chalk font-light'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`py-2 text-xs rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-lime text-granite font-bold shadow-lime-glow-sm'
                  : 'text-slate-ash hover:text-chalk font-light'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <div>
                <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                  Full Name
                </label>
                <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
                  <User size={15} className="text-slate-ash" />
                  <input
                    required
                    placeholder="e.g. Alex Honnold"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                Email
              </label>
              <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
                <Mail size={15} className="text-slate-ash" />
                <input
                  required
                  type="email"
                  placeholder="climber@example.com"
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
              className="w-full py-3 bg-lime text-granite font-light tracking-wide rounded-xl shadow-lime-glow-sm hover:bg-lime-dim transition-all text-xs font-bold mt-2"
            >
              {tab === 'login' ? 'Sign In Now' : 'Create Account'}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              onClick={handleQuickDemo}
              className="w-full py-2.5 bg-granite border border-white/10 hover:border-lime/30 text-chalk text-xs rounded-xl flex items-center justify-center gap-2 transition-all group"
            >
              <Sparkles size={14} className="text-lime group-hover:scale-110 transition-transform" />
              <span className="font-light">Instant Sign In (Demo Climber)</span>
            </button>
          </div>

          {/* Link to Gym Partner */}
          <div className="mt-4 text-center">
            <Link
              href="/admin/register"
              onClick={closeAuthModal}
              className="text-[11px] text-slate-ash hover:text-lime font-light transition-colors inline-flex items-center gap-1"
            >
              <Building2 size={12} />
              <span>Gym Owner or Manager? <b>Register Gym Partner</b> →</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
