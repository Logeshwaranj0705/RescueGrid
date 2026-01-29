import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zones as zonesStatic } from "../../data/zones";
import {
  Wand2,
  Activity,
  MapPinned,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Server,
  WifiOff,
} from "lucide-react";

const API_BASE_RAW = import.meta.env.VITE_ML_API_BASE || "http://localhost:8000";
const API_BASE = API_BASE_RAW.replace(/\/+$/, "");

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl bg-white/5 border border-white/10 backdrop-blur shadow-glow ${className}`}
    >
      {children}
    </div>
  );
}

function Pill({ tone = "neutral", icon: Icon, children, title }) {
  const cls =
    tone === "good"
      ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-200"
      : tone === "bad"
      ? "bg-red-500/10 border-red-400/20 text-red-200"
      : tone === "warn"
      ? "bg-amber-500/10 border-amber-400/20 text-amber-200"
      : "bg-white/5 border-white/10 text-white/70";

  return (
    <div
      title={title}
      className={`px-3 py-2 rounded-2xl border text-sm flex items-center gap-2 ${cls}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </div>
  );
}

function Metric({ label, value, icon: Icon, tone }) {
  const toneCls =
    tone === "bad"
      ? "text-red-300 bg-red-500/10 border-red-400/20"
      : tone === "warn"
      ? "text-amber-300 bg-amber-500/10 border-amber-400/20"
      : "text-emerald-300 bg-emerald-500/10 border-emerald-400/20";

  return (
    <div className="bg-black/25 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-white/60">{label}</div>
        <div className={`px-2.5 py-1 rounded-full border text-xs flex items-center gap-1 ${toneCls}`}>
          <Icon size={14} />
          {value}
        </div>
      </div>
    </div>
  );
}

function Range({ label, value, onChange, min, max, suffix }) {
  return (
    <div className="bg-black/25 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/60">{label}</div>
        <div className="text-xs text-white/80 font-medium">
          {value}
          {suffix}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-3 accent-cyan-400"
      />
    </div>
  );
}

function toApiScenario(s) {
  return {
    disaster_type: s.disasterType,
    severity: s.severity,
    rainfall_mm: s.rainfallMm,
    wind_kmph: s.windKmph,
    time_of_day: s.timeOfDay,
    mobility_impact: s.mobilityImpact,
  };
}

function toApiZones(zs) {
  return zs.map((z) => ({
    id: z.id,
    name: z.name,
    lat: z.lat,
    lng: z.lng,
    population: z.population,
    elderly_pct: z.elderly_pct ?? z.elderlyPct,
    poverty_pct: z.poverty_pct ?? z.povertyPct,
    past_incidents: z.past_incidents ?? z.pastIncidents,
    elevation_m: z.elevation_m ?? z.elevationM,
    hospital_km: z.hospital_km ?? z.hospitalKm,
    road_density: z.road_density ?? z.roadDensity ?? 0.6,
    transport_access: z.transport_access ?? z.transportAccess ?? 0.6,
  }));
}

function toApiShelters(ss) {
  return ss.map((s) => ({
    id: s.id,
    name: s.name,
    lat: s.lat,
    lng: s.lng,
    risk: (s.risk || "LOW").toUpperCase(),
    capacity_total: s.capacity_total ?? s.capacityTotal,
    capacity_used: s.capacity_used ?? s.capacityUsed,
    type: s.type,
    resources: s.resources,
  }));
}

async function readErrorBody(res) {
  try {
    const text = await res.text();
    return text?.slice(0, 500) || "";
  } catch {
    return "";
  }
}

