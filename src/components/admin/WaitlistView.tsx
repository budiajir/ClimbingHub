'use client'

import { useState, useEffect } from 'react'
import { Users, RefreshCw, Mail, Calendar, CheckCircle2, Copy } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

interface WaitlistItem {
  id: string
  name: string
  email: string
  created_at: string
  source: string
}

export default function WaitlistView() {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'

  const [items, setItems] = useState<WaitlistItem[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const fetchWaitlist = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/waitlist')
      const data = await res.json()
      if (data.success) {
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error('Failed to fetch waitlist:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWaitlist()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEmail(text)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header Metric Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${
          isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-ash">
              Total Antusias Beta
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F90657]/10 text-[#F90657] flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#F90657] font-mono">
              {total}
            </span>
            <span className="text-xs text-slate-ash font-light">
              climbers terdaftar
            </span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${
          isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-ash">
              Sumber Traffic
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-mono font-bold text-xs">
              JW
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-chalk">
              jalur.world
            </span>
            <p className="text-[11px] text-slate-ash mt-0.5">
              Landing page early access form
            </p>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-ash">
              Database Sync
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 size={13} /> Supabase Live
            </span>
          </div>
          <div className="pt-2">
            <button
              onClick={fetchWaitlist}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Memuat Data...' : 'Segarkan Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Climber Submissions List */}
      <div className={`rounded-2xl border overflow-hidden ${
        isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
      }`}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-chalk">
              Daftar Climbers Tertarik (Beta Testing)
            </h3>
            <p className="text-xs text-slate-ash mt-0.5 font-light">
              Semua nama dan email yang melakukan submit di formulir jalur.world
            </p>
          </div>
          <span className="text-xs text-slate-ash font-mono">
            {items.length} Record(s)
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-ash space-y-2">
            <Users size={32} className="mx-auto opacity-40 text-slate-ash" />
            <p className="text-xs font-light">
              Belum ada data pendaftar baru dari jalur.world.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map((item, idx) => {
              const formattedDate = new Date(item.created_at).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })

              return (
                <div
                  key={item.id || idx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F90657]/15 border border-[#F90657]/30 text-[#F90657] font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-chalk">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-slate-ash flex items-center gap-1">
                          <Mail size={11} /> {item.email}
                        </span>
                        <button
                          onClick={() => copyToClipboard(item.email)}
                          title="Salin email"
                          className="text-[10px] text-slate-ash hover:text-white p-0.5 transition-colors"
                        >
                          {copiedEmail === item.email ? (
                            <span className="text-emerald-400 font-bold text-[10px]">Tersalin!</span>
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-ash flex-shrink-0">
                    <span className="flex items-center gap-1 text-[11px] font-light">
                      <Calendar size={12} /> {formattedDate}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-slate-ash">
                      {item.source || 'jalur.world'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
