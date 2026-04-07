import express from "express";
import { verifyAccessToken, requireApprovedDoctor } from "../middleware/authMiddleware.js";
import {
  issueCertificate,
  getCertificate,
  getMyCertificates,
  downloadCertificatePDF
} from "../controllers/certificateController.js";

const router = express.Router();

// Doctor issues certificate
router.post("/", verifyAccessToken, requireApprovedDoctor, issueCertificate);

// Get single certificate
router.get("/:id", verifyAccessToken, getCertificate);

// Patient: get all my certificates
router.get("/my/all", verifyAccessToken, getMyCertificates);

// Download PDF
router.get("/:id/pdf", verifyAccessToken, downloadCertificatePDF);

export default router;
