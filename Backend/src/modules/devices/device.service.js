import bcrypt from "bcrypt";
import crypto from "crypto";
import Device from "./device.model.js";
import AppError from "../../shared/errors/AppError.js";
//import { ROLE_HIERARCHY } from "../../core/rbac/roleHierarchy.js";

const SALT_ROUNDS = 10;

function generateSecret() {
  return crypto.randomBytes(12).toString("hex");
}

export async function createDevice(currentUser, payload) {
  if (currentUser.role !== "FRANCHISE_ADMIN") {
    throw new AppError("Only Franchise Admin can create devices", 403);
  }

  const { outletId, name } = payload;

  const deviceId = crypto.randomUUID().toUpperCase();
  const plainSecret = generateSecret();
  const deviceSecretHash = await bcrypt.hash(plainSecret, SALT_ROUNDS);

  const device = await Device.create({
    franchiseId: currentUser.franchiseId,
    outletId,
    deviceId,
    deviceSecretHash,
    name,
    createdBy: currentUser.userId,
  });

  return {
    device,
    secret: plainSecret, // return once
  };
}

export async function listDevices(currentUser) {
  const filter = { isDeleted: false };

  if (currentUser.role === "SUPER_ADMIN") {
    return Device.find(filter);
  }

  filter.franchiseId = currentUser.franchiseId;

  if (currentUser.role === "OUTLET_MANAGER") {
    filter.outletId = currentUser.outletId;
  }

  return Device.find(filter);
}

export async function updateDevice(currentUser, deviceId, payload) {
  const device = await Device.findOne({
    deviceId,
    isDeleted: false,
  });

  if (!device) {
    throw new AppError("Device not found", 404);
  }

  if (
    currentUser.role !== "FRANCHISE_ADMIN" &&
    currentUser.role !== "OUTLET_MANAGER"
  ) {
    throw new AppError("Forbidden", 403);
  }

  Object.assign(device, payload);
  await device.save();

  return device;
}

export async function softDeleteDevice(currentUser, deviceId) {
  if (currentUser.role !== "FRANCHISE_ADMIN") {
    throw new AppError("Only Franchise Admin can delete devices", 403);
  }

  const device = await Device.findOne({
    deviceId,
    franchiseId: currentUser.franchiseId,
    isDeleted: false,
  });

  if (!device) {
    throw new AppError("Device not found", 404);
  }

  device.isDeleted = true;
  await device.save();

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
    }
  );
}
