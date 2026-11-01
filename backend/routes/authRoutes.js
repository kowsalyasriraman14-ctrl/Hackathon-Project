const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  adminRegister,
  adminLogin,
  superAdminRegister,
  superAdminLogin,
  getAdminsList,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Citizen Auth
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

// Admin Auth
router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);
router.get("/admin/me", protect, authorize("admin", "government", "superadmin"), getMe);

// Super Admin Auth & Executive Oversight
router.post("/superadmin/register", superAdminRegister);
router.post("/superadmin/login", superAdminLogin);
router.get("/superadmin/me", protect, authorize("superadmin"), getMe);
router.get("/superadmin/admins", protect, authorize("superadmin"), getAdminsList);

module.exports = router;
