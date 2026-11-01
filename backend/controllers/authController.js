const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const resilientStore = require("../data/resilientStore");

const isMongooseReady = () => mongoose.connection.readyState === 1;
const { JWT_SECRET } = require("../middleware/authMiddleware");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role = "citizen" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. If MongoDB Mongoose is connected
    if (isMongooseReady()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered. Please login.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : "",
        role: role === "government" ? "government" : "citizen",
      });

      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        success: true,
        message: "Registration successful!",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    // 2. Resilient Store fallback
    const data = resilientStore.readData();
    const existing = (data.users || []).find((u) => u.email === cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please login.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: "usr-" + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      role: role === "government" ? "government" : "citizen",
      createdAt: new Date(),
    };

    data.users.push(newUser);
    resilientStore.writeData(data);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = null;

    if (isMongooseReady()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      const data = resilientStore.readData();
      user = (data.users || []).find((u) => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful! Welcome to CivicShield AI.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role || "citizen",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// CURRENT USER
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    let user = null;

    if (isMongooseReady()) {
      user = await User.findById(userId).select("-password");
    } else {
      const data = resilientStore.readData();
      user = (data.users || []).find((u) => u._id === userId);
      if (user) {
        const { password, ...safeUser } = user;
        user = safeUser;
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get user details" });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, city, address } = req.body;

    let updatedUser = null;

    if (isMongooseReady()) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          ...(name && { name: name.trim() }),
          ...(phone !== undefined && { phone: phone.trim() }),
          ...(city !== undefined && { city: city.trim() }),
          ...(address !== undefined && { address: address.trim() }),
        },
        { new: true }
      ).select("-password");
    } else {
      const data = resilientStore.readData();
      const index = (data.users || []).findIndex((u) => u._id === userId);
      if (index !== -1) {
        if (name) data.users[index].name = name.trim();
        if (phone !== undefined) data.users[index].phone = phone.trim();
        if (city !== undefined) data.users[index].city = city.trim();
        if (address !== undefined) data.users[index].address = address.trim();
        resilientStore.writeData(data);
        const { password, ...safe } = data.users[index];
        updatedUser = safe;
      }
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
  }
};

// ADMIN REGISTER
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password, phone, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide official name, email and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. If MongoDB Mongoose is connected
    if (isMongooseReady()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered in CivicShield AI system. Please sign in.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : "",
        department: department ? department.trim() : "Municipal Administration",
        role: "admin",
      });

      const token = jwt.sign(
        { id: admin._id, role: "admin", email: admin.email, name: admin.name, department: admin.department },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        success: true,
        message: "Admin account registered successfully!",
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          department: admin.department,
          role: "admin",
        },
      });
    }

    // 2. Resilient Store fallback
    const data = resilientStore.readData();
    const existing = (data.users || []).find((u) => u.email === cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered in CivicShield AI system. Please sign in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = {
      _id: "adm-" + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      department: department ? department.trim() : "Municipal Administration",
      role: "admin",
      createdAt: new Date(),
    };

    data.users.push(newAdmin);
    resilientStore.writeData(data);

    const token = jwt.sign(
      { id: newAdmin._id, role: "admin", email: newAdmin.email, name: newAdmin.name, department: newAdmin.department },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Admin account registered successfully!",
      token,
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        department: newAdmin.department,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin register error:", error);
    res.status(500).json({
      success: false,
      message: "Admin registration failed",
      error: error.message,
    });
  }
};

const DEFAULT_ADMIN_EMAIL = "admin@civicshield.gov.in";
const DEFAULT_ADMIN_PASS = "Admin@2026";

