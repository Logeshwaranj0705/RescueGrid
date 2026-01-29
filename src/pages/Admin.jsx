import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import { db } from "../db/indexedDb.js";

export default function Admin() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const items = await db.reports.orderBy("createdAt").reverse().toArray();
      if (mounted) setReports(items);
    }
    load();
    return () => (mounted = false);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <TopBar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="text-2xl font-bold">Admin Dashboard (Demo)</div>
        <div className="text-white/60 mt-2 text-sm">
          Shows locally saved reports (in real system: from backend + WebSocket).
        </div>

        <div className="mt-5 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-glow">
          <div className="text-sm font-semibold">Incident Reports</div>
          <div className="mt-3 space-y-3">
            {reports.length === 0 ? (
              <div className="text-white/60 text-sm">No reports yet.</div>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="bg-black/20 border border-white/10 rounded-xl p-3">
                  <div className="text-xs text-white/60">Shelter: {r.shelterId}</div>
                  <div className="text-sm mt-1">{r.message}</div>
                  <div className="text-xs text-white/50 mt-2">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}