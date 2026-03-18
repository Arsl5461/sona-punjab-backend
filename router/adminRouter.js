import express from "express";
import {
  deleteAdmin,
  getAllAdmins,
  loginAdmin,
  registerAdmin,
  updateAdmin,
} from "../controller/adminController.js";

const router = express.Router();

router.put("/update-admin/:id", updateAdmin);
router.get("/all-admin", getAllAdmins);
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.delete("/delete-admin/:id", deleteAdmin);

export default router;
