'use client'

import { useState, useEffect, useMemo } from 'react'
import { Send, MessageSquare, ShieldCheck, Compass, Users } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import {
  getChatContacts,
  getChatMessages,
  sendChatMessage,
  type ChatRoleType,
  type ChatMessage,
} from '@/lib/social-store'

interface CommunityChatPanelProps {
  initialContactId?: string | null
}

const ROLE_FILTERS: { id: 'all' | ChatRoleType; label: string; icon: typeof Users }[] = [
  { id: 'all', label: 'All Chats', icon: MessageSquare },
  { id: 'friend', label: 'Friends', icon: Users },
  { id: 'route_setter', label: 'Route Setters', icon: ShieldCheck },
  { id: 'trip_guide', label: 'Trip Guides', icon: Compass },
]

export default function CommunityChatPanel({ initialContactId }: CommunityChatPanelProps) {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const contacts = useMemo(() => getChatContacts(), [])

  const [roleFilter, setRoleFilter] = useState<'all' | ChatRoleType>('all')
  const [activeId, setActiveId] = useState<string>(initialContactId || contacts[0]?.id || 'climber-1')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (initialContactId) {
      setActiveId(initialContactId)
    }
  }, [initialContactId])

  useEffect(() => {
    const sync = () => setMessages(getChatMessages(activeId))
    sync()
    window.addEventListener('social-chat-updated', sync)
    return () => window.removeEventListener('social-chat-updated', sync)
  }, [activeId])

  const filteredContacts = useMemo(() => {
    if (roleFilter === 'all') return contacts
    return contacts.filter((c) => c.roleType === roleFilter)
  }, [contacts, roleFilter])

  const activeContact = contacts.find((c) => c.id === activeId) || contacts[0]

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || !activeContact) return
    sendChatMessage(activeContact.id, draft)
    setDraft('')
  }

  return (
    <div
      className={`rounded-3xl border overflow-hidden shadow-card grid grid-cols-1 md:grid-cols-12 min-h-[480px] ${
        isSandstone ? 'bg-[#FFFDF9] border-[#E0D6C6]' : 'bg-[#23262C] border-white/10'
      }`}
    >
      {/* Left: Contact Directory */}
      <div
        className={`md:col-span-5 border-b md:border-b-0 md:border-r p-4 space-y-3 ${
          isSandstone ? 'border-[#E0D6C6] bg-[#FAF6EF]' : 'border-white/10 bg-[#1B1E23]'
        }`}
      >
        <div className="flex flex-wrap gap-1.5">
          {ROLE_FILTERS.map((rf) => {
            const Icon = rf.icon
            const active = roleFilter === rf.id
            return (
              <button
                key={rf.id}
                onClick={() => setRoleFilter(rf.id)}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                  active
                    ? 'bg-[#FF6B00] text-white'
                    : isSandstone
                    ? 'bg-white border border-[#E0D6C6] text-[#524e48]'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'
                }`}
              >
                <Icon size={11} /> {rf.label}
              </button>
            )
          })}
        </div>

        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {filteredContacts.map((c) => {
            const selected = c.id === activeContact?.id
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-2.5 rounded-2xl border flex items-center gap-3 transition-all ${
                  selected
                    ? isSandstone
                      ? 'bg-white border-[#FF6B00] shadow-sm'
                      : 'bg-white/10 border-[#FF6B00]/60'
                    : isSandstone
                    ? 'bg-white/60 border-transparent hover:border-[#DDD3C4]'
                    : 'bg-white/[0.03] border-transparent hover:bg-white/[0.06]'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
                      isSandstone ? 'border-white' : 'border-[#1B1E23]'
                    } ${c.online ? 'bg-emerald-500' : 'bg-stone-400'}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-bold truncate ${isSandstone ? 'text-[#1a1815]' : 'text-white'}`}>
                      {c.name}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        c.roleType === 'route_setter'
                          ? 'bg-amber-500/15 text-amber-500'
                          : c.roleType === 'trip_guide'
                          ? 'bg-teal-500/15 text-teal-500'
                          : 'bg-[#FF6B00]/15 text-[#FF6B00]'
                      }`}
                    >
                      {c.roleType === 'route_setter'
                        ? 'Route Setter'
                        : c.roleType === 'trip_guide'
                        ? 'Trip Guide'
                        : 'Friend'}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate ${isSandstone ? 'text-[#524e48]' : 'text-white/60'}`}>
                    {c.roleLabel} · {c.location}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: Active Thread */}
      <div className="md:col-span-7 flex flex-col justify-between">
        {activeContact ? (
          <>
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isSandstone ? 'border-[#E0D6C6]' : 'border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className={`font-bold text-sm ${isSandstone ? 'text-[#1a1815]' : 'text-white'}`}>
                    {activeContact.name}
                  </h4>
                  <p className={`text-[11px] ${isSandstone ? 'text-[#524e48]' : 'text-white/60'}`}>
                    {activeContact.roleLabel} · {activeContact.location}
                  </p>
                </div>
              </div>
              {activeContact.badge && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FF6B00]/15 text-[#FF6B00]">
                  {activeContact.badge}
                </span>
              )}
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[320px]">
              {messages.length === 0 ? (
                <div className="py-12 text-center">
                  <p className={`text-xs ${isSandstone ? 'text-[#7a746c]' : 'text-white/50'}`}>
                    Start messaging {activeContact.name} to plan a session, ask route beta, or coordinate a trip.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender === 'me'
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#FF6B00] text-white rounded-br-sm'
                            : isSandstone
                            ? 'bg-[#F5EFE6] text-[#1a1815] rounded-bl-sm'
                            : 'bg-white/10 text-white rounded-bl-sm'
                        }`}
                      >
                        <p>{msg.text}</p>
                        {msg.shareUrl && (
                          <a
                            href={msg.shareUrl}
                            className={`mt-1.5 inline-block underline font-semibold text-[11px] ${
                              isMe ? 'text-white' : 'text-[#FF6B00]'
                            }`}
                          >
                            {msg.shareUrl}
                          </a>
                        )}
                      </div>
                      <span className={`text-[10px] mt-1 ${isSandstone ? 'text-[#7a746c]' : 'text-white/40'}`}>
                        {msg.timeLabel}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            <form
              onSubmit={handleSend}
              className={`p-3 border-t flex items-center gap-2 ${
                isSandstone ? 'border-[#E0D6C6] bg-[#FAF6EF]' : 'border-white/10 bg-[#1B1E23]'
              }`}
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${activeContact.name}...`}
                className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs border outline-none ${
                  isSandstone
                    ? 'bg-white border-[#DDD3C4] text-[#1a1815]'
                    : 'bg-[#23262C] border-white/15 text-white'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E5601F] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send size={13} /> Send
              </button>
            </form>
          </>
        ) : null}
      </div>
    </div>
  )
}
