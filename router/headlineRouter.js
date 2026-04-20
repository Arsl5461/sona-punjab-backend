import express from "express";
import multer from "multer";
import {
  createHeadline,
  deleteHeadline,
  getAllHeadlines,
  updateHeadline,
} from "../controller/headlineController.js";

const router = express.Router();

/** Browser "Form Data" is usually multipart/form-data; only run multer then (JSON must stay on express.json). */
const parseMultipartFields = multer().none();
function parseHeadlineBody(req, res, next) {
  const ct = (req.headers["content-type"] || "").toLowerCase();
  if (ct.includes("multipart/form-data")) {
    return parseMultipartFields(req, res, next);
  }
  next();
}

router.post("/create-headline", parseHeadlineBody, createHeadline);
router.get("/get-all-headlines", getAllHeadlines);
router.put("/update-headline/:headlineId", parseHeadlineBody, updateHeadline);
router.delete("/delete-headline/:headlineId", deleteHeadline);

export default router;
