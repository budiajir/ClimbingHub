'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Lock,
  User,
  Mail,
  Building2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { signIn, signUp } from '@/lib/auth-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function getSafeNextPath(): string | null {
  if (typeof window === 'undefined') return null
  const next = new URLSearchParams(window.location.search).get('next')
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next
  }
  return null
}

export default function AuthModal() {
  const { isAuthModalOpen, authModalReason, closeAuthModal, refreshSession } =
    useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState<'climber' | 'route_setter' | 'trip_guide'>('climber')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isAuthModalOpen) return null

  const navigateAfterAuth = () => {
    const nextPath = getSafeNextPath()
    if (nextPath) {
      router.push(nextPath)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      const result =
        tab === 'login'
          ? await signIn.email({ email, password })
          : await signUp.email({
              name: name.trim() || 'Jalur Climber',
              email,
              password,
              role: selectedRole,
            })

      if (result?.error) {
        setErrorMsg(
          result.error.message ||
            'Autentikasi gagal. Periksa kembali email dan password Anda.'
        )
        return
      }

      await refreshSession()
      closeAuthModal()
      navigateAfterAuth()
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Gagal terhubung ke server auth. Silakan coba sesaat lagi.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchTab = (nextTab: 'login' | 'register') => {
    setTab(nextTab)
    setErrorMsg(null)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="w-full max-w-md bg-crag border border-white/10 rounded-3xl p-6 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            type="button"
            aria-label="Close sign in dialog"
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
              {authModalReason ||
                'Unlock Ascent Logging, save wishlist crags, and join community sessions.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 bg-granite p-1 rounded-xl mb-4 border border-white/5">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`py-2 text-xs rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-lime text-granite font-bold shadow-lime-glow-sm'
                  : 'text-slate-ash hover:text-chalk font-light'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`py-2 text-xs rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-lime text-granite font-bold shadow-lime-glow-sm'
                  : 'text-slate-ash hover:text-chalk font-light'
              }`}
            >
              Sign Up
            </button>
          </div>

          {errorMsg && (
            <div className="mb-3 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2.5 flex items-start gap-2 text-xs text-red-300">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

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
                    onChange={(e) => setName(e.target.value)}
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  minLength={6}
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
                />
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1.5">
                  Tipe Akun
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('climber')}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      selectedRole === 'climber'
                        ? 'bg-lime text-granite font-bold border-lime shadow-lime-glow-sm'
                        : 'bg-granite/60 border-white/5 text-slate-ash hover:text-chalk'
                    }`}
                  >
                    <div className="text-xs">🧗 Climber</div>
                    <div className="text-[9px] opacity-75 font-light">Pemanjat</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('route_setter')}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      selectedRole === 'route_setter'
                        ? 'bg-lime text-granite font-bold border-lime shadow-lime-glow-sm'
                        : 'bg-granite/60 border-white/5 text-slate-ash hover:text-chalk'
                    }`}
                  >
                    <div className="text-xs">🔨 Setter</div>
                    <div className="text-[9px] opacity-75 font-light">Bikin Jalur</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('trip_guide')}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      selectedRole === 'trip_guide'
                        ? 'bg-lime text-granite font-bold border-lime shadow-lime-glow-sm'
                        : 'bg-granite/60 border-white/5 text-slate-ash hover:text-chalk'
                    }`}
                  >
                    <div className="text-xs">🧭 Guide</div>
                    <div className="text-[9px] opacity-75 font-light">Pemandu Trip</div>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-lime text-granite tracking-wide rounded-xl shadow-lime-glow-sm hover:bg-lime-dim transition-all text-xs font-bold mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              <span>
                {isSubmitting
                  ? tab === 'login'
                    ? 'Signing In...'
                    : 'Creating Account...'
                  : tab === 'login'
                    ? 'Sign In Now'
                    : 'Create Account'}
              </span>
            </button>
          </form>

          {/* Link to Gym Partner */}
          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <Link
              href="/admin/register"
              onClick={closeAuthModal}
              className="text-[11px] text-slate-ash hover:text-lime font-light transition-colors inline-flex items-center gap-1"
            >
              <Building2 size={12} />
              <span>
                Gym Owner or Manager? <b>Register Gym Partner</b> →
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
