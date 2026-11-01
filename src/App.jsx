import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Services from "./pages/Services";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

import CitizenDashboard from "./pages/CitizenDashboard";
import ReportIssue from "./pages/ReportIssue";
import TrackComplaints from "./pages/TrackComplaints";
import Profile from "./pages/Profile";
import NearbyIssues from "./pages/NearbyIssues";
import GovernmentUpdates from "./pages/GovernmentUpdates";

// Admin Module Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Super Admin Module Pages
import SuperAdminLogin from "./pages/superadmin/SuperAdminLogin";
import SuperAdminSignup from "./pages/superadmin/SuperAdminSignup";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";

import { isAuthenticated, isAdminAuthenticated, isSuperAdminAuthenticated } from "./api";
import { LanguageProvider } from "./context/LanguageContext";
import { initNativeApp, isNativePlatform } from "./utils/nativeBridge";
import MobileWelcome from "./components/mobile/MobileWelcome";

// Protect Citizen routes that require active authentication
function ProtectedRoute({ children, redirect = "dashboard" }) {
  return isAuthenticated() ? (
    children
  ) : (
    <Navigate to={`/login?redirect=${redirect}`} replace />
  );
}

// Protect Admin routes from unauthorized access or regular citizens
function AdminProtectedRoute({ children }) {
  return isAdminAuthenticated() ? (
    children
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

// Protect Super Admin routes from unauthorized access
function SuperAdminProtectedRoute({ children }) {
  return isSuperAdminAuthenticated() ? (
    children
  ) : (
    <Navigate to="/superadmin/login" replace />
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    initNativeApp(navigate);
  }, [navigate]);

  return (
    <Routes>
      {/* Citizen Authentication Pages */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Mobile Welcome Flow Screen (Screen 01) */}
      <Route
        path="/welcome"
        element={<MobileWelcome onEnterApp={() => navigate(isAuthenticated() ? "/dashboard" : "/signup")} />}
      />

      {/* Admin Authentication Pages */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/signin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/signup" element={<AdminSignup />} />
      <Route path="/admin/register" element={<Navigate to="/admin/signup" replace />} />

      {/* Super Admin Authentication Pages */}
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route path="/superadmin/signin" element={<Navigate to="/superadmin/login" replace />} />
      <Route path="/superadmin/signup" element={<SuperAdminSignup />} />
      <Route path="/superadmin/register" element={<Navigate to="/superadmin/signup" replace />} />

      {/* Public Website Pages - Always accessible */}
      <Route
        path="/"
        element={
          isNativePlatform() && !isAuthenticated() ? (
            <MobileWelcome onEnterApp={() => navigate(isAuthenticated() ? "/dashboard" : "/signup")} />
          ) : (
            <Landing />
          )
        }
      />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/track-complaints" element={<TrackComplaints />} />
      <Route path="/nearby-issues" element={<NearbyIssues />} />
      <Route path="/map" element={<Navigate to="/nearby-issues" replace />} />
      <Route path="/government-updates" element={<GovernmentUpdates />} />
      <Route path="/updates" element={<Navigate to="/government-updates" replace />} />

      {/* CITIZEN PROTECTED ROUTES - Unauthenticated users are redirected to Login */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute redirect="dashboard">
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute redirect="profile">
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report-issue"
        element={
          <ProtectedRoute redirect="report-issue">
            <ReportIssue />
          </ProtectedRoute>
        }
      />

      {/* ADMIN PROTECTED ROUTES - Citizens and unauthenticated users are redirected to Admin Login */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/government-dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />

      {/* SUPER ADMIN PROTECTED ROUTES - Only authorized Super Admins allowed */}
      <Route
        path="/superadmin"
        element={
          <SuperAdminProtectedRoute>
            <SuperAdminDashboard />
          </SuperAdminProtectedRoute>
        }
      />
      <Route
        path="/superadmin/dashboard"
        element={
          <SuperAdminProtectedRoute>
            <SuperAdminDashboard />
          </SuperAdminProtectedRoute>
        }
      />

      {/* Fallback unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
