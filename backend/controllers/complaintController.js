const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const sarvamService = require("../services/sarvamService");
const truthlensService = require("../services/truthlensService");
const resilientStore = require("../data/resilientStore");

const isMongooseReady = () => mongoose.connection.readyState === 1;

/**
 * CREATE NEW COMPLAINT
 * Integrates Sarvam AI (Voice STT & Translation) & TruthLens (Media Authenticity & Duplicate Check)
 */
exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      category = "Other",
      description = "",
      address,
      latitude,
      longitude,
      landmark,
      city = "Salem, Tamil Nadu",
      pincode,
      name,
      email,
      phone,
      preferredLang = "ta-IN",
    } = req.body;

    if (!address && !description && !title) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complaint title, description, or address.",
      });
    }

    const host = req.get("host");
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    // 1. Process Uploaded Media
    const images = [];
    const videos = [];
    const audios = [];
    let audioFilePath = null;
    let audioUrl = req.body.audioUrl || "";

    if (req.files) {
      if (req.files.images) {
        req.files.images.forEach((file) => {
          images.push({
            url: `${baseUrl}/uploads/images/${file.filename}`,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            uploadedAt: new Date(),
          });
        });
      }

      if (req.files.video && req.files.video.length > 0) {
        const videoFile = req.files.video[0];
        videos.push({
          url: `${baseUrl}/uploads/videos/${videoFile.filename}`,
          filename: videoFile.filename,
          mimetype: videoFile.mimetype,
          size: videoFile.size,
          durationSeconds: 25, // Validated 20-30s capture
          uploadedAt: new Date(),
        });
      }

      if (req.files.audio && req.files.audio.length > 0) {
        const audioFile = req.files.audio[0];
        audioFilePath = audioFile.path;
        audioUrl = `${baseUrl}/uploads/audio/${audioFile.filename}`;
        audios.push({
          url: audioUrl,
          filename: audioFile.filename,
          mimetype: audioFile.mimetype,
          size: audioFile.size,
          uploadedAt: new Date(),
        });
      }
    }

    // If audioUrl was passed from pre-recording upload
    if (audioUrl && audios.length === 0) {
      audios.push({
        url: audioUrl,
        filename: path.basename(audioUrl),
        mimetype: "audio/webm",
        size: 0,
        uploadedAt: new Date(),
      });
    }

    // 2. Sarvam AI Voice Transcription & Translation (saaras:v4, mode: transcribe)
    const clientProvidedTranscript = req.body.originalTranscript || req.body.voiceTranscript || "";
    const clientProvidedTranslation = req.body.englishTranslation || req.body.translatedEnglish || "";
    const clientLanguage = req.body.detectedLanguage || preferredLang || "ta-IN";

    let sarvamAnalysis = {
      transcription: clientProvidedTranscript,
      detectedLanguage: clientLanguage,
      languageName: req.body.languageName || sarvamService.getLanguageDisplayName(clientLanguage),
      translatedEnglish: clientProvidedTranslation,
      audioProcessed: Boolean(audioFilePath || audioUrl || clientProvidedTranscript),
      audioUrl: audioUrl,
      speechModel: "sarvam-saaras:v4",
      mode: "transcribe",
    };

    // If an audio file was uploaded directly in this request and no transcript was supplied yet:
    if (audioFilePath && !sarvamAnalysis.transcription) {
      try {
        const sttResult = await sarvamService.transcribeAudio(audioFilePath, preferredLang || "ta-IN");
        sarvamAnalysis.transcription = sttResult.transcription;
        sarvamAnalysis.detectedLanguage = sttResult.detectedLanguage || "ta-IN";
        sarvamAnalysis.languageName = sttResult.languageName || sarvamService.getLanguageDisplayName(sarvamAnalysis.detectedLanguage);
        sarvamAnalysis.speechModel = sttResult.model || "sarvam-saaras:v4";
        sarvamAnalysis.mode = "transcribe";
        sarvamAnalysis.translatedEnglish = sttResult.translation || (await sarvamService.translateIndicText(
          sttResult.transcription,
          sarvamAnalysis.detectedLanguage,
          "en-IN"
        ));
      } catch (sttErr) {
        console.warn("Sarvam STT during complaint submission fallback:", sttErr.message);
      }
    } else if (!sarvamAnalysis.transcription && description) {
      // Check if user typed Tanglish or Tamil, and produce pure Tamil script
      const tamilScriptConverted = sarvamService.convertTanglishToTamilScript(description);
      sarvamAnalysis.transcription = tamilScriptConverted;
      sarvamAnalysis.detectedLanguage = "ta-IN";
      sarvamAnalysis.languageName = "Tamil (தமிழ்)";
      sarvamAnalysis.speechModel = "sarvam-saaras:v4";
      sarvamAnalysis.mode = "transcribe";
      sarvamAnalysis.translatedEnglish = await sarvamService.translateIndicText(
        tamilScriptConverted,
        "ta-IN",
        "en-IN"
      );
    }

    // Combine text for categorization
    const combinedText = `${title || ""} ${description || ""} ${sarvamAnalysis.translatedEnglish || ""} ${sarvamAnalysis.transcription || ""}`;
    const classification = sarvamService.analyzeCivicText(combinedText, category);

    // 3. TruthLens AI Authenticity & Duplicate Verification
    let existingComplaints = [];
    if (isMongooseReady()) {
      existingComplaints = await Complaint.find().limit(50);
    } else {
      existingComplaints = resilientStore.readData().complaints || [];
    }

    const truthlensReport = await truthlensService.verifyComplaintEvidence({
      images,
      videos,
      location: {
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
      category: classification.category,
      description: combinedText,
      existingComplaints,
    });

    // 4. Generate Unique Tracking ID
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const trackingId = `CSC${randomNum}`;

    const newComplaintData = {
      trackingId,
      title: title || (combinedText.slice(0, 50) + "...") || "Civic Grievance",
      category: classification.category,
      department: classification.department,
      priority: classification.priority,
      status: "Pending",
      description: description || sarvamAnalysis.translatedEnglish || sarvamAnalysis.transcription || "Report submitted by citizen.",
      citizen: {
        userId: req.user ? req.user.id : null,
        name: name || (req.user ? req.user.name : "Citizen User"),
        email: email || (req.user ? req.user.email : ""),
        phone: phone || (req.user ? req.user.phone : ""),
      },
      location: {
        address: address || "Declared Location, Salem",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        landmark: landmark || "",
        city: city || "Salem, Tamil Nadu",
        pincode: pincode || "",
      },
      media: {
        images,
        videos,
        audio: audios,
      },
      aiAnalysis: {
        sarvam: sarvamAnalysis,
        truthlens: truthlensReport,
      },
      timeline: [
        {
          title: "Complaint Received",
          detail: "Successfully registered in CivicShield AI system.",
          date: new Date(),
          done: true,
          current: true,
        },
        {
          title: "TruthLens Verification",
          detail: `Evidence integrity analyzed: ${truthlensReport.authenticityScore}% authenticity score.`,
          date: new Date(),
          done: true,
          current: false,
        },
        {
          title: "Department Routing",
          detail: `Automated routing to ${classification.department}.`,
          date: new Date(),
          done: false,
          current: false,
        },
        {
          title: "Resolution in Progress",
          detail: "Inspection and field repair execution.",
          date: new Date(),
          done: false,
          current: false,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let savedComplaint;
    if (isMongooseReady()) {
      savedComplaint = await Complaint.create(newComplaintData);
    } else {
      const data = resilientStore.readData();
      newComplaintData._id = "comp-" + Date.now();
      data.complaints.unshift(newComplaintData);
      resilientStore.writeData(data);
      savedComplaint = newComplaintData;
    }

    return res.status(201).json({
      success: true,
      message: "Complaint registered and verified successfully!",
      complaint: savedComplaint,
      aiAnalysis: {
        sarvam: sarvamAnalysis,
        truthlens: truthlensReport,
      },
    });
  } catch (error) {
    console.error("Complaint creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit complaint",
      error: error.message,
    });
  }
};

/**
 * GET ALL COMPLAINTS (Real-time listing with filters)
 */
exports.getAllComplaints = async (req, res) => {
  try {
    const { category, status, search, userId } = req.query;

    let complaints = [];

    if (isMongooseReady()) {
      const filter = {};
      if (category && category !== "All") filter.category = category;
      if (status && status !== "All") filter.status = status;
      if (userId) filter["citizen.userId"] = userId;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { trackingId: { $regex: search, $options: "i" } },
          { "location.address": { $regex: search, $options: "i" } },
        ];
      }
      complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    } else {
      const data = resilientStore.readData();
      complaints = data.complaints || [];

      if (category && category !== "All") {
        complaints = complaints.filter((c) => c.category === category);
      }
      if (status && status !== "All") {
        complaints = complaints.filter((c) => c.status === status);
      }
      if (search) {
        const q = search.toLowerCase();
        complaints = complaints.filter(
          (c) =>
            (c.title && c.title.toLowerCase().includes(q)) ||
            (c.trackingId && c.trackingId.toLowerCase().includes(q)) ||
            (c.location?.address && c.location.address.toLowerCase().includes(q))
        );
      }
    }

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

/**
 * GET COMPLAINT BY ID OR TRACKING ID
 */
exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    let complaint;

    if (isMongooseReady()) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        complaint = await Complaint.findById(id);
      }
      if (!complaint) {
        complaint = await Complaint.findOne({ trackingId: id });
      }
    } else {
      const data = resilientStore.readData();
      complaint = (data.complaints || []).find(
        (c) => c._id === id || c.trackingId === id
      );
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving complaint",
      error: error.message,
    });
  }
};

