// utils/email.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mengjidhanush@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export async function sendOtpEmail(to, otp) {
  const msg = {
    from: "mengjidhanush@gmail.com",
    to,
    subject: "Your Login OTP",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
  };

  return transporter.sendMail(msg);
}
