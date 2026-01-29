// src/pages/admin/ManageShelters.jsx
import { useEffect, useMemo, useState } from "react";
import { Store } from "../../state/store";
import { motion } from "framer-motion";
import {
  MapPin,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Building2,
  ShieldAlert,
  Droplets,
  Sandwich,
  Cross,
  Save,
} from "lucide-react";

const API_BASE_RAW = import.meta.env.VITE_ML_API_BASE || "http://localhost:8000";
const API_BASE = API_BASE_RAW.replace(/\/+$/, "");

const empty = {
  id: "",
  name: "",
  lat: 13.0827,
  lng: 80.2707,
  type: "School",
  risk: "LOW",
  capacityTotal: 100,
  capacityUsed: 0,
  resources: { water: true, food: false, medical: false },
};

async function readError(res) {
  try {
    const t = await res.text();
    return t?.slice(0, 800) || "";
  } catch {
    return "";
  }
}

async function apiGetShelters() {
  const res = await fetch(`${API_BASE}/shelters`);
  if (!res.ok) throw new Error(`GET /shelters failed (${res.status}) ${await readError(res)}`);
  const json = await res.json();
  return json?.shelters || [];
}

async function apiUpsertShelter(shelter) {
  const payload = {
    id: shelter.id,
    name: shelter.name,
    lat: Number(shelter.lat),
    lng: Number(shelter.lng),
    risk: (shelter.risk || "LOW").toUpperCase(),
    capacityTotal: Number(shelter.capacityTotal),
    capacityUsed: Number(shelter.capacityUsed),
    type: shelter.type || "Shelter",
    resources: shelter.resources || { water: true, food: false, medical: false },
  };

  const res = await fetch(`${API_BASE}/shelters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`POST /shelters failed (${res.status}) ${await readError(res)}`);
  const json = await res.json();
  return json?.shelter;
}

async function apiDeleteShelter(id) {
  const res = await fetch(`${API_BASE}/shelters/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE /shelters/${id} failed (${res.status}) ${await readError(res)}`);
  return true;
}

function RiskPill({ risk }) {
  const cls =
    risk === "HIGH"
      ? "bg-rose-500/10 border-rose-400/20 text-rose-200"
      : risk === "MODERATE"
      ? "bg-amber-500/10 border-amber-400/20 text-amber-200"
      : "bg-emerald-500/10 border-emerald-400/20 text-emerald-200";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${cls}`}>
      <ShieldAlert size={12} />
      {risk}
    </span>
  );
}

