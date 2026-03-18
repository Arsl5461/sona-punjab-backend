import express from "express";
import {
  createClub,
  getAllClubs,
  deleteClub,
  updateClub,
} from "../controller/clubController.js";
const router = express.Router();

router.post("/create-club", createClub);
router.get("/get-all-clubs", getAllClubs);
router.put("/update-club/:clubId", updateClub);
router.delete("/delete-club/:clubId", deleteClub);

export default router;
