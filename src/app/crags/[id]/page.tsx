"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  ExternalLink,
  Navigation,
  Phone,
  CloudSun,
  Layers,
  Compass,
  Calendar,
  ChevronRight,
  Info,
  Car,
  Clock,
  CheckCircle2,
  Camera,
  Heart,
  LayoutGrid,
  List as ListIcon,
  GalleryHorizontal,
} from "lucide-react";
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

export default function CragDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cragRegions, setCragRegions, loading } = useCragRegions();
  const { theme } = useTheme();
  const isSandstone = theme === "sandstone";
  const { role, user, openAuthModal } = useAuth();

  const [problemsViewMode, setProblemsViewMode] = useState<"thumbnail" | "list" | "slide">("thumbnail");
  const [isCragWishlisted, setIsCragWishlisted] = useState(false);

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

  // Modals state
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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<"all" | "boulder" | "lead" | "trad">("all");
  const [activeSectorId, setActiveSectorId] = useState<string>("all");

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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-lime text-granite shadow-lime-glow-sm hover:bg-lime-dim transition-all"
          >
            <ChevronLeft size={16} /> Back to Crags Directory
          </Link>
        </div>
      </div>
    );
  }

  // Filter problems across sectors
  const allProblems = (crag.sectors || []).flatMap((s) => (s.problems || []).map((p) => ({ ...p, sectorName: s.name || '' })));
  const filteredProblems = allProblems.filter((p) => {
    const matchCategory =
      selectedCategoryFilter === "all" ||
      (selectedCategoryFilter === "boulder" && (p.category === "boulder" || p.discipline === "bouldering")) ||
      (selectedCategoryFilter === "lead" && (p.category === "lead" || p.discipline === "sport")) ||
      (selectedCategoryFilter === "trad" && (p.category === "trad" || p.discipline === "multipitch"));

    const matchSector = activeSectorId === "all" || (crag.sectors || []).find((s) => s.id === activeSectorId)?.problems?.some((pr) => pr.id === p.id);

    return matchCategory && matchSector;
  });

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
    ];
    fallbackPhotos.forEach((p) => {
      if (list.length < 4 && !list.includes(p)) list.push(p);
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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-28 pt-2">
      {/* 1-Step Back Navigation Header */}
      <div className="flex items-center justify-between gap-3 pt-1 pb-2">
        <Link
          href="/crags"
          className={`flex items-center gap-1.5 py-1 -ml-1 group text-left transition-opacity hover:opacity-75 active:opacity-60 min-w-0 ${
            isSandstone ? "text-[#1a1815]" : "text-chalk"
          }`}
        >
          <ChevronLeft size={20} className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm sm:text-base font-light tracking-wide truncate">
            Crags
          </span>
        </Link>
      </div>

      {/* 1. Judul crags naik ke atas & Save to Wishlist Button */}
      <div className="space-y-1 pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight ${
              isSandstone ? "text-[#1a1815]" : "text-chalk"
            }`}
          >
            {crag.name}
          </h1>

          <button
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white transition-all shadow-sm"
          >
            <Heart size={14} className={isCragWishlisted ? "fill-[#FF6B00]" : ""} />
            <span>{isCragWishlisted ? "Saved to Wishlist" : "Save to Wishlist"}</span>
          </button>
        </div>

        <div
          className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium ${
            isSandstone ? "text-[#1a1815]/75" : "text-slate-ash"
          }`}
        >
          <MapPin size={13} className={isSandstone ? "text-[#1a1815]" : "text-[#FF6B00]"} />
          <span>{crag.province}</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="space-y-5">
        {/* ============================================================ */}
        {/* 3. FOTO DIBIKIN FULL FRAME + SLIDESHOW / SWIPE PHOTOS       */}
        {/* ============================================================ */}
        <div
          className="-mx-4 sm:-mx-6 lg:-mx-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] rounded-none h-72 sm:h-96 md:h-[420px] relative overflow-hidden shadow-md select-none touch-pan-y"
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
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${cragPhotos[currentSlideIndex]})` }}
            />
          </AnimatePresence>

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 pointer-events-none" />

          {/* Previous / Next Chevron Buttons */}
          {cragPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setCurrentSlideIndex((prev) => (prev - 1 + cragPhotos.length) % cragPhotos.length)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all z-10"
                aria-label="Previous photo"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentSlideIndex((prev) => (prev + 1) % cragPhotos.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all z-10"
                aria-label="Next photo"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Pagination indicator pill */}
          <div className="absolute bottom-3 right-4 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium flex items-center gap-1.5 z-10">
            <Camera size={11} className="text-lime" />
            <span>
              {currentSlideIndex + 1} / {cragPhotos.length}
            </span>
          </div>

          {/* Bottom dots */}
          {cragPhotos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {cragPhotos.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentSlideIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 5. Informasi 'sector' dan 'verified routes' geser ke bawah */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div
              className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
                isSandstone
                  ? "bg-[#f4efe6] border-[#1a1815]/15 text-[#1a1815]"
                  : "bg-[#1a1f24] border-white/10 text-chalk"
              }`}
            >
              <span className="text-base font-bold font-mono text-lime">
                {crag.sectorCount}
              </span>
              <span className={`text-xs ${isSandstone ? "text-[#1a1815]/70" : "text-slate-ash"}`}>
                Sectors
              </span>
            </div>

            <div
              className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
                isSandstone
                  ? "bg-[#f4efe6] border-[#1a1815]/15 text-[#1a1815]"
                  : "bg-[#1a1f24] border-white/10 text-chalk"
              }`}
            >
              <span className="text-base font-bold font-mono text-cyan-climb">
                {crag.problemCount}
              </span>
              <span className={`text-xs ${isSandstone ? "text-[#1a1815]/70" : "text-slate-ash"}`}>
                Verified Routes
              </span>
            </div>
          </div>

          {crag.description && (
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isSandstone ? "text-[#1a1815]/80" : "text-slate-ash"
              }`}
            >
              {crag.description}
            </p>
          )}
        </div>

        {/* ============================================================ */}
        {/* 7 INFORMASI DETAIL KAWASAN CRAG                              */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. PETA LOKASI + LINK GMAPS */}
          <div
            className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#1a1f24] border-white/10"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <MapPin size={16} className={isSandstone ? "text-[#1a1815]" : "text-lime"} />
                  Area Location Map
                </h3>
                {crag.coordinates && (
                  <span className="font-mono text-[11px] opacity-60">
                    {crag.coordinates.lat}, {crag.coordinates.lng}
                  </span>
                )}
              </div>
              <p className="text-xs opacity-75 font-light leading-relaxed">
                Official coordinates for {crag.name}. Use Google Maps navigation for direct driving and approach directions.
              </p>
            </div>

            {/* Google Maps Link Button */}
            {crag.gmapsUrl && (
              <a
                href={crag.gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all touch-ripple ${
                  isSandstone
                    ? "bg-[#1a1815] text-[#ded3be] border-[#1a1815] hover:opacity-90"
                    : "bg-cyan-climb text-granite border-cyan-climb hover:bg-cyan-climb/90"
                }`}
              >
                <ExternalLink size={15} />
                <span>Open in Google Maps &rarr;</span>
              </a>
            )}
          </div>

          {/* HOW TO GET THERE */}
          <div
            className={`p-5 rounded-3xl border space-y-3 ${
              isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#1a1f24] border-white/10"
            }`}
          >
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Car size={16} className={isSandstone ? "text-[#1a1815]" : "text-cyan-climb"} />
              How to Get There (Access Guide)
            </h3>
            {crag.howToGetThere ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="font-bold block opacity-85">Driving Route & Vehicle Access:</span>
                  <p className="opacity-75 font-light leading-relaxed">{crag.howToGetThere.driveInfo}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className={`p-2.5 rounded-xl border ${
                    isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                  }`}>
                    <span className="font-bold block text-[10px] opacity-70">Hike-In Approach</span>
                    <span className="font-semibold">{crag.howToGetThere.hikeDuration}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${
                    isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                  }`}>
                    <span className="font-bold block text-[10px] opacity-70">Parking Info</span>
                    <span className="font-semibold">{crag.howToGetThere.parkingInfo}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs opacity-75">Detailed driving and approach directions can be confirmed with the basecamp coordinator.</p>
            )}
          </div>

          {/* WHO TO CONTACT */}
          <div
            className={`p-5 rounded-3xl border space-y-3 ${
              isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#1a1f24] border-white/10"
            }`}
          >
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Phone size={16} className={isSandstone ? "text-[#1a1815]" : "text-lime"} />
              Who to Contact (Management & Local Guides)
            </h3>
            {crag.whoToContact ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="font-bold text-sm">{crag.whoToContact.name}</div>
                  <div className="opacity-70 text-[11px] font-light">{crag.whoToContact.role}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold opacity-90">{crag.whoToContact.basecampName}</div>
                  {crag.whoToContact.basecampAddress && (
                    <div className="opacity-70 font-light text-[11px]">{crag.whoToContact.basecampAddress}</div>
                  )}
                </div>
                {crag.whoToContact.phone && (
                  <a
                    href={`https://wa.me/${String(crag.whoToContact.phone).replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                      isSandstone
                        ? "border-[#1a1815]/20 hover:border-[#1a1815] text-[#1a1815]"
                        : "border-white/20 hover:border-lime text-chalk"
                    }`}
                  >
                    <Phone size={13} /> Contact Manager ({crag.whoToContact.phone})
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs opacity-75">Local basecamp coordinator contact.</p>
            )}
          </div>

          {/* JENIS BATUAN */}
          <div
            className={`p-5 rounded-3xl border space-y-3 ${
              isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#1a1f24] border-white/10"
            }`}
          >
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Layers size={16} className={isSandstone ? "text-[#1a1815]" : "text-cyan-climb"} />
              Rock Type & Wall Characteristics
            </h3>
            {crag.rockType ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="font-bold block opacity-85">Rock Type:</span>
                  <span className="font-semibold text-sm">{crag.rockType.type}</span>
                </div>
                <div>
                  <span className="font-bold block opacity-85">Texture & Hold Features:</span>
                  <p className="opacity-75 font-light leading-relaxed">{crag.rockType.texture}</p>
                </div>
                {crag.rockType.ethics && (
                  <div className={`p-2.5 rounded-xl border ${
                    isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                  }`}>
                    <span className="font-bold block text-[10px] opacity-70">Rock Preservation & Ethics</span>
                    <p className="opacity-75 font-light text-[11px] leading-relaxed">{crag.rockType.ethics}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs opacity-75">Rock characteristics and wall formation information.</p>
            )}
          </div>

          {/* PERKIRAAN CUACA */}
          <div
            className={`p-5 rounded-3xl border space-y-3 md:col-span-2 ${
              isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#1a1f24] border-white/10"
            }`}
          >
            <h3 className="font-bold text-sm flex items-center gap-2">
              <CloudSun size={16} className={isSandstone ? "text-[#1a1815]" : "text-lime"} />
              Weather Forecast & Best Season
            </h3>
            {crag.weatherForecast ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-2xl border ${
                  isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                }`}>
                  <span className="font-bold block text-[10px] opacity-70">Conditions & Avg Temp</span>
                  <div className="font-bold text-sm mt-0.5">{crag.weatherForecast.condition}</div>
                  <div className="opacity-70">{crag.weatherForecast.tempAvg}</div>
                </div>
                <div className={`p-3 rounded-2xl border ${
                  isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                }`}>
                  <span className="font-bold block text-[10px] opacity-70">Best Season</span>
                  <div className="font-bold text-xs mt-0.5 text-lime">{crag.weatherForecast.bestSeason}</div>
                </div>
                <div className={`p-3 rounded-2xl border ${
                  isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                }`}>
                  <span className="font-bold block text-[10px] opacity-70">Rainy Season Notes</span>
                  <p className="opacity-75 font-light text-[11px] mt-0.5 leading-relaxed">
                    {crag.weatherForecast.rainNotes || "Climbing sheltered overhangs is recommended during light showers."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs opacity-75">Crag weather forecast and conditions.</p>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6. CLIMBING SECTORS                                          */}
        {/* ============================================================ */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
              <Layers size={18} className={isSandstone ? "text-[#1a1815]" : "text-cyan-climb"} />
              Climbing Sectors ({(crag.sectors || []).length} Sectors)
            </h3>
            <span className="text-xs opacity-60">Select a sector to filter routes</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* All Sectors Option */}
            <div
              onClick={() => setActiveSectorId("all")}
              className={`rounded-2xl border cursor-pointer transition-all overflow-hidden flex flex-col justify-between p-3.5 ${
                activeSectorId === "all"
                  ? isSandstone
                    ? "border-[#1a1815] bg-[#1a1815] text-[#ded3be]"
                    : "border-[#FF6B00] ring-1 ring-[#FF6B00] bg-[#FF6B00]/10 text-white"
                  : isSandstone
                  ? "border-[#1a1815]/15 bg-[#f4efe6] text-[#1a1815]"
                  : "border-white/10 bg-[#1a1f24] text-chalk hover:border-[#FF6B00]/40"
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
        </div>

        {/* ============================================================ */}
        {/* 7. PROBLEMS (Route Breakdown per Sector)                    */}
        {/* ============================================================ */}
        <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base md:text-xl flex items-center gap-2">
                <Compass size={18} className="text-[#FF6B00]" />
                Problems & Climbing Routes
                <span className="text-xs font-light opacity-65">({filteredProblems.length} routes)</span>
              </h3>
              <p className="text-xs opacity-75 font-light">
                Select any route to view high-res topo lines, technical specs, and beta videos.
              </p>
            </div>

            {/* Controls: Category Filter + View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {(["all", "boulder", "lead", "trad"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border ${
                      selectedCategoryFilter === cat
                        ? "bg-[#FF6B00] text-white border-[#FF6B00]"
                        : isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815]/70"
                        : "bg-transparent border-white/10 text-slate-ash hover:text-chalk"
                    }`}
                  >
                    {cat === "all" ? "All" : cat}
                  </button>
                ))}
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-black/20 dark:bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setProblemsViewMode("thumbnail")}
                  title="Thumbnail View"
                  className={`p-1.5 rounded-lg transition-all ${
                    problemsViewMode === "thumbnail"
                      ? "bg-[#FF6B00] text-white shadow-sm"
                      : "opacity-60 hover:opacity-100 text-chalk"
                  }`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setProblemsViewMode("list")}
                  title="List View"
                  className={`p-1.5 rounded-lg transition-all ${
                    problemsViewMode === "list"
                      ? "bg-[#FF6B00] text-white shadow-sm"
                      : "opacity-60 hover:opacity-100 text-chalk"
                  }`}
                >
                  <ListIcon size={15} />
                </button>
                <button
                  onClick={() => setProblemsViewMode("slide")}
                  title="Slide View"
                  className={`p-1.5 rounded-lg transition-all ${
                    problemsViewMode === "slide"
                      ? "bg-[#FF6B00] text-white shadow-sm"
                      : "opacity-60 hover:opacity-100 text-chalk"
                  }`}
                >
                  <GalleryHorizontal size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Render Problems based on View Mode */}
          {problemsViewMode === "slide" ? (
            /* Slide View (Horizontal Carousel) */
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar">
              {filteredProblems.map((p) => {
                const category = p.category || (p.discipline === "bouldering" ? "boulder" : "lead");
                const routeImg = p.imageUrl || crag.image || "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80";
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProblem(p)}
                    className="min-w-[280px] sm:min-w-[320px] snap-center rounded-2xl border border-white/10 bg-[#1a1f24] overflow-hidden cursor-pointer group hover:border-[#FF6B00]/50 transition-all shadow-md flex flex-col justify-between"
                  >
                    <div className="h-44 w-full relative overflow-hidden bg-black/40">
                      <img
                        src={routeImg}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#FF6B00] border border-[#FF6B00]/40">
                          {category}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-white border border-white/20">
                        {p.grade}{p.fontGrade ? ` (${p.fontGrade})` : ""}
                      </div>
                    </div>
                    <div className="p-3.5 space-y-2">
                      <div>
                        <h4 className="font-bold text-base text-chalk group-hover:text-[#FF6B00] transition-colors">{p.name}</h4>
                        <div className="text-[11px] opacity-65 font-light">{p.sectorName || "Crag"} · Setter: {p.setterYear || p.setter}</div>
                      </div>
                      <p className="text-xs opacity-75 font-light line-clamp-2 leading-relaxed">{p.description}</p>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
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
                    className="p-2.5 rounded-2xl border border-white/10 bg-[#1a1f24] hover:border-[#FF6B00]/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-black/30 border border-white/10">
                        <img src={routeImg} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-chalk truncate group-hover:text-[#FF6B00] transition-colors">{p.name}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-white/70">{category}</span>
                        </div>
                        <div className="text-[11px] opacity-60 font-light truncate mt-0.5">
                          {p.sectorName || "Crag"} · {p.height || "4m"} · {p.holdsCount || 12} holds
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-chalk">
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
                    className="rounded-2xl border border-white/10 bg-[#1a1f24] hover:border-[#FF6B00]/40 transition-all cursor-pointer overflow-hidden group flex flex-col justify-between shadow-sm"
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
                      <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
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
        </div>
      </div>

      {/* Crags CTA Modals */}
      <OpenTripModal
        isOpen={showOpenTrip}
        crag={crag}
        onClose={() => setShowOpenTrip(false)}
      />

      <BookTripModal
        isOpen={showBookTrip}
        crag={crag}
        onClose={() => setShowBookTrip(false)}
      />

      <RentEquipmentModal
        isOpen={showRentEquip}
        crag={crag}
        onClose={() => setShowRentEquip(false)}
      />

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
          location={`${crag.name} · ${selectedProblem.sectorName || 'Sector'}`}
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
              location: `${crag.name} · ${selectedProblem.sectorName || 'Sector'}`,
              provinceCountry: data.provinceCountry || (crag.province ? `${crag.province}, ID` : "Jawa Barat, ID"),
              ascentType: data.type,
              gradeVote: data.gradeVote,
              note: data.note,
              photoUrl: data.photoUrl,
              videoUrl: data.videoUrl,
              markers: selectedProblem.markers || [],
              discipline: selectedProblem.discipline,
              climberName: data.climberName || user?.name || "Arief Lala Hakiem",
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

            // Optimistic update of cragRegions
            setCragRegions((prev) => {
              if (newRegionData) {
                const newReg: CragRegion = {
                  id: newRegionData.id,
                  name: newRegionData.name,
                  province: newRegionData.province,
                  image: newRegionData.image || newRoute.imageUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
                  sectorCount: 1,
                  problemCount: 1,
                  sectors: [
                    {
                      id: sectorId,
                      name: newSectorData?.name || 'Sector 1',
                      image: newSectorData?.image || newRoute.imageUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80',
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
                      name: newSectorData?.name || 'Sector 1',
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

            // Persist to Supabase in background
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
                  name: newSectorData?.name || 'Sector 1',
                  image: newSectorData?.image || newRoute.imageUrl,
                });
              }
              await insertRoute({
                sectorId,
                name: newRoute.name,
                discipline: newRoute.discipline || 'bouldering',
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
              console.error('Failed to persist route to database:', err);
            }
          }}
        />
      )}
    </div>
  );
}
