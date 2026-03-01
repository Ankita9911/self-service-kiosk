import Outlet from "./outlet.model.js";
import Franchise from "../franchises/franchise.model.js";
import User from "../users/user.model.js";
import Device from "../devices/device.model.js";
import { forceLogout, broadcastRefresh } from "../../realtime/realtime.manager.js";
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

  // 1. Force-logout + soft-delete all users at this outlet
  const affectedUsers = await User.find({ outletId: outlet._id, isDeleted: false }).select("_id");
  for (const u of affectedUsers) {
    forceLogout("user", u._id.toString());
  }
  if (affectedUsers.length > 0) {
    await User.updateMany({ outletId: outlet._id }, { isDeleted: true, status: "INACTIVE" });
  }

  // 2. Force-logout + soft-delete all devices at this outlet
  const affectedDevices = await Device.find({ outletId: outlet._id, isDeleted: false }).select("_id deviceId");
  for (const d of affectedDevices) {
    forceLogout("device", d.deviceId);
  }
  if (affectedDevices.length > 0) {
    await Device.updateMany({ outletId: outlet._id }, { isDeleted: true, status: "INACTIVE" });
  }

  // 3. Soft-delete the outlet itself
  outlet.isDeleted = true;
  outlet.status = "INACTIVE";
  await outlet.save();

  return { message: "Outlet deleted successfully" };
}

export async function setOutletStatus(id, status, user) {
  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    throw new AppError("Invalid status value", 400, "VALIDATION_ERROR");
  }

  const outlet = await getOutletById(id, user);

  outlet.status = status;
  await outlet.save();

  if (status === "INACTIVE") {
    // Deactivate all users assigned to this outlet
    await User.updateMany(
      { outletId: outlet._id, isDeleted: false },
      { $set: { status: "INACTIVE" } }
    );

    // Deactivate all devices assigned to this outlet
    await Device.updateMany(
      { outletId: outlet._id, isDeleted: false },
      { $set: { status: "INACTIVE" } }
    );

    // Force-kick affected users
    const affectedUsers = await User.find(
      { outletId: outlet._id, isDeleted: false },
      "_id"
    ).lean();
    for (const u of affectedUsers) {
      forceLogout("user", u._id.toString());
    }

    // Force-kick affected devices
    const affectedDevices = await Device.find(
      { outletId: outlet._id, isDeleted: false },
      "deviceId"
    ).lean();
    for (const d of affectedDevices) {
      forceLogout("device", d.deviceId);
    }
  } else {
    // Re-activate users under this outlet
    await User.updateMany(
      { outletId: outlet._id, isDeleted: false },
      { $set: { status: "ACTIVE" } }
    );

    // Re-activate devices under this outlet
    await Device.updateMany(
      { outletId: outlet._id, isDeleted: false },
      { $set: { status: "ACTIVE" } }
    );
  }

  return outlet;
}
