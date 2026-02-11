import bcrypt from "bcrypt";
import User from "../../modules/users/user.model.js";
import AppError from "../../shared/errors/AppError.js";
import { generateToken } from "./jwt.service.js";

export async function login({ email, password }) {
  const user = await User.findOne({ email })
    .select("+passwordHash");
  if (!user) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }
  if (user.status !== "ACTIVE") {
    throw new AppError("Account is suspended", 403, "ACCOUNT_SUSPENDED");
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
  };
}
