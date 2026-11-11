'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Share2, X, Copy, Check, Send, MessageSquare } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { getChatContacts, sendChatMessage } from '@/lib/social-store'

interface ShareLinkModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  shareUrl: string
  shareText?: string
  categoryLabel?: string
}

export default function ShareLinkModal({
  open,
  onClose,
  title,
  subtitle,
  shareUrl,
  shareText,
  categoryLabel = 'Share Link',
}: ShareLinkModalProps) {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const contacts = useMemo(() => getChatContacts(), [])

  const [copiedUrl, setCopiedUrl] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState(contacts[0]?.id || 'climber-1')
  const [sentToName, setSentToName] = useState<string | null>(null)

  const resolvedUrl = useMemo(() => {
    if (shareUrl.startsWith('http://') || shareUrl.startsWith('https://')) {
      return shareUrl
    }
    if (typeof window !== 'undefined') {
      const normalized = shareUrl.startsWith('/') ? shareUrl : `/${shareUrl}`
      return `${window.location.origin}${normalized}`
    }
    return `https://jalur.world${shareUrl.startsWith('/') ? shareUrl : `/${shareUrl}`}`
  }, [shareUrl])

  const defaultMessage = shareText || `Check out ${title} on Jalur: ${resolvedUrl}`

  const handleCopyUrl = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(resolvedUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  const handleDirectChatSend = () => {
    const contact = contacts.find((c) => c.id === selectedContactId) || contacts[0]
    if (!contact) return
    sendChatMessage(contact.id, `Shared: ${title}${shareText ? ` — ${shareText}` : ''}`, resolvedUrl)
    setSentToName(contact.name)
    setTimeout(() => setSentToName(null), 2500)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl border ${
              isSandstone
                ? 'bg-[#FFFDF9] border-[#E0D6C6] text-[#1a1815]'
                : 'bg-[#23262C] border-white/15 text-white'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                isSandstone ? 'border-[#E0D6C6]' : 'border-white/10'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Share2 size={15} className="text-[#FF6B00]" />
                <span className="text-xs uppercase tracking-wider font-bold text-[#FF6B00]">
                  {categoryLabel}
                </span>
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${
                  isSandstone ? 'text-[#7a746c] hover:text-[#1a1815]' : 'text-white/60 hover:text-white'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Info */}
            <div>
              <h3 className={`font-bold text-base ${isSandstone ? 'text-[#1a1815]' : 'text-white'}`}>
                {title}
              </h3>
              {subtitle && (
                <p className={`text-xs mt-0.5 ${isSandstone ? 'text-[#524e48]' : 'text-white/70'}`}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* QR Code */}
            <div className="bg-white p-3.5 rounded-2xl mx-auto inline-block shadow-inner border border-black/5">
              <QRCodeSVG value={resolvedUrl} size={136} />
            </div>

            {/* Actions */}
            <div className="space-y-2.5 text-left">
              {/* Copy URL Link */}
              <button
                onClick={handleCopyUrl}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {copiedUrl ? (
                  <>
                    <Check size={14} /> Link Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy URL Link
                  </>
                )}
              </button>

              {/* Direct Send to Social Media */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(defaultMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-[#25D366]/15 border border-[#25D366]/40 text-[#1DA851] hover:bg-[#25D366]/25 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send size={12} /> WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(resolvedUrl)}&text=${encodeURIComponent(shareText || title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-[#0088cc]/15 border border-[#0088cc]/40 text-[#0088cc] hover:bg-[#0088cc]/25 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send size={12} /> Telegram
                </a>
              </div>

              {/* Direct Send to Jalur Chat */}
              <div
                className={`p-3 rounded-2xl border space-y-2 ${
                  isSandstone ? 'bg-[#F5EFE6] border-[#E0D6C6]' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={12} className="text-[#FF6B00]" />
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isSandstone ? 'text-[#524e48]' : 'text-white/70'
                    }`}
                  >
                    Direct Send to Jalur Chat
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className={`flex-1 min-w-0 px-2.5 py-2 rounded-xl text-xs border outline-none ${
                      isSandstone
                        ? 'bg-white border-[#DDD3C4] text-[#1a1815]'
                        : 'bg-[#1a1d22] border-white/15 text-white'
                    }`}
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.roleLabel})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleDirectChatSend}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                      sentToName
                        ? 'bg-emerald-500 text-white'
                        : isSandstone
                        ? 'bg-[#1a1815] text-white hover:bg-[#FF6B00]'
                        : 'bg-lime text-slate-950 hover:bg-lime/90'
                    }`}
                  >
                    {sentToName ? 'Sent!' : 'Send'}
                  </button>
                </div>
                {sentToName && (
                  <p className="text-[11px] font-medium text-emerald-500">
                    Direct sent to {sentToName} in Community Chat.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
