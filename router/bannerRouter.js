import express from "express";
import { uploadImage } from "../middleware/multerMemory.js";
import {
  createBanner,
  deleteBanner,
  getBanners,
} from "../controller/bannerController.js";

const router = express.Router();

router.post("/banner", uploadImage.single("bannerPicture"), createBanner);
router.get("/get-all-banner", getBanners);
router.delete("/delete/:bannerId", deleteBanner);

export default router;
