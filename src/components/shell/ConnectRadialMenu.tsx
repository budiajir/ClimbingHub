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
                  {/* Outer Arc Shell Light-to-White Radial Gradient */}
                  <radialGradient id="connectOuterShellGrad" cx="50%" cy="100%" r="100%">
                    <stop offset="0%" stopColor="#DFE3E8" />
                    <stop offset="30%" stopColor="#E9EDF2" />
                    <stop offset="65%" stopColor="#F4F6F9" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </radialGradient>

                  {/* Central Hub Dark Slate-to-Charcoal Radial Gradient */}
                  <radialGradient id="connectCenterHubGrad" cx="50%" cy="96%" r="90%">
                    <stop offset="0%" stopColor="#7E848F" />
                    <stop offset="35%" stopColor="#676D78" />
                    <stop offset="70%" stopColor="#515762" />
                    <stop offset="100%" stopColor="#3E434D" />
                  </radialGradient>

                  {/* Arc Path for Curved Text Labels (Radius 158px, Origin 185, 230) */}
                  <path
                    id="connectArcLabelPath"
                    d="M 27 230 A 158 158 0 0 1 343 230"
                    fill="none"
                  />
                </defs>

                {/* Outer Arc Shell with Soft Silver-to-White Gradient (Radius 174px) */}
                <path
                  d="M 11 230 A 174 174 0 0 1 359 230 Z"
                  fill="url(#connectOuterShellGrad)"
                  stroke="rgba(0,0,0,0.14)"
                  strokeWidth="1.2"
                />

                {/* Outer Perimeter Inner Accent Rim */}
                <path
                  d="M 17 230 A 168 168 0 0 1 353 230"
                  fill="none"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="1"
                />

                {/* Technical Orbit Guideline (Behind Buttons, Radius 128px) */}
                <path
                  d="M 57 230 A 128 128 0 0 1 313 230"
                  fill="none"
                  stroke="rgba(0,0,0,0.06)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* 5 Curved Labels along Outer Arc: Delicate, Title Case, matching Photo */}
                <g
                  fill="#374151"
                  style={{
                    fontSize: "8.5px",
                    fontWeight: 500,
                    letterSpacing: "0.03em",
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  <text>
                    <textPath
                      href="#connectArcLabelPath"
                      xlinkHref="#connectArcLabelPath"
                      startOffset="12.2%"
                      textAnchor="middle"
                    >
                      Rent Gear
                    </textPath>
                  </text>
                  <text>
                    <textPath
                      href="#connectArcLabelPath"
                      xlinkHref="#connectArcLabelPath"
                      startOffset="31.1%"
                      textAnchor="middle"
                    >
                      Set Problems
                    </textPath>
                  </text>
                  <text>
                    <textPath
                      href="#connectArcLabelPath"
                      xlinkHref="#connectArcLabelPath"
                      startOffset="50.0%"
                      textAnchor="middle"
                    >
                      Project Sent
                    </textPath>
                  </text>
                  <text>
                    <textPath
                      href="#connectArcLabelPath"
                      xlinkHref="#connectArcLabelPath"
                      startOffset="68.9%"
                      textAnchor="middle"
                    >
                      Open Trip
                    </textPath>
                  </text>
                  <text>
                    <textPath
                      href="#connectArcLabelPath"
                      xlinkHref="#connectArcLabelPath"
                      startOffset="87.8%"
                      textAnchor="middle"
                    >
                      Add Friend
                    </textPath>
                  </text>
                </g>

                {/* Concentric Tonal Acoustic Waves / Rings Radiating from Hub */}
                {/* Ring 3 (Radius 104px - Soft Light Slate Gray) */}
                <path
                  d="M 81 230 A 104 104 0 0 1 289 230 Z"
                  fill="rgba(195, 201, 210, 0.48)"
                  stroke="rgba(255, 255, 255, 0.7)"
                  strokeWidth="1.2"
                />

                {/* Ring 2 (Radius 88px - Medium Light Slate Gray) */}
                <path
                  d="M 97 230 A 88 88 0 0 1 273 230 Z"
                  fill="rgba(152, 159, 170, 0.58)"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth="1.2"
                />

                {/* Ring 1 (Radius 72px - Medium Slate Gray) */}
                <path
                  d="M 113 230 A 72 72 0 0 1 257 230 Z"
                  fill="rgba(118, 125, 137, 0.72)"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="1.2"
                />

                {/* Central Hub Dome (Radius 54px - Deep Slate Gradient) */}
                <path
                  d="M 131 230 A 54 54 0 0 1 239 230 Z"
                  fill="url(#connectCenterHubGrad)"
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="1.2"
                />

                {/* Concentric Subtle Arcs inside Hub */}
                <path
                  d="M 147 230 A 38 38 0 0 1 223 230"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.24)"
                  strokeWidth="1"
                />
                <path
                  d="M 163 230 A 22 22 0 0 1 207 230"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.18)"
                  strokeWidth="1"
                />

                {/* Hub Label: CONNECT */}
                <text
                  x="185"
                  y="209"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  className="select-none font-bold tracking-[0.22em]"
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
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
                className="absolute w-[44px] h-[44px] rounded-full overflow-hidden bg-white hover:bg-slate-50 shadow-sm border-[1.5px] border-[#20252D]/25 flex items-center justify-center p-1 active:scale-95 transition-all touch-ripple"
                style={{ left: 44.3, top: 160.0 }}
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
                className="absolute w-[44px] h-[44px] rounded-full overflow-hidden bg-white hover:bg-slate-50 shadow-sm border-[1.5px] border-[#20252D]/25 flex items-center justify-center p-1 active:scale-95 transition-all touch-ripple"
                style={{ left: 91.4, top: 101.9 }}
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
                className="absolute w-[44px] h-[44px] rounded-full overflow-hidden bg-white hover:bg-slate-50 shadow-sm border-[1.5px] border-[#20252D]/25 flex items-center justify-center p-1 active:scale-95 transition-all touch-ripple"
                style={{ left: 163.0, top: 80.0 }}
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
                className="absolute w-[44px] h-[44px] rounded-full overflow-hidden bg-white hover:bg-slate-50 shadow-sm border-[1.5px] border-[#20252D]/25 flex items-center justify-center p-1 active:scale-95 transition-all touch-ripple"
                style={{ left: 234.6, top: 101.9 }}
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
                className="absolute w-[44px] h-[44px] rounded-full overflow-hidden bg-white hover:bg-slate-50 shadow-sm border-[1.5px] border-[#20252D]/25 flex items-center justify-center p-1 active:scale-95 transition-all touch-ripple"
                style={{ left: 281.7, top: 160.0 }}
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
