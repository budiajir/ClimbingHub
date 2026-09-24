'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  HelpCircle,
  Shield,
  BookOpen,
  Clock,
  RefreshCw,
  Phone,
  Info,
  Mail,
  Instagram,
  MessageCircle,
  LucideIcon,
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export type PolicyKey = 'faq' | 'privacy' | 'guideline' | 'cancellation' | 'refund' | 'contact' | 'about'

interface PolicyModalProps {
  isOpen: boolean
  activeKey: PolicyKey | null
  onClose: () => void
}

const POLICY_DETAILS: Record<
  PolicyKey,
  {
    title: string
    subtitle: string
    icon: LucideIcon
    content: React.ReactNode
  }
> = {
  faq: {
    title: 'Frequently Asked Questions (F.A.Q)',
    subtitle: 'Questions regarding route logging, send cards, and Jalur features',
    icon: HelpCircle,
    content: (
      <div className="space-y-4 text-xs leading-relaxed">
        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1.5">
          <h4 className="font-bold text-sm">How do I log a verified ascent?</h4>
          <p className="opacity-80">
            Open the <b>Problems</b> menu, select the route you completed, and click <b>Log Ascent</b>. You can upload an action photo or video clip as proof, choose your ascent style (Flash, Redpoint, Onsight), and automatically generate an official <b>Ascent Send Card</b> ready to save to your photo library or share.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1.5">
          <h4 className="font-bold text-sm">Can I add a new outdoor crag route?</h4>
          <p className="opacity-80">
            To maintain topography accuracy and community safety, outdoor crags are officially curated. You can submit route additions or corrections via <b>+ Set New Route</b> in the route action bar.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1.5">
          <h4 className="font-bold text-sm">How do I save the Send Card to my iPhone photos?</h4>
          <p className="opacity-80">
            On iOS Safari, tap <b>Save to Photos / Share</b> and select <b>&quot;Save Image&quot;</b> from the native iPhone share sheet. You can also press and hold (long-press) the card preview image and choose <b>&quot;Save to Photos&quot;</b>.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1.5">
          <h4 className="font-bold text-sm">How do I book a session pass at a Bouldering Gym?</h4>
          <p className="opacity-80">
            Visit the <b>Gym Directory</b>, choose a partner gym, select your preferred date and session slot, and complete checkout. An E-Ticket with a unique QR code will be generated instantly for quick check-in at the front desk.
          </p>
        </div>
      </div>
    ),
  },

  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Personal data protection and privacy policy for Jalur users',
    icon: Shield,
    content: (
      <div className="space-y-4 text-xs leading-relaxed">
        <p className="opacity-85">
          At <b>Jalur (ClimbingHub)</b>, we prioritize the privacy and data security of climbers across Indonesia and worldwide.
        </p>

        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <h5 className="font-bold mb-1">1. Information We Collect</h5>
            <p className="opacity-80">
              Profile details (climber name, email, avatar), ascent logs (history, logged grades, beta media), and gym ticket booking records.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <h5 className="font-bold mb-1">2. Media & Beta Video Usage</h5>
            <p className="opacity-80">
              Photos and videos uploaded when logging ascents are strictly used for ascent verification and generating your personal Send Card. All media copyrights remain 100% with the climber.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <h5 className="font-bold mb-1">3. Data Security & Third Parties</h5>
            <p className="opacity-80">
              We never sell your personal information to third parties. All transaction data is processed using modern end-to-end encrypted security standards.
            </p>
          </div>
        </div>
      </div>
    ),
  },

  guideline: {
    title: 'Community Guidelines',
    subtitle: 'Climbing ethics, outdoor safety, and nature conservation',
    icon: BookOpen,
    content: (
      <div className="space-y-3.5 text-xs leading-relaxed">
        <p className="opacity-85">
          The climbing community is built upon mutual respect, environmental stewardship, and safety awareness:
        </p>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">🌿 Leave No Trace (LNT) Principles</h5>
          <p className="opacity-80">
            Pack out all trash without exception, including tape scraps, cigarette butts, and fruit peels. Never alter natural rock formations or disturb flora surrounding the boulder zones.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">🧹 Clean Chalk & Tick Marks</h5>
          <p className="opacity-80">
            Always brush off heavy chalk buildup and line tick marks after finishing your session using a soft nylon or boar-hair brush so the rock stays clean and natural for the next climber.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">🤝 Gym & Crag Etiquette</h5>
          <p className="opacity-80">
            Give space to active climbers on the wall, never walk underneath another climber&apos;s fall zone, and spread positive psyche to your fellow climbers.
          </p>
        </div>
      </div>
    ),
  },

  cancellation: {
    title: 'Cancellation Policy',
    subtitle: 'Cancellation terms and schedule modifications for gym passes',
    icon: Clock,
    content: (
      <div className="space-y-3.5 text-xs leading-relaxed">
        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">⏱ Cancellation Deadline (24 Hours Prior)</h5>
          <p className="opacity-80">
            Cancellations or reschedule requests can be made up to 24 hours before your reserved session start time.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">🔄 Free Reschedule</h5>
          <p className="opacity-80">
            Every gym pass includes 1 free schedule change to another available slot within 30 days of the purchase date.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">⚠️ No-Show Policy</h5>
          <p className="opacity-80">
            If a ticket holder fails to show up without prior notice before the session ends, the ticket is forfeited and cannot be transferred or refunded.
          </p>
        </div>
      </div>
    ),
  },

  refund: {
    title: 'Refund Policy',
    subtitle: 'Refund terms for gym booking transactions',
    icon: RefreshCw,
    content: (
      <div className="space-y-3.5 text-xs leading-relaxed">
        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">💯 Full Refund (100%)</h5>
          <p className="opacity-80">
            A full refund is provided if facility closure occurs due to gym management decisions (e.g. emergency wall maintenance, safety turnover, or private competition closures).
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">⚡ Processing Method & Timelines</h5>
          <p className="opacity-80">
            Approved refunds will be credited back to your original payment method (Bank Transfer, E-Wallet, or QRIS) within 3 to 5 business days.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <h5 className="font-bold mb-1 text-sm">🎟 Instant Credit Voucher</h5>
          <p className="opacity-80">
            As a fast alternative, you can choose a balance credit voucher for future climbing sessions with no expiration date.
          </p>
        </div>
      </div>
    ),
  },

  contact: {
    title: 'Contact Us',
    subtitle: 'Support inquiries, gym partnerships, and community collaborations',
    icon: Phone,
    content: (
      <div className="space-y-4 text-xs leading-relaxed">
        <p className="opacity-85">
          Have questions about crag guides, climbing gym partnerships, or technical feedback? The Jalur team is ready to assist:
        </p>

        <div className="space-y-2.5">
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-lime/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} />
            </div>
            <div>
              <div className="font-bold text-sm">WhatsApp Admin</div>
              <div className="opacity-70 text-[11px]">+62 812-3456-7890 (Chat Support)</div>
            </div>
          </a>

          <a
            href="https://instagram.com/jalur.climb"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-pink-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center flex-shrink-0">
              <Instagram size={18} />
            </div>
            <div>
              <div className="font-bold text-sm">Official Instagram</div>
              <div className="opacity-70 text-[11px]">@jalur.climb</div>
            </div>
          </a>

          <a
            href="mailto:support@jalurclimbing.id"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-lime/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center flex-shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <div className="font-bold text-sm">Email Support</div>
              <div className="opacity-70 text-[11px]">support@jalurclimbing.id</div>
            </div>
          </a>
        </div>
      </div>
    ),
  },

  about: {
    title: 'About Jalur',
    subtitle: 'Integrated digital climbing ecosystem in Indonesia',
    icon: Info,
    content: (
      <div className="space-y-4 text-xs leading-relaxed">
        <div className="text-center py-2">
          <img
            src="/jalur-logo.png"
            alt="Jalur Logo"
            className="h-10 mx-auto object-contain mb-2 mix-blend-multiply dark:mix-blend-screen dark:invert"
          />
          <p className="font-bold text-sm">JALUR · Indonesian Climbing & Bouldering Hub</p>
        </div>

        <p className="opacity-85">
          <b>Jalur</b> was born out of climbing community passion to document natural Indonesian rock areas, provide accurate boulder topographies, and simplify access to modern bouldering gyms nationwide.
        </p>

        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <h5 className="font-bold mb-1">🎯 Our Vision</h5>
            <p className="opacity-80">
              To be the premier digital platform connecting climbers, route setters, gym partners, and outdoor conservationists in an inclusive and sustainable ecosystem.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <h5 className="font-bold mb-1">🏔 Core Features</h5>
            <p className="opacity-80">
              Interactive outdoor crag topographies, GPS coordinates, verified Send Cards with action media, Strava-style ascent logging, and real-time gym booking directories.
            </p>
          </div>
        </div>
      </div>
    ),
  },
}

