const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "../uploads");
const imagesDir = path.join(uploadsDir, "images");
const videosDir = path.join(uploadsDir, "videos");
const audioDir = path.join(uploadsDir, "audio");

// Ensure directories exist
[uploadsDir, imagesDir, videosDir, audioDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, imagesDir);
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, videosDir);
    } else if (file.mimetype.startsWith("audio/")) {
      cb(null, audioDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let ext = path.extname(file.originalname) || "";
    if (!ext) {
      if (file.mimetype === "audio/webm") ext = ".webm";
      else if (file.mimetype === "audio/wav") ext = ".wav";
      else if (file.mimetype === "audio/mpeg" || file.mimetype === "audio/mp3") ext = ".mp3";
      else if (file.mimetype === "audio/ogg") ext = ".ogg";
      else if (file.mimetype === "audio/m4a" || file.mimetype === "audio/x-m4a" || file.mimetype === "audio/mp4") ext = ".m4a";
      else if (file.mimetype.startsWith("audio/")) ext = ".wav";
      else if (file.mimetype.startsWith("image/")) ext = ".jpg";
      else if (file.mimetype.startsWith("video/")) ext = ".mp4";
    }
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
    "audio/wav",
    "audio/webm",
    "audio/mpeg",
    "audio/mp3",
    "audio/ogg",
  ];

  if (allowed.includes(file.mimetype) || file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/") || file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60MB limit (plenty for 20-30s videos and high-res photos)
  },
});

module.exports = upload;

