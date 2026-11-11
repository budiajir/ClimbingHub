'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  HelpCircle,
  Shield,
  FileText,
  AlertCircle,
  RefreshCw,
  Mail,
  ExternalLink,
  ChevronDown,
  ArrowLeft,
  Check,
  Compass,
  Building,
  Heart,
  Globe,
  Sparkles,
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export default function SettingsPage() {
  const { theme, isSandstone, toggleTheme } = useTheme()

  // State for Accordion FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  // State for Policies Tab (Privacy, Community Guideline, Cancellation, Refund)
  const [activePolicyTab, setActivePolicyTab] = useState<'privacy' | 'community' | 'cancellation' | 'refund'>('privacy')

  // Contact Email Form state
  const [contactSubject, setContactSubject] = useState('General Inquiry')
  const [contactMessage, setContactMessage] = useState('')
  const [emailSentToast, setEmailSentToast] = useState(false)

  // 1. FAQ Items (Frequently asked questions generated from user responses)
  const faqList = [
    {
      q: 'How do I log a completed climb and create an official Sent Card?',
      a: 'Navigate to any problem or boulder route under "Problems" or within a crag sector. Click "Log Ascent / Tick as Sent", fill in your attempt count, duration, belayer/photographer details, and upload your send photo. Your send is automatically immortalized as an official Jalur Sent Card in your Personal Account.',
    },
    {
      q: 'What is "Personal Access Only" (Closed for public) on my account?',
      a: 'To guarantee climber financial privacy and safeguard unpublished projects, your Order Wallet (booking codes and receipts), Wishlist items, and unfinished Route Drafts are strictly private to you. When visitors view your public climber profile, these sections are completely hidden.',
    },
    {
      q: 'How does checking in at a crag work?',
      a: 'When you arrive at an outdoor crag like Citatah or Lembah Harau, tap the "Check In at Crag" button on the crag page. This lets the community know how many active climbers are at the crag today and helps local rangers monitor visitor density.',
    },
    {
      q: 'Can I submit new outdoor boulder problems or route drafts?',
      a: 'Yes! Route setters and verified climbers can create new routes via the "+ Set New Route" button in Beta Topo. If your technical data is incomplete, save it as a "Route Draft". It will stay in your private Route Drafts until you are ready to publish.',
    },
    {
      q: 'How do gym session booking and equipment rental work?',
      a: 'You can discover partnered climbing gyms under "Climbing Gym", purchase day passes or monthly memberships, and obtain an instant QR code E-Ticket stored in your Order Wallet. Show your QR code at the gym front desk for seamless check-in.',
    },
    {
      q: 'What are Limestone and Basalt color modes?',
      a: 'Jalur offers two geological themes inspired by natural climbing rock formations: "Limestone" (daylight sandstone aesthetic with high readability in bright outdoors) and "Basalt" (dark granite night aesthetic with rich contrast).',
    },
  ]

  // Partners data
  const partnersList = [
    {
      name: 'FPTI (Federasi Panjat Tebing Indonesia)',
      role: 'National Governing Body',
      bio: 'The official national sports federation governing competition climbing, athlete certification, and national climbing championships in Indonesia.',
      logo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&q=80',
      website: 'https://fpti.or.id',
      badge: 'Official Federation',
    },
    {
      name: 'Evolv Indonesia',
      role: 'Technical Footwear Partner',
      bio: 'Pioneering high-friction performance climbing shoes, lifestyle boulder gear, and technical rubber resole support for Indonesian climbers.',
      logo: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=200&q=80',
      website: 'https://evolvsports.com',
      badge: 'Gear Partner',
    },
    {
      name: 'IndoClimb & Boulder House',
      role: 'Partner Climbing Gym Network',
      bio: 'Leading modern indoor bouldering and sport climbing facilities across Jakarta and Bandung, providing integrated digital passes on Jalur.',
      logo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200&q=80',
      website: 'https://indoclimb.com',
      badge: 'Gym Network',
    },
    {
      name: 'Komunitas Panjat Tebing Citatah & Harau Climbers',
      role: 'Local Crag Guardians & Ranger Alliance',
      bio: 'Local climber collectives and basecamp coordinators maintaining safety bolts, anchor preservation, local guide services, and emergency rescue at natural crags.',
      logo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=80',
      website: 'https://jalur.world/crags',
      badge: 'Crag Guardians',
    },
  ]

  const handleSendContactEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactMessage.trim()) return
    const mailtoUrl = `mailto:contact@jalur.world?subject=${encodeURIComponent(`[Jalur Website] ${contactSubject}`)}&body=${encodeURIComponent(contactMessage)}`
    window.open(mailtoUrl, '_blank')
    setEmailSentToast(true)
    setTimeout(() => setEmailSentToast(false), 3000)
    setContactMessage('')
  }

  return (
    <div className={`min-h-screen pb-28 pt-4 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 ${
      isSandstone ? 'text-[#1a1815]' : 'text-chalk'
    }`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {emailSentToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[130] px-4 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400"
          >
            <Check size={15} />
            <span>Email client opened. Thank you for reaching out to Jalur!</span>
          </motion.div>
        )}
      </AnimatePresence>

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
                Jalur
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 flex items-center gap-2.5">
              <SettingsIcon size={30} className="text-[#F90657]" /> Settings & Regulations
            </h1>
            <p className="text-xs sm:text-sm opacity-70 mt-0.5">
              Page of general personalization, platform regulation, policies, and background of the Jalur website.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. COLOR MODE SELECTION (Limestone or Basalt color theme)    */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <Sparkles size={18} /> Color Mode Selection
          </h2>
          <p className="text-xs opacity-70">
            Limestone or Basalt color theme option tailored for daylight outdoor reading and high-contrast night planning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option A: Basalt Mode */}
          <div
            onClick={() => {
              if (isSandstone) toggleTheme()
            }}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              !isSandstone
                ? 'bg-[#181D22] border-[#FF6B00] ring-2 ring-[#FF6B00] shadow-lg'
                : 'bg-black/5 border-black/10 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-black border border-white/20 flex items-center justify-center text-white">
                  <Moon size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Basalt Theme (Dark)</h3>
                  <span className="text-[10px] text-white/60">Volcanic Rock Night Palette</span>
                </div>
              </div>
              {!isSandstone && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF6B00] text-white">
                  Active
                </span>
              )}
            </div>

            <p className="text-xs text-white/70 font-light">
              Deep charcoal granite background (`#101418` & `#181D22`) paired with fluorescent chalk accents. Optimal for evening planning and OLED battery saving.
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (isSandstone) toggleTheme()
              }}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                !isSandstone
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {!isSandstone ? 'Active: Basalt Mode' : 'Switch to Basalt'}
            </button>
          </div>

          {/* Option B: Limestone Mode */}
          <div
            onClick={() => {
              if (!isSandstone) toggleTheme()
            }}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              isSandstone
                ? 'bg-[#f4efe6] border-[#FF6B00] ring-2 ring-[#FF6B00] shadow-lg text-[#1a1815]'
                : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100 text-chalk'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#ded3be] border border-[#1a1815]/20 flex items-center justify-center text-[#1a1815]">
                  <Sun size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Limestone Theme (Light)</h3>
                  <span className="text-[10px] opacity-60">Warm Sandstone Day Palette</span>
                </div>
              </div>
              {isSandstone && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF6B00] text-white">
                  Active
                </span>
              )}
            </div>

            <p className="text-xs opacity-75 font-light">
              Sunlit natural sandstone and limestone tones (`#ece4d5` & `#f4efe6`) with deep basalt typography. Engineered for bright sunlight at the crag base.
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (!isSandstone) toggleTheme()
              }}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                isSandstone
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isSandstone ? 'Active: Limestone Mode' : 'Switch to Limestone'}
            </button>
          </div>
        </div>
      </section>

      {/* Pink divider line */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 2. FAQ (Frequently asked questions generated from user respons)*/}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <HelpCircle size={18} /> Frequently Asked Questions (FAQ)
          </h2>
          <p className="text-xs opacity-70">
            Frequently asked questions generated from climber community feedback and platform usage.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqList.map((item, idx) => {
            const isOpen = openFaqIndex === idx
            return (
              <div
                key={idx}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-4.5 text-left flex items-center justify-between gap-3"
                >
                  <span className="font-bold text-xs sm:text-sm leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[#FF6B00] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-0 text-xs sm:text-[13px] opacity-80 leading-relaxed border-t border-black/5 dark:border-white/5"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pink divider line */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 3, 4, 5, 6: POLICIES (Privacy, Guidelines, Cancel, Refund)   */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <FileText size={18} /> Platform Regulations & Policies
          </h2>
          <p className="text-xs opacity-70">
            Official guidelines, privacy terms, cancellation policies, and refund rules on Jalur website.
          </p>
        </div>

        {/* Tab Selector */}
        <div className={`p-1 rounded-2xl flex flex-wrap gap-1 border ${
          isSandstone ? 'bg-[#1a1815]/10 border-[#1a1815]/20' : 'bg-black/40 border-white/10'
        }`}>
          {[
            { id: 'privacy', label: 'Privacy Policy', icon: Shield },
            { id: 'community', label: 'Community Guideline', icon: Globe },
            { id: 'cancellation', label: 'Cancellation Policy', icon: AlertCircle },
            { id: 'refund', label: 'Refund Policy', icon: RefreshCw },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activePolicyTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActivePolicyTab(tab.id as any)}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FF6B00] text-white shadow-md'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Policy Content Card */}
        <div className={`p-6 rounded-3xl border leading-relaxed space-y-4 text-xs sm:text-sm ${
          isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
        }`}>
          {/* Privacy Policy */}
          {activePolicyTab === 'privacy' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[#FF6B00]">Privacy Policy</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
                  Personal Access Guaranteed
                </span>
              </div>
              <h3 className="text-base font-bold text-chalk">Climber Data Privacy & Asset Ownership</h3>
              <p className="opacity-80">
                1. <strong>Ownership of Climber Media:</strong> All photographs, topo markings, beta route videos, and Sent Cards uploaded by users remain 100% intellectual property of the respective climber or photographer.
              </p>
              <p className="opacity-80">
                2. <strong>Confidential Personal Access:</strong> Your Order Wallet purchase history, E-ticket QR codes, Wishlist items, and unfinished Route Drafts are strictly confidential. They are locked under personal authentication and never exposed to the public.
              </p>
              <p className="opacity-80">
                3. <strong>Location & Analytics:</strong> GPS check-ins at crags are aggregated anonymously to compute live visitor density, helping prevent overcrowding without sharing precise personal whereabouts.
              </p>
            </div>
          )}

          {/* Community Guideline */}
          {activePolicyTab === 'community' && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-bold text-[#FF6B00]">Community Guideline</span>
              <h3 className="text-base font-bold text-chalk">Climbing Ethics & Digital Etiquette on Jalur</h3>
              <p className="opacity-80">
                1. <strong>Leave No Trace (LNT):</strong> Always leave natural climbing crags cleaner than you found them. Pack out all finger tape, cigarette butts, and plastic trash.
              </p>
              <p className="opacity-80">
                2. <strong>Soft Brushes Only:</strong> Brush off excess chalk and tick marks using soft natural boar-hair or nylon brushes. Wire brushes are strictly banned on limestone, sandstone, and andesite crags.
              </p>
              <p className="opacity-80">
                3. <strong>Respect Village Customs & Sacred Heritage:</strong> Respect local villagers, sacred megalith sites (e.g. in Harau and Siung), and agricultural terraces. Wear respectful attire when walking through residential areas.
              </p>
              <p className="opacity-80">
                4. <strong>Supportive Community Feed:</strong> Jalur fosters an inclusive, uplifting climbing culture. Spraying negativity, route vandalization, or grade gatekeeping is not tolerated.
              </p>
            </div>
          )}

          {/* Cancellation Policy */}
          {activePolicyTab === 'cancellation' && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-bold text-[#FF6B00]">Cancellation Policy</span>
              <h3 className="text-base font-bold text-chalk">Cancellation Policy Upon Orders Through Jalur Website</h3>
              <p className="opacity-80">
                1. <strong>Gym Day Passes & Sessions:</strong> Gym session bookings can be cancelled or rescheduled free of charge up to 12 hours prior to the reserved entry time directly from your Order Wallet.
              </p>
              <p className="opacity-80">
                2. <strong>Guided Crag Trips & Open Trips:</strong> Outdoor guided trip reservations may be cancelled up to 48 hours prior to trip departure with a full credit voucher or cash refund subject to administrative fees.
              </p>
              <p className="opacity-80">
                3. <strong>Gear Rental:</strong> Crash pad and gear rental bookings can be cancelled free of charge up to 24 hours prior to equipment pick-up at the basecamp.
              </p>
            </div>
          )}

          {/* Refund Policy */}
          {activePolicyTab === 'refund' && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider font-bold text-[#FF6B00]">Refund Policy</span>
              <h3 className="text-base font-bold text-chalk">Refund Policy Upon Orders Through Jalur Website</h3>
              <p className="opacity-80">
                1. <strong>Weather & Natural Crag Closures:</strong> If an outdoor trip or crag is declared inaccessible due to extreme natural weather conditions, land movement, or official BKSDA closure, a 100% full refund is issued automatically.
              </p>
              <p className="opacity-80">
                2. <strong>Gym Facility Maintenance:</strong> If a partnered gym is temporarily closed for route resetting or facility maintenance during your reserved pass window, full refund or complimentary pass extension is provided.
              </p>
              <p className="opacity-80">
                3. <strong>Processing Timeline:</strong> Approved refunds are credited back to the original payment method (QRIS, bank transfer, or e-wallet) within 3 to 5 business days.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Pink divider line */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 7. CONTACT (Contact through email)                           */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <Mail size={18} /> Contact Through Email
          </h2>
          <p className="text-xs opacity-70">
            Have questions, feedback, or want to register a new crag? Contact the Jalur core platform team directly.
          </p>
        </div>

        <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
          isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">Official Inquiries</span>
              <div className="font-mono text-base font-bold">contact@jalur.world</div>
              <p className="text-xs opacity-70">Also monitored at support@jalur.world</p>
            </div>

            <a
              href="mailto:contact@jalur.world"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
            >
              <Mail size={14} /> Send Direct Email &rarr;
            </a>
          </div>

          <form onSubmit={handleSendContactEmail} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold block opacity-80">Subject Category</label>
              <select
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs outline-none border transition-all ${
                  isSandstone
                    ? 'bg-white border-[#1a1815]/20 text-[#1a1815]'
                    : 'bg-black/30 border-white/10 text-white'
                }`}
              >
                <option value="General Inquiry">General Platform Inquiry</option>
                <option value="Register New Crag">Register a New Crag or Sector</option>
                <option value="Gym Partnership">Climbing Gym Integration & Partnership</option>
                <option value="Route Setter Verification">Route Setter & Guide Verification</option>
                <option value="Bug Report / Feedback">Bug Report & UI Suggestion</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold block opacity-80">Your Message / Feedback</label>
              <textarea
                rows={3}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Write your question, crag updates, or feedback here..."
                className={`w-full p-3 rounded-xl text-xs outline-none border transition-all resize-none ${
                  isSandstone
                    ? 'bg-white border-[#1a1815]/20 text-[#1a1815]'
                    : 'bg-black/30 border-white/10 text-white'
                }`}
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center gap-1.5 shadow-md"
            >
              <Mail size={14} /> Open Email Composer
            </button>
          </form>
        </div>
      </section>

      {/* Pink divider line */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 8. ABOUT (Background story of Jalur)                         */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <Compass size={18} /> About Jalur
          </h2>
          <p className="text-xs opacity-70">
            Background story, mission, and vision of Jalur.
          </p>
        </div>

        <div className={`p-6 sm:p-7 rounded-3xl border space-y-4 leading-relaxed ${
          isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
            <span>Our Origin Story</span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
            Building the Digital Foundation for Indonesian Rock Climbing
          </h3>

          <p className="text-xs sm:text-sm opacity-85 font-light">
            <strong>Jalur</strong> was born from a simple yet profound realization among Indonesian outdoor climbers and route setters: while our archipelago boasts world-class limestone karsts in Citatah and Siung, monolithic granite towers in Lembah Harau, and dramatic volcanic basalt crags from Java to Sulawesi, route topos and access beta remained fragmented across scattered notebooks, fading forum posts, and word-of-mouth lore.
          </p>

          <p className="text-xs sm:text-sm opacity-85 font-light">
            We built Jalur to bridge that gap. Jalur is a unified, climber-first digital ecosystem connecting outdoor crags, indoor climbing gyms, verified topo lines, and a passionate national community. Our mission is to preserve access, empower local basecamp managers and setters, cultivate sustainable Leave No Trace ethics, and make climbing accessible, safe, and deeply rewarding for every generation of climbers.
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className={`p-3 rounded-2xl border ${isSandstone ? 'bg-black/5 border-black/10' : 'bg-black/20 border-white/5'}`}>
              <span className="text-xl sm:text-2xl font-extrabold text-[#FF6B00]">15+</span>
              <span className="text-[11px] block opacity-70 mt-0.5">Natural Crags Mapped</span>
            </div>
            <div className={`p-3 rounded-2xl border ${isSandstone ? 'bg-black/5 border-black/10' : 'bg-black/20 border-white/5'}`}>
              <span className="text-xl sm:text-2xl font-extrabold text-[#06B6D4]">320+</span>
              <span className="text-[11px] block opacity-70 mt-0.5">Verified Route Topos</span>
            </div>
            <div className={`p-3 rounded-2xl border ${isSandstone ? 'bg-black/5 border-black/10' : 'bg-black/20 border-white/5'}`}>
              <span className="text-xl sm:text-2xl font-extrabold text-[#F90657]">1,400+</span>
              <span className="text-[11px] block opacity-70 mt-0.5">Climbers Connected</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pink divider line */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 9. PARTNER (Logo and short bio with link to official website)*/}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F90657] flex items-center gap-2">
            <Building size={18} /> Official Partners
          </h2>
          <p className="text-xs opacity-70">
            Logo and short bio of our partners with links to their official websites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partnersList.map((partner, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all hover:border-[#FF6B00]/40 ${
                isSandstone ? 'bg-[#f4efe6] border-[#1a1815]/15' : 'bg-[#181D22] border-white/10'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm leading-snug">{partner.name}</h4>
                      <span className="text-[11px] text-[#FF6B00] font-semibold">{partner.role}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80 shrink-0">
                    {partner.badge}
                  </span>
                </div>

                <p className="text-xs opacity-75 font-light leading-relaxed">
                  {partner.bio}
                </p>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] opacity-60">Verified Partner</span>
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06B6D4] hover:underline"
                >
                  <span>Visit Website</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
