'use client'

import { motion } from 'framer-motion'
import { X, Mountain, ShieldCheck, Clock, CheckCircle, Sparkles, Compass } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface RoadmapContributeModalProps {
  onClose: () => void
}

export default function RoadmapContributeModal({ onClose }: RoadmapContributeModalProps) {
  const { user, loginAsSuperAdmin } = useAuth()

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-lg bg-crag border border-lime/30 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-granite flex items-center justify-center text-slate-ash hover:text-chalk transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-lime/10 border border-lime/20 flex items-center justify-center text-lime mx-auto shadow-lime-glow-sm">
            <Mountain size={28} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-xs font-mono font-light uppercase">
            <Clock size={13} /> Roadmap · Community Contributions
          </div>
          <h2 className="text-chalk font-bold text-xl md:text-2xl">
            Official Outdoor Crag Curation
          </h2>
          <p className="text-slate-ash text-xs md:text-sm font-light leading-relaxed">
            Thank you for your enthusiasm, <b>{user?.name || 'Climber'}</b>! Currently, adding outdoor crag routes is curated exclusively by <b>Site Administrators & Official Jalur Curators</b>.
          </p>
        </div>

        {/* Why this restriction exists */}
        <div className="bg-granite/70 border border-white/5 rounded-2xl p-4 space-y-3 text-xs text-slate-ash font-light leading-relaxed">
          <div className="text-chalk font-bold flex items-center gap-2">
            <ShieldCheck size={16} className="text-lime" />
            Why Centralized Route Curation?
          </div>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <b className="text-chalk font-normal">Crag Safety Standards</b>: Hardware verification (bolts/hangers), rock integrity, and anchor setups.
            </li>
            <li>
              <b className="text-chalk font-normal">Local Access & Etiquette</b>: Respecting local land-use agreements and guidelines across crags.
            </li>
            <li>
              <b className="text-chalk font-normal">Topo Accuracy & Consensus</b>: Preventing duplicates and maintaining reliable grade consensus.
            </li>
          </ul>
        </div>

        {/* Early Access Notification Banner */}
        <div className="bg-lime/10 border border-lime/30 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-lime text-granite flex items-center justify-center flex-shrink-0 font-bold shadow-lime-glow-sm">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-chalk block">
              Your Account is Registered for Early Access
            </span>
            <span className="text-[11px] text-slate-ash font-light">
              Crowdsourced route submission will be rolled out gradually to registered climbers.
            </span>
          </div>
        </div>

        {/* Quick Demo Switcher Button */}
        <div className="pt-2 border-t border-white/5">
          <p className="text-[11px] text-slate-ash font-light text-center mb-2">
            Want to test the route creation tool right now?
          </p>
          <button
            onClick={() => {
              loginAsSuperAdmin()
              onClose()
            }}
            className="w-full py-2.5 bg-granite border border-white/10 hover:border-lime/40 text-chalk text-xs rounded-xl flex items-center justify-center gap-2 transition-all group font-light"
          >
            <ShieldCheck size={14} className="text-lime group-hover:scale-110 transition-transform" />
            <span>Switch to <b>Website Owner (Super Admin)</b> Mode ⚡</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
