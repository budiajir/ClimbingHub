"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  Instagram,
  UserPlus,
  Camera,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Community } from "@/lib/mock-data";
import { useCommunities } from "@/lib/use-data";
import { useTheme } from "@/lib/theme-context";
import {
  getCommunityJoinRequests,
  getCommunityPhotos,
} from "@/lib/community-store";
import CommunityDetailModal from "./CommunityDetailModal";
import RequestToJoinModal from "./RequestToJoinModal";
import UploadCommunityPhotoModal from "./UploadCommunityPhotoModal";

export default function CommunityDirectory() {
  const { communities } = useCommunities();
  const { theme } = useTheme();
  const isSandstone = theme === "sandstone";
  const [filterCity, setFilterCity] = useState<string>("all");

  const [selectedDetail, setSelectedDetail] = useState<Community | null>(null);
  const [selectedJoin, setSelectedJoin] = useState<Community | null>(null);
  const [selectedUpload, setSelectedUpload] = useState<Community | null>(null);

  const [joinStatuses, setJoinStatuses] = useState<Record<string, "none" | "pending" | "approved">>({});
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});

  const refreshCommunityState = () => {
    const reqs = getCommunityJoinRequests();
    const newStatuses: Record<string, "none" | "pending" | "approved"> = {};
    const newCounts: Record<string, number> = {};

    communities.forEach((c) => {
      newStatuses[c.id] = reqs[c.id]?.status || "none";
      newCounts[c.id] = getCommunityPhotos(c.id).length;
    });

    setJoinStatuses(newStatuses);
    setPhotoCounts(newCounts);
  };

  useEffect(() => {
    refreshCommunityState();
  }, [communities]);

  useEffect(() => {
    const handlePhotoUpdate = () => refreshCommunityState();
    const handleRequestUpdate = () => refreshCommunityState();

    window.addEventListener("community-photo-updated", handlePhotoUpdate);
    window.addEventListener("community-request-updated", handleRequestUpdate);
    return () => {
      window.removeEventListener("community-photo-updated", handlePhotoUpdate);
      window.removeEventListener("community-request-updated", handleRequestUpdate);
    };
  }, [communities]);

  const cities = ["all", ...Array.from(new Set(communities.map((c) => c.city)))];
  const filtered = filterCity === "all" ? communities : communities.filter((c) => c.city === filterCity);

  return (
    <div className="space-y-6">
      {/* City Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setFilterCity(city)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs transition-all border ${
              filterCity === city
                ? isSandstone
                  ? "bg-transparent border-[#1a1815] text-[#1a1815] font-bold"
                  : "bg-transparent border-lime text-lime font-bold"
                : isSandstone
                ? "bg-transparent border-[#1a1815]/20 text-[#1a1815]/70 hover:border-[#1a1815]/40 font-light"
                : "bg-transparent border-white/10 text-slate-ash hover:text-chalk hover:border-white/20 font-light"
            }`}
          >
            {city === "all" ? "All Cities" : city}
          </button>
        ))}
      </div>

      {/* Main Grid: Full Width Squads & Clubs Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            className={`font-bold text-base md:text-xl flex items-center gap-2 ${
              isSandstone ? "text-[#1a1815]" : "text-chalk"
            }`}
          >
            Climbing Squads & Clubs
            <span
              className={`text-xs font-light ${
                isSandstone ? "text-[#1a1815]/60" : "text-slate-ash"
              }`}
            >
              ({filtered.length} communities)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((comm, i) => {
            const status = joinStatuses[comm.id] || "none";
            const pCount = photoCounts[comm.id] ?? getCommunityPhotos(comm.id).length;

            return (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`rounded-2xl overflow-hidden touch-ripple transition-all flex flex-col justify-between group ${
                  isSandstone
                    ? "bg-[#f4efe6] border border-[#1a1815]/20 shadow-sm hover:border-[#1a1815]/50"
                    : "bg-crag border border-white/5 hover:border-lime/30 hover:shadow-card-hover"
                }`}
              >
                {/* Header image & Click to open Detail */}
                <div
                  onClick={() => setSelectedDetail(comm)}
                  className="cursor-pointer"
                >
                  <div
                    className="h-36 bg-cover bg-center relative group-hover:scale-[1.01] transition-transform duration-300"
                    style={{ backgroundImage: `url(${comm.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    {/* Photo count badge */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
                      <Camera size={12} className="text-lime" />
                      <span>{pCount} Foto</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3
                          className={`font-bold text-base leading-tight transition-colors flex items-center gap-1 ${
                            isSandstone
                              ? "text-[#1a1815] group-hover:text-black"
                              : "text-chalk group-hover:text-lime"
                          }`}
                        >
                          {comm.name}
                          <ChevronRight size={15} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin
                            size={11}
                            className={isSandstone ? "text-[#1a1815]/60" : "text-slate-ash"}
                          />
                          <span
                            className={`text-xs font-light ${
                              isSandstone ? "text-[#1a1815]/70" : "text-slate-ash"
                            }`}
                          >
                            {comm.city}, {comm.province}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1 border rounded-full px-2.5 py-1 ${
                          isSandstone
                            ? "bg-transparent border-[#1a1815]/20 text-[#1a1815]"
                            : "bg-granite border-white/5 text-chalk"
                        }`}
                      >
                        <Users
                          size={12}
                          className={isSandstone ? "text-[#1a1815]" : "text-cyan-climb"}
                        />
                        <span className="text-xs font-bold">{comm.memberCount}</span>
                      </div>
                    </div>

                    <p
                      className={`text-xs font-light leading-relaxed mb-3 line-clamp-2 ${
                        isSandstone ? "text-[#1a1815]/75" : "text-slate-ash"
                      }`}
                    >
                      {comm.description}
                    </p>

                    {/* Members preview */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {comm.members.slice(0, 3).map((m) => (
                            <div
                              key={m.name}
                              className={`w-7 h-7 rounded-full border-2 bg-cover bg-center ${
                                isSandstone ? "border-[#f4efe6]" : "border-crag"
                              }`}
                              style={{ backgroundImage: `url(${m.avatar})` }}
                              title={m.name}
                            />
                          ))}
                        </div>
                        <span
                          className={`text-[11px] font-light ${
                            isSandstone ? "text-[#1a1815]/60" : "text-slate-ash"
                          }`}
                        >
                          +{comm.memberCount - 3} climbers
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-medium underline underline-offset-2 ${
                          isSandstone ? "text-[#1a1815]/70" : "text-lime/90"
                        }`}
                      >
                        Lihat Galeri & Squad &rarr;
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: In-App Request to Join + Instagram Only */}
                <div className="p-4 pt-0 flex gap-2">
                  {/* Request to Join Button */}
                  {status === "pending" ? (
                    <button
                      onClick={() => setSelectedDetail(comm)}
                      className={`flex-1 flex items-center justify-center gap-1.5 h-10 border rounded-xl text-xs font-semibold touch-ripple transition-colors ${
                        isSandstone
                          ? "bg-amber-100/70 border-amber-300 text-amber-900"
                          : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                      }`}
                    >
                      <Clock size={14} /> Pending
                    </button>
                  ) : status === "approved" ? (
                    <button
                      onClick={() => setSelectedDetail(comm)}
                      className={`flex-1 flex items-center justify-center gap-1.5 h-10 border rounded-xl text-xs font-semibold touch-ripple transition-colors ${
                        isSandstone
                          ? "bg-emerald-100/70 border-emerald-300 text-emerald-900"
                          : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      }`}
                    >
                      <CheckCircle2 size={14} /> Member
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedJoin(comm)}
                      className={`flex-1 flex items-center justify-center gap-1.5 h-10 border rounded-xl text-xs font-bold touch-ripple transition-all ${
                        isSandstone
                          ? "bg-[#1a1815] text-[#ded3be] border-[#1a1815] hover:opacity-90"
                          : "bg-lime text-granite border-lime hover:bg-lime-dim shadow-lime-glow-sm"
                      }`}
                    >
                      <UserPlus size={14} /> Request to Join
                    </button>
                  )}

                  {/* Instagram Button ONLY (No WhatsApp) */}
                  <a
                    href={comm.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center gap-1.5 h-10 bg-transparent border rounded-xl text-xs font-medium tracking-wide touch-ripple transition-colors ${
                      isSandstone
                        ? "border-[#1a1815]/20 hover:border-[#1a1815]/60 text-[#1a1815]"
                        : "border-white/10 hover:border-white/30 text-chalk"
                    }`}
                  >
                    <Instagram size={15} className="text-[#E1306C]" /> Instagram
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <CommunityDetailModal
        isOpen={!!selectedDetail}
        community={selectedDetail}
        onClose={() => setSelectedDetail(null)}
        onRequestJoin={(comm) => {
          setSelectedJoin(comm);
        }}
        onUploadPhoto={(comm) => {
          setSelectedUpload(comm);
        }}
      />

      <RequestToJoinModal
        isOpen={!!selectedJoin}
        community={selectedJoin}
        onClose={() => setSelectedJoin(null)}
        onSuccess={() => {
          refreshCommunityState();
        }}
      />

      <UploadCommunityPhotoModal
        isOpen={!!selectedUpload}
        community={selectedUpload}
        onClose={() => setSelectedUpload(null)}
        onPhotoUploaded={() => {
          refreshCommunityState();
        }}
      />
    </div>
  );
}
