import { Link } from "react-router-dom";
import { LayoutDashboard, MapPin, Bell, Flag } from "lucide-react";
import { Store } from "../../state/store";
import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";

function Tile({ to, icon: Icon, title, desc }) {
  return (
    <Link to={to} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition block">
      <div className="flex items-center gap-2">
        <Icon className="text-cyan-300" size={18} />
        <div className="font-semibold">{title}</div>
      </div>
      <div className="text-sm text-white/60 mt-2">{desc}</div>
    </Link>
  );
}

export default function AdminDashboard() {
  const shelters = Store.shelters();
  const alerts = Store.alerts();
  const reports = Store.reports();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <LayoutDashboard className="text-cyan-300" />
          <div className="text-2xl font-semibold">Command Center</div>
        </div>
        <div className="text-sm text-white/60 mb-6">
          Monitor shelters, publish alerts, and review field reports.
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">Shelters: <span className="font-semibold">{shelters.length}</span></div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">Alerts: <span className="font-semibold">{alerts.length}</span></div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">Reports: <span className="font-semibold">{reports.length}</span></div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Tile to="/admin/shelters" icon={MapPin} title="Manage Shelters" desc="Update locations, capacities, resources, and risk levels." />
          <Tile to="/admin/alerts" icon={Bell} title="Manage Alerts" desc="Create & publish public warnings with severity levels." />
          <Tile to="/admin/reports" icon={Flag} title="Reports" desc="Review ground reports submitted by the public." />
          <Tile to="/admin/optimize" icon={Wand2} title="Optimizer" desc="Predict demand + recommend shelter allocation strategy." />
        </div>
      </motion.div>
    </div>
  );
}
