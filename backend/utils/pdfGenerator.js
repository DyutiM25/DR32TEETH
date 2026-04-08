import PDFDocument from "pdfkit";

// Helper to build a PDF buffer from a PDFDocument
function buildPDF(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function drawHeader(doc) {
  doc.fontSize(22).font("Helvetica-Bold").fillColor("#009688").text("Dr.32 Teeth", { align: "center" });
  doc.fontSize(10).font("Helvetica").fillColor("#666").text("Dental Healthcare Center", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(8).text("Email: mengjidhanush@gmail.com | Your Smile, Our Priority", { align: "center" });
  doc.moveDown(0.5);

  // Divider line
  doc.strokeColor("#009688").lineWidth(2)
    .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);
}

function drawFooter(doc, doctor) {
  const bottomY = 700;
  doc.strokeColor("#ccc").lineWidth(0.5)
    .moveTo(50, bottomY).lineTo(545, bottomY).stroke();

  doc.y = bottomY + 10;
  doc.fontSize(8).fillColor("#999")
    .text("This is a computer-generated document from Dr.32 Teeth Healthcare System.", 50, bottomY + 10, { align: "center" });

  // Signature area on the right
  doc.fontSize(10).fillColor("#333")
    .text("_________________________", 380, bottomY - 60);
  doc.text(`Dr. ${doctor.firstName} ${doctor.lastName}`, 380, bottomY - 45);
  if (doctor.specialization) {
    doc.fontSize(8).fillColor("#666").text(doctor.specialization, 380, bottomY - 33);
  }
  if (doctor.licenseNumber) {
    doc.fontSize(8).text(`License: ${doctor.licenseNumber}`, 380, bottomY - 22);
  }
}

export async function generatePrescriptionPDF(consultation, prescription) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const { doctor, patient, appointment } = consultation;

  drawHeader(doc);

  // Title
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#333").text("PRESCRIPTION", { align: "center" });
  doc.moveDown(0.8);

  // Patient & Visit Info
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#009688").text("Patient Information");
  doc.moveDown(0.3);
  doc.fontSize(10).font("Helvetica").fillColor("#333");
  doc.text(`Name: ${patient.firstName} ${patient.lastName}          Gender: ${patient.gender || "N/A"}          Blood Group: ${patient.bloodGroup || "N/A"}`);
  doc.text(`Phone: ${patient.phone || "N/A"}          Email: ${patient.email || "N/A"}`);
  doc.text(`Date: ${appointment.appointmentDate}          Time: ${appointment.startTime}${appointment.tokenNumber ? `          Token: #${appointment.tokenNumber}` : ""}`);
  doc.moveDown(0.5);

  // Diagnosis
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#009688").text("Diagnosis");
  doc.moveDown(0.2);
  doc.fontSize(10).font("Helvetica").fillColor("#333").text(consultation.diagnosis);
  doc.moveDown(0.5);

  // Medicines Table
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#009688").text("Prescribed Medicines");
  doc.moveDown(0.4);

  const medicines = Array.isArray(prescription.medicines) ? prescription.medicines : [];
  const tableTop = doc.y;
  const col1 = 50, col2 = 200, col3 = 290, col4 = 370, col5 = 450;

  // Table header
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#fff");
  doc.rect(col1, tableTop, 495, 18).fill("#009688");
  doc.fillColor("#fff");
  doc.text("Medicine", col1 + 5, tableTop + 4, { width: 145 });
  doc.text("Dosage", col2 + 5, tableTop + 4, { width: 85 });
  doc.text("Frequency", col3 + 5, tableTop + 4, { width: 75 });
  doc.text("Duration", col4 + 5, tableTop + 4, { width: 75 });
  doc.text("Instructions", col5 + 5, tableTop + 4, { width: 90 });

  let rowY = tableTop + 20;
  doc.font("Helvetica").fontSize(9).fillColor("#333");

  medicines.forEach((med, i) => {
    const bgColor = i % 2 === 0 ? "#f9f9f9" : "#ffffff";
    doc.rect(col1, rowY, 495, 18).fill(bgColor);
    doc.fillColor("#333");
    doc.text(med.name || "", col1 + 5, rowY + 4, { width: 145 });
    doc.text(med.dosage || "", col2 + 5, rowY + 4, { width: 85 });
    doc.text(med.frequency || "", col3 + 5, rowY + 4, { width: 75 });
    doc.text(med.duration || "", col4 + 5, rowY + 4, { width: 75 });
    doc.text(med.instructions || "", col5 + 5, rowY + 4, { width: 90 });
    rowY += 18;
  });

  doc.y = rowY + 10;

  // Additional notes
  if (prescription.additionalNotes) {
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#009688").text("Additional Notes");
    doc.moveDown(0.2);
    doc.fontSize(10).font("Helvetica").fillColor("#333").text(prescription.additionalNotes);
  }

  drawFooter(doc, doctor);
  return buildPDF(doc);
}

export async function generateCertificatePDF(consultation, certificate) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const { doctor, patient, appointment } = consultation;

  drawHeader(doc);

  // Title
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#333").text("MEDICAL CERTIFICATE", { align: "center" });
  doc.moveDown(1.5);

  // Certificate body
  doc.fontSize(11).font("Helvetica").fillColor("#333");

  doc.text("This is to certify that ", { continued: true });
  doc.font("Helvetica-Bold").text(`${patient.firstName} ${patient.lastName}`, { continued: true });
  doc.font("Helvetica").text(` (${patient.gender || "N/A"}, Blood Group: ${patient.bloodGroup || "N/A"}) `, { continued: true });
  doc.text("was examined at Dr.32 Teeth Dental Healthcare Center ");
  doc.text(`on ${appointment.appointmentDate} and was found to be suffering from:`);
  doc.moveDown(0.8);

  // Reason
  doc.fontSize(12).font("Helvetica-Bold").fillColor("#009688").text(certificate.reason, { align: "center" });
  doc.moveDown(0.8);

  // Diagnosis reference
  doc.fontSize(11).font("Helvetica").fillColor("#333");
  doc.text(`Clinical Diagnosis: ${consultation.diagnosis}`);
  doc.moveDown(0.5);

  // Validity
  const validFromStr = new Date(certificate.validFrom).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const validToStr = new Date(certificate.validTo).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  doc.text("The patient is advised rest and is unfit for duty/classes for the period:");
  doc.moveDown(0.4);
  doc.fontSize(12).font("Helvetica-Bold").fillColor("#009688")
    .text(`From: ${validFromStr}    To: ${validToStr}`, { align: "center" });
  doc.moveDown(1);

  // Additional notes
  if (certificate.additionalNotes) {
    doc.fontSize(11).font("Helvetica").fillColor("#333")
      .text(`Additional Notes: ${certificate.additionalNotes}`);
    doc.moveDown(0.5);
  }

  // Issue info
  doc.fontSize(10).fillColor("#666");
  doc.text(`Certificate issued on: ${new Date(certificate.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`);

  drawFooter(doc, doctor);
  return buildPDF(doc);
}
