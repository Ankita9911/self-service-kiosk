import { deviceLogin } from "./device.auth.service.js";

export async function deviceLoginController(req, res, next) {
  try {
    const result = await deviceLogin(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
