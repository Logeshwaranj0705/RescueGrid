import React, { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "public");

  const loginAdmin = ({ tokenValue }) => {
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("role", "admin");
    setToken(tokenValue);
    setRole("admin");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setRole("public");
  };

  const value = useMemo(
    () => ({
      token,
      role,
      isAdmin: role === "admin" && !!token,
      loginAdmin,
      logout,
    }),
    [token, role]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
