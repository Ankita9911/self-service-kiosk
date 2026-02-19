import AppError from "../../shared/errors/AppError.js";


export function requireDevice(req, res, next) {
  if (!req.user || req.user.type !== "DEVICE") {
    return next(
      new AppError("Device authentication required", 403, "DEVICE_ONLY")
    );
  }

  next();
}

export function requireUser(req, res, next) {
  if (!req.user || req.user.type === "DEVICE") {
    return next(
      new AppError("User authentication required", 403, "USER_ONLY")
    );
  }

  next();
}
