"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  CloudSun,
  Layers,
  Compass,
  ArrowRight,
  Sparkles,
  Car,
  Calendar,
  Phone,
  Package,
} from "lucide-react";
import { useCragRegions } from "@/lib/use-data";
import { useTheme } from "@/lib/theme-context";
import { CragRegion } from "@/lib/mock-data";
import OpenTripModal from "@/components/crag/OpenTripModal";
import BookTripModal from "@/components/crag/BookTripModal";
import RentEquipmentModal from "@/components/crag/RentEquipmentModal";
import Pictogram from "@/components/common/Pictogram";

export default function CragsDirectoryPage() {
  const { cragRegions, loading } = useCragRegions();
  const { theme } = useTheme();
  const isSandstone = theme === "sandstone";

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedRockType, setSelectedRockType] = useState<string>("all");

  // Modal states for CTAs
  const [activeModalCrag, setActiveModalCrag] = useState<CragRegion | null>(null);
  const [showOpenTrip, setShowOpenTrip] = useState(false);
  const [showBookTrip, setShowBookTrip] = useState(false);
  const [showRentEquip, setShowRentEquip] = useState(false);

  // Derive unique provinces
  const provinces = useMemo(() => {
    const set = new Set<string>();
    cragRegions.forEach((c) => {
      if (c.province) set.add(c.province);
    });
    return Array.from(set);
  }, [cragRegions]);

  // Filtered crags
  const filteredCrags = useMemo(() => {
    return cragRegions.filter((crag) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        crag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crag.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crag.rockType?.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crag.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProvince =
        selectedProvince === "all" || crag.province === selectedProvince;

      const matchRockType =
        selectedRockType === "all" ||
        (crag.rockType?.type &&
          crag.rockType.type
            .toLowerCase()
            .includes(selectedRockType.toLowerCase()));

      return matchSearch && matchProvince && matchRockType;
    });
  }, [cragRegions, searchQuery, selectedProvince, selectedRockType]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-28 pt-4">
      {/* Header Section */}
      <div className="py-2 md:py-6">
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight ${
            isSandstone ? "text-[#1a1815]" : "text-chalk"
          }`}
        >
          Crags
        </h1>

        <p
          className={`text-sm md:text-base font-light max-w-2xl mt-1.5 leading-relaxed ${
            isSandstone ? "text-[#1a1815]/75" : "text-slate-ash"
          }`}
        >
          Informasi komprehensif mengenai daerah tebing alam Indonesia: peta lokasi,
          panduan akses, kontak juru kunci, jenis batuan, prakiraan cuaca, sektor, dan jalur pemanjatan.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3 mb-8">
        {/* Search input */}
        <div className="relative">
          <Search
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isSandstone ? "text-[#1a1815]/40" : "text-slate-ash"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kawasan tebing, lokasi, atau jenis batuan..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs md:text-sm border outline-none transition-all ${
              isSandstone
                ? "bg-white/80 border-[#1a1815]/20 text-[#1a1815] placeholder:text-[#1a1815]/40 focus:border-[#1a1815]"
                : "bg-crag border-white/10 text-chalk placeholder:text-white/40 focus:border-lime/50"
            }`}
          />
        </div>

        {/* Filters: Province & Rock Type */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* Province Filter */}
          <button
            onClick={() => setSelectedProvince("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              selectedProvince === "all"
                ? isSandstone
                  ? "bg-[#1a1815] text-white border-[#1a1815] font-bold"
                  : "bg-lime text-granite border-lime font-bold"
                : isSandstone
                ? "bg-white/60 border-[#1a1815]/15 text-[#1a1815]/70 hover:text-[#1a1815]"
                : "bg-crag border-white/10 text-slate-ash hover:text-chalk"
            }`}
          >
            Semua Provinsi
          </button>
          {provinces.map((prov) => (
            <button
              key={prov}
              onClick={() => setSelectedProvince(prov)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedProvince === prov
                  ? isSandstone
                    ? "bg-[#1a1815] text-white border-[#1a1815] font-bold"
                    : "bg-lime text-granite border-lime font-bold"
                  : isSandstone
                  ? "bg-white/60 border-[#1a1815]/15 text-[#1a1815]/70 hover:text-[#1a1815]"
                  : "bg-crag border-white/10 text-slate-ash hover:text-chalk"
              }`}
            >
              {prov}
            </button>
          ))}

          <span
            className={`h-4 w-px mx-1 ${
              isSandstone ? "bg-[#1a1815]/20" : "bg-white/20"
            }`}
          />

          {/* Rock Type Filter */}
          {["all", "limestone", "granit", "andesit"].map((rock) => (
            <button
              key={rock}
              onClick={() => setSelectedRockType(rock)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap capitalize transition-all border ${
                selectedRockType === rock
                  ? isSandstone
                    ? "bg-[#1a1815] text-white border-[#1a1815] font-bold"
                    : "bg-cyan-500 text-white border-cyan-500 font-bold"
                  : isSandstone
                  ? "bg-white/60 border-[#1a1815]/15 text-[#1a1815]/70 hover:text-[#1a1815]"
                  : "bg-crag border-white/10 text-slate-ash hover:text-chalk"
              }`}
            >
              {rock === "all" ? "Semua Batuan" : rock}
            </button>
          ))}
        </div>
      </div>

      {/* Crags Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-light opacity-70">Memuat direktori kawasan tebing...</p>
        </div>
      ) : filteredCrags.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border ${
            isSandstone ? "bg-white/50 border-[#1a1815]/15" : "bg-crag border-white/10"
          }`}
        >
          <Pictogram name="crag" size={36} className="mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-base mb-1">Tidak ada kawasan tebing ditemukan</h3>
          <p className="text-xs opacity-70 mb-4">
            Coba ganti filter pencarian provinsi atau jenis batuan Anda.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedProvince("all");
              setSelectedRockType("all");
            }}
            className={`text-xs px-4 py-2 rounded-xl font-bold transition-colors ${
              isSandstone ? "bg-[#1a1815] text-white" : "bg-lime text-granite"
            }`}
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCrags.map((crag) => (
            <div
              key={crag.id}
              className={`rounded-3xl overflow-hidden border flex flex-col justify-between transition-all group ${
                isSandstone
                  ? "bg-white/80 border-[#1a1815]/15 hover:border-[#1a1815]/40 shadow-sm"
                  : "bg-crag/80 border-white/10 hover:border-lime/40"
              }`}
            >
              <div>
                {/* Image Banner */}
                <Link href={`/crags/${crag.id}`} className="block relative h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${crag.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Province Tag */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-white font-medium flex items-center gap-1">
                    <MapPin size={11} className="text-lime" />
                    <span>{crag.province}</span>
                  </div>

                  {/* Sector & Problem Count */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-white font-bold border border-white/15">
                      {crag.sectorCount} Sektor
                    </span>
                    <span className="bg-lime/90 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-mono text-granite font-bold">
                      {crag.problemCount} Jalur
                    </span>
                  </div>

                  {/* Title & Rock Type overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h2 className="text-xl font-bold leading-tight group-hover:text-lime transition-colors">
                      {crag.name}
                    </h2>
                    <p className="text-[11px] text-white/80 font-light mt-0.5 flex items-center gap-2">
                      <span>Batuan: {crag.rockType?.type || "Limestone / Karst"}</span>
                      {crag.weatherForecast && (
                        <span>· {crag.weatherForecast.tempAvg}</span>
                      )}
                    </p>
                  </div>
                </Link>

                {/* Crag Content Details */}
                <div className="p-4 space-y-3">
                  <p
                    className={`text-xs leading-relaxed line-clamp-2 ${
                      isSandstone ? "text-[#1a1815]/80" : "text-slate-ash"
                    }`}
                  >
                    {crag.description ||
                      "Kawasan panjat tebing alami dengan ragam sektor sport climbing, multipitch, dan bouldering."}
                  </p>

                  {/* Quick specs pill row */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div
                      className={`p-2 rounded-xl border ${
                        isSandstone
                          ? "bg-[#1a1815]/5 border-[#1a1815]/10"
                          : "bg-granite border-white/5"
                      }`}
                    >
                      <span className="block text-[9px] uppercase opacity-60">Akses Lokasi</span>
                      <span className="font-medium truncate block">
                        {crag.howToGetThere?.hikeDuration || "15m jalan kaki"}
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border ${
                        isSandstone
                          ? "bg-[#1a1815]/5 border-[#1a1815]/10"
                          : "bg-granite border-white/5"
                      }`}
                    >
                      <span className="block text-[9px] uppercase opacity-60">Local Guide</span>
                      <span className="font-medium truncate block">
                        {crag.whoToContact?.name || "Juru Kunci / Basecamp"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: 3 Crag CTAs + Detail Link */}
              <div
                className={`p-4 pt-3 border-t space-y-2.5 ${
                  isSandstone ? "border-[#1a1815]/10 bg-[#1a1815]/5" : "border-white/5 bg-granite/40"
                }`}
              >
                {/* 3 Call to Action buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      setActiveModalCrag(crag);
                      setShowOpenTrip(true);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors truncate flex items-center justify-center gap-1 ${
                      isSandstone
                        ? "border-[#1a1815]/30 hover:bg-[#1a1815] hover:text-white text-[#1a1815]"
                        : "border-white/20 hover:border-lime hover:text-lime text-chalk"
                    }`}
                    title="Buka Open Trip"
                  >
                    <Calendar size={11} /> Open Trip
                  </button>

                  <button
                    onClick={() => {
                      setActiveModalCrag(crag);
                      setShowBookTrip(true);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors truncate flex items-center justify-center gap-1 ${
                      isSandstone
                        ? "border-[#1a1815]/30 hover:bg-[#1a1815] hover:text-white text-[#1a1815]"
                        : "border-white/20 hover:border-cyan-400 hover:text-cyan-400 text-chalk"
                    }`}
                    title="Pesan Guide Trip"
                  >
                    <Phone size={11} /> Book Trip
                  </button>

                  <button
                    onClick={() => {
                      setActiveModalCrag(crag);
                      setShowRentEquip(true);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors truncate flex items-center justify-center gap-1 ${
                      isSandstone
                        ? "border-[#1a1815]/30 hover:bg-[#1a1815] hover:text-white text-[#1a1815]"
                        : "border-white/20 hover:border-amber-400 hover:text-amber-400 text-chalk"
                    }`}
                    title="Sewa Alat di Kawasan"
                  >
                    <Package size={11} /> Rent Gear
                  </button>
                </div>

                {/* Primary button: Open full area page */}
                <Link
                  href={`/crags/${crag.id}`}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isSandstone
                      ? "bg-[#1a1815] text-white hover:bg-black"
                      : "bg-lime text-granite hover:bg-lime-dim shadow-lime-glow"
                  }`}
                >
                  <span>Buka Informasi Kawasan Lengkap</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA Modals */}
      {showOpenTrip && activeModalCrag && (
        <OpenTripModal
          isOpen={showOpenTrip}
          crag={activeModalCrag}
          onClose={() => {
            setShowOpenTrip(false);
            setActiveModalCrag(null);
          }}
        />
      )}

      {showBookTrip && activeModalCrag && (
        <BookTripModal
          isOpen={showBookTrip}
          crag={activeModalCrag}
          onClose={() => {
            setShowBookTrip(false);
            setActiveModalCrag(null);
          }}
        />
      )}

      {showRentEquip && activeModalCrag && (
        <RentEquipmentModal
          isOpen={showRentEquip}
          crag={activeModalCrag}
          onClose={() => {
            setShowRentEquip(false);
            setActiveModalCrag(null);
          }}
        />
      )}
    </div>
  );
}
