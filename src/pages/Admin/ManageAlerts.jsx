import { useState } from "react";
import { Store } from "../../state/store";
import { motion } from "framer-motion";

export default function ManageAlerts() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [level, setLevel] = useState("MODERATE");
  const alerts = Store.alerts();

  const publish = () => {
    if (!title.trim() || !body.trim()) return;
    Store.pushAlert({
      id: "A" + Math.random().toString(16).slice(2),
      title: title.trim(),
      body: body.trim(),
      level,
      createdAt: Date.now(),
    });
    setTitle("");
    setBody("");
    setLevel("MODERATE");
  };

  const del = (id) => Store.deleteAlert(id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-2xl font-semibold mb-2">Manage Alerts</div>
        <div className="text-sm text-white/60 mb-6">Publish verified warnings for the public.</div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="grid md:grid-cols-3 gap-3">
            <input className="md:col-span-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Alert title" />
            <select className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="LOW">LOW</option>
              <option value="MODERATE">MODERATE</option>
              <option value="HIGH">HIGH</option>
            </select>
            <textarea className="md:col-span-3 bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none min-h-[110px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Alert message" />
          </div>

          <button onClick={publish} className="mt-3 w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/20 rounded-xl py-2 text-sm">
            Publish Alert
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{a.title}</div>
                <button onClick={() => del(a.id)} className="text-xs text-red-300 hover:underline">Delete</button>
              </div>
              <div className="text-xs text-white/50 mt-1">{a.level} • {new Date(a.createdAt).toLocaleString()}</div>
              <div className="text-sm text-white/70 mt-2">{a.body}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
