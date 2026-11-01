const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  getStatsOverview,
  liveSarvamTranscribe,
  getAdminActionLogs,
  superAdminOverrideComplaint,
  getSuperAdminAnalytics,
} = require("../controllers/complaintController");

// Upload fields: multiple images, 1 video (20-30s), 1 audio clip (Sarvam AI STT)
const complaintUpload = upload.fields([
  { name: "images", maxCount: 6 },
  { name: "video", maxCount: 1 },
  { name: "audio", maxCount: 1 },
]);

router.post("/", complaintUpload, createComplaint);
router.get("/", getAllComplaints);
router.get("/stats/overview", getStatsOverview);

// Super Admin Endpoints (placed before /:id)
router.get("/superadmin/audit-logs", getAdminActionLogs);
router.get("/superadmin/analytics", getSuperAdminAnalytics);
router.patch("/:id/superadmin-override", superAdminOverrideComplaint);
router.put("/:id/superadmin-override", superAdminOverrideComplaint);

router.get("/:id", getComplaintById);
router.patch("/:id/status", updateComplaintStatus);
router.put("/:id/status", updateComplaintStatus);
router.patch("/:id", updateComplaintStatus);
router.put("/:id", updateComplaintStatus);
router.post("/live-transcribe", upload.single("audio"), liveSarvamTranscribe);

module.exports = router;

