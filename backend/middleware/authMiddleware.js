const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "civicshield_secret_key_2026";

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verify error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      details: error.message,
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this operation",
      });
    }
    next();
  };
};

module.exports = { protect, authorize, JWT_SECRET };
