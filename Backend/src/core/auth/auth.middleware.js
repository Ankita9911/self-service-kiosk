import { verifyToken } from "./jwt.service.js";
import AppError from "../../shared/errors/AppError.js";
import User from "../../modules/users/user.model.js";
import Device from "../../modules/devices/device.model.js";

const COOKIE_NAME = "auth_token";

export async function authenticate(req, res, next) {
  // 1. Try httpOnly cookie first (browser users)
  let token = req.cookies?.[COOKIE_NAME];

  // 2. Fallback to Authorization header (device tokens / kiosk)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return next(new AppError("Invalid or expired token", 401, "INVALID_TOKEN"));
  }

  // 3. Live status check — reject if the principal has been deactivated
  if (decoded.type === "DEVICE") {
    const device = await Device.findOne({ deviceId: decoded.deviceId, isDeleted: false }).lean();
    if (!device || device.status !== "ACTIVE") {
      return next(new AppError("Device is inactive", 403, "DEVICE_INACTIVE"));
    }
  } else if (decoded.userId) {
    const user = await User.findById(decoded.userId).lean();
    if (!user || user.isDeleted || user.status !== "ACTIVE") {
      return next(new AppError("Account is inactive", 403, "ACCOUNT_INACTIVE"));
    }
  }

  req.user = decoded;
  next();
}
