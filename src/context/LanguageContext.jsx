import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

const dictionary = {
  en: {
    nav_home: "Home",
    nav_services: "Services",
    nav_how_it_works: "How It Works",
    nav_track: "Track Complaint",
    nav_dashboard: "Citizen Dashboard",
    nav_raise_complaint: "Raise Complaint",
    nav_login: "Login",
    nav_signup: "Sign Up",
    nav_my_profile: "My Profile",
    nav_logout: "Sign Out",
    nav_nearby: "Nearby Issues",
    nav_updates: "Government Updates"
  },
  ta: {
    nav_home: "முகப்பு",
    nav_services: "சேவைகள்",
    nav_how_it_works: "செயல்முறை",
    nav_track: "புகார் கண்காணிப்பு",
    nav_dashboard: "மக்கள் தகவல் பலகை",
    nav_raise_complaint: "புகார் பதிவு செய்க",
    nav_login: "உள்நுழைவு",
    nav_signup: "பதிவு செய்க",
    nav_my_profile: "என் சுயவிவரம்",
    nav_logout: "வெளியேறு",
    nav_nearby: "அருகிலுள்ள புகார்கள்",
    nav_updates: "அரசு அறிவிப்புகள்"
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("civicshield_lang") || "en";
  });

  useEffect(() => {
    localStorage.setItem("civicshield_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => {
    return (dictionary[lang] && dictionary[lang][key]) || dictionary.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      lang: "en",
      setLang: () => {},
      t: (key) => dictionary.en[key] || key
    };
  }
  return context;
}

