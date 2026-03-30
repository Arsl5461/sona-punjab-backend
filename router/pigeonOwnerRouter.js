import express from "express";
import { uploadImage } from "../middleware/multerMemory.js";
import {
  createPigeonOwner,
  deletePigeonOwner,
  getPigeonOwner,
  getPigeonOwnerById,
  getSingleOwnerById,
  updatePigeonOwner,
} from "../controller/pigeonOwnerController.js";

const router = express.Router();

router.post("/owner", uploadImage.single("ownerPicture"), createPigeonOwner);
router.get("/get-all-owner", getPigeonOwner);
router.get("/get-all-owner/:adminId", getPigeonOwnerById);
router.get("/single-owner/:ownerId", getSingleOwnerById);
router.put(
  "/update-owner/:ownerId",
  uploadImage.single("ownerPicture"),
  updatePigeonOwner
);
router.delete("/delete-owner/:ownerId", deletePigeonOwner);

export default router;
