import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  ArrowLeft,
  LayoutDashboard,
  Home,
  Crown,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { loginSuperAdmin } from "../../api";
import "./SuperAdminAuth.css";

export default function SuperAdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("superadmin@civicshield.gov.in");
  const [password, setPassword] = useState("SuperAdmin@2026");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both Super Admin email and executive password.");
      return;
    }

    try {
      setLoading(true);
      await loginSuperAdmin({ email, password });

      setSuccessMessage("Apex Credentials Verified. Initializing Super Admin Command OS...");
      setTimeout(() => {
        navigate("/superadmin/dashboard");
      }, 700);
    } catch (err) {
      setErrorMessage(
        err.message || "Super Admin authentication failed. Invalid credentials or insufficient permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("superadmin@civicshield.gov.in");
    setPassword("SuperAdmin@2026");
    setErrorMessage("");
  };

  return (
    <div className="superadmin-auth-page">
      <div className="superadmin-glow-orb orb-red" />
      <div className="superadmin-glow-orb orb-gold" />

      {/* TOP NAVIGATION */}
      <header className="superadmin-auth-nav">
        <Link to="/" className="superadmin-brand-link">
          <div className="superadmin-brand-logo">
            <Crown size={22} />
          </div>
          <div>
            <div className="superadmin-brand-title">CIVICSHIELD AI</div>
            <div className="superadmin-brand-sub">APEX SUPER ADMIN OVERSIGHT</div>
          </div>
        </Link>

        <div className="superadmin-nav-actions">
          <Link to="/admin/login" className="superadmin-nav-btn secondary" title="Open Officer Admin Portal">
            <ShieldCheck size={14} />
            <span>Admin Portal</span>
          </Link>
          <Link to="/dashboard" className="superadmin-nav-btn highlight" title="Open Citizen Dashboard">
            <LayoutDashboard size={14} />
            <span>Citizen Dashboard</span>
          </Link>
          <Link to="/" className="superadmin-nav-btn" title="Return to Public Portal">
            <Home size={14} />
            <span>Public Home</span>
          </Link>
        </div>
      </header>

      {/* AUTH CARD */}
      <div className="superadmin-card-wrapper">
        <div className="superadmin-auth-card">
          <div className="superadmin-card-header">
            <div className="superadmin-crown-badge">
              <Crown size={32} />
            </div>
            <div className="superadmin-security-pill">
              <Terminal size={12} /> LEVEL-1 STATE APEX EXECUTIVE CLEARANCE
            </div>
            <h1>Super Admin Authentication</h1>
            <p>
              Executive portal to oversee all municipal complaints, monitor Department Admin performance, inspect live status updates, and enforce state-level directives.
            </p>
          </div>

          {errorMessage && (
            <div className="superadmin-alert-banner error">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="superadmin-alert-banner success">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Pre-fill helper */}
          <div className="superadmin-demo-box">
            <div className="demo-text">
              <Sparkles size={14} color="#fbbf24" />
              <span>Pre-seeded Super Admin credentials available</span>
            </div>
            <button
              type="button"
              className="demo-autofill-btn"
              onClick={handleFillDemo}
            >
              Fill Credentials
            </button>
          </div>

          <form onSubmit={handleLogin} className="superadmin-form">
            <div className="superadmin-field-group">
              <label htmlFor="superadmin-email">Executive Official Email</label>
              <div className="superadmin-input-wrap">
                <input
                  id="superadmin-email"
                  type="email"
                  className="superadmin-input"
                  placeholder="superadmin@civicshield.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <Mail size={16} className="superadmin-field-icon" />
              </div>
            </div>

            <div className="superadmin-field-group">
              <label htmlFor="superadmin-password">Apex Security Password</label>
              <div className="superadmin-input-wrap">
                <input
                  id="superadmin-password"
                  type="password"
                  className="superadmin-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} className="superadmin-field-icon" />
              </div>
            </div>

            <button
              type="submit"
              className="superadmin-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Validating Apex Security Clearance...</span>
              ) : (
                <>
                  <span>Sign In to Super Admin Sentinel</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="superadmin-card-footer">
            <div className="superadmin-footer-sublinks">
              <span>Need Apex Provisioning?</span>
              <Link to="/superadmin/signup">Register Super Admin</Link>
            </div>
            <div className="superadmin-footer-cross-links">
              <Link to="/admin/login">
                <ShieldCheck size={13} /> Switch to Department Admin Portal
              </Link>
              <Link to="/dashboard">
                <LayoutDashboard size={13} /> Return to Citizen Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="superadmin-auth-security-notice">
          <KeyRound size={12} /> 512-bit Sovereign Encryption // Executive Directive Enforcement
        </div>
      </div>
    </div>
  );
}

