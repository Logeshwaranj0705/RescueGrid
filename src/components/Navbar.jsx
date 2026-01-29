import { Link, useLocation } from "react-router-dom";
import { Shield, MapPin, Bell, Users, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../state/auth";

function Tab({ to, active, icon: Icon, children }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-xl text-sm border flex items-center gap-2 transition ${
        active ? "bg-white/10 border-white/10" : "border-white/5 hover:bg-white/5"
      }`}
    >
      <Icon size={16} />
      {children}
    </Link>
  );
}

export default function Navbar() {
  const loc = useLocation();
  const { isAdmin, logout } = useAuth();

  return (
    <div className="sticky top-0 z-50 bg-black/40 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/20 flex items-center justify-center shadow-glow">
            <Shield />
          </div>
          <div>
            <div className="text-lg font-semibold leading-none">RescueGrid</div>
            <div className="text-xs text-white/50">Localized Shelter Allocation Intelligence</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Tab to="/" active={loc.pathname === "/"} icon={MapPin}>Shelters</Tab>
          <Tab to="/alerts" active={loc.pathname === "/alerts"} icon={Bell}>Alerts</Tab>
          <Tab to="/community" active={loc.pathname === "/community"} icon={Users}>Community</Tab>

          {isAdmin ? (
            <>
              <Tab to="/admin" active={loc.pathname === "/admin"} icon={LayoutDashboard}>Admin</Tab>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-xl text-sm border border-white/5 hover:bg-white/5 flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Tab to="/admin/login" active={loc.pathname === "/admin/login"} icon={LayoutDashboard}>Authority</Tab>
          )}
        </div>
      </div>
    </div>
  );
}
