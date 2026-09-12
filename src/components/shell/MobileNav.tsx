"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Mountain,
  BookOpen,
  MessageSquare,
  Store,
} from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";

// Custom Exact SVG Icons matching the user's design mockup
function CragIcon({
  className,
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M6 19.5L8.5 4.5C8.65 4.2 8.95 4 9.3 4H13.8C14.2 4 14.55 4.2 14.7 4.55L18.7 9.55C18.9 9.8 19 10.15 19 10.5V19.2C19 19.65 18.65 20 18.2 20H6.8C6.35 20 6 19.65 6 19.2V19.5Z" />
    </svg>
  );
}

function BoulderIcon({
  className,
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M7.8 18.2L4.2 13.1C3.9 12.7 3.9 12.2 4.2 11.8L8.6 5.8C8.9 5.3 9.5 5 10.1 5H16.4C17 5 17.5 5.3 17.8 5.8L20.3 11.3C20.6 11.9 20.5 12.6 20.1 13.1L16 18.2C15.6 18.7 15 19 14.4 19H9.4C8.8 19 8.2 18.7 7.8 18.2Z" />
    </svg>
  );
}

function CreateIcon({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}

function GymClimbingIcon({
  className,
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      fillRule="evenodd"
      clipRule="evenodd"
    >
      <path d="M12 3.5L3.5 9.5V20.5H9V14.5C9 13.95 9.45 13.5 10 13.5H14C14.55 13.5 15 13.95 15 14.5V20.5H20.5V9.5L12 3.5Z" />
    </svg>
  );
}

function CommunityIcon({
  className,
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <circle cx="15.5" cy="15.5" r="5.2" />
      <circle cx="7.5" cy="7.5" r="3.8" />
      <circle cx="17.2" cy="5.8" r="2.2" />
      <circle cx="7.5" cy="17.5" r="1.8" />
    </svg>
  );
}

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSandstone } = useTheme();
  const { role, openAuthModal } = useAuth();
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const isCragsActive = pathname === "/";
  const isBouldersActive = pathname.startsWith("/beta");
  const isGymActive = pathname.startsWith("/gyms");
  const isCommunityActive = pathname.startsWith("/community");

  const handleCreateOption = (action: () => void) => {
    setShowCreateSheet(false);
    action();
  };

  return (
    <>
      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe md:hidden">
        <div
          className={clsx(
            "transition-colors duration-300",
            isSandstone
              ? "bg-[#b8ab96] border-t border-[#1a1815]/20 shadow-lg"
              : "bg-[#23262C]/95 backdrop-blur-lg border-t border-white/10",
          )}
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
        >
          <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
            {/* 1. CRAGS (Paling Kiri) */}
            <Link
              href="/"
              title="Crags"
              className={clsx(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] rounded-2xl transition-all duration-200 touch-ripple",
                isCragsActive
                  ? isSandstone
                    ? "text-[#1a1815] scale-110 font-bold"
                    : "text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                  : isSandstone
                    ? "text-[#1a1815]/70 hover:text-[#1a1815]"
                    : "text-slate-ash hover:text-chalk",
              )}
            >
              <CragIcon size={24} />
            </Link>

            {/* 2. BOULDERS */}
            <Link
              href="/beta"
              title="Boulders"
              className={clsx(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] rounded-2xl transition-all duration-200 touch-ripple",
                isBouldersActive
                  ? isSandstone
                    ? "text-[#1a1815] scale-110 font-bold"
                    : "text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                  : isSandstone
                    ? "text-[#1a1815]/70 hover:text-[#1a1815]"
                    : "text-slate-ash hover:text-chalk",
              )}
            >
              <BoulderIcon size={24} />
            </Link>

            {/* 3. CREATE (+) */}
            <button
              onClick={() => setShowCreateSheet(true)}
              title="Create"
              className={clsx(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] rounded-2xl transition-all duration-200 touch-ripple",
                showCreateSheet
                  ? isSandstone
                    ? "text-[#1a1815] scale-110 font-bold"
                    : "text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                  : isSandstone
                    ? "text-[#1a1815]/70 hover:text-[#1a1815]"
                    : "text-slate-ash hover:text-chalk",
              )}
            >
              <CreateIcon size={28} />
            </button>

            {/* 4. GYM CLIMBING */}
            <Link
              href="/gyms"
              title="Gym Climbing"
              className={clsx(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] rounded-2xl transition-all duration-200 touch-ripple",
                isGymActive
                  ? isSandstone
                    ? "text-[#1a1815] scale-110 font-bold"
                    : "text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                  : isSandstone
                    ? "text-[#1a1815]/70 hover:text-[#1a1815]"
                    : "text-slate-ash hover:text-chalk",
              )}
            >
              <GymClimbingIcon size={24} />
            </Link>

            {/* 5. COMMUNITY (Paling Kanan) */}
            <Link
              href="/community"
              title="Community"
              className={clsx(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] rounded-2xl transition-all duration-200 touch-ripple",
                isCommunityActive
                  ? isSandstone
                    ? "text-[#1a1815] scale-110 font-bold"
                    : "text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                  : isSandstone
                    ? "text-[#1a1815]/70 hover:text-[#1a1815]"
                    : "text-slate-ash hover:text-chalk",
              )}
            >
              <CommunityIcon size={24} />
            </Link>
          </div>
        </div>
      </nav>

      {/* FULL-SCREEN CREATE OVERLAY (COVERS BACKGROUND COMPLETELY) */}
      <AnimatePresence>
        {showCreateSheet && (
          <div className="fixed inset-0 z-[110] flex flex-col justify-between md:hidden">
            {/* 100% Opaque Solid Full-Screen Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`fixed inset-0 z-[110] flex flex-col justify-between p-4 sm:p-6 rounded-none overflow-y-auto ${
                isSandstone
                  ? "bg-[#cfc2ab] text-[#1a1815]"
                  : "bg-[#23262C] text-chalk"
              }`}
              style={{
                paddingTop: "max(env(safe-area-inset-top), 16px)",
                paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
              }}
            >
              {/* Top Bar with Close X button */}
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setShowCreateSheet(false)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-none flex items-center justify-center border transition-all ${
                    isSandstone
                      ? "border-[#1a1815] bg-[#ded3be] text-[#1a1815] hover:bg-[#1a1815] hover:text-[#ded3be]"
                      : "border-white/20 bg-granite text-chalk hover:border-lime hover:bg-lime hover:text-granite"
                  }`}
                  title="Close"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>

              {/* Upper Section: Responsive Left-Justified Text */}
              <div className="pt-2 sm:pt-4 px-2 text-left space-y-3 sm:space-y-5 max-w-lg">
                <p className="text-[22px] sm:text-[28px] md:text-[36px] font-semibold leading-[1.18] tracking-tight">
                  You can propose a new route in Problem.
                </p>
                <p className="text-[22px] sm:text-[28px] md:text-[36px] font-semibold leading-[1.18] tracking-tight">
                  You can submit your beta in Ascent.
                </p>
              </div>

              {/* Bottom Section: Quick Actions with Text Buttons */}
              <div className="space-y-4 sm:space-y-5 pt-3 max-w-md mx-auto w-full px-2">
                <div className="space-y-2.5">
                  <div className="text-left px-1">
                    <span
                      className={`text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] ${
                        isSandstone ? "text-[#1a1815]/60" : "text-white/60"
                      }`}
                    >
                      QUICK ACTIONS
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
                    {/* 1. Submit Boulder Problem */}
                    <button
                      onClick={() =>
                        handleCreateOption(() => {
                          if (role === "guest") {
                            openAuthModal("Please sign in or create an account to submit boulder problems.");
                          } else {
                            router.push("/beta?action=submit");
                          }
                        })
                      }
                      className={clsx(
                        "flex items-center gap-3 w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border transition-all text-left group touch-ripple",
                        isSandstone
                          ? "border-[#8c8273] bg-[#cfc2ab] hover:bg-[#ded3be] text-[#1a1815]"
                          : "border-white/20 bg-white/5 hover:bg-white/10 text-white"
                      )}
                    >
                      <Plus size={19} strokeWidth={2.4} className="shrink-0" />
                      <span className="font-bold text-sm sm:text-base tracking-tight">
                        + Submit Boulder Problem
                      </span>
                    </button>

                    {/* 2. Log Boulder Ascent */}
                    <button
                      onClick={() =>
                        handleCreateOption(() => {
                          if (role === "guest") {
                            openAuthModal("Please sign in to log your ascent.");
                          } else {
                            router.push("/beta?action=log");
                          }
                        })
                      }
                      className={clsx(
                        "flex items-center gap-3 w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border transition-all text-left group touch-ripple",
                        isSandstone
                          ? "border-[#d95338] bg-[#d95338]/10 hover:bg-[#d95338]/15 text-[#d95338]"
                          : "border-[#ff6b4a] bg-[#ff6b4a]/10 hover:bg-[#ff6b4a]/20 text-[#ff6b4a]"
                      )}
                    >
                      <BookOpen size={19} strokeWidth={2.2} className="shrink-0" />
                      <span className="font-bold text-sm sm:text-base tracking-tight">
                        Log Boulder Ascent
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bottom Nav Bar Divider and + Trigger */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-center">
                  <button
                    onClick={() => setShowCreateSheet(false)}
                    className={`w-10 h-10 flex items-center justify-center transition-transform hover:scale-110 ${
                      isSandstone ? "text-[#1a1815]" : "text-lime"
                    }`}
                    title="Close Menu"
                  >
                    <CreateIcon size={28} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
