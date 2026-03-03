import Franchise from "./franchise.model.js";
import User from "../users/user.model.js";
import Outlet from "../outlets/outlet.model.js";
import Device from "../devices/device.model.js";
import { forceLogout, broadcastRefresh } from "../../realtime/realtime.manager.js";
import AppError from "../../shared/errors/AppError.js";

export async function createFranchise(payload, user) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const { name, brandCode, contactEmail, contactPhone } = payload;

  if (!name || !brandCode) {
    throw new AppError(
      "Name and brandCode are required",
      400,
      "VALIDATION_ERROR"
    );
  }

  const existing = await Franchise.findOne({
    brandCode: brandCode.toUpperCase(),
    isDeleted: false,
  });

  if (existing) {
    throw new AppError(
      "Brand code already exists",
      409,
      "BRAND_CODE_EXISTS"
    );
  }

  if (contactEmail) {
    const emailExists = await Franchise.findOne({
      contactEmail: contactEmail.toLowerCase(),
      isDeleted: false,
    });
    if (emailExists) {
      throw new AppError(
        "A franchise with this email already exists",
        409,
        "EMAIL_EXISTS"
      );
    }
  }

  const franchise = await Franchise.create({
    name,
    brandCode: brandCode.toUpperCase(),
    contactEmail,
    contactPhone,
  });

  return franchise;
}
export async function getFranchises(user, query = {}) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const { search, status } = query;
  const filter = { isDeleted: false };

  // Full-text search on name, brandCode and contactEmail
  if (search && search.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { brandCode: { $regex: search.trim(), $options: "i" } },
      { contactEmail: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Status filter
  if (status && status !== "ALL") filter.status = status;

  return Franchise.find(filter).sort({ createdAt: -1 });
}

export async function getFranchiseById(id, user) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const franchise = await Franchise.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!franchise) {
    throw new AppError(
      "Franchise not found",
      404,
      "FRANCHISE_NOT_FOUND"
    );
  }

  return franchise;
}

export async function updateFranchise(id, payload, user) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const franchise = await getFranchiseById(id, user);

  if (payload.brandCode) {
    payload.brandCode = payload.brandCode.toUpperCase();
  }

  if (payload.contactEmail && payload.contactEmail.toLowerCase() !== (franchise.contactEmail || "")) {
    const emailExists = await Franchise.findOne({
      contactEmail: payload.contactEmail.toLowerCase(),
      isDeleted: false,
      _id: { $ne: id },
    });
    if (emailExists) {
      throw new AppError(
        "A franchise with this email already exists",
        409,
        "EMAIL_EXISTS"
      );
    }
  }

  Object.assign(franchise, payload);

  await franchise.save();

  return franchise;
}

export async function setFranchiseStatus(id, status, user) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  if (![ "ACTIVE", "INACTIVE" ].includes(status)) {
    throw new AppError("Invalid status value", 400, "VALIDATION_ERROR");
  }

  const franchise = await getFranchiseById(id, user);

  franchise.status = status;
  await franchise.save();

  // Collect all outlet IDs under this franchise
  const outletIds = await Outlet.find(
    { franchiseId: franchise._id, isDeleted: false },
    "_id"
  ).lean().then((docs) => docs.map((d) => d._id));

  if (status === "INACTIVE") {
    // Deactivate all outlets under the franchise
    await Outlet.updateMany(
      { franchiseId: franchise._id, isDeleted: false },
      { $set: { status: "INACTIVE" } }
    );

    // Deactivate all users under the franchise / its outlets
    await User.updateMany(
      {
        $or: [
          { franchiseId: franchise._id },
          { outletId: { $in: outletIds } },
        ],
        isDeleted: false,
      },
      { $set: { status: "INACTIVE" } }
    );

    // Deactivate all devices under the franchise / its outlets
    await Device.updateMany(
      {
        $or: [
          { franchiseId: franchise._id },
          { outletId: { $in: outletIds } },
        ],
        isDeleted: false,
      },
      { $set: { status: "INACTIVE" } }
    );

    // Force-kick all affected users
    const affectedUsers = await User.find(
      {
        $or: [
          { franchiseId: franchise._id },
          { outletId: { $in: outletIds } },
        ],
        isDeleted: false,
      },
      "_id"
    ).lean();
    for (const u of affectedUsers) {
      forceLogout("user", u._id.toString());
    }

    // Force-kick all affected devices
    const affectedDevices = await Device.find(
      {
        $or: [
          { franchiseId: franchise._id },
          { outletId: { $in: outletIds } },
        ],
        isDeleted: false,
      },
      "deviceId"
    ).lean();
    for (const d of affectedDevices) {
      forceLogout("device", d.deviceId);
    }
  } else {
    // Re-activate all outlets under the franchise
    await Outlet.updateMany(
      { franchiseId: franchise._id, isDeleted: false },
      { $set: { status: "ACTIVE" } }
    );

    // Re-activate users tied to this franchise / its outlets
    await User.updateMany(
      {
        $or: [
          { franchiseId: franchise._id },
          { outletId: { $in: outletIds } },
        ],
        isDeleted: false,
      },
      { $set: { status: "ACTIVE" } }
    );

    // Re-activate devices tied to this franchise / its outlets
    await Device.updateMany(
      {
        $or: [
          { franchiseId: franchise._id },
          { outletId: { $in: outletIds } },
        ],
        isDeleted: false,
      },
      { $set: { status: "ACTIVE" } }
    );
  }

  // Notify all connected clients so outlet page refreshes live
  broadcastRefresh("outlets:refreshNeeded");

  return franchise;
}

export async function deleteFranchise(id, user) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const franchise = await getFranchiseById(id, user);

  // 1. Cascade: collect all outlet IDs under this franchise
  const outlets = await Outlet.find({ franchiseId: franchise._id, isDeleted: false }).select("_id");
  const outletIds = outlets.map((o) => o._id);

  // 2. Soft-delete all outlets
  if (outletIds.length > 0) {
    await Outlet.updateMany(
      { franchiseId: franchise._id },
      { isDeleted: true, status: "INACTIVE" }
    );
  }

  // 3. Force-logout + soft-delete all affected users
  const affectedUsers = await User.find({
    $or: [
      { franchiseId: franchise._id },
      { outletId: { $in: outletIds } },
    ],
    isDeleted: false,
  }).select("_id");

  for (const u of affectedUsers) {
    forceLogout("user", u._id.toString());
  }
  if (affectedUsers.length > 0) {
    await User.updateMany(
      {
        $or: [
          { franchiseId: franchise._id },
          { outletId: { $in: outletIds } },
        ],
      },
      { isDeleted: true, status: "INACTIVE" }
    );
  }

  // 4. Force-logout + soft-delete all affected devices
  const affectedDevices = await Device.find({
    $or: [
      { franchiseId: franchise._id },
      { outletId: { $in: outletIds } },
    ],
    isDeleted: false,
  }).select("_id deviceId");

  for (const d of affectedDevices) {
    forceLogout("device", d.deviceId);
  }
  if (affectedDevices.length > 0) {
    await Device.updateMany(
      {
        $or: [
          { franchiseId: franchise._id },
          { outletId: { $in: outletIds } },
        ],
      },
      { isDeleted: true, status: "INACTIVE" }
    );
  }

  // 5. Soft-delete the franchise itself
  franchise.isDeleted = true;
  franchise.status = "INACTIVE";
  await franchise.save();

  broadcastRefresh("outlets:refreshNeeded");

  return { message: "Franchise deleted successfully" };
}
