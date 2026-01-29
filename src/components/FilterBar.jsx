import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function FilterBar({ filters, setFilters }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-glow">
      <div className="flex items-center gap-2 text-white/80 mb-3">
        <SlidersHorizontal size={18} />
        <div className="font-medium">Filters</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2">
          <Search size={16} className="text-white/40" />
          <input
            value={filters.query}
            onChange={(e) => setFilters((p) => ({ ...p, query: e.target.value }))}
            placeholder="Search shelters"
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        <select
          value={filters.resource}
          onChange={(e) => setFilters((p) => ({ ...p, resource: e.target.value }))}
          className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none"
        >
          <option value="">Any resource</option>
          <option value="water">Water</option>
          <option value="food">Food</option>
          <option value="medical">Medical</option>
        </select>

        <select
          value={filters.risk}
          onChange={(e) => setFilters((p) => ({ ...p, risk: e.target.value }))}
          className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none"
        >
          <option value="">Any risk</option>
          <option value="LOW">Low</option>
          <option value="MODERATE">Moderate</option>
          <option value="HIGH">High</option>
        </select>

        <label className="flex items-center justify-between bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm">
          <span className="text-white/70">Only available</span>
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => setFilters((p) => ({ ...p, onlyAvailable: e.target.checked }))}
            className="scale-125 accent-cyan-400"
          />
        </label>
      </div>
    </motion.div>
  );
}
