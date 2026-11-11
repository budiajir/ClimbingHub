"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  ExternalLink,
  Phone,
  CloudSun,
  Layers,
  Compass,
  Calendar,
  ChevronRight,
  Info,
  Car,
  Camera,
  LayoutGrid,
  List as ListIcon,
  GalleryHorizontal,
  Share2,
  Check,
  Copy,
  Home,
  Utensils,
  ShieldAlert,
  CheckCircle,
  QrCode,
  ZoomIn,
  X,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCragRegions, normalizeCragName, insertRoute, insertCragRegion, insertSector } from "@/lib/use-data";
import { useTheme } from "@/lib/theme-context";
import { Problem, Sector, CragRegion } from "@/lib/mock-data";
import OpenTripModal from "@/components/crag/OpenTripModal";
import BookTripModal from "@/components/crag/BookTripModal";
import RentEquipmentModal from "@/components/crag/RentEquipmentModal";
import ProblemSheet from "@/components/beta/ProblemSheet";
import LogAscentModal from "@/components/beta/LogAscentModal";
import AscentShareModal from "@/components/beta/AscentShareModal";
import AddRouteModal, { NewRegionData, NewSectorData } from "@/components/beta/AddRouteModal";
import { UserAscent, saveUserAscent } from "@/lib/user-ascents";
import { useAuth } from "@/lib/auth-context";
import { canLogAscent, canCreateCragRoute } from "@/lib/permissions";
import Pictogram from "@/components/common/Pictogram";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist-store";
import {
  isUserCheckedInAtCrag,
  checkInUserAtCrag,
  checkOutUserFromCrag,
  getCragCheckInCount,
} from "@/lib/crag-checkin-store";

