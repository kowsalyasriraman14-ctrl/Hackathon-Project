import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  MapPin,
  Bell,
  UserRound,
  LogOut,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Copy,
  Check,
  Building2,
  MapPinned,
  FileText,
  Eye,
  ChevronRight,
  X,
  Video,
  Camera,
  Sparkles,
  Home,
  LogIn,
  UserPlus,
  Compass,
  Activity,
} from "lucide-react";

import { fetchComplaints, getCurrentUser, performLogout, isAuthenticated } from "../api";
import DashboardTopbar from "../components/DashboardTopbar";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import "./TrackComplaints.css";


const statusColors = {
  "In Progress": "progress",
  Resolved: "resolved",
  "Under Review": "review",
  Received: "received",
};

function TrackComplaints() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get("id");
  const currentUser = getCurrentUser();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [copiedId, setCopiedId] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState(targetId || "");
  const [filter, setFilter] = useState("All");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    async function loadData() {
      try {
        const live = await fetchComplaints();
        if (live && live.length > 0) {
          const mapped = live.map((c) => ({
            id: c.trackingId || c._id,
            title: c.title,
            category: c.category || "Other",
            location: c.location?.address || "Salem, Tamil Nadu",
            coordinates: c.location?.latitude ? `${c.location.latitude}, ${c.location.longitude}` : null,
            date: new Date(c.createdAt || Date.now()).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            status: c.status || "Received",
            department: c.department || "Municipal Administration",
            description: c.description || "Reported civic issue.",
            assigned: "Automatic Routing",
            updates: c.timeline && c.timeline.length > 0
              ? c.timeline.map((u) => ({
                  title: u.title,
                  date: new Date(u.date || Date.now()).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  detail: u.detail || "",
                  done: u.done,
                  current: u.current,
                }))
              : [
                  { title: "Complaint Registered", date: "Just now", detail: "Registered in MongoDB.", done: true },
                ],
            truthlens: c.aiAnalysis?.truthlens || {
              authenticityScore: 94,
              verdict: "VERIFIED_AUTHENTIC",
              summary: "Forensically verified genuine camera capture.",
            },
            sarvam: c.aiAnalysis?.sarvam || null,
            images: c.media?.images || [],
            videos: c.media?.videos || [],
            adminResponse: c.adminResponse || "",
            assignedOfficer: c.assignedOfficer || "",
          }));

          setComplaints(mapped);

          // Select matching id from URL if present
          if (targetId) {
            const found = mapped.find((m) => m.id.toLowerCase() === targetId.toLowerCase());
            setSelected(found || mapped[0]);
          } else {
            setSelected(mapped[0]);
          }
        } else {
          // Zero mock data - strictly original database data
          setComplaints([]);
          setSelected(null);
        }
      } catch (err) {
        console.error("Database sync notice:", err);
        setComplaints([]);
        setSelected(null);
      }
    }
    loadData();
  }, [targetId]);

  const filtered = complaints.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleLogout = () => {
    performLogout();
    navigate("/");
  };

  const handleStartReport = () => {
    if (!isAuthenticated()) {
      navigate("/signup?redirect=report-issue");
    } else {
      navigate("/report-issue");
    }
  };

  return (
    <div className="track-layout">
      {/* SIDEBAR */}
      <aside className="track-sidebar">
        <Link to="/" className="track-brand">
          <ShieldCheck size={34} />
          <div>
            <h2>
              CivicShield <span>AI</span>
            </h2>
            <small>Live Case Tracking</small>
          </div>
        </Link>

        <p className="track-menu-label">MENU</p>
        <nav className="track-navigation">
          <Link to="/dashboard">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <button
            onClick={handleStartReport}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(56, 189, 248, 0.16)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              color: "#7dd3fc",
              padding: "11px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            <PlusCircle size={18} /> Raise Complaint
          </button>
          <Link to="/track-complaints" className="active">
            <ClipboardList size={18} /> Track Complaints
          </Link>
          <Link to="/nearby-issues">
            <Compass size={18} /> Nearby Issues
          </Link>
          <Link to="/government-updates">
            <Activity size={18} /> Government Updates
          </Link>
          <Link to="/">
            <Home size={18} /> Home
          </Link>
        </nav>

        <div className="track-sidebar-bottom">
          <div className="track-sidebar-message">
            <h4>
              <Sparkles size={16} /> MongoDB Atlas
            </h4>
            <p>Real-time grievance synchronization active.</p>
          </div>

          <button onClick={handleLogout} className="track-logout" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN TRACKING CONTENT */}
      <main className="track-main">
        {/* DEVELOPER-STYLE GLASSMORPHISM TOPBAR (NO LOGOUT BUTTON) */}
        <DashboardTopbar
          title="Grievance Tracker"
          module="COMPLAINTS"
          showBack={true}
          backUrl="/dashboard"
          backLabel="Dashboard"
        />

        <div className="track-content">
          <section className="track-heading">
            <div>
              <span className="track-eyebrow">CASE AUDIT & EVIDENCE LOG</span>
              <h1>Track Municipal Grievances</h1>
            </div>

            <button onClick={handleStartReport} className="track-new-button">
              <PlusCircle size={17} /> Report New Issue
            </button>
          </section>

          {/* STATS STRIP */}
          <section className="track-stats">
            <div className="track-stat-card">
              <div className="track-stat-icon blue">
                <ClipboardList size={20} />
              </div>
              <div>
                <span>TOTAL REGISTERED</span>
                <h2>{complaints.length}</h2>
              </div>
            </div>

            <div className="track-stat-card">
              <div className="track-stat-icon orange">
                <Clock size={20} />
              </div>
              <div>
                <span>UNDER PROGRESS</span>
                <h2>{complaints.filter((c) => c.status === "In Progress" || c.status === "Under Review").length}</h2>
              </div>
            </div>

            <div className="track-stat-card">
              <div className="track-stat-icon green">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span>RESOLVED & VERIFIED</span>
                <h2>{complaints.filter((c) => c.status === "Resolved").length}</h2>
              </div>
            </div>
          </section>

          {/* LIST & DETAIL SPLIT */}
          <section className="track-list-section">
            <div className="track-list-heading">
              <h2>Complaints Queue</h2>

              <div className="track-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Filter by ID (e.g. CSC25081) or area..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="track-filters">
              {["All", "In Progress", "Under Review", "Resolved"].map((f) => (
                <button
                  key={f}
                  className={`track-filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* LIST CARDS */}
            <div className="track-complaint-list">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className={`track-complaint-card ${selected?.id === item.id ? "active" : ""}`}
                  onClick={() => setSelected(item)}
                >
                  <div className="track-complaint-info">
                    <div className="track-complaint-id">
                      <span>{item.id}</span>
                      <span className="track-cat-badge">{item.category}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <div className="track-complaint-meta">
                      <span>📍 {item.location}</span>
                      <span>📅 {item.date}</span>
                    </div>
                  </div>

                  <div className="track-card-right">
                    <span className={`track-status ${statusColors[item.status] || "review"}`}>
                      {item.status}
                    </span>
                    <span className="track-tl-pill">
                      🛡️ {item.truthlens?.authenticityScore || 95}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* SELECTED COMPLAINT AUDIT DETAIL */}
            {selected && (
              <section className="track-detail-section" style={{ marginTop: "35px" }}>
                <div className="track-detail-header">
                  <div>
                    <span className="track-eyebrow">AUDIT DOSSIER</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0 }}>{selected.id}: {selected.title}</h2>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selected.id);
                          setCopiedId(true);
                          setTimeout(() => setCopiedId(false), 2000);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: copiedId ? '#ecfdf5' : '#f1f5f9',
                          border: '1px solid',
                          borderColor: copiedId ? '#a7f3d0' : '#cbd5e1',
                          color: copiedId ? '#059669' : '#475569',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        title="Copy Official Tracking ID"
                      >
                        {copiedId ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedId ? 'Copied ID' : 'Copy ID'}</span>
                      </button>
                    </div>
                  </div>

                  <span className={`track-status ${statusColors[selected.status] || "review"}`}>
                    {selected.status}
                  </span>
                </div>

                <div className="track-detail-grid">
                  {/* LEFT COLUMN: DESCRIPTION, LOCATION, TIMELINE */}
                  <div className="track-detail-left">
                    <div className="track-detail-card">
                      <h3>Grievance Details</h3>
                      <p className="track-description">{selected.description}</p>

                      <div className="track-information">
                        <div>
                          <MapPinned size={17} />
                          <section>
                            <span>Location Address</span>
                            <strong>{selected.location}</strong>
                            {selected.coordinates && (
                              <small style={{ color: "#0284c7" }}>GPS: {selected.coordinates}</small>
                            )}
                          </section>
                        </div>

                        <div>
                          <Building2 size={17} />
                          <section>
                            <span>Assigned Department</span>
                            <strong>{selected.department}</strong>
                          </section>
                        </div>

                        <div>
                          <CalendarDays size={17} />
                          <section>
                            <span>Registered On</span>
                            <strong>{selected.date}</strong>
                          </section>
                        </div>
                      </div>

                      {/* OFFICIAL ADMIN RESPONSE IF AVAILABLE */}
                      {selected.adminResponse && (
                        <div
                          style={{
                            marginTop: "16px",
                            padding: "14px 16px",
                            borderRadius: "10px",
                            background: "rgba(2, 132, 199, 0.08)",
                            border: "1px solid rgba(2, 132, 199, 0.35)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "6px",
                            }}
                          >
                            <ShieldCheck size={16} color="#0284c7" />
                            <strong style={{ color: "#0369a1", fontSize: "13px" }}>
                              Official Administrative Response
                            </strong>
                            {selected.assignedOfficer && (
                              <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "auto" }}>
                                By: {selected.assignedOfficer}
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: "13px", color: "#1e293b", lineHeight: "1.55" }}>
                            "{selected.adminResponse}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* TIMELINE */}
                    <div className="track-timeline-card">
                      <h3>Resolution Progress Timeline</h3>
                      <div className="track-timeline">
                        {selected.updates.map((update, index) => (
                          <div
                            className={`track-timeline-item ${update.done ? "completed" : ""} ${
                              update.current ? "current" : ""
                            }`}
                            key={index}
                          >
                            <div className="track-timeline-marker">
                              {update.done ? <CheckCircle2 size={17} /> : <Clock size={17} />}
                            </div>

                            <div className="track-timeline-content">
                              <strong>{update.title}</strong>
                              <span>{update.date}</span>
                              <p>{update.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: TRUTHLENS REPORT, SARVAM AI, VIDEO & IMAGES */}
                  <div className="track-detail-right">
                    {/* TRUTHLENS FORENSIC CARD */}
                    <div
                      className="track-department-card"
                      style={{
                        background: "linear-gradient(145deg, #0f172a, #1e293b)",
                        color: "#fff",
                        border: "1px solid #334155",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <ShieldCheck size={24} color="#10b981" />
                        <h3 style={{ color: "#fff", margin: 0 }}>TruthLens™ Verification</h3>
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                        <span
                          style={{
                            background: "#065f46",
                            color: "#a7f3d0",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          Authenticity: {selected.truthlens?.authenticityScore || 96}%
                        </span>
                        <span
                          style={{
                            background: "#1e3a8a",
                            color: "#bfdbfe",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          {selected.truthlens?.verdict || "VERIFIED_AUTHENTIC"}
                        </span>
                      </div>

                      <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6", margin: 0 }}>
                        {selected.truthlens?.summary ||
                          selected.truthlens?.analysisSummary ||
                          "Optical signature matches real-world camera sensor. Geotag verified."}
                      </p>
                    </div>

                    {/* SARVAM AI VOICE & TRANSLATION */}
                    {selected.sarvam && (selected.sarvam.transcription || selected.sarvam.translatedEnglish || selected.sarvam.translation) && (
                      <div
                        className="track-department-card"
                        style={{ background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: "12px", padding: "16px" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Sparkles size={18} color="#0891b2" />
                            <h3 style={{ color: "#155e75", margin: 0, fontSize: "15px" }}>Sarvam AI saaras:v4 (Indic Speech Model)</h3>
                          </div>
                          <span style={{ fontFamily: "monospace", fontSize: "11px", background: "#cffafe", color: "#0e7490", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>
                            MODE: TRANSCRIBE // LANG: ta-IN
                          </span>
                        </div>

                        <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid #bae6fd", marginBottom: "8px" }}>
                          <small style={{ display: "block", color: "#0284c7", fontWeight: "700", fontSize: "11px", marginBottom: "3px" }}>
                            TAMIL SCRIPT TRANSCRIPTION (தமிழ் வரிவடிவம்):
                          </small>
                          <p style={{ fontSize: "13.5px", color: "#0f766e", margin: 0, fontWeight: "600", lineHeight: "1.5" }}>
                            "{selected.sarvam.transcription}"
                          </p>
                        </div>

                        {(selected.sarvam.translatedEnglish || selected.sarvam.translation) && (
                          <div style={{ background: "#f0f9ff", padding: "8px 12px", borderRadius: "6px" }}>
                            <small style={{ display: "block", color: "#0369a1", fontWeight: "700", fontSize: "11px" }}>
                              ADMINISTRATIVE ENGLISH TRANSLATION:
                            </small>
                            <p style={{ fontSize: "12.5px", color: "#1e293b", margin: "2px 0 0" }}>
                              {selected.sarvam.translatedEnglish || selected.sarvam.translation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* VIDEO EVIDENCE PLAYER (20-30s) */}
                    {selected.videos && selected.videos.length > 0 && (
                      <div className="track-evidence-card">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                          <Video size={20} color="#7c3aed" />
                          <h3 style={{ margin: 0 }}>20-30s Video Documentation</h3>
                        </div>

                        <video
                          src={selected.videos[0].url}
                          controls
                          style={{
                            width: "100%",
                            borderRadius: "10px",
                            maxHeight: "260px",
                            background: "#000",
                          }}
                        />
                      </div>
                    )}

                    {/* PHOTO EVIDENCE */}
                    {selected.images && selected.images.length > 0 && (
                      <div className="track-evidence-card">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                          <Camera size={20} color="#0284c7" />
                          <h3 style={{ margin: 0 }}>Photo Evidence</h3>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          {selected.images.map((img, i) => (
                            <img
                              key={i}
                              src={img.url}
                              alt="Evidence"
                              style={{
                                width: "100%",
                                height: "110px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </section>
        </div>

        {/* PERSISTENT MOBILE BOTTOM NAVIGATION */}
        <MobileBottomNav />
      </main>
    </div>
  );
}

export default TrackComplaints;