function CapacityBar({ used = 0, total = 0 }) {
  const pct = total > 0 ? Math.min(100, Math.max(0, (used / total) * 100)) : 0;
  const tone =
    pct >= 90 ? "bg-rose-400/80" : pct >= 70 ? "bg-amber-400/80" : "bg-emerald-400/80";

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[11px] text-white/55">
        <span>Capacity</span>
        <span className="text-white/70">
          {used}/{total} ({Math.round(pct)}%)
        </span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ResourceChip({ active, icon: Icon, label }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] ${
        active ? "bg-cyan-500/10 border-cyan-400/20 text-cyan-100" : "bg-white/5 border-white/10 text-white/60"
      }`}
    >
      <Icon size={14} />
      {label}
    </span>
  );
}

export default function ManageShelters() {
  const [editing, setEditing] = useState(null);
  const shelters = Store.shelters();

  const form = useMemo(() => editing || empty, [editing]);
  const [draft, setDraft] = useState(form);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);

  const filteredShelters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shelters;
    return shelters.filter((s) => {
      const hay = `${s.id} ${s.name} ${s.type} ${s.risk}`.toLowerCase();
      return hay.includes(q);
    });
  }, [shelters, query]);

  const startNew = () => {
    setEditing(null);
    setDraft({ ...empty, id: "S" + Math.random().toString(16).slice(2, 6).toUpperCase() });
  };

  const startEdit = (s) => {
    setEditing(s);
    setDraft(s);
  };

  const refreshFromApi = async () => {
    setErr("");
    setToast(null);
    setLoading(true);
    try {
      const backendShelters = await apiGetShelters();
      shelters.forEach((s) => Store.deleteShelter(s.id));
      backendShelters.forEach((s) => Store.upsertShelter(s));
      setToast({ type: "success", msg: "Shelters refreshed ✅" });
    } catch (e) {
      setErr(e?.message || "Failed to refresh shelters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const backendShelters = await apiGetShelters();
        shelters.forEach((s) => Store.deleteShelter(s.id));
        backendShelters.forEach((s) => Store.upsertShelter(s));
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load shelters from API.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setErr("");
    setToast(null);
    setLoading(true);
    try {
      if (!draft?.id?.trim() || !draft?.name?.trim()) {
        throw new Error("ID and Name are required.");
      }
      const saved = await apiUpsertShelter({
        ...draft,
        lat: Number(draft.lat),
        lng: Number(draft.lng),
        capacityTotal: Number(draft.capacityTotal),
        capacityUsed: Number(draft.capacityUsed),
      });

      if (saved) Store.upsertShelter(saved);

      setEditing(null);
      setDraft(empty);
      setToast({ type: "success", msg: "Shelter saved ✅" });
    } catch (e) {
      setErr(e?.message || "Failed to save shelter.");
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    setErr("");
    setToast(null);
    setLoading(true);
    try {
      await apiDeleteShelter(id);
      Store.deleteShelter(id);
      if (draft?.id === id) setDraft(empty);
      setToast({ type: "success", msg: "Shelter deleted ✅" });
    } catch (e) {
      setErr(e?.message || "Failed to delete shelter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 py-7"
      >
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center shadow-glow">
              <MapPin className="text-cyan-200" size={18} />
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-tight">Manage Shelters</div>
              <div className="text-sm text-white/60 mt-1">
                Create, edit, and update live capacity and risk scoring (saved in backend).
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startNew}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
            >
              <Plus size={16} />
              New
            </button>

            <button
              onClick={refreshFromApi}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm disabled:opacity-50"
              title={`${API_BASE}/shelters`}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {(err || toast) && (
          <div className="mb-5 space-y-3">
            {err && (
              <div className="rounded-3xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
                <div className="font-semibold">Something went wrong</div>
                <div className="mt-1 text-white/70">{err}</div>
                <div className="mt-2 text-xs text-white/50">API: {API_BASE}</div>
              </div>
            )}

            {toast && (
              <div
                className={`rounded-3xl border px-5 py-4 text-sm ${
                  toast.type === "success"
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                    : "border-red-400/20 bg-red-500/10 text-red-200"
                }`}
              >
                {toast.msg}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5 backdrop-blur shadow-glow">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">{editing ? "Edit Shelter" : "Create Shelter"}</div>
              <div className="text-xs text-white/50">{API_BASE}/shelters</div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none"
                  value={draft.id}
                  onChange={(e) => setDraft((p) => ({ ...p, id: e.target.value }))}
                  placeholder="ID"
                />
                <select
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none"
                  value={draft.type}
                  onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value }))}
                >
                  <option>School</option>
                  <option>Hall</option>
                  <option>Hospital</option>
                  <option>Transit Hub</option>
                </select>
              </div>

              <input
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none"
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder="Name"
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none pr-10"
                    value={draft.lat}
                    onChange={(e) => setDraft((p) => ({ ...p, lat: e.target.value }))}
                    placeholder="Latitude"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">lat</span>
                </div>

                <div className="relative">
                  <input
                    className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none pr-10"
                    value={draft.lng}
                    onChange={(e) => setDraft((p) => ({ ...p, lng: e.target.value }))}
                    placeholder="Longitude"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">lng</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none"
                  value={draft.risk}
                  onChange={(e) => setDraft((p) => ({ ...p, risk: e.target.value }))}
                >
                  <option value="LOW">LOW</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="HIGH">HIGH</option>
                </select>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 flex items-center gap-2">
                  <Building2 size={14} className="text-white/60" />
                  {draft.type}
                  <span className="ml-auto">
                    <RiskPill risk={(draft.risk || "LOW").toUpperCase()} />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none"
                  value={draft.capacityTotal}
                  onChange={(e) => setDraft((p) => ({ ...p, capacityTotal: e.target.value }))}
                  placeholder="Total Capacity"
                  inputMode="numeric"
                />
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none"
                  value={draft.capacityUsed}
                  onChange={(e) => setDraft((p) => ({ ...p, capacityUsed: e.target.value }))}
                  placeholder="Used Capacity"
                  inputMode="numeric"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      resources: { ...(p.resources || {}), water: !p.resources?.water },
                    }))
                  }
                  className="focus:outline-none"
                >
                  <ResourceChip active={!!draft.resources?.water} icon={Droplets} label="WATER" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      resources: { ...(p.resources || {}), food: !p.resources?.food },
                    }))
                  }
                  className="focus:outline-none"
                >
                  <ResourceChip active={!!draft.resources?.food} icon={Sandwich} label="FOOD" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      resources: { ...(p.resources || {}), medical: !p.resources?.medical },
                    }))
                  }
                  className="focus:outline-none"
                >
                  <ResourceChip active={!!draft.resources?.medical} icon={Cross} label="MEDICAL" />
                </button>
              </div>

              <button
                onClick={save}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/20 disabled:opacity-50"
              >
                <Save size={16} />
                {loading ? "Saving…" : "Save Shelter"}
              </button>

              <div className="text-xs text-white/50">
                Tip: Keep <span className="text-white/70">capacityUsed</span> ≤{" "}
                <span className="text-white/70">capacityTotal</span>.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-glow overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-white/10 bg-black/30 px-4 md:px-5 py-4">
              <div>
                <div className="font-semibold">Shelter List</div>
                <div className="text-xs text-white/55">
                  Showing {filteredShelters.length} of {shelters.length}
                </div>
              </div>

              <input
                className="w-full md:w-[320px] bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name / id / risk..."
              />
            </div>

            <div className="max-h-[74vh] overflow-y-auto nice-scroll p-4 md:p-5">
              {filteredShelters.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
                  No shelters found. Click <span className="text-cyan-300">New</span> to create one.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredShelters.map((s) => (
                    <div key={s.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{s.name}</div>
                          <div className="mt-1 text-xs text-white/55">
                            <span className="text-white/70">{s.id}</span> • {s.type}
                          </div>
                        </div>
                        <RiskPill risk={(s.risk || "LOW").toUpperCase()} />
                      </div>

                      <CapacityBar used={Number(s.capacityUsed) || 0} total={Number(s.capacityTotal) || 0} />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <ResourceChip active={!!s.resources?.water} icon={Droplets} label="WATER" />
                        <ResourceChip active={!!s.resources?.food} icon={Sandwich} label="FOOD" />
                        <ResourceChip active={!!s.resources?.medical} icon={Cross} label="MEDICAL" />
                      </div>

                      <div className="mt-3 text-[11px] text-white/45">
                        ({Number(s.lat).toFixed(4)}, {Number(s.lng).toFixed(4)})
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => del(s.id)}
                          disabled={loading}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-400/20 text-sm text-rose-200 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
