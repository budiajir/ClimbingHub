"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, MapPin, DollarSign, CheckCircle2, Compass, Share2 } from "lucide-react";
import { CragRegion } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

interface OpenTripModalProps {
  isOpen: boolean;
  crag: CragRegion | null;
  onClose: () => void;
}

export default function OpenTripModal({ isOpen, crag, onClose }: OpenTripModalProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isSandstone = theme === "sandstone";

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [quota, setQuota] = useState("6");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [cost, setCost] = useState("75000");
  const [targetLevel, setTargetLevel] = useState("All Levels (Beginner Friendly)");
  const [notes, setNotes] = useState("");
  const [coordinator, setCoordinator] = useState(user?.name || "Climber Organizer");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !crag) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
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
          className={`relative z-10 w-full max-w-lg rounded-3xl border p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar ${
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
                <Compass size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">Open A Trip</h3>
                <p className="text-xs opacity-75 font-light">{crag.name}</p>
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
            <div className="py-12 text-center space-y-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 rounded-full bg-lime/20 border border-lime/40 text-lime flex items-center justify-center mx-auto shadow-lime-glow-sm"
              >
                <CheckCircle2 size={32} />
              </motion.div>
              <h4 className="font-bold text-base">Open Trip Created Successfully!</h4>
              <p className="text-xs opacity-75 max-w-sm mx-auto">
                Your trip plan to <b>{crag.name}</b> has been published. Other climbers and squads can now view the schedule and join.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {/* Trip Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  Open Trip Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekend Bouldering & Crag Session at Citatah"
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                    isSandstone
                      ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                      : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                  }`}
                />
              </div>

              {/* Date & Quota */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Trip Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Climber Quota
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    required
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
              </div>

              {/* Meeting Point & Shared Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Meeting Point
                  </label>
                  <input
                    type="text"
                    required
                    value={meetingPoint}
                    onChange={(e) => setMeetingPoint(e.target.value)}
                    placeholder="e.g. Pawon Basecamp 07:30 AM"
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Estimated Shared Cost (IDR)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="Shared cost per person"
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
              </div>

              {/* Level Target */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  Recommended Climbing Level
                </label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                    isSandstone
                      ? "bg-[#ded3be] border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                      : "bg-[#181d22] border-white/15 text-chalk focus:border-lime/40"
                  }`}
                >
                  <option value="All Levels (Beginner Friendly)">All Levels (Beginner Friendly)</option>
                  <option value="Intermediate (V3 - V5 / 6a - 6c)">Intermediate (V3 - V5 / 6a - 6c)</option>
                  <option value="Advanced (V6+ / 7a+)">Advanced (V6+ / 7a+)</option>
                  <option value="Lead / Sport Climbing Only">Lead / Sport Climbing Only</option>
                </select>
              </div>

              {/* Coordinator Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  Trip Coordinator / Organizer Name
                </label>
                <input
                  type="text"
                  required
                  value={coordinator}
                  onChange={(e) => setCoordinator(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                    isSandstone
                      ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                      : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                  }`}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                  Additional Notes & Gear to Bring
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Bring shared crashpad, personal climbing shoes, packed lunch..."
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
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all touch-ripple ${
                  isSandstone
                    ? "bg-[#1a1815] text-[#ded3be] hover:opacity-90 border border-[#1a1815]"
                    : "bg-lime text-granite hover:bg-lime-dim shadow-lime-glow-sm"
                }`}
              >
                <Compass size={16} />
                <span>Publish Open Trip</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
