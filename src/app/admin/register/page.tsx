'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, MapPin, Phone, User, CheckCircle2, ChevronLeft, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminRegisterPage() {
  const { registerGym } = useAuth()
  const router = useRouter()

  const [gymName, setGymName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [picName, setPicName] = useState('')
  const [phone, setPhone] = useState('')
  const [registeredSuccess, setRegisteredSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!gymName || !city || !address) return

    registerGym({
      name: gymName,
      city,
      address,
      picName: picName || 'Pengelola Gym',
      phone: phone || '+628123456789',
    })

    setRegisteredSuccess(true)
    setTimeout(() => {
      router.push('/admin')
    }, 1200)
  }

  const handleQuickSample = (name: string, citySample: string) => {
    setGymName(name)
    setCity(citySample)
    setAddress(`Jl. Utama ${citySample} No. 88`)
    setPicName('Bambang S. (Head Coach)')
    setPhone('+6281987654321')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 md:py-20 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-ash hover:text-chalk font-light transition-colors"
      >
        <ChevronLeft size={15} /> Kembali ke Beranda
      </Link>

      <div className="bg-crag border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-climb/10 border border-cyan-climb/30 text-cyan-climb text-xs font-mono font-light uppercase">
            <Building2 size={13} /> Registrasi Mitra Baru
          </div>
          <h1 className="text-chalk font-bold text-2xl md:text-3xl">
            Daftarkan Climbing Gym Anda
          </h1>
          <p className="text-slate-ash text-xs md:text-sm font-light leading-relaxed">
            Dapatkan dashboard mandiri untuk gym Anda: aktifkan kasir scanner QR ticket E-ticket, atur kuota per sesi, dan pantau kunjungan pemanjat secara real-time.
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
            <h2 className="text-chalk font-bold text-xl">Gym Berhasil Didaftarkan!</h2>
            <p className="text-slate-ash text-xs font-light">
              Membuka dashboard mandiri untuk <b>{gymName}</b>...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                Nama Climbing Gym / Boulder Studio
              </label>
              <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
                <Building2 size={16} className="text-slate-ash flex-shrink-0" />
                <input
                  required
                  placeholder="cth: BoulderBox Bali / Crux Arena"
                  value={gymName}
                  onChange={e => setGymName(e.target.value)}
                  className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                  Kota / Wilayah
                </label>
                <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
                  <MapPin size={16} className="text-slate-ash flex-shrink-0" />
                  <input
                    required
                    placeholder="cth: Denpasar / Bandung"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                  Nomor WhatsApp Gym
                </label>
                <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
                  <Phone size={16} className="text-slate-ash flex-shrink-0" />
                  <input
                    required
                    placeholder="+62 812-xxxx-xxxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                Alamat Lengkap Venue
              </label>
              <textarea
                required
                rows={2}
                placeholder="Jl. Raya No. ..., Kecamatan, Kelurahan"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-granite border border-white/5 rounded-xl p-3 text-chalk text-xs focus:outline-none focus:border-lime/40 font-normal resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-ash uppercase tracking-wider font-light block mb-1">
                Nama Penanggung Jawab (PIC / Owner)
              </label>
              <div className="flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 py-2.5 focus-within:border-lime/40">
                <User size={16} className="text-slate-ash flex-shrink-0" />
                <input
                  required
                  placeholder="cth: Bambang Sutrisno"
                  value={picName}
                  onChange={e => setPicName(e.target.value)}
                  className="bg-transparent text-chalk text-xs w-full focus:outline-none placeholder:font-light font-normal"
                />
              </div>
            </div>

            {/* Quick Sample Autocomplete Buttons for fast testing */}
            <div className="bg-granite/70 p-3 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[10px] text-slate-ash font-light uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-lime" /> Ingin coba daftar instan? Klik template:
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

            <button
              type="submit"
              className="w-full py-3.5 bg-lime text-granite font-light tracking-wide rounded-xl shadow-lime-glow hover:bg-lime-dim transition-all text-xs font-bold mt-2"
            >
              Aktifkan Dashboard Gym Sekarang 🎉
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-slate-ash font-light">
            Sudah terdaftar?{' '}
            <Link href="/admin/login" className="text-lime hover:underline font-bold">
              Masuk ke Dashboard Gym
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
