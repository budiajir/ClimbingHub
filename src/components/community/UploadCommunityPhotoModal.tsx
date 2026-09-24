"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Upload, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Community } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { saveCommunityPhoto } from "@/lib/community-store";

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
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [uploaderName, setUploaderName] = useState(user?.name || "Climber");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedSuccess, setUploadedSuccess] = useState(false);

  if (!isOpen || !community) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl) return;

    setIsUploading(true);

    setTimeout(() => {
      saveCommunityPhoto(community.id, {
        url: photoDataUrl,
        caption: caption.trim() || "Climbing session with " + community.name,
        uploaderName: uploaderName.trim() || user?.name || "Climber",
        uploaderAvatar: user?.avatar || "https://i.pravatar.cc/60?img=8",
      });

      setIsUploading(false);
      setUploadedSuccess(true);

      setTimeout(() => {
        setUploadedSuccess(false);
        setPhotoDataUrl("");
        setCaption("");
        onPhotoUploaded();
        onClose();
      }, 1200);
    }, 400);
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
                Your climbing moment has been added to <b>{community.name}</b>'s gallery.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {/* Photo Input / Picker Area */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {photoDataUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/40 group">
                    <img
                      src={photoDataUrl}
                      alt="Preview"
                      className="w-full h-52 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold border border-white/20 hover:bg-black transition-colors"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
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
                      <Upload size={22} />
                    </div>
                    <div className="text-center px-4">
                      <span className="font-bold text-xs block">Choose Photo from Gallery</span>
                      <span className="text-[10px] opacity-60 block mt-0.5">Supports JPG, PNG, WEBP formats</span>
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
                disabled={!photoDataUrl || isUploading}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all touch-ripple ${
                  !photoDataUrl
                    ? "opacity-50 cursor-not-allowed border border-black/10 dark:border-white/10"
                    : isSandstone
                    ? "bg-[#1a1815] text-[#ded3be] hover:opacity-90 border border-[#1a1815]"
                    : "bg-lime text-granite hover:bg-lime-dim shadow-lime-glow-sm"
                }`}
              >
                <Upload size={16} />
                <span>{isUploading ? "Uploading Post..." : "Publish Post to Gallery"}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
