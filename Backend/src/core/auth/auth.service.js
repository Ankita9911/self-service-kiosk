import bcrypt from "bcrypt";
import User from "../../modules/users/user.model.js";
import AppError from "../../shared/errors/AppError.js";
import { generateToken } from "./jwt.service.js";

const SALT_ROUNDS = 10;
export async function login({ email, password }) {
  // 1️⃣ Fetch user first
  const user = await User.findOne({ email, isDeleted: false })
    .select("+passwordHash");
  console.log("user",user);
  if (!user) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Account is inactive", 403, "ACCOUNT_INACTIVE");
  }

const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }


  const token = generateToken(user);

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
