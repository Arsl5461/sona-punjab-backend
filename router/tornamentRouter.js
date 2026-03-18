import crypto from "crypto";
import express from "express";
import multer from "multer";
import path from "path";
import {
  deleteTournament,
  getActiveTournament,
  getAllAllowedTournaments,
  getAllTournaments,
  getAllTournamentsByClub,
  getSingleTournament,
  getTournamentsForCurrentMonth,
  tournamentController,
  updateTournament,
} from "../controller/tournamentController.js";

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
router.post(
  "/tournaments",
  upload.single("tournamentPicture"),
  tournamentController.createTournament
);
router.get("/get-tournaments", getAllTournaments);
router.get("/get-allowed-tournaments/:subadminId", getAllAllowedTournaments);
router.get("/get-single-tournaments/:id", getSingleTournament);
router.get("/get-current-tournement", getTournamentsForCurrentMonth); 
router.get("/get-all-tournament/:clubName", getAllTournamentsByClub);
router.get("/get-active-tournament", getActiveTournament);
router.delete("/delete-tournament/:id", deleteTournament);
router.put(
  "/tournaments/:id",
  upload.single("tournamentPicture"),
  updateTournament
);
export default router;
