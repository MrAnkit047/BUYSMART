import path from "path";
import express from "express";
import multer from "multer";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileTypes(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Images only! Supported formats: jpg, jpeg, png, webp, gif, svg"));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileTypes(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post("/", protect, admin, upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image file provided");
  }
  const imagePath = `/uploads/${req.file.filename}`;
  res.status(200).json({
    message: "Image uploaded successfully",
    image: imagePath,
  });
});

export default router;
