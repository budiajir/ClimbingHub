'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  MapPin,
  Users,
  Instagram,
  Camera,
  UserPlus,
  CheckCircle2,
  Clock,
  Lock,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import { useCommunities } from '@/lib/use-data'
import { useTheme } from '@/lib/theme-context'
import {
  getCommunityPhotos,
  getCommunityJoinStatus,
  cancelCommunityJoinRequest,
  CommunityPhoto,
} from '@/lib/community-store'
import RequestToJoinModal from '@/components/community/RequestToJoinModal'
import UploadCommunityPhotoModal from '@/components/community/UploadCommunityPhotoModal'

export default function CommunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { communities, loading } = useCommunities()
  const { theme } = useTheme()
  const isSandstone = theme === 'sandstone'

  const rawId = params?.id
  const paramId = (typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '') || ''
  const community = communities.find(c => String(c.id).toLowerCase() === paramId.toLowerCase())

  const [activeTab, setActiveTab] = useState<'photos' | 'members'>('photos')
  const [photos, setPhotos] = useState<CommunityPhoto[]>([])
  const [joinStatus, setJoinStatus] = useState<'none' | 'pending' | 'approved'>('none')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState<CommunityPhoto | null>(null)
  const [uploadWarning, setUploadWarning] = useState<string | null>(null)

  const loadData = () => {
    if (!community) return
    setPhotos(getCommunityPhotos(community.id))
    setJoinStatus(getCommunityJoinStatus(community.id))
  }

  useEffect(() => {
    if (community) {
      loadData()
    }
  }, [community])

  useEffect(() => {
    const handlePhotoUpdate = () => {
      if (community) setPhotos(getCommunityPhotos(community.id))
    }
    const handleRequestUpdate = () => {
      if (community) setJoinStatus(getCommunityJoinStatus(community.id))
    }

    window.addEventListener('community-photo-updated', handlePhotoUpdate)
    window.addEventListener('community-request-updated', handleRequestUpdate)
    return () => {
      window.removeEventListener('community-photo-updated', handlePhotoUpdate)
      window.removeEventListener('community-request-updated', handleRequestUpdate)
    }
  }, [community])

  if (loading && !community) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-ash text-sm font-light">Loading community...</p>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold">Community Not Found</h2>
        <p className="text-xs opacity-75 font-light">
          The squad or climbing club ({paramId}) could not be found.
        </p>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white transition-all shadow-md"
        >
          Back to Communities
        </Link>
      </div>
    )
  }

  const handleUploadClick = () => {
    // Only approved members can upload posts to the community
    if (joinStatus !== 'approved') {
      setUploadWarning('Upload postingan hanya dapat dilakukan oleh member resmi komunitas ini. Silakan kirim request join terlebih dahulu.')
      setTimeout(() => setUploadWarning(null), 5000)
      return
    }
    setShowUploadModal(true)
  }

  const igUsername = community.instagram.replace(/\/$/, '').split('/').pop() || community.name.toLowerCase().replace(/\s+/g, '')

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-16 pt-2 space-y-6">
      {/* 1-Step Back Navigation Header */}
      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-black/10 dark:border-white/10">
        <Link
          href="/community"
          className={`flex items-center gap-1.5 py-1 -ml-1 group text-left transition-opacity hover:opacity-75 active:opacity-60 min-w-0 ${
            isSandstone ? 'text-[#1a1815]' : 'text-chalk'
          }`}
        >
          <ChevronLeft size={20} className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm sm:text-base font-light tracking-wide truncate">
            Community Directory
          </span>
        </Link>
      </div>

      {/* Hero Banner with Community Info */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-xl bg-[#161a1e]">
        <div
          className="h-56 sm:h-72 md:h-80 w-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${community.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#161a1e] via-[#161a1e]/60 to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/70 border border-white/20 backdrop-blur-md text-[#FF6B00]">
              Official Community
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-7 md:p-8 relative -mt-16 sm:-mt-20 z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
                <MapPin size={13} className="text-[#FF6B00]" />
                <span>{community.city}, {community.province}</span>
                <span>·</span>
                <Users size={13} className="text-[#FF6B00]" />
                <span>{community.memberCount} Active Members</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                {community.name}
              </h1>
              <p className="text-sm opacity-80 max-w-2xl font-light mt-2 leading-relaxed">
                {community.description}
              </p>
            </div>

            {/* Action buttons: Join Community & Upload Post */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {joinStatus === 'approved' ? (
                <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 size={16} /> Member Resmi
                </div>
              ) : joinStatus === 'pending' ? (
                <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  <Clock size={16} /> Join Pending Approval
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <UserPlus size={16} /> Request to Join
                </button>
              )}

              <button
                type="button"
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#FF6B00]/40 text-[#FF6B00] hover:bg-[#FF6B00]/10 text-xs font-bold transition-all cursor-pointer"
              >
                <Camera size={16} /> Upload Post
              </button>

              <a
                href={community.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-chalk transition-all"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Warning banner when non-member tries to upload */}
          {uploadWarning && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <Lock size={16} className="shrink-0 text-amber-400" />
                <span>{uploadWarning}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowJoinModal(true)}
                className="px-3 py-1 bg-amber-500 text-black font-bold rounded-lg text-[11px] shrink-0"
              >
                Join Now
              </button>
            </motion.div>
          )}

          {/* Navigation Tabs: Community Gallery / Posts vs Members List */}
          <div className="flex items-center gap-2 border-b border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'photos'
                  ? 'border-[#FF6B00] text-[#FF6B00]'
                  : 'border-transparent opacity-60 hover:opacity-100 text-chalk'
              }`}
            >
              <Camera size={14} /> Gallery & Community Posts ({photos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'members'
                  ? 'border-[#FF6B00] text-[#FF6B00]'
                  : 'border-transparent opacity-60 hover:opacity-100 text-chalk'
              }`}
            >
              <Users size={14} /> Members Directory ({community.memberCount})
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'photos' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">Community Photo Feed</h3>
            <span className="text-xs opacity-60">Verified member uploads</span>
          </div>

          {photos.length === 0 ? (
            <div className="p-12 text-center border border-white/10 rounded-3xl bg-[#1a1f24] space-y-3">
              <Camera size={40} className="mx-auto opacity-30 text-[#FF6B00]" />
              <div className="font-bold text-base text-chalk">Belum ada postingan foto</div>
              <p className="text-xs opacity-60 max-w-sm mx-auto">
                Member komunitas dapat mengunggah foto sesi bouldering, crag trip, dan momen kebersamaan.
              </p>
              {joinStatus === 'approved' && (
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-[#FF6B00] text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Unggah Foto Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedLightboxPhoto(p)}
                  className="rounded-2xl overflow-hidden border border-white/10 bg-[#1a1f24] cursor-pointer group hover:border-[#FF6B00]/40 transition-all shadow-sm"
                >
                  <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-black/40">
                    <img
                      src={p.url}
                      alt={p.caption || 'Community post'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {p.caption || 'Community capture'}
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-[11px] opacity-75">
                    <span className="font-bold text-chalk truncate">{p.uploaderName}</span>
                    <span className="font-mono text-[10px] opacity-60">{p.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Members Directory Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">Squad Members</h3>
            <span className="text-xs opacity-60">Connected climbers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => {
              const names = ['Budi Prasetyo', 'Sarah Amalia', 'Dimas Anggara', 'Rani Wijaya', 'Guntur Putra', 'Nadia Safitri']
              const grades = ['V7 / 7b', 'V5 / 6c', 'V8 / 7c', 'V4 / 6b', 'V6 / 7a', 'V5 / 6c']
              const cities = ['Bandung', 'Jakarta', 'Yogyakarta', 'Surabaya', 'Malang', 'Bali']
              const name = names[i]
              const grade = grades[i]
              const city = cities[i]
              const userId = `climber-${i + 1}`

              return (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl border border-white/10 bg-[#1a1f24] flex items-center justify-between gap-3 hover:border-[#FF6B00]/40 transition-all"
                >
                  <Link
                    href={`/account?user=${userId}`}
                    className="flex items-center gap-3 min-w-0 flex-1 group"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-black/40 border border-white/20 shrink-0">
                      <img
                        src={`https://images.unsplash.com/photo-${1534528741775 + i * 200}-53994a69daeb?auto=format&fit=crop&w=150&q=80`}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-chalk group-hover:text-[#FF6B00] transition-colors truncate">
                        {name}
                      </div>
                      <div className="text-[11px] opacity-60 font-light truncate">
                        {city} · Grade {grade}
                      </div>
                    </div>
                  </Link>

                  <Link
                    href={`/account?user=${userId}`}
                    className="px-3 py-1.5 rounded-xl border border-white/10 text-chalk hover:border-[#FF6B00] hover:text-[#FF6B00] text-xs font-bold transition-all shrink-0"
                  >
                    Profile
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedLightboxPhoto && (
        <div
          onClick={() => setSelectedLightboxPhoto(null)}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl w-full bg-[#161a1e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <img src={selectedLightboxPhoto.url} alt="Photo" className="w-full max-h-[70vh] object-contain bg-black" />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{selectedLightboxPhoto.caption || 'Community capture'}</p>
                <p className="text-xs opacity-60">Uploaded by {selectedLightboxPhoto.uploaderName} · {selectedLightboxPhoto.createdAt}</p>
              </div>
              <button
                onClick={() => setSelectedLightboxPhoto(null)}
                className="px-3 py-1.5 bg-white/10 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Request Modal */}
      <RequestToJoinModal
        isOpen={showJoinModal}
        community={community}
        onClose={() => setShowJoinModal(false)}
        onSuccess={() => {
          setShowJoinModal(false)
          loadData()
        }}
      />

      {/* Upload Post Modal */}
      <UploadCommunityPhotoModal
        isOpen={showUploadModal}
        community={community}
        onClose={() => setShowUploadModal(false)}
        onPhotoUploaded={() => {
          setShowUploadModal(false)
          loadData()
        }}
      />
    </div>
  )
}
