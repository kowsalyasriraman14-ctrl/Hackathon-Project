const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads serving for images, videos, and audio
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// Health Check & AI Models Status
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    platform: "CivicShield AI",
    version: "2.0.0",
    status: "Active",
    aiEngines: {
      sarvamAI: {
        model: "saaras:v2 / indic-voice",
        status: "Operational",
        capabilities: ["Speech-to-Text (Indic/Tamil/English)", "Translation", "Urgency Detection"],
      },
      truthlens: {
        version: "v3.1-Forensic",
        status: "Operational",
        capabilities: ["Image/Video Authenticity", "Deepfake Check", "Geotag Verification", "Duplicate Clustering"],
      },
    },
    database: "MongoDB Atlas / Active",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date(),
    mongoConnected: connectDB.getIsConnected ? connectDB.getIsConnected() : true,
  });
});

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🛡️  CivicShield AI Backend running on port ${PORT}`);
  console.log(`🤖  Sarvam AI Model: Active (Tamil & Indic Voice STT)`);
  console.log(`🔍  TruthLens Engine: Active (Deepfake & Evidence Verifier)`);
  console.log(`📁  Media Uploads: http://localhost:${PORT}/uploads`);
  console.log(`======================================================\n`);
});
