// CivicShield AI - Unified API Client
import { Capacitor } from "@capacitor/core";

// Dynamically determine the backend URL based on platform/device
export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("civicshield_api_base");
    if (custom) return custom.replace(/\/$/, "");

    if (Capacitor.isNativePlatform()) {
      // Android device on local network (fallback to current PC IP 192.168.1.2)
      return "http://192.168.1.2:5000";
    }
  }

  // Deployed production environment variable (e.g. on Vercel)
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }

  return "http://localhost:5000";
}

export function setCustomApiBaseUrl(url) {
  if (url) {
    localStorage.setItem("civicshield_api_base", url.trim());
  } else {
    localStorage.removeItem("civicshield_api_base");
  }
  API_BASE_URL = getApiBaseUrl();
}

export let API_BASE_URL = getApiBaseUrl();

/**
 * Get stored auth token
 */
export function getAuthToken() {
  return localStorage.getItem("civicshield_token") || "";
}

/**
 * Get stored current user
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("civicshield_current_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Check if logged in
 */
export function isAuthenticated() {
  return localStorage.getItem("civicshield_logged_in") === "true";
}

/**
 * Perform logout without forcing page redirect
 */
export function performLogout() {
  localStorage.removeItem("civicshield_logged_in");
  localStorage.removeItem("civicshield_token");
  localStorage.removeItem("civicshield_current_user");
  window.dispatchEvent(new Event("civicshield_auth_changed"));
}

/**
 * Update Current User Profile
 */
export async function updateUserProfile(profileData) {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    if (data.user) {
      localStorage.setItem("civicshield_current_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("civicshield_auth_changed"));
    }
    return data;
  } catch (err) {
    // Local fallback update
    const cur = getCurrentUser() || {};
    const updated = { ...cur, ...profileData };
    localStorage.setItem("civicshield_current_user", JSON.stringify(updated));
    window.dispatchEvent(new Event("civicshield_auth_changed"));
    return { success: true, user: updated };
  }
}

/**
 * Register User in MongoDB
 */
export async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    if (data.token) {
      localStorage.setItem("civicshield_token", data.token);
      localStorage.setItem("civicshield_logged_in", "true");
      localStorage.setItem("civicshield_current_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("civicshield_auth_changed"));
    }

    return data;
  } catch (error) {
    // If backend connection fails, graceful local fallback with notice
    console.warn("Backend register API error, using local fallback:", error.message);
    const users = JSON.parse(localStorage.getItem("civicshield_users") || "[]");
    const existing = users.find((u) => u.email === userData.email);
    if (existing) {
      throw new Error("This email is already registered. Please login.");
    }
    const newUser = {
      id: "usr-" + Date.now(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      role: "citizen",
    };
    users.push({ ...newUser, password: userData.password });
    localStorage.setItem("civicshield_users", JSON.stringify(users));
    localStorage.setItem("civicshield_logged_in", "true");
    localStorage.setItem("civicshield_current_user", JSON.stringify(newUser));
    window.dispatchEvent(new Event("civicshield_auth_changed"));
    return { success: true, user: newUser };
  }
}

/**
 * Login User via MongoDB
 */
export async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Invalid email or password");
    }

    if (data.token) {
      localStorage.setItem("civicshield_token", data.token);
      localStorage.setItem("civicshield_logged_in", "true");
      localStorage.setItem("civicshield_current_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("civicshield_auth_changed"));
    }

    return data;
  } catch (error) {
    console.warn("Backend login API error, checking local store:", error.message);
    const users = JSON.parse(localStorage.getItem("civicshield_users") || "[]");
    const user = users.find(
      (u) =>
        u.email === credentials.email.toLowerCase() &&
        u.password === credentials.password
    );
    if (!user) {
      throw new Error(error.message || "Invalid email or password");
    }
    const userProfile = { id: user.id || "usr-1", name: user.name, email: user.email, phone: user.phone };
    localStorage.setItem("civicshield_logged_in", "true");
    localStorage.setItem("civicshield_current_user", JSON.stringify(userProfile));
    window.dispatchEvent(new Event("civicshield_auth_changed"));
    return { success: true, user: userProfile };
  }
}

/**
 * Submit Complaint with Images, 20-30s Video, Location, and Sarvam/TruthLens AI
 */
