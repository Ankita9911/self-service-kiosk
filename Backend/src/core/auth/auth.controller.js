import { login } from "./auth.service.js";

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
