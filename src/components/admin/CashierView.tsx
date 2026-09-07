'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, CheckCircle, XCircle, Loader2, Hash, Users, TrendingUp, History, ShieldCheck } from 'lucide-react'

interface VerificationResult {
  status: 'success' | 'invalid' | 'used'
  bookingCode: string
  visitorName: string
  session: string
  gymName: string
  qty: number
}

const mockLookup = (code: string): Promise<VerificationResult> =>
  new Promise(resolve =>
    setTimeout(() => {
      if (code === 'CLIMB001') {
        resolve({ status: 'success', bookingCode: code, visitorName: 'Ahmad Rizki', session: 'Morning · 07:00–10:00', gymName: 'Vertigo Boulder Gym', qty: 2 })
      } else if (code === 'CLIMB002') {
        resolve({ status: 'used', bookingCode: code, visitorName: 'Maya Sari', session: 'Evening · 15:00–20:00', gymName: 'Vertigo Boulder Gym', qty: 1 })
      } else {
        resolve({ status: 'invalid', bookingCode: code, visitorName: '', session: '', gymName: '', qty: 0 })
      }
    }, 600)
  )

const recentCheckIns = [
  { code: 'CH78A2', name: 'Budi Santoso', session: 'Morning', qty: 1, time: '08:14 WIB' },
  { code: 'CH99X1', name: 'Sari Dewi', session: 'Morning', qty: 2, time: '07:50 WIB' },
  { code: 'CH34K9', name: 'Rizky Fauzan', session: 'Morning', qty: 1, time: '07:35 WIB' },
]

