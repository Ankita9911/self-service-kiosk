import AppError from "../../shared/errors/AppError.js";
import { ROLE_PERMISSIONS } from "./roles.js";

export function authorize(requiredPermission) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return next(
        new AppError("Authentication required", 401, "AUTH_REQUIRED")
      );
    }

    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];

    // SUPER_ADMIN shortcut
    if (rolePermissions.includes("*")) {
      return next();
    }

    if (!rolePermissions.includes(requiredPermission)) {
      return next(
        new AppError("Forbidden", 403, "FORBIDDEN")
      );
    }

    next();
  };
}
