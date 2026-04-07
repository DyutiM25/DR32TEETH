import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { sendOtpEmail } from "../utils/email.js";
import dotenv from "dotenv";

dotenv.config();

// Setup Redis client
const redisClient = createClient({ url: "redis://localhost:6379" });
redisClient.on("error", (err) => console.error("Redis Client Error:", err));

await redisClient.connect();

console.log("Connected to Redis");

// helpers
const OTP_TTL = 5 * 60; // 5 minutes

// generate OTP
function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// create JWT
function createAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d" }
  );
}

// 1) send OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const otp = genOtp();
    const otpKey = `otp:${email}`;

    // store OTP in redis with TTL
    await redisClient.set(otpKey, otp, { EX: OTP_TTL });

    const requestId = uuidv4();
    await redisClient.set(`otpreq:${requestId}`, email, { EX: OTP_TTL });

    // send email
    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent", requestId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// 2) verify OTP -> authenticate, set cookie
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP are required" });

    const otpKey = `otp:${email}`;
    const stored = await redisClient.get(otpKey);
    if (!stored)
      return res.status(400).json({ error: "OTP expired or not found" });
    if (stored !== otp) return res.status(400).json({ error: "Invalid OTP" });

    // OTP valid -> find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    // If user doesn't exist -> auto-create with just email
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: "patient",
        }
      });
      isNewUser = true;
    }

    // Generate JWT
    const accessToken = createAccessToken({ id: user.id, email: user.email });

    // Clear OTP (single use)
    await redisClient.del(otpKey);

    // Set cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    };
    res.cookie("token", accessToken, cookieOptions);

    res.json({
      message: isNewUser
        ? "Account created successfully"
        : "Logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileCompleted: user.profileCompleted,
        isApproved: user.isApproved,
      },
      isNewUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verify failed" });
  }
};

// 3) get profile (protected)
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
        role: user.role,
        profileCompleted: user.profileCompleted,
        isApproved: user.isApproved,
        specialization: user.specialization,
        qualification: user.qualification,
        licenseNumber: user.licenseNumber,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// 4) update profile (protected)
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, gender, bloodGroup, phone, specialization, qualification, licenseNumber } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!existingUser) return res.status(404).json({ error: "User not found" });

    // Mark profile as completed if key fields are filled
    const isCompleted = !!(firstName && lastName && phone) || existingUser.profileCompleted;

    const updateData = {
      firstName: firstName !== undefined ? firstName : undefined,
      lastName: lastName !== undefined ? lastName : undefined,
      gender: gender !== undefined ? gender : undefined,
      bloodGroup: bloodGroup !== undefined ? bloodGroup : undefined,
      phone: phone !== undefined ? phone : undefined,
      profileCompleted: isCompleted
    };

    // Doctor-specific fields
    if (existingUser.role === "doctor") {
      if (specialization !== undefined) updateData.specialization = specialization;
      if (qualification !== undefined) updateData.qualification = qualification;
      if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
        role: user.role,
        profileCompleted: user.profileCompleted,
        isApproved: user.isApproved,
        specialization: user.specialization,
        qualification: user.qualification,
        licenseNumber: user.licenseNumber,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// 5) Register as doctor (patient requests role change)
export const registerAsDoctor = async (req, res) => {
  try {
    const { specialization, qualification, licenseNumber } = req.body;

    if (!specialization || !qualification || !licenseNumber) {
      return res.status(400).json({ error: "Specialization, qualification, and license number are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!existingUser) return res.status(404).json({ error: "User not found" });

    if (existingUser.role === "doctor") {
      return res.status(400).json({ error: "Already registered as a doctor" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        role: "doctor",
        isApproved: false,
        specialization,
        qualification,
        licenseNumber
      }
    });

    res.json({
      message: "Doctor registration submitted. Pending admin approval.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isApproved: user.isApproved,
        specialization: user.specialization,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register as doctor" });
  }
};

// 6) logout
export const logout = async (req, res) => {
  try {
    res.clearCookie(process.env.COOKIE_NAME || "token");
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Logout failed" });
  }
};
