const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Roads & Transport",
        "Water Supply",
        "Electricity",
        "Sanitation & Waste",
        "Public Safety",
        "Drainage & Sewage",
        "Public Health",
        "Municipal Services",
        "Other",
      ],
      default: "Other",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: "Municipal Administration",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "Received", "Under Review", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
      index: true,
    },
    adminResponse: {
      type: String,
      default: "",
    },
    adminRespondedAt: {
      type: Date,
      default: null,
    },
    assignedOfficer: {
      type: String,
      default: "",
    },
    citizen: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      name: { type: String, default: "Anonymous Citizen" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      landmark: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "Salem, Tamil Nadu",
      },
      pincode: {
        type: String,
        default: "",
      },
    },
    media: {
      images: [
        {
          url: { type: String, required: true },
          filename: { type: String, default: "" },
          mimetype: { type: String, default: "image/jpeg" },
          size: { type: Number, default: 0 },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      videos: [
        {
          url: { type: String, required: true },
          filename: { type: String, default: "" },
          mimetype: { type: String, default: "video/mp4" },
          size: { type: Number, default: 0 },
          durationSeconds: { type: Number, default: 25 },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      audio: [
        {
          url: { type: String, default: "" },
          filename: { type: String, default: "" },
          mimetype: { type: String, default: "audio/webm" },
          size: { type: Number, default: 0 },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },
    aiAnalysis: {
      sarvam: {
        transcription: { type: String, default: "" },
        detectedLanguage: { type: String, default: "ta-IN" },
        languageName: { type: String, default: "Tamil (தமிழ்)" },
        translatedEnglish: { type: String, default: "" },
        audioProcessed: { type: Boolean, default: false },
        audioUrl: { type: String, default: "" },
        speechModel: { type: String, default: "sarvam-saaras:v4" },
        mode: { type: String, default: "transcribe" },
      },
      truthlens: {
        authenticityScore: { type: Number, default: 94 },
        verdict: {
          type: String,
          enum: [
            "AUTHENTIC",
            "VERIFIED_AUTHENTIC",
            "SUSPICIOUS",
            "FLAGGED_MANIPULATION",
            "DUPLICATE",
            "UNVERIFIED_TEXT_ONLY",
          ],
          default: "VERIFIED_AUTHENTIC",
        },
        aiGeneratedProbability: { type: Number, default: 0.04 },
        isManipulated: { type: Boolean, default: false },
        locationConsistencyScore: { type: Number, default: 92 },
        duplicateDetected: { type: Boolean, default: false },
        duplicateOf: { type: String, default: null },
        analysisSummary: { type: String, default: "Evidence verified authentic." },
        verifiedAt: { type: Date, default: Date.now },
      },
    },
    timeline: [
      {
        title: { type: String, required: true },
        detail: { type: String, default: "" },
        date: { type: Date, default: Date.now },
        done: { type: Boolean, default: false },
        current: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);

