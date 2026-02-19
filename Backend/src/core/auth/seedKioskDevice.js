import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../../modules/users/user.model.js";

export async function seedKioskDevice() {
  const existing = await User.findOne({
    role: "KIOSK_DEVICE",
  });

  if (existing) {
    console.log("🖥 KIOSK_DEVICE already exists");
    return;
  }

  const franchiseId = new mongoose.Types.ObjectId(
    "69969d1b0320ad900aeb1eb2"
  );

  const outletId = new mongoose.Types.ObjectId(
    "6996a6352cd471f1ffbd6201"
  );

  const password = "Kiosk123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name: "Development Kiosk Device",
    email: "kiosk@hyperkitchenhub.com",
    passwordHash,
    role: "KIOSK_DEVICE",
    franchiseId,
    outletId,
    status: "ACTIVE",
  });

  console.log("✅ KIOSK_DEVICE seeded successfully");
  console.log("Email: kiosk@hyperkitchenhub.com");
  console.log("Password:", password);
}
seedKioskDevice();