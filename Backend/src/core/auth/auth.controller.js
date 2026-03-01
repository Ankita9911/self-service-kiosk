import AppError from "../../shared/errors/AppError.js";
import { login, forceResetPassword } from "./auth.service.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import env from "../../config/env.js";

const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 12 * 60 * 60 * 1000, // 12 hours
};

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(
      "Email and password are required",
      400,
      "VALIDATION_ERROR"
    );
  }

  const result = await login({ email, password });

  res.cookie(COOKIE_NAME, result.token, COOKIE_OPTIONS);

  return sendSuccess(res, {
    message: "Login successful",
    data: {
      user: result.user,
      mustChangePassword: result.mustChangePassword,
    },
  });
});

export const logoutController = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  });

  return sendSuccess(res, { message: "Logged out successfully" });
});

export const meController = asyncHandler(async (req, res) => {
  return sendSuccess(res, { data: { user: req.user } });
});

export const forceResetPasswordController = asyncHandler(async (req, res) => {
  const userId = req.user?.userId ?? req.user?.id;
  const currentPassword = req.body?.currentPassword;
  const newPassword = req.body?.password;

  if (!userId) {
    throw new AppError(
      "Unauthorized",
      401,
      "AUTH_REQUIRED"
    );
  }

  if (!currentPassword || typeof currentPassword !== "string") {
    throw new AppError(
      "Current password is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  if (!newPassword || typeof newPassword !== "string") {
    throw new AppError(
      "New password is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  await forceResetPassword(
    String(userId),
    currentPassword,
    newPassword
  );

  return sendSuccess(res, {
    message: "Password reset successfully",
  });
});