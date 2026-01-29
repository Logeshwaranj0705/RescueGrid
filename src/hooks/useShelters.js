import { useEffect, useMemo, useState } from "react";
import { db } from "../db/indexedDb.js";
import { mockShelters } from "../data/mockShelters.js";

function percentUsed(s) {
  return Math.round((s.capacityUsed / s.capacityTotal) * 100);
}

function scoreShelter(s) {
  // simple scoring: lower occupancy = better, safety matters
  const occ = percentUsed(s);
  const safetyPenalty =
    s.safety === "HIGH_RISK" ? 35 : s.safety === "MODERATE" ? 15 : 0;
  return Math.max(0, 100 - occ - safetyPenalty);
}

export function useShelters(filters) {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  // seed / refresh cache (demo: mock data)
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      // 1) read cached
      const cached = await db.shelters.toArray();
      if (mounted && cached.length) setShelters(cached);

      // 2) simulate “server update”
      // In real backend: fetch("/api/shelters")
      const latest = mockShelters;

      // store latest
      await db.shelters.clear();
      await db.shelters.bulkPut(latest);

      if (mounted) setShelters(latest);
      if (mounted) setLoading(false);
    }

    load();
    return () => { mounted = false; };
  }, []);

  const enriched = useMemo(() => {
    return shelters.map((s) => ({
      ...s,
      occupancyPct: percentUsed(s),
      score: scoreShelter(s)
    }));
  }, [shelters]);

  const filtered = useMemo(() => {
    const { query, resource, safety, showOnlyAvailable } = filters;

    return enriched
      .filter((s) => {
        if (!query) return true;
        return s.name.toLowerCase().includes(query.toLowerCase());
      })
      .filter((s) => {
        if (!resource) return true;
        return s.resources?.[resource] === true;
      })
      .filter((s) => {
        if (!safety) return true;
        return s.safety === safety;
      })
      .filter((s) => {
        if (!showOnlyAvailable) return true;
        return s.capacityUsed < s.capacityTotal;
      })
      .sort((a, b) => b.score - a.score);
  }, [enriched, filters]);

  return { shelters: filtered, loading };
}