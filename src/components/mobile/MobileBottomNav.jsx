import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, Bell, User } from "lucide-react";
import "./MobileBottomNav.css";

export default function MobileBottomNav({ notificationCount = 2 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const isHomeActive = currentPath === "/dashboard" || currentPath === "/";
  const isComplaintsActive = currentPath === "/track-complaints";
  const isNotificationsActive = currentPath === "/government-updates" || currentPath === "/updates";
  const isProfileActive = currentPath === "/profile";

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <button
        type="button"
        className={`nav-tab-btn ${isHomeActive ? "active" : ""}`}
        onClick={() => navigate("/dashboard")}
      >
        <div className="nav-icon-wrap">
          <Home size={22} strokeWidth={isHomeActive ? 2.5 : 1.8} />
        </div>
        <span>Home</span>
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${isComplaintsActive ? "active" : ""}`}
        onClick={() => navigate("/track-complaints")}
      >
        <div className="nav-icon-wrap">
          <FileText size={22} strokeWidth={isComplaintsActive ? 2.5 : 1.8} />
        </div>
        <span>My Complaints</span>
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${isNotificationsActive ? "active" : ""}`}
        onClick={() => navigate("/government-updates")}
      >
        <div className="nav-icon-wrap">
          <Bell size={22} strokeWidth={isNotificationsActive ? 2.5 : 1.8} />
          {notificationCount > 0 && <span className="nav-badge">{notificationCount}</span>}
        </div>
        <span>Notifications</span>
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${isProfileActive ? "active" : ""}`}
        onClick={() => navigate("/profile")}
      >
        <div className="nav-icon-wrap">
          <User size={22} strokeWidth={isProfileActive ? 2.5 : 1.8} />
        </div>
        <span>Profile</span>
      </button>
    </nav>
  );
}

