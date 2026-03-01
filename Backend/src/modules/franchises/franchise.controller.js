import {
  createFranchise,
  getFranchises,
  getFranchiseById,
  updateFranchise,
  deleteFranchise,
  setFranchiseStatus,
} from "./franchise.service.js";

import { sendSuccess } from "../../shared/utils/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import AppError from "../../shared/errors/AppError.js";


export const createFranchiseController = asyncHandler(async (req, res) => {
  const franchise = await createFranchise(
    req.body,
    req.user
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: "Franchise created successfully",
    data: franchise,
  });
});

export const getFranchisesController = asyncHandler(async (req, res) => {
  const franchises = await getFranchises(req.user);

  return sendSuccess(res, {
    message: "Franchises fetched successfully",
    data: franchises,
  });
});

export const getFranchiseByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(
      "Franchise ID is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  const franchise = await getFranchiseById(
    id,
    req.user
  );

  return sendSuccess(res, {
    message: "Franchise fetched successfully",
    data: franchise,
  });
});

export const updateFranchiseController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(
      "Franchise ID is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  const franchise = await updateFranchise(
    id,
    req.body,
    req.user
  );

  return sendSuccess(res, {
    message: "Franchise updated successfully",
    data: franchise,
  });
});

export const deleteFranchiseController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(
      "Franchise ID is required",
      400,
      "VALIDATION_ERROR"
    );
  }
  await deleteFranchise(id, req.user);

  return sendSuccess(res, {
    message: "Franchise deleted successfully",
  });
});

export const setFranchiseStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    throw new AppError("Franchise ID is required", 400, "VALIDATION_ERROR");
  }

  const franchise = await setFranchiseStatus(id, status, req.user);

  return sendSuccess(res, {
    message: `Franchise marked as ${status.toLowerCase()} successfully`,
    data: franchise,
  });
});