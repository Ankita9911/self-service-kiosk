import AppError from "../../shared/errors/AppError.js";
import Device from "./device.model.js";

export function requireDevice(req, res, next) {
  if (!req.user || req.user.type !== "DEVICE") {
    return next(
      new AppError("Device authentication required", 403, "DEVICE_ONLY"),
    );
  }

  // Fire-and-forget: keep lastSeenAt current on every device request
  Device.updateOne(
    { deviceId: req.user.deviceId },
    { lastSeenAt: new Date() },
  ).catch(() => {});

  next();
}

export function requireUser(req, res, next) {
  if (!req.user || req.user.type === "DEVICE") {
    return next(new AppError("User authentication required", 403, "USER_ONLY"));
  }

  next();
}
