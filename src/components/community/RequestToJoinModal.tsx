"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, CheckCircle2, ShieldCheck, MapPin, Instagram } from "lucide-react";
import { Community } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { saveCommunityJoinRequest } from "@/lib/community-store";

interface RequestToJoinModalProps {
  isOpen: boolean;
  community: Community | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestToJoinModal({
  isOpen,
  community,
  onClose,
  onSuccess,
}: RequestToJoinModalProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isSandstone = theme === "sandstone";

  const [climberName, setClimberName] = useState(user?.name || "Climber");
  const [level, setLevel] = useState("V4 - V6 (Intermediate)");
  const [igHandle, setIgHandle] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !community) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      saveCommunityJoinRequest(community.id, {
        climberName: climberName.trim() || user?.name || "Climber",
        level,
        igHandle: igHandle.trim(),
        note: note.trim(),
      });
      setIsSubmitting(false);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        onSuccess();
        onClose();
      }, 1400);
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">Request to Join</h3>
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

          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 rounded-full bg-lime/20 border border-lime/40 text-lime flex items-center justify-center mx-auto shadow-lime-glow-sm"
              >
                <CheckCircle2 size={32} />
              </motion.div>
              <h4 className="font-bold text-base">Request Sent Successfully!</h4>
              <p className="text-xs opacity-75 max-w-xs mx-auto">
                Your join request has been sent to the leaders of <b>{community.name}</b>. Your current status is <b>Pending Approval</b>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {/* Community Info Banner */}
              <div
                className={`p-3 rounded-2xl border flex items-center gap-3 ${
                  isSandstone
                    ? "border-[#1a1815]/15 bg-black/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div
                  className="w-11 h-11 rounded-xl bg-cover bg-center border border-black/10 dark:border-white/10 flex-shrink-0"
                  style={{ backgroundImage: `url(${community.image})` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate">{community.name}</div>
                  <div className="flex items-center gap-1 opacity-70 text-[11px]">
                    <MapPin size={11} /> {community.city}, {community.province}
                  </div>
                </div>
              </div>

              {/* Climber Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  Climber Name
                </label>
                <input
                  type="text"
                  required
                  value={climberName}
                  onChange={(e) => setClimberName(e.target.value)}
                  placeholder="Full name or climbing handle"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                    isSandstone
                      ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                      : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                  }`}
                />
              </div>

              {/* Climbing Grade Level */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  Current Bouldering Level / Grade
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                    isSandstone
                      ? "bg-[#ded3be] border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                      : "bg-[#181d22] border-white/15 text-chalk focus:border-lime/40"
                  }`}
                >
                  <option value="V0 - V2 (Beginner)">V0 - V2 (Beginner / Just Starting)</option>
                  <option value="V3 - V5 (Intermediate)">V3 - V5 (Intermediate / Gym Regular)</option>
                  <option value="V6 - V8 (Advanced)">V6 - V8 (Advanced / Outdoor Crag)</option>
                  <option value="V9+ (Elite / Master)">V9+ (Elite / Competition Climber)</option>
                </select>
              </div>

              {/* Instagram Handle */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  Instagram Handle (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-60">@</span>
                  <input
                    type="text"
                    value={igHandle.replace("@", "")}
                    onChange={(e) => setIgHandle(e.target.value)}
                    placeholder="instagram_handle"
                    className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
              </div>

              {/* Note / Intro */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  Introduction / Reason to Join
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Looking for regular bouldering session buddies every weekend..."
                  className={`w-full p-3 rounded-xl border outline-none text-xs resize-none transition-all ${
                    isSandstone
                      ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] placeholder:text-[#1a1815]/40 focus:border-[#1a1815]"
                      : "bg-transparent border-white/15 text-chalk placeholder:text-white/40 focus:border-lime/40"
                  }`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all touch-ripple ${
                  isSandstone
                    ? "bg-[#1a1815] text-[#ded3be] hover:opacity-90 border border-[#1a1815]"
                    : "bg-lime text-granite hover:bg-lime-dim shadow-lime-glow-sm"
                }`}
              >
                <UserPlus size={16} />
                <span>{isSubmitting ? "Sending Request..." : "Submit Join Request"}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
