import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  ArrowLeft,
  KeyRound,
  LayoutDashboard,
  Home,
} from "lucide-react";
import { registerAdmin } from "../../api";
import "./AdminAuth.css";

const DEPARTMENTS = [
  "Municipal Administration",
  "Highways & Transport Dept",
  "TWAD & City Water Board",
  "TANGEDCO Electricity Board",
  "Solid Waste & Sanitation",
  "Drainage & Sewage Board",
  "Public Health Department",
  "Revenue & Public Grievance Cell",
];

export default function AdminSignup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [adminCode, setAdminCode] = useState("");
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
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    try {
      setLoading(true);
      await registerAdmin({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department,
        adminCode: adminCode.trim(),
        password,
      });

      setSuccessMessage("Administrative account provisioned! Directing to Sentinel Dashboard...");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 800);
    } catch (err) {
      setErrorMessage(err.message || "Failed to register admin account.");
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
      <div className="admin-card-wrapper wide">
        <div className="admin-auth-card">
          <div className="admin-card-header">
            <div className="admin-shield-icon">
              <ShieldCheck size={28} />
            </div>
            <div className="admin-security-pill">
              <Terminal size={12} /> OFFICIAL CREDENTIAL REGISTRATION
            </div>
            <h1>Register Department Officer</h1>
            <p>
              Provision an authorized municipal administrator account to review, inspect, and update citizen complaints in real time.
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

          <form onSubmit={handleRegister} className="admin-form">
            <div className="admin-form-row">
              <div className="admin-field-group">
                <label htmlFor="admin-name">Full Officer Name *</label>
                <div className="admin-input-wrap">
                  <input
                    id="admin-name"
                    type="text"
                    className="admin-input"
                    placeholder="Officer K. Ramanathan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                  <User size={16} className="admin-field-icon" />
                </div>
              </div>

              <div className="admin-field-group">
                <label htmlFor="admin-email">Official Government Email *</label>
                <div className="admin-input-wrap">
                  <input
                    id="admin-email"
                    type="email"
                    className="admin-input"
                    placeholder="ramanathan@civicshield.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={16} className="admin-field-icon" />
                </div>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field-group">
                <label htmlFor="admin-dept">Department Sector *</label>
                <div className="admin-input-wrap">
                  <select
                    id="admin-dept"
                    className="admin-input admin-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} style={{ background: "#0f172a" }}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <Building2 size={16} className="admin-field-icon" />
                </div>
              </div>

              <div className="admin-field-group">
                <label htmlFor="admin-phone">Official Contact Phone</label>
                <div className="admin-input-wrap">
                  <input
                    id="admin-phone"
                    type="tel"
                    className="admin-input"
                    placeholder="+91 98401 23456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone size={16} className="admin-field-icon" />
                </div>
              </div>
            </div>

            <div className="admin-field-group">
              <label htmlFor="admin-badge">Officer Badge / Authorization Code (Optional)</label>
              <div className="admin-input-wrap">
                <input
                  id="admin-badge"
                  type="text"
                  className="admin-input"
                  placeholder="e.g. SLM-CORP-482"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                />
                <KeyRound size={16} className="admin-field-icon" />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field-group">
                <label htmlFor="admin-pwd">Administrative Password *</label>
                <div className="admin-input-wrap">
                  <input
                    id="admin-pwd"
                    type="password"
                    className="admin-input"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock size={16} className="admin-field-icon" />
                </div>
              </div>

              <div className="admin-field-group">
                <label htmlFor="admin-confirm-pwd">Confirm Password *</label>
                <div className="admin-input-wrap">
                  <input
                    id="admin-confirm-pwd"
                    type="password"
                    className="admin-input"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Lock size={16} className="admin-field-icon" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="admin-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span>Registering Authorized Officer...</span>
              ) : (
                <>
                  <span>Create Admin Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="admin-card-footer">
            <span>Already have an authorized admin account?</span>
            <Link to="/admin/login">Sign In Here</Link>
          </div>
        </div>

        <div className="admin-auth-security-notice">
          <Terminal size={12} /> CivicShield Sentinel OS v2.0 // RBAC Level 1 Authorization
        </div>
      </div>
    </div>
  );
}

