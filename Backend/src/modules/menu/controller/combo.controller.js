import * as comboService from "../combo.service.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";

export const getCombos = asyncHandler(async (req, res) => {
  const result = await comboService.getCombos(req.tenant);
  return sendSuccess(res, {
    message: "Combos fetched successfully",
    data: result,
  });
});

export const createCombo = asyncHandler(async (req, res) => {
  const result = await comboService.createCombo(req.body, req.tenant);
  return sendSuccess(res, {
    statusCode: 202,
    message: "Combo creation queued",
    data: result,
  });
});

export const updateCombo = asyncHandler(async (req, res) => {
  const result = await comboService.updateCombo(
    req.params.id,
    req.body,
    req.tenant,
  );
  return sendSuccess(res, {
    statusCode: 202,
    message: "Combo update queued",
    data: result,
  });
});

export const deleteCombo = asyncHandler(async (req, res) => {
  await comboService.deleteCombo(req.params.id, req.tenant);
  return sendSuccess(res, {
    statusCode: 202,
    message: "Combo deletion queued",
  });
});
