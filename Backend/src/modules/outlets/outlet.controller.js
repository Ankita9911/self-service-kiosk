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
import AppError from "../../shared/errors/AppError.js";

export const createOutletController = asyncHandler(async (req, res) => {
  const outlet = await createOutlet(req.body, req.user);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Outlet created successfully",
    data: outlet,
  });
});

export const getOutletsController = asyncHandler(async (req, res) => {
  const outlets = await getOutlets(req.user);

  return sendSuccess(res, {
    message: "Outlets fetched successfully",
    data: outlets,
  });
});


export const getOutletByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Outlet ID is required", 400, "VALIDATION_ERROR");
  }

  const outlet = await getOutletById(id, req.user);

  return sendSuccess(res, {
    message: "Outlet fetched successfully",
    data: outlet,
  });
});

export const updateOutletController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Outlet ID is required", 400, "VALIDATION_ERROR");
  }

  const outlet = await updateOutlet(id, req.body, req.user);

  return sendSuccess(res, {
    message: "Outlet updated successfully",
    data: outlet,
  });
});

export const deleteOutletController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Outlet ID is required", 400, "VALIDATION_ERROR");
  }

  await deleteOutlet(id, req.user);

  return sendSuccess(res, {
    message: "Outlet deleted successfully",
  });
});

export const setOutletStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    throw new AppError("Outlet ID is required", 400, "VALIDATION_ERROR");
  }

  const outlet = await setOutletStatus(id, status, req.user);

  return sendSuccess(res, {
    message: `Outlet marked as ${status.toLowerCase()} successfully`,
    data: outlet,
  });
});