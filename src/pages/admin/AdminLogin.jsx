import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { loginAdmin } from "../../api";
import "./AdminAuth.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both administrative email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginAdmin({ email, password });

      setSuccessMessage("Authentication verified. Loading CivicShield Admin Sentinel OS...");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 700);
    } catch (err) {
      setErrorMessage(
        err.message || "Administrative authentication failed. Please verify credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-glow-one" />
      <div className="admin-auth-glow-two" />

      {/* TOP BAR */}
      <header className="admin-auth-nav">
        <Link to="/" className="admin-brand-link">
          <div className="admin-brand-logo">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="admin-brand-title">CIVICSHIELD AI</div>
            <div className="admin-brand-sub">ADMIN SENTINEL OS</div>
          </div>
        </Link>

        <div className="admin-nav-actions-group">
          <Link to="/dashboard" className="admin-exit-btn highlight" title="Open Citizen Dashboard">
            <LayoutDashboard size={14} />
            <span>Citizen Dashboard</span>
          </Link>
          <Link to="/" className="admin-exit-btn" title="Return to Public Portal">
            <Home size={14} />
            <span>Public Home</span>
          </Link>
        </div>
      </header>

      {/* AUTH CARD */}
      <div className="admin-card-wrapper">
        <div className="admin-auth-card">
          <div className="admin-card-header">
            <div className="admin-shield-icon">
              <ShieldAlert size={28} />
            </div>
            <div className="admin-security-pill">
              <Terminal size={12} /> RESTRICTED MUNICIPAL ACCESS
            </div>
            <h1>Admin Authentication</h1>
            <p>
              Sign in to monitor real-time citizen grievances, inspect forensic evidence, and dispatch municipal resolutions.
            </p>
          </div>

          {errorMessage && (
            <div className="admin-alert-banner error">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="admin-alert-banner success">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="admin-form">
            <div className="admin-field-group">
              <label htmlFor="admin-email">Official Department Email</label>
              <div className="admin-input-wrap">
                <input
                  id="admin-email"
                  type="email"
                  className="admin-input"
                  placeholder="officer@civicshield.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <Mail size={16} className="admin-field-icon" />
              </div>
            </div>

            <div className="admin-field-group">
              <label htmlFor="admin-password">Administrative Password</label>
              <div className="admin-input-wrap">
                <input
                  id="admin-password"
                  type="password"
                  className="admin-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} className="admin-field-icon" />
              </div>
            </div>

            <button
              type="submit"
              className="admin-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Verifying Access Rights...</span>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="admin-card-footer">
            <div className="admin-footer-sublinks">
              <span>New Department Officer?</span>
              <Link to="/admin/signup">Register Admin Account</Link>
            </div>
            <div className="admin-footer-citizen-link">
              <Link to="/dashboard">
                <LayoutDashboard size={13} /> Return to Citizen Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="admin-auth-security-notice">
          <Lock size={12} /> 256-bit Encrypted Session // Role-Based Access Control
        </div>
      </div>
    </div>
  );
}

