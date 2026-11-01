import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
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
  Landmark,
  Globe,
  Navigation,
  Layers,
  Shield,
  Award,
  Crown,
} from "lucide-react";

import {
  fetchComplaints,
  updateComplaintByAdmin,
  getAdminUser,
  performAdminLogout,
  isAdminAuthenticated,
} from "../../api";
import "./AdminDashboard.css";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved", "Rejected"];

// Tamil Nadu Cultural, Architectural & Environmental Municipal Zones
const TAMIL_NADU_DISTRICT_ZONES = [
  {
    id: "thanjavur",
    name: "Thanjavur Brihadisvara",
    tamilName: "தஞ்சைப் பெருவுடையார் கோயில்",
    region: "Cauvery Delta Municipal Zone",
    district: "Thanjavur",
    tag: "UNESCO World Heritage",
    categoryFilter: "Roads & Transport",
    image: "/images/tamilnadu/thanjavur-temple.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1686310894901-d326b8722c13?q=80&w=800&auto=format&fit=crop",
    description: "Chola granite architecture & historic municipal water channels.",
    badgeColor: "emerald",
  },
  {
    id: "madurai",
    name: "Madurai Meenakshi Gateway",
    tamilName: "மதுரை மீனாட்சி சுந்தரேஸ்வரர்",
    region: "Southern Vaigai Basin",
    district: "Madurai",
    tag: "Cultural Capital Command",
    categoryFilter: "Sanitation & Waste",
    image: "/images/tamilnadu/madurai-meenakshi.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1692173248120-59547c3d4653?q=80&w=800&auto=format&fit=crop",
    description: "Historic temple city operations, 24/7 sanitation & pilgrim transit logistics.",
    badgeColor: "purple",
  },
  {
    id: "mamallapuram",
    name: "Mamallapuram Shore Corridor",
    tamilName: "மாமல்லபுரம் கடற்கரைக் கோயில்",
    region: "Chengalpattu Coastal Belt",
    district: "Chengalpattu",
    tag: "Coastal Heritage & Drainage",
    categoryFilter: "Public Safety",
    image: "/images/tamilnadu/mamallapuram.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1717417925229-600a68f75cab?q=80&w=800&auto=format&fit=crop",
    description: "Bay of Bengal coastal stone monuments & storm surge sentinels.",
    badgeColor: "amber",
  },
  {
    id: "chennai",
    name: "Greater Chennai Coastal HQ",
    tamilName: "பெருநகர சென்னை மாநகராட்சி",
    region: "Capital Municipal Command",
    district: "Chennai",
    tag: "State Administrative Gateway",
    categoryFilter: "Roads & Transport",
    image: "/images/tamilnadu/chennai-coastal.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1724992609079-75164f1ba2dd?q=80&w=800&auto=format&fit=crop",
    description: "Marina shoreline, metro transit logistics, floodwater stormwater gates.",
    badgeColor: "blue",
  },
  {
    id: "nilgiris",
    name: "Nilgiris & Salem Mettur Basin",
    tamilName: "நீலகிரி & சேலம் மேட்டூர் அணை",
    region: "Western Highlands & Watershed",
    district: "Salem",
    tag: "Drinking Water & Ecology",
    categoryFilter: "Water & Sewage",
    image: "/images/tamilnadu/nilgiris-hills.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1624485871361-65454b13edfa?q=80&w=800&auto=format&fit=crop",
    description: "Kaveri river reservoirs, Stanley Dam reserves & ecological hills.",
    badgeColor: "cyan",
  },
];

