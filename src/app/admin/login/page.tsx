'use client'

import { useState } from 'react'
import { Store, Lock, Mail, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { signIn } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/theme-context'

function getSafeNextAdminPath(): string {
  if (typeof window === 'undefined') return '/admin'
  const next = new URLSearchParams(window.location.search).get('next')
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next
  }
  return '/admin'
}

export default function AdminLoginPage() {
  const { refreshSession } = useAuth()
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      const result = await signIn.email({ email, password })
      if (result?.error) {
        setErrorMsg(
          result.error.message ||
            'Login partner gagal. Periksa kembali email & password akun gym Anda.'
        )
        return
      }

      await refreshSession()
      router.push(getSafeNextAdminPath())
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

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24 space-y-6">
      <Link
        href="/"
        className={`inline-flex items-center gap-1.5 py-1 -ml-1 group text-left transition-opacity hover:opacity-75 active:opacity-60 ${
          isSandstone ? 'text-[#1a1815]' : 'text-chalk'
        }`}
      >
        <ChevronLeft
          size={20}
          className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5"
        />
        <span className="text-sm sm:text-base font-light tracking-wide">Home</span>
      </Link>

      <div
        className={`border rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 ${
          isSandstone
            ? 'bg-transparent border-[#1a1815]/25 text-[#1a1815]'
            : 'bg-crag border-white/10'
        }`}
      >
        <div className="text-center space-y-2">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto shadow-lime-glow-sm ${
              isSandstone
                ? 'bg-[#1a1815]/10 border-[#1a1815]/20 text-[#1a1815]'
                : 'bg-lime/10 border-lime/20 text-lime'
            }`}
          >
            <Store size={24} />
          </div>
          <h1
            className={`font-bold text-xl md:text-2xl ${
              isSandstone ? 'text-[#1a1815]' : 'text-chalk'
            }`}
          >
            Gym Partner Sign In
          </h1>
          <p
            className={`text-xs font-light ${
              isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
            }`}
          >
            Private portal for POS cashier, QR ticket scanner, and session quota management.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2.5 flex items-start gap-2 text-xs text-red-400">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-lime text-granite font-bold tracking-wide rounded-xl shadow-lime-glow-sm hover:bg-lime-dim transition-all text-xs mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            <span>{isSubmitting ? 'Signing In...' : 'Sign In to Gym Dashboard'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5">
          <p className="text-xs text-slate-ash font-light">
            Don&apos;t have a partner account?{' '}
            <Link href="/admin/register" className="text-lime hover:underline font-bold">
              Register New Gym
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
