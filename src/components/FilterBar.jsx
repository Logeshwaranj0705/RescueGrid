import React from "react";
import { Search, Filter } from "lucide-react";

export default function FilterBar({ filters, setFilters }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-glow">
      <div className="flex items-center gap-2 text-white/80 mb-3">
        <Filter size={18} />
        <div className="font-medium">Filters</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <label className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3 py-2">
          <Search size={18} className="text-white/50" />
          <input
            value={filters.query}
            onChange={(e) => setFilters((p) => ({ ...p, query: e.target.value }))}
            placeholder="Search shelter..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </label>

        <select
          value={filters.resource}
          onChange={(e) => setFilters((p) => ({ ...p, resource: e.target.value }))}
          className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none"
        >
          <option value="">Any resource</option>
          <option value="water">Water</option>
          <option value="food">Food</option>
          <option value="medical">Medical</option>
        </select>

        <select
          value={filters.safety}
          onChange={(e) => setFilters((p) => ({ ...p, safety: e.target.value }))}
          className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none"
        >
          <option value="">Any safety</option>
          <option value="GOOD">Good</option>
          <option value="MODERATE">Moderate</option>
          <option value="HIGH_RISK">High Risk</option>
        </select>

        <label className="flex items-center justify-between bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm">
          <span className="text-white/70">Only Available</span>
          <input
            type="checkbox"
            checked={filters.showOnlyAvailable}
            onChange={(e) =>
              setFilters((p) => ({ ...p, showOnlyAvailable: e.target.checked }))
            }
            className="scale-125"
          />
        </label>
      </div>
    </div>
  );
}