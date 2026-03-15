import { login, forceResetPassword } from "../service/auth.service.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import env from "../../../config/env.js";

const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 12 * 60 * 60 * 1000,
};

export const loginController = asyncHandler(async (req, res) => {
  const result = await login({
    email: req.body.email,
    password: req.body.password,
  });

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

  await forceResetPassword(
    String(userId),
    req.body.currentPassword,
    req.body.password,
  );

  return sendSuccess(res, { message: "Password reset successfully" });
});
