import { deviceLogin } from "./device.auth.service.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const deviceLoginController = asyncHandler(async (req, res) => {
  const result = await deviceLogin(req.body);

  return sendSuccess(res, {
    message: "Device login successful",
    data: result,
  });
});