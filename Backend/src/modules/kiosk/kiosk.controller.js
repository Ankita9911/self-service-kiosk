import * as kioskService from "./kiosk.service.js";

export async function getMenu(req, res, next) {
  try {
    const result = await kioskService.getKioskMenu(req.tenant);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
