import { prisma } from "../config/db.js";

// Standard working hours from 09:00 to 17:00 at 30-min intervals
const generateStandardSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 17;
    for (let h = startHour; h < endHour; h++) {
        const hourStr = h.toString().padStart(2, '0');
        slots.push(`${hourStr}:00`);
        slots.push(`${hourStr}:30`);
    }
    return slots;
};

export const getDoctors = async (req, res) => {
    try {
        const doctors = await prisma.user.findMany({
            where: { role: 'doctor', isApproved: true },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                specialization: true,
                qualification: true
            }
        });
        res.status(200).json({ doctors });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;
        if (!doctorId || !date) {
            return res.status(400).json({ message: "doctorId and date are required" });
        }

        const standardSlots = generateStandardSlots();

        const bookedAppointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                appointmentDate: date,
                status: { in: ['scheduled', 'in_progress'] }
            },
            select: { startTime: true }
        });

        const bookedTimes = bookedAppointments.map(app => app.startTime);
        const availableSlots = standardSlots.filter(slot => !bookedTimes.includes(slot));

        res.status(200).json({ availableSlots });
    } catch (error) {
        console.error("Error fetching available slots:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const bookAppointment = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { doctorId, appointmentDate, startTime, reason } = req.body;

        if (!doctorId || !appointmentDate || !startTime) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check availability strictly to avoid double booking
        const existing = await prisma.appointment.findFirst({
            where: {
                doctorId,
                appointmentDate,
                startTime,
                status: { in: ['scheduled', 'in_progress'] }
            }
        });

        if (existing) {
            return res.status(409).json({ message: "This slot is no longer available" });
        }

        // Auto-assign token number (sequential per doctor per date)
        const lastToken = await prisma.appointment.findFirst({
            where: { doctorId, appointmentDate },
            orderBy: { tokenNumber: 'desc' },
            select: { tokenNumber: true }
        });

        const tokenNumber = (lastToken?.tokenNumber || 0) + 1;

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                appointmentDate,
                startTime,
                reason,
                tokenNumber
            }
        });

        res.status(201).json({ message: "Appointment booked successfully", appointment });
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isDoctor = user.role === 'doctor';
        
        const appointments = await prisma.appointment.findMany({
            where: isDoctor ? { doctorId: userId } : { patientId: userId },
            include: isDoctor 
                ? {
                    patient: { select: { id: true, firstName: true, lastName: true, phone: true, gender: true, bloodGroup: true } },
                    consultation: { select: { id: true } }
                  }
                : {
                    doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
                    consultation: { select: { id: true } }
                  },
            orderBy: [
                { appointmentDate: 'desc' },
                { startTime: 'asc' }
            ]
        });

        res.status(200).json({ appointments });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const appointment = await prisma.appointment.findUnique({ where: { id } });
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        // Only doctor of this appointment or the patient can update
        if (appointment.doctorId !== userId && appointment.patientId !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: { status }
        });

        res.status(200).json({ message: "Status updated", appointment: updated });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getTodayAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: userId,
                appointmentDate: today
            },
            include: {
                patient: { select: { id: true, firstName: true, lastName: true, phone: true, gender: true, bloodGroup: true } },
                consultation: { select: { id: true } }
            },
            orderBy: [
                { tokenNumber: 'asc' },
                { startTime: 'asc' }
            ]
        });

        res.status(200).json({ appointments });
    } catch (error) {
        console.error("Error fetching today's appointments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
