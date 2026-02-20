import AppError from "../../shared/errors/AppError.js";
import { login, forceResetPassword } from "./auth.service.js";

export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await login({ email, password });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
export async function forceResetPasswordController(req, res, next) {
  try {
    const userId = req.user?.userId ?? req.user?.id;
    const newPassword = req.body?.password;
    if (!userId || !newPassword || typeof newPassword !== "string") {
      return next(new AppError("New password is required", 400));
    }
    await forceResetPassword(String(userId), newPassword);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
