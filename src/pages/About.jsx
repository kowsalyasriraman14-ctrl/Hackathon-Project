import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Home,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Cpu,
  Database,
  Lock,
  Layers,
  Activity,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { isAuthenticated } from "../api";
import Navbar from "../components/Navbar";
import "./about.css";

export default function About() {
  const navigate = useNavigate();

  const handleStartComplaint = () => {
    if (!isAuthenticated()) {
      navigate("/signup?redirect=report-issue");
    } else {
      navigate("/report-issue");
    }
  };

  return (
    <div className="about-page">
      {/* DEVELOPER-STYLE GLASSMORPHISM NAVBAR (NO LOGOUT BUTTON) */}
      <Navbar active="about" />

      <main className="about-container">
        {/* HERO SECTION */}
        <section className="about-hero">
          <div className="about-hero-badge">
            <Cpu size={14} />
            <span>ARCHITECTURE // CIVIC DEFENSE PROTOCOL</span>
          </div>

          <h1>
            Engineered for <span className="highlight-text">Truth</span> & Civic Action
          </h1>

          <p className="about-subtitle">
            CivicShield AI combines cutting-edge Indic voice intelligence, forensic media
            verification, and transparent public ledgering to bridge citizens and municipal authorities.
          </p>

          <div className="about-cta-row">
            <button
              type="button"
              className="about-primary-btn"
              onClick={handleStartComplaint}
            >
              <FileText size={17} />
              <span>Raise Verified Complaint</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="about-secondary-btn"
              onClick={() => navigate("/dashboard")}
            >
              <span>Explore Citizen Dashboard</span>
            </button>
          </div>
        </section>

        {/* CORE ARCHITECTURE PILLARS */}
        <section className="about-grid-section">
          <div className="section-title-wrap">
            <span className="mono-tag">01 // PLATFORM SUBSYSTEMS</span>
            <h2>Core Technological Pillars</h2>
          </div>

          <div className="architecture-grid">
            <article className="tech-card">
              <div className="tech-icon-wrap cyan">
                <Cpu size={24} />
              </div>
              <span className="tech-badge">SPEECH ENGINE</span>
              <h3>Sarvam AI (`saaras:v2`)</h3>
              <p>
                Native Indic voice model supporting Tamil and English spoken input. Performs
                automatic speech-to-text transcription, translation, and semantic municipal
                department categorization.
              </p>
              <div className="tech-meta">
                <span>Latency: &lt; 280ms</span>
                <span>Accuracy: 98.4%</span>
              </div>
            </article>

            <article className="tech-card">
              <div className="tech-icon-wrap emerald">
                <ShieldCheck size={24} />
              </div>
              <span className="tech-badge">INTEGRITY ENGINE</span>
              <h3>TruthLens™ Media Forensics</h3>
              <p>
                Optical sensor verification and deepfake artifact detection. Automatically inspects
                photo and 20-30s video metadata, GPS consistency, and clusters duplicate municipal
                complaints within 300 meters.
              </p>
              <div className="tech-meta">
                <span>Anti-Tamper: Active</span>
                <span>Spatial Check: 300m</span>
              </div>
            </article>

            <article className="tech-card">
              <div className="tech-icon-wrap blue">
                <Database size={24} />
              </div>
              <span className="tech-badge">DATA PERSISTENCE</span>
              <h3>MongoDB Atlas Cloud Store</h3>
              <p>
                Geospatial indexing with coordinates, multimedia evidence URLs, Sarvam transcriptions,
                and immutable resolution timelines with local resilient fallback storage.
              </p>
              <div className="tech-meta">
                <span>Storage: Cloud Atlas</span>
                <span>Uptime: 99.98%</span>
              </div>
            </article>

            <article className="tech-card">
              <div className="tech-icon-wrap purple">
                <Layers size={24} />
              </div>
              <span className="tech-badge">ROUTING ENGINE</span>
              <h3>Autonomous Department Dispatch</h3>
              <p>
                Automated triage and dispatch routing to TWAD (Water), TANGEDCO (Electricity),
                Highways & Transport, and Municipal Corporations for rapid resolution.
              </p>
              <div className="tech-meta">
                <span>Triage: Automated</span>
                <span>Dispatch: Real-time</span>
              </div>
            </article>
          </div>
        </section>

        {/* STATS TICKER */}
        <section className="about-stats-ticker">
          <div className="stat-ticker-cell">
            <strong className="stat-num">10+</strong>
            <span className="stat-lbl">Municipal Sectors</span>
          </div>
          <div className="stat-ticker-cell">
            <strong className="stat-num">&lt; 30s</strong>
            <span className="stat-lbl">Video Evidence Capture</span>
          </div>
          <div className="stat-ticker-cell">
            <strong className="stat-num">100%</strong>
            <span className="stat-lbl">TruthLens Audited</span>
          </div>
          <div className="stat-ticker-cell">
            <strong className="stat-num">Tamil + EN</strong>
            <span className="stat-lbl">Sarvam Multilingual</span>
          </div>
        </section>

        {/* BOTTOM NAVIGATION ACTIONS */}
        <div className="about-bottom-actions">
          <button
            type="button"
            className="about-back-btn"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={16} />
            <span>Return to Home</span>
          </button>

          <button
            type="button"
            className="about-primary-btn"
            onClick={() => navigate("/services")}
          >
            <span>Browse All Services</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}
