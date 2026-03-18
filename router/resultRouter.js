import express from "express";
import {
  createTournamentResult,
  getTournamentOwnerResults,
  getTournamentResultById,
  getTournamentResults,
  owner,
} from "../controller/resultsController.js";

const router = express.Router();

router.post("/results", createTournamentResult);
router.get("/tournament-results/:tournamentId/:date", getTournamentResults);
router.get("/tournament-single-results/:id", getTournamentResultById);
router.get("/tournament/:tournamentId/owners", owner);
router.get(
  "/tournament/:tournamentId/results",
  getTournamentOwnerResults
);
// router.get('/tournament/:tournamentId/results', getTournamentOwnerResults);

export default router;
