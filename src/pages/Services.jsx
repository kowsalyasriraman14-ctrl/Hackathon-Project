import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  MapPin,
  Languages,
  MessageCircle,
  Camera,
  Activity,
  ArrowRight,
  Video,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Zap,
  Droplets,
  Bus,
  Trash2,
} from "lucide-react";
import { isAuthenticated } from "../api";
import Navbar from "../components/Navbar";
import "./services.css";

export default function Services() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const handleStartComplain = (category = "") => {
    if (!isAuthenticated()) {
      navigate(
        category
          ? `/signup?redirect=report-issue&category=${encodeURIComponent(category)}`
          : "/signup?redirect=report-issue"
      );
    } else {
      navigate(
        category
          ? `/report-issue?category=${encodeURIComponent(category)}`
          : "/report-issue"
      );
    }
  };

  const services = [
    {
      id: "road-transport",
      category: "Transport",
      icon: <Bus size={28} />,
      title: "Roads & Transportation Hazards",
      description:
        "Report severe potholes, missing street signage, damaged footpaths, traffic signal failures, and bus shelter damage.",
      department: "Highways & Transport Dept",
      sla: "24-48 Hours",
      status: "Operational",
    },
    {
      id: "water-supply",
      category: "Water",
      icon: <Droplets size={28} />,
      title: "Water Supply & Pipeline Leaks",
      description:
        "Report high-pressure pipeline bursts, contaminated drinking water, prolonged supply disruption, and overhead tank overflows.",
      department: "TWAD & City Water Board",
      sla: "12-24 Hours",
      status: "High Priority",
    },
    {
      id: "electricity-grid",
      category: "Energy",
      icon: <Zap size={28} />,
      title: "Electrical Grid & Streetlights",
      description:
        "Report dangling live cables, sparking transformers, dark street corridors, and open feeder pillar hazards.",
      department: "TANGEDCO Power Grid",
      sla: "4-12 Hours (Emergency)",
      status: "Emergency Ready",
    },
    {
      id: "waste-sanitation",
      category: "Sanitation",
      icon: <Trash2 size={28} />,
      title: "Waste Management & Sanitation",
      description:
        "Report uncleared commercial garbage piles, overflowing dumper bins, illegal dump yards, and bio-waste accumulation.",
      department: "Municipal Sanitation Corp",
      sla: "24 Hours",
      status: "Operational",
    },
    {
      id: "gps-reporting",
      category: "AI Forensics",
      icon: <MapPin size={28} />,
      title: "High-Precision GPS Location Tagging",
      description:
        "Automatic geocoding with latitude, longitude coordinates and street landmarks to pinpoint issues within 5-meter accuracy.",
      department: "Spatial GIS Infrastructure",
      sla: "Instant Detection",
      status: "Automated",
    },
    {
      id: "video-evidence",
      category: "AI Forensics",
      icon: <Video size={28} />,
      title: "20 to 30-Second Video Documentation",
      description:
        "Upload or record 20-30s dynamic video footage to document active water leaks, heavy road cave-ins, or sewage surges.",
      department: "TruthLens™ Video Pipeline",
      sla: "Instant Audit",
      status: "Automated",
    },
    {
      id: "sarvam-voice",
      category: "AI Forensics",
      icon: <Languages size={28} />,
      title: "Sarvam AI Multilingual Voice Assistant",
      description:
        "Speak in native Tamil or English. Sarvam AI's Saaras voice engine transcribes your speech and converts it into structured grievance data.",
      department: "Sarvam AI Indic Engine",
      sla: "&lt; 300ms",
      status: "Active",
    },
    {
      id: "truthlens-integrity",
      category: "AI Forensics",
      icon: <ShieldCheck size={28} />,
      title: "TruthLens™ Deepfake & Duplicate Filter",
      description:
        "Forensic media scanner detects AI-generated images, metadata manipulation, and eliminates duplicate municipal complaints within 300 meters.",
      department: "TruthLens Audit Core",
      sla: "Real-time Verification",
      status: "Enforced",
    },
  ];

  const categories = ["All", "Transport", "Water", "Energy", "Sanitation", "AI Forensics"];

  const filteredServices = services.filter((s) => {
    const matchesCategory =
      activeCategory === "All" || s.category === activeCategory;
    const matchesQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="services-page">
      {/* DEVELOPER-STYLE GLASSMORPHISM NAVBAR (NO LOGOUT BUTTON) */}
      <Navbar active="services" />

      <main className="services-container">
        {/* HERO SECTION */}
        <section className="services-hero">
          <div className="services-tag-badge">
            <Activity size={14} />
            <span>MUNICIPAL CATALOG // REAL-TIME DISPATCH</span>
          </div>

          <h1>
            Civic Protection <span className="highlight-text">Capabilities</span>
          </h1>

          <p className="services-subtitle">
            Explore verified civic services. File reports with photos, 20-30s video footage,
            or speak in Tamil with Sarvam AI transcription and TruthLens forensic verification.
          </p>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="services-control-bar">
            <div className="services-search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search services, departments, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="services-category-tabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`cat-tab-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES GRID */}
        <section className="services-grid-section">
          {filteredServices.length > 0 ? (
            <div className="services-cards-grid">
              {filteredServices.map((service, index) => (
                <article className="service-dev-card" key={service.id}>
                  <div className="card-top-row">
                    <div className="service-icon-box">{service.icon}</div>
                    <span className="sla-pill">{service.sla}</span>
                  </div>

                  <span className="service-dept-tag">{service.department}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>

                  <div className="service-card-footer">
                    <span className="status-indicator">
                      <span className="dot"></span> {service.status}
                    </span>

                    <button
                      type="button"
                      className="service-action-cta"
                      onClick={() => handleStartComplain(service.title)}
                    >
                      <span>Report Issue</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-search-state">
              <p>No services match your search query: "{searchQuery}"</p>
              <button
                type="button"
                className="clear-filter-btn"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="services-action-banner">
          <div className="banner-content">
            <span className="banner-tag">INSTANT CITIZEN ACTION</span>
            <h2>Notice an urgent hazard in your neighborhood?</h2>
            <p>
              Submit geo-tagged photographic evidence, 20-30s video recordings, or speak your complaint
              in Tamil or English. Every record is stored in MongoDB Atlas with TruthLens forensic verification.
            </p>
          </div>

          <div className="banner-actions">
            <button
              type="button"
              className="banner-primary-btn"
              onClick={() => handleStartComplain()}
            >
              <FileText size={18} />
              <span>Report Civic Issue Now</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="banner-secondary-btn"
              onClick={() => navigate("/track-complaints")}
            >
              <span>Track Existing Issues</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