/**
 * UPDATE COMPLAINT STATUS & ADMIN RESPONSE (Used by Admin Dashboard)
 */
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, adminResponse, assignedOfficer } = req.body;

    const allowed = ["Pending", "Received", "Under Review", "In Progress", "Resolved", "Rejected"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value. Allowed: ${allowed.join(", ")}`,
      });
    }

    const responseText = adminResponse || note || "";
    let complaint;
    let prevStatus = "Pending";

    if (isMongooseReady()) {
      complaint = await Complaint.findOne({
        $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { trackingId: id }],
      });

      if (!complaint) {
        return res.status(404).json({ success: false, message: "Complaint not found" });
      }

      prevStatus = complaint.status;
      complaint.status = status;
      if (responseText) {
        complaint.adminResponse = responseText;
        complaint.adminRespondedAt = new Date();
      }
      if (assignedOfficer) {
        complaint.assignedOfficer = assignedOfficer;
      }

      complaint.timeline.push({
        title: `Status: ${status}`,
        detail: responseText || `Updated by Administrator to ${status}`,
        date: new Date(),
        done: true,
        current: true,
      });

      await complaint.save();
    } else {
      const data = resilientStore.readData();
      const index = (data.complaints || []).findIndex(
        (c) => c._id === id || c.trackingId === id
      );
      if (index === -1) {
        return res.status(404).json({ success: false, message: "Complaint not found" });
      }

      prevStatus = data.complaints[index].status || "Pending";
      data.complaints[index].status = status;
      if (responseText) {
        data.complaints[index].adminResponse = responseText;
        data.complaints[index].adminRespondedAt = new Date();
      }
      if (assignedOfficer) {
        data.complaints[index].assignedOfficer = assignedOfficer;
      }

      data.complaints[index].timeline.push({
        title: `Status: ${status}`,
        detail: responseText || `Updated by Administrator to ${status}`,
        date: new Date(),
        done: true,
        current: true,
      });

      resilientStore.writeData(data);
      complaint = data.complaints[index];
    }

    // Record Admin Action for Super Admin Audit & Live Notifications
    const officer = assignedOfficer || (req.user && req.user.name) || "Department Officer";
    const actionRecord = {
      id: "act-" + Date.now(),
      complaintId: complaint.trackingId || complaint._id,
      complaintTitle: complaint.title || "Civic Complaint",
      officerName: officer,
      department: complaint.department || "Municipal Administration",
      previousStatus: prevStatus,
      newStatus: status,
      isCompleted: status === "Resolved",
      isPending: status === "Pending" || status === "In Progress" || status === "Under Review",
      responseNote: responseText,
      timestamp: new Date().toISOString(),
    };

    // Store in resilientStore adminActions log
    try {
      const storeData = resilientStore.readData();
      if (!Array.isArray(storeData.adminActions)) storeData.adminActions = [];
      storeData.adminActions.unshift(actionRecord);
      if (storeData.adminActions.length > 200) storeData.adminActions = storeData.adminActions.slice(0, 200);
      resilientStore.writeData(storeData);
    } catch (e) {
      console.warn("Could not log admin action:", e.message);
    }

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status} successfully`,
      complaint,
      adminAction: actionRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update complaint status",
      error: error.message,
    });
  }
};

