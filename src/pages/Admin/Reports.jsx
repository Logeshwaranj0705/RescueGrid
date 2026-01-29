import { Store } from "../../state/store";
import { motion } from "framer-motion";
import { Flag, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";

function StatusPill({ status }) {
  const s = String(status || "").toUpperCase();

  const cfg =
    s === "RESOLVED"
      ? {
          cls: "bg-emerald-500/10 border-emerald-400/20 text-emerald-200",
          Icon: CheckCircle2,
          label: "RESOLVED",
        }
      : s === "QUEUED" || s === "PENDING"
      ? {
          cls: "bg-amber-500/10 border-amber-400/20 text-amber-200",
          Icon: Clock3,
          label: s,
        }
      : s === "REJECTED" || s === "FAILED"
      ? {
          cls: "bg-red-500/10 border-red-400/20 text-red-200",
          Icon: AlertTriangle,
          label: s,
        }
      : {
          cls: "bg-white/5 border-white/10 text-white/70",
          Icon: Flag,
          label: s || "UNKNOWN",
        };

  const Icon = cfg.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${cfg.cls}`}
    >
      <Icon size={14} />
      {cfg.label}
    </span>
  );
}

export default function Reports() {
  const reports = Store.reports();

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 py-8"
      >
        <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="text-3xl font-semibold tracking-tight">Field Reports</div>
            <div className="text-sm text-white/60 mt-1">
              Public-submitted reports to assist response decisions.
            </div>
          </div>

          <div className="text-xs text-white/60">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              Total: <span className="text-white/80 font-semibold">{reports.length}</span>
            </span>
          </div>
        </div>

        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur shadow-glow overflow-hidden">
          <div className="px-5 md:px-6 py-4 border-b border-white/10 bg-black/25">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Latest Reports</div>
              <div className="text-xs text-white/50">Sorted by newest</div>
            </div>
          </div>

          <div className="p-4 md:p-5">
            {reports.length === 0 ? (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-sm text-white/60">
                No reports submitted yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {reports
                  .slice()
                  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                  .map((r) => (
                    <div
                      key={r.id}
                      className="rounded-3xl bg-white/5 border border-white/10 p-5 hover:bg-white/7 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-white/90 truncate">
                            {r.shelterName || "Unknown Shelter"}
                          </div>
                          <div className="mt-1 text-xs text-white/55">
                            Shelter ID:{" "}
                            <span className="text-white/75 font-medium">
                              {r.shelterId || "—"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <StatusPill status={r.status} />
                          <div className="text-xs text-white/50 whitespace-nowrap">
                            {new Date(r.createdAt || Date.now()).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-white/75 leading-relaxed">
                        {r.message}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
