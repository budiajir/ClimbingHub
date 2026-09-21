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

// 1. Carabiner Icon (Rent Gear)
function CarabinerIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 3.5h5.2a4.8 4.8 0 0 1 4.8 4.8v5.4a6.2 6.2 0 0 1-6.2 6.2H8A4.5 4.5 0 0 1 3.5 15.4V8A4.5 4.5 0 0 1 8 3.5z" />
      <line x1="18" y1="8.5" x2="18" y2="15.5" strokeWidth="3.2" />
      <rect x="16.5" y="10.5" width="3" height="3" rx="0.8" fill="currentColor" />
    </svg>
  );
}

// 2. Hold / Route Polygon Icon (Set Problems)
function ProblemPolygonIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="5,19 3,9 12,3 21,8 19,19" />
      <line x1="8" y1="16" x2="16" y2="7" strokeDasharray="2.5 2.5" strokeWidth="2" />
      <circle cx="8" cy="16" r="1.5" fill="currentColor" />
      <circle cx="16" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 3. Heart Icon (Project Sent)
function HeartSentIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

// 4. Folded Map & Trail Icon (Open Trip)
function MapTripIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
      <circle cx="12" cy="11" r="1.5" fill="currentColor" />
      <path d="M12 9.5v3" strokeWidth="1.5" />
    </svg>
  );
}

