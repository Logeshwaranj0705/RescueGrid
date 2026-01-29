import { Link } from "react-router-dom";
import { LayoutDashboard, MapPin, Bell, Flag, Wand2, ChevronRight } from "lucide-react";
import { Store } from "../../state/store";
import { motion } from "framer-motion";

function StatCard({ label, value }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-glow">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_55%)]" />
      <div className="relative">
        <div className="text-xs text-white/55">{label}</div>
        <div className="mt-1 text-3xl font-semibold tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function Tile({ to, icon: Icon, title, desc, tone = "cyan" }) {
  const toneCls =
    tone === "emerald"
      ? "border-emerald-400/20 bg-emerald-500/10 hover:bg-emerald-500/15"
      : tone === "amber"
      ? "border-amber-400/20 bg-amber-500/10 hover:bg-amber-500/15"
      : tone === "rose"
      ? "border-rose-400/20 bg-rose-500/10 hover:bg-rose-500/15"
      : "border-cyan-400/20 bg-cyan-500/10 hover:bg-cyan-500/15";

  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-3xl border ${toneCls} p-5 transition block`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_55%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Icon className="text-white/85" size={18} />
            </div>
            <div className="font-semibold text-white/95 truncate">{title}</div>
          </div>
          <div className="mt-2 text-sm text-white/60 leading-relaxed">{desc}</div>
        </div>

        <div className="mt-1 shrink-0 w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center opacity-70 group-hover:opacity-100 transition">
          <ChevronRight size={18} className="text-white/80" />
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const shelters = Store.shelters();
  const alerts = Store.alerts();
  const reports = Store.reports();

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 py-7"
      >
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center shadow-glow">
              <LayoutDashboard className="text-cyan-200" />
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-tight">Command Center</div>
              <div className="text-sm text-white/60 mt-1">
                Monitor shelters, publish alerts, and review field reports.
              </div>
            </div>
          </div>

          <div className="text-xs text-white/55">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              Live overview
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Shelters" value={shelters.length} />
          <StatCard label="Alerts" value={alerts.length} />
          <StatCard label="Reports" value={reports.length} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Tile
            to="/admin/shelters"
            icon={MapPin}
            title="Manage Shelters"
            desc="Update locations, capacities, resources, and risk levels."
            tone="cyan"
          />
          <Tile
            to="/admin/alerts"
            icon={Bell}
            title="Manage Alerts"
            desc="Create & publish public warnings with severity and target audience."
            tone="amber"
          />
          <Tile
            to="/admin/reports"
            icon={Flag}
            title="Reports"
            desc="Review ground reports submitted by the public and take action."
            tone="rose"
          />
          <Tile
            to="/admin/optimize"
            icon={Wand2}
            title="Optimizer"
            desc="Predict demand + recommend shelter allocation strategy."
            tone="emerald"
          />
        </div>
      </motion.div>
    </div>
  );
}
