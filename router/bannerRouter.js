import crypto from "crypto";
import express from "express";
import multer from "multer";
import path from "path";
import {
  createBanner,
  deleteBanner,
  getBanners,
} from "../controller/bannerController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory for storing files
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomBytes(16).toString("hex")}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Define routes
router.post("/banner", upload.single("bannerPicture"), createBanner);
router.get("/get-all-banner", getBanners);
router.delete("/delete/:bannerId", deleteBanner);

export default router;
