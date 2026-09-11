'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Sliders, Store, ShieldAlert, Lock, ArrowRight, Building2, UserPlus, LogIn, ChevronLeft } from 'lucide-react'
import CashierView from '@/components/admin/CashierView'
import SlotManager from '@/components/admin/SlotManager'
import { useAuth } from '@/lib/auth-context'
import { canAccessGymAdmin } from '@/lib/permissions'
import Link from 'next/link'
import { useTheme } from '@/lib/theme-context'

type AdminTab = 'cashier' | 'slots'

export default function AdminDashboardPage() {
  const { role, gymTenant, loginAsGymAdmin } = useAuth()
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const [activeTab, setActiveTab] = useState<AdminTab>('cashier')

  const isAuthorized = canAccessGymAdmin(role)

  // IF NOT AUTHORIZED: Render Restricted Private Gate
  if (!isAuthorized) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 md:py-24 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-3xl bg-redpoint/10 border border-redpoint/30 flex items-center justify-center text-redpoint mx-auto shadow-lg"
        >
          <Lock size={32} />
        </motion.div>

          <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-redpoint/10 border border-redpoint/20 text-redpoint text-xs font-mono font-light uppercase">
            <ShieldAlert size={13} /> Private Merchant Gate · 403 Forbidden
          </div>
          <h1 className={`font-bold text-2xl md:text-3xl ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}>
            Gym Admin Portal
          </h1>
          <p className={`text-xs md:text-sm font-light max-w-md mx-auto leading-relaxed ${
            isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
          }`}>
            This dashboard is not accessible to the public or regular climber accounts. It is reserved exclusively for registered gym partners, staff, and cashiers.
          </p>
        </div>

        {/* Action Options */}
        <div className="bg-crag border border-white/5 rounded-2xl p-5 space-y-3 text-left">
          <p className="text-[11px] text-slate-ash font-light uppercase tracking-wider mb-2">
            Gym Partner Access Options:
          </p>

          <Link
            href="/admin/login"
            className="flex items-center justify-between p-3.5 rounded-xl bg-granite border border-white/5 hover:border-lime/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime/10 text-lime flex items-center justify-center">
                <LogIn size={16} />
              </div>
              <div>
                <span className="text-chalk font-bold text-sm block group-hover:text-lime transition-colors">
                  Sign In to Gym Account
                </span>
                <span className="text-[11px] text-slate-ash font-light">
                  Already registered as a climbing gym partner
                </span>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-ash group-hover:text-lime transition-colors" />
          </Link>

          <Link
            href="/admin/register"
            className="flex items-center justify-between p-3.5 rounded-xl bg-granite border border-white/5 hover:border-lime/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-climb/10 text-cyan-climb flex items-center justify-center">
                <Building2 size={16} />
              </div>
              <div>
                <span className="text-chalk font-bold text-sm block group-hover:text-cyan-climb transition-colors">
                  Register New Gym
                </span>
                <span className="text-[11px] text-slate-ash font-light">
                  Activate a self-managed dashboard for your facility
                </span>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-ash group-hover:text-cyan-climb transition-colors" />
          </Link>

          {/* Instant Demo Option */}
          <div className="pt-2">
            <button
              onClick={() => loginAsGymAdmin()}
              className="w-full py-2.5 bg-lime/10 border border-lime/30 text-lime rounded-xl text-xs font-bold hover:bg-lime/20 transition-all text-center"
            >
              ⚡ Quick Launch (Gym Admin Demo Mode)
            </button>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-ash hover:text-chalk font-light transition-colors"
        >
          <ChevronLeft size={14} /> Back to Public Home
        </Link>
      </div>
    )
  }

  // IF AUTHORIZED (GYM ADMIN): Render Tenant-Isolated Dashboard
  const currentGym = gymTenant || {
    name: 'Vertigo Boulder Gym',
    city: 'South Jakarta',
    picName: 'Adi Prasetyo',
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:px-6 lg:px-8 space-y-6">
      {/* Tenant Merchant Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
        isSandstone ? 'border-[#1a1815]/15' : 'border-white/5'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold shadow-lime-glow-sm ${
            isSandstone ? 'bg-[#1a1815]/10 border-[#1a1815]/20 text-[#1a1815]' : 'bg-lime/10 border-lime/20 text-lime'
          }`}>
            <Store size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-bold text-lg md:text-2xl ${
                isSandstone ? 'text-[#1a1815]' : 'text-chalk'
              }`}>
                {currentGym.name} POS
              </h1>
              <span className={`flex items-center gap-1 px-2.5 py-0.5 border rounded-full text-[10px] font-mono font-light ${
                isSandstone ? 'bg-[#1a1815]/10 border-[#1a1815]/30 text-[#1a1815]' : 'bg-lime/10 border-lime/30 text-lime'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isSandstone ? 'bg-[#1a1815]' : 'bg-lime'}`} /> PRIVATE DASHBOARD
              </span>
            </div>
            <p className={`text-xs font-light ${
              isSandstone ? 'text-[#1a1815]/70' : 'text-slate-ash'
            }`}>
              Admin: <span className={isSandstone ? 'text-[#1a1815] font-medium' : 'text-chalk'}>{currentGym.picName}</span> · Location: <span className={isSandstone ? 'text-[#1a1815] font-medium' : 'text-chalk'}>{currentGym.city}</span>
            </p>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="flex bg-crag p-1 rounded-xl border border-white/5 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('cashier')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs md:text-sm rounded-lg transition-all touch-ripple ${
              activeTab === 'cashier'
                ? 'bg-lime text-granite shadow-lime-glow-sm font-bold'
                : 'text-slate-ash hover:text-chalk font-light'
            }`}
          >
            <QrCode size={16} /> Cashier POS
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs md:text-sm rounded-lg transition-all touch-ripple ${
              activeTab === 'slots'
                ? 'bg-lime text-granite shadow-lime-glow-sm font-bold'
                : 'text-slate-ash hover:text-chalk font-light'
            }`}
          >
            <Sliders size={16} /> Slot & Quota Manager
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'cashier' && (
          <motion.div
            key="cashier"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CashierView />
          </motion.div>
        )}

        {activeTab === 'slots' && (
          <motion.div
            key="slots"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SlotManager />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