// ADMIN LOGIN (Strict Role Enforcement: Only 'admin' or 'government' accounts allowed)
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Official email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = null;

    if (isMongooseReady()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      const data = resilientStore.readData();
      user = (data.users || []).find((u) => u.email === cleanEmail);
    }

    // Auto-seed default Admin if logging in with default credentials and not present
    if (!user && cleanEmail === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASS) {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASS, 10);
      const defaultUser = {
        name: "Municipal Commissioner (TN HQ)",
        email: DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        phone: "+91 94440 12345",
        department: "Tamil Nadu Municipal Administration",
        role: "admin",
        createdAt: new Date(),
      };

      if (isMongooseReady()) {
        try {
          user = await User.create(defaultUser);
        } catch (e) {
          user = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
        }
      } else {
        defaultUser._id = "adm-root-1";
        const data = resilientStore.readData();
        data.users = data.users || [];
        data.users.push(defaultUser);
        resilientStore.writeData(data);
        user = defaultUser;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials. Account not found.",
      });
    }

    // STRICT ROLE CHECK: Reject Citizens from logging in to Admin portal
    if (user.role !== "admin" && user.role !== "government") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Citizen accounts are not permitted to access the CivicShield Admin Portal.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password for administrative account",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name, department: user.department },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Admin authentication successful! Access granted to Sentinel OS.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        department: user.department || "Municipal Administration",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error.message,
    });
  }
};

// =========================================================================
// SUPER ADMIN AUTHENTICATION & ADMIN PERFORMANCE TRACKING
// =========================================================================

const DEFAULT_SUPERADMIN_EMAIL = "superadmin@civicshield.gov.in";
const DEFAULT_SUPERADMIN_PASS = "SuperAdmin@2026";

/**
 * SUPER ADMIN REGISTER
 */
exports.superAdminRegister = async (req, res) => {
  try {
    const { name, email, password, phone, securityCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Executive name, official email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Super Admin password must contain at least 8 characters",
      });
    }

    // Security clearance code check (accepts standard or custom key)
    const validCodes = ["SUPERADMIN_APEX_2026", "CIVICSHIELD_SUPERADMIN", "TN_GOV_APEX_KEY"];
    if (securityCode && !validCodes.includes(securityCode.trim())) {
      return res.status(403).json({
        success: false,
        message: "Invalid Super Admin Apex Security Authorization Code.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isMongooseReady()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Account already exists with this email address.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const superAdmin = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : "",
        department: "Apex Municipal Surveillance & Governance",
        role: "superadmin",
      });

      const token = jwt.sign(
        { id: superAdmin._id, role: "superadmin", email: superAdmin.email, name: superAdmin.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        success: true,
        message: "Super Admin apex account registered successfully!",
        token,
        user: {
          id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          phone: superAdmin.phone,
          department: superAdmin.department,
          role: "superadmin",
        },
      });
    }

    // Resilient store fallback
    const data = resilientStore.readData();
    const existing = (data.users || []).find((u) => u.email === cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Account already exists with this email address.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSuperAdmin = {
      _id: "sup-" + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      department: "Apex Municipal Surveillance & Governance",
      role: "superadmin",
      createdAt: new Date(),
    };

    data.users.push(newSuperAdmin);
    resilientStore.writeData(data);

    const token = jwt.sign(
      { id: newSuperAdmin._id, role: "superadmin", email: newSuperAdmin.email, name: newSuperAdmin.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Super Admin apex account provisioned successfully!",
      token,
      user: {
        id: newSuperAdmin._id,
        name: newSuperAdmin.name,
        email: newSuperAdmin.email,
        phone: newSuperAdmin.phone,
        department: newSuperAdmin.department,
        role: "superadmin",
      },
    });
  } catch (error) {
    console.error("Super Admin register error:", error);
    res.status(500).json({
      success: false,
      message: "Super Admin registration failed",
      error: error.message,
    });
  }
};

/**
 * SUPER ADMIN LOGIN
 */
