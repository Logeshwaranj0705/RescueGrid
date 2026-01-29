import { Store } from "../../state/store";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function Alerts() {
  const alerts = Store.alerts();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <Bell className="text-cyan-300" />
          <div className="text-2xl font-semibold">Public Alerts</div>
        </div>
        <div className="text-sm text-white/60 mb-6">
          Verified updates from response agencies and automated risk monitors.
        </div>

        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{a.title}</div>
                <span className="text-xs text-white/60">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-white/70 mt-2">{a.body}</div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60">
              No alerts right now.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
