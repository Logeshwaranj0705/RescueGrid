import React from "react";
import { Shield, MapPin, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function TopBar() {
  const loc = useLocation();

  return (
    <div className="sticky top-0 z-40 bg-[#0b1220]/70 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-glow">
            <Shield />
          </div>
          <div>
            <div className="text-lg font-semibold">ShelterFlow</div>
            <div className="text-xs text-white/50">
              Smart Shelter Finder • Offline-first PWA
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className={`px-3 py-2 rounded-xl text-sm border ${
              loc.pathname === "/"
                ? "bg-white/10 border-white/10"
                : "bg-transparent border-white/5 hover:bg-white/5"
            } flex items-center gap-2`}
          >
            <MapPin size={16} /> Public
          </Link>
          <Link
            to="/admin"
            className={`px-3 py-2 rounded-xl text-sm border ${
              loc.pathname === "/admin"
                ? "bg-white/10 border-white/10"
                : "bg-transparent border-white/5 hover:bg-white/5"
            } flex items-center gap-2`}
          >
            <LayoutDashboard size={16} /> Admin
          </Link>
        </div>
      </div>
    </div>
  );
}