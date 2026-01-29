import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PublicHome from "../pages/Public/PublicHome";
import Alerts from "../pages/Public/Alerts";
import Community from "../pages/Public/Community";
import AdminLogin from "../pages/Admin/AdminLogin";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageShelters from "../pages/Admin/ManageShelters";
import ManageAlerts from "../pages/Admin/ManageAlerts";
import Reports from "../pages/Admin/Reports";
import { AuthProvider, useAuth } from "../state/auth";
import Optimizer from "../pages/Admin/Optimizer";


function AdminGuard({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#050814] text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/community" element={<Community />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/shelters"
            element={
              <AdminGuard>
                <ManageShelters />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/alerts"
            element={
              <AdminGuard>
                <ManageAlerts />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminGuard>
                <Reports />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/optimize"
            element={
                <AdminGuard>
                <Optimizer />
                </AdminGuard>
            }
            />

        </Routes>
      </div>
    </AuthProvider>
  );
}
