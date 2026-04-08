import express from "express";
import { verifyAccessToken, requireRole } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getAnalytics,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getAllUsers,
  getSystemHealth
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(verifyAccessToken, requireRole("admin"));

router.get("/stats", getDashboardStats);
router.get("/analytics", getAnalytics);
router.get("/pending-doctors", getPendingDoctors);
router.patch("/doctors/:id/approve", approveDoctor);
router.patch("/doctors/:id/reject", rejectDoctor);
router.get("/users", getAllUsers);
router.get("/health", getSystemHealth);

export default router;
