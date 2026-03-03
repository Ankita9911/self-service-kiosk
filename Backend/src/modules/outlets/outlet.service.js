import Outlet from "./outlet.model.js";
import Franchise from "../franchises/franchise.model.js";
import User from "../users/user.model.js";
import Device from "../devices/device.model.js";
import { forceLogout, broadcastRefresh } from "../../realtime/realtime.manager.js";
import AppError from "../../shared/errors/AppError.js";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function toBoundedLimit(value) {
  const parsed = Number.parseInt(String(value ?? DEFAULT_LIMIT), 10);
  if (Number.isNaN(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

function encodeCursor(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(cursor) {
  if (!cursor) return null;

  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8"));
    if (!decoded?.createdAt || !decoded?._id) return null;

    const createdAt = new Date(decoded.createdAt);
    if (Number.isNaN(createdAt.getTime())) return null;

    return {
      createdAt,
      _id: decoded._id,
    };
  } catch {
    return null;
  }
}

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

export async function getOutlets(user, query = {}) {
  const { search, status, franchiseId, cursor, limit } = query;
  const pageLimit = toBoundedLimit(limit);
  const baseFilter = { isDeleted: false };

  if (user.role === "SUPER_ADMIN") {
    // Optionally restrict to a specific franchise
    if (franchiseId && franchiseId !== "ALL") baseFilter.franchiseId = franchiseId;
  } else if (user.role === "FRANCHISE_ADMIN") {
    baseFilter.franchiseId = user.franchiseId;
  } else if (user.role === "OUTLET_MANAGER") {
    baseFilter._id = user.outletId;
  } else {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  // Full-text search on name and outletCode
  if (search && search.trim()) {
    baseFilter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { outletCode: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Status filter
  if (status && status !== "ALL") baseFilter.status = status;

  const decodedCursor = decodeCursor(cursor);
  const cursorFilter = decodedCursor
    ? {
        $or: [
          { createdAt: { $lt: decodedCursor.createdAt } },
          { createdAt: decodedCursor.createdAt, _id: { $lt: decodedCursor._id } },
        ],
      }
    : null;

  const queryFilter = cursorFilter
    ? { $and: [baseFilter, cursorFilter] }
    : baseFilter;

  const scopeFilter = { isDeleted: false };
  if (user.role === "FRANCHISE_ADMIN") scopeFilter.franchiseId = user.franchiseId;
  if (user.role === "OUTLET_MANAGER") scopeFilter._id = user.outletId;

  const [outletsPlusOne, totalMatching, totalOutlets, activeOutlets] = await Promise.all([
    Outlet.find(queryFilter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(pageLimit + 1),
    Outlet.countDocuments(baseFilter),
    Outlet.countDocuments(scopeFilter),
    Outlet.countDocuments({ ...scopeFilter, status: "ACTIVE" }),
  ]);

  const hasNext = outletsPlusOne.length > pageLimit;
  const outlets = hasNext ? outletsPlusOne.slice(0, pageLimit) : outletsPlusOne;

  const lastOutlet = outlets[outlets.length - 1];
  const nextCursor = hasNext && lastOutlet
    ? encodeCursor({ createdAt: lastOutlet.createdAt, _id: lastOutlet._id })
    : null;

  return {
    items: outlets,
    meta: {
      pagination: {
        limit: pageLimit,
        hasNext,
        nextCursor,
        totalMatching,
      },
      stats: {
        totalItems: totalOutlets,
        activeItems: activeOutlets,
      },
    },
  };
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
