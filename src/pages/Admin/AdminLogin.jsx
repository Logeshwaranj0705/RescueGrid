import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../state/auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const { loginAdmin } = useAuth();
  const nav = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !pass) return setError("Please enter all credentials");
    if (!email.toLowerCase().includes("admin")) return setError("Unauthorized email");
    if (!pass.toLowerCase().includes("admin")) return setError("Incorrect password");

    loginAdmin({ tokenValue: "demo_token_" + Date.now() });
    nav("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wide text-white">
            Authority Access
          </h1>
          <p className="text-sm text-white/60 mt-2">
            Restricted to disaster response officials
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="mt-8 space-y-5">
          {/* Email */}
          <div>
            <label className="text-xs text-white/60 mb-1 block">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@rescuegrid.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/40 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-white/60 mb-1 block">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/40 transition"
            />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
            >
              {error}
            </motion.div>
          )}

          {/* Button */}
          <button
            type="submit"
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-black hover:opacity-90 transition shadow-lg"
          >
            Secure Login
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-white/40">
          RescueGrid • Admin Control Panel
        </div>
      </motion.div>
    </div>
  );
}