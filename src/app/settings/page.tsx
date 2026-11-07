'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Shield,
  FileText,
  HelpCircle,
  Bell,
  Scale,
  Compass,
  Check,
  ChevronRight,
  ExternalLink,
  Mail,
  Instagram,
  Lock,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export default function SettingsPage() {
  const { isSandstone, toggleTheme } = useTheme()

  // Personalization states
  const [gradeScale, setGradeScale] = useState<'v-scale' | 'font' | 'yds'>('v-scale')
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric')
  const [notifAscents, setNotifAscents] = useState(true)
  const [notifGyms, setNotifGyms] = useState(true)
  const [notifCommunity, setNotifCommunity] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Active regulation tab: guidelines | safety | privacy | refund
  const [activeRegTab, setActiveRegTab] = useState<'guidelines' | 'safety' | 'privacy' | 'refund'>('guidelines')

  const handleSavePreferences = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className={`min-h-screen pb-28 pt-4 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 ${
      isSandstone ? 'text-[#1a1815]' : 'text-chalk'
    }`}>
      {/* Top Breadcrumb & Header */}
      <div className="space-y-2">
        <Link
          href="/"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold opacity-70 hover:opacity-100 transition-opacity ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#FF6B00]">
                V1.0 Feature
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                Active
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 flex items-center gap-2.5">
              <SettingsIcon size={30} className="text-[#F90657]" /> Settings & Policies
            </h1>
            <p className="text-xs sm:text-sm opacity-70 mt-0.5">
              Page of general personalization and platform regulation for Jalur website
            </p>
          </div>

          <button
            onClick={handleSavePreferences}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center justify-center gap-1.5 shadow-md self-start sm:self-auto"
          >
            {savedSuccess ? (
              <>
                <Check size={14} /> Saved!
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. GENERAL PERSONALIZATION SECTION                           */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <Sparkles size={18} /> General Personalization
          </h2>
          <p className="text-xs opacity-70">
            Customize visual theme, climbing grading scales, and measurement units
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Theme Preference */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
            isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
          }`}>
            <div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Sun size={16} className="text-[#FF6B00]" />
                <span>Display Visual Theme</span>
              </div>
              <p className="text-xs opacity-70 mt-1">
                Toggle between dark granite limestone and warm sandstone daylight mode.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (isSandstone) toggleTheme()
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !isSandstone
                    ? 'bg-black text-white border-[#FF6B00] shadow-md font-bold'
                    : 'bg-black/10 border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <span className="block text-xs font-bold">Granite (Dark)</span>
                <span className="text-[10px] opacity-70">High-contrast night mode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isSandstone) toggleTheme()
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSandstone
                    ? 'bg-[#ded3be] text-[#1a1815] border-[#1a1815] shadow-md font-bold'
                    : 'bg-white/5 border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <span className="block text-xs font-bold">Sandstone (Warm)</span>
                <span className="text-[10px] opacity-70">Natural earth day mode</span>
              </button>
            </div>
          </div>

          {/* Card B: Climbing Grade System */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
            isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
          }`}>
            <div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Scale size={16} className="text-[#06B6D4]" />
                <span>Preferred Grade System</span>
              </div>
              <p className="text-xs opacity-70 mt-1">
                Default grading scale shown across Problems, Topo betabooks, and Send Cards.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { id: 'v-scale', title: 'V-Scale', sub: 'Hueco (V0-V17)' },
                { id: 'font', title: 'Font', sub: 'Bleau (4 - 8c+)' },
                { id: 'yds', title: 'YDS', sub: 'Yosemite (5.8-5.15)' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGradeScale(g.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    gradeScale === g.id
                      ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md font-bold'
                      : isSandstone
                      ? 'bg-[#1a1815]/5 border-transparent opacity-70 hover:opacity-100'
                      : 'bg-white/5 border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="block text-xs font-bold">{g.title}</span>
                  <span className="text-[9px] opacity-70 block truncate">{g.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card C: Units of Measurement */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
            isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
          }`}>
            <div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Compass size={16} className="text-[#FF6B00]" />
                <span>Measurement Units</span>
              </div>
              <p className="text-xs opacity-70 mt-1">
                Wall height, route lengths, and altitude units.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setUnitSystem('metric')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  unitSystem === 'metric'
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md font-bold'
                    : isSandstone
                    ? 'bg-[#1a1815]/5 border-transparent opacity-70'
                    : 'bg-white/5 border-transparent opacity-70'
                }`}
              >
                <span className="block text-xs font-bold">Metric System</span>
                <span className="text-[10px] opacity-70">Meters (m), Centimeters (cm)</span>
              </button>

              <button
                type="button"
                onClick={() => setUnitSystem('imperial')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  unitSystem === 'imperial'
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md font-bold'
                    : isSandstone
                    ? 'bg-[#1a1815]/5 border-transparent opacity-70'
                    : 'bg-white/5 border-transparent opacity-70'
                }`}
              >
                <span className="block text-xs font-bold">Imperial System</span>
                <span className="text-[10px] opacity-70">Feet (ft), Inches (in)</span>
              </button>
            </div>
          </div>

          {/* Card D: Push Notification Preferences */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
            isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
          }`}>
            <div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Bell size={16} className="text-amber-400" />
                <span>Notification Alerts</span>
              </div>
              <p className="text-xs opacity-70 mt-1">
                Choose alerts delivered to your personal device.
              </p>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <span>Friend ascent sends & project ticks</span>
                <input
                  type="checkbox"
                  checked={notifAscents}
                  onChange={(e) => setNotifAscents(e.target.checked)}
                  className="rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <span>Gym session booking reminders</span>
                <input
                  type="checkbox"
                  checked={notifGyms}
                  onChange={(e) => setNotifGyms(e.target.checked)}
                  className="rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <span>Community group announcements</span>
                <input
                  type="checkbox"
                  checked={notifCommunity}
                  onChange={(e) => setNotifCommunity(e.target.checked)}
                  className="rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Pink divider line */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 2. PLATFORM REGULATIONS & POLICIES SECTION                    */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <Shield size={18} /> Website Regulations & Policies
          </h2>
          <p className="text-xs opacity-70">
            Official guidelines, outdoor rock ethics, safety regulations, and data policies
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'guidelines', label: 'Community & Rock Ethics' },
            { id: 'safety', label: 'Outdoor Safety & Risk' },
            { id: 'privacy', label: 'Privacy & Ascent Rights' },
            { id: 'refund', label: 'Cancellation & Refund' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRegTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeRegTab === tab.id
                  ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-md'
                  : isSandstone
                  ? 'border-[#1a1815]/20 text-[#1a1815]/70 hover:border-[#1a1815]/50'
                  : 'border-white/10 text-slate-ash hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Box */}
        <div className={`p-6 rounded-3xl border leading-relaxed space-y-4 text-xs sm:text-sm ${
          isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
        }`}>
          {activeRegTab === 'guidelines' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#FF6B00]">Leave No Trace (LNT) & Crag Ethics</h3>
              <p className="opacity-80">
                1. <strong>Pack out all trash:</strong> Leave natural climbing areas cleaner than you found them, including tape residues, food wrappers, and cigarette butts.
              </p>
              <p className="opacity-80">
                2. <strong>Clean chalk & tick marks:</strong> Always use soft natural boar-hair brushes to brush off excessive chalk and chalk tick marks before departing any boulder problem. Wire brushes are strictly forbidden on limestone and sandstone.
              </p>
              <p className="opacity-80">
                3. <strong>Stay on established access trails:</strong> Respect local villagers, sacred megalith sites in Harau, and agricultural terraces surrounding Citatah crags.
              </p>
            </div>
          )}

          {activeRegTab === 'safety' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#FF6B00]">Outdoor Climbing Safety Disclaimer</h3>
              <p className="opacity-80">
                Rock climbing and outdoor bouldering are inherently hazardous activities involving serious risks of injury. Topos, GPS coordinates, and beta lines provided on Jalur are informational reference materials.
              </p>
              <p className="opacity-80">
                Always assess rock quality, anchor conditions, pad placement, and weather before climbing. Every climber bears personal responsibility for their equipment, belaying, and spotting.
              </p>
            </div>
          )}

          {activeRegTab === 'privacy' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#FF6B00]">Privacy & Climber Media Rights</h3>
              <p className="opacity-80">
                1. <strong>Ascent Media Ownership:</strong> All photographs, beta videos, and Send Cards uploaded by climbers remain 100% intellectual property of the climber.
              </p>
              <p className="opacity-80">
                2. <strong>Personal Access Protection:</strong> Sensitive personal data—including your Order Wallet transactions, booking codes, Wishlist items, and unfinished Route Drafts—are strictly private and closed for public access.
              </p>
            </div>
          )}

          {activeRegTab === 'refund' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#FF6B00]">Gym Booking Cancellation & Refund Policy</h3>
              <p className="opacity-80">
                1. <strong>Rescheduling:</strong> Gym session passes may be rescheduled free of charge up to 24 hours prior to reserved session start time.
              </p>
              <p className="opacity-80">
                2. <strong>Refunds:</strong> Full refunds are provided in cases of facility maintenance closures or verified emergencies within 3-5 business days.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Pink divider line */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 3. SUPPORT & CONTACT CHANNELS                                 */}
      {/* ============================================================ */}
      <section className="space-y-3">
        <h3 className="font-bold text-base text-[#F90657]">Need Direct Assistance?</h3>
        <p className="text-xs opacity-70">
          Reach out to the Jalur core platform team for questions, crag guide updates, or gym partnership inquiries:
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href="mailto:support@jalur.world"
            className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 hover:border-[#FF6B00] flex items-center gap-2 transition-all"
          >
            <Mail size={14} className="text-[#FF6B00]" />
            <span>support@jalur.world</span>
          </a>

          <a
            href="https://instagram.com/jalur.world"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 hover:border-[#E1306C] flex items-center gap-2 transition-all text-[#E1306C]"
          >
            <Instagram size={14} />
            <span>@jalur.world</span>
          </a>
        </div>
      </section>
    </div>
  )
}
