import express from "express";
import {
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  logout,
} from "../controllers/authController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/profile", verifyAccessToken, getProfile);
router.put("/profile", verifyAccessToken, updateProfile);
router.post("/logout", logout);

export default router;
