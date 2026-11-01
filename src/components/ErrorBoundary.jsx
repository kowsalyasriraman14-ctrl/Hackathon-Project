import React from "react";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CivicShield Sentinel caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#040914",
            color: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "520px",
              width: "100%",
              background: "rgba(8, 18, 32, 0.9)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "16px",
              padding: "36px 28px",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                color: "#f87171",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 18px",
              }}
            >
              <ShieldAlert size={28} />
            </div>

            <h2 style={{ fontSize: "20px", margin: "0 0 10px", color: "#ffffff" }}>
              CivicShield System Notice
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5", margin: "0 0 24px" }}>
              A temporary interface exception occurred while rendering this view. Your session and database data remain safe.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "12px",
                  color: "#fca5a5",
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: "left",
                  marginBottom: "20px",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  background: "#0284c7",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={15} />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#cbd5e1",
                  fontSize: "13.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <Home size={15} />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

