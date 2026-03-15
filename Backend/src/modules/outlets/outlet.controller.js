import {
  createOutlet,
  getOutlets,
  getOutletById,
  updateOutlet,
  deleteOutlet,
  setOutletStatus,
} from "./outlet.service.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const createOutletController = asyncHandler(async (req, res) => {
  const outlet = await createOutlet(req.body, req.user);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Outlet created successfully",
    data: outlet,
  });
});

export const getOutletsController = asyncHandler(async (req, res) => {
  const result = await getOutlets(req.user, req.query);

  return sendSuccess(res, {
    message: "Outlets fetched successfully",
    data: result.items,
    meta: result.meta,
  });
});

export const getOutletByIdController = asyncHandler(async (req, res) => {
  const outlet = await getOutletById(req.params.id, req.user);

  return sendSuccess(res, {
    message: "Outlet fetched successfully",
    data: outlet,
  });
});

export const updateOutletController = asyncHandler(async (req, res) => {
  const outlet = await updateOutlet(req.params.id, req.body, req.user);

  return sendSuccess(res, {
    message: "Outlet updated successfully",
    data: outlet,
  });
});

export const deleteOutletController = asyncHandler(async (req, res) => {
  await deleteOutlet(req.params.id, req.user);

  return sendSuccess(res, {
    message: "Outlet deleted successfully",
  });
});

export const setOutletStatusController = asyncHandler(async (req, res) => {
  const outlet = await setOutletStatus(req.params.id, req.body.status, req.user);

  return sendSuccess(res, {
    message: `Outlet marked as ${req.body.status.toLowerCase()} successfully`,
    data: outlet,
  });
});
