import React, { useMemo, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import OfflineBanner from "../components/OfflineBanner.jsx";
import FilterBar from "../components/FilterBar.jsx";
import MapView from "../components/MapView.jsx";
import ShelterCard from "../components/ShelterCard.jsx";
import ReportModal from "../components/ReportModal.jsx";
import { useShelters } from "../hooks/useShelters.js";
import { motion } from "framer-motion";

export default function Home() {
  const [filters, setFilters] = useState({
    query: "",
    resource: "",
    safety: "",
    showOnlyAvailable: true,
  });

  const { shelters, loading } = useShelters(filters);

  const [selected, setSelected] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportShelter, setReportShelter] = useState(null);

  const topPick = useMemo(() => shelters[0] || null, [shelters]);

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <OfflineBanner />
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            className="lg:col-span-2 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-6 shadow-glow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-2xl md:text-3xl font-bold">
              Find the best shelter — fast.
            </div>
            <div className="text-white/60 mt-2 text-sm md:text-base">
              Live capacity + safety score + offline-first caching.
              When a shelter gets full, you’ll see the next best option.
            </div>

            {topPick && (
              <div className="mt-5 bg-black/20 border border-white/10 rounded-2xl p-4">
                <div className="text-xs text-white/60">Top Recommendation</div>
                <div className="text-lg font-semibold">{topPick.name}</div>
                <div className="text-sm text-white/70 mt-1">
                  Score {topPick.score} • {topPick.capacityUsed}/{topPick.capacityTotal} ({topPick.occupancyPct}%)
                </div>
                <button
                  className="mt-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-3 py-2 text-sm"
                  onClick={() => setSelected(topPick)}
                >
                  Jump to best shelter
                </button>
              </div>
            )}
          </motion.div>

          <FilterBar filters={filters} setFilters={setFilters} />
        </div>

        {/* Main */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MapView shelters={shelters} selected={selected} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70">
                {loading ? "Loading shelters..." : `${shelters.length} shelters found`}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Reset Map
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {shelters.map((s) => (
                <ShelterCard
                  key={s.id}
                  shelter={s}
                  onSelect={(sh) => setSelected(sh)}
                  onReport={(sh) => {
                    setReportShelter(sh);
                    setReportOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        shelter={reportShelter}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}