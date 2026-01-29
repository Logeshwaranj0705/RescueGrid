import React from "react";
import { motion } from "framer-motion";
import { Droplets, Utensils, Cross, AlertTriangle, CheckCircle2 } from "lucide-react";

function safetyBadge(safety) {
  if (safety === "HIGH_RISK") return { icon: AlertTriangle, text: "High Risk", cls: "text-red-300 bg-red-500/10 border-red-400/20" };
  if (safety === "MODERATE") return { icon: AlertTriangle, text: "Moderate", cls: "text-amber-300 bg-amber-500/10 border-amber-400/20" };
  return { icon: CheckCircle2, text: "Good", cls: "text-emerald-300 bg-emerald-500/10 border-emerald-400/20" };
}

export default function ShelterCard({ shelter, onSelect, onReport }) {
  const pct = shelter.occupancyPct;
  const available = shelter.capacityUsed < shelter.capacityTotal;

  const badge = safetyBadge(shelter.safety);
  const BadgeIcon = badge.icon;

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-glow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{shelter.name}</div>
          <div className="text-xs text-white/55">{shelter.type} • Score: {shelter.score}</div>
        </div>

        <div className={`px-2.5 py-1 rounded-full border text-xs flex items-center gap-1 ${badge.cls}`}>
          <BadgeIcon size={14} />
          {badge.text}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-white/60 mb-2">
          <span>Occupancy</span>
          <span>{shelter.capacityUsed}/{shelter.capacityTotal} ({pct}%)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
          <div
            className="h-2 rounded-full bg-white/60"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <div className="mt-2 text-xs">
          {available ? (
            <span className="text-emerald-300">✅ Space Available</span>
          ) : (
            <span className="text-red-300">⛔ Full</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
        {shelter.resources.water && <span className="flex items-center gap-1"><Droplets size={14}/> Water</span>}
        {shelter.resources.food && <span className="flex items-center gap-1"><Utensils size={14}/> Food</span>}
        {shelter.resources.medical && <span className="flex items-center gap-1"><Cross size={14}/> Medical</span>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onSelect(shelter)}
          className="flex-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-3 py-2 text-sm"
        >
          View on Map
        </button>
        <button
          onClick={() => onReport(shelter)}
          className="bg-red-500/10 hover:bg-red-500/15 border border-red-400/20 rounded-xl px-3 py-2 text-sm text-red-200"
        >
          Report
        </button>
      </div>
    </motion.div>
  );
}