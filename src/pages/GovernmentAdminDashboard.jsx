
import { useMemo, useState, useEffect } from "react";
import { fetchComplaints, updateComplaintStatus, performLogout } from "../api";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  Building2,
  Users,
  Bell,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Filter,
  MoreHorizontal,
  Activity,
  TrendingUp,
  CalendarDays,
  ChevronDown,
} from "lucide-react";

import "./GovernmentAdminDashboard.css";

const complaints = [
  {
    id: "CSC2587",
    title: "Large pothole near bus stand",
    location: "Salem, Tamil Nadu",
    date: "12 May 2026",
    department: "Road Department",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "CSC2588",
    title: "Continuous water leakage",
    location: "Namakkal, Tamil Nadu",
    date: "10 May 2026",
    department: "Water Supply",
    priority: "Urgent",
    status: "Under Review",
  },
  {
    id: "CSC2589",
    title: "Street light not working",
    location: "Salem, Tamil Nadu",
    date: "08 May 2026",
    department: "Electricity Board",
    priority: "Medium",
    status: "Resolved",
  },
  {
    id: "CSC2590",
    title: "Garbage not collected",
    location: "Erode, Tamil Nadu",
    date: "07 May 2026",
    department: "Sanitation",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: "CSC2591",
    title: "Damaged public drainage",
    location: "Salem, Tamil Nadu",
    date: "06 May 2026",
    department: "Public Works",
    priority: "High",
    status: "In Progress",
  },
];

const departments = [
  { name: "Road Department", total: 128, resolved: 91, percent: 71 },
  { name: "Water Supply", total: 96, resolved: 72, percent: 75 },
  { name: "Sanitation", total: 84, resolved: 69, percent: 82 },
  { name: "Electricity Board", total: 63, resolved: 54, percent: 86 },
];

const activities = [
  {
    icon: CheckCircle2,
    color: "green",
    title: "Complaint CSC2589 marked as resolved",
    detail: "Electricity Board · Salem",
    time: "Today, 10:42 AM",
  },
  {
    icon: Users,
    color: "blue",
    title: "CSC2587 assigned to Road Department",
    detail: "Assignment updated by Admin",
    time: "Today, 09:18 AM",
  },
  {
    icon: AlertTriangle,
    color: "orange",
    title: "High-priority complaint received",
    detail: "Water leakage · Namakkal",
    time: "Yesterday, 04:35 PM",
  },
];

function GovernmentAdminDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "All Complaints", icon: ClipboardList },
    { name: "Departments", icon: Building2 },
    { name: "Citizens", icon: Users },
    { name: "Reports & Analytics", icon: Activity },
    { name: "Notifications", icon: Bell },
    { name: "Settings", icon: Settings },
  ];

  const filteredComplaints = useMemo(() => {
    const sourceList = liveComplaints.length > 0 ? liveComplaints : complaints;
    return sourceList.filter((complaint) => {
      const matchesSearch =
        `${complaint.id} ${complaint.title} ${complaint.location} ${complaint.department}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const handleNavigation = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  return (
    <div className="gov-layout">

      {sidebarOpen && (
        <div
          className="gov-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`gov-sidebar ${sidebarOpen ? "gov-sidebar-open" : ""}`}>

        <Link to="/" className="gov-brand">
          <ShieldCheck size={34} />

          <div>
            <h2>CivicShield <span>AI</span></h2>
            <small>Government Portal</small>
          </div>

          <button
            className="gov-sidebar-close"
            onClick={(event) => {
              event.preventDefault();
              setSidebarOpen(false);
            }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </Link>

        <div className="gov-portal-label">
          AUTHORITY WORKSPACE
        </div>

        <nav className="gov-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`gov-nav-link ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => handleNavigation(item.name)}
              >
                <Icon size={18} />
                <span>{item.name}</span>

                {item.name === "All Complaints" && (
                  <span className="gov-nav-count">24</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="gov-sidebar-bottom">

          <div className="gov-sidebar-note">
            <ShieldCheck size={24} />

            <h4>Transparent Governance</h4>

            <p>
              Every complaint deserves attention.
              Every action builds trust.
            </p>
          </div>

          <Link to="/" className="gov-logout">
            <LogOut size={17} />
            Logout
          </Link>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="gov-main">

        {/* TOPBAR */}
        <header className="gov-topbar">

          <button
            className="gov-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="gov-breadcrumb">
            <span>Government Authority</span>
            <span>/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="gov-top-actions">

            <button
              className="gov-top-icon"
              aria-label="Notifications"
              onClick={() => handleNavigation("Notifications")}
            >
              <Bell size={19} />
              <i />
            </button>

            <div className="gov-admin-profile">

              <div className="gov-avatar">A</div>

              <div>
                <strong>Admin Officer</strong>
                <small>Government Admin</small>
              </div>

              <ChevronDown size={15} />

            </div>
          </div>
        </header>

        <div className="gov-content">

          {/* WELCOME */}
          <section className="gov-welcome">

            <div>
              <span className="gov-eyebrow">
                GOVERNMENT AUTHORITY PORTAL
              </span>

              <h1>Welcome back, Admin 👋</h1>

              <p>
                Monitor civic issues and coordinate faster public services.
              </p>
            </div>

            <div className="gov-date-chip">
              <CalendarDays size={17} />
              <span>Authority Overview</span>
            </div>

          </section>

          {/* STATISTICS */}
          <section className="gov-stats-grid">

            <article className="gov-stat-card">
              <div className="gov-stat-top">
                <span>Total Complaints</span>
                <div className="gov-stat-icon blue">
                  <ClipboardList size={20} />
                </div>
              </div>

              <h2>1,248</h2>
              <small>
                <TrendingUp size={14} />
                12% <span>from last month</span>
              </small>
            </article>

            <article className="gov-stat-card">
              <div className="gov-stat-top">
                <span>Pending Review</span>
                <div className="gov-stat-icon orange">
                  <Clock3 size={20} />
                </div>
              </div>

              <h2>186</h2>
              <small className="gov-neutral">
                Awaiting department action
              </small>
            </article>

            <article className="gov-stat-card">
              <div className="gov-stat-top">
                <span>In Progress</span>
                <div className="gov-stat-icon purple">
                  <Activity size={20} />
                </div>
              </div>

              <h2>342</h2>
              <small className="gov-neutral">
                Currently being addressed
              </small>
            </article>

            <article className="gov-stat-card">
              <div className="gov-stat-top">
                <span>Resolved</span>
                <div className="gov-stat-icon green">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <h2>720</h2>
              <small>
                <TrendingUp size={14} />
                8.4% <span>resolution increase</span>
              </small>
            </article>

          </section>

          {/* OVERDUE ALERT */}
          <section className="gov-alert-banner">

            <div className="gov-alert-symbol">
              <AlertTriangle size={21} />
            </div>

            <div>
              <strong>
                Attention required: 18 complaints are overdue
              </strong>

              <p>
                Review delayed cases and follow up with the responsible departments.
              </p>
            </div>

            <button
              onClick={() => {
                setStatusFilter("Pending");
                setActivePage("All Complaints");
              }}
            >
              Review cases <ArrowRight size={15} />
            </button>

          </section>

          {/* MAIN GRID */}
          <section className="gov-main-grid">

            {/* COMPLAINT MANAGEMENT */}
            <article className="gov-panel gov-complaints-panel">

              <div className="gov-panel-heading">
                <div>
                  <h3>Complaint Management</h3>
                  <p>
                    Review and monitor recently submitted complaints
                  </p>
                </div>

                <button
                  className="gov-outline-button"
                  onClick={() => handleNavigation("All Complaints")}
                >
                  All complaints <ArrowUpRight size={15} />
                </button>
              </div>

              <div className="gov-table-tools">

                <div className="gov-search">
                  <Search size={17} />

                  <input
                    type="search"
                    placeholder="Search ID, issue, location..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <label className="gov-filter">
                  <Filter size={16} />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    aria-label="Filter complaints by status"
                  >
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </label>

              </div>

              <div className="gov-table-wrap">

                <table className="gov-complaints-table">

                  <thead>
                    <tr>
                      <th>COMPLAINT</th>
                      <th>DEPARTMENT</th>
                      <th>PRIORITY</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredComplaints.map((item) => (
                      <tr key={item.id}>

                        <td>
                          <strong>{item.title}</strong>
                          <small>{item.id} · {item.date}</small>

                          <small className="gov-location">
                            <MapPin size={12} />
                            {item.location}
                          </small>
                        </td>

                        <td>{item.department}</td>

                        <td>
                          <span className={`gov-priority ${item.priority.toLowerCase()}`}>
                            {item.priority}
                          </span>
                        </td>

                        <td>
                          <span className={`gov-status ${item.status.toLowerCase().replaceAll(" ", "-")}`}>
                            {item.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="gov-more-button"
                            title={`View ${item.id}`}
                            onClick={() =>
                              window.alert(
                                `${item.id}\n${item.title}\n${item.department}\n${item.status}\n\nDemo preview only.`
                              )
                            }
                          >
                            <MoreHorizontal size={19} />
                          </button>
                        </td>

                      </tr>
                    ))}

                    {filteredComplaints.length === 0 && (
                      <tr>
                        <td colSpan="5" className="gov-empty">
                          No complaints match your search.
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>

              </div>

              <div className="gov-table-footer">
                <span>
                  Showing {filteredComplaints.length} of {liveComplaints.length > 0 ? liveComplaints.length : complaints.length} complaints (MongoDB Real-time)
                </span>

                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                >
                  Clear filters
                </button>
              </div>

            </article>

            {/* DEPARTMENT PERFORMANCE */}
            <article className="gov-panel gov-department-panel">

              <div className="gov-panel-heading">
                <div>
                  <h3>Department Performance</h3>
                  <p>Resolution overview by department</p>
                </div>

                <button className="gov-icon-action" aria-label="Department report">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="gov-department-list">

                {departments.map((department) => (
                  <div
                    className="gov-department-item"
                    key={department.name}
                  >

                    <div className="gov-department-info">
                      <strong>{department.name}</strong>
                      <span>
                        {department.resolved} / {department.total} resolved
                      </span>
                    </div>

                    <div className="gov-progress-track">
                      <div
                        style={{ width: `${department.percent}%` }}
                      />
                    </div>

                    <div className="gov-progress-label">
                      <span>Resolution rate</span>
                      <strong>{department.percent}%</strong>
                    </div>

                  </div>
                ))}

              </div>

              <button
                className="gov-full-width-button"
                onClick={() => handleNavigation("Departments")}
              >
                Manage departments <ArrowRight size={15} />
              </button>

            </article>

          </section>

          {/* RECENT ACTIVITY */}
          <section className="gov-panel gov-activity-panel">

            <div className="gov-panel-heading">
              <div>
                <h3>Recent Authority Activity</h3>
                <p>Latest updates across the complaint system</p>
              </div>

              <button
                className="gov-outline-button"
                onClick={() => handleNavigation("Reports & Analytics")}
              >
                View activity <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="gov-activity-list">

              {activities.map((activity, index) => {
                const Icon = activity.icon;

                return (
                  <div className="gov-activity-row" key={index}>

                    <div className={`gov-activity-icon ${activity.color}`}>
                      <Icon size={18} />
                    </div>

                    <div className="gov-activity-copy">
                      <strong>{activity.title}</strong>
                      <small>{activity.detail}</small>
                    </div>

                    <time>{activity.time}</time>

                  </div>
                );
              })}

            </div>
          </section>

          {/* FOOTER */}
          <footer className="gov-footer">
            <span>© 2026 CivicShield AI</span>
            <span>Government Authority Portal · Demo Dashboard</span>
            <span>நம் ஊர்... நம் பொறுப்பு...</span>
          </footer>

        </div>
      </main>
    </div>
  );
}

export default GovernmentAdminDashboard;
