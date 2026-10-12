'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Users, MapPin, DollarSign, CheckCircle2, Compass, UserPlus, Sparkles, Check, ArrowRight } from 'lucide-react'
import { CragRegion } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'
import { addWalletOrder } from '@/lib/wallet-store'

interface OpenTripModalProps {
  isOpen: boolean
  crag: CragRegion | null
  onClose: () => void
}

interface CommunityTrip {
  id: string
  title: string
  organizer: string
  organizerAvatar: string
  organizerRole: string
  date: string
  meetingPoint: string
  quotaTotal: number
  quotaJoined: number
  cost: number
  level: string
  notes: string
}

const SAMPLE_COMMUNITY_TRIPS: CommunityTrip[] = [
  {
    id: 'ct-1',
    title: 'Weekend Bouldering & Outdoor Send Session',
    organizer: 'Dimas Anggara',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    organizerRole: 'Boulder Enthusiast (V6 Setter)',
    date: 'Saturday, 25 April 2026',
    meetingPoint: 'Basecamp Utama 07:30 WIB',
    quotaTotal: 6,
    quotaJoined: 4,
    cost: 75000,
    level: 'Intermediate (V3 - V5)',
    notes: 'Bawa crashpad cadangan jika punya, shared carpool dari Bandung kota.',
  },
  {
    id: 'ct-2',
    title: 'Beginner Sport Climbing & Belay Clinic',
    organizer: 'Sarah Amalia',
    organizerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    organizerRole: 'FPTI Certified Guide',
    date: 'Sunday, 26 April 2026',
    meetingPoint: 'Parkiran Tebing 08:00 WIB',
    quotaTotal: 8,
    quotaJoined: 5,
    cost: 110000,
    level: 'All Levels (Beginner Friendly)',
    notes: 'Termasuk guide belay, briefing safety, dan sharing rope.',
  },
  {
    id: 'ct-3',
    title: 'Sunset Top-Rope & Photo Shoot Session',
    organizer: 'Budi Prasetyo',
    organizerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    organizerRole: 'Outdoor Photographer',
    date: 'Friday, 1 May 2026',
    meetingPoint: 'Warung Puncak Tebing 15:00 WIB',
    quotaTotal: 5,
    quotaJoined: 2,
    cost: 60000,
    level: 'All Levels',
    notes: 'Sesi santai sore + foto hi-res untuk portfolio sent card.',
  },
]

