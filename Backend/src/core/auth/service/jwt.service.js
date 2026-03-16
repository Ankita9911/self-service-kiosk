import jwt from "jsonwebtoken";
import env from "../../../config/env.js";

const TOKEN_EXPIRY = "12h";

export function generateToken(user) {
  const payload = {
    userId: user._id,
    role: user.role,
    franchiseId: user.franchiseId || null,
    outletId: user.outletId || null,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}
