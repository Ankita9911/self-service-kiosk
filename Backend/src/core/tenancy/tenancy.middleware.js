import AppError from "../../shared/errors/AppError.js";

export function attachTenant(req, res, next) {
  const user = req.user;

  if (!user) {
    return next(
      new AppError("Authentication required", 401, "AUTH_REQUIRED")
    );
  }

  req.tenant = {
    franchiseId: user.franchiseId || null,
    outletId: user.outletId || null,
    role: user.role,
  };

  next();
}
