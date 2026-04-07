import { prisma } from "../config/db.js";

// Doctor starts a consultation for an appointment
export const startConsultation = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { appointmentId, diagnosis, symptoms, notes, vitalBP, vitalTemp, vitalPulse, vitalWeight, treatmentPlan } = req.body;

    if (!appointmentId || !diagnosis) {
      return res.status(400).json({ message: "appointmentId and diagnosis are required" });
    }

    // Verify appointment belongs to this doctor
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.doctorId !== doctorId) return res.status(403).json({ message: "Not authorized" });

    // Check if consultation already exists
    const existing = await prisma.consultation.findUnique({ where: { appointmentId } });
    if (existing) {
      return res.status(409).json({ message: "Consultation already exists for this appointment", consultation: existing });
    }

    const consultation = await prisma.consultation.create({
      data: {
        appointmentId,
        doctorId,
        patientId: appointment.patientId,
        diagnosis,
        symptoms: symptoms || null,
        notes: notes || null,
        vitalBP: vitalBP || null,
        vitalTemp: vitalTemp || null,
        vitalPulse: vitalPulse || null,
        vitalWeight: vitalWeight || null,
        treatmentPlan: treatmentPlan || null,
      }
    });

    // Update appointment status to in_progress
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "in_progress" }
    });

    res.status(201).json({ message: "Consultation started", consultation });
  } catch (error) {
    console.error("Error starting consultation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update an existing consultation
export const updateConsultation = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;
    const { diagnosis, symptoms, notes, vitalBP, vitalTemp, vitalPulse, vitalWeight, treatmentPlan } = req.body;

    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) return res.status(404).json({ message: "Consultation not found" });
    if (consultation.doctorId !== doctorId) return res.status(403).json({ message: "Not authorized" });

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        diagnosis: diagnosis !== undefined ? diagnosis : undefined,
        symptoms: symptoms !== undefined ? symptoms : undefined,
        notes: notes !== undefined ? notes : undefined,
        vitalBP: vitalBP !== undefined ? vitalBP : undefined,
        vitalTemp: vitalTemp !== undefined ? vitalTemp : undefined,
        vitalPulse: vitalPulse !== undefined ? vitalPulse : undefined,
        vitalWeight: vitalWeight !== undefined ? vitalWeight : undefined,
        treatmentPlan: treatmentPlan !== undefined ? treatmentPlan : undefined,
      }
    });

    res.status(200).json({ message: "Consultation updated", consultation: updated });
  } catch (error) {
    console.error("Error updating consultation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Complete consultation and mark appointment as completed
export const completeConsultation = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;

    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) return res.status(404).json({ message: "Consultation not found" });
    if (consultation.doctorId !== doctorId) return res.status(403).json({ message: "Not authorized" });

    await prisma.appointment.update({
      where: { id: consultation.appointmentId },
      data: { status: "completed" }
    });

    res.status(200).json({ message: "Consultation completed" });
  } catch (error) {
    console.error("Error completing consultation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get consultation by appointment ID
export const getConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const consultation = await prisma.consultation.findUnique({
      where: { appointmentId },
      include: {
        doctor: { select: { id: true, firstName: true, lastName: true, specialization: true, qualification: true } },
        patient: { select: { id: true, firstName: true, lastName: true, gender: true, bloodGroup: true, phone: true } },
        prescriptions: true,
        certificates: true,
        appointment: { select: { appointmentDate: true, startTime: true, tokenNumber: true } }
      }
    });

    if (!consultation) return res.status(404).json({ message: "Consultation not found" });

    // Only the doctor or patient of this consultation can view it
    if (consultation.doctorId !== userId && consultation.patientId !== userId) {
      // Also allow admin
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    res.status(200).json({ consultation });
  } catch (error) {
    console.error("Error fetching consultation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get full patient history (all consultations)
export const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;

    // Verify access: patient can view own, doctor can view any, admin can view any
    const requestingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (requestingUser.role === "patient" && userId !== patientId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const consultations = await prisma.consultation.findMany({
      where: { patientId },
      include: {
        doctor: { select: { firstName: true, lastName: true, specialization: true } },
        prescriptions: true,
        certificates: true,
        appointment: { select: { appointmentDate: true, startTime: true, tokenNumber: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Also get patient info
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, firstName: true, lastName: true, gender: true, bloodGroup: true, phone: true, email: true }
    });

    res.status(200).json({ patient, consultations });
  } catch (error) {
    console.error("Error fetching patient history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get my medical history (for patients)
export const getMyHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const consultations = await prisma.consultation.findMany({
      where: { patientId: userId },
      include: {
        doctor: { select: { firstName: true, lastName: true, specialization: true } },
        prescriptions: true,
        certificates: true,
        appointment: { select: { appointmentDate: true, startTime: true, tokenNumber: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ consultations });
  } catch (error) {
    console.error("Error fetching my history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Doctor stats
export const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [totalConsultations, todayAppointments, completedToday, totalPatients] = await Promise.all([
      prisma.consultation.count({ where: { doctorId } }),
      prisma.appointment.count({ where: { doctorId, appointmentDate: today } }),
      prisma.appointment.count({ where: { doctorId, appointmentDate: today, status: "completed" } }),
      prisma.consultation.findMany({
        where: { doctorId },
        select: { patientId: true },
        distinct: ['patientId']
      })
    ]);

    // Weekly consultations (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyConsultations = await prisma.consultation.count({
      where: {
        doctorId,
        createdAt: { gte: weekAgo }
      }
    });

    // Monthly consultations
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthlyConsultations = await prisma.consultation.count({
      where: {
        doctorId,
        createdAt: { gte: monthAgo }
      }
    });

    res.status(200).json({
      stats: {
        totalConsultations,
        todayAppointments,
        completedToday,
        uniquePatients: totalPatients.length,
        weeklyConsultations,
        monthlyConsultations
      }
    });
  } catch (error) {
    console.error("Error fetching doctor stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
