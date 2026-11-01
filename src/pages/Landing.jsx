import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { isAuthenticated, getCurrentUser, performLogout, fetchStatsOverview } from "../api";
import { useLanguage } from "../context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  Droplets,
  Zap,
  Trash2,
  Bus,
  Mic,
  Users,
  CheckCircle2,
  Globe2,
  Building2,
  Activity,
  BrainCircuit,
  Camera,
  FileCheck,
  Clock3,
  Landmark,
  Sprout,
  GraduationCap,
  HeartHandshake,
  Volume2,
  FilePlus2,
  FileSearch,
  Compass,
  LayoutDashboard,
  Crown,
  ShieldAlert,
} from "lucide-react";

import "../index.css";

// HERO GALLERY IMAGES
const heroSlides = [
  {
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/65/91/5a/chennai-central-railway.jpg?w=1200&h=-1&s=1",
    tag: "SMART TRANSPORT",
    title: "Building better roads and public transport",
    tamilTitle: "சிறந்த சாலைகள் மற்றும் போக்குவரத்தை உருவாக்குவோம்"
  },
  {
    image: "https://static.toiimg.com/thumb/msid-88887312,width-400,height-225,resizemode-72/88887312.jpg",
    tag: "CITIZEN POWER",
    title: "Every citizen deserves to be heard",
    tamilTitle: "ஒவ்வொரு குடிமகனின் குரலும் மதிக்கப்பட வேண்டும்"
  },
  {
    image: "https://media.licdn.com/dms/image/v2/C4E1BAQHG7fC8HgXr-Q/company-background_1536_768/company-background_1536_768/0/1521243977095?e=2147483647&v=beta&t=fyGu5czPGXCwR3sP96D41wg944L_ZQJai-1_THlOuoo",
    tag: "TRANSPARENT GOVERNANCE",
    title: "From public complaints to real action",
    tamilTitle: "பொது புகார்களிலிருந்து உண்மையான நடவடிக்கைக்கு"
  }
];

// COMMUNITY IMAGES
const communityImages = [
  {
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhf8IkVztRiyKGHknayX-6PcUdKByWJWP3FMXdOTYB5w&s=10",
    icon: Sprout
  },
  {
    image: "https://blog.ipleaders.in/wp-content/uploads/2020/03/Casual-young-people-1_.jpg",
    icon: Users
  },
  {
    image: "https://static.toiimg.com/thumb/msid-112244830,width-1280,height-720,imgsize-72526,resizemode-4,overlay-toi_sw,pt-32,y_pad-600/photo.jpg",
    icon: GraduationCap
  },
  {
    image: "https://media.licdn.com/dms/image/v2/C4E1BAQHG7fC8HgXr-Q/company-background_1536_768/company-background_1536_768/0/1521243977095?e=2147483647&v=beta&t=fyGu5czPGXCwR3sP96D41wg944L_ZQJai-1_THlOuoo",
    icon: Landmark
  }
];

// COMPLAINT CATEGORIES - UPDATED TO 10 SECTORS
const categories = [
  { icon: Bus, color: "#269CEB", value: "roads" },
  { icon: Droplets, color: "#268BEA", value: "water" },
  { icon: Zap, color: "#F1A51D", value: "electricity" },
  { icon: Trash2, color: "#13A987", value: "garbage" },
  { icon: Droplets, color: "#268BEA", value: "drainage" },
  { icon: Building2, color: "#8A75D8", value: "public-toilets" },
  { icon: Landmark, color: "#8A75D8", value: "public-places" },
  { icon: Building2, color: "#D97706", value: "ration-shops" },
  { icon: HeartHandshake, color: "#E15B78", value: "public-health" },
  { icon: Building2, color: "#64748B", value: "municipal-services" }
];

// HOW IT WORKS
const steps = [
  { number: "01", icon: Camera },
  { number: "02", icon: BrainCircuit },
  { number: "03", icon: Building2 },
  { number: "04", icon: FileCheck }
];