// 5. User Avatar Circle Icon (Add Friend)
function AddFriendIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M6.5 18a6 6 0 0 1 11 0" />
    </svg>
  );
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
              initial={{ y: 220, scale: 0.65, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 220, scale: 0.65, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 340 }}
              className="pointer-events-auto relative select-none"
              style={{ width: 360, height: 215 }}
            >
              {/* Background SVG Arc Wheel */}
              <svg
                viewBox="0 0 360 215"
                className="w-[360px] h-[215px] drop-shadow-[0_-8px_25px_rgba(0,0,0,0.4)]"
              >
                <defs>
                  {/* Inner Hub Gradients */}
                  <radialGradient id="hubDark" cx="50%" cy="95%" r="85%">
                    <stop offset="0%" stopColor="#474c55" />
                    <stop offset="35%" stopColor="#31363e" />
                    <stop offset="65%" stopColor="#22262c" />
                    <stop offset="100%" stopColor="#16181c" />
                  </radialGradient>

                  <radialGradient id="hubSandstone" cx="50%" cy="95%" r="85%">
                    <stop offset="0%" stopColor="#bfb29d" />
                    <stop offset="35%" stopColor="#9e917d" />
                    <stop offset="65%" stopColor="#7a6f5d" />
                    <stop offset="100%" stopColor="#554c3e" />
                  </radialGradient>

                  {/* Arc Path for Curved Text Labels */}
                  <path
                    id="connectArcLabelPath"
                    d="M 28 202 A 154 154 0 0 1 332 202"
                    fill="none"
                  />
                </defs>

                {/* Outer Arc Shell */}
                <path
                  d="M 12 205 A 168 168 0 0 1 348 205 L 348 205 Z"
                  fill={isSandstone ? "#e8dfd2" : "#282c34"}
                  stroke={isSandstone ? "rgba(26,24,21,0.22)" : "rgba(255,255,255,0.15)"}
                  strokeWidth="1.5"
                />

                {/* Orbit Guideline */}
                <path
                  d="M 28 205 A 152 152 0 0 1 332 205"
                  fill="none"
                  stroke={isSandstone ? "rgba(26,24,21,0.1)" : "rgba(255,255,255,0.08)"}
                  strokeWidth="1"
                />

                {/* Curved Labels along Outer Arc */}
                <text
                  fill={isSandstone ? "#1a1815" : "#e2e8f0"}
                  className="font-bold uppercase tracking-wider"
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  <textPath href="#connectArcLabelPath" startOffset="6.5%" textAnchor="middle">
                    Rent Gear
                  </textPath>
                  <textPath href="#connectArcLabelPath" startOffset="28%" textAnchor="middle">
                    Set Problems
                  </textPath>
                  <textPath href="#connectArcLabelPath" startOffset="50%" textAnchor="middle">
                    Project Sent
                  </textPath>
                  <textPath href="#connectArcLabelPath" startOffset="72%" textAnchor="middle">
                    Open Trip
                  </textPath>
                  <textPath href="#connectArcLabelPath" startOffset="93.5%" textAnchor="middle">
                    Add Friend
                  </textPath>
                </text>

                {/* Inner Hub Semicircles (Concentric Layers) */}
                <path
                  d="M 95 205 A 85 85 0 0 1 265 205 Z"
                  fill={isSandstone ? "rgba(26,24,21,0.06)" : "rgba(255,255,255,0.05)"}
                />

                <path
                  d="M 108 205 A 72 72 0 0 1 252 205 Z"
                  fill={isSandstone ? "rgba(26,24,21,0.1)" : "rgba(0,0,0,0.28)"}
                />

                <path
                  d="M 120 205 A 60 60 0 0 1 240 205 Z"
                  fill={isSandstone ? "url(#hubSandstone)" : "url(#hubDark)"}
                  stroke={isSandstone ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)"}
                  strokeWidth="1.5"
                />

                {/* Concentric Subtle Arcs inside Hub */}
                <path
                  d="M 136 205 A 44 44 0 0 1 224 205"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                />
                <path
                  d="M 152 205 A 28 28 0 0 1 208 205"
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1"
                />

                {/* Hub Label: CONNECT */}
                <text
                  x="180"
                  y="184"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  className="font-bold tracking-[0.22em]"
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "0.22em",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  CONNECT
                </text>
              </svg>

              {/* Action Buttons Layer (5 Circular Buttons Along the Orbit) */}
              {/* 1. Rent Gear (Carabiner) */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: "spring", stiffness: 450, damping: 20 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose();
                  onRentGear();
                }}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center border shadow-lg transition-colors touch-ripple ${
                  isSandstone
                    ? "bg-[#f4efe6] border-[#1a1815] text-[#1a1815] hover:bg-[#1a1815] hover:text-[#f4efe6]"
                    : "bg-[#1f242b] border-white/30 text-chalk hover:border-lime hover:bg-lime hover:text-granite"
                }`}
                style={{ left: 42, top: 141 }}
                title="Rent Gear"
              >
                <CarabinerIcon size={22} />
              </motion.button>

              {/* 2. Set Problems (Hold Polygon) */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.12, type: "spring", stiffness: 450, damping: 20 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose();
                  onSetProblems();
                }}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center border shadow-lg transition-colors touch-ripple ${
                  isSandstone
                    ? "bg-[#f4efe6] border-[#1a1815] text-[#1a1815] hover:bg-[#1a1815] hover:text-[#f4efe6]"
                    : "bg-[#1f242b] border-white/30 text-chalk hover:border-lime hover:bg-lime hover:text-granite"
                }`}
                style={{ left: 85.5, top: 81 }}
                title="Set Problems"
              >
                <ProblemPolygonIcon size={22} />
              </motion.button>

              {/* 3. Project Sent (Heart) */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.16, type: "spring", stiffness: 450, damping: 20 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose();
                  onProjectSent();
                }}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center border shadow-lg transition-colors touch-ripple ${
                  isSandstone
                    ? "bg-[#f4efe6] border-[#1a1815] text-[#1a1815] hover:bg-[#1a1815] hover:text-[#f4efe6]"
                    : "bg-[#1f242b] border-white/30 text-chalk hover:border-lime hover:bg-lime hover:text-granite"
                }`}
                style={{ left: 156, top: 58 }}
                title="Project Sent"
              >
                <HeartSentIcon size={22} />
              </motion.button>

              {/* 4. Open Trip (Map) */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 450, damping: 20 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose();
                  setShowTripDialog(true);
                }}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center border shadow-lg transition-colors touch-ripple ${
                  isSandstone
                    ? "bg-[#f4efe6] border-[#1a1815] text-[#1a1815] hover:bg-[#1a1815] hover:text-[#f4efe6]"
                    : "bg-[#1f242b] border-white/30 text-chalk hover:border-lime hover:bg-lime hover:text-granite"
                }`}
                style={{ left: 226.5, top: 81 }}
                title="Open Trip"
              >
                <MapTripIcon size={22} />
              </motion.button>

              {/* 5. Add Friend (Avatar Circle) */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.24, type: "spring", stiffness: 450, damping: 20 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onClose();
                  onAddFriend();
                }}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center border shadow-lg transition-colors touch-ripple ${
                  isSandstone
                    ? "bg-[#f4efe6] border-[#1a1815] text-[#1a1815] hover:bg-[#1a1815] hover:text-[#f4efe6]"
                    : "bg-[#1f242b] border-white/30 text-chalk hover:border-lime hover:bg-lime hover:text-granite"
                }`}
                style={{ left: 270, top: 141 }}
                title="Add Friend"
              >
                <AddFriendIcon size={22} />
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