exports.superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Super Admin email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = null;

    if (isMongooseReady()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      const data = resilientStore.readData();
      user = (data.users || []).find((u) => u.email === cleanEmail);
    }

    // Auto-seed default Super Admin if logging in with default credentials and not present
    if (!user && cleanEmail === DEFAULT_SUPERADMIN_EMAIL && password === DEFAULT_SUPERADMIN_PASS) {
      const hashedPassword = await bcrypt.hash(DEFAULT_SUPERADMIN_PASS, 10);
      const defaultUser = {
        name: "Chief Secretary (Civic Oversight)",
        email: DEFAULT_SUPERADMIN_EMAIL,
        password: hashedPassword,
        phone: "+91 94440 00001",
        department: "Apex Municipal Surveillance & Governance",
        role: "superadmin",
        createdAt: new Date(),
      };

      if (isMongooseReady()) {
        try {
          user = await User.create(defaultUser);
        } catch (e) {
          user = await User.findOne({ email: DEFAULT_SUPERADMIN_EMAIL });
        }
      } else {
        defaultUser._id = "sup-root-1";
        const data = resilientStore.readData();
        data.users.push(defaultUser);
        resilientStore.writeData(data);
        user = defaultUser;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Super Admin credentials. Account not found.",
      });
    }

    // STRICT ROLE CHECK: Only 'superadmin' role allowed
    if (user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Regular Citizen and Admin accounts are not authorized to access the Super Admin Apex Module.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password for Super Admin account",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: "superadmin", email: user.email, name: user.name, department: user.department },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Super Admin authentication successful! Welcome to Apex Command Center.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        department: user.department || "Apex Municipal Surveillance & Governance",
        role: "superadmin",
      },
    });
  } catch (error) {
    console.error("Super Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Super Admin login failed",
      error: error.message,
    });
  }
};

/**
 * GET ALL ADMINS / OFFICERS AND COMPUTE PERFORMANCE STATS
 * (Used by Super Admin to track and monitor Admins)
 */
exports.getAdminsList = async (req, res) => {
  try {
    let users = [];
    let complaints = [];

    if (isMongooseReady()) {
      users = await User.find({ role: { $in: ["admin", "government"] } });
      const Complaint = require("../models/Complaint");
      complaints = await Complaint.find();
    } else {
      const data = resilientStore.readData();
      users = (data.users || []).filter((u) => u.role === "admin" || u.role === "government");
      complaints = data.complaints || [];
    }

    // Calculate performance per Admin Officer
    const adminPerformance = users.map((admin) => {
      const officerName = admin.name.toLowerCase();
      const officerDept = (admin.department || "").toLowerCase();

      // Find complaints handled or assigned to this officer / department
      const handled = complaints.filter((c) => {
        const matchesOfficer = (c.assignedOfficer || "").toLowerCase().includes(officerName);
        const matchesDept = (c.department || "").toLowerCase().includes(officerDept);
        return matchesOfficer || matchesDept;
      });

      const total = handled.length;
      const resolved = handled.filter((c) => c.status === "Resolved").length;
      const inProgress = handled.filter((c) => c.status === "In Progress" || c.status === "Under Review").length;
      const pending = handled.filter((c) => c.status === "Pending" || c.status === "Received").length;
      const efficiency = total > 0 ? Math.round((resolved / total) * 100) : 100;

      return {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone || "",
        department: admin.department || "Municipal Administration",
        role: admin.role,
        createdAt: admin.createdAt,
        totalHandled: total,
        completedCount: resolved,
        pendingCount: pending,
        efficiencyRate: efficiency,
        stats: {
          totalHandled: total,
          resolved,
          inProgress,
          pending,
          efficiencyRate: `${efficiency}%`,
          rating: efficiency >= 80 ? "EXCELLENT" : efficiency >= 50 ? "AVERAGE" : "NEEDS_IMPROVEMENT",
        },
      };
    });

    return res.status(200).json({
      success: true,
      count: adminPerformance.length,
      admins: adminPerformance,
    });
  } catch (error) {
    console.error("Error fetching admins list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admins list",
      error: error.message,
    });
  }
};