export default function Optimizer() {
  const [scenario, setScenario] = useState({
    disasterType: "FLOOD",
    severity: 70,
    rainfallMm: 120,
    windKmph: 35,
    timeOfDay: "DAY",
    mobilityImpact: 35,
  });

  const [online, setOnline] = useState(navigator.onLine);
  const [health, setHealth] = useState({ ok: false, checked: false });

  const [zones] = useState(zonesStatic);
  const [shelters, setShelters] = useState([]);

  const [demand, setDemand] = useState([]);
  const [allocation, setAllocation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const tone = useMemo(() => {
    const u = allocation?.total_unserved || 0;
    return u > 2000 ? "bad" : u > 0 ? "warn" : "good";
  }, [allocation]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  async function ping() {
    try {
      const r = await fetch(`${API_BASE}/health`);
      const j = await r.json();
      setHealth({ ok: !!j?.ok, checked: true });
    } catch {
      setHealth({ ok: false, checked: true });
    }
  }

  async function loadShelters() {
    const r = await fetch(`${API_BASE}/shelters`);
    if (!r.ok) throw new Error(`GET /shelters failed (${r.status})`);
    const j = await r.json();
    setShelters(j?.shelters || []);
  }

  useEffect(() => {
    ping();
    loadShelters().catch((e) => setErr(e?.message || "Failed to load shelters"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debounceRef = useRef(null);

  async function runOptimizer() {
    setErr("");
    setLoading(true);
    ping();

    try {
      if (!shelters.length) await loadShelters();

      const predRes = await fetch(`${API_BASE}/predict-demand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: toApiScenario(scenario),
          zones: toApiZones(zones),
        }),
      });

      if (!predRes.ok) {
        const body = await readErrorBody(predRes);
        throw new Error(`Predict API failed (${predRes.status}). ${body}`);
      }

      const pred = await predRes.json();
      const demandList = pred?.demand || [];
      setDemand(demandList);

      const allocRes = await fetch(`${API_BASE}/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: toApiScenario(scenario),
          zones: toApiZones(zones),
          shelters: toApiShelters(shelters),
          demand: demandList,
        }),
      });

      if (!allocRes.ok) {
        const body = await readErrorBody(allocRes);
        throw new Error(`Allocate API failed (${allocRes.status}). ${body}`);
      }

      const alloc = await allocRes.json();
      setAllocation(alloc);
    } catch (e) {
      setErr(e?.message || "Something went wrong.");
      setAllocation(null);
      setDemand([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runOptimizer(), 500);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scenario.disasterType,
    scenario.severity,
    scenario.rainfallMm,
    scenario.windKmph,
    scenario.timeOfDay,
    scenario.mobilityImpact,
    shelters.length,
  ]);

  const totalDemand =
    allocation?.total_demand ?? demand.reduce((a, b) => a + (b.demand || 0), 0);
  const totalAssigned = allocation?.total_assigned ?? 0;
  const avgTravel = allocation?.avg_travel_time_min ?? 0;
  const totalUnserved = allocation?.total_unserved ?? 0;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-3xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center shadow-glow">
              <Wand2 className="text-cyan-200" size={18} />
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-tight">Allocation Optimizer</div>
              <div className="text-sm text-white/60 mt-1">
                Demand prediction + allocation strategy under capacity and travel constraints.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill
              tone={health.checked ? (health.ok ? "good" : "bad") : "neutral"}
              icon={Server}
              title={API_BASE}
            >
              {health.checked ? (health.ok ? "API Online" : "API Offline") : "Checking…"}
            </Pill>

            <Pill tone={online ? "good" : "warn"} icon={online ? CheckCircle2 : WifiOff}>
              {online ? "Online" : "Offline"}
            </Pill>

            <button
              onClick={() => {
                ping();
                loadShelters().then(runOptimizer);
              }}
              className="px-4 py-2 rounded-2xl text-sm border bg-white/5 hover:bg-white/10 border-white/10 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <AnimatePresence>
          {!online && (
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="mt-5"
            >
              <div className="bg-orange-500/10 border border-orange-400/20 text-orange-200 rounded-3xl px-5 py-4 flex items-center gap-2">
                <WifiOff size={18} />
                <span className="text-sm">
                  You are offline. ML API calls may fail until connectivity returns.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[460px_1fr]">
          {/* Left: Scenario + Metrics */}
          <Card className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-cyan-300" />
                <div className="font-semibold">Scenario Inputs</div>
              </div>
              <div className="text-xs text-white/50">
                Zones: <span className="text-white/80 font-semibold">{zones.length}</span> • Shelters:{" "}
                <span className="text-white/80 font-semibold">{shelters.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none text-sm"
                  value={scenario.disasterType}
                  onChange={(e) => setScenario((p) => ({ ...p, disasterType: e.target.value }))}
                >
                  <option value="FLOOD">Flood</option>
                  <option value="CYCLONE">Cyclone</option>
                  <option value="FIRE">Fire</option>
                  <option value="EARTHQUAKE">Earthquake</option>
                </select>

                <select
                  className="bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none text-sm"
                  value={scenario.timeOfDay}
                  onChange={(e) => setScenario((p) => ({ ...p, timeOfDay: e.target.value }))}
                >
                  <option value="DAY">Day</option>
                  <option value="NIGHT">Night</option>
                </select>
              </div>

              <Range
                label="Severity"
                value={scenario.severity}
                onChange={(v) => setScenario((p) => ({ ...p, severity: v }))}
                min={0}
                max={100}
                suffix="%"
              />
              <Range
                label="Rainfall"
                value={scenario.rainfallMm}
                onChange={(v) => setScenario((p) => ({ ...p, rainfallMm: v }))}
                min={0}
                max={250}
                suffix="mm"
              />
              <Range
                label="Wind"
                value={scenario.windKmph}
                onChange={(v) => setScenario((p) => ({ ...p, windKmph: v }))}
                min={0}
                max={140}
                suffix="km/h"
              />
              <Range
                label="Mobility Impact"
                value={scenario.mobilityImpact}
                onChange={(v) => setScenario((p) => ({ ...p, mobilityImpact: v }))}
                min={0}
                max={80}
                suffix="%"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric
                label="Avg Travel Time"
                value={loading ? "…" : `${avgTravel} min`}
                icon={MapPinned}
                tone="good"
              />
              <Metric
                label="Unserved Demand"
                value={loading ? "…" : `${totalUnserved}`}
                icon={tone === "good" ? CheckCircle2 : AlertTriangle}
                tone={tone}
              />
              <Metric
                label="Total Demand"
                value={loading ? "…" : `${totalDemand}`}
                icon={Activity}
                tone="good"
              />
              <Metric
                label="Assigned"
                value={loading ? "…" : `${totalAssigned}`}
                icon={CheckCircle2}
                tone={totalAssigned > 0 ? "good" : "warn"}
              />
            </div>

            <AnimatePresence>
              {err && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="mt-5"
                >
                  <div className="bg-red-500/10 border border-red-400/20 text-red-200 rounded-3xl px-5 py-4 text-sm">
                    {err}
                    <div className="mt-2 text-xs text-white/60">API: {API_BASE}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              disabled={loading}
              onClick={runOptimizer}
              className={`mt-5 w-full px-4 py-3 rounded-2xl text-sm font-medium border flex items-center justify-center gap-2 ${
                loading
                  ? "bg-white/5 border-white/10 text-white/50 cursor-not-allowed"
                  : "bg-cyan-500/15 border-cyan-400/20 hover:bg-cyan-500/20 text-cyan-100"
              }`}
            >
              <Wand2 size={16} />
              {loading ? "Running…" : "Run Optimization"}
            </button>
          </Card>

          {/* Right Side */}
          <div className="space-y-6">
            <Card className="p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">Demand Forecast</div>
                  <div className="text-xs text-white/55 mt-1">
                    Predicted evacuation demand per zone.
                  </div>
                </div>
                <div className="text-xs text-white/55">
                  Total: <span className="text-white/80 font-semibold">{loading ? "…" : totalDemand}</span>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {(demand || []).map((d) => (
                  <div key={d.zone_id} className="bg-black/25 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium truncate">{d.zone_name}</div>
                      <div className="text-sm font-semibold text-cyan-200">{d.demand}</div>
                    </div>
                    <div className="mt-2 text-xs text-white/50">
                      Zone ID: <span className="text-white/75">{d.zone_id}</span>
                    </div>
                  </div>
                ))}
              </div>

              {!loading && demand.length === 0 && (
                <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-5 text-sm text-white/60">
                  No demand results yet. Adjust scenario or click Run Optimization.
                </div>
              )}
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="px-5 md:px-6 py-4 border-b border-white/10 bg-black/25">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">Recommended Allocation</div>
                    <div className="text-xs text-white/55 mt-1">
                      Allocation under capacity and travel constraints.
                    </div>
                  </div>
                  <div className="text-xs text-white/55">
                    Assigned:{" "}
                    <span className="text-white/80 font-semibold">{loading ? "…" : totalAssigned}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-4 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-white/60">
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 pr-3">Zone</th>
                      <th className="text-left py-2 pr-3">Shelter</th>
                      <th className="text-right py-2 pr-3">People</th>
                      <th className="text-right py-2 pr-3">Time</th>
                      <th className="text-right py-2">Dist</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(allocation?.assigned || []).slice(0, 18).map((a, idx) => (
                      <tr
                        key={`${a.zone_id}-${a.shelter_id}-${idx}`}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="py-2 pr-3">{a.zone_name}</td>
                        <td className="py-2 pr-3">{a.shelter_name}</td>
                        <td className="py-2 pr-3 text-right font-semibold">{a.people}</td>
                        <td className="py-2 pr-3 text-right text-white/70">{a.time_min}m</td>
                        <td className="py-2 text-right text-white/70">{a.dist_km}km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!loading && (!allocation?.assigned || allocation.assigned.length === 0) && (
                  <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-5 text-sm text-white/60">
                    No allocation rows yet. Run the optimizer to generate results.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
