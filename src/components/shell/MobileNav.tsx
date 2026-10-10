"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import Pictogram from "@/components/common/Pictogram";
import ConnectRadialMenu from "@/components/shell/ConnectRadialMenu";
import OpenTripModal from "@/components/crag/OpenTripModal";
import BookTripModal from "@/components/crag/BookTripModal";
import RentEquipmentModal from "@/components/crag/RentEquipmentModal";
import { useCragRegions } from "@/lib/use-data";
import { cragRegions as mockCrags } from "@/lib/mock-data";

// Custom Pictogram icons matching the user's Jalur.Picto published pack
function CragIcon({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return <Pictogram name="crag" size={size} className={className} alt="Crags" />;
}

function BoulderIcon({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return <Pictogram name="problem" size={size} className={className} alt="Problems" />;
}

function CreateIcon({
  className,
  size = 26,
}: {
  className?: string;
  size?: number;
}) {
  return <Pictogram name="create" size={size} className={className} alt="Create" />;
}

function GymClimbingIcon({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return <Pictogram name="gym" size={size} className={className} alt="Climbing Gym" />;
}

function CommunityIcon({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return <Pictogram name="community" size={size} className={className} alt="Community" />;
}

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSandstone } = useTheme();
  const { role, openAuthModal } = useAuth();

  // CONNECT radial menu state
  const [showConnect, setShowConnect] = useState(false);

  // Global modals triggered from CONNECT
  const [showRentEquip, setShowRentEquip] = useState(false);
  const [showOpenTrip, setShowOpenTrip] = useState(false);
  const [showBookTrip, setShowBookTrip] = useState(false);

  const { cragRegions: fetchedCrags } = useCragRegions();
  const allCrags = fetchedCrags && fetchedCrags.length > 0 ? fetchedCrags : mockCrags;

  // Resolve currently active crag if viewing /crags/[id], else default to first crag (Citatah)
  const pathParts = pathname.split("/");
  const currentCragId = pathParts[1] === "crags" && pathParts[2] ? pathParts[2] : null;
  const activeCrag =
    (currentCragId ? allCrags.find((c) => c.id.toLowerCase() === currentCragId.toLowerCase()) : null) ||
    allCrags[0];

  const isCragsActive = pathname.startsWith("/crags");
  const isProblemsActive = pathname.startsWith("/beta");
  const isGymActive = pathname.startsWith("/gyms");
  const isCommunityActive = pathname.startsWith("/community");

  const handleRentGear = () => {
    setShowConnect(false);
    window.dispatchEvent(new CustomEvent("connect-rent-equipment"));
    setShowRentEquip(true);
  };

  const handleSetProblems = () => {
    setShowConnect(false);
    if (role === "guest") {
      openAuthModal("Please sign in or create an account to submit boulder problems or set routes.");
    } else {
      router.push("/beta?action=submit");
    }
  };

  const handleProjectSent = () => {
    setShowConnect(false);
    if (role === "guest") {
      openAuthModal("Please sign in to log your ascents.");
    } else {
      router.push("/beta?action=log");
    }
  };

  const handleOpenTripSelect = (type: "open" | "book") => {
    setShowConnect(false);
    window.dispatchEvent(new CustomEvent("connect-open-trip", { detail: { type } }));
    if (type === "book") {
      setShowBookTrip(true);
    } else {
      setShowOpenTrip(true);
    }
  };

  const handleAddFriend = () => {
    setShowConnect(false);
    router.push("/climbers");
  };

  return (
    <>
      {/* CONNECT RADIAL ARC WHEEL MENU (Emerges animated from bottom) */}
      <ConnectRadialMenu
        isOpen={showConnect}
        onClose={() => setShowConnect(false)}
        onRentGear={handleRentGear}
        onSetProblems={handleSetProblems}
        onProjectSent={handleProjectSent}
        onOpenTripSelect={handleOpenTripSelect}
        onAddFriend={handleAddFriend}
      />

      {/* BOTTOM NAVIGATION BAR (Mobile Portrait) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe md:hidden">
        <div
          className={clsx(
            "transition-colors duration-300 relative",
            isSandstone ? "glass-footer-sandstone" : "glass-footer-dark",
          )}
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
        >
          <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
            {/* 1. CRAGS */}
            <Link
              href="/crags"
              title="Crags"
              onClick={() => setShowConnect(false)}
              className={clsx(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] rounded-2xl transition-colors duration-150 touch-ripple",
                isCragsActive && !showConnect
                  ? "text-[#FF6B00] font-bold"
                  : isSandstone
                  ? "text-[#1a1815]/70 hover:text-[#1a1815]"
                  : "text-slate-ash hover:text-chalk",
              )}
            >
              <CragIcon size={24} />
            </Link>

            {/* 2. PROBLEMS */}
            <Link
              href="/beta"
              title="Problems"
              onClick={() => setShowConnect(false)}
              className={clsx(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] rounded-2xl transition-colors duration-150 touch-ripple",
                isProblemsActive && !showConnect
                  ? "text-[#FF6B00] font-bold"
                  : isSandstone
                  ? "text-[#1a1815]/70 hover:text-[#1a1815]"
                  : "text-slate-ash hover:text-chalk",
              )}
            >
              <BoulderIcon size={24} />
            </Link>

            {/* 3. CONNECT (+) / (X when open) */}
            <button
              onClick={() => setShowConnect((prev) => !prev)}
              title={showConnect ? "Close Connect" : "Connect"}
              className={clsx(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] rounded-2xl transition-colors duration-150 touch-ripple",
                showConnect
                  ? "text-[#FF6B00] font-bold"
                  : isSandstone
                  ? "text-[#1a1815]/70 hover:text-[#1a1815]"
                  : "text-slate-ash hover:text-chalk",
              )}
            >
              <motion.div
                animate={{ rotate: showConnect ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {showConnect ? <X size={26} strokeWidth={2.4} /> : <CreateIcon size={28} />}
              </motion.div>
            </button>

            {/* 4. CLIMBING GYM */}
            <Link
              href="/gyms"
              title="Climbing Gym"
              onClick={() => setShowConnect(false)}
              className={clsx(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] rounded-2xl transition-colors duration-150 touch-ripple",
                isGymActive && !showConnect
                  ? "text-[#FF6B00] font-bold"
                  : isSandstone
                  ? "text-[#1a1815]/70 hover:text-[#1a1815]"
                  : "text-slate-ash hover:text-chalk",
              )}
            >
              <GymClimbingIcon size={24} />
            </Link>

            {/* 5. COMMUNITY */}
            <Link
              href="/community"
              title="Community"
              onClick={() => setShowConnect(false)}
              className={clsx(
                "flex flex-col items-center justify-center min-w-[52px] min-h-[48px] rounded-2xl transition-colors duration-150 touch-ripple",
                isCommunityActive && !showConnect
                  ? "text-[#FF6B00] font-bold"
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

      {/* VERTICAL NAVIGATION BAR FOR TABLET (LANDSCAPE) & PC (Right edge) */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-3 p-2.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 bg-[#181D22]/85 border-white/15">
        {/* 1. CRAGS */}
        <Link
          href="/crags"
          title="Crags"
          onClick={() => setShowConnect(false)}
          className={clsx(
            "p-3 rounded-xl transition-colors duration-150 flex items-center justify-center",
            isCragsActive && !showConnect
              ? "text-[#FF6B00] bg-[#FF6B00]/15"
              : "text-slate-ash hover:text-white hover:bg-white/5",
          )}
        >
          <CragIcon size={24} />
        </Link>

        {/* 2. PROBLEMS */}
        <Link
          href="/beta"
          title="Problems"
          onClick={() => setShowConnect(false)}
          className={clsx(
            "p-3 rounded-xl transition-colors duration-150 flex items-center justify-center",
            isProblemsActive && !showConnect
              ? "text-[#FF6B00] bg-[#FF6B00]/15"
              : "text-slate-ash hover:text-white hover:bg-white/5",
          )}
        >
          <BoulderIcon size={24} />
        </Link>

        {/* 3. CONNECT */}
        <button
          onClick={() => setShowConnect((prev) => !prev)}
          title={showConnect ? "Close Connect" : "Connect"}
          className={clsx(
            "p-3 rounded-xl transition-colors duration-150 flex items-center justify-center",
            showConnect
              ? "text-[#FF6B00] bg-[#FF6B00]/15"
              : "text-slate-ash hover:text-white hover:bg-white/5",
          )}
        >
          {showConnect ? <X size={26} /> : <CreateIcon size={26} />}
        </button>

        {/* 4. CLIMBING GYM */}
        <Link
          href="/gyms"
          title="Climbing Gym"
          onClick={() => setShowConnect(false)}
          className={clsx(
            "p-3 rounded-xl transition-colors duration-150 flex items-center justify-center",
            isGymActive && !showConnect
              ? "text-[#FF6B00] bg-[#FF6B00]/15"
              : "text-slate-ash hover:text-white hover:bg-white/5",
          )}
        >
          <GymClimbingIcon size={24} />
        </Link>

        {/* 5. COMMUNITY */}
        <Link
          href="/community"
          title="Community"
          onClick={() => setShowConnect(false)}
          className={clsx(
            "p-3 rounded-xl transition-colors duration-150 flex items-center justify-center",
            isCommunityActive && !showConnect
              ? "text-[#FF6B00] bg-[#FF6B00]/15"
              : "text-slate-ash hover:text-white hover:bg-white/5",
          )}
        >
          <CommunityIcon size={24} />
        </Link>
      </nav>

      {/* Global Modals for CONNECT feature */}
      {showRentEquip && activeCrag && (
        <RentEquipmentModal
          isOpen={showRentEquip}
          crag={activeCrag}
          onClose={() => setShowRentEquip(false)}
        />
      )}

      {showOpenTrip && activeCrag && (
        <OpenTripModal
          isOpen={showOpenTrip}
          crag={activeCrag}
          onClose={() => setShowOpenTrip(false)}
        />
      )}

      {showBookTrip && activeCrag && (
        <BookTripModal
          isOpen={showBookTrip}
          crag={activeCrag}
          onClose={() => setShowBookTrip(false)}
        />
      )}
    </>
  );
}
