import AppError from "../../../shared/errors/AppError.js";
import Device from "../model/device.model.js";

export function requireDevice(req, res, next) {
  console.log("[DEVICE] Checking requireDevice:", {
    userExists: !!req.user,
    userType: req.user?.type,
    userRole: req.user?.role,
    userDeviceId: req.user?.deviceId,
  });

  if (!req.user || req.user.type !== "DEVICE") {
    console.error("[DEVICE] ❌ REJECTED - req.user.type is:", req.user?.type);
    return next(
      new AppError("Device authentication required", 403, "DEVICE_ONLY"),
    );
  }

  console.log("[DEVICE] ✅ PASSED - Device authenticated");

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
