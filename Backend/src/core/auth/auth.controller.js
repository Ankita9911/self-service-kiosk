import AppError from "../../shared/errors/AppError.js";
import { login, forceResetPassword } from "./auth.service.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

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

  return sendSuccess(res, {
    message: "Login successful",
    data: result,
  });
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