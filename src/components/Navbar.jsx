import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Menu,
  X,
  User,
  PlusCircle,
  Globe2,
  LayoutDashboard,
  Compass,
  FileSearch,
  Activity,
  LogOut,
  ChevronDown,
  ShieldAlert,
  Crown,
  Sparkles,
  ArrowRight,
  Home,
  Check,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [exploreDropdown, setExploreDropdown] = useState(false);
  const [portalsDropdown, setPortalsDropdown] = useState(false);
  const [guestDropdown, setGuestDropdown] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();

  // Load auth state from localStorage and listen to updates
  useEffect(() => {
    const syncUser = () => {
      try {
        const stored =
          localStorage.getItem("civicshield_current_user") ||
          localStorage.getItem("civicshield_user");
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    };

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("civicshield_auth_changed", syncUser);
    window.addEventListener("auth_state_changed", syncUser);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("civicshield_auth_changed", syncUser);
      window.removeEventListener("auth_state_changed", syncUser);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdown(false);
    setExploreDropdown(false);
    setPortalsDropdown(false);
    setGuestDropdown(false);
  }, [location.pathname]);

  // Lock background scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (
        !e.target.closest(".dev-nav-dropdown") &&
        !e.target.closest(".dev-profile-menu")
      ) {
        setExploreDropdown(false);
        setPortalsDropdown(false);
        setUserDropdown(false);
        setGuestDropdown(false);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("civicshield_token");
    localStorage.removeItem("civicshield_logged_in");
    localStorage.removeItem("civicshield_current_user");
    localStorage.removeItem("civicshield_user");
    setUser(null);
    setUserDropdown(false);
    window.dispatchEvent(new Event("civicshield_auth_changed"));
    window.dispatchEvent(new Event("auth_state_changed"));
    navigate("/login");
  };

  const toggleLanguage = () => {
    setLang(lang === "en" ? "ta" : "en");
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className={`dev-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="dev-navbar-container">
        {/* Brand / Logo with Official Emblem */}
        <Link to="/" className="dev-brand" aria-label="CivicShield AI Home">
          <div className="dev-brand-logo-wrap">
            <img
              src="/images/civicshield-logo.png"
              alt="CivicShield AI"
              className="dev-brand-logo-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.parentElement?.querySelector(".fallback-icon");
                if (fallback) fallback.style.display = "grid";
              }}
            />
            <div className="dev-brand-icon fallback-icon" style={{ display: "none" }}>
              <ShieldCheck size={22} className="brand-shield" />
            </div>
          </div>
          <div className="dev-brand-text">
            <span className="brand-title">
              CIVIC<span className="brand-accent">SHIELD</span>
            </span>
            <span className="brand-sub">AI SENTINEL OS</span>
          </div>
        </Link>

        {/* Primary Desktop Navigation Links (Spacious, Arrow Dropdowns) */}
        <div className="dev-nav-links">
          {/* Home Link */}
          <Link
            to="/"
            className={`dev-nav-item ${isActive("/") ? "active" : ""}`}
          >
            {t("nav_home") || "Home"}
          </Link>

          {/* Explore Dropdown with Arrow */}
          <div className="dev-nav-dropdown">
            <button
              type="button"
              className={`dev-dropdown-trigger ${exploreDropdown ? "open" : ""}`}
              onClick={() => {
                setExploreDropdown(!exploreDropdown);
                setPortalsDropdown(false);
                setUserDropdown(false);
                setGuestDropdown(false);
              }}
              aria-expanded={exploreDropdown}
            >
              <span>{t("nav_services") || "Explore"}</span>
              <ChevronDown size={14} className={`dev-chevron ${exploreDropdown ? "rotate" : ""}`} />
            </button>

            {exploreDropdown && (
              <div className="dev-dropdown-card dev-dropdown-menu">
                <Link
                  to="/services"
                  className="dev-dropdown-item"
                  onClick={() => setExploreDropdown(false)}
                >
                  <Sparkles size={16} color="#38bdf8" />
                  <div className="dev-dropdown-item-content">
                    <strong>Civic Services</strong>
                    <small>10 Municipal complaint categories</small>
                  </div>
                </Link>
                <Link
                  to="/about"
                  className="dev-dropdown-item"
                  onClick={() => setExploreDropdown(false)}
                >
                  <Activity size={16} color="#10b981" />
                  <div className="dev-dropdown-item-content">
                    <strong>How It Works</strong>
                    <small>TruthLens forensic verification flow</small>
                  </div>
                </Link>
                <Link
                  to="/nearby-issues"
                  className="dev-dropdown-item"
                  onClick={() => setExploreDropdown(false)}
                >
                  <Compass size={16} color="#fbbf24" />
                  <div className="dev-dropdown-item-content">
                    <strong>District Radar Map</strong>
                    <small>Live geotagged civic grievances</small>
                  </div>
                </Link>
                <Link
                  to="/government-updates"
                  className="dev-dropdown-item"
                  onClick={() => setExploreDropdown(false)}
                >
                  <Activity size={16} color="#a855f7" />
                  <div className="dev-dropdown-item-content">
                    <strong>Government Updates</strong>
                    <small>Official state alerts & action logs</small>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Track Complaint Link */}
          <Link
            to="/track-complaints"
            className={`dev-nav-item ${isActive("/track-complaints") ? "active" : ""}`}
          >
            <FileSearch size={15} />
            <span>{t("nav_track") || "Track Complaint"}</span>
          </Link>

          {/* Portals Dropdown with Arrow */}
          <div className="dev-nav-dropdown">
            <button
              type="button"
              className={`dev-dropdown-trigger dev-trigger-portals ${portalsDropdown ? "open" : ""}`}
              onClick={() => {
                setPortalsDropdown(!portalsDropdown);
                setExploreDropdown(false);
                setUserDropdown(false);
                setGuestDropdown(false);
              }}
              aria-expanded={portalsDropdown}
            >
              <LayoutDashboard size={15} color="#38bdf8" />
              <span>Portals</span>
              <ChevronDown size={14} className={`dev-chevron ${portalsDropdown ? "rotate" : ""}`} />
            </button>

            {portalsDropdown && (
              <div className="dev-dropdown-card dev-dropdown-menu">
                <Link
                  to="/dashboard"
                  className="dev-dropdown-item"
                  onClick={() => setPortalsDropdown(false)}
                >
                  <LayoutDashboard size={16} color="#38bdf8" />
                  <div className="dev-dropdown-item-content">
                    <strong style={{ color: "#38bdf8" }}>Citizen Dashboard</strong>
                    <small>File & track your personal grievances</small>
                  </div>
                </Link>
                <Link
                  to="/admin/login"
                  className="dev-dropdown-item dd-admin-item"
                  onClick={() => setPortalsDropdown(false)}
                >
                  <ShieldAlert size={16} color="#ef4444" />
                  <div className="dev-dropdown-item-content">
                    <strong style={{ color: "#f87171" }}>Department Admin Portal</strong>
                    <small>Municipal officer review & status updates</small>
                  </div>
                </Link>
                <Link
                  to="/superadmin/login"
                  className="dev-dropdown-item dd-superadmin-item"
                  onClick={() => setPortalsDropdown(false)}
                >
                  <Crown size={16} color="#fbbf24" />
                  <div className="dev-dropdown-item-content">
                    <strong style={{ color: "#fbbf24" }}>Super Admin Apex Sentinel</strong>
                    <small>Statewide surveillance & admin audit feed</small>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Action Cluster (Language, Raise Complaint, User / Sign In Dropdown) */}
        <div className="dev-nav-actions">
          {/* Tamil / English Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="dev-lang-btn"
            title={lang === "en" ? "தமிழுக்கு மாற்றுக" : "Switch to English"}
            aria-label="Toggle language"
          >
            <Globe2 size={16} />
            <span className="lang-code">{lang === "en" ? "தமிழ்" : "EN"}</span>
          </button>

          {/* Raise Complaint Primary CTA */}
          <Link to="/report-issue" className="dev-btn-cta">
            <PlusCircle size={16} />
            <span>{t("nav_raise_complaint") || "Raise Complaint"}</span>
          </Link>

          {/* User Auth / Profile Dropdown (If logged in) */}
          {user ? (
            <div className="dev-profile-menu">
              <button
                type="button"
                className="dev-profile-chip"
                onClick={() => {
                  setUserDropdown(!userDropdown);
                  setPortalsDropdown(false);
                  setExploreDropdown(false);
                  setGuestDropdown(false);
                }}
                aria-haspopup="true"
                aria-expanded={userDropdown}
              >
                <div className="dev-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="dev-username">{user.name || "Citizen"}</span>
                <ChevronDown size={14} className={`dev-chevron ${userDropdown ? "rotate" : ""}`} />
              </button>

              {userDropdown && (
                <div className="dev-dropdown-card">
                  <div className="dev-dropdown-header">
                    <p className="dd-name">{user.name || "Citizen"}</p>
                    <p className="dd-email">{user.email || ""}</p>
                    <span className="dd-role-badge">
                      {user.role === "admin"
                        ? "ADMINISTRATOR"
                        : user.role === "superadmin"
                        ? "SUPER ADMIN"
                        : "VERIFIED CITIZEN"}
                    </span>
                  </div>
                  <div className="dev-dropdown-divider" />
                  <Link
                    to="/profile"
                    className="dev-dropdown-item"
                    onClick={() => setUserDropdown(false)}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="dev-dropdown-item"
                    onClick={() => setUserDropdown(false)}
                  >
                    <LayoutDashboard size={16} />
                    <span>Citizen Dashboard</span>
                  </Link>
                  <div className="dev-dropdown-divider" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="dev-dropdown-item dd-danger"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest Sign In Dropdown with Arrow (Spacious & Clean) */
            <div className="dev-nav-dropdown dev-guest-menu">
              <button
                type="button"
                className={`dev-btn-login ${guestDropdown ? "open" : ""}`}
                onClick={() => {
                  setGuestDropdown(!guestDropdown);
                  setPortalsDropdown(false);
                  setExploreDropdown(false);
                  setUserDropdown(false);
                }}
                aria-expanded={guestDropdown}
              >
                <User size={15} />
                <span>Sign In</span>
                <ChevronDown size={13} className={`dev-chevron ${guestDropdown ? "rotate" : ""}`} />
              </button>

              {guestDropdown && (
                <div className="dev-dropdown-card dev-dropdown-menu dev-dropdown-right">
                  <div className="dev-dropdown-header">
                    <p className="dd-name">CivicShield Access</p>
                    <small style={{ color: "#94a3b8", fontSize: "11px" }}>Select account portal</small>
                  </div>
                  <div className="dev-dropdown-divider" />
                  <Link
                    to="/login"
                    className="dev-dropdown-item"
                    onClick={() => setGuestDropdown(false)}
                  >
                    <User size={16} color="#38bdf8" />
                    <div className="dev-dropdown-item-content">
                      <strong style={{ color: "#ffffff" }}>Citizen Login</strong>
                      <small>Access citizen grievance tracking</small>
                    </div>
                  </Link>
                  <Link
                    to="/signup"
                    className="dev-dropdown-item"
                    onClick={() => setGuestDropdown(false)}
                  >
                    <PlusCircle size={16} color="#34d399" />
                    <div className="dev-dropdown-item-content">
                      <strong style={{ color: "#34d399" }}>Citizen Sign Up</strong>
                      <small>Create new citizen profile</small>
                    </div>
                  </Link>
                  <div className="dev-dropdown-divider" />
                  <Link
                    to="/admin/login"
                    className="dev-dropdown-item dd-admin-item"
                    onClick={() => setGuestDropdown(false)}
                  >
                    <ShieldAlert size={16} color="#ef4444" />
                    <div className="dev-dropdown-item-content">
                      <strong style={{ color: "#f87171" }}>Department Admin</strong>
                      <small>Municipal officer portal</small>
                    </div>
                  </Link>
                  <Link
                    to="/superadmin/login"
                    className="dev-dropdown-item dd-superadmin-item"
                    onClick={() => setGuestDropdown(false)}
                  >
                    <Crown size={16} color="#fbbf24" />
                    <div className="dev-dropdown-item-content">
                      <strong style={{ color: "#fbbf24" }}>Super Admin Apex</strong>
                      <small>Executive sentinel oversight</small>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className={`dev-mobile-toggle ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          className="dev-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Glassmorphic Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="dev-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div className="dev-mob-scroll-container">
            {/* Primary Action Button: Raise Complaint */}
            <div className="dev-mob-section dev-mob-cta-wrap">
              <Link
                to="/report-issue"
                className="dev-mob-btn-cta"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PlusCircle size={18} />
                <span>{t("nav_raise_complaint") || "Raise Complaint"}</span>
                <ArrowRight size={16} className="dev-mob-cta-arrow" />
              </Link>
            </div>

            {/* Authentication & Portals Section */}
            <div className="dev-mob-section dev-mob-auth-section">
              {user ? (
                <div className="dev-mob-user-card">
                  <div className="dev-mob-user-info">
                    <div className="dev-avatar dev-avatar-lg">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="dev-mob-user-meta">
                      <p className="dev-mob-username">{user.name || "Citizen"}</p>
                      <p className="dev-mob-email">{user.email || ""}</p>
                      <span className="dd-role-badge">
                        {user.role === "admin"
                          ? "ADMINISTRATOR"
                          : user.role === "superadmin"
                          ? "SUPER ADMIN"
                          : "VERIFIED CITIZEN"}
                      </span>
                    </div>
                  </div>
                  <div className="dev-mob-user-actions">
                    <Link
                      to="/profile"
                      className="dev-mob-user-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      className="dev-mob-user-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard size={16} color="#38bdf8" />
                      <span>Citizen Dashboard</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="dev-mob-user-link dev-mob-logout"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="dev-mob-portals-card">
                  <div className="dev-mob-section-label">
                    <span>Account Access & Portals</span>
                  </div>
                  <div className="dev-mob-portal-grid">
                    <Link
                      to="/login"
                      className="dev-mob-portal-btn dev-portal-login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={16} color="#38bdf8" />
                      <div className="dev-mob-portal-text">
                        <strong>Citizen Login</strong>
                        <small>Access grievance tracking</small>
                      </div>
                    </Link>
                    <Link
                      to="/signup"
                      className="dev-mob-portal-btn dev-portal-signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PlusCircle size={16} color="#34d399" />
                      <div className="dev-mob-portal-text">
                        <strong>Citizen Sign Up</strong>
                        <small>Create new profile</small>
                      </div>
                    </Link>
                    <Link
                      to="/admin/login"
                      className="dev-mob-portal-btn dev-portal-admin"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShieldAlert size={16} color="#f87171" />
                      <div className="dev-mob-portal-text">
                        <strong>Department Admin</strong>
                        <small>Municipal officer portal</small>
                      </div>
                    </Link>
                    <Link
                      to="/superadmin/login"
                      className="dev-mob-portal-btn dev-portal-super"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Crown size={16} color="#fbbf24" />
                      <div className="dev-mob-portal-text">
                        <strong>Super Admin Apex</strong>
                        <small>Statewide oversight</small>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="dev-mob-section dev-mob-nav-section">
              <div className="dev-mob-section-label">
                <span>Navigation</span>
              </div>
              <div className="dev-mob-links-list">
                <Link
                  to="/"
                  className={`dev-mob-nav-item ${isActive("/") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={17} />
                  <span>{t("nav_home") || "Home"}</span>
                </Link>
                <Link
                  to="/services"
                  className={`dev-mob-nav-item ${isActive("/services") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles size={17} color="#38bdf8" />
                  <span>{t("nav_services") || "Civic Services Hub"}</span>
                </Link>
                <Link
                  to="/about"
                  className={`dev-mob-nav-item ${isActive("/about") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Activity size={17} color="#10b981" />
                  <span>{t("nav_how_it_works") || "How It Works (TruthLens)"}</span>
                </Link>
                <Link
                  to="/track-complaints"
                  className={`dev-mob-nav-item ${isActive("/track-complaints") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileSearch size={17} color="#38bdf8" />
                  <span>{t("nav_track") || "Track Complaint Status"}</span>
                </Link>
                <Link
                  to="/nearby-issues"
                  className={`dev-mob-nav-item ${isActive("/nearby-issues") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Compass size={17} color="#fbbf24" />
                  <span>District Radar Grievances</span>
                </Link>
                <Link
                  to="/government-updates"
                  className={`dev-mob-nav-item ${isActive("/government-updates") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Activity size={17} color="#c084fc" />
                  <span>Government Updates & Alerts</span>
                </Link>
              </div>
            </div>

            {/* Language Selector */}
            <div className="dev-mob-section dev-mob-lang-section">
              <button
                type="button"
                onClick={toggleLanguage}
                className="dev-mob-lang-card"
                aria-label="Toggle Tamil or English"
              >
                <div className="dev-mob-lang-left">
                  <Globe2 size={18} color="#38bdf8" />
                  <div className="dev-mob-lang-text">
                    <strong>Language / மொழி</strong>
                    <small>Currently: {lang === "en" ? "English" : "தமிழ்"}</small>
                  </div>
                </div>
                <div className="dev-mob-lang-badge">
                  <span>{lang === "en" ? "தமிழ்" : "EN"}</span>
                </div>
              </button>
            </div>

            {/* Bottom OS Sentinel Metadata */}
            <div className="dev-mob-footer">
              <span>CIVICSHIELD AI SENTINEL OS • v2.4.0</span>
              <p>Transparent Municipal Grievance Intelligence</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
