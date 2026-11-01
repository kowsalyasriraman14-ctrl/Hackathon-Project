import React from "react";
import { Check, X, Globe } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import "./LanguageModal.css";

export default function LanguageModal({ isOpen, onClose }) {
  const { lang, setLang } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="lang-modal-overlay" onClick={onClose}>
      <div className="lang-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="lang-modal-header">
          <div className="lang-header-title">
            <Globe size={20} color="#38bdf8" />
            <div>
              <h3>மொழியைத் தேர்ந்தெடுக்கவும்</h3>
              <p>Choose your preferred language</p>
            </div>
          </div>
          <button className="lang-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="lang-options-list">
          {/* Tamil Option */}
          <div
            className={`lang-option-card ${lang === "ta" ? "selected" : ""}`}
            onClick={() => setLang("ta")}
          >
            <div className="lang-option-icon">
              <span>த</span>
            </div>
            <div className="lang-option-info">
              <strong>தமிழ்</strong>
              <small>Tamil</small>
            </div>
            <div className="lang-radio-check">
              {lang === "ta" && <Check size={16} strokeWidth={3} />}
            </div>
          </div>

          {/* English Option */}
          <div
            className={`lang-option-card ${lang === "en" ? "selected" : ""}`}
            onClick={() => setLang("en")}
          >
            <div className="lang-option-icon">
              <span>En</span>
            </div>
            <div className="lang-option-info">
              <strong>English</strong>
              <small>English</small>
            </div>
            <div className="lang-radio-check">
              {lang === "en" && <Check size={16} strokeWidth={3} />}
            </div>
          </div>
        </div>

        {/* Tamil Nadu cultural footer */}
        <div className="lang-modal-cultural-banner">
          <img
            src="/images/tamil-nadu-hero.jpg"
            alt="Tamil Nadu Landmarks"
            className="cultural-thumb"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span>Tamil Nadu in Every Pixel</span>
        </div>

        <button className="lang-continue-btn" onClick={onClose}>
          {lang === "ta" ? "தொடரவும்" : "Continue"}
        </button>
      </div>
    </div>
  );
}

