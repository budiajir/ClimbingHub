"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ShieldCheck, X } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export interface ConnectRadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onRentGear: () => void;
  onSetProblems: () => void;
  onProjectSent: () => void;
  onOpenTripSelect: (type: "open" | "book") => void;
  onAddFriend: () => void;
}

export default function ConnectRadialMenu({
  isOpen,
  onClose,
  onRentGear,
  onSetProblems,
  onProjectSent,
  onOpenTripSelect,
  onAddFriend,
}: ConnectRadialMenuProps) {
  const { isSandstone } = useTheme();
  const [showTripDialog, setShowTripDialog] = useState(false);

  if (!isOpen && !showTripDialog) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 pointer-events-none md:hidden">
          {/* Dimmed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          {/* Radial Arc Menu (Emerges from the bottom) */}
          <div
            className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none"
            style={{ bottom: "calc(4rem + max(env(safe-area-inset-bottom), 0px) - 2px)" }}
          >
            <motion.div
              initial={{ y: 240, scale: 0.65, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 240, scale: 0.65, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 350 }}
              className="pointer-events-auto relative select-none"
              style={{ width: 370, height: 236 }}
            >
              {/* Background SVG Arc Wheel */}
              <svg
                viewBox="0 0 370 236"
                className="w-[370px] h-[236px] drop-shadow-[0_-10px_30px_rgba(0,0,0,0.45)]"
              >
                <defs>
                  {/* Inner Hub Gradients */}
                  <radialGradient id="hubDark" cx="50%" cy="96%" r="85%">
                    <stop offset="0%" stopColor="#484d56" />
                    <stop offset="35%" stopColor="#323740" />
                    <stop offset="65%" stopColor="#22262d" />
                    <stop offset="100%" stopColor="#15171b" />
                  </radialGradient>

                  <radialGradient id="hubSandstone" cx="50%" cy="96%" r="85%">
                    <stop offset="0%" stopColor="#bfb29d" />
                    <stop offset="35%" stopColor="#9f927e" />
                    <stop offset="65%" stopColor="#7a705e" />
                    <stop offset="100%" stopColor="#564d3f" />
                  </radialGradient>

                  {/* Arc Path for Curved Text Labels (Radius 146px) */}
                  <path
                    id="connectArcLabelPath"
                    d="M 39 230 A 146 146 0 0 1 331 230"
                    fill="none"
                  />
                </defs>

                {/* Outer Arc Shell */}
                <path
                  d="M 10 230 A 175 175 0 0 1 360 230 Z"
                  fill={isSandstone ? "#e8dfd2" : "#282c34"}
                  stroke={isSandstone ? "rgba(26,24,21,0.22)" : "rgba(255,255,255,0.15)"}
                  strokeWidth="1.5"
                />

                {/* Outer Label Orbit Guideline */}
                <path
                  d="M 23 230 A 162 162 0 0 1 347 230"
                  fill="none"
                  stroke={isSandstone ? "rgba(26,24,21,0.12)" : "rgba(255,255,255,0.08)"}
                  strokeWidth="1"
                />

                {/* Inner Text Track Guideline (Above Buttons) */}
                <path
                  d="M 49 230 A 136 136 0 0 1 321 230"
                  fill="none"
                  stroke={isSandstone ? "rgba(26,24,21,0.08)" : "rgba(255,255,255,0.05)"}
                  strokeWidth="1"
                />

                {/* Middle Button Orbit Guideline */}
                <path
                  d="M 81 230 A 104 104 0 0 1 289 230"
                  fill="none"
                  stroke={isSandstone ? "rgba(26,24,21,0.08)" : "rgba(255,255,255,0.05)"}
                  strokeWidth="1"
                />

                {/* 5 Curved Labels along Outer Arc: Small, Title Case, matching Photo 2 */}
                <g
                  fill={isSandstone ? "#2b2723" : "#e2e8f0"}
                  style={{
                    fontSize: "8.5px",
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  <text>
                    <textPath
                      href="#connectArcLabelPath"
                      xlinkHref="#connectArcLabelPath"
                      startOffset="15.5%"
                      textAnchor="middle"
                    >
                      Rent Gear
                    </textPath>
                  </text>
                  <text>
                    <textPath
                      href="#connectArcLabelPath"
                      xlinkHref="#connectArcLabelPath"
                      startOffset="32.8%"
                      textAnchor="middle"
                    >
                      Set Problems
                    </textPath>
                  </text>
                  <text>
                    <textPath
                      href="#connectArcLabelPath"
                      xlinkHref="#connectArcLabelPath"
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      Project Sent
                    </textPath>
                  </text>
                  <text>
                    <textPath
                      href="#connectArcLabelPath"
                      xlinkHref="#connectArcLabelPath"
                      startOffset="67.2%"
                      textAnchor="middle"
                    >
                      Open Trip
                    </textPath>
                  </text>
                  <text>
                    <textPath
                      href="#connectArcLabelPath"
                      xlinkHref="#connectArcLabelPath"
                      startOffset="84.5%"
                      textAnchor="middle"
                    >
                      Add Friend
                    </textPath>
                  </text>
                </g>

                {/* Inner Hub Semicircles (Concentric Layers) */}
                <path
                  d="M 98 230 A 87 87 0 0 1 272 230 Z"
                  fill={isSandstone ? "rgba(26,24,21,0.06)" : "rgba(255,255,255,0.05)"}
                />

                <path
                  d="M 111 230 A 74 74 0 0 1 259 230 Z"
                  fill={isSandstone ? "rgba(26,24,21,0.1)" : "rgba(0,0,0,0.28)"}
                />

                <path
                  d="M 123 230 A 62 62 0 0 1 247 230 Z"
                  fill={isSandstone ? "url(#hubSandstone)" : "url(#hubDark)"}
                  stroke={isSandstone ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)"}
                  strokeWidth="1.5"
                />

                {/* Concentric Subtle Arcs inside Hub */}
                <path
                  d="M 139 230 A 46 46 0 0 1 231 230"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                />
                <path
                  d="M 155 230 A 30 30 0 0 1 215 230"
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1"
                />

                {/* Hub Label: CONNECT */}
                <text
                  x="185"
                  y="208"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  className="font-bold tracking-[0.24em]"
                  style={{
                    fontSize: "12px",
                    fontWeight: 900,
                    letterSpacing: "0.24em",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  CONNECT
                </text>
              </svg>

              {/* Action Buttons Layer: 5 Circular Buttons with Official Pictograms */}
              {/* 1. Rent Gear (Carabiner Quickdraw Pictogram) */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: "spring", stiffness: 450, damping: 20 }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose();
                  onRentGear();
                }}
                className="absolute w-[46px] h-[46px] rounded-full overflow-hidden bg-white hover:bg-slate-50 shadow-md border border-black/15 flex items-center justify-center p-0.5 active:scale-95 transition-all touch-ripple"
                style={{ left: 70.2, top: 158.2 }}
                title="Rent Gear"
              >
                <img
                  src="/pictograms/connect-rent-gear.png"
                  alt="Rent Gear"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </motion.button>

              {/* 2. Set Problems (Hold Polygon Pictogram) */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.12, type: "spring", stiffness: 450, damping: 20 }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose();
                  onSetProblems();
                }}
                className="absolute w-[46px] h-[46px] rounded-full overflow-hidden bg-white hover:bg-slate-50 shadow-md border border-black/15 flex items-center justify-center p-0.5 active:scale-95 transition-all touch-ripple"
                style={{ left: 108.4, top: 117.9 }}
                title="Set Problems"
              >
                <img
                  src="/pictograms/connect-set-problems.png"
                  alt="Set Problems"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </motion.button>

              {/* 3. Project Sent (Heart Pictogram) */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.16, type: "spring", stiffness: 450, damping: 20 }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose();
                  onProjectSent();
                }}
                className="absolute w-[46px] h-[46px] rounded-full overflow-hidden bg-white hover:bg-slate-50 shadow-md border border-black/15 flex items-center justify-center p-0.5 active:scale-95 transition-all touch-ripple"
                style={{ left: 162.0, top: 103.0 }}
                title="Project Sent"
              >
                <img
                  src="/pictograms/connect-project-sent.png"
                  alt="Project Sent"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </motion.button>

              {/* 4. Open Trip (Map & Trail Pictogram) */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 450, damping: 20 }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose();
                  setShowTripDialog(true);
                }}
                className="absolute w-[46px] h-[46px] rounded-full overflow-hidden bg-white hover:bg-slate-50 shadow-md border border-black/15 flex items-center justify-center p-0.5 active:scale-95 transition-all touch-ripple"
                style={{ left: 215.6, top: 117.9 }}
                title="Open Trip"
              >
                <img
                  src="/pictograms/connect-open-trip.png"
                  alt="Open Trip"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </motion.button>

              {/* 5. Add Friend (Avatar Circle Pictogram) */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.24, type: "spring", stiffness: 450, damping: 20 }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose();
                  onAddFriend();
                }}
                className="absolute w-[46px] h-[46px] rounded-full overflow-hidden bg-white hover:bg-slate-50 shadow-md border border-black/15 flex items-center justify-center p-0.5 active:scale-95 transition-all touch-ripple"
                style={{ left: 253.8, top: 158.2 }}
                title="Add Friend"
              >
                <img
                  src="/pictograms/connect-add-friend.png"
                  alt="Add Friend"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </motion.button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Trip Option Selection Dialog (Open A Trip vs Book A Trip) */}
      {showTripDialog && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setShowTripDialog(false)}
          />

          <motion.div
            initial={{ y: 60, scale: 0.92, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 60, scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`relative w-full max-w-sm rounded-3xl p-5 border space-y-4 shadow-2xl ${
              isSandstone
                ? "bg-[#ded3be] border-[#1a1815]/20 text-[#1a1815]"
                : "bg-[#1e2228] border-white/10 text-chalk"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-current/10">
              <div>
                <h4 className="font-bold text-base">Trip Kawasan Tebing</h4>
                <p className="text-xs opacity-75 font-light">
                  Pilih aktivitas trip tebing yang kamu butuhkan:
                </p>
              </div>
              <button
                onClick={() => setShowTripDialog(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Option 1: Open A Trip */}
              <button
                onClick={() => {
                  setShowTripDialog(false);
                  onOpenTripSelect("open");
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all touch-ripple ${
                  isSandstone
                    ? "bg-[#f4efe6] border-[#1a1815]/20 hover:border-[#1a1815]"
                    : "bg-white/5 border-white/10 hover:border-lime/50 hover:bg-white/10"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSandstone ? "bg-[#1a1815]/10 text-[#1a1815]" : "bg-white/10 text-lime"
                  }`}
                >
                  <Compass size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm">Open A Trip</div>
                  <div className="text-xs opacity-75 font-light mt-0.5 leading-snug">
                    Buka jadwal trip publik bersama komunitas pemanjat & cari teman se-jalur.
                  </div>
                </div>
              </button>

              {/* Option 2: Book A Trip */}
              <button
                onClick={() => {
                  setShowTripDialog(false);
                  onOpenTripSelect("book");
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all touch-ripple ${
                  isSandstone
                    ? "bg-[#1a1815] text-[#ded3be] border-[#1a1815]"
                    : "bg-lime text-granite border-lime shadow-lime-glow-sm"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSandstone ? "bg-white/15 text-[#ded3be]" : "bg-black/15 text-granite"
                  }`}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm">Book A Trip</div>
                  <div className="text-xs opacity-85 font-light mt-0.5 leading-snug">
                    Sewa instruktur & pemandu lokal terverifikasi untuk pendampingan teknis.
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