const AVAILABLE_FRIENDS = [
  { id: 'f-1', name: 'Dimas Anggara', handle: '@dimas_climb', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { id: 'f-2', name: 'Sarah Amalia', handle: '@sarah.crag', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { id: 'f-3', name: 'Budi Prasetyo', handle: '@budipras', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { id: 'f-4', name: 'Rian Kurniawan', handle: '@rian_rocks', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
  { id: 'f-5', name: 'Eka Pratama', handle: '@ekapratama', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
]

export default function OpenTripModal({ isOpen, crag, onClose }: OpenTripModalProps) {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')

  // Form state
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [quota, setQuota] = useState('6')
  const [meetingPoint, setMeetingPoint] = useState('')
  const [cost, setCost] = useState('75000')
  const [targetLevel, setTargetLevel] = useState('All Levels (Beginner Friendly)')
  const [notes, setNotes] = useState('')
  const [coordinator, setCoordinator] = useState(user?.name || 'Climber Organizer')
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen || !crag) return null

  const toggleFriend = (id: string) => {
    setSelectedFriends(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const bookingCode = `TP-${Math.floor(1000 + Math.random() * 9000)}`
    const tripTitle = title || `Open Trip — ${crag.name}`

    // Add to wallet store (Notifikasi trip plan masuk ke halaman Personal Account)
    addWalletOrder({
      id: `ord-trip-${Date.now()}`,
      type: 'trip',
      status: 'active',
      title: tripTitle,
      categoryLabel: 'Trip Plan (Organizer)',
      venueOrLocation: `${crag.name} • ${meetingPoint || 'Basecamp'}`,
      bookingCode,
      qrData: `CH-TRIP-${bookingCode}-${crag.id}`,
      date: date || 'Upcoming Weekend',
      totalPrice: Number(cost) || 0,
      quantity: 1,
      details: {
        meetingPoint: meetingPoint || 'Basecamp Utama',
        coordinator: coordinator || user?.name || 'You',
        quota: `${quota} Climbers`,
        targetLevel,
        invitedFriendsCount: selectedFriends.length,
        notes,
      },
      createdAt: new Date().toISOString(),
      expiryDate: date,
    })

    setSuccessMessage(`Open Trip "${tripTitle}" berhasil dipublikasikan! Notifikasi & detail trip otomatis disimpan ke Order Wallet Anda di Personal Account.`)
    setTimeout(() => {
      setSuccessMessage(null)
      onClose()
    }, 2200)
  }

  const handleJoinTrip = (trip: CommunityTrip) => {
    const bookingCode = `TJ-${Math.floor(1000 + Math.random() * 9000)}`

    // Add to wallet store as participant
    addWalletOrder({
      id: `ord-trip-join-${Date.now()}`,
      type: 'trip',
      status: 'active',
      title: `${trip.title} (Joined)`,
      categoryLabel: 'Trip Plan (Participant)',
      venueOrLocation: `${crag.name} • ${trip.meetingPoint}`,
      bookingCode,
      qrData: `CH-JOIN-${bookingCode}-${trip.id}`,
      date: trip.date,
      totalPrice: trip.cost,
      quantity: 1,
      details: {
        organizer: trip.organizer,
        meetingPoint: trip.meetingPoint,
        targetLevel: trip.level,
        status: 'Confirmed Member',
      },
      createdAt: new Date().toISOString(),
      expiryDate: trip.date,
    })

    setSuccessMessage(`Berhasil bergabung ke open trip bersama ${trip.organizer}! Tiket dan bukti trip otomatis tersimpan di Order Wallet Personal Account.`)
    setTimeout(() => {
      setSuccessMessage(null)
      onClose()
    }, 2200)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window: Pop Up Form Purple Theme */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar popup-form-purple"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom) + 16px, 24px)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00]">
                <Compass size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight text-white">Open Trip Portal</h3>
                <p className="text-xs text-purple-200/80">{crag.name}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Switcher: Buat Open Trip vs Join Trip */}
          <div className="flex items-center gap-2 p-1 bg-black/40 border border-purple-500/20 rounded-2xl my-4">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'create'
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              Buat Open Trip
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'join'
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <span>Join Trip</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          {successMessage ? (
            <div className="py-12 text-center space-y-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 size={32} />
              </motion.div>
              <h4 className="font-bold text-base text-white">Sukses!</h4>
              <p className="text-xs text-purple-200 max-w-sm mx-auto leading-relaxed">
                {successMessage}
              </p>
            </div>
          ) : activeTab === 'join' ? (
            /* Tab: Join Trip (Lihat siapa yg lagi punya rencana trip & bisa gabung) */
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-200">Rencana Trip Terjadwal di {crag.name}</span>
                <span className="text-[11px] text-purple-300 font-medium">{SAMPLE_COMMUNITY_TRIPS.length} Trip Tersedia</span>
              </div>

              <div className="space-y-3">
                {SAMPLE_COMMUNITY_TRIPS.map((trip) => {
                  const slotsLeft = trip.quotaTotal - trip.quotaJoined
                  return (
                    <div
                      key={trip.id}
                      className="p-4 rounded-2xl bg-white/5 border border-purple-500/20 hover:border-purple-400/40 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={trip.organizerAvatar}
                            alt={trip.organizer}
                            className="w-10 h-10 rounded-full object-cover border border-purple-400/40"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-white leading-tight">{trip.title}</h4>
                            <p className="text-[11px] text-purple-200">
                              By <span className="font-semibold text-white">{trip.organizer}</span> • {trip.organizerRole}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            Sisa {slotsLeft} Slot
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-200 bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#FF6B00]" />
                          <span>{trip.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#FF6B00]" />
                          <span className="truncate">{trip.meetingPoint}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users size={13} className="text-[#FF6B00]" />
                          <span>Target: {trip.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={13} className="text-[#FF6B00]" />
                          <span className="font-semibold text-white">Rp {trip.cost.toLocaleString('id-ID')} /org</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-purple-200/90 italic">
                        "{trip.notes}"
                      </p>

                      <button
                        type="button"
                        onClick={() => handleJoinTrip(trip)}
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#FF6B00] hover:bg-[#E56000] text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                      >
                        <span>Gabung Trip Ini</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Tab: Buat Open Trip */
            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1 text-xs">
              {/* Trip Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Judul Open Trip
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Weekend Bouldering & Outdoor Session di Citatah"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-purple-500/25 text-white placeholder:text-purple-300/40 focus:border-[#FF6B00] outline-none transition-all"
                />
              </div>

              {/* Date & Quota */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                    Tanggal Trip
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-purple-500/25 text-white focus:border-[#FF6B00] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                    Kuota Climber
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    required
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-purple-500/25 text-white focus:border-[#FF6B00] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Meeting Point & Shared Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                    Titik Kumpul (Meeting Point)
                  </label>
                  <input
                    type="text"
                    required
                    value={meetingPoint}
                    onChange={(e) => setMeetingPoint(e.target.value)}
                    placeholder="Contoh: Pawon Basecamp 07:30 WIB"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-purple-500/25 text-white placeholder:text-purple-300/40 focus:border-[#FF6B00] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                    Estimasi Shared Cost (IDR)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="Biaya per orang"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-purple-500/25 text-white placeholder:text-purple-300/40 focus:border-[#FF6B00] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Level Target */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Rekomendasi Level Panjat
                </label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#4F1D49] border border-purple-500/25 text-white focus:border-[#FF6B00] outline-none transition-all"
                >
                  <option value="All Levels (Beginner Friendly)">All Levels (Beginner Friendly)</option>
                  <option value="Intermediate (V3 - V5 / 6a - 6c)">Intermediate (V3 - V5 / 6a - 6c)</option>
                  <option value="Advanced (V6+ / 7a+)">Advanced (V6+ / 7a+)</option>
                  <option value="Lead / Sport Climbing Only">Lead / Sport Climbing Only</option>
                </select>
              </div>

              {/* Coordinator Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Koordinator / Organizer Trip
                </label>
                <input
                  type="text"
                  required
                  value={coordinator}
                  onChange={(e) => setCoordinator(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-purple-500/25 text-white focus:border-[#FF6B00] outline-none transition-all"
                />
              </div>

              {/* Invite Friends Feature */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200">
                    Invite Friends (Undang Teman Panjat)
                  </label>
                  <span className="text-[10px] text-purple-300">
                    {selectedFriends.length} teman dipilih
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-black/20 p-2.5 rounded-xl border border-purple-500/20 max-h-36 overflow-y-auto no-scrollbar">
                  {AVAILABLE_FRIENDS.map((friend) => {
                    const isSelected = selectedFriends.includes(friend.id)
                    return (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => toggleFriend(friend.id)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-[#FF6B00]/20 border-[#FF6B00] text-white'
                            : 'bg-white/5 border-white/5 text-purple-200 hover:border-purple-400/40'
                        }`}
                      >
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="truncate min-w-0 flex-1">
                          <p className="text-[11px] font-semibold truncate leading-tight">{friend.name}</p>
                          <p className="text-[9px] text-purple-300 truncate">{friend.handle}</p>
                        </div>
                        {isSelected && <Check size={12} className="text-[#FF6B00] shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-1">
                  Catatan Tambahan & Perlengkapan yg Perlu Dibawa
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Bawa crashpad pribadi, sepatu cadangan, air minum minimal 2L..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-purple-500/25 text-white placeholder:text-purple-300/40 focus:border-[#FF6B00] outline-none text-xs resize-none transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs bg-[#FF6B00] hover:bg-[#E56000] text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Compass size={16} />
                <span>Publikasikan Open Trip</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