// ENGLISH AND TAMIL TRANSLATIONS
const translations = {
  en: {
    nav: ["Home", "About", "Services", "Community", "Dashboard"],
    tagline: ["OUR CITY,", "OUR RESPONSIBILITY"],
    heroTag: "SMART GOVERNANCE FOR TAMIL NADU",
    heroEyebrow: "TRANSPARENT GOVERNANCE",
    heroTitle: "Your City. Your Voice.",
    heroHighlight: "Our Intelligence.",
    heroText: "Connect citizens, departments and authorities through one intelligent platform.",
    report: "Report an Issue",
    explore: "Explore Platform",
    heroPoints: [
      "Citizen Empowerment",
      "Smart Technology",
      "Transparent Governance"
    ],
    galleryTag: "DISCOVER OUR COMMUNITIES",
    galleryTitle: "One platform. Many voices.",
    stats: [
      "Total Complaints",
      "Resolved",
      "In Progress",
      "Pending"
    ],
    aboutTag: "ABOUT CIVICSHIELD AI",
    aboutTitle: "A digital bridge between citizens and government.",
    aboutText: "CivicShield AI is designed to make public complaint management more accessible, transparent and accountable. Citizens can report local issues while authorities can organize, monitor and manage the response process.",
    communityTag: "ONE PLATFORM. EVERY COMMUNITY.",
    communityTitle: "Built for the people of Tamil Nadu",
    communityText: "Every voice matters — from villages to growing cities.",
    people: [
      ["For Farmers", "Report damaged village roads, irrigation problems and water supply issues."],
      ["For Citizens", "Raise concerns about sanitation, electricity, roads and essential public services."],
      ["For Students", "Help create safer, cleaner and more accessible communities."],
      ["For Government", "Review complaints, assign departments and monitor resolution progress."]
    ],
    servicesTag: "CITIZEN SERVICES",
    servicesTitle: "What can you report?",
    servicesText: "Choose an issue category and make your voice count.",
    categories: [
      "Roads",
      "Water Supply",
      "Electricity",
      "Garbage Management",
      "Drainage",
      "Public Toilets",
      "Public Places",
      "Ration Shops",
      "Public Health",
      "Municipal Services"
    ],
    voiceTitle: "Your voice matters!",
    voiceText: "Submit your complaint using Tamil or English voice and text.",
    start: "Start Reporting",
    aiTag: "INTELLIGENT COMPLAINT MANAGEMENT",
    aiTitle: "Technology that turns complaints into action.",
    aiText: "AI-assisted tools can help classify complaints, identify duplicate reports, flag suspicious submissions and highlight recurring public issues.",
    aiFeatures: [
      ["Duplicate Detection", "Find similar reports using text, images and location."],
      ["Spam Identification", "Flag suspicious complaints for authority review."],
      ["Recurring Issue Insights", "Highlight repeated problems in the same area."],
      ["Transparent Tracking", "Keep citizens informed about complaint progress."]
    ],
    howTag: "SIMPLE AND TRANSPARENT",
    howTitle: "How CivicShield AI works",
    howText: "One connected journey from reporting to resolution.",
    steps: [
      ["Report", "Submit a complaint using text, voice or images."],
      ["Analyze", "AI helps classify complaints and identify similar reports."],
      ["Assign", "Route the complaint to the responsible department."],
      ["Resolve", "Track updates and verify the resolution."]
    ],
    governmentTag: "GOVERNMENT AUTHORITY PORTAL",
    governmentTitle: "Better coordination. Clearer accountability.",
    governmentText: "Officials can review complaints, assign departments, monitor pending cases and record resolution updates.",
    governmentButton: "Government Portal",
    impactTag: "OUR SHARED RESPONSIBILITY",
    impactTitle: "Let's build a smarter, safer Tamil Nadu together.",
    impactText: "Your voice can help create meaningful change in your community.",
    impactButton: "Report a Public Issue",
    footerText: "Smart Communities | Transparent Governance",
    footerLine: "Our city... Our responsibility...",
    footerCopyright: "© 2026 CivicShield AI — Concept Demonstration"
  },

  ta: {
    nav: ["முகப்பு", "எங்களைப் பற்றி", "சேவைகள்", "சமூகம்", "டாஷ்போர்டு"],
    tagline: ["நம் ஊர்,", "நம் பொறுப்பு"],
    heroTag: "தமிழ்நாட்டிற்கான சிறந்த நிர்வாகம்",
    heroEyebrow: "வெளிப்படையான நிர்வாகம்",
    heroTitle: "உங்கள் நகரம். உங்கள் குரல்.",
    heroHighlight: "எங்கள் தொழில்நுட்பம்.",
    heroText: "மக்கள், அரசுத் துறைகள் மற்றும் அதிகாரிகளை ஒரே தளத்தில் இணைப்போம்.",
    report: "புகார் அளிக்கவும்",
    explore: "தளத்தைப் பார்க்க",
    heroPoints: [
      "குடிமக்கள் அதிகாரம்",
      "சிறந்த தொழில்நுட்பம்",
      "வெளிப்படையான நிர்வாகம்"
    ],
    galleryTag: "நமது சமூகங்களை அறிந்துகொள்ளுங்கள்",
    galleryTitle: "ஒரே தளம். பல குரல்கள்.",
    stats: [
      "மொத்த புகார்கள்",
      "தீர்க்கப்பட்டவை",
      "நடைபெறுபவை",
      "நிலுவையில் உள்ளவை"
    ],
    aboutTag: "சிவிக்‌ஷீல்டு AI பற்றி",
    aboutTitle: "மக்களையும் அரசையும் இணைக்கும் டிஜிட்டல் பாலம்.",
    aboutText: "சிவிக்‌ஷீல்டு AI பொது புகார் மேலாண்மையை எளிமையாகவும் வெளிப்படையாகவும் மாற்றுகிறது. மக்கள் தங்கள் பகுதி பிரச்சினைகளைப் பதிவு செய்யலாம். அதிகாரிகள் அவற்றைக் கண்காணித்து உரிய நடவடிக்கை எடுக்கலாம்.",
    communityTag: "ஒரே தளம். அனைத்து மக்களுக்கும்.",
    communityTitle: "தமிழ்நாட்டு மக்களுக்காக உருவாக்கப்பட்டது",
    communityText: "கிராமங்கள் முதல் வளர்ந்து வரும் நகரங்கள் வரை ஒவ்வொரு குரலும் முக்கியம்.",
    people: [
      ["விவசாயிகளுக்காக", "கிராமச் சாலைகள், பாசனம் மற்றும் குடிநீர் பிரச்சினைகளைப் புகாரளிக்கலாம்."],
      ["பொதுமக்களுக்காக", "சுகாதாரம், மின்சாரம், சாலைகள் மற்றும் பொது சேவைகள் குறித்த புகார்களைப் பதிவு செய்யலாம்."],
      ["மாணவர்களுக்காக", "பாதுகாப்பான, சுத்தமான மற்றும் அனைவரும் அணுகக்கூடிய சமூகத்தை உருவாக்க உதவுங்கள்."],
      ["அரசு அதிகாரிகளுக்காக", "புகார்களை ஆய்வு செய்து, துறைகளுக்கு ஒதுக்கி, தீர்வு நிலையை கண்காணிக்கலாம்."]
    ],
    servicesTag: "மக்களுக்கான சேவைகள்",
    servicesTitle: "எந்தப் பிரச்சினையைப் புகாரளிக்க விரும்புகிறீர்கள்?",
    servicesText: "பிரச்சினையின் வகையைத் தேர்ந்தெடுத்து உங்கள் குரலைப் பதிவு செய்யுங்கள்.",
    categories: [
      "சாலைகள்",
      "குடிநீர் விநியோகம்",
      "மின்சாரம்",
      "குப்பை மேலாண்மை",
      "வடிகால் வசதி",
      "பொது கழிப்பறைகள்",
      "பொது இடங்கள்",
      "நியாய விலைக் கடைகள்",
      "பொது சுகாதாரம்",
      "நகராட்சி சேவைகள்"
    ],
    voiceTitle: "உங்கள் குரல் முக்கியம்!",
    voiceText: "தமிழ் அல்லது ஆங்கிலத்தில் குரல் அல்லது எழுத்து மூலம் புகார் அளிக்கலாம்.",
    start: "புகார் அளிக்கத் தொடங்குங்கள்",
    aiTag: "அறிவார்ந்த புகார் மேலாண்மை",
    aiTitle: "புகார்களைச் செயல்பாடுகளாக மாற்றும் தொழில்நுட்பம்.",
    aiText: "AI தொழில்நுட்பம் புகார்களை வகைப்படுத்தவும், ஒரே மாதிரியான புகார்களைக் கண்டறியவும், சந்தேகத்திற்குரிய புகார்களைக் குறிக்கவும், மீண்டும் ஏற்படும் பிரச்சினைகளை அடையாளம் காணவும் உதவும்.",
    aiFeatures: [
      ["நகல் புகார் கண்டறிதல்", "எழுத்து, படம் மற்றும் இடத்தின் அடிப்படையில் ஒத்த புகார்களைக் கண்டறியும்."],
      ["போலி புகார் அடையாளம்", "சந்தேகத்திற்குரிய புகார்களை அதிகாரிகளின் ஆய்வுக்காகக் குறிக்கும்."],
      ["மீண்டும் ஏற்படும் பிரச்சினைகள்", "ஒரே பகுதியில் மீண்டும் ஏற்படும் பிரச்சினைகளை அடையாளம் காணும்."],
      ["வெளிப்படையான கண்காணிப்பு", "புகாரின் முன்னேற்றத்தை மக்களுக்குத் தெரிவிக்கும்."]
    ],
    howTag: "எளிமையான மற்றும் வெளிப்படையான செயல்முறை",
    howTitle: "சிவிக்‌ஷீல்டு AI எவ்வாறு செயல்படுகிறது?",
    howText: "புகார் அளிப்பதில் இருந்து தீர்வு காண்பது வரை ஒரே இணைக்கப்பட்ட செயல்முறை.",
    steps: [
      ["புகார் அளித்தல்", "எழுத்து, குரல் அல்லது படங்கள் மூலம் புகாரைச் சமர்ப்பிக்கவும்."],
      ["ஆய்வு செய்தல்", "AI புகாரை வகைப்படுத்தி, ஒத்த புகார்களைக் கண்டறிய உதவும்."],
      ["ஒதுக்கீடு செய்தல்", "புகார் சம்பந்தப்பட்ட அரசுத் துறைக்கு அனுப்பப்படும்."],
      ["தீர்வு காணுதல்", "புகாரின் முன்னேற்றத்தைக் கண்காணித்து தீர்வைச் சரிபார்க்கலாம்."]
    ],
    governmentTag: "அரசு அதிகாரிகள் தளம்",
    governmentTitle: "சிறந்த ஒருங்கிணைப்பு. தெளிவான பொறுப்புணர்வு.",
    governmentText: "அதிகாரிகள் புகார்களை ஆய்வு செய்து, துறைகளுக்கு ஒதுக்கி, நிலுவையில் உள்ள புகார்களைக் கண்காணித்து தீர்வு விவரங்களைப் பதிவு செய்யலாம்.",
    governmentButton: "அரசு அதிகாரிகள் தளம்",
    impactTag: "நமது பொதுவான பொறுப்பு",
    impactTitle: "சிறந்த மற்றும் பாதுகாப்பான தமிழ்நாட்டை ஒன்றாக உருவாக்குவோம்.",
    impactText: "உங்கள் குரல் உங்கள் சமூகத்தில் நல்ல மாற்றத்தை உருவாக்க உதவும்.",
    impactButton: "பொது பிரச்சினையைப் புகாரளிக்கவும்",
    footerText: "சிறந்த சமூகங்கள் | வெளிப்படையான நிர்வாகம்",
    footerLine: "நம் ஊர்... நம் பொறுப்பு...",
    footerCopyright: "© 2026 CivicShield AI — மாதிரி திட்டம்"
  }
};