export default function PolicyModal({ isOpen, activeKey, onClose }: PolicyModalProps) {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'

  if (!isOpen || !activeKey) return null

  const details = POLICY_DETAILS[activeKey]
  if (!details) return null

  const Icon = details.icon

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`relative z-10 w-full max-w-lg rounded-3xl border p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col ${
            isSandstone
              ? 'bg-[#ded3be] border-[#1a1815]/20 text-[#1a1815]'
              : 'bg-[#1a1815] border-white/15 text-chalk'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${
                  isSandstone
                    ? 'border-[#1a1815]/20 bg-[#1a1815]/10 text-[#1a1815]'
                    : 'border-lime/30 bg-lime/10 text-lime'
                }`}
              >
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">{details.title}</h3>
                <p className="text-[11px] opacity-70 font-light">{details.subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isSandstone ? 'hover:bg-[#1a1815]/10 text-[#1a1815]' : 'hover:bg-white/10 text-chalk'
              }`}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto py-4 pr-1 space-y-4 no-scrollbar flex-1">
            {details.content}
          </div>

          {/* Footer Close Button */}
          <div className="pt-3 border-t border-black/10 dark:border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                isSandstone
                  ? 'border-[#1a1815] bg-[#1a1815] text-[#ded3be] hover:opacity-90'
                  : 'border-lime bg-lime text-granite hover:bg-lime-dim'
              }`}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
