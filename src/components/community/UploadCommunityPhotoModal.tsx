"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Community } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { saveCommunityPhoto } from "@/lib/community-store";
import { uploadMediaToCloudinary } from "@/lib/upload-client";
import { saveCommunityPhotoAction } from "@/lib/actions/media";

interface UploadCommunityPhotoModalProps {
  isOpen: boolean;
  community: Community | null;
  onClose: () => void;
  onPhotoUploaded: () => void;
}

export default function UploadCommunityPhotoModal({
  isOpen,
  community,
  onClose,
  onPhotoUploaded,
}: UploadCommunityPhotoModalProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isSandstone = theme === "sandstone";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [uploaderName, setUploaderName] = useState(user?.name || "Climber");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedSuccess, setUploadedSuccess] = useState(false);

  if (!isOpen || !community) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploadingFile(true);
    try {
      const uploaded = await uploadMediaToCloudinary(file, "jalur/community");
      setPhotoUrl(uploaded.secureUrl);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Gagal mengunggah foto ke Cloudinary."
      );
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || isUploadingFile) return;

    setUploadError(null);
    setIsSubmitting(true);

    try {
      const resolvedCaption = caption.trim() || "Climbing session with " + community.name;
      const resolvedUploader = uploaderName.trim() || user?.name || "Climber";
      const resolvedAvatar = user?.avatar || "https://i.pravatar.cc/60?img=8";

      const res = await saveCommunityPhotoAction({
        communityId: community.id,
        imageUrl: photoUrl,
        caption: resolvedCaption,
        uploaderName: resolvedUploader,
        uploaderAvatarUrl: resolvedAvatar,
      });

      if (!res.ok) {
        setUploadError(res.error || "Gagal menyimpan foto komunitas.");
        setIsSubmitting(false);
        return;
      }

      saveCommunityPhoto(community.id, {
        url: photoUrl,
        caption: resolvedCaption,
        uploaderName: resolvedUploader,
        uploaderAvatar: resolvedAvatar,
      });

      setIsSubmitting(false);
      setUploadedSuccess(true);

      setTimeout(() => {
        setUploadedSuccess(false);
        setPhotoUrl("");
        setCaption("");
        onPhotoUploaded();
        onClose();
      }, 1100);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Gagal mempublikasikan postingan."
      );
      setIsSubmitting(false);
    }
  };

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

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`relative z-10 w-full max-w-md rounded-3xl border p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar ${
            isSandstone
              ? "bg-[#ded3be] border-[#1a1815]/20 text-[#1a1815]"
              : "bg-[#181d22] border-white/15 text-chalk"
          }`}
          style={{
            paddingBottom: "max(env(safe-area-inset-bottom) + 16px, 24px)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
                  isSandstone
                    ? "border-[#1a1815]/20 bg-[#1a1815]/10 text-[#1a1815]"
                    : "border-lime/30 bg-lime/10 text-lime"
                }`}
              >
                <Camera size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">Upload Community Post</h3>
                <p className="text-xs opacity-75 font-light">{community.name}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isSandstone ? "hover:bg-[#1a1815]/10 text-[#1a1815]" : "hover:bg-white/10 text-chalk"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {uploadedSuccess ? (
            <div className="py-10 text-center space-y-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 rounded-full bg-lime/20 border border-lime/40 text-lime flex items-center justify-center mx-auto shadow-lime-glow-sm"
              >
                <CheckCircle2 size={32} />
              </motion.div>
              <h4 className="font-bold text-base">Post Uploaded Successfully!</h4>
              <p className="text-xs opacity-75 max-w-xs mx-auto">
                Your climbing moment has been added to <b>{community.name}</b>&apos;s gallery.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {uploadError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2.5 flex items-start gap-2 text-xs text-red-400">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Photo Input / Picker Area */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {photoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/40 group">
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-full h-52 object-cover"
                    />
                    <button
                      type="button"
                      disabled={isUploadingFile}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold border border-white/20 hover:bg-black transition-colors flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {isUploadingFile && <Loader2 size={12} className="animate-spin" />}
                      <span>{isUploadingFile ? "Uploading..." : "Change Photo"}</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploadingFile && fileInputRef.current?.click()}
                    className={`w-full h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      isSandstone
                        ? "border-[#1a1815]/30 hover:border-[#1a1815] bg-black/5"
                        : "border-white/20 hover:border-lime/40 bg-white/5"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                        isSandstone
                          ? "border-[#1a1815]/20 bg-black/5 text-[#1a1815]"
                          : "border-white/15 bg-white/5 text-slate-ash"
                      }`}
                    >
                      {isUploadingFile ? (
                        <Loader2 size={22} className="animate-spin text-lime" />
                      ) : (
                        <Upload size={22} />
                      )}
                    </div>
                    <div className="text-center px-4">
                      <span className="font-bold text-xs block">
                        {isUploadingFile ? "Uploading to Cloudinary..." : "Choose Photo from Gallery"}
                      </span>
                      <span className="text-[10px] opacity-60 block mt-0.5">
                        Auto-optimized JPG, PNG, WEBP via Cloudinary
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  Photo Caption
                </label>
                <textarea
                  rows={2}
                  required
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share the story behind this send, e.g. First V5 send at Citatah!"
                  className={`w-full p-3 rounded-xl border outline-none text-xs resize-none transition-all ${
                    isSandstone
                      ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] placeholder:text-[#1a1815]/40 focus:border-[#1a1815]"
                      : "bg-transparent border-white/15 text-chalk placeholder:text-white/40 focus:border-lime/40"
                  }`}
                />
              </div>

              {/* Climber Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  Your Name (Uploader)
                </label>
                <input
                  type="text"
                  required
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  placeholder="Climber name"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                    isSandstone
                      ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                      : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                  }`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!photoUrl || isUploadingFile || isSubmitting}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all touch-ripple ${
                  !photoUrl || isUploadingFile || isSubmitting
                    ? "opacity-50 cursor-not-allowed border border-black/10 dark:border-white/10"
                    : isSandstone
                    ? "bg-[#1a1815] text-[#ded3be] hover:opacity-90 border border-[#1a1815]"
                    : "bg-lime text-granite hover:bg-lime-dim shadow-lime-glow-sm"
                }`}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                <span>{isSubmitting ? "Publishing Post..." : "Publish Post to Gallery"}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
