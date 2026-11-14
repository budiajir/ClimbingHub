'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ImagePlus, MapPin, Send, Sparkles } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'
import {
  addCommunityPost,
  type CommunityAuthorType,
  type CommunityPost,
} from '@/lib/community-posts-store'
import { saveToPersonalFeed } from '@/lib/social-store'

interface CreatePostModalProps {
  open: boolean
  onClose: () => void
  onCreated?: (post: CommunityPost) => void
  defaultLocation?: string
  defaultAuthorType?: CommunityAuthorType
}

// 4 Verified, working high-quality climbing photo presets
const PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=900&q=80',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=900&q=80',
  'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=900&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80',
]

export default function CreatePostModal({
  open,
  onClose,
  onCreated,
  defaultLocation = '',
  defaultAuthorType = 'climber',
}: CreatePostModalProps) {
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'
  const { user } = useAuth()

  const [activity, setActivity] = useState('Sesi Latihan')
  const [location, setLocation] = useState(defaultLocation || 'Tebing Citatah 125')
  const [grade, setGrade] = useState('V5 / 6C')
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0])
  const [authorType, setAuthorType] = useState<CommunityAuthorType>(defaultAuthorType)
  const [syncToPersonalFeed, setSyncToPersonalFeed] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!caption.trim()) return

    const displayName = user?.name || user?.email?.split('@')[0] || 'Jalur Climber'
    const handle = user?.handle || `@${displayName.toLowerCase().replace(/\s+/g, '.')}`
    const now = Date.now()

    const newPost: CommunityPost = {
      id: `post-${now}`,
      userId: user?.id || 'local-user',
      userName: displayName,
      userHandle: handle,
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      hometown: 'Indonesia',
      timeAgo: 'Baru saja',
      activity: activity.trim() || 'Update Komunitas',
      location: location.trim() || 'Indonesia',
      grade: grade.trim() || undefined,
      caption: caption.trim(),
      image: imageUrl.trim() || PRESET_PHOTOS[0],
      likes: 0,
      hasLiked: false,
      authorType,
      comments: [],
    }

    addCommunityPost(newPost)

    if (syncToPersonalFeed) {
      saveToPersonalFeed({
        id: newPost.id,
        userName: newPost.userName,
        activity: newPost.activity,
        location: newPost.location,
        grade: newPost.grade,
        caption: newPost.caption,
        image: newPost.image,
        createdAt: new Date(now).toISOString(),
      })
    }

    onCreated?.(newPost)
    setCaption('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 24 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 w-full max-w-lg rounded-t-[28px] sm:rounded-3xl shadow-2xl border flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden ${
              isSandstone
                ? 'bg-[#FFFDF9] border-[#E0D6C6] text-[#1a1815]'
                : 'bg-[#1b1f24] border-white/15 text-white'
            }`}
          >
            {/* 1. STICKY HEADER: Selalu terlihat & tidak akan terpotong di HP */}
            <div
              className={`shrink-0 flex items-center justify-between px-5 py-4 border-b ${
                isSandstone ? 'border-[#E0D6C6] bg-[#FAF6EF]' : 'border-white/10 bg-[#161a1f]'
              }`}
            >
              <div>
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Buat Postingan Komunitas
                </h3>
                <p className={`text-[11px] sm:text-xs mt-0.5 ${isSandstone ? 'text-[#6b655c]' : 'text-white/60'}`}>
                  Bagikan sesi manjat, info tebing, atau beta ke sesama climber.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isSandstone
                    ? 'bg-black/5 hover:bg-black/10 text-[#1a1815]'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* 2. SCROLLABLE BODY */}
            <form id="create-post-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Row 1: Tipe Post & Label Aktivitas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                    Tipe Postingan
                  </label>
                  <select
                    value={authorType}
                    onChange={(e) => setAuthorType(e.target.value as CommunityAuthorType)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-none font-medium ${
                      isSandstone
                        ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                        : 'bg-[#14161a] border-white/15 text-white'
                    }`}
                  >
                    <option value="climber">🧗 Climber Update (Catatan Pemanjat)</option>
                    <option value="squad">👥 Squad &amp; Klub (Info Komunitas)</option>
                    <option value="gym">🏪 Sesi Gym / Reset Jalur</option>
                    <option value="member">💡 Member Beta / Tips Rute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                    Label Aktivitas
                  </label>
                  <input
                    type="text"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="Contoh: Flashed Problem, Open Crag Day"
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-none font-medium ${
                      isSandstone
                        ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                        : 'bg-[#14161a] border-white/15 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Row 2: Lokasi & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                    Lokasi / Tebing / Gym
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF6B00]" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Contoh: Tebing Citatah 125 / Boulder Cave"
                      className={`w-full pl-8.5 pr-3 py-2.5 rounded-xl text-xs border outline-none font-medium ${
                        isSandstone
                          ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                          : 'bg-[#14161a] border-white/15 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                    Grade Jalur (Opsional)
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Contoh: V5 / 6C atau 5.11a"
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-none font-medium ${
                      isSandstone
                        ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                        : 'bg-[#14161a] border-white/15 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Row 3: Caption / Cerita */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                  Cerita &amp; Beta Jalur *
                </label>
                <textarea
                  rows={3}
                  required
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ceritakan momen manjatmu, kondisi cuaca di tebing, beta gerakan crux, atau ajak partner latihan..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none resize-none leading-relaxed ${
                    isSandstone
                      ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                      : 'bg-[#14161a] border-white/15 text-white'
                  }`}
                />
              </div>

              {/* Row 4: Foto Lampiran */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FF6B00]">
                  Lampirkan Foto (Pilih Foto atau Masukkan URL)
                </label>
                <div className="flex items-center gap-2">
                  <ImagePlus size={16} className="text-[#FF6B00] shrink-0" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none ${
                      isSandstone
                        ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                        : 'bg-[#14161a] border-white/15 text-white'
                    }`}
                  />
                </div>

                {/* 4 Working Preset Photo Thumbnails */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {PRESET_PHOTOS.map((preset, idx) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setImageUrl(preset)}
                      className={`h-14 rounded-xl overflow-hidden border-2 transition-all relative ${
                        imageUrl === preset
                          ? 'border-[#FF6B00] shadow-sm scale-[1.02]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Preset Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = PRESET_PHOTOS[0]
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 5: Auto Sync Toggle */}
              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                  isSandstone
                    ? 'bg-[#FAF6EF] border-[#E0D6C6] hover:bg-[#F5EFE3]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-[#FF6B00]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Posting ke Feed Akun Saya</p>
                    <p className={`text-[10px] mt-0.5 ${isSandstone ? 'text-[#6b655c]' : 'text-white/60'}`}>
                      Sinkronkan kiriman ini ke profil &amp; portofolio manjat Anda
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={syncToPersonalFeed}
                  onChange={(e) => setSyncToPersonalFeed(e.target.checked)}
                  className="accent-[#FF6B00] w-4 h-4 cursor-pointer"
                />
              </label>
            </form>

            {/* 3. STICKY FOOTER: Tombol submit selalu terlihat di HP */}
            <div
              className={`shrink-0 p-4 sm:px-5 border-t ${
                isSandstone ? 'border-[#E0D6C6] bg-[#FAF6EF]' : 'border-white/10 bg-[#161a1f]'
              }`}
              style={{
                paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
              }}
            >
              <button
                type="submit"
                form="create-post-form"
                className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#FF6B00] hover:bg-[#E5601F] text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Send size={14} />
                <span>Publikasikan ke Komunitas</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