export default function Landing() {
  const { lang, setLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const isTamil = lang === "ta";
  const t = translations[lang] || translations.en;

  // NAVIGATION TO CITIZEN DASHBOARD (PROTECTED: PROMPT LOGIN IF GUEST)
  const goToDashboard = (category = "") => {
    setMenuOpen(false);
    if (!isAuthenticated()) {
      navigate(category ? `/login?redirect=/dashboard?category=${category}` : "/login?redirect=/dashboard");
    } else {
      navigate(category ? `/dashboard?category=${category}` : "/dashboard");
    }
  };

  // NAVIGATION TO COMPLAINT REGISTRATION (PROTECTED: PROMPT LOGIN IF GUEST)
  const goToComplaint = (category = "") => {
    setMenuOpen(false);
    if (!isAuthenticated()) {
      navigate(category ? `/login?redirect=/report-issue?category=${category}` : "/login?redirect=/report-issue");
    } else {
      navigate(category ? `/report-issue?category=${category}` : "/report-issue");
    }
  };

  // NAVIGATION TO VOICE COMPLAINT (PROTECTED: PROMPT LOGIN IF GUEST)
  const goToVoiceComplaint = () => {
    setMenuOpen(false);
    if (!isAuthenticated()) {
      navigate("/login?redirect=/report-issue?mode=voice");
    } else {
      navigate("/report-issue?mode=voice");
    }
  };

  // CLOSE MOBILE MENU
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("civicshield_logged_in");
    localStorage.removeItem("civicshield_current_user");

    setMenuOpen(false);
    navigate("/signup");
  };

  // LANGUAGE SWITCH
  const toggleLanguage = () => {
    setLang(lang === "ta" ? "en" : "ta");
  };

  return (
    <div className="civic-page" lang={lang}>

      {/* DEVELOPER-STYLE GLASSMORPHISM NAVBAR (NO LOGOUT BUTTON) */}
      <Navbar />

      <main>

        {/* VIDEO HERO - EXISTING VIDEO PRESERVED */}
        <section className="video-hero" id="home">

          <video
            className="hero-background-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source
              src="/video/civicshield-city.mp4.mp4.mp4"
              type="video/mp4"
            />

            Your browser does not support video.
          </video>

          <div className="hero-video-overlay"></div>

          <div className="video-hero-content">

            <span className="hero-label">
              <ShieldCheck size={15} />
              {t.heroTag}
            </span>

            <span className="video-eyebrow">
              {t.heroEyebrow}
            </span>

            <div className="video-heading">
              <h1>
                {t.heroTitle}
                <span>{t.heroHighlight}</span>
              </h1>

              <p>{t.heroText}</p>
            </div>

            <div className="hero-actions">

              <button
                className="btn-primary"
                onClick={() => goToComplaint()}
              >
                {t.report}
                <ArrowRight size={17} />
              </button>

              <a href="#about" className="btn-video-outline">
                {t.explore}
              </a>

            </div>

            <div className="hero-video-points">
              {t.heroPoints.map((point, index) => (
                <span key={index}>
                  <CheckCircle2 size={15} />
                  {point}
                </span>
              ))}
            </div>

          </div>
        </section>

        {/* AUTOMATIC IMAGE GALLERY */}
        <section className="hero-gallery-section">

          <div className="gallery-heading">
            <div>
              <span className="eyebrow">
                {t.galleryTag}
              </span>

              <h2>{t.galleryTitle}</h2>
            </div>
          </div>

          <div className="gallery-track">

            {[...heroSlides, ...heroSlides].map((item, index) => (
              <article
                className="gallery-slide"
                key={`${item.tag}-${index}`}
              >
                <img
                  src={item.image}
                  alt={item.tag}
                  loading="lazy"
                />

                <div className="gallery-image-overlay"></div>

                <div className="gallery-image-caption">
                  <small>{item.tag}</small>

                  <strong>
                    {isTamil ? item.tamilTitle : item.title}
                  </strong>
                </div>
              </article>
            ))}

          </div>
        </section>

        {/* STATISTICS */}
        <section className="stats-container reveal-section">

          {[
            [Users, "12,482", t.stats[0]],
            [CheckCircle2, "10,230", t.stats[1]],
            [Activity, "1,892", t.stats[2]],
            [Clock3, "360", t.stats[3]]
          ].map(([Icon, value, label]) => (
            <div className="stat-item" key={label}>

              <div className="stat-icon">
                <Icon size={22} />
              </div>

              <div>
                <p>{label}</p>
                <h3>{value}</h3>
              </div>

            </div>
          ))}

          <p className="demo-note">
            {isTamil
              ? "மாதிரி புள்ளிவிவரங்கள்"
              : "Illustrative demo statistics"}
          </p>

        </section>


        {/* ====================================================
            CORE RESPONSIVE SERVICE CARDS (6 DEDICATED ACTION CARDS)
            ==================================================== */}
        <section className="civic-services-hub reveal-section" id="core-services">
          <div className="section-heading text-center">
            <span className="eyebrow">
              {isTamil ? "முக்கிய குடிமக்கள் சேவைகள்" : "CORE CIVIC SERVICES"}
            </span>
            <h2>
              {isTamil
                ? "குடிமக்கள் விரைவு அணுகல் மையம்"
                : "Citizen Quick Access Hub"}
            </h2>
            <p>
              {isTamil
                ? "புகார் பதிவு, நேரலை கண்காணிப்பு, வரைபட ரேடார் மற்றும் அரசு அறிவிப்புகள் அனைத்தையும் ஒரே கிளிக்கில் அணுகுங்கள்."
                : "Fast-track grievance filing, live SLA telemetry, district radar, and official government circulars."}
            </p>
          </div>

          <div className="civic-services-grid">
            {/* 1. Raise Complaint */}
            <article
              className="civic-service-card card-primary"
              onClick={() => goToComplaint()}
              role="button"
              tabIndex={0}
            >
              <div className="service-card-image-wrap">
                <img
                  src="/images/services/raise-complaint.jpg"
                  alt="Raise Complaint"
                  className="service-card-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1584467735871-8e85353a8413?q=80&w=600&auto=format&fit=crop";
                  }}
                />
                <div className="service-card-image-gradient"></div>
                <div className="service-icon-box icon-sky">
                  <FilePlus2 size={24} />
                </div>
                <span className="service-tag tag-sky">
                  {isTamil ? "உடனடி பதிவு" : "Instant Filing"}
                </span>
              </div>
              <div className="service-card-body">
                <h3>{isTamil ? "புகார் பதிவு செய்க" : "Raise Complaint"}</h3>
                <p>
                  {isTamil
                    ? "படங்கள், இருப்பிடம் மற்றும் TruthLens AI சரிபார்ப்புடன் உங்கள் பகுதி புகாரைப் பதிவு செய்யுங்கள்."
                    : "Report civil issues with auto geo-tagging, image evidence, and TruthLens AI tamper detection."}
                </p>
              </div>
              <div className="service-card-action">
                <span>{isTamil ? "புகார் தொடங்க" : "Report Issue"}</span>
                <ArrowRight size={17} className="action-arrow" />
              </div>
            </article>

            {/* 2. Track Complaint */}
            <article
              className="civic-service-card"
              onClick={() => navigate("/track-complaints")}
              role="button"
              tabIndex={0}
            >
              <div className="service-card-image-wrap">
                <img
                  src="/images/services/track-complaint.jpg"
                  alt="Track Complaint"
                  className="service-card-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop";
                  }}
                />
                <div className="service-card-image-gradient"></div>
                <div className="service-icon-box icon-emerald">
                  <FileSearch size={24} />
                </div>
                <span className="service-tag tag-emerald">
                  {isTamil ? "நேரலை கண்காணிப்பு" : "Live Telemetry"}
                </span>
              </div>
              <div className="service-card-body">
                <h3>{isTamil ? "புகார் கண்காணிப்பு" : "Track Complaint"}</h3>
                <p>
                  {isTamil
                    ? "உங்கள் புகார் ஐடியை உள்ளிட்டு உடனடி நிலை, அதிகாரி குறிப்புகள் மற்றும் கால அளவைக் காணுங்கள்."
                    : "Monitor real-time resolution timelines, department assignments, and SLA audit trails."}
                </p>
              </div>
              <div className="service-card-action">
                <span>{isTamil ? "கண்காணிக்க" : "Track Now"}</span>
                <ArrowRight size={17} className="action-arrow" />
              </div>
            </article>

            {/* 3. Voice Complaint */}
            <article
              className="civic-service-card"
              onClick={() => goToVoiceComplaint()}
              role="button"
              tabIndex={0}
            >
              <div className="service-card-image-wrap">
                <img
                  src="/images/services/voice-complaint.jpg"
                  alt="Voice Complaint"
                  className="service-card-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600&auto=format&fit=crop";
                  }}
                />
                <div className="service-card-image-gradient"></div>
                <div className="service-icon-box icon-purple">
                  <Mic size={24} />
                </div>
                <span className="service-tag tag-purple">
                  {isTamil ? "சர்வம் AI Saaras v4" : "Sarvam AI Saaras v4"}
                </span>
              </div>
              <div className="service-card-body">
                <h3>{isTamil ? "குரல் வழி புகார்" : "Voice Complaint"}</h3>
                <p>
                  {isTamil
                    ? "தமிழ் அல்லது ஆங்கிலத்தில் பேசிப் பதிவு செய்யுங்கள். சர்வம் AI குரல்வழி உரை மாற்றும்."
                    : "Speak freely in spoken Tamil or English. Auto-transcribed and translated via Sarvam AI."}
                </p>
              </div>
              <div className="service-card-action">
                <span>{isTamil ? "குரல் பதிவு" : "Voice Reporting"}</span>
                <ArrowRight size={17} className="action-arrow" />
              </div>
            </article>

            {/* 4. Nearby Issues */}
            <article
              className="civic-service-card"
              onClick={() => navigate("/nearby-issues")}
              role="button"
              tabIndex={0}
            >
              <div className="service-card-image-wrap">
                <img
                  src="/images/services/nearby-radar.jpg"
                  alt="Nearby Issues"
                  className="service-card-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop";
                  }}
                />
                <div className="service-card-image-gradient"></div>
                <div className="service-icon-box icon-amber">
                  <Compass size={24} />
                </div>
                <span className="service-tag tag-amber">
                  {isTamil ? "சேலம் ரேடார்" : "Salem District Radar"}
                </span>
              </div>
              <div className="service-card-body">
                <h3>{isTamil ? "அருகிலுள்ள பிரச்சினைகள்" : "Nearby Issues"}</h3>
                <p>
                  {isTamil
                    ? "உங்கள் பகுதியில் உள்ள மற்ற மக்களின் புகார்கள், சாலை அபாயங்கள் மற்றும் நேரலை நிலவரங்களைக் காணுங்கள்."
                    : "Geographic radar mapping active complaints, road hazards, and municipal tasks across Salem."}
                </p>
              </div>
              <div className="service-card-action">
                <span>{isTamil ? "வரைபடத்தை திற" : "Open Radar Map"}</span>
                <ArrowRight size={17} className="action-arrow" />
              </div>
            </article>

            {/* 5. Government Updates */}
            <article
              className="civic-service-card"
              onClick={() => navigate("/government-updates")}
              role="button"
              tabIndex={0}
            >
              <div className="service-card-image-wrap">
                <img
                  src="/images/services/gov-updates.jpg"
                  alt="Government Updates"
                  className="service-card-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=600&auto=format&fit=crop";
                  }}
                />
                <div className="service-card-image-gradient"></div>
                <div className="service-icon-box icon-rose">
                  <Activity size={24} />
                </div>
                <span className="service-tag tag-rose">
                  {isTamil ? "அதிகாரப்பூர்வ தகவல்கள்" : "Official Bulletins"}
                </span>
              </div>
              <div className="service-card-body">
                <h3>{isTamil ? "அரசு அறிவிப்புகள்" : "Government Updates"}</h3>
                <p>
                  {isTamil
                    ? "நகராட்சி பணிகள், குடிநீர் மற்றும் மின்சார திட்டங்கள், அவசரக் கால அறிவிப்புகளை உடனுக்குடன் அறியலாம்."
                    : "Stay informed on ongoing civic infrastructure projects, ward notices, and emergency alerts."}
                </p>
              </div>
              <div className="service-card-action">
                <span>{isTamil ? "அறிவிப்புகளைக் காண்க" : "View Bulletins"}</span>
                <ArrowRight size={17} className="action-arrow" />
              </div>
            </article>

            {/* 6. Citizen Dashboard */}
            <article
              className="civic-service-card"
              onClick={() => goToDashboard()}
              role="button"
              tabIndex={0}
            >
              <div className="service-card-image-wrap">
                <img
                  src="/images/services/citizen-dashboard.jpg"
                  alt="Citizen Dashboard"
                  className="service-card-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop";
                  }}
                />
                <div className="service-card-image-gradient"></div>
                <div className="service-icon-box icon-cyan">
                  <LayoutDashboard size={24} />
                </div>
                <span className="service-tag tag-cyan">
                  {isTamil ? "தனிப்பட்ட தளம்" : "Citizen Portal"}
                </span>
              </div>
              <div className="service-card-body">
                <h3>{isTamil ? "மக்கள் தகவல் பலகை" : "Citizen Dashboard"}</h3>
                <p>
                  {isTamil
                    ? "உங்கள் அனைத்து புகார்கள், தீர்வு வரலாறு மற்றும் அதிகாரிகளின் பதவிகளை ஒரே இடத்தில் மேலாண்மை செய்யுங்கள்."
                    : "Your personal cockpit for registered grievances, resolution metrics, and citizen profile."}
                </p>
              </div>
              <div className="service-card-action">
                <span>{isTamil ? "தகவல் பலகை" : "Enter Dashboard"}</span>
                <ArrowRight size={17} className="action-arrow" />
              </div>
            </article>
          </div>
        </section>

        {/* ABOUT */}
        <section
          className="about-section reveal-section"
          id="about"
        >

          <div className="about-symbol">
            <ShieldCheck size={42} />
          </div>

          <div>
            <span className="eyebrow">
              {t.aboutTag}
            </span>

            <h2>{t.aboutTitle}</h2>

            <p>{t.aboutText}</p>
          </div>

        </section>

        {/* COMMUNITY */}
        <section
          className="community-section reveal-section"
          id="community"
        >

          <div className="section-heading">
            <span className="eyebrow">
              {t.communityTag}
            </span>

            <h2>{t.communityTitle}</h2>

            <p>{t.communityText}</p>
          </div>

          <div className="community-grid">

            {communityImages.map(({ image, icon: Icon }, index) => (
              <article
                className="community-card"
                key={index}
              >

                <div className="community-image">
                  <img
                    src={image}
                    alt={t.people[index][0]}
                    loading="lazy"
                  />

                  <span className="community-icon">
                    <Icon size={22} />
                  </span>
                </div>

                <div className="community-content">
                  <h3>{t.people[index][0]}</h3>
                  <p>{t.people[index][1]}</p>
                </div>

              </article>
            ))}

          </div>
        </section>

        {/* SERVICES */}
        <section
          className="services-section reveal-section"
          id="services"
        >

          <div className="section-heading">
            <span className="eyebrow">
              {t.servicesTag}
            </span>

            <h2>{t.servicesTitle}</h2>

            <p>{t.servicesText}</p>
          </div>

          <div className="category-grid">

            {categories.map(({ icon: Icon, color, value }, index) => (
              <button
                className="category-card"
                key={value}
                onClick={() => goToComplaint(value)}
              >

                <span style={{ color }}>
                  <Icon size={27} />
                </span>

                <strong>{t.categories[index]}</strong>

                <ArrowRight
                  size={17}
                  className="category-arrow"
                />

              </button>
            ))}

          </div>

          <div className="voice-card">

            <div className="voice-icon">
              <Mic size={26} />
            </div>

            <div>
              <h3>{t.voiceTitle}</h3>
              <p>{t.voiceText}</p>
            </div>

            <button
              className="btn-primary"
              onClick={() => goToVoiceComplaint()}
            >
              {t.start}
              <ArrowRight size={17} />
            </button>

          </div>

        </section>

        {/* AI FEATURES */}
        <section className="ai-section reveal-section">

          <div className="ai-copy">

            <span className="eyebrow">
              {t.aiTag}
            </span>

            <h2>{t.aiTitle}</h2>

            <p>{t.aiText}</p>

            <button
              className="btn-primary"
              onClick={() => goToComplaint()}
            >
              {t.explore}
              <ArrowRight size={17} />
            </button>

          </div>

          <div className="ai-feature-list">

            {[
              BrainCircuit,
              ShieldCheck,
              Activity,
              HeartHandshake
            ].map((Icon, index) => (
              <div key={index}>

                <Icon />

                <span>
                  <strong>{t.aiFeatures[index][0]}</strong>
                  <small>{t.aiFeatures[index][1]}</small>
                </span>

              </div>
            ))}

          </div>

        </section>

        {/* HOW IT WORKS */}
        <section
          className="how-section reveal-section"
          id="how-it-works"
        >

          <div className="section-heading">
            <span className="eyebrow">
              {t.howTag}
            </span>

            <h2>{t.howTitle}</h2>

            <p>{t.howText}</p>
          </div>

          <div className="steps-grid">

            {steps.map(({ number, icon: Icon }, index) => (
              <article
                className="step-card"
                key={number}
              >

                <span className="step-number">
                  {number}
                </span>

                <div className="step-icon">
                  <Icon size={25} />
                </div>

                <h3>{t.steps[index][0]}</h3>

                <p>{t.steps[index][1]}</p>

              </article>
            ))}

          </div>

        </section>

        {/* GOVERNMENT PORTAL */}
        <section className="government-section reveal-section">

          <div className="government-visual">

            <img
              src="/images/government-office.jpg"
              alt="Tamil Nadu Municipal Administration Command HQ"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = "https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=1200&auto=format&fit=crop";
              }}
            />

            <div className="government-badge-overlay">
              <Landmark size={18} color="#38bdf8" />
              <span>TAMIL NADU MUNICIPAL ADMINISTRATION HQ</span>
            </div>

          </div>

          <div className="government-copy">

            <span className="eyebrow">
              {t.governmentTag}
            </span>

            <h2>{t.governmentTitle}</h2>

            <p>{t.governmentText}</p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
              <Link
                to="/admin/login"
                className="btn-primary"
                style={{ textDecoration: "none" }}
              >
                <ShieldAlert size={17} />
                <span>{t.governmentButton || "Officer / Admin Portal"}</span>
                <ArrowRight size={17} />
              </Link>
              <Link
                to="/superadmin/login"
                className="btn-primary"
                style={{
                  textDecoration: "none",
                  background: "linear-gradient(135deg, #b45309, #d97706)",
                  borderColor: "#f59e0b",
                  color: "#ffffff",
                  boxShadow: "0 0 20px rgba(245, 158, 11, 0.35)",
                }}
              >
                <Crown size={17} color="#fef08a" />
                <span>Super Admin Apex Portal</span>
                <ArrowRight size={17} />
              </Link>
            </div>

          </div>

        </section>

        {/* FINAL CTA */}
        <section className="final-cta reveal-section">

          <span className="eyebrow">
            {t.impactTag}
          </span>

          <h2>{t.impactTitle}</h2>

          <p>{t.impactText}</p>

          <button
            className="btn-light"
            onClick={() => goToComplaint()}
          >
            {t.impactButton}
            <ArrowRight size={17} />
          </button>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="site-footer" id="contact">

        <div className="footer-brand">
          <ShieldCheck size={30} />

          <strong>
            CivicShield <span>AI</span>
          </strong>
        </div>

        <p>{t.footerText}</p>

        <span>{t.footerLine}</span>

        <div className="footer-portals" style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", margin: "16px 0" }}>
          <Link to="/dashboard" style={{ color: "#38bdf8", textDecoration: "none", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <LayoutDashboard size={14} /> Citizen Dashboard
          </Link>
          <span style={{ color: "#475569" }}>•</span>
          <Link to="/admin/login" style={{ color: "#ef4444", textDecoration: "none", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ShieldAlert size={14} /> Admin & Officer Portal
          </Link>
          <span style={{ color: "#475569" }}>•</span>
          <Link to="/superadmin/login" style={{ color: "#fbbf24", textDecoration: "none", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
            <Crown size={14} /> Super Admin Apex
          </Link>
        </div>

        <small>{t.footerCopyright}</small>

      </footer>

    </div>
  );
}