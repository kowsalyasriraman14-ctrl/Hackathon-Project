import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Landmark,
  Building2,
  CheckCircle2,
  Clock3,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Activity,
  FileText,
  Megaphone,
} from "lucide-react";

import Navbar from "../components/Navbar";
import "./GovernmentUpdates.css";

const officialUpdates = [
  {
    id: "UPD-104",
    department: "Highways & Road Maintenance",
    title: "Salem Junction Road Resurfacing & Pothole Repair Work",
    status: "In Progress",
    date: "14 May 2026",
    summary: "Asphalt resurfacing commenced along 4-Roads to New Bus Stand stretch following 28 verified citizen grievance reports on CivicShield AI.",
    completion: "65% Completed",
  },
  {
    id: "UPD-103",
    department: "Tamil Nadu Water Supply & Drainage (TWAD)",
    title: "Pipeline Replacement at Fairlands Main Supply Line",
    status: "Completed",
    date: "12 May 2026",
    summary: "Major 12-inch distribution pipe fracture isolated and repaired. Clean drinking water distribution restored to 4,200 households.",
    completion: "100% Resolved",
  },
  {
    id: "UPD-102",
    department: "TANGEDCO Electricity Board",
    title: "Overhead Distribution Cable Inspection & Transformer Upgrades",
    status: "Completed",
    date: "09 May 2026",
    summary: "High-voltage cable sagging resolved across Ward 14. 250kVA transformer installed to stabilize voltage fluctuations.",
    completion: "100% Resolved",
  },
  {
    id: "UPD-101",
    department: "City Solid Waste & Sanitation",
    title: "Bio-Mining & Daily Waste Clearance Drive in Ward 8",
    status: "Ongoing",
    date: "06 May 2026",
    summary: "Dedicated electric compactor trucks assigned for twice-daily collection to eliminate open roadside waste dumps.",
    completion: "80% Completed",
  },
];

export default function GovernmentUpdates() {
  const [filter, setFilter] = useState("All");

  const filtered = officialUpdates.filter(
    (u) => filter === "All" || u.status === filter
  );

  return (
    <div className="updates-page-wrapper">
      <Navbar active="updates" />

      <main className="updates-container">
        {/* HEADER */}
        <section className="updates-header">
          <span className="updates-tag">
            <Megaphone size={15} /> OFFICIAL MUNICIPAL ANNOUNCEMENTS
          </span>
          <h1>Government Action & Department Updates</h1>
          <p>
            Transparent tracking of civic repairs, public infrastructure investments, and municipal actions taken in response to citizen reports.
          </p>
        </section>

        {/* METRICS OVERVIEW */}
        <div className="updates-metrics-grid">
          <div className="metric-card">
            <span className="metric-val">128</span>
            <span className="metric-lbl">Active Municipal Projects</span>
          </div>
          <div className="metric-card">
            <span className="metric-val" style={{ color: "#10b981" }}>91.4%</span>
            <span className="metric-lbl">Resolution Rate (30 Days)</span>
          </div>
          <div className="metric-card">
            <span className="metric-val" style={{ color: "#0284c7" }}>4.2 hrs</span>
            <span className="metric-lbl">Avg Response Time</span>
          </div>
          <div className="metric-card">
            <span className="metric-val" style={{ color: "#7c3aed" }}>100%</span>
            <span className="metric-lbl">TruthLens Verified</span>
          </div>
        </div>

        {/* UPDATES FEED */}
        <section className="updates-feed-section">
          <div className="feed-header">
            <h3>Recent Department Action Bulletins</h3>
            <div className="feed-filters">
              {["All", "In Progress", "Ongoing", "Completed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`feed-filter-btn ${filter === st ? "active" : ""}`}
                  onClick={() => setFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="updates-list">
            {filtered.map((item) => (
              <article key={item.id} className="update-card">
                <div className="update-card-top">
                  <div>
                    <span className="update-dept-tag">
                      <Building2 size={13} /> {item.department}
                    </span>
                    <h2>{item.title}</h2>
                  </div>
                  <span className={`update-status-badge ${item.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {item.status}
                  </span>
                </div>

                <p className="update-summary">{item.summary}</p>

                <div className="update-card-footer">
                  <span className="update-date">
                    <Calendar size={14} /> Announced: {item.date}
                  </span>
                  <span className="update-completion">
                    <CheckCircle2 size={14} color="#10b981" /> {item.completion}
                  </span>
                  <Link to="/track-complaints" className="update-view-btn">
                    View Grievances →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CALLOUT TO GOVERNMENT PORTAL */}
        <div className="gov-portal-callout">
          <div>
            <h3>Are you a Government Administrator or Municipal Officer?</h3>
            <p>Access the official administrative dashboard to assign teams, update repair milestones, and review evidence.</p>
          </div>
          <Link to="/government-dashboard" className="btn-open-gov-dash">
            Open Government Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}

