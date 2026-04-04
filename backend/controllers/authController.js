import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
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
    let user = await User.findOne({ where: { email } });
    let isNewUser = false;

    // If user doesn't exist -> auto-create with just email
    if (!user) {
      user = await User.create({
        email,
        role: "patient",
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
    const user = await User.findByPk(req.user.id);
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
    const { firstName, lastName, gender, bloodGroup, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (gender !== undefined) user.gender = gender;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (phone !== undefined) user.phone = phone;

    // Mark profile as completed if key fields are filled
    if (user.firstName && user.lastName && user.phone) {
      user.profileCompleted = true;
    }

    await user.save();

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
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// 5) logout
export const logout = async (req, res) => {
  try {
    res.clearCookie(process.env.COOKIE_NAME || "token");
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Logout failed" });
  }
};
