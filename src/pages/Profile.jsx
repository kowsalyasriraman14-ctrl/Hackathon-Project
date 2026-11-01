import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  Edit3,
  CheckCircle2,
  Clock3,
  ClipboardList,
  PlusCircle,
  Save,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Bell,
  Globe,
  HelpCircle,
  Info,
  MapPinned,
} from "lucide-react";

import Navbar from "../components/Navbar";
import {
  getCurrentUser,
  performLogout,
  isAuthenticated,
  updateUserProfile,
  fetchComplaints,
} from "../api";
import { useLanguage } from "../context/LanguageContext";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import LanguageModal from "../components/mobile/LanguageModal";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [myComplaints, setMyComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [langModalOpen, setLangModalOpen] = useState(false);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [city, setCity] = useState(currentUser?.city || "Salem, Tamil Nadu");
  const [address, setAddress] = useState(currentUser?.address || "Fairlands, Salem");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Auth Protection
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login?redirect=profile");
    }
  }, [navigate]);

  // Load user data and user complaints
  useEffect(() => {
    const handleAuthChange = () => {
      const u = getCurrentUser();
      setCurrentUser(u);
      if (u) {
        setName(u.name || "");
        setPhone(u.phone || "");
        setCity(u.city || "Salem, Tamil Nadu");
        setAddress(u.address || "");
      }
    };
    window.addEventListener("civicshield_auth_changed", handleAuthChange);

    async function loadUserComplaints() {
      try {
        setLoadingComplaints(true);
        const all = await fetchComplaints();
        const userEmail = currentUser?.email?.toLowerCase();
        const userFiltered = all.filter(
          (c) =>
            (userEmail && c.citizen?.email?.toLowerCase() === userEmail) ||
            (currentUser?.id && c.citizen?.userId === currentUser?.id)
        );
        setMyComplaints(userFiltered.length > 0 ? userFiltered : all.slice(0, 3));
      } catch (err) {
        console.warn("Could not fetch user complaints:", err.message);
      } finally {
        setLoadingComplaints(false);
      }
    }

    loadUserComplaints();

    return () => {
      window.removeEventListener("civicshield_auth_changed", handleAuthChange);
    };
  }, [currentUser?.email, currentUser?.id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const res = await updateUserProfile({
        name,
        phone,
        city,
        address,
      });

      if (res.success) {
        setStatusMessage({ type: "success", text: "Profile details updated successfully!" });
        setIsEditing(false);
        setCurrentUser(getCurrentUser());
      } else {
        throw new Error(res.message || "Failed to update profile");
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Error saving profile details" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    performLogout();
    navigate("/");
  };

  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : "C";

  return (
    <div className="profile-page-wrapper">
      <Navbar active="profile" />

      <main className="profile-main-container">
        {/* ====================================================
            MOBILE PROFILE VIEW (SCREEN 05 FROM REFERENCE SPEC)
            ==================================================== */}
        <section className="mobile-reference-profile">
          <div className="mobile-user-profile-header">
            <div className="mobile-user-avatar-circle">
              <span>{userInitial}</span>
            </div>
            <div className="mobile-user-info-text">
              <h2>{currentUser?.name || "Kowsalya S"}</h2>
              <p>{currentUser?.email || "kowsalya@gmail.com"}</p>
            </div>
          </div>

          <div className="mobile-profile-menu-container">
            <button
              type="button"
              className="mobile-profile-menu-row"
              onClick={() => navigate("/track-complaints")}
            >
              <div className="menu-row-left">
                <ClipboardList size={19} color="#0284c7" />
                <span>My Complaints</span>
              </div>
              <ChevronRight size={18} color="#94a3b8" />
            </button>

            <button
              type="button"
              className="mobile-profile-menu-row"
              onClick={() => setIsEditing(true)}
            >
              <div className="menu-row-left">
                <MapPinned size={19} color="#0d9488" />
                <span>Saved Locations</span>
              </div>
              <div className="menu-row-right">
                <small>{city}</small>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </button>

            <button
              type="button"
              className="mobile-profile-menu-row"
              onClick={() => navigate("/government-updates")}
            >
              <div className="menu-row-left">
                <Bell size={19} color="#eab308" />
                <span>Notifications</span>
              </div>
              <div className="menu-row-right">
                <span className="mobile-badge-num">2</span>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </button>

            <button
              type="button"
              className="mobile-profile-menu-row"
              onClick={() => setLangModalOpen(true)}
            >
              <div className="menu-row-left">
                <Globe size={19} color="#3b82f6" />
                <span>Language</span>
              </div>
              <div className="menu-row-right">
                <span className="mobile-lang-tag">{lang === "ta" ? "தமிழ்" : "English"}</span>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </button>

            <button
              type="button"
              className="mobile-profile-menu-row"
              onClick={() => alert("CivicShield 24x7 Municipal Support: 1800-425-CIVIC")}
            >
              <div className="menu-row-left">
                <HelpCircle size={19} color="#a855f7" />
                <span>Help & Support</span>
              </div>
              <ChevronRight size={18} color="#94a3b8" />
            </button>

            <button
              type="button"
              className="mobile-profile-menu-row"
              onClick={() => alert("CivicShield AI v2.0 - Powered by Sarvam AI & TruthLens Engine")}
            >
              <div className="menu-row-left">
                <Info size={19} color="#64748b" />
                <span>About CivicShield AI</span>
              </div>
              <ChevronRight size={18} color="#94a3b8" />
            </button>
          </div>

          <button
            type="button"
            className="mobile-profile-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </section>

        {/* ====================================================
            DESKTOP PROFILE SECTIONS (PRESERVED)
            ==================================================== */}
        <div className="desktop-profile-wrapper">
        {/* HEADER HERO */}
        <section className="profile-hero-card">
          <div className="profile-avatar-large">
            <span>{userInitial}</span>
            <span className="profile-avatar-badge" title="Active Citizen Account">
              <CheckCircle2 size={18} />
            </span>
          </div>

          <div className="profile-hero-info">
            <div className="profile-title-row">
              <h1>{currentUser?.name || "Citizen Account"}</h1>
              <span className="profile-role-pill">
                <ShieldCheck size={14} /> VERIFIED CITIZEN
              </span>
            </div>

            <p className="profile-email-line">
              <Mail size={15} /> {currentUser?.email || "citizen@civicshield.gov.in"}
            </p>

            <div className="profile-meta-tags">
              <span>
                <MapPin size={14} /> {city}
              </span>
              <span>
                <Calendar size={14} /> Member since 2026
              </span>
            </div>
          </div>

          <div className="profile-hero-actions">
            <button
              type="button"
              className="profile-btn-edit"
              onClick={() => setIsEditing((prev) => !prev)}
            >
              <Edit3 size={16} />
              <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
            </button>

            <button
              type="button"
              className="profile-btn-logout"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </section>

        {statusMessage.text && (
          <div className={`profile-status-banner ${statusMessage.type}`}>
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* TWO-COLUMN LAYOUT */}
        <div className="profile-grid">
          {/* LEFT: PERSONAL INFORMATION OR EDIT FORM */}
          <div className="profile-card">
            <div className="card-header">
              <h3>
                <UserRound size={18} color="#0284c7" />
                {isEditing ? "Edit Account Details" : "Personal Information"}
              </h3>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="profile-edit-form">
                <div className="profile-input-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="profile-input-group">
                  <label>Email Address (Account ID)</label>
                  <input
                    type="email"
                    value={currentUser?.email || ""}
                    disabled
                    style={{ background: "#f8fafc", cursor: "not-allowed" }}
                  />
                  <small style={{ color: "#64748b" }}>Email cannot be changed.</small>
                </div>

                <div className="profile-input-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="profile-input-group">
                  <label>City / District</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Salem, Tamil Nadu"
                  />
                </div>

                <div className="profile-input-group">
                  <label>Street Address / Area</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 4th Cross, Fairlands"
                  />
                </div>

                <div className="profile-form-buttons">
                  <button
                    type="button"
                    className="profile-btn-cancel"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="profile-btn-save"
                    disabled={saving}
                  >
                    <Save size={16} />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details-list">
                <div className="profile-detail-item">
                  <span className="detail-label">Full Name</span>
                  <strong className="detail-value">{currentUser?.name || "Citizen"}</strong>
                </div>

                <div className="profile-detail-item">
                  <span className="detail-label">Email Address</span>
                  <strong className="detail-value">{currentUser?.email || "Not Provided"}</strong>
                </div>

                <div className="profile-detail-item">
                  <span className="detail-label">Phone Number</span>
                  <strong className="detail-value">{phone || "Not Set (Click Edit)"}</strong>
                </div>

                <div className="profile-detail-item">
                  <span className="detail-label">Residential City</span>
                  <strong className="detail-value">{city}</strong>
                </div>

                <div className="profile-detail-item">
                  <span className="detail-label">Primary Address</span>
                  <strong className="detail-value">{address || "Salem, Tamil Nadu"}</strong>
                </div>

                <div className="profile-detail-item">
                  <span className="detail-label">Citizen Verification</span>
                  <span className="detail-tag-green">Identity Verified (Level 2)</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: QUICK CITIZEN STATS & MY COMPLAINTS */}
          <div className="profile-right-col">
            {/* STATS STRIP */}
            <div className="profile-stats-card">
              <div className="stat-box">
                <span className="stat-num">{myComplaints.length}</span>
                <span className="stat-desc">Filed Grievances</span>
              </div>
              <div className="stat-box">
                <span className="stat-num" style={{ color: "#f59e0b" }}>
                  {myComplaints.filter((c) => c.status !== "Resolved").length}
                </span>
                <span className="stat-desc">In Progress</span>
              </div>
              <div className="stat-box">
                <span className="stat-num" style={{ color: "#10b981" }}>
                  {myComplaints.filter((c) => c.status === "Resolved").length}
                </span>
                <span className="stat-desc">Resolved</span>
              </div>
            </div>

            {/* MY COMPLAINTS LIST */}
            <div className="profile-card">
              <div className="card-header" style={{ justifyContent: "space-between" }}>
                <h3>
                  <ClipboardList size={18} color="#0284c7" />
                  My Grievances
                </h3>
                <Link to="/report-issue" className="profile-link-new">
                  <PlusCircle size={15} /> New Report
                </Link>
              </div>

              {loadingComplaints ? (
                <p style={{ padding: "20px", color: "#64748b" }}>Loading complaints...</p>
              ) : myComplaints.length > 0 ? (
                <div className="profile-complaints-list">
                  {myComplaints.map((comp) => (
                    <div
                      key={comp.trackingId || comp._id}
                      className="profile-comp-row"
                      onClick={() => navigate(`/track-complaints?id=${comp.trackingId || comp._id}`)}
                    >
                      <div>
                        <strong>{comp.title || "Civic Complaint"}</strong>
                        <small>
                          {comp.trackingId || comp._id} · {comp.category}
                        </small>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className={`comp-status-pill ${comp.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                          {comp.status || "Received"}
                        </span>
                        <ArrowRight size={14} className="comp-arrow" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-state">
                  <p>You haven't submitted any complaints yet.</p>
                  <Link to="/report-issue" className="btn-start-report">
                    <PlusCircle size={16} /> Submit Your First Grievance
                  </Link>
                </div>
              )}
            </div>

            {/* QUICK ACTIONS CARD */}
            <div className="profile-card quick-links-card">
              <h4>Direct Navigation</h4>
              <div className="quick-links-grid">
                <Link to="/dashboard" className="quick-link-btn">
                  <ShieldCheck size={16} />
                  <span>Citizen Dashboard</span>
                </Link>
                <Link to="/track-complaints" className="quick-link-btn">
                  <ClipboardList size={16} />
                  <span>Track Status</span>
                </Link>
                <Link to="/report-issue" className="quick-link-btn">
                  <PlusCircle size={16} />
                  <span>File Complaint</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* LANGUAGE SELECTION MODAL (SCREEN 06) */}
        <LanguageModal
          isOpen={langModalOpen}
          onClose={() => setLangModalOpen(false)}
        />

        {/* PERSISTENT MOBILE BOTTOM NAVIGATION (SCREEN 05) */}
        <MobileBottomNav />
      </main>
    </div>
  );
}