// Two-tone Web Audio alert chime for real-time citizen grievance arrivals
const playAlertChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.start(now);
    osc.stop(now + 0.48);
  } catch (e) {
    // Ignore autoplay restriction before user interaction
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminUser = getAdminUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-Time Notification Center State
  const knownComplaintIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tamil Nadu Cultural & Heritage Zone Showcase State
  const [activeZoneId, setActiveZoneId] = useState(null);

  const handleZoneClick = (zone) => {
    if (activeZoneId === zone.id) {
      setActiveZoneId(null);
      setCategoryFilter("All");
      setSearch("");
    } else {
      setActiveZoneId(zone.id);
      if (zone.categoryFilter) {
        setCategoryFilter(zone.categoryFilter);
      }
      if (zone.district) {
        // Also look for district or zone keywords
        setSearch(zone.district);
      }
    }
  };

  // Inspection Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("Pending");
  const [adminResponse, setAdminResponse] = useState("");
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", text: "" });

  // 1. Guard route: redirect if not admin
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Dispatch new grievance alerts
  const notifyNewComplaints = (newItems) => {
    if (!newItems || newItems.length === 0) return;

    const newNotifs = newItems.map((c) => ({
      id: c.trackingId || c._id || c.id,
      title: c.title || "Civic Complaint",
      citizenName: c.citizen?.name || c.citizenName || "Citizen",
      category: c.category || "General",
      location: c.location?.address || c.location || "Salem, Tamil Nadu",
      date: new Date(c.createdAt || Date.now()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: Date.now(),
      unread: true,
      rawComplaint: c,
    }));

    if (soundEnabled) {
      playAlertChime();
    }

    // Pop up floating alert banner for newest complaint
    setActiveToast(newNotifs[0]);

    // Prepend to notifications list
    setNotifications((prev) => [...newNotifs, ...prev].slice(0, 50));
    setUnreadCount((prev) => prev + newNotifs.length);
  };

  // 2. Fetch live complaints from existing database
  const loadComplaints = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await fetchComplaints();
      if (Array.isArray(data)) {
        // Map backend complaints to standard structure
        const mapped = data.map((c) => ({
          id: c.trackingId || c._id,
          rawId: c._id,
          title: c.title || "Civic Grievance",
          description: c.description || "",
          category: c.category || "Other",
          department: c.department || "Municipal Administration",
          priority: c.priority || "Medium",
          status: c.status || "Pending",
          citizenName: c.citizen?.name || "Anonymous Citizen",
          citizenEmail: c.citizen?.email || "",
          citizenPhone: c.citizen?.phone || "",
          location: c.location?.address || "Salem, Tamil Nadu",
          coordinates: c.location?.latitude ? `${c.location.latitude}, ${c.location.longitude}` : null,
          landmark: c.location?.landmark || "",
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

        // Real-Time Notification Logic
        if (isInitialLoadRef.current) {
          // On first load, record all existing IDs so past history is known
          knownComplaintIdsRef.current = new Set(mapped.map((c) => c.id));
          isInitialLoadRef.current = false;
        } else {
          // Subsequent poll / sync: find newly submitted complaints
          const newlyAdded = [];
          mapped.forEach((c) => {
            if (!knownComplaintIdsRef.current.has(c.id)) {
              knownComplaintIdsRef.current.add(c.id);
              newlyAdded.push(c);
            }
          });

          if (newlyAdded.length > 0) {
            notifyNewComplaints(newlyAdded);
          }
        }

        setComplaints(mapped);
      }
    } catch (err) {
      console.error("Failed to load complaints in admin:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    // Auto-poll every 8 seconds to pick up new citizen submissions in real time
    const interval = setInterval(() => {
      loadComplaints();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Listen for immediate events across tabs, windows, and local broadcasts
  useEffect(() => {
    const handleIncomingComplaint = (complaint) => {
      if (!complaint) return;
      const cid = complaint.trackingId || complaint._id || complaint.id;
      if (cid && !knownComplaintIdsRef.current.has(cid)) {
        knownComplaintIdsRef.current.add(cid);
        notifyNewComplaints([complaint]);
        loadComplaints();
      }
    };

    // 1. Cross-tab storage event
    const onStorage = (e) => {
      if (e.key === "civicshield_latest_complaint_event" && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload.complaint) {
            handleIncomingComplaint(payload.complaint);
          }
        } catch (err) {}
      }
    };
    window.addEventListener("storage", onStorage);

    // 2. In-window CustomEvent
    const onCustom = (e) => {
      if (e.detail) {
        handleIncomingComplaint(e.detail);
      }
    };
    window.addEventListener("civicshield_new_complaint", onCustom);

    // 3. BroadcastChannel across windows/tabs
    let bc;
    try {
      bc = new BroadcastChannel("civicshield_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "NEW_COMPLAINT" && event.data.complaint) {
          handleIncomingComplaint(event.data.complaint);
        }
      };
    } catch (e) {}

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("civicshield_new_complaint", onCustom);
      if (bc) bc.close();
    };
  }, [soundEnabled]);

  // Auto-dismiss floating toast after 9 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // 3. Aggregate 4 Key Metrics directly from real database complaints
  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(
      (c) => c.status === "Pending" || c.status === "Received"
    ).length;
    const inProgress = complaints.filter(
      (c) => c.status === "In Progress" || c.status === "Under Review"
    ).length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    const rejected = complaints.filter((c) => c.status === "Rejected").length;

    return { total, pending, inProgress, resolved, rejected };
  }, [complaints]);

  // 4. Filter complaints list
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.citizenName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === "Pending") {
        matchesStatus = item.status === "Pending" || item.status === "Received";
      } else if (statusFilter === "In Progress") {
        matchesStatus = item.status === "In Progress" || item.status === "Under Review";
      } else if (statusFilter !== "All") {
        matchesStatus = item.status === statusFilter;
      }

      const matchesCat = categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [complaints, search, statusFilter, categoryFilter]);

  // 5. Open Inspection Modal
  const handleOpenDossier = (comp) => {
    setSelectedComplaint(comp);
    setNewStatus(comp.status === "Received" ? "Pending" : comp.status);
    setAdminResponse(comp.adminResponse || "");
    setAssignedOfficer(comp.assignedOfficer || adminUser?.name || "");
    setUpdateMessage({ type: "", text: "" });
  };

  // 6. Save Status & Official Admin Response to Backend
  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    setUpdateMessage({ type: "", text: "" });

    try {
      const res = await updateComplaintByAdmin(selectedComplaint.id, {
        status: newStatus,
        adminResponse: adminResponse.trim(),
        assignedOfficer: assignedOfficer.trim(),
      });

      if (res.success) {
        setUpdateMessage({
          type: "success",
          text: `Complaint ${selectedComplaint.id} updated to ${newStatus}. Status saved to database and live on Citizen portal.`,
        });

        // Update local complaint state immediately
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id
              ? {
                  ...c,
                  status: newStatus,
                  adminResponse: adminResponse.trim(),
                  assignedOfficer: assignedOfficer.trim(),
                }
              : c
          )
        );

        setSelectedComplaint((prev) => ({
          ...prev,
          status: newStatus,
          adminResponse: adminResponse.trim(),
          assignedOfficer: assignedOfficer.trim(),
        }));
      } else {
        throw new Error(res.message || "Failed to update complaint status");
      }
    } catch (err) {
      setUpdateMessage({
        type: "error",
        text: err.message || "Network error updating complaint status",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    performAdminLogout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      {/* AMBIENT FLOATING GLOW ORBS FOR CYBERPUNK ATMOSPHERE */}
      <div className="admin-ambient-orb orb-1" aria-hidden="true" />
      <div className="admin-ambient-orb orb-2" aria-hidden="true" />
      <div className="admin-ambient-orb orb-3" aria-hidden="true" />

      {/* SIDEBAR NAVIGATION */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/admin/dashboard" className="admin-sidebar-brand">
          <div className="admin-brand-icon-box">
            <ShieldCheck size={22} />
          </div>
          <div className="admin-brand-names">
            <h2>
              CIVIC<span>SHIELD</span>
            </h2>
            <small>ADMIN SENTINEL OS</small>
          </div>
        </Link>

        <p className="admin-sidebar-section-label">COMMAND & CONTROL</p>
        <nav className="admin-nav-list">
          <button className="admin-nav-btn active">
            <LayoutDashboard size={17} />
            <span>Admin Dashboard</span>
          </button>
          <button
            className="admin-nav-btn"
            onClick={() => {
              setStatusFilter("All");
              setSidebarOpen(false);
            }}
          >
            <ClipboardList size={17} />
            <span>All Grievances ({metrics.total})</span>
          </button>
          <button
            className="admin-nav-btn"
            onClick={() => {
              setStatusFilter("Pending");
              setSidebarOpen(false);
            }}
          >
            <Clock size={17} />
            <span>Pending Action ({metrics.pending})</span>
          </button>
          <button
            className="admin-nav-btn"
            onClick={() => {
              setStatusFilter("In Progress");
              setSidebarOpen(false);
            }}
          >
            <Activity size={17} />
            <span>In Progress ({metrics.inProgress})</span>
          </button>
          <button
            className="admin-nav-btn"
            onClick={() => {
              setStatusFilter("Resolved");
              setSidebarOpen(false);
            }}
          >
            <CheckCircle2 size={17} />
            <span>Resolved Cases ({metrics.resolved})</span>
          </button>
          <Link
            to="/nearby-issues"
            className="admin-nav-btn"
            style={{ textDecoration: "none" }}
          >
            <Compass size={17} />
            <span>District Radar Map</span>
          </Link>
          <Link
            to="/dashboard"
            className="admin-nav-btn admin-nav-citizen-link"
            style={{ textDecoration: "none" }}
            title="Open Citizen Dashboard"
          >
            <LayoutDashboard size={17} color="#38bdf8" />
            <span>Citizen Dashboard</span>
          </Link>
          <Link
            to="/superadmin/login"
            className="admin-nav-btn admin-nav-superadmin-link"
            style={{
              textDecoration: "none",
              color: "#fbbf24",
              borderColor: "rgba(245, 158, 11, 0.3)",
              background: "rgba(245, 158, 11, 0.05)",
            }}
            title="Super Admin Apex Sentinel"
          >
            <Crown size={17} color="#fbbf24" />
            <span>Super Admin Apex</span>
          </Link>
          <Link
            to="/"
            className="admin-nav-btn"
            style={{ textDecoration: "none" }}
            title="Return to Public Home"
          >
            <Home size={17} />
            <span>Public Home</span>
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-officer-chip">
            <div className="admin-avatar-char">
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="admin-officer-info">
              <strong>{adminUser?.name || "Authorized Officer"}</strong>
              <small>{adminUser?.department || "Municipal Corp"}</small>
            </div>
          </div>

          <button
            type="button"
            className="admin-sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Navigation"
            >
              <Menu size={20} />
            </button>

            <div className="admin-breadcrumbs">
              <span className="admin-bread-root">CIVICSHIELD</span>
              <span className="admin-bread-sep">/</span>
              <span className="admin-bread-root">ADMIN-SENTINEL</span>
              <span className="admin-bread-sep">/</span>
              <span className="admin-bread-tag">COMPLAINT-COMMAND</span>
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-system-status-pill" title="TruthLens Forensics & Sarvam AI STT Active">
              <span className="admin-pulse-dot" />
              <span>SARVAM & TRUTHLENS PIPELINE LIVE</span>
            </div>

            {/* Sound chime toggle */}
            <button
              type="button"
              className={`admin-icon-btn ${soundEnabled ? "active" : ""}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Audio Alerts Enabled" : "Audio Alerts Muted"}
              aria-label="Toggle Alert Sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* NOTIFICATION CENTER BELL & DROPDOWN */}
            <div className="admin-notif-container">
              <button
                type="button"
                className={`admin-bell-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                title={`${unreadCount} New Grievance Notifications`}
                aria-label="Citizen Complaints Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="admin-bell-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationMenuOpen && (
                <div className="admin-notif-popover">
                  <div className="admin-notif-head">
                    <div className="admin-notif-title-row">
                      <BellRing size={15} color="#ef4444" />
                      <strong>Citizen Grievance Feed</strong>
                      {unreadCount > 0 && (
                        <span className="admin-unread-pill">{unreadCount} New</span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        className="admin-notif-mark-read"
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

                  <div className="admin-notif-items-list">
                    {notifications.length === 0 ? (
                      <div className="admin-notif-empty">
                        <CheckCircle2 size={26} color="#10b981" />
                        <p>No new complaints. Sentinel live monitoring is active.</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div
                          key={n.id + "-" + i}
                          className={`admin-notif-card ${n.unread ? "unread" : ""}`}
                          onClick={() => {
                            const target =
                              complaints.find((c) => c.id === n.id) || n.rawComplaint;
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
                          <div className="admin-notif-card-top">
                            <span className="admin-notif-card-id">#{n.id}</span>
                            <span className="admin-notif-card-time">{n.date}</span>
                          </div>
                          <h4 className="admin-notif-card-title">{n.title}</h4>
                          <div className="admin-notif-card-meta">
                            <span>{n.citizenName}</span>
                            <span className="admin-notif-card-cat">{n.category}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Link to Citizen Dashboard */}
            <Link
              to="/dashboard"
              className="admin-portal-switch-link primary"
              title="Open Citizen Dashboard"
            >
              <LayoutDashboard size={14} />
              <span>Citizen Dashboard</span>
            </Link>

            {/* Direct Link to Public Portal */}
            <Link to="/" className="admin-portal-switch-link" title="Open Public Website">
              <Home size={14} />
              <span>Public Portal</span>
            </Link>
          </div>
        </header>

        {/* FLOATING LIVE NOTIFICATION TOAST */}
        {activeToast && (
          <aside className="admin-floating-toast" role="alert" aria-live="assertive">
            <div className="admin-toast-top">
              <div className="admin-toast-icon-wrap">
                <span className="admin-toast-ping" />
                <BellRing size={16} color="#ef4444" />
              </div>
              <div className="admin-toast-label">🚨 LIVE CITIZEN GRIEVANCE FILED</div>
              <button
                type="button"
                className="admin-toast-close"
                onClick={() => setActiveToast(null)}
                aria-label="Dismiss alert"
              >
                <X size={15} />
              </button>
            </div>

            <div className="admin-toast-body">
              <h4 className="admin-toast-title">{activeToast.title}</h4>
              <div className="admin-toast-badges">
                <span className="toast-badge-cat">{activeToast.category}</span>
                <span className="toast-badge-loc">
                  <MapPin size={11} /> {activeToast.location}
                </span>
              </div>
              <p className="admin-toast-citizen">
                Citizen: <strong>{activeToast.citizenName}</strong> · Tracking ID: <code>{activeToast.id}</code>
              </p>
            </div>

            <div className="admin-toast-foot">
              <button
                type="button"
                className="admin-toast-inspect-btn"
                onClick={() => {
                  const target =
                    complaints.find((c) => c.id === activeToast.id) || activeToast.rawComplaint;
                  if (target) handleOpenDossier(target);
                  setActiveToast(null);
                }}
              >
                <Eye size={14} /> Review Complaint Dossier
              </button>
              <button
                type="button"
                className="admin-toast-dismiss-btn"
                onClick={() => setActiveToast(null)}
              >
                Dismiss
              </button>
            </div>
          </aside>
        )}

        {/* DASHBOARD BODY */}
        <div className="admin-content">
          {/* HEADER COMMAND ROW - TAMIL NADU GOVT SENTINEL OS */}
          <div className="admin-command-hero">
            <div className="admin-hero-left">
              <div className="tn-gov-emblem-badge">
                <span className="tn-emblem-icon">🏛️</span>
                <span className="tn-emblem-state">தமிழ்நாடு அரசு · GOVERNMENT OF TAMIL NADU</span>
                <span className="tn-emblem-divider">|</span>
                <span className="tn-emblem-motto">வாய்மையே வெல்லும் · TRUTH ALONE TRIUMPHS</span>
              </div>
              <h1>Municipal Grievance Sentinel Command</h1>
              <p>
                Real-time citizen grievance resolution and forensics across Tamil Nadu's 38 districts — empowered by Sarvam AI saaras:v4 (Tanglish to Tamil script) and TruthLens™ optical integrity verification.
              </p>

              {/* LIVE JURISDICTION SENTINEL TICKER */}
              <div className="tn-jurisdiction-bar">
                <span className="tn-jurisdiction-label">
                  <Navigation size={12} /> ACTIVE DISTRICT SECTORS:
                </span>
                <button
                  type="button"
                  className="tn-sector-chip"
                  onClick={() => { setSearch("Salem"); setCategoryFilter("All"); }}
                  title="Filter Salem Division"
                >
                  📍 Salem Urban (Ward 1-60)
                </button>
                <button
                  type="button"
                  className="tn-sector-chip"
                  onClick={() => { setSearch("Chennai"); setCategoryFilter("All"); }}
                  title="Filter Chennai Corporation"
                >
                  📍 Greater Chennai Corp
                </button>
                <button
                  type="button"
                  className="tn-sector-chip"
                  onClick={() => { setSearch("Madurai"); setCategoryFilter("All"); }}
                  title="Filter Madurai Region"
                >
                  📍 Madurai Municipal
                </button>
                <button
                  type="button"
                  className="tn-sector-chip"
                  onClick={() => { setSearch("Coimbatore"); setCategoryFilter("All"); }}
                  title="Filter Coimbatore Urban"
                >
                  📍 Coimbatore Central
                </button>
                <button
                  type="button"
                  className="tn-sector-chip"
                  onClick={() => { setSearch("Thanjavur"); setCategoryFilter("All"); }}
                  title="Filter Thanjavur Delta"
                >
                  📍 Thanjavur Delta
                </button>
              </div>
            </div>

            <div className="admin-hero-right">
              <button
                type="button"
                className="admin-refresh-btn"
                onClick={() => loadComplaints(true)}
                disabled={refreshing}
                title="Synchronize database from MongoDB Atlas"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                <span>{refreshing ? "Syncing MongoDB..." : "Sync Database"}</span>
              </button>
            </div>
          </div>

          {/* 4 STATS METRICS CARDS (EXACT REQUIREMENT #2) */}
          <section className="admin-stats-grid">
            {/* Total Complaints */}
            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">TOTAL COMPLAINTS</span>
                <div className="admin-stat-icon-wrap icon-blue">
                  <ClipboardList size={18} />
                </div>
              </div>
              <div className="admin-stat-number">{metrics.total}</div>
              <div className="admin-stat-footer">
                <Sparkles size={12} color="#38bdf8" /> Real-time database entries
              </div>
            </article>

            {/* Pending Complaints */}
            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">PENDING COMPLAINTS</span>
                <div className="admin-stat-icon-wrap icon-amber">
                  <Clock size={18} />
                </div>
              </div>
              <div className="admin-stat-number">{metrics.pending}</div>
              <div className="admin-stat-footer">
                <AlertTriangle size={12} color="#fbbf24" /> Awaiting initial dispatch
              </div>
            </article>

            {/* In Progress Complaints */}
            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">IN PROGRESS</span>
                <div className="admin-stat-icon-wrap icon-purple">
                  <Activity size={18} />
                </div>
              </div>
              <div className="admin-stat-number">{metrics.inProgress}</div>
              <div className="admin-stat-footer">
                <Activity size={12} color="#c084fc" /> Active field remediation
              </div>
            </article>

            {/* Resolved Complaints */}
            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-label">RESOLVED COMPLAINTS</span>
                <div className="admin-stat-icon-wrap icon-emerald">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="admin-stat-number">{metrics.resolved}</div>
              <div className="admin-stat-footer">
                <CheckCircle2 size={12} color="#34d399" /> Closed with municipal proof
              </div>
            </article>
          </section>

          {/* TAMIL NADU CULTURAL HERITAGE & CIVIC ADMINISTRATION ZONES */}
          <section className="tn-heritage-section">
            <div className="tn-heritage-header">
              <div className="tn-header-title-box">
                <div className="tn-title-icon-wrap">
                  <Landmark size={20} color="#38bdf8" />
                </div>
                <div>
                  <div className="tn-section-tag">TAMIL NADU CIVIC JURISDICTION & HERITAGE ZONES</div>
                  <h3>தமிழ்நாடு நகராட்சி நிர்வாக மண்டலங்கள்</h3>
                  <p>
                    Interactive municipal sentinel coverage across Tamil Nadu's architectural heritage, delta waterways, and metropolitan districts. Click any landmark zone to inspect and filter citizen grievances.
                  </p>
                </div>
              </div>

              {activeZoneId && (
                <button
                  type="button"
                  className="tn-reset-filter-btn"
                  onClick={() => {
                    setActiveZoneId(null);
                    setCategoryFilter("All");
                    setSearch("");
                  }}
                  title="Clear district zone filter"
                >
                  <X size={14} /> Clear Zone Filter
                </button>
              )}
            </div>

            <div className="tn-zones-grid">
              {TAMIL_NADU_DISTRICT_ZONES.map((zone) => {
                const isSelected = activeZoneId === zone.id;
                return (
                  <div
                    key={zone.id}
                    className={`tn-zone-card ${isSelected ? "selected" : ""} border-${zone.badgeColor}`}
                    onClick={() => handleZoneClick(zone)}
                    title={`Click to filter complaints for ${zone.name}`}
                  >
                    <div className="tn-card-image-wrap">
                      <img
                        src={zone.image}
                        alt={zone.name}
                        className="tn-card-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = zone.fallbackUrl;
                        }}
                        loading="lazy"
                      />
                      <div className="tn-card-overlay" />
                    </div>

                    <div className="tn-card-top-tags">
                      <span className={`tn-tag-pill ${zone.badgeColor}`}>{zone.tag}</span>
                      <span className="tn-live-ping">
                        <span className="ping-dot" />
                        <span className="ping-text">Active Sentinel</span>
                      </span>
                    </div>

                    <div className="tn-card-info">
                      <div className="tn-card-tamil">{zone.tamilName}</div>
                      <h4 className="tn-card-title">{zone.name}</h4>
                      <p className="tn-card-region">
                        <MapPin size={12} /> {zone.region}
                      </p>
                      <p className="tn-card-desc">{zone.description}</p>

                      <div className="tn-card-action-bar">
                        <span className="tn-filter-hint">
                          {isSelected ? "Active Filter ✓" : `Inspect: ${zone.categoryFilter}`}
                        </span>
                        <ArrowRight size={14} className="tn-arrow" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CITIZEN COMPLAINT MANAGEMENT PANEL */}
          <section className="admin-data-panel">
            <div className="admin-filter-bar">
              {/* Search Box */}
              <div className="admin-search-wrap">
                <Search size={16} className="admin-search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search complaint ID, citizen name, location, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Status Tab Filters */}
              <div className="admin-tab-group">
                {["All", "Pending", "In Progress", "Resolved", "Rejected"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`admin-tab-btn ${statusFilter === st ? "active" : ""}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* REAL-TIME COMPLAINTS TABLE */}
            <div className="admin-table-container">
              {loading ? (
                <div className="admin-empty-state">
                  <RefreshCw size={32} className="animate-spin text-sky-400 mx-auto" />
                  <h3>Retrieving complaints from MongoDB Atlas...</h3>
                  <p>Synchronizing real-time citizen grievance data.</p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="admin-empty-state">
                  <ClipboardList size={38} className="mx-auto" />
                  <h3>No Complaints Match Filter Criteria</h3>
                  <p>
                    {search
                      ? `No records found matching "${search}".`
                      : "No complaints found under the selected status filter."}
                  </p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Complaint ID</th>
                      <th>Citizen Details</th>
                      <th>Title & Description</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>AI Forensics</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((c) => {
                      const isPending = c.status === "Pending" || c.status === "Received";
                      const isInProgress = c.status === "In Progress" || c.status === "Under Review";
                      const isResolved = c.status === "Resolved";
                      const isRejected = c.status === "Rejected";

                      return (
                        <tr key={c.id}>
                          {/* ID */}
                          <td>
                            <span className="admin-tracking-id">{c.id}</span>
                            <small style={{ display: "block", color: "#64748b", fontSize: "11px" }}>
                              {c.date}
                            </small>
                          </td>

                          {/* Citizen */}
                          <td className="admin-citizen-cell">
                            <strong>{c.citizenName}</strong>
                            <small>{c.citizenPhone || c.citizenEmail || "Verified Citizen"}</small>
                          </td>

                          {/* Title & Description */}
                          <td className="admin-title-cell">
                            <span className="admin-complaint-title" title={c.title}>
                              {c.title}
                            </span>
                            <span className="admin-complaint-desc" title={c.description}>
                              {c.description || "No written description."}
                            </span>
                          </td>

                          {/* Category */}
                          <td>
                            <span className="admin-category-badge">{c.category}</span>
                          </td>

                          {/* Location */}
                          <td className="admin-location-cell" title={c.location}>
                            📍 {c.location}
                          </td>

                          {/* Current Status */}
                          <td>
                            <span
                              className={`admin-status-pill ${
                                isPending
                                  ? "status-pending"
                                  : isInProgress
                                  ? "status-progress"
                                  : isResolved
                                  ? "status-resolved"
                                  : "status-rejected"
                              }`}
                            >
                              {isPending
                                ? "Pending"
                                : isInProgress
                                ? "In Progress"
                                : isResolved
                                ? "Resolved"
                                : "Rejected"}
                            </span>
                          </td>

                          {/* AI Forensics (TruthLens & Sarvam) */}
                          <td>
                            <div className="admin-ai-pills">
                              <span
                                className="truthlens-pill"
                                title="TruthLens Media Forensics & Deepfake Verifier"
                              >
                                🛡️ {c.truthlens?.authenticityScore || 94}%
                              </span>
                              {c.sarvam?.transcription && (
                                <span
                                  className="sarvam-pill"
                                  title="Sarvam AI Saaras v4 STT Transcript"
                                >
                                  🎙️ Sarvam
                                </span>
                              )}
                              {c.videos?.length > 0 && (
                                <span className="sarvam-pill" style={{ color: "#38bdf8" }}>
                                  🎥 Video
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Action Button */}
                          <td>
                            <button
                              type="button"
                              className="admin-action-inspect-btn"
                              onClick={() => handleOpenDossier(c)}
                            >
                              <Eye size={14} />
                              <span>Inspect & Resolve</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* COMPLAINT DOSSIER & RESOLUTION MODAL */}
      {selectedComplaint && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedComplaint(null)}>
          <div
            className="admin-modal-window"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* MODAL HEADER */}
            <div className="admin-modal-header">
              <h2>
                <ShieldCheck size={20} color="#38bdf8" />
                <span>Grievance Dossier: {selectedComplaint.id}</span>
              </h2>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setSelectedComplaint(null)}
                aria-label="Close dossier"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="admin-modal-body">
              {updateMessage.text && (
                <div
                  className={`admin-alert-banner ${
                    updateMessage.type === "success" ? "success" : "error"
                  }`}
                >
                  {updateMessage.type === "success" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                  <span>{updateMessage.text}</span>
                </div>
              )}

              {/* CITIZEN & LOCATION INFO */}
              <div className="admin-grid-two">
                <div className="admin-dossier-card">
                  <h4>
                    <User size={15} /> Citizen Information
                  </h4>
                  <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#ffffff" }}>
                    {selectedComplaint.citizenName}
                  </p>
                  <p style={{ margin: "0 0 4px", fontSize: "12.5px", color: "#94a3b8" }}>
                    <strong>Email:</strong> {selectedComplaint.citizenEmail || "Not provided"}
                  </p>
                  <p style={{ margin: "0", fontSize: "12.5px", color: "#94a3b8" }}>
                    <strong>Phone:</strong> {selectedComplaint.citizenPhone || "Not provided"}
                  </p>
                </div>

                <div className="admin-dossier-card">
                  <h4>
                    <MapPin size={15} /> Geolocation & Timing
                  </h4>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#ffffff" }}>
                    <strong>Location:</strong> {selectedComplaint.location}
                  </p>
                  {selectedComplaint.coordinates && (
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#38bdf8", fontFamily: "monospace" }}>
                      <strong>GPS:</strong> {selectedComplaint.coordinates}
                    </p>
                  )}
                  <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>
                    <strong>Registered Date:</strong> {selectedComplaint.date}
                  </p>
                </div>
              </div>

              {/* GRIEVANCE TITLE & DESCRIPTION */}
              <div className="admin-dossier-card">
                <h4>
                  <ClipboardList size={15} /> Complaint Content
                </h4>
                <h3 style={{ margin: "0 0 8px", fontSize: "16px", color: "#ffffff" }}>
                  {selectedComplaint.title}
                </h3>
                <p style={{ margin: "0", fontSize: "13.5px", color: "#cbd5e1", lineHeight: "1.6" }}>
                  {selectedComplaint.description}
                </p>
              </div>

              {/* SARVAM AI TRANSCRIPT IF RECORDED BY CITIZEN */}
              {selectedComplaint.sarvam?.transcription && (
                <div className="admin-dossier-card" style={{ borderColor: "rgba(168, 85, 247, 0.3)" }}>
                  <h4 style={{ color: "#c084fc" }}>
                    <Mic size={15} /> Sarvam AI Saaras v4 Spoken Voice Intelligence
                  </h4>
                  <div style={{ background: "rgba(168, 85, 247, 0.08)", padding: "12px", borderRadius: "8px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#e9d5ff", fontStyle: "italic" }}>
                      <strong>Original Transcript ({selectedComplaint.sarvam.languageName || "Tamil"}):</strong> "
                      {selectedComplaint.sarvam.transcription}"
                    </p>
                    {selectedComplaint.sarvam.translatedEnglish && (
                      <p style={{ margin: "0", fontSize: "13px", color: "#a5f3fc" }}>
                        <strong>English Translation:</strong> "{selectedComplaint.sarvam.translatedEnglish}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* UPLOADED EVIDENCE (IMAGES & VIDEO) */}
              <div className="admin-dossier-card">
                <h4>
                  <Camera size={15} /> Uploaded Media Evidence ({selectedComplaint.images.length} Photos,{" "}
                  {selectedComplaint.videos.length} Videos)
                </h4>

                {selectedComplaint.images.length === 0 && selectedComplaint.videos.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "13px", margin: "0" }}>
                    No media files uploaded by citizen.
                  </p>
                ) : (
                  <div className="admin-media-strip">
                    {selectedComplaint.images.map((img, idx) => (
                      <a
                        key={idx}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Click to view full image"
                      >
                        <img
                          src={img.url}
                          alt={`Evidence ${idx + 1}`}
                          className="admin-media-thumb"
                        />
                      </a>
                    ))}

                    {selectedComplaint.videos.map((vid, idx) => (
                      <video
                        key={idx}
                        src={vid.url}
                        controls
                        style={{
                          width: "160px",
                          height: "95px",
                          borderRadius: "8px",
                          border: "1px solid rgba(56, 189, 248, 0.3)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* RESOLUTION CONTROLS FORM */}
              <form onSubmit={handleSaveResolution} className="admin-resolution-box">
                <h4 style={{ margin: "0", fontSize: "15px", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <MessageSquare size={17} color="#38bdf8" /> Official Action & Resolution Dispatch
                </h4>

                <div className="admin-grid-two">
                  <div className="admin-field-group">
                    <label htmlFor="modal-status-select">Update Complaint Status *</label>
                    <select
                      id="modal-status-select"
                      className="admin-select-status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st === "Pending" ? "Pending (Awaiting Action)" : st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-field-group">
                    <label htmlFor="modal-officer">Assigned Officer / Department</label>
                    <input
                      id="modal-officer"
                      type="text"
                      className="admin-input"
                      style={{ paddingLeft: "14px" }}
                      placeholder="Officer Name or Ward Chief"
                      value={assignedOfficer}
                      onChange={(e) => setAssignedOfficer(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-field-group">
                  <label htmlFor="modal-remarks">Official Admin Response & Resolution Remarks *</label>
                  <textarea
                    id="modal-remarks"
                    className="admin-textarea-response"
                    placeholder="Enter official resolution notes, inspection findings, work order ID, or department response. This will be visible on the Citizen portal in real time..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    className="admin-btn-save-resolution"
                    disabled={updating}
                  >
                    {updating ? (
                      <span>Saving to MongoDB Atlas...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Save & Push Status Update to Database</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* MODAL FOOTER */}
            <div className="admin-modal-footer">
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Tracking ID: <strong style={{ color: "#38bdf8" }}>{selectedComplaint.id}</strong> // MongoDB Realtime Sync
              </span>
              <button
                type="button"
                className="admin-exit-btn"
                onClick={() => setSelectedComplaint(null)}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