export default function CragDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cragRegions, setCragRegions, loading } = useCragRegions();
  const { theme } = useTheme();
  const isSandstone = theme === "sandstone";
  const { role, user, openAuthModal } = useAuth();

  const [problemsViewMode, setProblemsViewMode] = useState<"thumbnail" | "list" | "slide">("thumbnail");
  const [isCragWishlisted, setIsCragWishlisted] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInCount, setCheckInCount] = useState(12);
  const [checkInToast, setCheckInToast] = useState<string | null>(null);

  // Modals for Crag details
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [activeTextureModal, setActiveTextureModal] = useState(false);
  const [showAllPhotosModal, setShowAllPhotosModal] = useState(false);

  // Filters for Routes: Category & Grade Difficulty
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<"all" | "boulder" | "lead" | "trad">("all");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<"all" | "easy" | "moderate" | "hard">("all");
  const [activeSectorId, setActiveSectorId] = useState<string>("all");

  const rawId = params?.id;
  const paramId = (typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "") || "";
  let decodedParamId = "";
  try {
    decodedParamId = paramId ? decodeURIComponent(paramId).toLowerCase().trim() : "";
  } catch {
    decodedParamId = paramId.toLowerCase().trim();
  }
  const normalizedParamId = paramId.toLowerCase().trim();

  const crag = cragRegions.find((c) => {
    if (!c) return false;
    const cId = String(c.id || "").toLowerCase().trim();
    const cName = String(c.name || "").toLowerCase().trim();
    const aliases = (c.aliases || []).map((a) => String(a || "").toLowerCase().trim());

    return (
      (normalizedParamId && cId === normalizedParamId) ||
      (normalizedParamId && aliases.includes(normalizedParamId)) ||
      (decodedParamId && cName === decodedParamId) ||
      (decodedParamId && normalizeCragName(cName) === normalizeCragName(decodedParamId))
    );
  });

  // Sync wishlist & check-in state on mount / crag change
  useEffect(() => {
    if (crag) {
      setIsCragWishlisted(isInWishlist(crag.id));
      setIsCheckedIn(isUserCheckedInAtCrag(crag.id, user?.id || "user-1"));
      setCheckInCount(getCragCheckInCount(crag.id));
    }
  }, [crag, user]);

  // Modals state for Trips & Equipment
  const [showOpenTrip, setShowOpenTrip] = useState(false);
  const [showBookTrip, setShowBookTrip] = useState(false);
  const [showRentEquip, setShowRentEquip] = useState(false);

  // Listen to CONNECT bottom navigation radial actions
  useEffect(() => {
    const handleOpenTrip = (e: any) => {
      if (e.detail?.type === "book") {
        setShowBookTrip(true);
      } else {
        setShowOpenTrip(true);
      }
    };
    const handleRentEquip = () => setShowRentEquip(true);

    window.addEventListener("connect-open-trip" as any, handleOpenTrip);
    window.addEventListener("connect-rent-equipment" as any, handleRentEquip);

    return () => {
      window.removeEventListener("connect-open-trip" as any, handleOpenTrip);
      window.removeEventListener("connect-rent-equipment" as any, handleRentEquip);
    };
  }, []);

  // Problem view & action state
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeShareAscent, setActiveShareAscent] = useState<UserAscent | null>(null);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);

  // Full-frame slideshow & swipe photo gallery state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const cragPhotos = useMemo(() => {
    const list: string[] = [];
    if (crag?.image) list.push(crag.image);
    if (crag?.sectors) {
      crag.sectors.forEach((sec) => {
        if (sec.image && !list.includes(sec.image)) list.push(sec.image);
        (sec.problems || []).forEach((p) => {
          if (p.imageUrl && !list.includes(p.imageUrl)) list.push(p.imageUrl);
        });
      });
    }
    const fallbackPhotos = [
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80",
    ];
    fallbackPhotos.forEach((p) => {
      if (list.length < 5 && !list.includes(p)) list.push(p);
    });
    return list;
  }, [crag]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      setCurrentSlideIndex((prev) => (prev + 1) % cragPhotos.length);
    } else if (diff < -45) {
      setCurrentSlideIndex((prev) => (prev - 1 + cragPhotos.length) % cragPhotos.length);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Check In Toggle Handler
  const handleToggleCheckIn = () => {
    if (!crag) return;
    if (isCheckedIn) {
      checkOutUserFromCrag(crag.id, user?.id || "user-1");
      setIsCheckedIn(false);
      setCheckInCount((prev) => Math.max(0, prev - 1));
      setCheckInToast(`Checked out from ${crag.name}.`);
    } else {
      checkInUserAtCrag(
        crag.id,
        crag.name,
        user?.id || "user-1",
        user?.name || "Ahmad Rizki Nugraha"
      );
      setIsCheckedIn(true);
      setCheckInCount((prev) => prev + 1);
      setCheckInToast(`Checked in at ${crag.name}! Have an epic & safe climbing session!`);
    }
    setTimeout(() => setCheckInToast(null), 3500);
  };

  // Copy Crag URL Handler
  const handleCopyCragUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  // Copy Coordinates Handler
  const handleCopyCoords = () => {
    if (!crag?.coordinates) return;
    const str = `${crag.coordinates.lat}, ${crag.coordinates.lng}`;
    navigator.clipboard.writeText(str);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  if (loading && !crag) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-light opacity-75">Loading crag information...</p>
      </div>
    );
  }

  if (!crag) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
          <Compass size={32} />
        </div>
        <h2 className="text-xl font-bold">Crag Not Found</h2>
        <p className="text-xs opacity-75 font-light">
          The crag or bouldering area you requested ({paramId || "unknown"}) could not be found or has not been mapped yet.
        </p>
        <div className="pt-2">
          <Link
            href="/crags"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white shadow-md hover:bg-[#E5601F] transition-all"
          >
            <ChevronLeft size={16} /> Back to Crags Directory
          </Link>
        </div>
      </div>
    );
  }

  // Filter problems across sectors by both Category and Grade Bracket
  const allProblems = (crag.sectors || []).flatMap((s) =>
    (s.problems || []).map((p) => ({ ...p, sectorId: s.id, sectorName: s.name || "" }))
  );

  const filteredProblems = allProblems.filter((p) => {
    const matchCategory =
      selectedCategoryFilter === "all" ||
      (selectedCategoryFilter === "boulder" && (p.category === "boulder" || p.discipline === "bouldering")) ||
      (selectedCategoryFilter === "lead" && (p.category === "lead" || p.discipline === "sport")) ||
      (selectedCategoryFilter === "trad" && (p.category === "trad" || p.discipline === "multipitch"));

    const matchSector =
      activeSectorId === "all" ||
      (crag.sectors || []).find((s) => s.id === activeSectorId)?.problems?.some((pr) => pr.id === p.id);

    let matchGrade = true;
    const g = (p.grade || "").toUpperCase();
    if (selectedGradeFilter === "easy") {
      matchGrade = g.includes("V0") || g.includes("V1") || g.includes("V2") || g.includes("V3") || g.includes("5.") || g.includes("6A");
    } else if (selectedGradeFilter === "moderate") {
      matchGrade = g.includes("V4") || g.includes("V5") || g.includes("V6") || g.includes("V7") || g.includes("7A");
    } else if (selectedGradeFilter === "hard") {
      matchGrade = g.includes("V8") || g.includes("V9") || g.includes("V10") || g.includes("V11") || g.includes("7B") || g.includes("8A");
    }

    return matchCategory && matchSector && matchGrade;
  });

  // Extract Rock Type & Macro Texture
  const stoneTypology = crag.stoneTypology || crag.rockType || {
    type: "Dense Karst Limestone",
    texture: "Sharp, compact limestone with deep pockets, micro crimps, and positive tufas.",
    features: "Overhanging cave bouldering and vertical pocket faces.",
    ethics: "Use chalk sparingly; soft boar-hair brushes only; chipping is strictly forbidden.",
    texturePhotoUrl: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&q=80",
    macroDescription: "Macro view of weathered karst limestone displaying porous calcite pockets, micro incuts, and positive friction texture.",
  };

  const parkingInfo = crag.parkingSpot || {
    motorcycleFee: "Rp 5.000",
    carFee: "Rp 15.000",
    retributionFee: "Rp 10.000 / orang (Retribusi resmi kawasan)",
    locationDetails: crag.howToGetThere?.parkingInfo || "Spacious designated parking area with local attendants.",
    isGuarded: true,
  };

  const meetingPoint = crag.meetingPoint || {
    name: crag.whoToContact?.basecampName || "Climber Basecamp & Meeting Point",
    address: crag.whoToContact?.basecampAddress || crag.province,
    landmark: "Main entrance gate & climber coordination hut",
    notes: "Central gathering point for briefing, crash pad rental, and guestbook registration.",
    gmapsUrl: crag.gmapsUrl,
  };

  const accomodation = crag.accomodation || {
    lodging: "Local climber homestay (Rp 50.000/night/person) and scenic open camping lawn at the cliff base.",
    toilets: "Fresh water toilets and shower rinse facilities available at the basecamp.",
    mushola: "Community prayer room (Mushola) located within 100 meters.",
    eateries: "Climber food stalls (warung) serving hot rice, fried snacks, coffee, and drinking water refills.",
  };

  const etiquette = crag.climbingEtiquette || {
    governmentRegulations: [
      "Wajib mengisi buku registrasi simaksi / kunjungan di basecamp pengelola sebelum memulai pemanjatan.",
      "Dilarang melakukan chipping (memahat batu) atau merusak formasi batuan alami.",
      "Wajib mengenakan helm panjat dan menggunakan peralatan keselamatan berstandar UIAA/CE.",
    ],
    localNorms: [
      "Menghormati norma kesopanan warga lokal: mengenakan pakaian pantas saat melintasi pemukiman.",
      "Menjaga ketenangan dan menghentikan pemanjatan sesaat saat terdengar kumandang adzan fardhu.",
      "Menghindari aktivitas di dekat situs pemakaman atau petilasan yang disakralkan warga.",
    ],
    environmentalRules: [
      "Leave No Trace (LNT): Bawa turun seluruh sampah, puntung rokok, dan sisa tape panjat.",
      "Hanya gunakan sikat berbulu lembut (nylon/bulu alami); dilarang keras menggunakan sikat kawat.",
      "Tidak membuat api unggun langsung di atas permukaan batu tebing.",
    ],
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-28 pt-2 space-y-6 ${
      isSandstone ? "text-[#1a1815]" : "text-chalk"
    }`}>
      {/* Toast Alert */}
      <AnimatePresence>
        {checkInToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[130] px-4 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400"
          >
            <CheckCircle size={15} />
            <span>{checkInToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1-Step Back Navigation Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <Link
          href="/crags"
          className={`flex items-center gap-1.5 py-1 -ml-1 group text-left transition-opacity hover:opacity-75 active:opacity-60 min-w-0 ${
            isSandstone ? "text-[#1a1815]" : "text-chalk"
          }`}
        >
          <ChevronLeft size={20} className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5 text-[#FF6B00]" />
          <span className="text-sm sm:text-base font-bold tracking-wide truncate">
            Back to Crags Directory
          </span>
        </Link>

        {/* Live Active Climbers Badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 shadow-sm">
          <UserCheck size={13} />
          <span>{checkInCount} Climbers Active Today</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. CRAG TITLE, LOCATION & MAIN CTA TOOLBAR                   */}
      {/* Rows: 1 (Title), 5 (Location), 19 (CheckIn), 20 (Wishlist),  */}
      {/* 21 (Share Link)                                              */}
      {/* ============================================================ */}
      <div className="space-y-2 pb-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#FF6B00]">
                Natural Outdoor Crag
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                Verified
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mt-1">
              {crag.name}
            </h1>

            {/* Row 5: Location Detail Address & Coordinate */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-medium pt-1 opacity-80">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-[#FF6B00]" />
                {crag.province}, Indonesia
              </span>
              {crag.coordinates && (
                <>
                  <span>·</span>
                  <button
                    onClick={handleCopyCoords}
                    className="font-mono text-xs opacity-75 hover:opacity-100 flex items-center gap-1 hover:text-[#06B6D4] transition-colors"
                    title="Click to copy GPS coordinates"
                  >
                    <span>{crag.coordinates.lat}, {crag.coordinates.lng}</span>
                    <Copy size={11} className={copiedCoords ? "text-emerald-400" : "opacity-60"} />
                  </button>
                  {copiedCoords && <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>}
                </>
              )}
            </div>
          </div>

          {/* Action Toolbar: Row 19 (CheckIn), Row 20 (Wishlist), Row 21 (Share Link) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Row 19: Check In Crags (Call To Action Button) */}
            <button
              type="button"
              onClick={handleToggleCheckIn}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                isCheckedIn
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-400"
                  : "bg-[#FF6B00] hover:bg-[#E5601F] text-white"
              }`}
            >
              <UserCheck size={14} />
              <span>{isCheckedIn ? "Checked In (Tap to Check Out)" : "Check In at Crag"}</span>
            </button>

            {/* Row 20: Wishlist Button (CTA Button) */}
            <button
              type="button"
              onClick={() => {
                toggleWishlist({
                  id: crag.id,
                  type: "crag",
                  title: crag.name,
                  subtitle: crag.province,
                  image: crag.image,
                  location: crag.province,
                  savedAt: new Date().toISOString().split("T")[0],
                });
                setIsCragWishlisted(!isCragWishlisted);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                isCragWishlisted
                  ? "bg-[#F90657] border-[#F90657] text-white"
                  : isSandstone
                  ? "border-[#1a1815]/20 text-[#1a1815] hover:border-[#F90657] hover:text-[#F90657]"
                  : "border-white/20 text-white hover:border-[#F90657] hover:text-[#F90657]"
              }`}
            >
              <Pictogram
                name={isCragWishlisted ? "wishlisted" : "wishlist"}
                size={14}
                className={isCragWishlisted ? "text-white" : "text-current"}
              />
              <span>{isCragWishlisted ? "Wishlisted" : "Save Wishlist"}</span>
            </button>

            {/* Row 21: Share Link (CTA Button: direct send / copy url) */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isSandstone
                  ? "border-[#1a1815]/20 hover:border-[#1a1815] text-[#1a1815]"
                  : "border-white/20 hover:border-white text-white"
              }`}
            >
              <Share2 size={13} />
              <span>Share Crag</span>
            </button>
          </div>
        </div>

        {/* Row 2: Static Crag Description */}
        {crag.description && (
          <p className="text-xs sm:text-sm leading-relaxed opacity-85 font-light pt-2 max-w-3xl">
            {crag.description}
          </p>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. PHOTOS (Row 6: Photo Pemandangan dan Suasana Kawasan)      */}
      {/* Mode: Full Frame Slideshow + Touch Swipe + Modal Gallery     */}
      {/* ============================================================ */}
      <div className="relative group">
        <div
          className="-mx-4 sm:-mx-6 lg:-mx-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] rounded-none h-72 sm:h-96 md:h-[440px] relative overflow-hidden shadow-xl select-none touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Photo slides */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${cragPhotos[currentSlideIndex]})` }}
            />
          </AnimatePresence>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Previous / Next Chevron Buttons */}
          {cragPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setCurrentSlideIndex((prev) => (prev - 1 + cragPhotos.length) % cragPhotos.length)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-all z-10 shadow-lg"
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentSlideIndex((prev) => (prev + 1) % cragPhotos.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-all z-10 shadow-lg"
                aria-label="Next photo"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Photo indicator & View All Photos CTA Button */}
          <div className="absolute bottom-3 right-4 flex items-center gap-2 z-10">
            <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium flex items-center gap-1.5">
              <Camera size={12} className="text-[#FF6B00]" />
              <span>{currentSlideIndex + 1} / {cragPhotos.length}</span>
            </div>

            <button
              onClick={() => setShowAllPhotosModal(true)}
              className="px-3 py-1 rounded-full bg-[#FF6B00] text-white text-[11px] font-bold hover:bg-[#E5601F] transition-all shadow-md flex items-center gap-1"
            >
              <LayoutGrid size={11} />
              <span>All Photos</span>
            </button>
          </div>

          {/* Bottom Dots Navigation */}
          {cragPhotos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {cragPhotos.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentSlideIndex ? "w-6 bg-[#FF6B00]" : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sectors & Routes Count Badge Summary */}
      <div className="flex items-center gap-2.5 flex-wrap pt-1">
        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
          isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
        }`}>
          <span className="text-base font-bold font-mono text-[#FF6B00]">{crag.sectorCount}</span>
          <span className="text-xs opacity-75">Sectors</span>
        </div>

        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
          isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
        }`}>
          <span className="text-base font-bold font-mono text-[#06B6D4]">{crag.problemCount}</span>
          <span className="text-xs opacity-75">Verified Routes</span>
        </div>

        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
          isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
        }`}>
          <span className="text-base font-bold font-mono text-emerald-400">{stoneTypology.type}</span>
          <span className="text-xs opacity-75">Rock Type</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. COMPREHENSIVE CRAG DETAILS GRID                           */}
      {/* Rows: 9 (Stone Typology + Photo Detail Tekstur Batu),         */}
      {/* 12 (How to Get There), 13 (Who to Contact), 14 (Parking),    */}
      {/* 15 (Meeting Point), 16 (Accomodation), 17 (Weather Forecast) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* ROW 9: STONE TYPOLOGY (Jenis batuan + foto detail tekstur batu) */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${
          isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm flex items-center gap-2 text-[#F90657]">
                <Layers size={16} /> Stone Typology & Wall Character
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                {stoneTypology.type}
              </span>
            </div>

            <p className="text-xs opacity-80 leading-relaxed font-light">
              <strong>Texture & Formations:</strong> {stoneTypology.texture}
            </p>
            <p className="text-xs opacity-80 leading-relaxed font-light mt-1">
              <strong>Hold Features:</strong> {stoneTypology.features}
            </p>
          </div>

          {/* Foto Detail pada Tekstur Batu (Row 9 Requirement) */}
          <div className="pt-2 border-t border-black/5 dark:border-white/10">
            <span className="text-[11px] font-bold block mb-1.5 opacity-80">
              Macro Rock Texture Detail (Foto Tekstur Batu):
            </span>
            <div
              onClick={() => setActiveTextureModal(true)}
              className="relative rounded-2xl overflow-hidden h-28 border border-white/20 cursor-pointer group shadow-sm"
            >
              <img
                src={stoneTypology.texturePhotoUrl || "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&q=80"}
                alt="Detail tekstur batu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                <span className="truncate text-[11px] font-medium">{stoneTypology.macroDescription || "Tap to inspect rock texture in full resolution"}</span>
                <span className="px-2 py-0.5 rounded-lg bg-black/70 border border-white/20 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <ZoomIn size={11} /> Zoom
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 12 & 15: HOW TO GET THERE & MEETING POINT */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${
          isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2 text-[#F90657]">
                <Compass size={16} /> How to Get There & Meeting Point
              </h3>
            </div>

            {/* Meeting Point Box (Row 15) */}
            <div className={`p-3 rounded-2xl border ${
              isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/5"
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] block">
                Titik Kumpul Utama (Meeting Point):
              </span>
              <div className="font-bold text-xs mt-0.5">{meetingPoint.name}</div>
              <p className="text-[11px] opacity-75 mt-0.5">{meetingPoint.address}</p>
              <p className="text-[11px] opacity-80 italic mt-1 font-light">&quot;{meetingPoint.notes}&quot;</p>
            </div>

            {/* Driving Route & Hike */}
            <div className="text-xs space-y-1.5 opacity-85 font-light">
              <p><strong>Driving Access:</strong> {crag.howToGetThere?.driveInfo || "Accessible by two-wheel and four-wheel vehicles via paved highway."}</p>
              <p><strong>Hike-In Approach:</strong> {crag.howToGetThere?.hikeDuration || "5 to 10 minutes easy approach walk from basecamp to cliff base."}</p>
            </div>
          </div>

          {/* Row 12: CTA Button Tautan Google Maps */}
          {crag.gmapsUrl && (
            <a
              href={crag.gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <ExternalLink size={14} />
              <span>Open Meeting Point in Google Maps &rarr;</span>
            </a>
          )}
        </div>

        {/* ROW 14: PARKING SPOT & OFFICIAL RETRIBUTION */}
        <div className={`p-5 rounded-3xl border space-y-3 ${
          isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2 text-[#F90657]">
              <Car size={16} /> Parking Spot & Retribution Fee
            </h3>
            {parkingInfo.isGuarded && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Guarded Area
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className={`p-2.5 rounded-xl border ${isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/5"}`}>
              <span className="text-[10px] opacity-70 block font-bold">Motorcycle Parking</span>
              <span className="font-mono font-bold text-sm text-[#FF6B00] mt-0.5 block">{parkingInfo.motorcycleFee}</span>
            </div>
            <div className={`p-2.5 rounded-xl border ${isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/5"}`}>
              <span className="text-[10px] opacity-70 block font-bold">Car Parking</span>
              <span className="font-mono font-bold text-sm text-[#06B6D4] mt-0.5 block">{parkingInfo.carFee}</span>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
            isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/5"
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Official Retribution (Biaya Retribusi Resmi):
            </span>
            <div className="font-bold">{parkingInfo.retributionFee}</div>
            <p className="text-[11px] opacity-75 font-light pt-0.5 leading-relaxed">
              {parkingInfo.locationDetails}
            </p>
          </div>
        </div>

        {/* ROW 13: WHO TO CONTACT (Local Manager / Basecamp Coordinator) */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between space-y-3 ${
          isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
        }`}>
          <div className="space-y-2">
            <h3 className="font-bold text-sm flex items-center gap-2 text-[#F90657]">
              <Phone size={16} /> Who to Contact (Management & Ranger)
            </h3>
            {crag.whoToContact ? (
              <div className="space-y-1.5 text-xs">
                <div>
                  <div className="font-bold text-sm">{crag.whoToContact.name}</div>
                  <div className="text-[11px] opacity-70">{crag.whoToContact.role}</div>
                </div>
                <div className="pt-1">
                  <div className="font-semibold">{crag.whoToContact.basecampName}</div>
                  {crag.whoToContact.basecampAddress && (
                    <div className="text-[11px] opacity-75 font-light">{crag.whoToContact.basecampAddress}</div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs opacity-75">Basecamp management contact available upon arrival.</p>
            )}
          </div>

          {crag.whoToContact?.phone && (
            <a
              href={`https://wa.me/${String(crag.whoToContact.phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Halo ${crag.whoToContact.name}, saya ingin menanyakan informasi pemanjatan di ${crag.name}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Phone size={14} />
              <span>Contact via WhatsApp ({crag.whoToContact.phone})</span>
            </a>
          )}
        </div>

        {/* ROW 16: ACCOMODATION (Penginapan, Toilet, Mushola, Tempat Makan) */}
        <div className={`p-5 rounded-3xl border space-y-3 ${
          isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
        }`}>
          <h3 className="font-bold text-sm flex items-center gap-2 text-[#F90657]">
            <Home size={16} /> Accomodation & Facilities
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <Home size={14} className="text-[#FF6B00] shrink-0 mt-0.5" />
              <div>
                <strong>Lodging / Camp:</strong> <span className="opacity-80 font-light">{accomodation.lodging}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle size={14} className="text-[#06B6D4] shrink-0 mt-0.5" />
              <div>
                <strong>Toilet & Bilas:</strong> <span className="opacity-80 font-light">{accomodation.toilets}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Sparkles size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Mushola:</strong> <span className="opacity-80 font-light">{accomodation.mushola}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Utensils size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Tempat Makan:</strong> <span className="opacity-80 font-light">{accomodation.eateries}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 17: WEATHER FORECAST (Laporan cuaca real time & best season) */}
        <div className={`p-5 rounded-3xl border space-y-3 ${
          isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2 text-[#F90657]">
              <CloudSun size={16} /> Weather Forecast (Real Time)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Live Conditions
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border ${isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/5"}`}>
              <span className="text-[10px] opacity-70 block font-bold">Conditions</span>
              <span className="font-bold text-sm text-[#FF6B00] mt-0.5 block">{crag.weatherForecast?.condition || "Partly Sunny"}</span>
            </div>
            <div className={`p-2.5 rounded-xl border ${isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/5"}`}>
              <span className="text-[10px] opacity-70 block font-bold">Avg Temperature</span>
              <span className="font-bold text-sm text-[#06B6D4] mt-0.5 block">{crag.weatherForecast?.tempAvg || "26°C - 31°C"}</span>
            </div>
            <div className={`p-2.5 rounded-xl border col-span-2 sm:col-span-1 ${isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/5"}`}>
              <span className="text-[10px] opacity-70 block font-bold">Best Season</span>
              <span className="font-bold text-xs text-emerald-400 mt-0.5 block">{crag.weatherForecast?.bestSeason || "May - Oct (Dry)"}</span>
            </div>
          </div>

          <p className="text-[11px] opacity-75 font-light leading-relaxed">
            <strong>Rain Advice:</strong> {crag.weatherForecast?.rainNotes || "Sheltered cave sectors remain climbable during passing tropical rain."}
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. CLIMBING ETIQUETTE (Row 18 in Matrix - Static)            */}
      {/* Scope: Peraturan pemerintah, norma dan adat masyarakat       */}
      {/* ============================================================ */}
      <section className={`p-6 rounded-3xl border space-y-4 ${
        isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
      }`}>
        <div className="flex items-center gap-2">
          <ShieldAlert size={20} className="text-[#F90657]" />
          <div>
            <h3 className="font-bold text-base text-[#F90657]">
              Climbing Etiquette & Local Regulations
            </h3>
            <p className="text-xs opacity-70 font-light">
              Hal-hal yang patut diutamakan dan diperhatikan oleh pemanjat sesuai dengan peraturan pemerintah, norma adat, dan etika lingkungan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* A: Government & Simaksi */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/5"
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B00] block">
              1. Peraturan Pemerintah & Izin
            </span>
            <ul className="text-xs opacity-80 space-y-1.5 list-disc list-inside font-light leading-relaxed">
              {etiquette.governmentRegulations.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* B: Local Customs & Village Norms */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/5"
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#06B6D4] block">
              2. Norma & Adat Masyarakat
            </span>
            <ul className="text-xs opacity-80 space-y-1.5 list-disc list-inside font-light leading-relaxed">
              {etiquette.localNorms.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* C: Environmental & Rock Preservation */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/5"
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
              3. Kelestarian Batu & Lingkungan
            </span>
            <ul className="text-xs opacity-80 space-y-1.5 list-disc list-inside font-light leading-relaxed">
              {etiquette.environmentalRules.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pink divider */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 5. CLIMBING SECTORS (Row 7 in Matrix - CTA Button)           */}
      {/* ============================================================ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
            <Layers size={18} className="text-[#FF6B00]" />
            Climbing Sectors ({(crag.sectors || []).length} Sectors)
          </h3>
          <span className="text-xs opacity-60">Tap a sector card to filter routes below</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* All Sectors Button */}
          <div
            onClick={() => setActiveSectorId("all")}
            className={`rounded-2xl border cursor-pointer transition-all overflow-hidden flex flex-col justify-between p-3.5 ${
              activeSectorId === "all"
                ? isSandstone
                  ? "border-[#1a1815] bg-[#1a1815] text-[#ded3be]"
                  : "border-[#FF6B00] ring-2 ring-[#FF6B00] bg-[#FF6B00]/10 text-white"
                : isSandstone
                ? "border-[#1a1815]/15 bg-[#f4efe6] text-[#1a1815]"
                : "border-white/10 bg-[#181D22] text-chalk hover:border-[#FF6B00]/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Overview</span>
              <ChevronRight size={14} className="text-[#FF6B00]" />
            </div>
            <div className="mt-3">
              <div className="font-bold text-sm">All Sectors</div>
              <div className="text-[11px] opacity-75">{allProblems.length} Total Routes</div>
            </div>
          </div>

          {(crag.sectors || []).map((sector) => {
            const isSelected = activeSectorId === sector.id;
            const sectorImg = sector.image || crag.image || "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80";
            return (
              <div
                key={sector.id}
                onClick={() => setActiveSectorId(sector.id)}
                className={`rounded-2xl border cursor-pointer transition-all overflow-hidden group ${
                  isSelected
                    ? isSandstone
                      ? "border-[#1a1815] ring-2 ring-[#1a1815]"
                      : "border-[#FF6B00] ring-2 ring-[#FF6B00]"
                    : isSandstone
                    ? "border-[#1a1815]/15 hover:border-[#1a1815]/40"
                    : "border-white/10 hover:border-[#FF6B00]/50"
                }`}
              >
                <div className="h-28 w-full relative overflow-hidden bg-black/40">
                  <img
                    src={sectorImg}
                    alt={sector.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <div>
                      <div className="font-bold text-xs drop-shadow leading-snug">{sector.name}</div>
                      <div className="text-[10px] text-white/80">{(sector.problems || []).length} Routes</div>
                    </div>
                    <ChevronRight size={14} className="text-[#FF6B00] shrink-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pink divider */}
      <div className="border-t border-[#F90657]/30" />

      {/* ============================================================ */}
      {/* 6. PROBLEMS & ROUTE LIST (Rows 8, 10, 11, 4)                  */}
      {/* Row 8: Problems/Route List                                   */}
      {/* Row 10: Climbing Categories (Boulder, Lead, Multipitch)      */}
      {/* Row 11: Climbing Grades (Tingkat kesulitan jalur pemanjatan) */}
      {/* Row 4: View Mode (Thumbnail, List, Slide)                    */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base md:text-xl flex items-center gap-2">
              <Compass size={18} className="text-[#FF6B00]" />
              Problems & Verified Climbing Routes
              <span className="text-xs font-light opacity-65">({filteredProblems.length} routes)</span>
            </h3>
            <p className="text-xs opacity-75 font-light">
              Select any route to open interactive topo line overlays, technical specifications, and beta videos.
            </p>
          </div>

          {/* Filters Bar: Category + Grade + View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Row 10: Climbing Categories Filter Pills (Boulder, Lead, Multipitch) */}
            <div className={`p-1 rounded-xl flex items-center gap-1 border ${
              isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/10"
            }`}>
              {(["all", "boulder", "lead", "trad"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                    selectedCategoryFilter === cat
                      ? "bg-[#FF6B00] text-white shadow-sm"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {cat === "all" ? "All Style" : cat === "trad" ? "Multipitch" : cat}
                </button>
              ))}
            </div>

            {/* Row 11: Climbing Grades Filter Pills */}
            <div className={`p-1 rounded-xl flex items-center gap-1 border ${
              isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/10"
            }`}>
              {[
                { id: "all", label: "All Grades" },
                { id: "easy", label: "V0-V3" },
                { id: "moderate", label: "V4-V7" },
                { id: "hard", label: "V8+" },
              ].map((grd) => (
                <button
                  key={grd.id}
                  onClick={() => setSelectedGradeFilter(grd.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedGradeFilter === grd.id
                      ? "bg-[#06B6D4] text-white shadow-sm"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {grd.label}
                </button>
              ))}
            </div>

            {/* Row 4: View Mode Switcher (Thumbnail, List, Slide) */}
            <div className={`p-1 rounded-xl flex items-center gap-1 border ${
              isSandstone ? "bg-black/5 border-black/10" : "bg-black/20 border-white/10"
            }`}>
              <button
                onClick={() => setProblemsViewMode("thumbnail")}
                title="Thumbnail View"
                className={`p-1.5 rounded-lg transition-all ${
                  problemsViewMode === "thumbnail" ? "bg-[#FF6B00] text-white shadow-sm" : "opacity-60 hover:opacity-100"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setProblemsViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-lg transition-all ${
                  problemsViewMode === "list" ? "bg-[#FF6B00] text-white shadow-sm" : "opacity-60 hover:opacity-100"
                }`}
              >
                <ListIcon size={15} />
              </button>
              <button
                onClick={() => setProblemsViewMode("slide")}
                title="Slide View"
                className={`p-1.5 rounded-lg transition-all ${
                  problemsViewMode === "slide" ? "bg-[#FF6B00] text-white shadow-sm" : "opacity-60 hover:opacity-100"
                }`}
              >
                <GalleryHorizontal size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Problems Display based on View Mode */}
        {filteredProblems.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl border opacity-75 ${
            isSandstone ? "border-[#1a1815]/15" : "border-white/10"
          }`}>
            <p className="text-sm">No climbing routes match the selected category or grade filter.</p>
          </div>
        ) : problemsViewMode === "slide" ? (
          /* Slide View (Horizontal Carousel) */
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar">
            {filteredProblems.map((p) => {
              const category = p.category || (p.discipline === "bouldering" ? "boulder" : "lead");
              const routeImg = p.imageUrl || crag.image || "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80";
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProblem(p)}
                  className={`min-w-[280px] sm:min-w-[320px] snap-center rounded-2xl border overflow-hidden cursor-pointer group hover:border-[#FF6B00]/60 transition-all shadow-md flex flex-col justify-between ${
                    isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
                  }`}
                >
                  <div className="h-44 w-full relative overflow-hidden bg-black/40">
                    <img
                      src={routeImg}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[#FF6B00] border border-[#FF6B00]/40">
                        {category}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md text-white border border-white/20">
                      {p.grade}{p.fontGrade ? ` (${p.fontGrade})` : ""}
                    </div>
                  </div>
                  <div className="p-3.5 space-y-2">
                    <div>
                      <h4 className="font-bold text-base group-hover:text-[#FF6B00] transition-colors">{p.name}</h4>
                      <div className="text-[11px] opacity-65 font-light">{p.sectorName || "Crag"} · Setter: {p.setterYear || p.setter}</div>
                    </div>
                    <p className="text-xs opacity-75 font-light line-clamp-2 leading-relaxed">{p.description}</p>
                    <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px]">
                      <span className="opacity-70">Height: <b>{p.height || "4m"}</b> · Holds: <b>{p.holdsCount || 12}</b></span>
                      <span className="font-bold text-[#FF6B00]">View Topo &rarr;</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : problemsViewMode === "list" ? (
          /* List View */
          <div className="space-y-2">
            {filteredProblems.map((p) => {
              const category = p.category || (p.discipline === "bouldering" ? "boulder" : "lead");
              const routeImg = p.imageUrl || crag.image || "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80";
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProblem(p)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group hover:border-[#FF6B00]/50 ${
                    isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-black/30 border border-white/10">
                      <img src={routeImg} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm truncate group-hover:text-[#FF6B00] transition-colors">{p.name}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/20 dark:bg-white/5 border border-white/10 text-slate-ash">
                          {category}
                        </span>
                      </div>
                      <div className="text-[11px] opacity-65 font-light truncate mt-0.5">
                        {p.sectorName || "Crag"} · {p.height || "4m"} · {p.holdsCount || 12} holds
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/5 border border-white/10">
                      {p.grade}{p.fontGrade ? ` (${p.fontGrade})` : ""}
                    </span>
                    <ChevronRight size={16} className="text-[#FF6B00]" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Thumbnail View (Grid with Photos) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProblems.map((p) => {
              const category = p.category || (p.discipline === "bouldering" ? "boulder" : "lead");
              const routeImg = p.imageUrl || crag.image || "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80";
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProblem(p)}
                  className={`rounded-2xl border transition-all cursor-pointer overflow-hidden group flex flex-col justify-between shadow-sm hover:border-[#FF6B00]/60 ${
                    isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#181D22] border-white/10"
                  }`}
                >
                  <div className="h-36 w-full relative overflow-hidden bg-black/40">
                    <img
                      src={routeImg}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#FF6B00] border border-[#FF6B00]/40">
                        {category}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-white border border-white/20">
                      {p.grade}{p.fontGrade ? ` (${p.fontGrade})` : ""}
                    </div>
                    <div className="absolute bottom-2 left-3 right-3">
                      <h4 className="font-bold text-sm text-white drop-shadow group-hover:text-[#FF6B00] transition-colors">{p.name}</h4>
                      <div className="text-[10px] text-white/70 font-light">{p.sectorName || "Crag"}</div>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-xs opacity-75 font-light line-clamp-2 leading-relaxed">{p.description}</p>
                    <div className="pt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px]">
                      <span className="opacity-70">Height: <b>{p.height || "4m"}</b> · Holds: <b>{p.holdsCount || 12}</b></span>
                      <span className="font-bold text-[#FF6B00] flex items-center gap-0.5">
                        View Topo &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* MODAL: SHARE CRAG LINK (Row 21 in Matrix)                    */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm popup-form-purple rounded-3xl p-6 border shadow-2xl space-y-4 text-center"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <Share2 size={16} className="text-[#FF6B00]" />
                  <span className="text-xs uppercase tracking-wider font-bold text-[#FF6B00]">
                    Share Crag
                  </span>
                </div>
                <button onClick={() => setShowShareModal(false)} className="text-white/60 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{crag.name}</h3>
                <p className="text-xs text-white/70">{crag.province} · {crag.sectorCount} Sectors · {crag.problemCount} Routes</p>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-3.5 rounded-2xl mx-auto inline-block shadow-inner">
                <QRCodeSVG
                  value={typeof window !== "undefined" ? window.location.href : "https://jalur.world/crags"}
                  size={140}
                />
              </div>

              <div className="space-y-2 pt-1 text-left">
                {/* Copy URL Link Button */}
                <button
                  onClick={handleCopyCragUrl}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E5601F] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  {copiedUrl ? (
                    <>
                      <Check size={14} /> Link Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Crag URL Link
                    </>
                  )}
                </button>

                {/* Social Share Options */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${crag.name} on Jalur: ${typeof window !== "undefined" ? window.location.href : "https://jalur.world/crags"}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "https://jalur.world/crags")}&text=${encodeURIComponent(`Explore ${crag.name} climbing crags on Jalur!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-[#0088cc]/20 border border-[#0088cc]/40 text-[#0088cc] hover:bg-[#0088cc]/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL: MACRO ROCK TEXTURE DETAIL (Row 9 in Matrix)           */}
      {/* ============================================================ */}
      <AnimatePresence>
        {activeTextureModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTextureModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg popup-form-purple rounded-3xl p-6 border shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">Stone Typology</span>
                  <h3 className="font-bold text-base text-white">{stoneTypology.type}</h3>
                </div>
                <button onClick={() => setActiveTextureModal(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/20 shadow-inner max-h-[350px]">
                <img
                  src={stoneTypology.texturePhotoUrl || "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=1200&q=80"}
                  alt="High-res rock texture macro"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5 text-xs text-white/80 font-light">
                <p><strong>Texture Profile:</strong> {stoneTypology.texture}</p>
                <p><strong>Macro Characteristics:</strong> {stoneTypology.macroDescription || "Natural rock grain showing micro-crystals, friction edges, and finger holds."}</p>
                <p className="text-[11px] text-[#06B6D4] pt-1">
                  💡 <em>Preservation Note:</em> {stoneTypology.ethics || "Brush off chalk tick marks with soft boar-hair bristles before leaving."}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODAL: ALL PHOTOS GALLERY (Row 6 in Matrix)                  */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showAllPhotosModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllPhotosModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-2xl popup-form-purple rounded-3xl p-6 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-bold text-base text-white">{crag.name} — Photo Gallery</h3>
                  <p className="text-xs text-white/70">Scenery, sectors, and climbing atmosphere</p>
                </div>
                <button onClick={() => setShowAllPhotosModal(false)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cragPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentSlideIndex(idx);
                      setShowAllPhotosModal(false);
                    }}
                    className="rounded-2xl overflow-hidden h-44 border border-white/15 cursor-pointer group relative"
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-md bg-black/70 text-white font-mono">
                      Photo #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trip & Rent Modals */}
      <OpenTripModal isOpen={showOpenTrip} crag={crag} onClose={() => setShowOpenTrip(false)} />
      <BookTripModal isOpen={showBookTrip} crag={crag} onClose={() => setShowBookTrip(false)} />
      <RentEquipmentModal isOpen={showRentEquip} crag={crag} onClose={() => setShowRentEquip(false)} />

      {/* Problem Detail Sheet (10 Poin Spesifikasi & Topo) */}
      {selectedProblem && (
        <ProblemSheet
          problem={selectedProblem}
          onLogAscent={() => {
            if (!canLogAscent(role)) {
              openAuthModal("Please sign in to log your ascent.");
            } else {
              setShowLogModal(true);
            }
          }}
          onSetNewRoute={() => {
            if (canCreateCragRoute(role)) {
              setShowAddRouteModal(true);
            } else {
              openAuthModal("Please sign in or request setter role to add new routes.");
            }
          }}
          onClose={() => setSelectedProblem(null)}
        />
      )}

      {/* Log Ascent Modal (Submit Sent) */}
      {showLogModal && selectedProblem && (
        <LogAscentModal
          problemName={selectedProblem.name}
          grade={selectedProblem.grade}
          fontGrade={selectedProblem.fontGrade}
          setter={selectedProblem.setter}
          location={`${crag.name} · ${selectedProblem.sectorName || "Sector"}`}
          provinceCountry={crag.province ? `${crag.province}, ID` : "Jawa Barat, ID"}
          defaultImageUrl={selectedProblem.imageUrl}
          markers={selectedProblem.markers}
          problemId={selectedProblem.id}
          discipline={selectedProblem.discipline}
          wallHeight={selectedProblem.height || selectedProblem.totalHeight}
          boltsCount={selectedProblem.boltCount ? `${selectedProblem.boltCount} Bolts` : selectedProblem.padRecommendation}
          onClose={() => setShowLogModal(false)}
          onSubmit={(data) => {
            const saved = saveUserAscent({
              userId: user?.id || "user-1",
              problemId: selectedProblem.id,
              problemName: selectedProblem.name,
              grade: data.gradeVote || selectedProblem.grade,
              fontGrade: selectedProblem.fontGrade,
              setter: selectedProblem.setter,
              location: `${crag.name} · ${selectedProblem.sectorName || "Sector"}`,
              provinceCountry: data.provinceCountry || (crag.province ? `${crag.province}, ID` : "Jawa Barat, ID"),
              ascentType: data.type,
              gradeVote: data.gradeVote,
              note: data.note,
              photoUrl: data.photoUrl,
              videoUrl: data.videoUrl,
              markers: selectedProblem.markers || [],
              discipline: selectedProblem.discipline,
              climberName: data.climberName || user?.name || "Ahmad Rizki Nugraha",
              attempts: data.attempts,
              duration: data.duration,
              belayer: data.belayer,
              photographer: data.photographer,
              wallAngle: data.wallAngle,
              wallHeight: data.wallHeight,
              boltsCount: data.boltsCount,
              time: data.time,
              date: data.date,
            });
            setShowLogModal(false);
            setActiveShareAscent(saved);
          }}
        />
      )}

      {/* Ascent Share Modal (Official Send Card) */}
      {activeShareAscent && (
        <AscentShareModal
          ascent={activeShareAscent}
          onClose={() => setActiveShareAscent(null)}
          onViewPersonalBetaBook={() => {
            setActiveShareAscent(null);
            router.push("/beta");
          }}
        />
      )}

      {/* Add New Route Modal (Set New Route) */}
      {showAddRouteModal && (
        <AddRouteModal
          initialRegionId={crag.id}
          regionsList={cragRegions}
          onClose={() => setShowAddRouteModal(false)}
          onAddRoute={async (newRoute, regionId, sectorId, newRegionData, newSectorData) => {
            setShowAddRouteModal(false);

            setCragRegions((prev) => {
              if (newRegionData) {
                const newReg: CragRegion = {
                  id: newRegionData.id,
                  name: newRegionData.name,
                  province: newRegionData.province,
                  image: newRegionData.image || newRoute.imageUrl || "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80",
                  sectorCount: 1,
                  problemCount: 1,
                  sectors: [
                    {
                      id: sectorId,
                      name: newSectorData?.name || "Sector 1",
                      image: newSectorData?.image || newRoute.imageUrl || "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80",
                      problems: [newRoute],
                    },
                  ],
                };
                return [newReg, ...prev];
              }

              return prev.map((r) => {
                if (r.id !== regionId && !r.aliases?.includes(regionId)) return r;
                let sectors = [...r.sectors];
                const secIndex = sectors.findIndex((s) => s.id === sectorId);
                if (secIndex >= 0) {
                  sectors[secIndex] = {
                    ...sectors[secIndex],
                    problems: [newRoute, ...sectors[secIndex].problems],
                  };
                } else {
                  sectors = [
                    {
                      id: sectorId,
                      name: newSectorData?.name || "Sector 1",
                      image: newSectorData?.image || newRoute.imageUrl || r.image,
                      problems: [newRoute],
                    },
                    ...sectors,
                  ];
                }
                return {
                  ...r,
                  sectorCount: sectors.length,
                  problemCount: (r.problemCount || 0) + 1,
                  sectors,
                };
              });
            });

            try {
              if (newRegionData) {
                await insertCragRegion({
                  id: newRegionData.id,
                  name: newRegionData.name,
                  province: newRegionData.province,
                  image: newRegionData.image || newRoute.imageUrl,
                });
              }
              if (newSectorData || newRegionData) {
                await insertSector({
                  id: sectorId,
                  cragId: regionId,
                  name: newSectorData?.name || "Sector 1",
                  image: newSectorData?.image || newRoute.imageUrl,
                });
              }
              await insertRoute({
                sectorId,
                name: newRoute.name,
                discipline: newRoute.discipline || "bouldering",
                grade: newRoute.grade,
                fontGrade: newRoute.fontGrade,
                setter: newRoute.setter,
                fa: newRoute.fa,
                faDate: newRoute.faDate,
                description: newRoute.description,
                imageUrl: newRoute.imageUrl,
                accessInfo: newRoute.accessInfo,
                localContact: newRoute.localContact,
                markers: newRoute.markers,
                pitchLength: newRoute.pitchLength,
                boltCount: newRoute.boltCount,
                anchorType: newRoute.anchorType,
                totalPitches: newRoute.totalPitches,
                totalHeight: newRoute.totalHeight,
                pitchBreakdown: newRoute.pitchBreakdown,
                descentInfo: newRoute.descentInfo,
                padRecommendation: newRoute.padRecommendation,
                landingQuality: newRoute.landingQuality,
                startType: newRoute.startType,
              });
            } catch (err) {
              console.error("Failed to persist route to database:", err);
            }
          }}
        />
      )}
    </div>
  );
}
