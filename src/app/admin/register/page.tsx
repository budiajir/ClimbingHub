'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  MapPin,
  Phone,
  User,
  Mail,
  Lock,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { signUp } from '@/lib/auth-client'
import { registerGymPartnerAction } from '@/lib/actions/auth-gym'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/lib/theme-context'

export default function AdminRegisterPage() {
  const { isAuthenticated, user, registerGym, refreshSession } = useAuth()
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const router = useRouter()

  const [gymName, setGymName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [picName, setPicName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registeredSuccess, setRegisteredSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gymName || !city || !address) return

    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      const resolvedPicName = picName.trim() || user?.name || 'Gym Manager'

      if (!isAuthenticated) {
        const signUpRes = await signUp.email({
          name: resolvedPicName,
          email,
          password,
        })

        if (signUpRes?.error) {
          setErrorMsg(
            signUpRes.error.message ||
              'Gagal membuat akun partner. Periksa kembali data pendaftaran Anda.'
          )
          return
        }
      }

      const partnerRes = await registerGymPartnerAction({
        name: gymName,
        city,
        address,
        picName: resolvedPicName,
        phone: phone || '+628123456789',
      })

      if (!partnerRes.ok) {
        setErrorMsg(partnerRes.error || 'Gagal menyimpan data gym partner.')
        return
      }

      if (partnerRes.persisted) {
        await refreshSession()
      } else {
        registerGym({
          name: gymName,
          city,
          address,
          picName: resolvedPicName,
          phone: phone || '+628123456789',
        })
      }

      setRegisteredSuccess(true)
      setTimeout(() => {
        router.push('/admin')
      }, 1200)
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Gagal terhubung ke server. Silakan periksa koneksi internet Anda.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickSample = (name: string, citySample: string) => {
    setGymName(name)
    setCity(citySample)
    setAddress(`88 Main Avenue, ${citySample}`)
    setPicName('Bambang S. (Head Coach)')
    setPhone('+6281987654321')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 md:py-20 space-y-6">
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
        className={`border rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 ${
          isSandstone
            ? 'bg-transparent border-[#1a1815]/25 text-[#1a1815]'
            : 'bg-crag border-white/10'
        }`}
      >
        <div className="space-y-2">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-light uppercase border ${
              isSandstone
                ? 'bg-[#1a1815]/10 border-[#1a1815]/30 text-[#1a1815]'
                : 'bg-cyan-climb/10 border-cyan-climb/30 text-cyan-climb'
            }`}
          >
            <Building2 size={13} /> New Partner Registration
          </div>
          <h1
            className={`font-bold text-2xl md:text-3xl ${
              isSandstone ? 'text-[#1a1815]' : 'text-chalk'
            }`}
          >
            Register Your Climbing Gym
          </h1>
          <p
            className={`text-xs md:text-sm font-light leading-relaxed ${
              isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
            }`}
          >
            Get a self-managed dashboard for your facility: activate POS cashier &amp; QR ticket
            scanners, manage session quotas, and monitor climber check-ins in real time.
          </p>
        </div>

        {registeredSuccess ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-10 text-center space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-lime/20 border border-lime/40 text-lime flex items-center justify-center mx-auto text-3xl font-bold shadow-lime-glow">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-chalk font-bold text-xl">Gym Registered Successfully!</h2>
            <p className="text-slate-ash text-xs font-light">
              Opening merchant dashboard for <b>{gymName || 'BoulderZone Canggu'}</b>...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2.5 flex items-start gap-2 text-xs text-red-400">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isAuthenticated && user && (
              <div className="rounded-xl bg-lime/10 border border-lime/30 px-3 py-2.5 text-xs text-chalk">
                Signed in as <b>{user.email}</b> — this gym will be linked to your account.
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                Climbing Gym / Boulder Studio Name
              </label>
              <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
                <Building2 size={16} className="text-slate-ash flex-shrink-0" />
                <input
                  required
                  placeholder="e.g. BoulderBox Bali / Crux Arena"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                  City / Region
                </label>
                <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
                  <MapPin size={16} className="text-slate-ash flex-shrink-0" />
                  <input
                    required
                    placeholder="e.g. Denpasar / Bandung"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                  Gym WhatsApp Number
                </label>
                <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
                  <Phone size={16} className="text-slate-ash flex-shrink-0" />
                  <input
                    required
                    placeholder="+62 812-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                Full Venue Address
              </label>
              <textarea
                required
                rows={2}
                placeholder="123 Main Street, City, Province"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-granite border border-white/5 rounded-xl p-3 text-chalk text-xs focus:outline-none focus:border-lime/40 font-normal resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                Contact Person (PIC / Owner)
              </label>
              <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
                <User size={16} className="text-slate-ash flex-shrink-0" />
                <input
                  required
                  placeholder="e.g. Alex Henderson"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
                />
              </div>
            </div>

            {!isAuthenticated && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                    Partner Login Email
                  </label>
                  <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
                    <Mail size={16} className="text-slate-ash flex-shrink-0" />
                    <input
                      required
                      type="email"
                      placeholder="owner@gym.id"
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
                    <Lock size={16} className="text-slate-ash flex-shrink-0" />
                    <input
                      required
                      minLength={6}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-slate-ash hover:text-chalk p-1 transition-colors shrink-0"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Sample Autocomplete Buttons for fast testing */}
            <div className="bg-granite/70 p-3 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] text-slate-ash font-light uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-lime" /> Want to test instantly? Click template:
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickSample('BoulderZone Canggu', 'Badung, Bali')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-crag text-chalk hover:text-lime border border-white/5 font-light"
                >
                  + BoulderZone Canggu (Bali)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSample('Monolith Studio Jogja', 'Sleman, DIY')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-crag text-chalk hover:text-lime border border-white/5 font-light"
                >
                  + Monolith Studio (Jogja)
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-lime text-granite font-bold tracking-wide rounded-xl shadow-lime-glow hover:bg-lime-dim transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                <span>{isSubmitting ? 'Registering Gym...' : 'Activate Gym Dashboard Now'}</span>
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-slate-ash font-light">
            Already registered?{' '}
            <Link href="/admin/login" className="text-lime hover:underline font-bold">
              Sign In to Gym Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
