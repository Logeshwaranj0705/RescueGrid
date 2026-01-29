import { useMemo, useState } from "react";
import { Store } from "../../state/store";
import ShelterMap from "../../components/ShelterMap";
import ShelterCard from "../../components/ShelterCard";
import FilterBar from "../../components/FilterBar";
import Modal from "../../components/Model";
import OfflineBanner from "../../components/OfflineBanner";
import Toast from "../../components/Toast";
import { queueAction } from "../../state/db";
import { motion } from "framer-motion";

export default function PublicHome() {
  const [filters, setFilters] = useState({ query: "", resource: "", risk: "", onlyAvailable: false });
  const [selected, setSelected] = useState(null);
  const [reportFor, setReportFor] = useState(null);
  const [toast, setToast] = useState(null);
  const shelters = Store.shelters();

  const filtered = useMemo(() => {
    return shelters.filter((s) => {
      const q = filters.query.trim().toLowerCase();
      if (q && !s.name.toLowerCase().includes(q)) return false;

      if (filters.resource) {
        const ok = s.resources?.[filters.resource] === true;
        if (!ok) return false;
      }

      if (filters.risk && s.risk !== filters.risk) return false;

      if (filters.onlyAvailable && s.capacityUsed >= s.capacityTotal) return false;

      return true;
    });
  }, [shelters, filters]);

  async function submitReport(message) {
    const report = {
      id: "R" + Math.random().toString(16).slice(2),
      shelterId: reportFor?.id || "unknown",
      shelterName: reportFor?.name || "Unknown",
      message,
      createdAt: Date.now(),
      status: "QUEUED",
    };

    Store.addReport(report);

    await queueAction({
      id: "Q" + Math.random().toString(16).slice(2),
      type: "REPORT",
      payload: report,
      createdAt: Date.now(),
    });

    setReportFor(null);
    setToast({ title: "Report saved", body: "Saved locally. Will sync when online." });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <OfflineBanner />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-4">
          <div className="text-2xl font-semibold">Public Shelter Finder</div>
          <div className="text-sm text-white/60">
            Find nearby shelters, capacity, risk levels, and submit ground reports for responders.
          </div>
        </div>

        <FilterBar filters={filters} setFilters={setFilters} />

        <div className="mt-6 grid lg:grid-cols-[420px_1fr] gap-6">
          <div className="space-y-4 max-h-[92vh] overflow-y-auto pr-2 nice-scroll">
            {filtered.map((s) => (
                <ShelterCard
                key={s.id}
                shelter={s}
                active={selected?.id === s.id}
                onSelect={() => setSelected(s)}
                onReport={() => setReportFor(s)}
                />
            ))}
            {filtered.length === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60">
                No shelters match your filters.
              </div>
            )}
          </div>

          <ShelterMap shelters={filtered} selected={selected} />
        </div>
      </motion.div>

      <Modal
        open={!!reportFor}
        title="Submit Field Report"
        subtitle={reportFor ? `Shelter: ${reportFor.name}` : ""}
        onClose={() => setReportFor(null)}
        onSubmit={submitReport}
        submitLabel="Save Report"
        placeholder="Road blocked, shelter full, medical shortage, unsafe area..."
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
