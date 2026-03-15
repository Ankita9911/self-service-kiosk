import bcrypt from "bcrypt";
import crypto from "crypto";
import Device from "../model/device.model.js";
import AppError from "../../../shared/errors/AppError.js";
import { forceLogout } from "../../../realtime/realtime.manager.js";
import {
  toBoundedLimit,
  encodeCursor,
  decodeCursor,
} from "../../../shared/utils/pagination.js";
import { invalidateAuthStatus } from "../../../core/auth/auth.middleware.js";
import { DEVICE_STATUS } from "../constant/device.constants.js";

const SALT_ROUNDS = 10;
const DEFAULT_LIMIT = 10;
const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// ─── Private helpers ──────────────────────────────────────────────────────────

function generateShortDeviceId() {
  let id = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    id += ID_CHARS[bytes[i] % ID_CHARS.length];
  }
  return id;
}

function generateSecret() {
  return crypto.randomBytes(12).toString("hex");
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function createDevice(currentUser, payload) {
  if (
    currentUser.role !== "FRANCHISE_ADMIN" &&
    currentUser.role !== "OUTLET_MANAGER"
  ) {
    throw new AppError(
      "Only Franchise Admin or Outlet Manager can create devices",
      403,
    );
  }

  const { outletId, name, landingImage, landingTitle, landingSubtitle } =
    payload;

  if (!outletId) {
    throw new AppError("Outlet is required when creating a device", 400);
  }

  if (!currentUser.franchiseId) {
    throw new AppError("Franchise context is required", 403);
  }

  if (currentUser.role === "OUTLET_MANAGER") {
    if (!currentUser.outletId) {
      throw new AppError("Outlet context is required", 403);
    }
    if (outletId.toString() !== currentUser.outletId.toString()) {
      throw new AppError(
        "Outlet Manager can only create devices for their own outlet",
        403,
      );
    }
  }

  let deviceId;
  let attempts = 0;

  do {
    deviceId = generateShortDeviceId();
    const exists = await Device.findOne({ deviceId });
    if (!exists) break;
    attempts++;
    if (attempts >= 10) {
      throw new AppError("Failed to generate unique device ID", 500);
    }
  } while (true);

  const plainSecret = generateSecret();
  const deviceSecretHash = await bcrypt.hash(plainSecret, SALT_ROUNDS);

  const device = await Device.create({
    franchiseId: currentUser.franchiseId,
    outletId,
    deviceId,
    deviceSecretHash,
    name: name || null,
    createdBy: currentUser.userId,
    ...(landingImage && { landingImage }),
    ...(landingTitle && { landingTitle }),
    ...(landingSubtitle && { landingSubtitle }),
  });

  return { device, secret: plainSecret };
}

export async function listDevices(currentUser, query = {}) {
  const { search, status, franchiseId, outletId, cursor, limit } = query;
  const pageLimit = toBoundedLimit(limit, DEFAULT_LIMIT);
  const baseFilter = { isDeleted: false };

  if (currentUser.role === "SUPER_ADMIN") {
    if (franchiseId && franchiseId !== "ALL")
      baseFilter.franchiseId = franchiseId;
  } else {
    baseFilter.franchiseId = currentUser.franchiseId;
    if (currentUser.role === "OUTLET_MANAGER") {
      baseFilter.outletId = currentUser.outletId;
    }
  }

  // Outlet filter (for franchise admin / super admin)
  if (outletId && outletId !== "ALL" && currentUser.role !== "OUTLET_MANAGER") {
    baseFilter.outletId = outletId;
  }

  // Full-text search on deviceId and name
  if (search && search.trim()) {
    baseFilter.$or = [
      { deviceId: { $regex: search.trim(), $options: "i" } },
      { name: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Status filter
  if (status && status !== "ALL") baseFilter.status = status;

  const decodedCursor = decodeCursor(cursor);
  const cursorFilter = decodedCursor
    ? {
        $or: [
          { createdAt: { $lt: decodedCursor.createdAt } },
          {
            createdAt: decodedCursor.createdAt,
            _id: { $lt: decodedCursor._id },
          },
        ],
      }
    : null;

  const queryFilter = cursorFilter
    ? { $and: [baseFilter, cursorFilter] }
    : baseFilter;

  const [devicesPlusOne, totalMatching, totalDevices, activeDevices] =
    await Promise.all([
      Device.find(queryFilter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(pageLimit + 1),
      Device.countDocuments(baseFilter),
      Device.countDocuments({
        isDeleted: false,
        ...(currentUser.role === "SUPER_ADMIN"
          ? {}
          : { franchiseId: currentUser.franchiseId }),
      }),
      Device.countDocuments({
        isDeleted: false,
        status: DEVICE_STATUS.ACTIVE,
        ...(currentUser.role === "SUPER_ADMIN"
          ? {}
          : { franchiseId: currentUser.franchiseId }),
      }),
    ]);

  const hasNext = devicesPlusOne.length > pageLimit;
  const devices = hasNext ? devicesPlusOne.slice(0, pageLimit) : devicesPlusOne;

  const lastDevice = devices[devices.length - 1];
  const nextCursor =
    hasNext && lastDevice
      ? encodeCursor({ createdAt: lastDevice.createdAt, _id: lastDevice._id })
      : null;

  return {
    items: devices,
    meta: {
      pagination: { limit: pageLimit, hasNext, nextCursor, totalMatching },
      stats: { totalItems: totalDevices, activeItems: activeDevices },
    },
  };
}

export async function updateDevice(currentUser, deviceId, payload) {
  const device = await Device.findOne({
    deviceId,
    franchiseId: currentUser.franchiseId,
    isDeleted: false,
  });

  if (!device) {
    throw new AppError("Device not found", 404);
  }

  if (
    currentUser.role !== "FRANCHISE_ADMIN" &&
    currentUser.role !== "OUTLET_MANAGER"
  ) {
    throw new AppError(
      "Only Franchise Admin or Outlet Manager can update devices",
      403,
    );
  }

  if (currentUser.role === "OUTLET_MANAGER") {
    if (device.outletId.toString() !== currentUser.outletId.toString()) {
      throw new AppError(
        "Outlet Manager can only update devices in their own outlet",
        403,
      );
    }
  }

  if (payload.name !== undefined) {
    device.name = payload.name;
  }

  await device.save();
  return device;
}

export async function softDeleteDevice(currentUser, deviceId) {
  if (
    currentUser.role !== "FRANCHISE_ADMIN" &&
    currentUser.role !== "OUTLET_MANAGER"
  ) {
    throw new AppError(
      "Only Franchise Admin or Outlet Manager can delete devices",
      403,
    );
  }

  const device = await Device.findOne({
    deviceId,
    franchiseId: currentUser.franchiseId,
    isDeleted: false,
  });

  if (!device) {
    throw new AppError("Device not found", 404);
  }

  if (currentUser.role === "OUTLET_MANAGER") {
    if (device.outletId.toString() !== currentUser.outletId.toString()) {
      throw new AppError(
        "Outlet Manager can only delete devices in their own outlet",
        403,
      );
    }
  }

  device.isDeleted = true;
  await device.save();

  // Bust auth cache so next request from this device is rejected immediately
  await invalidateAuthStatus("device", deviceId);

  return true;
}

export async function resetDeviceSecret(currentUser, deviceId) {
  if (currentUser.role !== "FRANCHISE_ADMIN") {
    throw new AppError("Only Franchise Admin can reset device secret", 403);
  }

  const device = await Device.findOne({
    deviceId,
    franchiseId: currentUser.franchiseId,
    isDeleted: false,
  }).select("+deviceSecretHash");

  if (!device) {
    throw new AppError("Device not found", 404);
  }

  const newSecret = generateSecret();
  device.deviceSecretHash = await bcrypt.hash(newSecret, SALT_ROUNDS);
  await device.save();

  return { newSecret };
}

export async function updateHeartbeat(deviceUser, metadata, ip) {
  await Device.updateOne(
    { deviceId: deviceUser.deviceId },
    {
      lastSeenAt: new Date(),
      appVersion: metadata.appVersion,
      osVersion: metadata.osVersion,
      ipAddress: ip,
    },
  );
}

export async function setDeviceStatus(currentUser, deviceId, status) {
  if (
    currentUser.role !== "FRANCHISE_ADMIN" &&
    currentUser.role !== "OUTLET_MANAGER"
  ) {
    throw new AppError(
      "Only Franchise Admin or Outlet Manager can change device status",
      403,
    );
  }

  if (!Object.values(DEVICE_STATUS).includes(status)) {
    throw new AppError("Invalid status value", 400);
  }

  const device = await Device.findOne({
    deviceId,
    franchiseId: currentUser.franchiseId,
    isDeleted: false,
  });

  if (!device) {
    throw new AppError("Device not found", 404);
  }

  if (currentUser.role === "OUTLET_MANAGER") {
    if (device.outletId.toString() !== currentUser.outletId.toString()) {
      throw new AppError(
        "Outlet Manager can only change status of devices in their own outlet",
        403,
      );
    }
  }

  device.status = status;
  await device.save();

  // Bust auth cache immediately so the new status takes effect on next request
  await invalidateAuthStatus("device", deviceId);

  // Force deactivated devices off immediately
  if (status === DEVICE_STATUS.INACTIVE) {
    forceLogout("device", deviceId);
  }

  return device;
}
