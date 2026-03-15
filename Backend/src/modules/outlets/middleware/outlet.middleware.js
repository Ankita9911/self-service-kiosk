import Outlet from "../model/outlet.model.js";
import AppError from "../../../shared/errors/AppError.js";

export async function attachOutletForMenu(req, res, next) {
  const user = req.user;
  const outletId = req.query.outletId || req.body?.outletId;

  if (user.role === "OUTLET_MANAGER") {
    if (!user.outletId) {
      return next(
        new AppError("Outlet context required", 403, "OUTLET_REQUIRED"),
      );
    }
    return next();
  }

  if (user.role === "FRANCHISE_ADMIN" || user.role === "SUPER_ADMIN") {
    if (!outletId && req.method === "GET") {
      return next();
    }

    if (!outletId) {
      return next(
        new AppError(
          "Outlet ID is required for menu operations",
          400,
          "OUTLET_REQUIRED",
        ),
      );
    }

    const outlet = await Outlet.findOne({ _id: outletId, isDeleted: false });

    if (!outlet) {
      return next(new AppError("Outlet not found", 404, "OUTLET_NOT_FOUND"));
    }

    if (
      user.role === "FRANCHISE_ADMIN" &&
      outlet.franchiseId?.toString() !== user.franchiseId?.toString()
    ) {
      return next(
        new AppError(
          "Cannot manage menu for outlet outside your franchise",
          403,
          "FORBIDDEN",
        ),
      );
    }

    req.tenant.outletId = outlet._id;
    req.tenant.franchiseId = outlet.franchiseId;
    return next();
  }

  return next(new AppError("Forbidden", 403, "FORBIDDEN"));
}
