import express from "express";
import { uploadImage } from "../middleware/multerMemory.js";
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

router.post(
  "/tournaments",
  uploadImage.single("tournamentPicture"),
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
  uploadImage.single("tournamentPicture"),
  updateTournament
);
export default router;
