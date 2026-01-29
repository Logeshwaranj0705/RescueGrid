import { useEffect, useMemo, useState } from "react";
import ShelterMap from "../../components/ShelterMap";
import ShelterCard from "../../components/ShelterCard";
import FilterBar from "../../components/FilterBar";
import Modal from "../../components/Model";
import OfflineBanner from "../../components/OfflineBanner";
import Toast from "../../components/Toast";
import { queueAction } from "../../state/db";
import { Store } from "../../state/store";
import { motion } from "framer-motion";

const API_BASE_RAW = import.meta.env.VITE_ML_API_BASE || "http://localhost:8000";
const API_BASE = API_BASE_RAW.replace(/\/+$/, "");

function normalizeShelter(s) {
  const capacityTotal = s.capacityTotal ?? s.capacity_total ?? 0;
  const capacityUsed = s.capacityUsed ?? s.capacity_used ?? 0;

  return {
    id: s.id,
    name: s.name,
    type: s.type || "Shelter",
    lat: Number(s.lat),
    lng: Number(s.lng),
    risk: (s.risk || "LOW").toUpperCase(),
    capacityTotal: Number(capacityTotal),
    capacityUsed: Number(capacityUsed),
    resources: s.resources || { water: false, food: false, medical: false },
    score: s.score,
    timeMin: s.timeMin ?? s.time_min,
    distKm: s.distKm ?? s.dist_km,
  };
}

async function safeJson(res) {
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    return { _raw: txt };
  }
}

export default function PublicHome() {
  const [filters, setFilters] = useState({
    query: "",
    resource: "",
    risk: "",
    onlyAvailable: false,
  });

  const [selected, setSelected] = useState(null);
  const [reportFor, setReportFor] = useState(null);
  const [toast, setToast] = useState(null);

  const [rawShelters, setRawShelters] = useState([]);
  const [rawRecs, setRawRecs] = useState([]);

  const [userLoc, setUserLoc] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/shelters`);
        if (!r.ok) {
          const body = await safeJson(r);
          throw new Error(body?.detail || `GET /shelters failed (${r.status})`);
        }
        const j = await r.json();
        setRawShelters(j.shelters || []);
      } catch {
        setRawShelters([]);
      }
    })();

    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLoc(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!userLoc) return;

    (async () => {
      try {
        const url = new URL(`${API_BASE}/recommend`);
        url.searchParams.set("lat", String(userLoc.lat));
        url.searchParams.set("lng", String(userLoc.lng));
        url.searchParams.set("limit", "8");

        const r = await fetch(url.toString());
        if (!r.ok) {
          const body = await safeJson(r);
          throw new Error(body?.detail || `GET /recommend failed (${r.status})`);
        }

        const j = await r.json();
        setRawRecs(j.recommendations || []);
      } catch {
        setRawRecs([]);
      }
    })();
  }, [userLoc]);

  const shelters = useMemo(() => rawShelters.map(normalizeShelter), [rawShelters]);
  const recs = useMemo(() => rawRecs.map(normalizeShelter), [rawRecs]);
  const best = recs.length > 0 ? recs[0] : null;

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

  const mapShelters = useMemo(() => {
    const byId = new Map();
    [...filtered, ...recs].forEach((s) => byId.set(s.id, s));
    return Array.from(byId.values());
  }, [filtered, recs]);

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
    <div className="w-full">
      <OfflineBanner />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-6"
      >
        <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="text-3xl font-semibold tracking-tight">Public Shelter Finder</div>
            <div className="text-sm text-white/60 mt-1">
              Shelters from <span className="text-white/80">/shelters</span>, recommendations from{" "}
              <span className="text-white/80">/recommend</span>.
            </div>
          </div>

          <div className="text-xs text-white/50">
            {userLoc ? (
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                Location detected ✅
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                Location not available
              </span>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 md:p-5 backdrop-blur shadow-glow">
          <FilterBar filters={filters} setFilters={setFilters} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[440px_1fr] xl:grid-cols-[480px_1fr]">
          <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur shadow-glow overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 bg-black/20 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold">Shelters</div>
                  <div className="text-xs text-white/55 mt-0.5">
                    Browse results + recommendations
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  Showing <span className="text-white/80 font-medium">{filtered.length}</span> • Recs{" "}
                  <span className="text-white/80 font-medium">{recs.length}</span>
                </div>
              </div>
            </div>

            <div className="max-h-[92vh] overflow-y-auto nice-scroll px-4 py-4 space-y-4 ">
              {best && (
                <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-white/5 to-transparent p-5">
                  <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.35),transparent_55%)]" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-200 text-xs font-semibold">
                        ✅ Recommended Best
                      </div>
                      <div className="mt-2 text-white/95 font-semibold text-xl leading-tight">
                        {best.name}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/70">
                        <span className="px-2 py-1 rounded-lg bg-black/25 border border-white/10">
                          ETA: <span className="text-white/90">{best.timeMin ?? "?"} min</span>
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-black/25 border border-white/10">
                          Distance: <span className="text-white/90">{best.distKm ?? "?"} km</span>
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-black/25 border border-white/10">
                          Risk: <span className="text-white/90">{best.risk}</span>
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-black/25 border border-white/10">
                          Available:{" "}
                          <span className="text-white/90">
                            {Math.max(0, best.capacityTotal - best.capacityUsed)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="relative mt-4 w-full px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/20 border border-emerald-400/25 text-sm font-medium transition"
                    onClick={() => setSelected(best)}
                  >
                    View Route on Map
                  </button>
                </div>
              )}

              {recs.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-3">Nearby Recommendations</div>
                  <div className="space-y-3">
                    {recs.slice(0, 5).map((s) => (
                      <ShelterCard
                        key={`rec-${s.id}`}
                        shelter={s}
                        active={selected?.id === s.id}
                        onSelect={() => setSelected(s)}
                        onReport={() => setReportFor(s)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold mb-3">All Results</div>
                <div className="space-y-3">
                  {filtered.map((s) => (
                    <ShelterCard
                      key={s.id}
                      shelter={s}
                      active={selected?.id === s.id}
                      onSelect={() => setSelected(s)}
                      onReport={() => setReportFor(s)}
                    />
                  ))}
                </div>

                {filtered.length === 0 && (
                  <div className="mt-2 text-sm text-white/60">No shelters match your filters.</div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur shadow-glow overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 bg-black/30 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Live Map</div>
                <div className="text-xs text-white/60">
                  {selected
                    ? `Routing to: ${selected.name}`
                    : best
                    ? `Default route: ${best.name}`
                    : "No target yet"}
                </div>
              </div>
            </div>

            <div className="p-3 md:p-4">
              <ShelterMap shelters={mapShelters} selected={selected} userLoc={userLoc} best={best} />
            </div>
          </div>
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
