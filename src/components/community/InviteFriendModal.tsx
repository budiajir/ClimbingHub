'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Check, Copy, Send } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { sendCommunityInvite } from '@/lib/social-store'

interface InviteFriendModalProps {
  open: boolean
  onClose: () => void
  squadId?: string
  squadName?: string
}

export default function InviteFriendModal({
  open,
  onClose,
  squadId,
  squadName,
}: InviteFriendModalProps) {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'

  const [friendName, setFriendName] = useState('')
  const [friendContact, setFriendContact] = useState('')
  const [invited, setInvited] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const inviteUrl =
    typeof window !== 'undefined'
      ? squadId
        ? `${window.location.origin}/community/${squadId}`
        : `${window.location.origin}/community`
      : squadId
      ? `https://jalur.world/community/${squadId}`
      : 'https://jalur.world/community'

  const inviteMessage = squadName
    ? `Hey! Join our climbing squad "${squadName}" on Jalur: ${inviteUrl}`
    : `Join me in the Jalur Climbing Community — discover crags, gyms & climbing partners: ${inviteUrl}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!friendName.trim()) return
    sendCommunityInvite({
      targetName: friendName,
      targetContact: friendContact || 'WhatsApp / Link Invite',
      squadId,
      squadName,
    })
    setInvited(true)
    setTimeout(() => {
      setInvited(false)
      setFriendName('')
      setFriendContact('')
      onClose()
    }, 1400)
  }

  const handleCopyInviteLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteMessage)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
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
            className={`relative z-10 w-full max-w-md rounded-3xl p-6 shadow-2xl border ${
              isSandstone
                ? 'bg-[#FFFDF9] border-[#E0D6C6] text-[#1a1815]'
                : 'bg-[#23262C] border-white/15 text-white'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 mb-4 border-b ${
                isSandstone ? 'border-[#E0D6C6]' : 'border-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserPlus size={16} className="text-[#FF6B00]" />
                <h3 className="font-bold text-base">
                  {squadName ? `Invite Friend to ${squadName}` : 'Invite Friend to Join'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg ${
                  isSandstone ? 'text-[#7a746c] hover:text-[#1a1815]' : 'text-white/60 hover:text-white'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {invited ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                  <Check size={22} />
                </div>
                <p className="font-bold text-sm">Invitation Recorded!</p>
                <p className={`text-xs ${isSandstone ? 'text-[#524e48]' : 'text-white/65'}`}>
                  Your friend has been sent an invite to join {squadName || 'Jalur Community'}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                    Friend&apos;s Name
                  </label>
                  <input
                    type="text"
                    required
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    placeholder="e.g. Arya Mahendra"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none ${
                      isSandstone
                        ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                        : 'bg-[#1a1d22] border-white/15 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                    Email / Jalur Handle / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={friendContact}
                    onChange={(e) => setFriendContact(e.target.value)}
                    placeholder="e.g. @arya.climbs or +62812..."
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none ${
                      isSandstone
                        ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                        : 'bg-[#1a1d22] border-white/15 text-white'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#E5601F] text-white shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <UserPlus size={14} /> Send Invitation
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-[#25D366]/15 border border-[#25D366]/40 text-[#1DA851] hover:bg-[#25D366]/25 flex items-center justify-center gap-1.5"
                  >
                    <Send size={12} /> WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                      isSandstone
                        ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                        : 'bg-white/5 border-white/15 text-white'
                    }`}
                  >
                    {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                    {copiedLink ? 'Copied!' : 'Copy Invite Link'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