export default function CashierView() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [dailyStats] = useState({ visitors: 47, revenue: 3525000 })

  const verify = async (inputCode: string = code) => {
    if (!inputCode.trim()) return
    setLoading(true)
    setResult(null)
    const res = await mockLookup(inputCode.trim().toUpperCase())
    setResult(res)
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Column: QR Scanner & Manual Input */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-crag border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <QrCode size={18} className="text-lime" />
            <h3 className="text-chalk font-bold text-base">Scanner & Manual Input POS</h3>
          </div>

          {/* QR Viewfinder */}
          <div className="relative aspect-square max-h-56 md:max-h-64 bg-granite rounded-2xl flex items-center justify-center mb-4 overflow-hidden border border-white/5">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-44 h-44 relative">
                {/* Corner brackets */}
                {[['top-0 left-0 border-t-2 border-l-2', ''], ['top-0 right-0 border-t-2 border-r-2', ''], ['bottom-0 left-0 border-b-2 border-l-2', ''], ['bottom-0 right-0 border-b-2 border-r-2', '']].map(([pos], i) => (
                  <div key={i} className={`absolute w-8 h-8 border-lime rounded-sm ${pos}`} />
                ))}
                {/* Scan line animation */}
                <motion.div
                  className="absolute left-2 right-2 h-0.5 bg-lime shadow-lime-glow-sm"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>
            <p className="text-slate-ash text-xs font-light mt-44">Arahkan kamera ke QR Code E-Ticket</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-slate-ash text-xs font-light">atau validasi booking code</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Manual input */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-granite border border-white/5 rounded-xl px-3 focus-within:border-lime/40 transition-colors">
              <Hash size={16} className="text-slate-ash flex-shrink-0" />
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && verify()}
                placeholder="Booking Code (cth: CLIMB001)"
                className="flex-1 bg-transparent py-3 text-chalk text-sm font-mono focus:outline-none placeholder:font-light placeholder:text-slate-ash/40"
              />
            </div>
            <button
              onClick={() => verify()}
              disabled={loading || !code}
              className="px-5 bg-lime text-granite rounded-xl font-light tracking-wide text-sm disabled:opacity-50 touch-ripple transition-all hover:bg-lime-dim min-w-[76px]"
            >
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Verifikasi'}
            </button>
          </div>

          {/* Quick test codes */}
          <div className="bg-granite/70 rounded-xl p-3 mt-4 border border-white/5">
            <p className="text-slate-ash text-[10px] uppercase tracking-wider mb-2 font-light">Demo Quick Test Codes</p>
            <div className="flex gap-2 flex-wrap">
              {['CLIMB001', 'CLIMB002', 'INVALID'].map(c => (
                <button
                  key={c}
                  onClick={() => { setCode(c); verify(c) }}
                  className="text-xs font-mono text-cyan-climb bg-cyan-climb/10 border border-cyan-climb/20 px-2.5 py-1 rounded-lg touch-ripple hover:bg-cyan-climb/20"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Daily Stats & Verification Result */}
      <div className="lg:col-span-6 space-y-4">
        {/* Daily Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-crag border border-white/5 rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-cyan-climb" />
              <span className="text-slate-ash text-xs font-light">Visitors Today</span>
            </div>
            <div className="text-chalk font-bold text-3xl md:text-4xl">{dailyStats.visitors}</div>
            <div className="text-lime text-xs flex items-center gap-1 mt-1 font-light">
              <TrendingUp size={12} /> +12% vs kemarin
            </div>
          </div>
          <div className="bg-crag border border-white/5 rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-lime" />
              <span className="text-slate-ash text-xs font-light">Revenue Today</span>
            </div>
            <div className="text-chalk font-bold text-2xl md:text-3xl">
              Rp {(dailyStats.revenue / 1000000).toFixed(2)}jt
            </div>
            <div className="text-slate-ash text-xs font-light mt-1">Rp {dailyStats.revenue.toLocaleString('id-ID')}</div>
          </div>
        </div>

        {/* Verification Result Notification */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`rounded-2xl p-5 border ${
                result.status === 'success'
                  ? 'bg-lime/10 border-lime/30'
                  : result.status === 'used'
                  ? 'bg-project/10 border-project/30'
                  : 'bg-redpoint/10 border-redpoint/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {result.status === 'success' ? (
                  <CheckCircle size={28} className="text-lime flex-shrink-0" />
                ) : (
                  <XCircle size={28} className={`flex-shrink-0 ${result.status === 'used' ? 'text-project' : 'text-redpoint'}`} />
                )}
                <div className="flex-1">
                  <p className={`font-bold text-base md:text-lg mb-1 ${
                    result.status === 'success' ? 'text-lime' :
                    result.status === 'used' ? 'text-project' : 'text-redpoint'
                  }`}>
                    {result.status === 'success' ? '✅ TIKET VALID — Silakan Masuk!' :
                     result.status === 'used' ? '⚠️ PERINGATAN: Tiket Sudah Digunakan' : '❌ KODE TIKET TIDAK DITEMUKAN'}
                  </p>
                  {result.status !== 'invalid' && (
                    <div className="space-y-0.5">
                      <p className="text-chalk font-bold text-sm">{result.visitorName} ({result.qty} Pengunjung)</p>
                      <p className="text-slate-ash text-xs font-normal">{result.session}</p>
                      <p className="text-slate-ash text-xs font-light">{result.gymName}</p>
                    </div>
                  )}
                  <p className="text-slate-ash text-xs font-mono mt-2 bg-granite/40 px-2 py-0.5 rounded inline-block">
                    Code: {result.bookingCode}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Check-Ins Table */}
        <div className="bg-crag border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <History size={16} className="text-slate-ash" />
            <h4 className="text-chalk font-bold text-sm">Riwayat Check-In Terakhir</h4>
          </div>
          <div className="space-y-2">
            {recentCheckIns.map(item => (
              <div key={item.code} className="flex items-center justify-between bg-granite rounded-xl p-3 border border-white/5 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-lime/10 text-lime flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <div>
                    <div className="text-chalk font-bold">{item.name}</div>
                    <div className="text-slate-ash text-[10px] font-light">{item.session} · {item.qty} orang</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-slate-ash text-[11px] block">{item.code}</span>
                  <span className="text-[10px] text-lime font-mono">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
