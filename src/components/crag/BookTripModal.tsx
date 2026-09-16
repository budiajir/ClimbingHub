"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, ShieldCheck, CheckCircle2, Phone, Sparkles, Check } from "lucide-react";
import { CragRegion } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

interface BookTripModalProps {
  isOpen: boolean;
  crag: CragRegion | null;
  onClose: () => void;
}

const PACKAGES = [
  {
    id: "half-day",
    title: "Half-Day Guided Climbing (4 Jam)",
    price: 250000,
    desc: "Sesi pengenalan tebing & panduan belaying di sektor favorit.",
    features: ["Local Guide FPTI", "Sewa Helm & Harness", "Belay Support", "P3K Tebing"],
  },
  {
    id: "full-day",
    title: "Full-Day Crag Send Session (8 Jam)",
    price: 450000,
    desc: "Eksplorasi sektor lengkap dari pagi hingga sore hari.",
    features: ["Senior Guide Khusus", "Rope & Full Safety Gear", "Makan Siang Basecamp", "Dokumentasi Foto Send"],
  },
  {
    id: "2d1n",
    title: "2D1N Camp & Climb Experience",
    price: 850000,
    desc: "Paket komplit menginap di basecamp/tenda dan 2 hari pemanjatan intensif.",
    features: ["Guide 2 Hari", "Tenda / Homestay", "Makan 3x", "Night Bouldering Session"],
  },
];

export default function BookTripModal({ isOpen, crag, onClose }: BookTripModalProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isSandstone = theme === "sandstone";

  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1].id);
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState(2);
  const [name, setName] = useState(user?.name || "Climber");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !crag) return null;

  const currentPkg = PACKAGES.find((p) => p.id === selectedPkg) || PACKAGES[0];
  const totalPrice = currentPkg.price * participants;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`relative z-10 w-full max-w-lg rounded-3xl border p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar ${
            isSandstone
              ? "bg-[#ded3be] border-[#1a1815]/20 text-[#1a1815]"
              : "bg-[#181d22] border-white/15 text-chalk"
          }`}
          style={{
            paddingBottom: "max(env(safe-area-inset-bottom) + 16px, 24px)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
                  isSandstone
                    ? "border-[#1a1815]/20 bg-[#1a1815]/10 text-[#1a1815]"
                    : "border-lime/30 bg-lime/10 text-lime"
                }`}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">Book A Trip</h3>
                <p className="text-xs opacity-75 font-light">Pemandu Lokal Resmi · {crag.name}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isSandstone ? "hover:bg-[#1a1815]/10 text-[#1a1815]" : "hover:bg-white/10 text-chalk"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 rounded-full bg-lime/20 border border-lime/40 text-lime flex items-center justify-center mx-auto shadow-lime-glow-sm"
              >
                <CheckCircle2 size={32} />
              </motion.div>
              <h4 className="font-bold text-base">Booking Berhasil Diajukan!</h4>
              <p className="text-xs opacity-75 max-w-sm mx-auto">
                Pengelola basecamp <b>{crag.whoToContact?.name || crag.name}</b> telah menerima detail pesanan trip Anda dan akan segera mengonfirmasi jadwal ketersediaan pemandu.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {/* Package Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-2">
                  Pilih Paket Trip Pemanduan
                </label>
                <div className="space-y-2">
                  {PACKAGES.map((pkg) => {
                    const isSelected = selectedPkg === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPkg(pkg.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? isSandstone
                              ? "border-[#1a1815] bg-[#1a1815]/5 shadow-sm"
                              : "border-lime bg-lime/10 shadow-lime-glow-sm"
                            : isSandstone
                            ? "border-[#1a1815]/15 hover:border-[#1a1815]/40"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <span>{pkg.title}</span>
                          </div>
                          <p className="text-[11px] opacity-70">{pkg.desc}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {pkg.features.map((f) => (
                              <span
                                key={f}
                                className={`text-[9px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                  isSandstone
                                    ? "bg-black/5 border-black/10"
                                    : "bg-white/5 border-white/10 text-chalk"
                                }`}
                              >
                                <Check size={10} /> {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="font-mono font-bold text-xs">
                            Rp {pkg.price.toLocaleString("id-ID")}
                          </div>
                          <span className="text-[10px] opacity-60">/ orang</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date & Climbers count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Tanggal Trip
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Jumlah Peserta
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    required
                    value={participants}
                    onChange={(e) => setParticipants(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Nama Pemesan
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Nomor WhatsApp / Telp
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxx"
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
              </div>

              {/* Total Calculation Card */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isSandstone
                    ? "bg-[#1a1815]/5 border-[#1a1815]/15"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div>
                  <span className="text-[11px] opacity-70 block">Estimasi Total Biaya ({participants} orang)</span>
                  <span className="font-bold text-xs">{currentPkg.title}</span>
                </div>
                <div className="text-right">
                  <span className={`text-base font-bold font-mono ${
                    isSandstone ? "text-[#1a1815]" : "text-lime"
                  }`}>
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all touch-ripple ${
                  isSandstone
                    ? "bg-[#1a1815] text-[#ded3be] hover:opacity-90 border border-[#1a1815]"
                    : "bg-lime text-granite hover:bg-lime-dim shadow-lime-glow-sm"
                }`}
              >
                <ShieldCheck size={16} />
                <span>Kirim Permintaan Booking Trip</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
