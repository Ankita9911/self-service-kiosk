import * as kioskService from "./kiosk.service.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const getMenu = asyncHandler(async (req, res) => {
  const result = await kioskService.getKioskMenu(req.tenant);

  return sendSuccess(res, {
    message: "Kiosk menu fetched successfully",
    data: result,
  });
});