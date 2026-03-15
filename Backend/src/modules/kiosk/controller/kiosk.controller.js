import * as kioskService from "../service/kiosk.service.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";

export const getMenu = asyncHandler(async (req, res) => {
  const result = await kioskService.getKioskMenu(req.tenant);
  return sendSuccess(res, {
    message: "Kiosk menu fetched successfully",
    data: result,
  });
});

export const getCombos = asyncHandler(async (req, res) => {
  const result = await kioskService.getKioskCombos(req.tenant);
  return sendSuccess(res, {
    message: "Kiosk combos fetched successfully",
    data: result,
  });
});
