import { motion } from "framer-motion";
import { Droplets, Utensils, Cross, AlertTriangle, CheckCircle2 } from "lucide-react";

function badge(risk) {
  if (risk === "HIGH") return { Icon: AlertTriangle, text: "High Risk", cls: "bg-red-500/15 text-red-200 border-red-400/20" };
  if (risk === "MODERATE") return { Icon: AlertTriangle, text: "Moderate", cls: "bg-amber-500/15 text-amber-200 border-amber-400/20" };
  return { Icon: CheckCircle2, text: "Low", cls: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20" };
}

export default function ShelterCard({ shelter, active, onSelect, onReport }) {
  const { Icon, text, cls } = badge(shelter.risk);
  const total = Math.max(0, Number(shelter.capacityTotal || 0));
  const used = Math.max(0, Number(shelter.capacityUsed || 0));
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const available = used < total;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`rounded-2xl p-4 border shadow-glow cursor-pointer transition ${
        active ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{shelter.name}</div>
          <div className="text-xs text-white/55">{shelter.type} • ID: {shelter.id}</div>

          {/* ✅ show recommend info if present */}
          {(shelter.distKm != null || shelter.timeMin != null) && (
            <div className="text-xs text-white/55 mt-1">
              {shelter.timeMin != null ? `ETA: ${shelter.timeMin} min` : ""}{" "}
              {shelter.distKm != null ? `• ${shelter.distKm} km` : ""}
            </div>
          )}
        </div>

        <div className={`px-2.5 py-1 rounded-full border text-xs flex items-center gap-1 ${cls}`}>
          <Icon size={14} />
          {text}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-white/60 mb-2">
          <span>Occupancy</span>
          <span>
            {used}/{total} ({pct}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
          <div className="h-2 rounded-full bg-cyan-400/70" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <div className="mt-2 text-xs">
          {available ? <span className="text-emerald-300">✅ Space Available</span> : <span className="text-red-300">⛔ Full</span>}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
        {shelter.resources?.water && <span className="flex items-center gap-1"><Droplets size={14}/> Water</span>}
        {shelter.resources?.food && <span className="flex items-center gap-1"><Utensils size={14}/> Food</span>}
        {shelter.resources?.medical && <span className="flex items-center gap-1"><Cross size={14}/> Medical</span>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="flex-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-3 py-2 text-sm"
        >
          View on Map
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onReport(); }}
          className="bg-red-500/10 hover:bg-red-500/15 border border-red-400/20 rounded-xl px-3 py-2 text-sm text-red-200"
        >
          Report
        </button>
      </div>
    </motion.div>
  );
}
