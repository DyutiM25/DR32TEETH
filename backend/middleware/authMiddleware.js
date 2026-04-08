import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

export function verifyAccessToken(req, res, next) {
  const token = req.cookies?.[process.env.COOKIE_NAME || "token"];

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload; // { id, email, iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Role-based access control middleware
export function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) return res.status(404).json({ error: "User not found" });

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: "Access denied. Insufficient permissions." });
      }

      req.userRecord = user;
      return next();
    } catch (err) {
      console.error("Role check error:", err);
      return res.status(500).json({ error: "Authorization check failed" });
    }
  };
}

// Ensure an authenticated doctor is approved
export async function requireApprovedDoctor(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "doctor") return res.status(403).json({ error: "Doctor access only" });
    if (!user.isApproved) return res.status(403).json({ error: "Your account is pending approval" });

    req.userRecord = user;
    return next();
  } catch (err) {
    console.error("Approved doctor check error:", err);
    return res.status(500).json({ error: "Authorization check failed" });
  }
}
