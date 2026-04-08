import express from "express";
import { verifyAccessToken, requireApprovedDoctor } from "../middleware/authMiddleware.js";
import {
  createPrescription,
  getPrescription,
  getMyPrescriptions,
  downloadPrescriptionPDF
} from "../controllers/prescriptionController.js";

const router = express.Router();

// Doctor creates prescription
router.post("/", verifyAccessToken, requireApprovedDoctor, createPrescription);

// Get single prescription
router.get("/:id", verifyAccessToken, getPrescription);

// Patient: get all my prescriptions
router.get("/my/all", verifyAccessToken, getMyPrescriptions);

// Download PDF
router.get("/:id/pdf", verifyAccessToken, downloadPrescriptionPDF);

export default router;
