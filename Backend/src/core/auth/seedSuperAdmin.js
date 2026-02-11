import bcrypt from "bcrypt";
import User from "../../modules/users/user.model.js";

const DEFAULT_SUPER_ADMIN = {
  name: "Platform Admin",
  email: "admin@hyperkitchenhub.com",
  password: "ChangeMe123!",
  role: "SUPER_ADMIN",
};

export async function seedSuperAdmin() {
  const existing = await User.findOne({ role: "SUPER_ADMIN" });

  if (existing) {
    console.log("👤 SUPER_ADMIN already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_SUPER_ADMIN.password, 10);

  await User.create({
    name: DEFAULT_SUPER_ADMIN.name,
    email: DEFAULT_SUPER_ADMIN.email,
    passwordHash,
    role: DEFAULT_SUPER_ADMIN.role,
    status: "ACTIVE",
  });

  console.log("✅ SUPER_ADMIN seeded successfully");
  console.log("⚠ Default login credentials:");
  console.log("   Email:", DEFAULT_SUPER_ADMIN.email);
  console.log("   Password:", DEFAULT_SUPER_ADMIN.password);
}
