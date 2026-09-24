"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Shield, Plus, Minus, Package, Calendar } from "lucide-react";
import { CragRegion } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

interface RentEquipmentModalProps {
  isOpen: boolean;
  crag: CragRegion | null;
  onClose: () => void;
}

interface EquipmentItem {
  id: string;
  name: string;
  pricePerDay: number;
  category: "boulder" | "lead" | "safety";
  desc: string;
}

const EQUIPMENT_CATALOG: EquipmentItem[] = [
  {
    id: "crashpad",
    name: "Bouldering Crashpad (Mad Rock / Black Diamond)",
    pricePerDay: 50000,
    category: "boulder",
    desc: "Heavy-duty drop cushioning for outdoor bouldering.",
  },
  {
    id: "harness",
    name: "Climbing Harness (Petzl / Black Diamond)",
    pricePerDay: 35000,
    category: "safety",
    desc: "UIAA certified climbing harness, sizes S/M/L.",
  },
  {
    id: "rope-60m",
    name: "Dynamic Single Rope 60m (9.8mm)",
    pricePerDay: 90000,
    category: "lead",
    desc: "60m dynamic single rope (9.8mm) for sport lead climbing.",
  },
  {
    id: "quickdraw-set",
    name: "Quickdraw Set (10 pcs)",
    pricePerDay: 60000,
    category: "lead",
    desc: "Set of 10 quickdraws for bolt hangers on sport routes.",
  },
  {
    id: "helmet",
    name: "Climbing Helmet (Petzl / Mammut)",
    pricePerDay: 25000,
    category: "safety",
    desc: "Certified head protection against impacts and rockfall.",
  },
  {
    id: "belay-device",
    name: "Belay Device (ATC / GriGri + HMS Carabiner)",
    pricePerDay: 25000,
    category: "lead",
    desc: "Belay device (ATC / GriGri + HMS locking carabiner).",
  },
  {
    id: "brush-chalk",
    name: "Chalk Bucket & Boar Hair Brush Set",
    pricePerDay: 15000,
    category: "boulder",
    desc: "Large boulder chalk bucket and boar's hair brush set.",
  },
];

export default function RentEquipmentModal({ isOpen, crag, onClose }: RentEquipmentModalProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isSandstone = theme === "sandstone";

  const [quantities, setQuantities] = useState<Record<string, number>>({
    crashpad: 1,
  });
  const [days, setDays] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [renterName, setRenterName] = useState(user?.name || "Climber");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !crag) return null;

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const totalPerDay = EQUIPMENT_CATALOG.reduce((sum, item) => {
    const q = quantities[item.id] || 0;
    return sum + q * item.pricePerDay;
  }, 0);

  const grandTotal = totalPerDay * days;
  const totalItemCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalItemCount === 0) return;
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
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">Rent Equipment</h3>
                <p className="text-xs opacity-75 font-light">Gear Rental at {crag.name} Basecamp</p>
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
              <h4 className="font-bold text-base">Equipment Rental Confirmed!</h4>
              <p className="text-xs opacity-75 max-w-sm mx-auto">
                Gear has been reserved at <b>{crag.whoToContact?.basecampName || crag.name}</b>. You can collect your gear on your selected date.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {/* Equipment Items List */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70">
                  Select Climbing Gear
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
                  {EQUIPMENT_CATALOG.map((item) => {
                    const q = quantities[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                          q > 0
                            ? isSandstone
                              ? "border-[#1a1815]/40 bg-[#1a1815]/5"
                              : "border-lime/40 bg-lime/5"
                            : isSandstone
                            ? "border-[#1a1815]/15"
                            : "border-white/10"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs truncate">{item.name}</div>
                          <div className="text-[11px] opacity-65 leading-tight">{item.desc}</div>
                          <div className="font-mono text-xs font-semibold mt-1">
                            Rp {item.pricePerDay.toLocaleString("id-ID")} <span className="text-[10px] opacity-60 font-sans">/ day</span>
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, -1)}
                            disabled={q === 0}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                              q === 0
                                ? "opacity-30 cursor-not-allowed border-black/10 dark:border-white/10"
                                : isSandstone
                                ? "border-[#1a1815]/30 hover:bg-[#1a1815]/10"
                                : "border-white/20 hover:bg-white/10"
                            }`}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="font-mono font-bold w-4 text-center">{q}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, 1)}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                              isSandstone
                                ? "border-[#1a1815]/30 hover:bg-[#1a1815]/10"
                                : "border-white/20 hover:bg-white/10"
                            }`}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rental Date & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Rental Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    required
                    value={days}
                    onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
              </div>

              {/* Renter Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Renter Name
                  </label>
                  <input
                    type="text"
                    required
                    value={renterName}
                    onChange={(e) => setRenterName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                      isSandstone
                        ? "bg-transparent border-[#1a1815]/20 text-[#1a1815] focus:border-[#1a1815]"
                        : "bg-transparent border-white/15 text-chalk focus:border-lime/40"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Phone / WhatsApp Number
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

              {/* Summary Card */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isSandstone
                    ? "bg-[#1a1815]/5 border-[#1a1815]/15"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div>
                  <span className="text-[11px] opacity-70 block">Total Rental Cost ({totalItemCount} items, {days} days)</span>
                  <span className="font-bold text-xs">Pickup: {crag.whoToContact?.basecampName || "Basecamp Crag"}</span>
                </div>
                <div className="text-right">
                  <span className={`text-base font-bold font-mono ${
                    isSandstone ? "text-[#1a1815]" : "text-lime"
                  }`}>
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={totalItemCount === 0}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all touch-ripple ${
                  totalItemCount === 0
                    ? "opacity-40 cursor-not-allowed border border-black/10 dark:border-white/10"
                    : isSandstone
                    ? "bg-[#1a1815] text-[#ded3be] hover:opacity-90 border border-[#1a1815]"
                    : "bg-lime text-granite hover:bg-lime-dim shadow-lime-glow-sm"
                }`}
              >
                <Package size={16} />
                <span>Confirm Equipment Rental</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
