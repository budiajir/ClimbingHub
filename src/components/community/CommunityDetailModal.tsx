"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Users,
  Instagram,
  Camera,
  UserPlus,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Community } from "@/lib/mock-data";
import { useTheme } from "@/lib/theme-context";
import {
  getCommunityPhotos,
  getCommunityJoinStatus,
  cancelCommunityJoinRequest,
  CommunityPhoto,
} from "@/lib/community-store";

interface CommunityDetailModalProps {
  isOpen: boolean;
  community: Community | null;
  onClose: () => void;
  onRequestJoin: (community: Community) => void;
  onUploadPhoto: (community: Community) => void;
}

export default function CommunityDetailModal({
  isOpen,
  community,
  onClose,
  onRequestJoin,
  onUploadPhoto,
}: CommunityDetailModalProps) {
  const { theme } = useTheme();
  const isSandstone = theme === "sandstone";

  const [activeTab, setActiveTab] = useState<"photos" | "members">("photos");
  const [photos, setPhotos] = useState<CommunityPhoto[]>([]);
  const [joinStatus, setJoinStatus] = useState<"none" | "pending" | "approved">("none");
  const [selectedLightboxPhoto, setSelectedLightboxPhoto] = useState<CommunityPhoto | null>(null);

  const loadData = () => {
    if (!community) return;
    setPhotos(getCommunityPhotos(community.id));
    setJoinStatus(getCommunityJoinStatus(community.id));
  };

  useEffect(() => {
    if (community && isOpen) {
      loadData();
    }
  }, [community, isOpen]);

  useEffect(() => {
    const handlePhotoUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.communityId === community?.id) {
        if (community) setPhotos(getCommunityPhotos(community.id));
      }
    };
    const handleRequestUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.communityId === community?.id) {
        if (community) setJoinStatus(getCommunityJoinStatus(community.id));
      }
    };

    window.addEventListener("community-photo-updated", handlePhotoUpdate);
    window.addEventListener("community-request-updated", handleRequestUpdate);
    return () => {
      window.removeEventListener("community-photo-updated", handlePhotoUpdate);
      window.removeEventListener("community-request-updated", handleRequestUpdate);
    };
  }, [community]);

  if (!isOpen || !community) return null;

  const handleCancelRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Batalkan pengajuan request bergabung ke " + community.name + "?")) {
      cancelCommunityJoinRequest(community.id);
      setJoinStatus("none");
    }
  };

  const igUsername = community.instagram.replace(/\/$/, "").split("/").pop() || community.name.toLowerCase().replace(/\s+/g, "");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`relative z-10 w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isSandstone
              ? "bg-[#ded3be] border-[#1a1815]/20 text-[#1a1815]"
              : "bg-[#161a1e] border-white/15 text-chalk"
          }`}
        >
          {/* Cover Header */}
          <div className="relative h-44 sm:h-52 w-full bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${community.image})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/75 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header info badge overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-10 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-lime">
                    Official Squad
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-light bg-black/60 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-md text-white/90">
                    <MapPin size={11} /> {community.city}, {community.province}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                  {community.name}
                </h2>
              </div>

              {/* Member count pill */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-white text-xs font-semibold">
                  <Users size={13} className="text-cyan-climb" />
                  <span>{community.memberCount} Climbers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar (Request to Join + Instagram Only) */}
          <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
            isSandstone ? "border-[#1a1815]/15 bg-black/5" : "border-white/10 bg-white/5"
          }`}>
            {/* Social Media: Instagram ONLY */}
            <a
              href={community.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all touch-ripple ${
                isSandstone
                  ? "border-[#1a1815]/20 hover:border-[#1a1815]/60 bg-transparent text-[#1a1815]"
                  : "border-white/15 hover:border-white/40 bg-transparent text-chalk"
              }`}
            >
              <Instagram size={16} className="text-[#E1306C]" />
              <span>@{igUsername}</span>
            </a>

            {/* In-app Join Status / Request Button */}
            <div className="flex items-center gap-2">
              {joinStatus === "pending" ? (
                <div className="flex items-center gap-2">
                  <div className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                    isSandstone
                      ? "bg-amber-100 border-amber-300 text-amber-900"
                      : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                  }`}>
                    <Clock size={15} />
                    <span>Menunggu Konfirmasi</span>
                  </div>
                  <button
                    onClick={handleCancelRequest}
                    title="Batalkan permohonan"
                    className={`px-2.5 py-2 rounded-xl text-[11px] border opacity-70 hover:opacity-100 transition-opacity ${
                      isSandstone ? "border-[#1a1815]/20 text-[#1a1815]" : "border-white/20 text-chalk"
                    }`}
                  >
                    Batal
                  </button>
                </div>
              ) : joinStatus === "approved" ? (
                <div className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                  isSandstone
                    ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                    : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                }`}>
                  <CheckCircle2 size={15} />
                  <span>Member Squad</span>
                </div>
              ) : (
                <button
                  onClick={() => onRequestJoin(community)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all touch-ripple ${
                    isSandstone
                      ? "bg-[#1a1815] text-[#ded3be] hover:opacity-90 border border-[#1a1815]"
                      : "bg-lime text-granite hover:bg-lime-dim shadow-lime-glow-sm"
                  }`}
                >
                  <UserPlus size={15} />
                  <span>Request to Join</span>
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="px-5 pt-3.5 pb-2">
            <p className={`text-xs sm:text-sm font-light leading-relaxed ${
              isSandstone ? "text-[#1a1815]/80" : "text-slate-ash"
            }`}>
              {community.description}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className={`px-5 flex items-center justify-between border-b ${
            isSandstone ? "border-[#1a1815]/15" : "border-white/10"
          }`}>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("photos")}
                className={`py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                  activeTab === "photos"
                    ? isSandstone
                      ? "border-[#1a1815] text-[#1a1815]"
                      : "border-lime text-lime"
                    : isSandstone
                    ? "border-transparent text-[#1a1815]/60 hover:text-[#1a1815]"
                    : "border-transparent text-slate-ash hover:text-chalk"
                }`}
              >
                <Camera size={14} />
                <span>Foto Kegiatan ({photos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("members")}
                className={`py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                  activeTab === "members"
                    ? isSandstone
                      ? "border-[#1a1815] text-[#1a1815]"
                      : "border-lime text-lime"
                    : isSandstone
                    ? "border-transparent text-[#1a1815]/60 hover:text-[#1a1815]"
                    : "border-transparent text-slate-ash hover:text-chalk"
                }`}
              >
                <Users size={14} />
                <span>Anggota ({community.members.length})</span>
              </button>
            </div>

            {/* Upload Photo Button (triggers modal) */}
            {activeTab === "photos" && (
              <button
                onClick={() => onUploadPhoto(community)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all touch-ripple ${
                  isSandstone
                    ? "border-[#1a1815] bg-[#1a1815] text-[#ded3be] hover:opacity-90"
                    : "border-lime bg-lime/10 text-lime hover:bg-lime/20"
                }`}
              >
                <Camera size={13} />
                <span>+ Upload Foto</span>
              </button>
            )}
          </div>

          {/* Tab Contents: Scrollable */}
          <div
            className="p-5 overflow-y-auto no-scrollbar flex-1 space-y-4"
            style={{
              paddingBottom: "max(env(safe-area-inset-bottom) + 16px, 24px)",
            }}
          >
            {activeTab === "photos" ? (
              <div>
                {photos.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto ${
                      isSandstone ? "border-[#1a1815]/20 bg-black/5 text-[#1a1815]" : "border-white/15 bg-white/5 text-slate-ash"
                    }`}>
                      <Camera size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Belum Ada Foto Kegiatan</h4>
                      <p className="text-xs opacity-70 mt-1 max-w-sm mx-auto">
                        Jadilah yang pertama mengunggah momen bouldering atau crag trip bersama squad ini!
                      </p>
                    </div>
                    <button
                      onClick={() => onUploadPhoto(community)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                        isSandstone ? "bg-[#1a1815] text-[#ded3be]" : "bg-lime text-granite"
                      }`}
                    >
                      <Camera size={14} /> Upload Foto Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedLightboxPhoto(p)}
                        className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all flex flex-col justify-between ${
                          isSandstone
                            ? "bg-[#f4efe6] border-[#1a1815]/15 hover:border-[#1a1815]/40"
                            : "bg-[#20252b] border-white/10 hover:border-lime/40"
                        }`}
                      >
                        <div className="aspect-square w-full bg-cover bg-center relative overflow-hidden">
                          <img
                            src={p.url}
                            alt={p.caption}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                            <span className="text-[11px] text-white font-medium line-clamp-2 leading-tight">
                              {p.caption}
                            </span>
                          </div>
                        </div>

                        {/* Card metadata footer */}
                        <div className="p-2.5 flex items-center justify-between gap-1 text-[11px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {p.uploaderAvatar ? (
                              <img
                                src={p.uploaderAvatar}
                                alt={p.uploaderName}
                                className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-slate-500/20 flex-shrink-0" />
                            )}
                            <span className="truncate font-semibold opacity-85 text-[10px]">
                              {p.uploaderName}
                            </span>
                          </div>
                          <span className="opacity-55 text-[9px] flex-shrink-0">
                            {p.createdAt}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Members Tab */
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {community.members.map((member) => (
                    <div
                      key={member.name}
                      className={`p-3 rounded-2xl border flex items-center gap-3 ${
                        isSandstone
                          ? "bg-[#f4efe6] border-[#1a1815]/15"
                          : "bg-[#20252b] border-white/10"
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full bg-cover bg-center border border-black/10 dark:border-white/10 flex-shrink-0"
                        style={{ backgroundImage: `url(${member.avatar})` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate">{member.name}</div>
                        <div className={`text-[11px] font-light ${
                          isSandstone ? "text-[#1a1815]/70" : "text-slate-ash"
                        }`}>
                          {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Lightbox for Full Photo View */}
        {selectedLightboxPhoto && (
          <AnimatePresence>
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLightboxPhoto(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-lg"
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 max-w-3xl w-full rounded-3xl overflow-hidden bg-black/95 border border-white/20 text-white shadow-2xl flex flex-col max-h-[92vh]"
              >
                <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[65vh]">
                  <img
                    src={selectedLightboxPhoto.url}
                    alt={selectedLightboxPhoto.caption}
                    className="max-h-[65vh] w-auto max-w-full object-contain mx-auto"
                  />
                  <button
                    onClick={() => setSelectedLightboxPhoto(null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white border border-white/20 flex items-center justify-center hover:bg-black/90"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-4 sm:p-5 border-t border-white/10 space-y-2 bg-[#121518]">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {selectedLightboxPhoto.uploaderAvatar && (
                        <img
                          src={selectedLightboxPhoto.uploaderAvatar}
                          alt={selectedLightboxPhoto.uploaderName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span className="font-bold">{selectedLightboxPhoto.uploaderName}</span>
                    </div>
                    <span className="opacity-60 text-[11px]">{selectedLightboxPhoto.createdAt}</span>
                  </div>

                  <p className="text-xs sm:text-sm font-light text-chalk leading-relaxed">
                    {selectedLightboxPhoto.caption}
                  </p>
                </div>
              </motion.div>
            </div>
          </AnimatePresence>
        )}
      </div>
    </AnimatePresence>
  );
}