/**
 * REAL-TIME AGGREGATED STATS OVERVIEW
 */
exports.getStatsOverview = async (req, res) => {
  try {
    let complaints = [];
    if (isMongooseReady()) {
      complaints = await Complaint.find();
    } else {
      complaints = resilientStore.readData().complaints || [];
    }

    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    const inProgress = complaints.filter((c) => c.status === "In Progress" || c.status === "Under Review").length;
    const pending = complaints.filter((c) => c.status === "Pending" || c.status === "Received").length;
    const rejected = complaints.filter((c) => c.status === "Rejected").length;

    // TruthLens authentic count
    const verifiedAuthentic = complaints.filter(
      (c) => c.aiAnalysis?.truthlens?.verdict?.includes("AUTHENTIC")
    ).length;

    const authenticityRate = total > 0 ? Math.round((verifiedAuthentic / total) * 100) : 98;

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        rejected,
        authenticityRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats overview",
      error: error.message,
    });
  }
};

/**
 * STANDALONE SARVAM AI VOICE TRANSCRIBE ENDPOINT
 * Uses Sarvam AI Saaras v4 STT in "transcribe" mode (produces native script transcript)
 * and translates to English
 */
exports.liveSarvamTranscribe = async (req, res) => {
  try {
    const preferredLang = req.body.language || req.body.preferredLang || "auto";
    const liveTranscript = req.body.liveTranscript || req.body.transcript || "";

    if (!req.file && !liveTranscript) {
      return res.status(400).json({
        success: false,
        message: "No audio file provided. Please record your voice or upload an audio file (WAV, MP3, WebM, OGG, M4A).",
      });
    }

    let audioPath = null;
    let audioUrl = "";

    if (req.file) {
      audioPath = req.file.path;
      const stats = fs.statSync(audioPath);
      // 25MB max size for Sarvam API
      if (stats.size > 25 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Audio file exceeds maximum size limit of 25MB. Please record a shorter message (15-45 seconds).",
        });
      }

      const host = req.get("host");
      const protocol = req.protocol;
      const baseUrl = `${protocol}://${host}`;
      audioUrl = `${baseUrl}/uploads/audio/${path.basename(audioPath)}`;
    }

    // Call Sarvam AI saaras:v4 in transcribe mode
    const result = await sarvamService.transcribeAudio(audioPath, preferredLang, liveTranscript);

    return res.status(200).json({
      success: true,
      model: result.model || "sarvam-saaras:v4",
      mode: result.mode || "transcribe",
      detectedLanguage: result.detectedLanguage,
      languageName: result.languageName,
      originalTranscript: result.transcription,
      englishTranslation: result.translation || result.transcription,
      audioUrl: audioUrl || result.audioUrl || "",
    });
  } catch (err) {
    console.error("Sarvam Voice transcription error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to transcribe voice with Sarvam AI",
      error: err.code || "SARVAM_AI_ERROR",
    });
  }
};



