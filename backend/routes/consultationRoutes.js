import express from "express";
import { verifyAccessToken, requireApprovedDoctor } from "../middleware/authMiddleware.js";
import {
  startConsultation,
  updateConsultation,
  completeConsultation,
  getConsultation,
  getPatientHistory,
  getMyHistory,
  getDoctorStats
} from "../controllers/consultationController.js";

const router = express.Router();

// Doctor endpoints
router.post("/", verifyAccessToken, requireApprovedDoctor, startConsultation);
router.put("/:id", verifyAccessToken, requireApprovedDoctor, updateConsultation);
router.patch("/:id/complete", verifyAccessToken, requireApprovedDoctor, completeConsultation);
router.get("/doctor-stats", verifyAccessToken, requireApprovedDoctor, getDoctorStats);

// Shared endpoints
router.get("/appointment/:appointmentId", verifyAccessToken, getConsultation);
router.get("/patient/:patientId/history", verifyAccessToken, getPatientHistory);

// Patient endpoint
router.get("/my-history", verifyAccessToken, getMyHistory);

export default router;
