import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 bg-orange-500/15 border border-orange-400/30 text-orange-200 px-4 py-2 rounded-full shadow-glow backdrop-blur">
            <WifiOff size={18} />
            <span className="text-sm">Offline mode: reports will sync later</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