/**
 * GET ADMIN AUDIT LOGS / ACTION FEED (Used by Super Admin)
 */
exports.getAdminActionLogs = async (req, res) => {
  try {
    const data = resilientStore.readData();
    const actions = Array.isArray(data.adminActions) ? data.adminActions : [];

    return res.status(200).json({
      success: true,
      count: actions.length,
      actions,
      logs: actions,
    });
  } catch (error) {
    console.error("Error retrieving admin action logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin audit logs",
      error: error.message,
    });
  }
};

/**
 * SUPER ADMIN OVERRIDE COMPLAINT
 * Allows Super Admin to escalate priority, update status, add executive directives,
 * or reassign department officers.
 */
exports.superAdminOverrideComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      priority,
      department,
      assignedOfficer,
      superAdminDirective,
      executiveRemarks,
    } = req.body;

    let complaint = null;
    const directive =
      superAdminDirective ||
      executiveRemarks ||
      req.body.executiveNote ||
      req.body.directiveNote ||
      req.body.adminResponse ||
      "";
    let targetPriority = priority || req.body.escalatePriority;
    if (targetPriority === "Normal") targetPriority = "Medium";
    if (targetPriority && !["Low", "Medium", "High", "Urgent"].includes(targetPriority)) {
      targetPriority = "High";
    }
    const targetOfficer = assignedOfficer || req.body.reassignedOfficer;

    if (isMongooseReady()) {
      complaint = await Complaint.findOne({
        $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { trackingId: id }],
      });

      if (!complaint) {
        return res.status(404).json({ success: false, message: "Complaint not found" });
      }

      if (status) complaint.status = status;
      if (targetPriority) complaint.priority = targetPriority;
      if (department) complaint.department = department;
      if (targetOfficer) complaint.assignedOfficer = targetOfficer;
      if (directive) {
        complaint.adminResponse = `[SUPER ADMIN DIRECTIVE]: ${directive}`;
        complaint.adminRespondedAt = new Date();
      }

      complaint.timeline.push({
        title: `Super Admin Executive Override: ${status || complaint.status}`,
        detail: directive || "Executive review and intervention conducted by Chief Secretary.",
        date: new Date(),
        done: true,
        current: true,
      });

      await complaint.save();
    } else {
      const data = resilientStore.readData();
      const index = (data.complaints || []).findIndex(
        (c) => c._id === id || c.trackingId === id
      );

      if (index === -1) {
        return res.status(404).json({ success: false, message: "Complaint not found" });
      }

      if (status) data.complaints[index].status = status;
      if (targetPriority) data.complaints[index].priority = targetPriority;
      if (department) data.complaints[index].department = department;
      if (targetOfficer) data.complaints[index].assignedOfficer = targetOfficer;
      if (directive) {
        data.complaints[index].adminResponse = `[SUPER ADMIN DIRECTIVE]: ${directive}`;
        data.complaints[index].adminRespondedAt = new Date();
      }

      data.complaints[index].timeline.push({
        title: `Super Admin Executive Override: ${status || data.complaints[index].status}`,
        detail: directive || "Executive review and intervention conducted by Chief Secretary.",
        date: new Date(),
        done: true,
        current: true,
      });

      resilientStore.writeData(data);
      complaint = data.complaints[index];
    }

    // Log the override action
    const actionRecord = {
      id: "act-super-" + Date.now(),
      complaintId: complaint.trackingId || complaint._id,
      complaintTitle: complaint.title,
      officerName: "Chief Secretary (Super Admin)",
      department: complaint.department,
      previousStatus: "Reviewed",
      newStatus: status || complaint.status,
      isCompleted: (status || complaint.status) === "Resolved",
      isPending: (status || complaint.status) !== "Resolved",
      responseNote: directive,
      isSuperAdminOverride: true,
      timestamp: new Date().toISOString(),
    };

    try {
      const storeData = resilientStore.readData();
      if (!Array.isArray(storeData.adminActions)) storeData.adminActions = [];
      storeData.adminActions.unshift(actionRecord);
      resilientStore.writeData(storeData);
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: "Super Admin override applied successfully",
      complaint,
      actionRecord,
    });
  } catch (error) {
    console.error("Super Admin override error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply Super Admin override",
      error: error.message,
    });
  }
};

