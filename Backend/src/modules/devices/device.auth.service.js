import bcrypt from "bcrypt";
import Device from "./device.model.js";
import AppError from "../../shared/errors/AppError.js";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";

export async function deviceLogin({ deviceId, password }) {
  const device = await Device.findOne({
    deviceId,
    isDeleted: false,
  }).select("+deviceSecretHash");

  if (!device) {
    throw new AppError("Invalid credentials", 401);
  }

  if (device.status !== "ACTIVE") {
    throw new AppError("Device inactive", 403);
  }

  const match = await bcrypt.compare(password, device.deviceSecretHash);

  if (!match) {
    throw new AppError("Invalid credentials", 401);
  }

  // Record when login happened so "Last Seen" is always up-to-date
  device.lastSeenAt = new Date();
  await device.save();

  const token = jwt.sign(
    {
      deviceId: device.deviceId,
      franchiseId: device.franchiseId,
      outletId: device.outletId,
      role: "KIOSK_DEVICE",
      type: "DEVICE",
    },
    env.JWT_SECRET,
    { expiresIn: "6h" },
  );

  return {
    token,
    landingImage: device.landingImage || null,
    landingTitle: device.landingTitle || null,
    landingSubtitle: device.landingSubtitle || null,
  };
}
