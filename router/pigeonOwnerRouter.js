import crypto from "crypto";
import express from "express";
import multer from "multer";
import path from "path";
import {
  createPigeonOwner,
  deletePigeonOwner,
  getPigeonOwner,
  getPigeonOwnerById,
  getSingleOwnerById,
  updatePigeonOwner,
} from "../controller/pigeonOwnerController.js";

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
router.post("/owner", upload.single("ownerPicture"), createPigeonOwner);
router.get("/get-all-owner", getPigeonOwner);
router.get("/get-all-owner/:adminId", getPigeonOwnerById);
router.get("/single-owner/:ownerId", getSingleOwnerById);
router.put(
  "/update-owner/:ownerId",
  upload.single("ownerPicture"),
  updatePigeonOwner
);
router.delete("/delete-owner/:ownerId", deletePigeonOwner);

export default router;
