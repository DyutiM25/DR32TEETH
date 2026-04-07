import { prisma } from "../config/db.js";
import { generatePrescriptionPDF } from "../utils/pdfGenerator.js";

// Create prescription for a consultation
export const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { consultationId, medicines, additionalNotes } = req.body;

    if (!consultationId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "consultationId and medicines array are required" });
    }

    // Verify consultation belongs to this doctor
    const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
    if (!consultation) return res.status(404).json({ message: "Consultation not found" });
    if (consultation.doctorId !== doctorId) return res.status(403).json({ message: "Not authorized" });

    const prescription = await prisma.prescription.create({
      data: {
        consultationId,
        medicines,
        additionalNotes: additionalNotes || null
      }
    });

    res.status(201).json({ message: "Prescription created", prescription });
  } catch (error) {
    console.error("Error creating prescription:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get prescription by ID
export const getPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        consultation: {
          include: {
            doctor: { select: { firstName: true, lastName: true, specialization: true, qualification: true, licenseNumber: true } },
            patient: { select: { firstName: true, lastName: true, gender: true, bloodGroup: true, phone: true } },
            appointment: { select: { appointmentDate: true, startTime: true } }
          }
        }
      }
    });

    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    // Access check
    const cons = prescription.consultation;
    if (cons.doctorId !== userId && cons.patientId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    res.status(200).json({ prescription });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all prescriptions for current patient
export const getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const prescriptions = await prisma.prescription.findMany({
      where: {
        consultation: { patientId: userId }
      },
      include: {
        consultation: {
          select: {
            diagnosis: true,
            doctor: { select: { firstName: true, lastName: true, specialization: true } },
            appointment: { select: { appointmentDate: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ prescriptions });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Download prescription as PDF
export const downloadPrescriptionPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        consultation: {
          include: {
            doctor: { select: { firstName: true, lastName: true, specialization: true, qualification: true, licenseNumber: true } },
            patient: { select: { firstName: true, lastName: true, gender: true, bloodGroup: true, phone: true, email: true } },
            appointment: { select: { appointmentDate: true, startTime: true, tokenNumber: true } }
          }
        }
      }
    });

    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    // Access check
    const cons = prescription.consultation;
    if (cons.doctorId !== userId && cons.patientId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    const pdfBuffer = await generatePrescriptionPDF(prescription.consultation, prescription);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${id.slice(0, 8)}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating prescription PDF:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
