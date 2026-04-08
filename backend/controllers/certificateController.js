import { prisma } from "../config/db.js";
import { generateCertificatePDF } from "../utils/pdfGenerator.js";

// Issue medical certificate
export const issueCertificate = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { consultationId, reason, validFrom, validTo, additionalNotes } = req.body;

    if (!consultationId || !reason || !validFrom || !validTo) {
      return res.status(400).json({ message: "consultationId, reason, validFrom, and validTo are required" });
    }

    const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
    if (!consultation) return res.status(404).json({ message: "Consultation not found" });
    if (consultation.doctorId !== doctorId) return res.status(403).json({ message: "Not authorized" });

    const certificate = await prisma.medicalCertificate.create({
      data: {
        consultationId,
        reason,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        additionalNotes: additionalNotes || null
      }
    });

    res.status(201).json({ message: "Certificate issued", certificate });
  } catch (error) {
    console.error("Error issuing certificate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get certificate by ID
export const getCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const certificate = await prisma.medicalCertificate.findUnique({
      where: { id },
      include: {
        consultation: {
          include: {
            doctor: { select: { firstName: true, lastName: true, specialization: true, qualification: true, licenseNumber: true } },
            patient: { select: { firstName: true, lastName: true, gender: true, bloodGroup: true, phone: true } },
            appointment: { select: { appointmentDate: true } }
          }
        }
      }
    });

    if (!certificate) return res.status(404).json({ message: "Certificate not found" });

    const cons = certificate.consultation;
    if (cons.doctorId !== userId && cons.patientId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    res.status(200).json({ certificate });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all certificates for current patient
export const getMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await prisma.medicalCertificate.findMany({
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

    res.status(200).json({ certificates });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Download certificate as PDF
export const downloadCertificatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const certificate = await prisma.medicalCertificate.findUnique({
      where: { id },
      include: {
        consultation: {
          include: {
            doctor: { select: { firstName: true, lastName: true, specialization: true, qualification: true, licenseNumber: true } },
            patient: { select: { firstName: true, lastName: true, gender: true, bloodGroup: true, phone: true, email: true } },
            appointment: { select: { appointmentDate: true } }
          }
        }
      }
    });

    if (!certificate) return res.status(404).json({ message: "Certificate not found" });

    const cons = certificate.consultation;
    if (cons.doctorId !== userId && cons.patientId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    const pdfBuffer = await generateCertificatePDF(certificate.consultation, certificate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${id.slice(0, 8)}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating certificate PDF:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
