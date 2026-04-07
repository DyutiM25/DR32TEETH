import { prisma } from "../config/db.js";

// Dashboard overview stats
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [totalPatients, totalDoctors, totalAppointments, todayAppointments, pendingDoctors, totalConsultations] = await Promise.all([
      prisma.user.count({ where: { role: "patient" } }),
      prisma.user.count({ where: { role: "doctor", isApproved: true } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { appointmentDate: today } }),
      prisma.user.count({ where: { role: "doctor", isApproved: false } }),
      prisma.consultation.count()
    ]);

    res.status(200).json({
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        pendingDoctors,
        totalConsultations
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Detailed analytics
export const getAnalytics = async (req, res) => {
  try {
    // Visit trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAppointments = await prisma.appointment.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { appointmentDate: true, startTime: true, status: true }
    });

    // Group by date
    const visitTrends = {};
    recentAppointments.forEach(app => {
      visitTrends[app.appointmentDate] = (visitTrends[app.appointmentDate] || 0) + 1;
    });

    // Peak hours
    const peakHours = {};
    recentAppointments.forEach(app => {
      const hour = app.startTime?.split(':')[0] || '00';
      peakHours[hour] = (peakHours[hour] || 0) + 1;
    });

    // Demographics - Gender
    const genderStats = await prisma.user.groupBy({
      by: ['gender'],
      where: { role: 'patient', gender: { not: null } },
      _count: { id: true }
    });

    // Demographics - Blood Group
    const bloodGroupStats = await prisma.user.groupBy({
      by: ['bloodGroup'],
      where: { role: 'patient', bloodGroup: { not: null } },
      _count: { id: true }
    });

    // Common diagnoses
    const consultations = await prisma.consultation.findMany({
      select: { diagnosis: true }
    });

    const diagnosisCounts = {};
    consultations.forEach(c => {
      const diag = c.diagnosis?.trim();
      if (diag) {
        diagnosisCounts[diag] = (diagnosisCounts[diag] || 0) + 1;
      }
    });

    const topDiagnoses = Object.entries(diagnosisCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Medicine usage
    const prescriptions = await prisma.prescription.findMany({
      select: { medicines: true }
    });

    const medicineCounts = {};
    prescriptions.forEach(p => {
      const meds = Array.isArray(p.medicines) ? p.medicines : [];
      meds.forEach(med => {
        const name = med.name?.trim();
        if (name) {
          medicineCounts[name] = (medicineCounts[name] || 0) + 1;
        }
      });
    });

    const topMedicines = Object.entries(medicineCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Status breakdown
    const statusCounts = {};
    recentAppointments.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    res.status(200).json({
      analytics: {
        visitTrends,
        peakHours,
        genderStats: genderStats.map(g => ({ gender: g.gender, count: g._count.id })),
        bloodGroupStats: bloodGroupStats.map(b => ({ bloodGroup: b.bloodGroup, count: b._count.id })),
        topDiagnoses,
        topMedicines,
        statusCounts
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Pending doctor registrations
export const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: "doctor", isApproved: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        specialization: true,
        qualification: true,
        licenseNumber: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ doctors });
  } catch (error) {
    console.error("Error fetching pending doctors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Approve doctor
export const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.user.findUnique({ where: { id } });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (doctor.role !== "doctor") return res.status(400).json({ message: "User is not a doctor" });

    await prisma.user.update({
      where: { id },
      data: { isApproved: true }
    });

    res.status(200).json({ message: "Doctor approved successfully" });
  } catch (error) {
    console.error("Error approving doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject doctor (delete the user)
export const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.user.findUnique({ where: { id } });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (doctor.role !== "doctor") return res.status(400).json({ message: "User is not a doctor" });

    // Reset to patient instead of deleting
    await prisma.user.update({
      where: { id },
      data: { role: "patient", isApproved: true, specialization: null, qualification: null, licenseNumber: null }
    });

    res.status(200).json({ message: "Doctor registration rejected" });
  } catch (error) {
    console.error("Error rejecting doctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all users with optional role filter
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const where = {};
    if (role && ['patient', 'doctor', 'admin'].includes(role)) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isApproved: true,
        specialization: true,
        profileCompleted: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// System health check
export const getSystemHealth = async (req, res) => {
  try {
    const [userCount, appointmentCount, consultationCount] = await Promise.all([
      prisma.user.count(),
      prisma.appointment.count(),
      prisma.consultation.count()
    ]);

    // Test DB connection
    let dbStatus = "healthy";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "unhealthy";
    }

    res.status(200).json({
      health: {
        database: dbStatus,
        counts: {
          users: userCount,
          appointments: appointmentCount,
          consultations: consultationCount
        },
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    });
  } catch (error) {
    console.error("Error fetching system health:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
