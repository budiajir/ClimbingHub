"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useCragRegions } from "@/lib/use-data";
import { useTheme } from "@/lib/theme-context";
import { Problem, Sector } from "@/lib/mock-data";
import OpenTripModal from "@/components/crag/OpenTripModal";
import BookTripModal from "@/components/crag/BookTripModal";
import RentEquipmentModal from "@/components/crag/RentEquipmentModal";
import ProblemSheet from "@/components/beta/ProblemSheet";
import LogAscentModal from "@/components/beta/LogAscentModal";
import AscentShareModal from "@/components/beta/AscentShareModal";
import AddRouteModal from "@/components/beta/AddRouteModal";
import { UserAscent, saveUserAscent } from "@/lib/user-ascents";
import { useAuth } from "@/lib/auth-context";
import { canLogAscent, canCreateCragRoute } from "@/lib/permissions";
import Pictogram from "@/components/common/Pictogram";

export default function CragDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cragRegions, loading } = useCragRegions();
  const { theme } = useTheme();
  const isSandstone = theme === "sandstone";
  const { role, user, openAuthModal } = useAuth();

  const crag = cragRegions.find(
    (c) => c.id.toLowerCase() === String(params.id).toLowerCase()
  );

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-light opacity-75">Memuat informasi kawasan tebing...</p>
      </div>
    );
  }

  if (!crag) return notFound();

  // Filter problems across sectors
  const allProblems = crag.sectors.flatMap((s) => s.problems.map((p) => ({ ...p, sectorName: s.name })));
  const filteredProblems = allProblems.filter((p) => {
    const matchCategory =
      selectedCategoryFilter === "all" ||
      (selectedCategoryFilter === "boulder" && (p.category === "boulder" || p.discipline === "bouldering")) ||
      (selectedCategoryFilter === "lead" && (p.category === "lead" || p.discipline === "sport")) ||
      (selectedCategoryFilter === "trad" && (p.category === "trad" || p.discipline === "multipitch"));

    const matchSector = activeSectorId === "all" || crag.sectors.find((s) => s.id === activeSectorId)?.problems.some((pr) => pr.id === p.id);

    return matchCategory && matchSector;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-28 pt-2">
      {/* Back Button */}
      <div className="py-2.5 mb-2">
        <Link
          href="/"
          className={`inline-flex items-center gap-1.5 text-xs font-light transition-colors ${
            isSandstone ? "text-[#1a1815]/70 hover:text-[#1a1815]" : "text-slate-ash hover:text-chalk"
          }`}
        >
          <ChevronLeft size={16} /> Kembali ke Direktori Kawasan
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="space-y-6">
        {/* ============================================================ */}
        {/* HERO BANNER & BASIC INFO                                     */}
        {/* ============================================================ */}
        <div className="relative rounded-3xl overflow-hidden h-64 sm:h-80 md:h-96 w-full border border-black/10 dark:border-white/10 shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${crag.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

          {/* Hero Overlay Text */}
          <div className="absolute bottom-5 left-5 right-5 z-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-lime/20 border border-lime/40 text-lime text-[11px] font-bold">
                  Kawasan Panjat Resmi
                </span>
                <span className="flex items-center gap-1 text-xs opacity-85">
                  <MapPin size={12} /> {crag.province}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                {crag.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 font-light line-clamp-2">
                {crag.description}
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="px-3 py-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-center">
                <div className="text-xs font-bold font-mono text-lime">{crag.sectorCount}</div>
                <div className="text-[10px] text-white/70">Sectors</div>
              </div>
              <div className="px-3 py-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-center">
                <div className="text-xs font-bold font-mono text-cyan-climb">{crag.problemCount}</div>
                <div className="text-[10px] text-white/70">Verified Routes</div>
              </div>
            </div>
          </div>
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
                  1. Peta Lokasi Kawasan
                </h3>
                {crag.coordinates && (
                  <span className="font-mono text-[11px] opacity-60">
                    {crag.coordinates.lat}, {crag.coordinates.lng}
                  </span>
                )}
              </div>
              <p className="text-xs opacity-75 font-light leading-relaxed">
                Titik koordinat resmi kawasan {crag.name}. Gunakan navigasi Google Maps untuk petunjuk arah langsung.
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
                <span>Buka di Google Maps &rarr;</span>
              </a>
            )}
          </div>

          {/* 2. HOW TO GET THERE */}
          <div
            className={`p-5 rounded-3xl border space-y-3 ${
              isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#1a1f24] border-white/10"
            }`}
          >
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Car size={16} className={isSandstone ? "text-[#1a1815]" : "text-cyan-climb"} />
              2. How to Get There (Panduan Akses)
            </h3>
            {crag.howToGetThere ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="font-bold block opacity-85">Rute & Akses Kendaraan:</span>
                  <p className="opacity-75 font-light leading-relaxed">{crag.howToGetThere.driveInfo}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className={`p-2.5 rounded-xl border ${
                    isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                  }`}>
                    <span className="font-bold block text-[10px] opacity-70">Jalan Kaki (Hike-In)</span>
                    <span className="font-semibold">{crag.howToGetThere.hikeDuration}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${
                    isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                  }`}>
                    <span className="font-bold block text-[10px] opacity-70">Parkir Kendaraan</span>
                    <span className="font-semibold">{crag.howToGetThere.parkingInfo}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs opacity-75">Informasi rute dapat ditanyakan ke pengelola basecamp.</p>
            )}
          </div>

          {/* 3. WHO TO CONTACT */}
          <div
            className={`p-5 rounded-3xl border space-y-3 ${
              isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#1a1f24] border-white/10"
            }`}
          >
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Phone size={16} className={isSandstone ? "text-[#1a1815]" : "text-lime"} />
              3. Who to Contact (Pengelola & Local Guide)
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
                <a
                  href={`https://wa.me/${crag.whoToContact.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                    isSandstone
                      ? "border-[#1a1815]/20 hover:border-[#1a1815] text-[#1a1815]"
                      : "border-white/20 hover:border-lime text-chalk"
                  }`}
                >
                  <Phone size={13} /> Kontak Pengelola ({crag.whoToContact.phone})
                </a>
              </div>
            ) : (
              <p className="text-xs opacity-75">Kontak pengelola basecamp lokal.</p>
            )}
          </div>

          {/* 4. JENIS BATUAN */}
          <div
            className={`p-5 rounded-3xl border space-y-3 ${
              isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#1a1f24] border-white/10"
            }`}
          >
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Layers size={16} className={isSandstone ? "text-[#1a1815]" : "text-cyan-climb"} />
              4. Jenis Batuan & Karakter Dinding
            </h3>
            {crag.rockType ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="font-bold block opacity-85">Tipe Batuan:</span>
                  <span className="font-semibold text-sm">{crag.rockType.type}</span>
                </div>
                <div>
                  <span className="font-bold block opacity-85">Tekstur & Bentuk Pegangan:</span>
                  <p className="opacity-75 font-light leading-relaxed">{crag.rockType.texture}</p>
                </div>
                {crag.rockType.ethics && (
                  <div className={`p-2.5 rounded-xl border ${
                    isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                  }`}>
                    <span className="font-bold block text-[10px] opacity-70">Etika Pemeliharaan Batuan</span>
                    <p className="opacity-75 font-light text-[11px] leading-relaxed">{crag.rockType.ethics}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs opacity-75">Informasi karakteristik batuan tebing.</p>
            )}
          </div>

          {/* 5. PERKIRAAN CUACA */}
          <div
            className={`p-5 rounded-3xl border space-y-3 md:col-span-2 ${
              isSandstone ? "bg-[#f4efe6] border-[#1a1815]/15" : "bg-[#1a1f24] border-white/10"
            }`}
          >
            <h3 className="font-bold text-sm flex items-center gap-2">
              <CloudSun size={16} className={isSandstone ? "text-[#1a1815]" : "text-lime"} />
              5. Perkiraan Cuaca & Rekomendasi Musim
            </h3>
            {crag.weatherForecast ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-2xl border ${
                  isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                }`}>
                  <span className="font-bold block text-[10px] opacity-70">Kondisi & Suhu Rata-rata</span>
                  <div className="font-bold text-sm mt-0.5">{crag.weatherForecast.condition}</div>
                  <div className="opacity-70">{crag.weatherForecast.tempAvg}</div>
                </div>
                <div className={`p-3 rounded-2xl border ${
                  isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                }`}>
                  <span className="font-bold block text-[10px] opacity-70">Musim Terbaik (Best Season)</span>
                  <div className="font-bold text-xs mt-0.5 text-lime">{crag.weatherForecast.bestSeason}</div>
                </div>
                <div className={`p-3 rounded-2xl border ${
                  isSandstone ? "border-black/10 bg-black/5" : "border-white/5 bg-white/5"
                }`}>
                  <span className="font-bold block text-[10px] opacity-70">Catatan Musim Hujan</span>
                  <p className="opacity-75 font-light text-[11px] mt-0.5 leading-relaxed">
                    {crag.weatherForecast.rainNotes || "Disarankan memanjat di area overhang saat gerimis."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs opacity-75">Perkiraan cuaca kawasan tebing.</p>
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
              6. Climbing Sectors ({crag.sectors.length} Sektor)
            </h3>
            <span className="text-xs opacity-60">Pilih sektor untuk memfilter jalur</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* All Sectors Option */}
            <div
              onClick={() => setActiveSectorId("all")}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                activeSectorId === "all"
                  ? isSandstone
                    ? "border-[#1a1815] bg-[#1a1815] text-[#ded3be]"
                    : "border-lime bg-lime/10 text-lime"
                  : isSandstone
                  ? "border-[#1a1815]/15 bg-[#f4efe6] text-[#1a1815]"
                  : "border-white/10 bg-[#1a1f24] text-chalk"
              }`}
            >
              <div>
                <div className="font-bold text-xs">Semua Sektor</div>
                <div className="text-[11px] opacity-75">{allProblems.length} Jalur Total</div>
              </div>
              <ChevronRight size={16} />
            </div>

            {crag.sectors.map((sector) => {
              const isSelected = activeSectorId === sector.id;
              return (
                <div
                  key={sector.id}
                  onClick={() => setActiveSectorId(sector.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? isSandstone
                        ? "border-[#1a1815] bg-[#1a1815] text-[#ded3be]"
                        : "border-lime bg-lime/10 text-lime"
                      : isSandstone
                      ? "border-[#1a1815]/15 bg-[#f4efe6] text-[#1a1815]"
                      : "border-white/10 bg-[#1a1f24] text-chalk"
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{sector.name}</div>
                    <div className="text-[11px] opacity-75">{sector.problems.length} Jalur</div>
                  </div>
                  <ChevronRight size={16} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 7. PROBLEMS (Fokus pada Jalur di Setiap Sektor)              */}
        {/* ============================================================ */}
        <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base md:text-xl flex items-center gap-2">
                <Compass size={18} className={isSandstone ? "text-[#1a1815]" : "text-lime"} />
                7. Problems & Jalur Pemanjatan
                <span className="text-xs font-light opacity-65">({filteredProblems.length} jalur)</span>
              </h3>
              <p className="text-xs opacity-75 font-light">
                Klik pada jalur untuk melihat detail 10 poin spesifikasi teknis, topo, dan video beta.
              </p>
            </div>

            {/* Category Filter Pills (Lead / Trad / Boulder) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {(["all", "boulder", "lead", "trad"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    selectedCategoryFilter === cat
                      ? isSandstone
                        ? "bg-[#1a1815] text-[#ded3be] border-[#1a1815]"
                        : "bg-lime text-granite border-lime"
                      : isSandstone
                      ? "bg-transparent border-[#1a1815]/20 text-[#1a1815]/70"
                      : "bg-transparent border-white/10 text-slate-ash hover:text-chalk"
                  }`}
                >
                  {cat === "all" ? "Semua Kategori" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProblems.map((p) => {
              const category = p.category || (p.discipline === "bouldering" ? "boulder" : "lead");
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProblem(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group touch-ripple ${
                    isSandstone
                      ? "bg-[#f4efe6] border-[#1a1815]/15 hover:border-[#1a1815]/50"
                      : "bg-[#1a1f24] border-white/10 hover:border-lime/40 shadow-sm"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          category === "boulder"
                            ? "bg-cyan-climb/10 border-cyan-climb/30 text-cyan-climb"
                            : category === "lead"
                            ? "bg-lime/10 border-lime/30 text-lime"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {category}
                      </span>
                      <span className="font-mono font-bold text-xs">
                        {p.grade} ({p.fontGrade})
                      </span>
                    </div>

                    <div>
                      <h4 className={`font-bold text-base transition-colors group-hover:underline ${
                        isSandstone ? "text-[#1a1815]" : "text-chalk"
                      }`}>
                        {p.name}
                      </h4>
                      <div className="text-[11px] opacity-65 font-light mt-0.5">
                        {p.sectorName || "Kawasan"} · Setter: {p.setterYear || p.setter}
                      </div>
                    </div>

                    <p className="text-xs opacity-75 font-light line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Route Quick Specs Footer */}
                  <div className="pt-3 mt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px]">
                    <span className="opacity-70">
                      Tinggi: <b className="opacity-100">{p.height || "4m"}</b> · Pegangan: <b className="opacity-100">{p.holdsCount || 12}</b>
                    </span>
                    <span className={`font-bold flex items-center gap-0.5 ${
                      isSandstone ? "text-[#1a1815]" : "text-lime"
                    }`}>
                      Lihat Topo &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
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
          onAddRoute={async (newRoute, regionId, sectorId) => {
            setShowAddRouteModal(false);
          }}
        />
      )}
    </div>
  );
}
