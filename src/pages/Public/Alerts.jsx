import { useEffect, useMemo, useState } from "react";
import { Bell, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { motion } from "framer-motion";
import API_PATH from "../../utils/API_PATH";

async function safeJson(res) {
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    return { _raw: txt };
  }
}

function normalizeAlerts(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.alerts)) return payload.alerts;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function levelMeta(levelRaw) {
  const level = String(levelRaw || "MODERATE").toUpperCase();
  if (level === "HIGH")
    return {
      Icon: AlertTriangle,
      badge: "bg-red-500/10 border-red-400/20 text-red-200",
      dot: "bg-red-400",
      label: "HIGH",
    };
  if (level === "LOW")
    return {
      Icon: CheckCircle2,
      badge: "bg-emerald-500/10 border-emerald-400/20 text-emerald-200",
      dot: "bg-emerald-400",
      label: "LOW",
    };
  return {
    Icon: Info,
    badge: "bg-amber-500/10 border-amber-400/20 text-amber-200",
    dot: "bg-amber-400",
    label: "MODERATE",
  };
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function loadAlerts() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(API_PATH.ALERTS.LIST);
      const j = await safeJson(r);
      if (!r.ok) throw new Error(j?.message || "Failed to load alerts");
      setAlerts(normalizeAlerts(j));
    } catch (e) {
      setAlerts([]);
      setErr(e.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  const stats = useMemo(() => {
    const out = { total: alerts.length, high: 0, moderate: 0, low: 0 };
    for (const a of alerts) {
      const lvl = String(a.level || "MODERATE").toUpperCase();
      if (lvl === "HIGH") out.high++;
      else if (lvl === "LOW") out.low++;
      else out.moderate++;
    }
    return out;
  }, [alerts]);

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 py-8"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center shadow-glow">
                <Bell className="text-cyan-200" size={18} />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tight">Public Alerts</div>
                <div className="text-sm text-white/60 mt-1">
                  Verified updates from response agencies and automated risk monitors.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
              Total <span className="text-white/90 font-medium">{stats.total}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-400/20 text-red-200">
              HIGH <span className="text-white/90 font-medium">{stats.high}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-200">
              MODERATE <span className="text-white/90 font-medium">{stats.moderate}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-200">
              LOW <span className="text-white/90 font-medium">{stats.low}</span>
            </span>

            <button
              onClick={loadAlerts}
              disabled={loading}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {err && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}

        {loading && alerts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/70">
            No alerts right now.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {alerts.map((a, idx) => {
              const { Icon, badge, dot, label } = levelMeta(a.level);
              const time = new Date(a.createdAt || Date.now()).toLocaleString();

              return (
                <motion.div
                  key={a._id || a.id || idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-glow p-5"
                >
                  <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.25),transparent_55%)]" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                        <div className="font-semibold text-lg truncate">{a.title}</div>
                      </div>
                      <div className="text-xs text-white/55 mt-1">{time}</div>
                    </div>

                    <div className={`shrink-0 px-2.5 py-1 rounded-full border text-xs flex items-center gap-1 ${badge}`}>
                      <Icon size={14} />
                      {label}
                    </div>
                  </div>

                  <div className="relative mt-4 text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
                    {a.body}
                  </div>

                  <div className="relative mt-4 flex items-center justify-between text-xs text-white/55">
                    <span>Sent {a.sentCount ?? 0}</span>
                    <span>Failed {a.failedCount ?? 0}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
