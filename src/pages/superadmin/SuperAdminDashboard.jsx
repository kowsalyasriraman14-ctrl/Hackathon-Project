import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Crown,
  ShieldCheck,
  ShieldAlert,
  LayoutDashboard,
  ClipboardList,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  ArrowRight,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  X,
  Sparkles,
  Eye,
  Camera,
  Video,
  Mic,
  MessageSquare,
  Building2,
  Menu,
  ExternalLink,
  ChevronDown,
  Compass,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Home,
  Award,
  Users,
  CheckCheck,
  TrendingUp,
  Sliders,
  Send,
  Zap,
} from "lucide-react";

import {
  fetchComplaints,
  fetchSuperAdminAdmins,
  fetchSuperAdminAuditLogs,
  fetchSuperAdminAnalytics,
  overrideComplaintBySuperAdmin,
  getSuperAdminUser,
  performSuperAdminLogout,
  isSuperAdminAuthenticated,
} from "../../api";
import "./SuperAdminDashboard.css";

// Executive Web Audio alert chime for Super Admin notifications
const playSuperAdminChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(783.99, now); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12); // C6
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25); // E6

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {}
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const superAdminUser = getSuperAdminUser();

  // Navigation Guard: Strict Super Admin access
  useEffect(() => {
    if (!isSuperAdminAuthenticated()) {
      navigate("/superadmin/login");
    }
  }, [navigate]);

  // Main Data States
  const [complaints, setComplaints] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active View Tab: 'admins' | 'audit' | 'complaints'
  const [activeTab, setActiveTab] = useState("admins");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All"); // 'All' | 'Completed' | 'Pending'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notifications State
  const knownActionIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Inspection & Override Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState("In Progress");
  const [overridePriority, setOverridePriority] = useState("High");
  const [overrideOfficer, setOverrideOfficer] = useState("");
  const [overrideDirective, setOverrideDirective] = useState("");
  const [updating, setUpdating] = useState(false);
  const [overrideMsg, setOverrideMsg] = useState({ type: "", text: "" });

  // 1. Fetch live statewide data
  const loadDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [compsData, adminsData, logsData, analyticsData] = await Promise.all([
        fetchComplaints(),
        fetchSuperAdminAdmins(),
        fetchSuperAdminAuditLogs(),
        fetchSuperAdminAnalytics(),
      ]);

      if (Array.isArray(compsData)) {
        const mappedComps = compsData.map((c) => ({
          id: c.trackingId || c._id,
          rawId: c._id,
          title: c.title || "Civic Grievance",
          description: c.description || "",
          category: c.category || "Other",
          department: c.department || "Municipal Administration",
          priority: c.priority || "Medium",
          status: c.status || "Pending",
          citizenName: c.citizen?.name || "Citizen",
          citizenPhone: c.citizen?.phone || "",
          citizenEmail: c.citizen?.email || "",
          location: c.location?.address || "Salem, Tamil Nadu",
          date: new Date(c.createdAt || Date.now()).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          images: c.media?.images || [],
          videos: c.media?.videos || [],
          audios: c.media?.audio || [],
          truthlens: c.aiAnalysis?.truthlens || null,
          sarvam: c.aiAnalysis?.sarvam || null,
          timeline: c.timeline || [],
          adminResponse: c.adminResponse || "",
          assignedOfficer: c.assignedOfficer || "",
        }));
        setComplaints(mappedComps);
      }

      if (Array.isArray(adminsData)) {
        setAdminsList(adminsData);
      }

      if (Array.isArray(logsData)) {
        // Detect newly logged Admin actions
        if (isInitialLoadRef.current) {
          knownActionIdsRef.current = new Set(logsData.map((a) => a.id));
          isInitialLoadRef.current = false;
        } else {
          const newlyLogged = [];
          logsData.forEach((act) => {
            if (!knownActionIdsRef.current.has(act.id)) {
              knownActionIdsRef.current.add(act.id);
              newlyLogged.push(act);
            }
          });

          if (newlyLogged.length > 0) {
            triggerAdminActionAlerts(newlyLogged);
          }
        }
        setAuditLogs(logsData);
      }

      if (analyticsData) {
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error("Super Admin data load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Trigger alert toast & chime when an Admin acts
  const triggerAdminActionAlerts = (actions) => {
    if (!actions || actions.length === 0) return;

    const notifs = actions.map((act) => ({
      id: act.id,
      complaintId: act.complaintId,
      title: act.complaintTitle,
      officerName: act.officerName || "Admin Officer",
      department: act.department || "Municipal Corp",
      newStatus: act.newStatus,
      isCompleted: act.isCompleted || act.newStatus === "Resolved",
      responseNote: act.responseNote,
      time: new Date(act.timestamp || Date.now()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      unread: true,
      rawAction: act,
    }));

    if (soundEnabled) {
      playSuperAdminChime();
    }

    setActiveToast(notifs[0]);
    setNotifications((prev) => [...notifs, ...prev].slice(0, 50));
    setUnreadCount((prev) => prev + notifs.length);
  };

  // Auto-polling interval: 8 seconds
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time Admin Action broadcasts across tabs
  useEffect(() => {
    const handleIncomingAction = (act) => {
      if (!act) return;
      if (!knownActionIdsRef.current.has(act.id)) {
        knownActionIdsRef.current.add(act.id);
        triggerAdminActionAlerts([act]);
        loadDashboardData();
      }
    };

    const onStorage = (e) => {
      if (e.key === "civicshield_latest_admin_action" && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload.action) handleIncomingAction(payload.action);
        } catch (err) {}
      }
    };
    window.addEventListener("storage", onStorage);

    const onCustom = (e) => {
      if (e.detail) handleIncomingAction(e.detail);
    };
    window.addEventListener("civicshield_admin_action", onCustom);

    let bc;
    try {
      bc = new BroadcastChannel("civicshield_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "ADMIN_ACTION" && event.data.action) {
          handleIncomingAction(event.data.action);
        }
      };
    } catch (e) {}

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("civicshield_admin_action", onCustom);
      if (bc) bc.close();
    };
  }, [soundEnabled]);

  // Auto-dismiss active floating toast
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 9500);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Aggregate Executive Metrics
  const metrics = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    const inProgress = complaints.filter(
      (c) => c.status === "In Progress" || c.status === "Under Review"
    ).length;
    const pending = complaints.filter(
      (c) => c.status === "Pending" || c.status === "Received"
    ).length;
    const totalAdmins = adminsList.length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const totalActions = auditLogs.length;

    return {
      total,
      resolved,
      inProgress,
      pending,
      totalAdmins,
      resolutionRate: `${resolutionRate}%`,
      totalActions,
    };
  }, [complaints, adminsList, auditLogs]);

  // Filter Complaints List
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === "Pending") {
        matchesStatus = c.status === "Pending" || c.status === "Received";
      } else if (statusFilter === "In Progress") {
        matchesStatus = c.status === "In Progress" || c.status === "Under Review";
      } else if (statusFilter !== "All") {
        matchesStatus = c.status === statusFilter;
      }

      const matchesDept = deptFilter === "All" || c.department === deptFilter;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [complaints, search, statusFilter, deptFilter]);

  // Filter Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((act) => {
      if (actionFilter === "Completed") return act.isCompleted || act.newStatus === "Resolved";
      if (actionFilter === "Pending") return act.isPending || act.newStatus !== "Resolved";
      return true;
    });
  }, [auditLogs, actionFilter]);

  // Open Master Inspection Dossier
  const handleOpenDossier = (comp) => {
    setSelectedComplaint(comp);
    setOverrideStatus(comp.status === "Received" ? "Pending" : comp.status);
    setOverridePriority(comp.priority || "Medium");
    setOverrideOfficer(comp.assignedOfficer || "");
    setOverrideDirective("");
    setOverrideMsg({ type: "", text: "" });
  };

  // Submit Super Admin Executive Override
  const handleExecuteOverride = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    setOverrideMsg({ type: "", text: "" });

    try {
      const res = await overrideComplaintBySuperAdmin(selectedComplaint.id, {
        status: overrideStatus,
        priority: overridePriority,
        assignedOfficer: overrideOfficer.trim(),
        superAdminDirective: overrideDirective.trim(),
      });

      if (res.success) {
        setOverrideMsg({
          type: "success",
          text: `Super Admin Executive Directive applied to ${selectedComplaint.id}. Status updated to ${overrideStatus}.`,
        });

        // Update local state immediately
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id
              ? {
                  ...c,
                  status: overrideStatus,
                  priority: overridePriority,
                  assignedOfficer: overrideOfficer.trim(),
                  adminResponse: overrideDirective
                    ? `[SUPER ADMIN DIRECTIVE]: ${overrideDirective}`
                    : c.adminResponse,
                }
              : c
          )
        );

        setSelectedComplaint((prev) => ({
          ...prev,
          status: overrideStatus,
          priority: overridePriority,
          assignedOfficer: overrideOfficer.trim(),
          adminResponse: overrideDirective
            ? `[SUPER ADMIN DIRECTIVE]: ${overrideDirective}`
            : prev.adminResponse,
        }));

        loadDashboardData();
      }
    } catch (err) {
      setOverrideMsg({
        type: "error",
        text: err.message || "Failed to apply Super Admin override",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    performSuperAdminLogout();
    navigate("/superadmin/login");
  };

  return (
    <div className="superadmin-layout">
      {/* AMBIENT FLOATING GLOW ORBS */}
      <div className="superadmin-ambient-orb orb-red" aria-hidden="true" />
      <div className="superadmin-ambient-orb orb-gold" aria-hidden="true" />
      <div className="superadmin-ambient-orb orb-cyan" aria-hidden="true" />

      {/* SIDEBAR NAVIGATION */}
      <aside className={`superadmin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/superadmin/dashboard" className="superadmin-sidebar-brand">
          <div className="superadmin-brand-icon-box">
            <Crown size={22} />
          </div>
          <div className="superadmin-brand-names">
            <h2>
              CIVIC<span>SHIELD</span>
            </h2>
            <small>APEX SUPER ADMIN OS</small>
          </div>
        </Link>

        <p className="superadmin-sidebar-section-label">EXECUTIVE OVERSIGHT</p>
        <nav className="superadmin-nav-list">
          <button
            type="button"
            className={`superadmin-nav-btn ${activeTab === "admins" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("admins");
              setSidebarOpen(false);
            }}
          >
            <Users size={17} />
            <span>Department Admins ({metrics.totalAdmins})</span>
          </button>

          <button
            type="button"
            className={`superadmin-nav-btn ${activeTab === "audit" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("audit");
              setSidebarOpen(false);
            }}
          >
            <Activity size={17} />
            <span>Admin Action Feed ({auditLogs.length})</span>
          </button>

          <button
            type="button"
            className={`superadmin-nav-btn ${activeTab === "complaints" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("complaints");
              setSidebarOpen(false);
            }}
          >
            <ClipboardList size={17} />
            <span>State Complaints ({metrics.total})</span>
          </button>

          {/* CROSS-PORTAL NAVIGATION LINKS */}
          <div className="superadmin-nav-divider" />
          <p className="superadmin-sidebar-section-label">PORTAL INTERCONNECT</p>

          <Link
            to="/admin/dashboard"
            className="superadmin-nav-btn cross-link"
            title="Open Department Officer Admin Portal"
          >
            <ShieldCheck size={17} color="#ef4444" />
            <span>Admin Dashboard</span>
          </Link>

          <Link
            to="/dashboard"
            className="superadmin-nav-btn cross-link highlight"
            title="Open Citizen Grievance Dashboard"
          >
            <LayoutDashboard size={17} color="#38bdf8" />
            <span>Citizen Dashboard</span>
          </Link>

          <Link
            to="/"
            className="superadmin-nav-btn cross-link"
            title="Return to Public Website"
          >
            <Home size={17} />
            <span>Public Home</span>
          </Link>
        </nav>

        <div className="superadmin-sidebar-footer">
          <div className="superadmin-executive-chip">
            <div className="superadmin-avatar-crown">
              <Crown size={16} />
            </div>
            <div className="superadmin-officer-info">
              <strong>{superAdminUser?.name || "Chief Secretary"}</strong>
              <small>Apex Municipal Oversight</small>
            </div>
          </div>

          <button
            type="button"
            className="superadmin-sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Super Admin Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="superadmin-main">
        {/* TOPBAR */}
        <header className="superadmin-topbar">
          <div className="superadmin-topbar-left">
            <button
              type="button"
              className="superadmin-mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Navigation"
            >
              <Menu size={20} />
            </button>

            <div className="superadmin-breadcrumbs">
              <span className="superadmin-bread-root">CIVICSHIELD</span>
              <span className="superadmin-bread-sep">/</span>
              <span className="superadmin-bread-apex">APEX-EXECUTIVE</span>
              <span className="superadmin-bread-sep">/</span>
              <span className="superadmin-bread-tag">STATEWIDE-OVERSIGHT</span>
            </div>
          </div>

          <div className="superadmin-topbar-right">
            <div className="superadmin-status-pill" title="Statewide Admin Auditing & Resolution Tracking Active">
              <span className="superadmin-pulse-dot" />
              <span>APEX SENTINEL 24/7 SURVEILLANCE</span>
            </div>

            {/* Sound Chime Toggle */}
            <button
              type="button"
              className={`superadmin-icon-btn ${soundEnabled ? "active" : ""}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Audio Alerts Enabled" : "Audio Alerts Muted"}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* NOTIFICATION CENTER FOR ADMIN ACTIONS */}
            <div className="superadmin-notif-container">
              <button
                type="button"
                className={`superadmin-bell-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                title={`${unreadCount} New Admin Actions`}
                aria-label="Admin Action Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="superadmin-bell-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationMenuOpen && (
                <div className="superadmin-notif-popover">
                  <div className="superadmin-notif-head">
                    <div className="superadmin-notif-title-row">
                      <Zap size={15} color="#fbbf24" />
                      <strong>Admin Action Audit Feed</strong>
                      {unreadCount > 0 && (
                        <span className="superadmin-unread-pill">{unreadCount} New</span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        className="superadmin-notif-mark-read"
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, unread: false }))
                          );
                          setUnreadCount(0);
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="superadmin-notif-items-list">
                    {notifications.length === 0 ? (
                      <div className="superadmin-notif-empty">
                        <CheckCheck size={26} color="#10b981" />
                        <p>No new admin updates. All department officers synced.</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div
                          key={n.id + "-" + i}
                          className={`superadmin-notif-card ${n.unread ? "unread" : ""}`}
                          onClick={() => {
                            const target = complaints.find((c) => c.id === n.complaintId);
                            if (target) handleOpenDossier(target);
                            setNotifications((prev) =>
                              prev.map((item, idx) =>
                                idx === i ? { ...item, unread: false } : item
                              )
                            );
                            setUnreadCount((prev) => Math.max(0, prev - 1));
                            setNotificationMenuOpen(false);
                          }}
                        >
                          <div className="superadmin-notif-card-top">
                            <span className="superadmin-notif-card-id">#{n.complaintId}</span>
                            <span className="superadmin-notif-card-time">{n.time}</span>
                          </div>
                          <h4 className="superadmin-notif-card-title">{n.title}</h4>
                          <div className="superadmin-notif-action-line">
                            Officer <strong>{n.officerName}</strong>:{" "}
                            <span
                              className={`action-status-tag ${
                                n.isCompleted ? "completed" : "pending"
                              }`}
                            >
                              {n.newStatus}
                            </span>
                          </div>
                          {n.responseNote && (
                            <p className="superadmin-notif-note">"{n.responseNote}"</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Cross-Nav Buttons */}
            <Link
              to="/admin/dashboard"
              className="superadmin-portal-link"
              title="Open Department Admin Portal"
            >
              <ShieldCheck size={13} color="#f87171" />
              <span>Admin Portal</span>
            </Link>

            <Link
              to="/dashboard"
              className="superadmin-portal-link highlight"
              title="Open Citizen Dashboard"
            >
              <LayoutDashboard size={13} />
              <span>Citizen Dashboard</span>
            </Link>
          </div>
        </header>

        {/* FLOATING LIVE NOTIFICATION TOAST FOR ADMIN ACTIONS */}
        {activeToast && (
          <aside className="superadmin-floating-toast" role="alert" aria-live="assertive">
            <div className="superadmin-toast-top">
              <div className="superadmin-toast-icon-wrap">
                <span className="superadmin-toast-ping" />
                <Zap size={16} color="#fbbf24" />
              </div>
              <div className="superadmin-toast-label">⚡ DEPARTMENT ADMIN ACTION LOGGED</div>
              <button
                type="button"
                className="superadmin-toast-close"
                onClick={() => setActiveToast(null)}
                aria-label="Dismiss alert"
              >
                <X size={15} />
              </button>
            </div>

            <div className="superadmin-toast-body">
              <h4 className="superadmin-toast-title">{activeToast.title}</h4>
              <div className="superadmin-toast-meta">
                <span className="toast-officer">
                  Officer: <strong>{activeToast.officerName}</strong> ({activeToast.department})
                </span>
                <span
                  className={`toast-status-badge ${
                    activeToast.isCompleted ? "resolved" : "inprogress"
                  }`}
                >
                  {activeToast.isCompleted ? "✓ WORK COMPLETED" : "⏳ PENDING / IN PROGRESS"}
                </span>
              </div>
              {activeToast.responseNote && (
                <p className="superadmin-toast-remarks">
                  Official Remarks: <em>"{activeToast.responseNote}"</em>
                </p>
              )}
            </div>

            <div className="superadmin-toast-foot">
              <button
                type="button"
                className="superadmin-toast-inspect-btn"
                onClick={() => {
                  const target = complaints.find((c) => c.id === activeToast.complaintId);
                  if (target) handleOpenDossier(target);
                  setActiveToast(null);
                }}
              >
                <Eye size={14} /> Review Complaint Dossier
              </button>
              <button
                type="button"
                className="superadmin-toast-dismiss-btn"
                onClick={() => setActiveToast(null)}
              >
                Dismiss
              </button>
            </div>
          </aside>
        )}

        {/* DASHBOARD BODY */}
        <div className="superadmin-content">
          {/* STATEWIDE APEX HERO */}
          <div className="superadmin-hero">
            <div className="superadmin-hero-left">
              <div className="superadmin-seal-pill">
                <Crown size={15} color="#fbbf24" />
                <span>STATE APEX EXECUTIVE OVERSIGHT // CHIEF SECRETARY SENTINEL</span>
                <span className="seal-motto">"வாய்மையே வெல்லும்" · TRUTH ALONE TRIUMPHS</span>
              </div>
              <h1>Super Admin Executive Command Center</h1>
              <p>
                Statewide oversight over all municipal complaints across Tamil Nadu. Monitor Department Admin responsiveness, track work completion versus pending backlogs, and enforce executive directives.
              </p>
            </div>

            <div className="superadmin-hero-actions">
              <button
                type="button"
                className="superadmin-sync-btn"
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                title="Synchronize real-time state database"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                <span>{refreshing ? "Syncing Statewide..." : "Sync State Database"}</span>
              </button>
            </div>
          </div>

          {/* 5 APEX EXECUTIVE METRICS CARDS */}
          <section className="superadmin-stats-grid">
            <article className="superadmin-stat-card">
              <div className="superadmin-stat-top">
                <span className="stat-label">TOTAL STATE GRIEVANCES</span>
                <div className="stat-icon-wrap icon-blue">
                  <ClipboardList size={18} />
                </div>
              </div>
              <div className="stat-number">{metrics.total}</div>
              <div className="stat-sub">
                <Sparkles size={12} color="#38bdf8" /> Across all 38 districts
              </div>
            </article>

            <article className="superadmin-stat-card">
              <div className="superadmin-stat-top">
                <span className="stat-label">WORK COMPLETED (RESOLVED)</span>
                <div className="stat-icon-wrap icon-emerald">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="stat-number">{metrics.resolved}</div>
              <div className="stat-sub">
                <TrendingUp size={12} color="#34d399" /> {metrics.resolutionRate} Resolution Rate
              </div>
            </article>

            <article className="superadmin-stat-card">
              <div className="superadmin-stat-top">
                <span className="stat-label">PENDING / IN PROGRESS</span>
                <div className="stat-icon-wrap icon-amber">
                  <Clock size={18} />
                </div>
              </div>
              <div className="stat-number">{metrics.pending + metrics.inProgress}</div>
              <div className="stat-sub">
                <AlertTriangle size={12} color="#fbbf24" /> Requires Admin follow-up
              </div>
            </article>

            <article className="superadmin-stat-card">
              <div className="superadmin-stat-top">
                <span className="stat-label">DEPARTMENT ADMINS</span>
                <div className="stat-icon-wrap icon-purple">
                  <Users size={18} />
                </div>
              </div>
              <div className="stat-number">{metrics.totalAdmins}</div>
              <div className="stat-sub">
                <ShieldCheck size={12} color="#c084fc" /> Active officers monitored
              </div>
            </article>

            <article className="superadmin-stat-card">
              <div className="superadmin-stat-top">
                <span className="stat-label">ADMIN ACTIONS LOGGED</span>
                <div className="stat-icon-wrap icon-gold">
                  <Zap size={18} />
                </div>
              </div>
              <div className="stat-number">{metrics.totalActions}</div>
              <div className="stat-sub">
                <Activity size={12} color="#fbbf24" /> Live audit trail verified
              </div>
            </article>
          </section>

          {/* VIEW TAB SELECTOR */}
          <div className="superadmin-tab-bar">
            <button
              type="button"
              className={`superadmin-tab ${activeTab === "admins" ? "active" : ""}`}
              onClick={() => setActiveTab("admins")}
            >
              <Users size={16} />
              <span>Department Admins & Officer Performance</span>
              <span className="tab-pill">{adminsList.length}</span>
            </button>

            <button
              type="button"
              className={`superadmin-tab ${activeTab === "audit" ? "active" : ""}`}
              onClick={() => setActiveTab("audit")}
            >
              <Activity size={16} />
              <span>Live Admin Action Audit Feed</span>
              <span className="tab-pill">{auditLogs.length}</span>
            </button>

            <button
              type="button"
              className={`superadmin-tab ${activeTab === "complaints" ? "active" : ""}`}
              onClick={() => setActiveTab("complaints")}
            >
              <ClipboardList size={16} />
              <span>Master Complaints Overseer</span>
              <span className="tab-pill">{complaints.length}</span>
            </button>
          </div>

          {/* TAB 1: DEPARTMENT ADMINS & PERFORMANCE MONITORING */}
          {activeTab === "admins" && (
            <section className="superadmin-section-card">
              <div className="section-card-head">
                <div>
                  <h3>Department Admin Officers & Performance Roster</h3>
                  <p>
                    Track individual municipal department admins, review their completed versus pending work, and monitor resolution efficiency.
                  </p>
                </div>
              </div>

              <div className="superadmin-table-wrap">
                {adminsList.length === 0 ? (
                  <div className="superadmin-empty-state">
                    <Users size={36} color="#64748b" />
                    <h4>No Department Admins Registered Yet</h4>
                    <p>Admins registered through the Admin Portal will appear here automatically.</p>
                  </div>
                ) : (
                  <table className="superadmin-table">
                    <thead>
                      <tr>
                        <th>Officer / Administrator</th>
                        <th>Assigned Department</th>
                        <th>Official Email</th>
                        <th>Total Handled</th>
                        <th>Work Completed</th>
                        <th>Pending / In Progress</th>
                        <th>Efficiency Rate</th>
                        <th>Oversight Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminsList.map((adm) => (
                        <tr key={adm.id}>
                          <td>
                            <div className="officer-name-cell">
                              <div className="officer-avatar">
                                {adm.name ? adm.name.charAt(0).toUpperCase() : "A"}
                              </div>
                              <div>
                                <strong>{adm.name}</strong>
                                <small>{adm.phone || "Official Sentinel"}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="dept-tag">{adm.department}</span>
                          </td>
                          <td>
                            <code>{adm.email}</code>
                          </td>
                          <td>
                            <strong>{adm.stats?.totalHandled || 0}</strong>
                          </td>
                          <td>
                            <span className="count-resolved">
                              ✓ {adm.stats?.resolved || 0}
                            </span>
                          </td>
                          <td>
                            <span className="count-pending">
                              ⏳ {(adm.stats?.pending || 0) + (adm.stats?.inProgress || 0)}
                            </span>
                          </td>
                          <td>
                            <div className="efficiency-bar-cell">
                              <span>{adm.stats?.efficiencyRate || "100%"}</span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`rating-badge ${
                                adm.stats?.rating === "EXCELLENT"
                                  ? "excellent"
                                  : adm.stats?.rating === "AVERAGE"
                                  ? "average"
                                  : "needs-improvement"
                              }`}
                            >
                              {adm.stats?.rating || "EXCELLENT"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* TAB 2: LIVE ADMIN ACTION AUDIT FEED */}
          {activeTab === "audit" && (
            <section className="superadmin-section-card">
              <div className="section-card-head">
                <div>
                  <h3>Real-Time Admin Action Audit Feed</h3>
                  <p>
                    Instant notifications of every action taken by Department Admins, including work completions, status changes, and official responses.
                  </p>
                </div>

                <div className="action-filter-pills">
                  {["All", "Completed", "Pending"].map((flt) => (
                    <button
                      key={flt}
                      type="button"
                      className={`action-filter-btn ${actionFilter === flt ? "active" : ""}`}
                      onClick={() => setActionFilter(flt)}
                    >
                      {flt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="audit-feed-list">
                {filteredAuditLogs.length === 0 ? (
                  <div className="superadmin-empty-state">
                    <Activity size={36} color="#64748b" />
                    <h4>No Admin Actions Recorded Yet</h4>
                    <p>Actions performed by department admins on complaints will stream here in real time.</p>
                  </div>
                ) : (
                  filteredAuditLogs.map((act) => (
                    <div
                      key={act.id}
                      className={`audit-feed-item ${act.isCompleted ? "completed" : "pending"}`}
                      onClick={() => {
                        const target = complaints.find((c) => c.id === act.complaintId);
                        if (target) handleOpenDossier(target);
                      }}
                    >
                      <div className="audit-item-header">
                        <div className="audit-item-left">
                          <span className="audit-badge-icon">
                            {act.isCompleted ? (
                              <CheckCircle2 size={16} color="#10b981" />
                            ) : (
                              <Clock size={16} color="#fbbf24" />
                            )}
                          </span>
                          <span className="audit-complaint-id">#{act.complaintId}</span>
                          <span className="audit-complaint-title">{act.complaintTitle}</span>
                        </div>

                        <div className="audit-item-right">
                          <span
                            className={`audit-status-tag ${
                              act.isCompleted ? "status-resolved" : "status-progress"
                            }`}
                          >
                            {act.isCompleted ? "WORK COMPLETED" : act.newStatus}
                          </span>
                          <span className="audit-time">
                            {new Date(act.timestamp || Date.now()).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="audit-item-body">
                        <p>
                          Department Officer: <strong>{act.officerName}</strong> ({act.department}){" "}
                          transitioned status from <code>{act.previousStatus || "Pending"}</code> to{" "}
                          <strong>{act.newStatus}</strong>.
                        </p>
                        {act.responseNote && (
                          <blockquote className="audit-quote">
                            "{act.responseNote}"
                          </blockquote>
                        )}
                      </div>

                      <div className="audit-item-foot">
                        <span className="audit-inspect-hint">
                          Click to inspect full complaint dossier & enforce directives →
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* TAB 3: MASTER COMPLAINTS OVERSEER */}
          {activeTab === "complaints" && (
            <section className="superadmin-section-card">
              <div className="section-card-head">
                <div>
                  <h3>Master Statewide Grievance Dossiers</h3>
                  <p>
                    Full oversight over all citizen complaints across Tamil Nadu. Review media evidence, TruthLens forensic verifications, and apply Super Admin executive directives.
                  </p>
                </div>
              </div>

              {/* Filter controls */}
              <div className="superadmin-filters-bar">
                <div className="search-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search complaint ID, citizen, location, or keyword..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="status-pills">
                  {["All", "Pending", "In Progress", "Resolved", "Rejected"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`status-pill ${statusFilter === st ? "active" : ""}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="superadmin-table-wrap">
                {filteredComplaints.length === 0 ? (
                  <div className="superadmin-empty-state">
                    <ClipboardList size={36} color="#64748b" />
                    <h4>No Complaints Match Criteria</h4>
                    <p>Try modifying your search or status filter.</p>
                  </div>
                ) : (
                  <table className="superadmin-table">
                    <thead>
                      <tr>
                        <th>Complaint ID</th>
                        <th>Citizen</th>
                        <th>Title & Category</th>
                        <th>Department</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Admin Response</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <code>#{c.id}</code>
                          </td>
                          <td>
                            <strong>{c.citizenName}</strong>
                            <small className="block text-slate-400">{c.citizenPhone}</small>
                          </td>
                          <td>
                            <strong>{c.title}</strong>
                            <span className="cat-badge">{c.category}</span>
                          </td>
                          <td>
                            <span className="dept-tag">{c.department}</span>
                          </td>
                          <td>
                            <span className="loc-text">
                              <MapPin size={12} /> {c.location}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-chip ${
                                c.status === "Resolved"
                                  ? "resolved"
                                  : c.status === "In Progress"
                                  ? "progress"
                                  : "pending"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td>
                            <div className="admin-response-preview">
                              {c.adminResponse ? (
                                <span>{c.adminResponse}</span>
                              ) : (
                                <em className="text-slate-500">No response logged yet</em>
                              )}
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="inspect-btn"
                              onClick={() => handleOpenDossier(c)}
                            >
                              <Eye size={14} /> Inspect & Override
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}
        </div>

        {/* INSPECTION & EXECUTIVE OVERRIDE MODAL */}
        {selectedComplaint && (
          <div className="superadmin-modal-backdrop" onClick={() => setSelectedComplaint(null)}>
            <div
              className="superadmin-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-row">
                  <Crown size={20} color="#fbbf24" />
                  <div>
                    <h2>Super Admin Executive Oversight: #{selectedComplaint.id}</h2>
                    <span className="modal-sub">
                      {selectedComplaint.department} · {selectedComplaint.date}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedComplaint(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                {overrideMsg.text && (
                  <div className={`modal-alert ${overrideMsg.type}`}>
                    {overrideMsg.type === "success" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                    <span>{overrideMsg.text}</span>
                  </div>
                )}

                {/* Grievance Details */}
                <div className="modal-section">
                  <h4>Grievance Overview</h4>
                  <p className="modal-desc">{selectedComplaint.description}</p>

                  <div className="modal-meta-grid">
                    <div>
                      <span className="meta-label">Citizen:</span>
                      <strong>{selectedComplaint.citizenName}</strong> ({selectedComplaint.citizenPhone || "N/A"})
                    </div>
                    <div>
                      <span className="meta-label">Location:</span>
                      <strong>{selectedComplaint.location}</strong>
                    </div>
                    <div>
                      <span className="meta-label">Current Status:</span>
                      <strong className="text-amber-400">{selectedComplaint.status}</strong>
                    </div>
                    <div>
                      <span className="meta-label">Assigned Officer:</span>
                      <strong>{selectedComplaint.assignedOfficer || "Not yet assigned"}</strong>
                    </div>
                  </div>
                </div>

                {/* Admin Response Logged */}
                <div className="modal-section">
                  <h4>Department Admin Official Response</h4>
                  {selectedComplaint.adminResponse ? (
                    <blockquote className="modal-admin-quote">
                      "{selectedComplaint.adminResponse}"
                    </blockquote>
                  ) : (
                    <p className="text-slate-400">
                      <em>The Department Admin has not yet submitted an official response for this complaint.</em>
                    </p>
                  )}
                </div>

                {/* TruthLens & Sarvam AI Verification */}
                <div className="modal-section">
                  <h4>AI Forensics & Voice Verification</h4>
                  <div className="ai-chips-row">
                    <span className="ai-chip">
                      TruthLens Authenticity:{" "}
                      <strong>
                        {selectedComplaint.truthlens?.authenticityScore || 94}% Authentic
                      </strong>
                    </span>
                    {selectedComplaint.sarvam?.transcription && (
                      <span className="ai-chip sarvam">
                        Sarvam AI Tamil Transcript:{" "}
                        <em>"{selectedComplaint.sarvam.transcription}"</em>
                      </span>
                    )}
                  </div>
                </div>

                {/* Executive Override Form */}
                <form onSubmit={handleExecuteOverride} className="modal-override-form">
                  <h4>Super Admin Executive Directive & Override</h4>

                  <div className="override-form-row">
                    <div>
                      <label>Enforce Status</label>
                      <select
                        value={overrideStatus}
                        onChange={(e) => setOverrideStatus(e.target.value)}
                        className="modal-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress (Work Dispatched)</option>
                        <option value="Resolved">Resolved (Work Completed)</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label>Escalate Priority</label>
                      <select
                        value={overridePriority}
                        onChange={(e) => setOverridePriority(e.target.value)}
                        className="modal-select"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent (Immediate State Attention)</option>
                      </select>
                    </div>

                    <div>
                      <label>Reassign Officer</label>
                      <input
                        type="text"
                        className="modal-input"
                        placeholder="Officer Name"
                        value={overrideOfficer}
                        onChange={(e) => setOverrideOfficer(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Executive Directive / Oversight Remarks</label>
                    <textarea
                      rows={3}
                      className="modal-textarea"
                      placeholder="Enter binding directive from Chief Secretary oversight..."
                      value={overrideDirective}
                      onChange={(e) => setOverrideDirective(e.target.value)}
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="submit"
                      className="modal-save-btn"
                      disabled={updating}
                    >
                      <Sliders size={16} />
                      <span>{updating ? "Enforcing Directive..." : "Apply Executive Directive"}</span>
                    </button>
                    <button
                      type="button"
                      className="modal-cancel-btn"
                      onClick={() => setSelectedComplaint(null)}
                    >
                      Close Dossier
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

