import { AnimatePresence, motion } from "framer-motion";

export default function Toast({ toast, onClose }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur shadow-glow min-w-[280px]">
            <div className="text-sm font-medium">{toast.title}</div>
            <div className="text-xs text-white/70 mt-1">{toast.body}</div>
            <button onClick={onClose} className="text-xs text-cyan-300 mt-2 hover:underline">
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
