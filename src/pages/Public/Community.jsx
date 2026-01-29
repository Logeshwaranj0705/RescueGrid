import { Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Community() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <Users className="text-cyan-300" />
          <div className="text-2xl font-semibold">Community Updates</div>
        </div>
        <div className="text-sm text-white/60 mb-6">
          Public messages, help requests, and verified community support updates (demo placeholder).
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/70">
          Next step: connect WebSocket / Firebase for real-time chat + moderation + reporting.
        </div>
      </motion.div>
    </div>
  );
}
