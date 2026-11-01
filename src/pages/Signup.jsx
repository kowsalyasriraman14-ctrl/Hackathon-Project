import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  LogIn,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { registerUser } from "../api";
import "./signup.css";

function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect");
  const categoryParam = searchParams.get("category");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim().toLowerCase();
    const phone = formData.get("phone").trim();
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const result = await registerUser({ name, email, phone, password });

      setSuccessMessage("Account created & saved in MongoDB! Logging you in...");

      setTimeout(() => {
        if (redirectTarget) {
          if (redirectTarget === "report-issue" || redirectTarget.startsWith("report-issue")) {
            navigate(
              categoryParam
                ? `/report-issue?category=${encodeURIComponent(categoryParam)}`
                : (redirectTarget.startsWith("/") ? redirectTarget : `/${redirectTarget}`)
            );
          } else if (redirectTarget.startsWith("/")) {
            navigate(redirectTarget);
          } else {
            navigate(`/${redirectTarget}`);
          }
        } else {
          navigate("/dashboard");
        }
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-background-circle circle-one"></div>
      <div className="auth-background-circle circle-two"></div>

      <nav className="auth-navbar">
        <Link to="/" className="auth-logo">
          <ShieldCheck size={30} />
          <span>CivicShield AI</span>
        </Link>

        <div className="auth-nav-actions">
          <Link
            to={
              redirectTarget
                ? `/login?redirect=${redirectTarget}${categoryParam ? `&category=${categoryParam}` : ""}`
                : "/login"
            }
            className="auth-home-btn"
          >
            Login
          </Link>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-card signup-card">
          <div className="auth-icon">
            <ShieldCheck size={32} />
          </div>

          <h1>Create Account</h1>

          {redirectTarget === "report-issue" ? (
            <div className="auth-complaint-notice">
              <AlertCircle size={18} />
              <span>
                Please register to submit your civic issue. Your verified citizen data will be stored securely.
              </span>
            </div>
          ) : (
            <p className="auth-subtitle">
              Join CivicShield AI to report issues, track resolutions, and protect your city.
            </p>
          )}

          {errorMessage && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-success-banner">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div className="auth-input-group">
              <label>Full Name</label>
              <div className="auth-input">
                <User size={18} />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Email Address</label>
              <div className="auth-input">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Phone Number</label>
              <div className="auth-input">
                <Phone size={18} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div className="auth-input">
                <Lock size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Confirm Password</label>
              <div className="auth-input">
                <Lock size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Saving to MongoDB..." : "Sign Up & Continue"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link
              to={
                redirectTarget
                  ? `/login?redirect=${redirectTarget}${categoryParam ? `&category=${categoryParam}` : ""}`
                  : "/login"
              }
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
