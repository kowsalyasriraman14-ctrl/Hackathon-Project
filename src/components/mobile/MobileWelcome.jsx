import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import LanguageModal from "./LanguageModal";
import "./MobileWelcome.css";

export default function MobileWelcome({ onEnterApp }) {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [langModalOpen, setLangModalOpen] = useState(false);

  const isTamil = lang === "ta";

  const handleGetStarted = () => {
    if (onEnterApp) {
      onEnterApp();
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="mobile-welcome-screen">
      <div className="welcome-bg-glow"></div>

      {/* Cultural Temple Silhouette Backdrop */}
      <div className="welcome-temple-backdrop">
        <div className="temple-silhouette"></div>
      </div>

      <div className="welcome-content">
        {/* Brand Shield Icon */}
        <div className="welcome-logo-wrap">
          <div className="welcome-logo-halo"></div>
          <img
            src="/images/logo.png"
            alt="CivicShield AI"
            className="welcome-logo-img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <ShieldCheck size={48} className="welcome-shield-fallback" color="#38bdf8" />
        </div>

        {/* Brand Titles */}
        <h1 className="welcome-brand-title">CivicShield AI</h1>
        <p className="welcome-tagline">
          Smarter Communities
          <br />
          Transparent Governance
        </p>

        {/* Tamil Cultural Motto from Reference */}
        <div className="welcome-motto-pill">
          <span>நம் ஊர்... நம் பொறுப்பு...</span>
        </div>

        {/* Language Switcher Pills */}
        <div className="welcome-lang-selector">
          <button
            type="button"
            className={`welcome-lang-btn ${isTamil ? "active" : ""}`}
            onClick={() => setLang("ta")}
          >
            தமிழ்
          </button>
          <button
            type="button"
            className={`welcome-lang-btn ${!isTamil ? "active" : ""}`}
            onClick={() => setLang("en")}
          >
            English
          </button>
        </div>

        {/* Primary CTA: Get Started */}
        <button
          type="button"
          className="welcome-get-started-btn"
          onClick={handleGetStarted}
        >
          <span>{isTamil ? "தொடங்குங்கள்" : "Get Started"}</span>
          <ArrowRight size={18} />
        </button>

        {/* Login Link */}
        <button
          type="button"
          className="welcome-login-link"
          onClick={() => navigate("/login")}
        >
          {isTamil ? "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைய" : "Already have an account? Login"}
        </button>
      </div>

      <LanguageModal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
      />
    </div>
  );
}

