// core/rbac/rbac.middleware.js

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

    const rolePermissions = ROLE_PERMISSIONS[user.role];

    if (!rolePermissions) {
      return next(
        new AppError("Invalid role", 403, "INVALID_ROLE")
      );
    }

    if (!requiredPermission) {
      return next(
        new AppError("Permission not defined", 500, "PERMISSION_MISSING")
      );
    }

    if (!rolePermissions.includes(requiredPermission)) {
      return next(
        new AppError("Forbidden", 403, "FORBIDDEN")
      );
    }

    next();
  };
}