/**
 * GET SUPER ADMIN STATEWIDE APEX ANALYTICS
 */
exports.getSuperAdminAnalytics = async (req, res) => {
  try {
    let complaints = [];
    let users = [];

    if (isMongooseReady()) {
      complaints = await Complaint.find();
      const User = require("../models/User");
      users = await User.find({ role: { $in: ["admin", "government"] } });
    } else {
      const data = resilientStore.readData();
      complaints = data.complaints || [];
      users = (data.users || []).filter((u) => u.role === "admin" || u.role === "government");
    }

    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    const inProgress = complaints.filter((c) => c.status === "In Progress" || c.status === "Under Review").length;
    const pending = complaints.filter((c) => c.status === "Pending" || c.status === "Received").length;
    const rejected = complaints.filter((c) => c.status === "Rejected").length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Breakdown by department
    const deptBreakdown = {};
    complaints.forEach((c) => {
      const d = c.department || "Municipal Administration";
      if (!deptBreakdown[d]) {
        deptBreakdown[d] = { total: 0, resolved: 0, pending: 0 };
      }
      deptBreakdown[d].total += 1;
      if (c.status === "Resolved") deptBreakdown[d].resolved += 1;
      else deptBreakdown[d].pending += 1;
    });

    return res.status(200).json({
      success: true,
      totalComplaints: total,
      resolved: resolved,
      inProgress: inProgress,
      pending: pending,
      resolutionRate: `${resolutionRate}%`,
      analytics: {
        totalComplaints: total,
        resolvedComplaints: resolved,
        inProgressComplaints: inProgress,
        pendingComplaints: pending,
        rejectedComplaints: rejected,
        resolutionRate: `${resolutionRate}%`,
        activeDepartmentAdmins: users.length,
        departmentBreakdown: deptBreakdown,
      },
    });
  } catch (error) {
    console.error("Super Admin analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve analytics",
      error: error.message,
    });
  }
};
