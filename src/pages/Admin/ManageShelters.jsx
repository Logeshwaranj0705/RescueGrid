import { useMemo, useState } from "react";
import { Store } from "../../state/store";
import { motion } from "framer-motion";

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

export default function ManageShelters() {
  const [editing, setEditing] = useState(null);
  const shelters = Store.shelters();

  const form = useMemo(() => editing || empty, [editing]);

  const [draft, setDraft] = useState(form);

  const startNew = () => {
    setEditing(null);
    setDraft({ ...empty, id: "S" + Math.random().toString(16).slice(2, 6).toUpperCase() });
  };

  const startEdit = (s) => {
    setEditing(s);
    setDraft(s);
  };

  const save = () => {
    Store.upsertShelter({
      ...draft,
      lat: Number(draft.lat),
      lng: Number(draft.lng),
      capacityTotal: Number(draft.capacityTotal),
      capacityUsed: Number(draft.capacityUsed),
    });
    setEditing(null);
    setDraft(empty);
  };

  const del = (id) => {
    Store.deleteShelter(id);
    if (draft?.id === id) setDraft(empty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-2xl font-semibold mb-2">Manage Shelters</div>
        <div className="text-sm text-white/60 mb-6">Create, edit, and update live capacity and risk scoring.</div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">{editing ? "Edit Shelter" : "Create Shelter"}</div>
              <button onClick={startNew} className="text-xs text-cyan-300 hover:underline">New</button>
            </div>

            <div className="space-y-3">
              <input className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none" value={draft.id} onChange={(e) => setDraft(p => ({ ...p, id: e.target.value }))} placeholder="ID" />
              <input className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none" value={draft.name} onChange={(e) => setDraft(p => ({ ...p, name: e.target.value }))} placeholder="Name" />

              <div className="grid grid-cols-2 gap-2">
                <input className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none" value={draft.lat} onChange={(e) => setDraft(p => ({ ...p, lat: e.target.value }))} placeholder="Latitude" />
                <input className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none" value={draft.lng} onChange={(e) => setDraft(p => ({ ...p, lng: e.target.value }))} placeholder="Longitude" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none" value={draft.type} onChange={(e) => setDraft(p => ({ ...p, type: e.target.value }))}>
                  <option>School</option>
                  <option>Hall</option>
                  <option>Hospital</option>
                  <option>Transit Hub</option>
                </select>
                <select className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none" value={draft.risk} onChange={(e) => setDraft(p => ({ ...p, risk: e.target.value }))}>
                  <option value="LOW">LOW</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none" value={draft.capacityTotal} onChange={(e) => setDraft(p => ({ ...p, capacityTotal: e.target.value }))} placeholder="Total Capacity" />
                <input className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none" value={draft.capacityUsed} onChange={(e) => setDraft(p => ({ ...p, capacityUsed: e.target.value }))} placeholder="Used Capacity" />
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {["water", "food", "medical"].map((k) => (
                  <label key={k} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2">
                    <input
                      type="checkbox"
                      checked={!!draft.resources?.[k]}
                      onChange={(e) => setDraft(p => ({ ...p, resources: { ...(p.resources || {}), [k]: e.target.checked } }))}
                      className="accent-cyan-400"
                    />
                    {k.toUpperCase()}
                  </label>
                ))}
              </div>

              <button onClick={save} className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/20 rounded-xl py-2 text-sm">
                Save Shelter
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {shelters.map((s) => (
              <div key={s.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-white/55">
                    {s.id} • {s.type} • Risk: {s.risk} • {s.capacityUsed}/{s.capacityTotal}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(s)} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Edit</button>
                  <button onClick={() => del(s.id)} className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-sm text-red-200">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
