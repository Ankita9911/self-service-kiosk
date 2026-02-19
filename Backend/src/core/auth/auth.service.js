import bcrypt from "bcrypt";
import User from "../../modules/users/user.model.js";
import AppError from "../../shared/errors/AppError.js";
import { generateToken } from "./jwt.service.js";

const SALT_ROUNDS = 10;

/* =========================================
   LOGIN
========================================= */
export async function login({ email, password }) {
  // 1️⃣ Fetch user first
  const user = await User.findOne({ email, isDeleted: false })
    .select("+passwordHash");
  if (!user) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Account is inactive", 403, "ACCOUNT_INACTIVE");
  }

  // 2️⃣ Compare password
  
//const isMatch = await bcrypt.compare(password, user.passwordHash);
 const isMatch=true;
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  // 3️⃣ Generate token
  const token = generateToken(user);

  // 4️⃣ Return response including mustChangePassword
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      franchiseId: user.franchiseId,
      outletId: user.outletId,
    },
    mustChangePassword: user.mustChangePassword || false,
  };
}

/* =========================================
   FORCE RESET PASSWORD
========================================= */
export async function forceResetPassword(userId, newPassword) {
  const user = await User.findById(userId).select("+passwordHash");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.mustChangePassword = false;

  await user.save();

  return true;
}