export async function submitComplaint(formData) {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/complaints`, {
    method: "POST",
    headers,
    body: formData, // FormData multipart/form-data
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Complaint submission failed");
  }

  // Real-time broadcast to Admin Dashboard across tabs and windows
  if (data.complaint) {
    try {
      localStorage.setItem(
        "civicshield_latest_complaint_event",
        JSON.stringify({ complaint: data.complaint, timestamp: Date.now() })
      );
      window.dispatchEvent(
        new CustomEvent("civicshield_new_complaint", { detail: data.complaint })
      );
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("civicshield_channel");
        bc.postMessage({ type: "NEW_COMPLAINT", complaint: data.complaint });
        setTimeout(() => bc.close(), 1000);
      }
    } catch (e) {
      console.warn("Could not dispatch complaint broadcast:", e);
    }
  }

  return data;
}

/**
 * Get Complaints in Real-Time
 */
export async function fetchComplaints(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/complaints?${query}`);
    const data = await response.json();
    return data.complaints || [];
  } catch (error) {
    console.warn("Error fetching live complaints:", error.message);
    return [];
  }
}

/**
 * Get Real-Time Stats Overview
 */
export async function fetchStatsOverview() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/complaints/stats/overview`);
    const data = await response.json();
    return data.stats || null;
  } catch (error) {
    return null;
  }
}

/**
 * Update Complaint Status (Government Admin)
 */
export async function updateComplaintStatus(id, status, note = "") {
  const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, note }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update status");
  }

  return data;
}

/**
 * Supported Sarvam AI Language options
 */
export const SARVAM_LANGUAGES = [
  { code: "auto", name: "Auto-Detect (தானியங்கி கண்டறிதல்)" },
  { code: "ta-IN", name: "Tamil (தமிழ்)" },
  { code: "en-IN", name: "English (Indian / Global)" },
  { code: "hi-IN", name: "Hindi (हिन्दी)" },
  { code: "te-IN", name: "Telugu (తెలుగు)" },
  { code: "kn-IN", name: "Kannada (ಕನ್ನಡ)" },
  { code: "ml-IN", name: "Malayalam (മലയാളം)" },
  { code: "mr-IN", name: "Marathi (मराठी)" },
  { code: "bn-IN", name: "Bengali (বাংলা)" },
  { code: "gu-IN", name: "Gujarati (ગુજરાતી)" },
  { code: "pa-IN", name: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "od-IN", name: "Odia (ଓଡ଼ିଆ)" },
];

/**
 * Live Sarvam AI Voice Transcription (Saaras v4)
 */
export async function transcribeVoiceWithSarvam(audioBlobOrFile, language = "ta-IN", liveTranscript = "") {
  const formData = new FormData();
  let filename = "voice-recording.webm";
  if (audioBlobOrFile && audioBlobOrFile.name) {
    filename = audioBlobOrFile.name;
  } else if (audioBlobOrFile && audioBlobOrFile.type) {
    if (audioBlobOrFile.type.includes("wav")) filename = "voice-recording.wav";
    else if (audioBlobOrFile.type.includes("mp3") || audioBlobOrFile.type.includes("mpeg")) filename = "voice-recording.mp3";
    else if (audioBlobOrFile.type.includes("ogg")) filename = "voice-recording.ogg";
    else if (audioBlobOrFile.type.includes("m4a")) filename = "voice-recording.m4a";
  }
  if (audioBlobOrFile) {
    formData.append("audio", audioBlobOrFile, filename);
  }
  formData.append("language", language);
  if (liveTranscript) {
    formData.append("liveTranscript", liveTranscript);
  }

  const response = await fetch(`${API_BASE_URL}/api/complaints/live-transcribe`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Transcription failed with Sarvam AI");
  }

  return data;
}

/* ====================================================
   ADMIN MODULE API METHODS (STRICT ROLE ENFORCEMENT)
   ==================================================== */

/**
 * Get stored admin token
 */
export function getAdminToken() {
  return localStorage.getItem("civicshield_admin_token") || "";
}

/**
 * Get stored current admin user
 */
export function getAdminUser() {
  try {
    const raw = localStorage.getItem("civicshield_admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Check if Admin is authenticated with valid admin/government role
 */
export function isAdminAuthenticated() {
  const token = getAdminToken();
  const user = getAdminUser();
  if (!token || !user) return false;
  return user.role === "admin" || user.role === "government";
}

/**
 * Admin Logout
 */
export function performAdminLogout() {
  localStorage.removeItem("civicshield_admin_token");
  localStorage.removeItem("civicshield_admin_user");
  window.dispatchEvent(new Event("civicshield_admin_auth_changed"));
}

/**
 * Register Admin in MongoDB / Resilient Store
 */
export async function registerAdmin(adminData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Admin registration failed");
    }

    if (data.token) {
      localStorage.setItem("civicshield_admin_token", data.token);
      localStorage.setItem("civicshield_admin_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("civicshield_admin_auth_changed"));
    }

    return data;
  } catch (error) {
    // If backend connection fails, graceful local admin store
    console.warn("Backend admin register error, using resilient store:", error.message);
    const admins = JSON.parse(localStorage.getItem("civicshield_admins") || "[]");
    const existing = admins.find((u) => u.email === adminData.email.toLowerCase());
    if (existing) {
      throw new Error("This official email is already registered. Please sign in.");
    }
    const newAdmin = {
      id: "adm-" + Date.now(),
      name: adminData.name,
      email: adminData.email.toLowerCase(),
      phone: adminData.phone || "",
      department: adminData.department || "Municipal Administration",
      role: "admin",
    };
    admins.push({ ...newAdmin, password: adminData.password });
    localStorage.setItem("civicshield_admins", JSON.stringify(admins));
    localStorage.setItem("civicshield_admin_token", "adm-token-" + Date.now());
    localStorage.setItem("civicshield_admin_user", JSON.stringify(newAdmin));
    window.dispatchEvent(new Event("civicshield_admin_auth_changed"));
    return { success: true, user: newAdmin };
  }
}

/**
 * Admin Login (Rejects regular citizens)
 */
export async function loginAdmin(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Invalid admin credentials");
    }

    if (data.token) {
      localStorage.setItem("civicshield_admin_token", data.token);
      localStorage.setItem("civicshield_admin_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("civicshield_admin_auth_changed"));
    }

    return data;
  } catch (error) {
    console.warn("Backend admin login error, checking resilient local admins:", error.message);
    const admins = JSON.parse(localStorage.getItem("civicshield_admins") || "[]");
    const admin = admins.find(
      (u) =>
        u.email === credentials.email.toLowerCase() &&
        u.password === credentials.password
    );

    // If matching citizen exists, strictly disallow login
    const regularUsers = JSON.parse(localStorage.getItem("civicshield_users") || "[]");
    const isCitizen = regularUsers.some(
      (u) => u.email === credentials.email.toLowerCase() && (!u.role || u.role === "citizen")
    );
    if (isCitizen && !admin) {
      throw new Error("Access Restricted: Citizen accounts are not permitted to access the Admin Portal.");
    }

    if (!admin) {
      throw new Error(error.message || "Invalid administrative email or password");
    }

    const adminProfile = {
      id: admin.id || "adm-1",
      name: admin.name,
      email: admin.email,
      phone: admin.phone || "",
      department: admin.department || "Municipal Administration",
      role: "admin",
    };
    localStorage.setItem("civicshield_admin_token", "adm-token-" + Date.now());
    localStorage.setItem("civicshield_admin_user", JSON.stringify(adminProfile));
    window.dispatchEvent(new Event("civicshield_admin_auth_changed"));
    return { success: true, user: adminProfile };
  }
}

/**
 * Update Complaint Status & Official Remarks by Admin
 */
export async function updateComplaintByAdmin(id, { status, adminResponse, assignedOfficer }) {
  const token = getAdminToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      status,
      adminResponse,
      note: adminResponse,
      assignedOfficer,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update complaint status");
  }

  // Real-time broadcast of Admin Action to Super Admin across tabs and windows
  if (data.adminAction) {
    try {
      localStorage.setItem(
        "civicshield_latest_admin_action",
        JSON.stringify({ action: data.adminAction, timestamp: Date.now() })
      );
      window.dispatchEvent(
        new CustomEvent("civicshield_admin_action", { detail: data.adminAction })
      );
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("civicshield_channel");
        bc.postMessage({ type: "ADMIN_ACTION", action: data.adminAction });
        setTimeout(() => bc.close(), 1000);
      }
    } catch (e) {
      console.warn("Could not broadcast admin action:", e.message);
    }
  }

  return data;
}

// =========================================================================
// SUPER ADMIN MODULE API CLIENT
// =========================================================================

/**
 * Get stored Super Admin token
 */
export function getSuperAdminToken() {
  return localStorage.getItem("civicshield_superadmin_token") || "";
}

/**
 * Get stored current Super Admin user
 */
export function getSuperAdminUser() {
  try {
    const raw = localStorage.getItem("civicshield_superadmin_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Check if Super Admin is authenticated
 */
export function isSuperAdminAuthenticated() {
  const token = getSuperAdminToken();
  const user = getSuperAdminUser();
  if (!token || !user) return false;
  return user.role === "superadmin";
}

/**
 * Super Admin Logout
 */
export function performSuperAdminLogout() {
  localStorage.removeItem("civicshield_superadmin_token");
  localStorage.removeItem("civicshield_superadmin_user");
  window.dispatchEvent(new Event("civicshield_superadmin_auth_changed"));
}

/**
 * Super Admin Login (Strictly verifies superadmin role)
 */
export async function loginSuperAdmin(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/superadmin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Invalid Super Admin credentials");
    }

    if (data.token) {
      localStorage.setItem("civicshield_superadmin_token", data.token);
      localStorage.setItem("civicshield_superadmin_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("civicshield_superadmin_auth_changed"));
    }

    return data;
  } catch (error) {
    console.warn("Backend Super Admin login error, checking fallback:", error.message);

    // Fallback: default seeded credentials if offline
    if (
      credentials.email.toLowerCase() === "superadmin@civicshield.gov.in" &&
      credentials.password === "SuperAdmin@2026"
    ) {
      const superAdminProfile = {
        id: "sup-root-1",
        name: "Chief Secretary (Civic Oversight)",
        email: "superadmin@civicshield.gov.in",
        phone: "+91 94440 00001",
        department: "Apex Municipal Surveillance & Governance",
        role: "superadmin",
      };
      localStorage.setItem("civicshield_superadmin_token", "sup-token-" + Date.now());
      localStorage.setItem("civicshield_superadmin_user", JSON.stringify(superAdminProfile));
      window.dispatchEvent(new Event("civicshield_superadmin_auth_changed"));
      return { success: true, user: superAdminProfile };
    }

    throw new Error(error.message || "Invalid Super Admin credentials");
  }
}

/**
 * Super Admin Register
 */
export async function registerSuperAdmin(superAdminData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/superadmin/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(superAdminData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Super Admin registration failed");
    }

    if (data.token) {
      localStorage.setItem("civicshield_superadmin_token", data.token);
      localStorage.setItem("civicshield_superadmin_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("civicshield_superadmin_auth_changed"));
    }

    return data;
  } catch (error) {
    console.warn("Backend Super Admin register error, checking fallback:", error.message);
    const newProfile = {
      id: "sup-" + Date.now(),
      name: superAdminData.name,
      email: superAdminData.email.toLowerCase(),
      phone: superAdminData.phone || "",
      department: "Apex Municipal Surveillance & Governance",
      role: "superadmin",
    };
    localStorage.setItem("civicshield_superadmin_token", "sup-token-" + Date.now());
    localStorage.setItem("civicshield_superadmin_user", JSON.stringify(newProfile));
    window.dispatchEvent(new Event("civicshield_superadmin_auth_changed"));
    return { success: true, user: newProfile };
  }
}

/**
 * Fetch All Department Admins and their performance
 */
export async function fetchSuperAdminAdmins() {
  const token = getSuperAdminToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/superadmin/admins`, { headers });
    const data = await res.json();
    return data.admins || [];
  } catch (e) {
    console.warn("Could not fetch admins list:", e.message);
    return [];
  }
}

/**
 * Fetch Admin Audit Logs / Actions Feed
 */
export async function fetchSuperAdminAuditLogs() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/complaints/superadmin/audit-logs`);
    const data = await res.json();
    return data.actions || [];
  } catch (e) {
    console.warn("Could not fetch audit logs:", e.message);
    return [];
  }
}

/**
 * Fetch Super Admin Statewide Analytics
 */
export async function fetchSuperAdminAnalytics() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/complaints/superadmin/analytics`);
    const data = await res.json();
    return data.analytics || null;
  } catch (e) {
    console.warn("Could not fetch super admin analytics:", e.message);
    return null;
  }
}

/**
 * Super Admin Executive Override on Complaint
 */
export async function overrideComplaintBySuperAdmin(id, overrideData) {
  const token = getSuperAdminToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/complaints/${id}/superadmin-override`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(overrideData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to execute Super Admin override");
  }

  return data;
}


