import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { loginUser } from "../api";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect");
  const categoryParam = searchParams.get("category");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email").trim().toLowerCase();
    const password = formData.get("password");

    try {
      setLoading(true);
      await loginUser({ email, password });

      setSuccessMessage("Login successful! Redirecting...");

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
      setErrorMessage(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-background-circle circle-one"></div>
      <div className="auth-background-circle circle-two"></div>

      <nav className="auth-navbar">
        <Link to="/" className="auth-logo">
          <ShieldCheck size={30} />
          <span>CivicShield AI</span>
        </Link>

        <Link
          to={
            redirectTarget
              ? `/signup?redirect=${redirectTarget}${categoryParam ? `&category=${categoryParam}` : ""}`
              : "/signup"
          }
          className="auth-home-btn"
        >
          Sign Up
        </Link>
      </nav>

      <div className="auth-container login-container">
        <div className="auth-card login-card">
          <div className="auth-icon">
            <ShieldCheck size={32} />
          </div>

          <h1>Welcome Back</h1>

          {redirectTarget === "report-issue" ? (
            <div className="auth-complaint-notice">
              <AlertCircle size={18} />
              <span>
                Please login to authenticate your account and submit your verified civic complaint.
              </span>
            </div>
          ) : (
            <p className="auth-subtitle">
              Login to access your citizen dashboard, report issues, and view real-time resolution updates.
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

          <form onSubmit={handleLogin}>
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
              <label>Password</label>
              <div className="auth-input">
                <Lock size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login to Portal"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account yet?{" "}
            <Link
              to={
                redirectTarget
                  ? `/signup?redirect=${redirectTarget}${categoryParam ? `&category=${categoryParam}` : ""}`
                  : "/signup"
              }
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
