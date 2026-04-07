import express from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { 
    getDoctors, 
    getAvailableSlots, 
    bookAppointment, 
    getMyAppointments,
    updateAppointmentStatus,
    getTodayAppointments
} from "../controllers/appointmentController.js";

const router = express.Router();

router.get("/doctors", verifyAccessToken, getDoctors);
router.get("/available-slots", verifyAccessToken, getAvailableSlots);
router.post("/book", verifyAccessToken, bookAppointment);
router.get("/my-appointments", verifyAccessToken, getMyAppointments);
router.patch("/:id/status", verifyAccessToken, updateAppointmentStatus);
router.get("/today", verifyAccessToken, getTodayAppointments);

export default router;
