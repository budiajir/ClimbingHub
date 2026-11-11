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

const PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=900&q=80',
  'https://images.unsplash.com/photo-1516592693881-58b99d046728?w=900&q=80',
  'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=900&q=80',
  'https://images.unsplash.com/photo-1601224748193-d24f166b5c77?w=900&q=80',
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

  const [activity, setActivity] = useState('Session Update')
  const [location, setLocation] = useState(defaultLocation || 'Citatah 125')
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
      timeAgo: 'Just now',
      activity: activity.trim() || 'Community Update',
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
            className={`relative z-10 w-full max-w-lg rounded-3xl p-6 shadow-2xl border max-h-[90vh] overflow-y-auto ${
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
              <div>
                <h3 className="font-bold text-lg">Create Community Post</h3>
                <p className={`text-xs ${isSandstone ? 'text-[#524e48]' : 'text-white/60'}`}>
                  Publishes to Community Wall & auto-syncs to Personal Account Feed.
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg ${
                  isSandstone ? 'text-[#7a746c] hover:text-[#1a1815]' : 'text-white/60 hover:text-white'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                    Post Type
                  </label>
                  <select
                    value={authorType}
                    onChange={(e) => setAuthorType(e.target.value as CommunityAuthorType)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-none ${
                      isSandstone
                        ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                        : 'bg-[#1a1d22] border-white/15 text-white'
                    }`}
                  >
                    <option value="climber">Climber Update</option>
                    <option value="squad">Squad & Club Note</option>
                    <option value="gym">Gym Session / Event</option>
                    <option value="member">Member Beta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                    Activity Tag
                  </label>
                  <input
                    type="text"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="e.g. Flashed Problem, Open Session"
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-none ${
                      isSandstone
                        ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                        : 'bg-[#1a1d22] border-white/15 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                    Location / Crag / Gym
                  </label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF6B00]" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Citatah 125 / Boulder Cave"
                      className={`w-full pl-8 pr-3 py-2.5 rounded-xl text-xs border outline-none ${
                        isSandstone
                          ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                          : 'bg-[#1a1d22] border-white/15 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                    Grade (Optional)
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. V5 / 5.11c"
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-none ${
                      isSandstone
                        ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                        : 'bg-[#1a1d22] border-white/15 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-[#FF6B00]">
                  Caption / Story
                </label>
                <textarea
                  rows={3}
                  required
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share beta, partner callout, crag condition, or session recap..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none resize-none ${
                    isSandstone
                      ? 'bg-[#FAF6EF] border-[#DDD3C4] text-[#1a1815]'
                      : 'bg-[#1a1d22] border-white/15 text-white'
                  }`}
                />
              </div>

              {/* Image URL & Presets */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FF6B00]">
                  Photo Attachment
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
                        : 'bg-[#1a1d22] border-white/15 text-white'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {PRESET_PHOTOS.map((preset, idx) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setImageUrl(preset)}
                      className={`h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        imageUrl === preset ? 'border-[#FF6B00] scale-[1.02]' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Sync Toggle */}
              <label
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer ${
                  isSandstone ? 'bg-[#FAF6EF] border-[#E0D6C6]' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#FF6B00]" />
                  <div>
                    <p className="text-xs font-bold">Auto-post to Personal Account Feed</p>
                    <p className={`text-[11px] ${isSandstone ? 'text-[#524e48]' : 'text-white/60'}`}>
                      Syncs your Community Wall update into your Personal Account Feed
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={syncToPersonalFeed}
                  onChange={(e) => setSyncToPersonalFeed(e.target.checked)}
                  className="accent-[#FF6B00] w-4 h-4"
                />
              </label>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#FF6B00] hover:bg-[#E5601F] text-white shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Send size={14} /> Publish to Community Wall
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
