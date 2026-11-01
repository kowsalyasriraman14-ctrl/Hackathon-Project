import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  ShieldCheck,
  PlusCircle,
  Filter,
  Search,
  ArrowRight,
  Droplets,
  Zap,
  Trash2,
  Bus,
  Layers,
  Sparkles,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { fetchComplaints } from "../api";
import "./NearbyIssues.css";

export default function NearbyIssues() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [activeMarker, setActiveMarker] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const live = await fetchComplaints();
        if (live && live.length > 0) {
          setComplaints(live);
          setActiveMarker(live[0]);
        }
      } catch (err) {
        console.warn("Could not fetch complaints:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ["All", "Roads & Transport", "Water Supply", "Electricity", "Sanitation & Waste", "Drainage & Sewage"];

  const filtered = complaints.filter((c) => {
    const matchesCat = selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch =
      (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.location?.address || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.trackingId || "").toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="nearby-page-wrapper">
      <Navbar active="nearby" />

      <main className="nearby-container">
        {/* HEADER */}
        <section className="nearby-header">
          <div>
            <span className="nearby-tag">
              <MapPin size={15} /> GEOGRAPHIC CIVIC RADAR // LIVE
            </span>
            <h1>Salem District Civic Radar</h1>
            <p>
              Explore geotagged public complaints, infrastructure issues, and municipal progress in your neighborhood.
            </p>
          </div>

          <Link to="/report-issue" className="nearby-report-btn">
            <PlusCircle size={17} /> Report Issue at Current Location
          </Link>
        </section>

        {/* FILTERS & SEARCH BAR */}
        <div className="nearby-filter-bar">
          <div className="nearby-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search area, landmark, or issue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="nearby-cat-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`nearby-chip ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* INTERACTIVE RADAR & LIST GRID */}
        <div className="nearby-layout-grid">
          {/* LEFT: SIMULATED GEOGRAPHIC RADAR CANVAS */}
          <div className="nearby-map-card">
            <div className="radar-canvas-box">
              <span className="radar-grid-label">MUNICIPAL GPS GRID · SALEM DISTRICT</span>
              <div className="radar-sweep"></div>
              <div className="radar-ring ring-1"></div>
              <div className="radar-ring ring-2"></div>
              <div className="radar-ring ring-3"></div>

              {/* Pins on the radar map */}
              {filtered.slice(0, 8).map((c, idx) => {
                const positions = [
                  { top: "35%", left: "42%" },
                  { top: "25%", left: "68%" },
                  { top: "62%", left: "30%" },
                  { top: "50%", left: "75%" },
                  { top: "70%", left: "55%" },
                  { top: "18%", left: "35%" },
                  { top: "45%", left: "20%" },
                  { top: "80%", left: "65%" },
                ];
                const pos = positions[idx] || { top: "50%", left: "50%" };
                const isSelected = activeMarker?.trackingId === c.trackingId;

                return (
                  <div
                    key={c.trackingId || idx}
                    className={`radar-pin-dot ${isSelected ? "selected" : ""}`}
                    style={{ top: pos.top, left: pos.left }}
                    onClick={() => setActiveMarker(c)}
                    title={`${c.trackingId}: ${c.title}`}
                  >
                    <MapPin size={18} />
                    <span className="radar-pin-label">{c.category?.split(" ")[0] || "Issue"}</span>
                  </div>
                );
              })}
            </div>

            {/* ACTIVE MARKER PREVIEW BAR */}
            {activeMarker && (
              <div className="active-marker-info">
                <div>
                  <strong>{activeMarker.title}</strong>
                  <p>{activeMarker.location?.address || "Salem, Tamil Nadu"}</p>
                </div>
                <button
                  type="button"
                  className="btn-track-pin"
                  onClick={() => navigate(`/track-complaints?id=${activeMarker.trackingId}`)}
                >
                  Inspect Case <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: LIST OF GEOTAGGED ISSUES */}
          <div className="nearby-list-card">
            <h3>Reported Issues ({filtered.length})</h3>

            {loading ? (
              <p style={{ padding: "30px", color: "#64748b", textAlign: "center" }}>
                Loading geographic grievances...
              </p>
            ) : filtered.length > 0 ? (
              <div className="nearby-cards-scroll">
                {filtered.map((item) => (
                  <article
                    key={item.trackingId}
                    className={`nearby-issue-item ${
                      activeMarker?.trackingId === item.trackingId ? "active-item" : ""
                    }`}
                    onClick={() => setActiveMarker(item)}
                  >
                    <div className="nearby-item-header">
                      <strong>{item.title}</strong>
                      <span className={`status-badge ${item.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                        {item.status || "Received"}
                      </span>
                    </div>

                    <p className="nearby-item-location">
                      <MapPin size={13} /> {item.location?.address || "Salem City"}
                    </p>

                    <div className="nearby-item-footer">
                      <span className="nearby-item-cat">{item.category}</span>
                      <Link
                        to={`/track-complaints?id=${item.trackingId}`}
                        className="nearby-track-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Track Status →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="nearby-empty-state">
                <p>No complaints found matching this filter.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

