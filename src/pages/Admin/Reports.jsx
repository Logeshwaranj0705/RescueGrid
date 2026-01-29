import { Store } from "../../state/store";
import { motion } from "framer-motion";

export default function Reports() {
  const reports = Store.reports();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-2xl font-semibold mb-2">Field Reports</div>
        <div className="text-sm text-white/60 mb-6">Public-submitted reports to assist response decisions.</div>

        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{r.shelterName}</div>
                <div className="text-xs text-white/50">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-xs text-white/50 mt-1">Shelter ID: {r.shelterId} • Status: {r.status}</div>
              <div className="text-sm text-white/75 mt-2">{r.message}</div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/60">
              No reports submitted yet.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
