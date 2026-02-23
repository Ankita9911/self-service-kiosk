import Outlet from "./outlet.model.js";
import Franchise from "../franchises/franchise.model.js";
import AppError from "../../shared/errors/AppError.js";

export async function createOutlet(payload, user) {
  let { franchiseId, name, outletCode, address } = payload;

  if (!name || !outletCode) {
    throw new AppError(
      "Name and outletCode are required",
      400,
      "VALIDATION_ERROR"
    );
  }

  if (user.role === "SUPER_ADMIN") {
    if (!franchiseId) {
      throw new AppError(
        "franchiseId is required",
        400,
        "FRANCHISE_REQUIRED"
      );
    }
  } else if (user.role === "FRANCHISE_ADMIN") {
    franchiseId = user.franchiseId;
  } else {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const franchiseExists = await Franchise.findById(franchiseId);
  if (!franchiseExists) {
    throw new AppError(
      "Franchise not found",
      404,
      "FRANCHISE_NOT_FOUND"
    );
  }

  const outlet = await Outlet.create({
    franchiseId,
    name,
    outletCode: outletCode.toUpperCase(),
    address,
  });

  return outlet;
}

export async function getOutlets(user) {
  const filter = { isDeleted: false };

  if (user.role === "SUPER_ADMIN") {
    return Outlet.find(filter).sort({ createdAt: -1 });
  }

  if (user.role === "FRANCHISE_ADMIN") {
    return Outlet.find({
      ...filter,
      franchiseId: user.franchiseId,
    }).sort({ createdAt: -1 });
  }
  if (user.role === "OUTLET_MANAGER") {
    return Outlet.find({
      ...filter,
      _id: user.outletId,
    });
  }

  throw new AppError("Forbidden", 403, "FORBIDDEN");
}
export async function getOutletById(id, user) {
  const outlet = await Outlet.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!outlet) {
    throw new AppError(
      "Outlet not found",
      404,
      "OUTLET_NOT_FOUND"
    );
  }

  if (
    user.role !== "SUPER_ADMIN" &&
    String(outlet.franchiseId) !==
      String(user.franchiseId)
  ) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  return outlet;
}

export async function updateOutlet(id, payload, user) {
  const outlet = await getOutletById(id, user);

  if (payload.outletCode) {
    payload.outletCode =
      payload.outletCode.toUpperCase();
  }

  Object.assign(outlet, payload);

  await outlet.save();

  return outlet;
}

export async function deleteOutlet(id, user) {
  const outlet = await getOutletById(id, user);

  outlet.isDeleted = true;
  outlet.status = "INACTIVE";

  await outlet.save();

  return { message: "Outlet deleted successfully" };
}
