import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function Modal({ open, title, subtitle, placeholder, onClose, onSubmit, submitLabel }) {
  const [msg, setMsg] = useState("");

  const submit = async () => {
    if (!msg.trim()) return;
    await onSubmit(msg.trim());
    setMsg("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="w-full max-w-lg bg-[#0b1220] border border-white/10 rounded-2xl shadow-glow p-5"
            initial={{ y: 20, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold">{title}</div>
            {subtitle && <div className="text-xs text-white/60 mt-1">{subtitle}</div>}

            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={placeholder}
              className="mt-3 w-full min-h-[120px] bg-black/20 border border-white/10 rounded-xl p-3 text-sm outline-none"
            />

            <div className="mt-4 flex gap-2">
              <button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm">
                Cancel
              </button>
              <button onClick={submit} className="flex-1 bg-cyan-500/15 hover:bg-cyan-500/20 border border-cyan-400/20 rounded-xl px-3 py-2 text-sm text-cyan-100">
                {submitLabel || "Submit"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
