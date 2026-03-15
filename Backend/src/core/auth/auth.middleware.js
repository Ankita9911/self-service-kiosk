import { verifyToken } from "./jwt.service.js";
import AppError from "../../shared/errors/AppError.js";
import User from "../../modules/users/model/user.model.js";
import Device from "../../modules/devices/model/device.model.js";
import { getRedisClient } from "../cache/redis.client.js";

const COOKIE_NAME = "auth_token";
const AUTH_STATUS_TTL_SECONDS = 60;

export function authStatusKey(type, id) {
  return `auth:status:${type}:${id}`;
}

async function getCachedStatus(key) {
  try {
    const redis = getRedisClient();
    return await redis.get(key);
  } catch {
    return null;
  }
}

async function setCachedStatus(key, status) {
  try {
    const redis = getRedisClient();
    await redis.setex(key, AUTH_STATUS_TTL_SECONDS, status);
  } catch {
    // non-fatal
  }
}

export async function invalidateAuthStatus(type, id) {
  try {
    const redis = getRedisClient();
    await redis.del(authStatusKey(type, id));
  } catch {
    // non-fatal
  }
}

export async function authenticate(req, res, next) {
  let token = req.cookies?.[COOKIE_NAME];

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

  if (decoded.type === "DEVICE") {
    const cacheKey = authStatusKey("device", decoded.deviceId);
    const cached = await getCachedStatus(cacheKey);

    if (cached) {
      if (cached !== "ACTIVE") {
        return next(new AppError("Device is inactive", 403, "DEVICE_INACTIVE"));
      }
    } else {
      const device = await Device.findOne({
        deviceId: decoded.deviceId,
        isDeleted: false,
      }).lean();
      if (!device || device.status !== "ACTIVE") {
        return next(new AppError("Device is inactive", 403, "DEVICE_INACTIVE"));
      }
      await setCachedStatus(cacheKey, device.status);
    }
  } else if (decoded.userId) {
    const cacheKey = authStatusKey("user", decoded.userId);
    const cached = await getCachedStatus(cacheKey);

    if (cached) {
      if (cached !== "ACTIVE") {
        return next(
          new AppError("Account is inactive", 403, "ACCOUNT_INACTIVE"),
        );
      }
    } else {
      const user = await User.findById(decoded.userId).lean();
      if (!user || user.isDeleted || user.status !== "ACTIVE") {
        return next(
          new AppError("Account is inactive", 403, "ACCOUNT_INACTIVE"),
        );
      }
      await setCachedStatus(cacheKey, user.status);
    }
  }

  req.user = decoded;
  next();
}
