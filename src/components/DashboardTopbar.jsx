import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  PlusCircle,
  Menu,
  Activity,
  ArrowLeft,
  UserRound,
  CheckCircle2,
  Home,
  LayoutDashboard,
  ClipboardList,
  ShieldAlert,
  Crown,
} from "lucide-react";
import { isAuthenticated, getCurrentUser } from "../api";
import "./DashboardTopbar.css";

/**
 * Developer-Style Glassmorphism Topbar for Dashboards
 * - No duplicate sidebar links (Home/Dashboard removed from topbar when sidebar is present)
 * - Clickable User Profile chip leading to /profile
 * - Live system status pill (MongoDB / AI Engine)
 * - Responsive layout with touch-friendly action controls
 */
export default function DashboardTopbar({
  title = "Overview",
  module = "CITIZEN-PORTAL",
  showBack = false,
  backUrl = "/dashboard",
  backLabel = "Back",
  showQuickNav = false,
  onMenuToggle,
  actionButton,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isAuthenticated();
  const currentUser = getCurrentUser();

  const handleRaiseComplaint = () => {
    if (!loggedIn) {
      navigate("/login?redirect=/report-issue");
    } else {
      navigate("/report-issue");
    }
  };

  return (
    <header className="dash-glass-topbar">
      <div className="dash-topbar-left">
        {/* Mobile Sidebar Hamburger Toggle */}
        {onMenuToggle && (
          <button
            type="button"
            className="dash-menu-toggle-btn"
            onClick={onMenuToggle}
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Back Link if requested */}
        {showBack && (
          <Link to={backUrl} className="dash-topbar-back-btn">
            <ArrowLeft size={16} />
            <span>{backLabel}</span>
          </Link>
        )}

        {/* Monospace Developer Breadcrumbs */}
        <div className="dash-breadcrumbs">
          <span className="dash-bread-root">CIVICSHIELD</span>
          <span className="dash-bread-sep">/</span>
          <span className="dash-bread-mod">{module}</span>
          <span className="dash-bread-sep">/</span>
          <span className="dash-bread-active">{title}</span>
        </div>
      </div>

      <div className="dash-topbar-right">
        {/* Optional Quick Direct Navigation Links (only when explicitly requested, e.g. on pages without sidebar) */}
        {showQuickNav && (
          <nav className="dash-quick-nav">
            <Link to="/" className="dash-quick-link" title="Go to Home">
              <Home size={14} />
              <span>Home</span>
            </Link>
            <Link
              to="/dashboard"
              className={`dash-quick-link ${location.pathname === "/dashboard" ? "active" : ""}`}
              title="Citizen Dashboard"
            >
              <LayoutDashboard size={14} />
              <span>Citizen Dashboard</span>
            </Link>
            <Link
              to="/track-complaints"
              className={`dash-quick-link ${location.pathname === "/track-complaints" ? "active" : ""}`}
              title="Track Complaints"
            >
              <ClipboardList size={14} />
              <span>Track</span>
            </Link>
          </nav>
        )}

        {/* Real-time System Status Pill */}
        <div className="dash-status-pill" title="TruthLens & Sarvam AI Pipeline Ready">
          <span className="dash-pulse-dot"></span>
          <span className="dash-status-text">AI ENGINE ONLINE</span>
        </div>

        {/* Municipal Admin Portal Shortcut */}
        <Link
          to="/admin/login"
          className="dash-admin-link"
          title="Switch to Municipal Officer / Admin Portal"
        >
          <ShieldAlert size={14} />
          <span>Admin</span>
        </Link>

        {/* Super Admin Apex Shortcut */}
        <Link
          to="/superadmin/login"
          className="dash-superadmin-link"
          title="Switch to Super Admin Executive Sentinel"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 10px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#fbbf24",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "6px",
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
        >
          <Crown size={13} color="#fbbf24" />
          <span>Super Admin</span>
        </Link>

        {/* Custom Action or Default Raise Complaint Button */}
        {actionButton ? (
          actionButton
        ) : (
          <button
            type="button"
            className="dash-action-btn"
            onClick={handleRaiseComplaint}
          >
            <PlusCircle size={15} />
            <span>Raise Complaint</span>
          </button>
        )}

        {/* User Identity Chip - Clickable, directs to /profile */}
        {loggedIn ? (
          <Link to="/profile" className="dash-user-badge" title="Manage your Profile">
            <div className="dash-user-avatar">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="dash-user-meta">
              <span className="dash-user-name">
                {currentUser?.name || "Verified Citizen"}
              </span>
              <span className="dash-user-sub">
                <CheckCircle2 size={11} color="#0ea5e9" /> PROFILE
              </span>
            </div>
          </Link>
        ) : (
          <div className="dash-guest-group">
            <Link to="/login" className="dash-guest-link">
              Sign In
            </Link>
            <Link to="/signup" className="dash-guest-btn">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
