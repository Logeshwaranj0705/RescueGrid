import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  MapPin,
  Bell,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../state/auth";
import { useEffect, useState } from "react";

function Tab({ to, active, icon: Icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isActive = (path) => loc.pathname === path;

  return (
    <div className="sticky top-0 z-50 bg-black/40 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/20 flex items-center justify-center shadow-glow">
            <Shield />
          </div>
          <div>
            <div className="text-lg font-semibold leading-none">RescueGrid</div>
            <div className="text-xs text-white/50">
              Localized Shelter Allocation Intelligence
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Tab to="/" active={isActive("/")} icon={MapPin}>
            Shelters
          </Tab>
          <Tab to="/alerts" active={isActive("/alerts")} icon={Bell}>
            Alerts
          </Tab>
          <Tab to="/community" active={isActive("/community")} icon={Users}>
            Community
          </Tab>

          {isAdmin ? (
            <>
              <Tab to="/admin" active={isActive("/admin")} icon={LayoutDashboard}>
                Admin
              </Tab>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-xl text-sm border border-white/5 hover:bg-white/5 flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Tab
              to="/admin/login"
              active={isActive("/admin/login")}
              icon={LayoutDashboard}
            >
              Authority
            </Tab>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          aria-label="Open menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 right-0 top-full z-50 border-t border-white/10 bg-black/80 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
              <Tab
                to="/"
                active={isActive("/")}
                icon={MapPin}
                onClick={() => setOpen(false)}
              >
                Shelters
              </Tab>
              <Tab
                to="/alerts"
                active={isActive("/alerts")}
                icon={Bell}
                onClick={() => setOpen(false)}
              >
                Alerts
              </Tab>
              <Tab
                to="/community"
                active={isActive("/community")}
                icon={Users}
                onClick={() => setOpen(false)}
              >
                Community
              </Tab>

              <div className="h-px bg-white/10 my-2" />

              {isAdmin ? (
                <>
                  <Tab
                    to="/admin"
                    active={isActive("/admin")}
                    icon={LayoutDashboard}
                    onClick={() => setOpen(false)}
                  >
                    Admin
                  </Tab>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="px-3 py-2 rounded-xl text-sm border border-white/10 bg-white/5 hover:bg-white/10 flex items-center gap-2 transition"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <Tab
                  to="/admin/login"
                  active={isActive("/admin/login")}
                  icon={LayoutDashboard}
                  onClick={() => setOpen(false)}
                >
                  Authority
                </Tab>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
