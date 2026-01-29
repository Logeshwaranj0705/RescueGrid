import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Send, ShieldAlert } from "lucide-react";
import API_PATH from "../../utils/API_PATH";

export default function ManageAlerts() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [level, setLevel] = useState("MODERATE");
  const [role, setRole] = useState("all");

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  async function safeJson(res) {
    const txt = await res.text();
    try {
      return JSON.parse(txt);
    } catch {
      return { _raw: txt };
    }
  }

  async function loadAlerts() {
    try {
      const r = await fetch(API_PATH.ALERTS.LIST);
      const j = await safeJson(r);
      setAlerts(Array.isArray(j) ? j : []);
    } catch {
      setAlerts([]);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  const publish = async () => {
    if (!title.trim() || !body.trim()) return;

    setLoading(true);
    setToast(null);

    try {
      const r = await fetch(API_PATH.ALERTS.BROADCAST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          level,
          role,
        }),
      });

      const j = await safeJson(r);
      if (!r.ok) throw new Error(j?.message || "Broadcast failed");

      setToast({
        type: "success",
        msg: `Broadcast completed • Sent ${j.sent}/${j.totalPhones} • Failed ${j.failed}`,
      });

      setTitle("");
      setBody("");
      setLevel("MODERATE");
      setRole("all");

      await loadAlerts();
    } catch (e) {
      setToast({ type: "error", msg: e.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[1100px] px-4 md:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center shadow-glow">
            <Bell className="text-cyan-300" size={18} />
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight">Manage Alerts</div>
            <div className="text-sm text-white/60 mt-1">
              Publish verified warnings for the public and authorities.
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-5 rounded-3xl border px-5 py-4 text-sm ${
              toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-200"
                : "bg-red-500/10 border-red-400/20 text-red-200"
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* Create Alert */}
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur shadow-glow p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="text-amber-300" size={18} />
            <div className="font-semibold">Create New Alert</div>
          </div>

          <div className="grid md:grid-cols-12 gap-4">
            <input
              className="md:col-span-8 bg-black/30 border border-white/10 rounded-2xl px-4 py-2 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Alert title"
            />

            <select
              className="md:col-span-2 bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="LOW">LOW</option>
              <option value="MODERATE">MODERATE</option>
              <option value="HIGH">HIGH</option>
            </select>

            <select
              className="md:col-span-2 bg-black/30 border border-white/10 rounded-2xl px-3 py-2 outline-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="all">ALL</option>
              <option value="public">PUBLIC</option>
              <option value="admin">ADMIN</option>
            </select>

            <textarea
              className="md:col-span-12 bg-black/30 border border-white/10 rounded-2xl px-4 py-3 outline-none min-h-[120px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Detailed alert message (what happened, where, what to do)"
            />
          </div>

          <button
            onClick={publish}
            disabled={loading}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/20 rounded-2xl py-2.5 text-sm disabled:opacity-50"
          >
            <Send size={16} />
            {loading ? "Broadcasting…" : "Publish Alert"}
          </button>
        </div>

        {/* Alert History */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-lg">Alert History</div>
            <div className="text-xs text-white/50">
              Total alerts: {alerts.length}
            </div>
          </div>

          <div className="space-y-4">
            {alerts.map((a) => (
              <div
                key={a._id || a.id}
                className="rounded-3xl bg-white/5 border border-white/10 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white/90">{a.title}</div>
                    <div className="text-xs text-white/50 mt-1">
                      {new Date(a.createdAt || Date.now()).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs text-white/60 text-right">
                    <div>{a.level || "MODERATE"}</div>
                    <div className="mt-1">
                      Sent {a.sentCount ?? 0} • Failed {a.failedCount ?? 0}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-white/70 mt-3">{a.body}</div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="rounded-3xl bg-white/5 border border-white/10 p-6 text-sm text-white/60">
                No alerts published yet.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
