import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Crown,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  KeyRound,
  LayoutDashboard,
  Home,
} from "lucide-react";
import { registerSuperAdmin } from "../../api";
import "./SuperAdminAuth.css";

export default function SuperAdminSignup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [securityCode, setSecurityCode] = useState("SUPERADMIN_APEX_2026");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage("Please complete all required executive credentials.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Executive password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    try {
      setLoading(true);
      await registerSuperAdmin({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        securityCode: securityCode.trim(),
        password,
      });

      setSuccessMessage("Super Admin account successfully provisioned! Launching Apex OS...");
      setTimeout(() => {
        navigate("/superadmin/dashboard");
      }, 800);
    } catch (err) {
      setErrorMessage(err.message || "Failed to register Super Admin account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-auth-page">
      <div className="superadmin-glow-orb orb-red" />
      <div className="superadmin-glow-orb orb-gold" />

      {/* TOP BAR */}
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
      <div className="superadmin-card-wrapper wide">
        <div className="superadmin-auth-card">
          <div className="superadmin-card-header">
            <div className="superadmin-crown-badge">
              <Crown size={32} />
            </div>
            <div className="superadmin-security-pill">
              <Terminal size={12} /> APEX EXECUTIVE COMMISSIONING
            </div>
            <h1>Provision Super Admin Account</h1>
            <p>
              Register an official state-level executive overseer account to supervise municipal department admins, review status updates, and enforce resolution directives across Tamil Nadu.
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

          <form onSubmit={handleRegister} className="superadmin-form">
            <div className="superadmin-form-row">
              <div className="superadmin-field-group">
                <label htmlFor="sup-name">Chief Executive Officer Name</label>
                <div className="superadmin-input-wrap">
                  <input
                    id="sup-name"
                    type="text"
                    className="superadmin-input"
                    placeholder="e.g. Dr. K. Radhakrishnan, IAS"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                  <User size={16} className="superadmin-field-icon" />
                </div>
              </div>

              <div className="superadmin-field-group">
                <label htmlFor="sup-email">Official Executive Email</label>
                <div className="superadmin-input-wrap">
                  <input
                    id="sup-email"
                    type="email"
                    className="superadmin-input"
                    placeholder="officer@civicshield.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={16} className="superadmin-field-icon" />
                </div>
              </div>
            </div>

            <div className="superadmin-form-row">
              <div className="superadmin-field-group">
                <label htmlFor="sup-phone">Executive Contact Number</label>
                <div className="superadmin-input-wrap">
                  <input
                    id="sup-phone"
                    type="tel"
                    className="superadmin-input"
                    placeholder="+91 94440 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone size={16} className="superadmin-field-icon" />
                </div>
              </div>

              <div className="superadmin-field-group">
                <label htmlFor="sup-code">Apex Security Authorization Code</label>
                <div className="superadmin-input-wrap">
                  <input
                    id="sup-code"
                    type="text"
                    className="superadmin-input"
                    placeholder="SUPERADMIN_APEX_2026"
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    required
                  />
                  <KeyRound size={16} className="superadmin-field-icon" />
                </div>
              </div>
            </div>

            <div className="superadmin-form-row">
              <div className="superadmin-field-group">
                <label htmlFor="sup-password">Apex Password (min. 8 characters)</label>
                <div className="superadmin-input-wrap">
                  <input
                    id="sup-password"
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

              <div className="superadmin-field-group">
                <label htmlFor="sup-confirm-password">Confirm Password</label>
                <div className="superadmin-input-wrap">
                  <input
                    id="sup-confirm-password"
                    type="password"
                    className="superadmin-input"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Lock size={16} className="superadmin-field-icon" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="superadmin-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Provisioning Apex Super Admin Account...</span>
              ) : (
                <>
                  <span>Commission Super Admin Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="superadmin-card-footer">
            <div className="superadmin-footer-sublinks">
              <span>Already commissioned?</span>
              <Link to="/superadmin/login">Sign in to Super Admin</Link>
            </div>
            <div className="superadmin-footer-cross-links">
              <Link to="/admin/login">
                <ShieldCheck size={13} /> Department Admin Portal
              </Link>
              <Link to="/dashboard">
                <LayoutDashboard size={13} /> Citizen Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="superadmin-auth-security-notice">
          <Terminal size={12} /> Apex Executive Oversight // State-level Municipal Protocol
        </div>
      </div>
    </div>
  );
}

