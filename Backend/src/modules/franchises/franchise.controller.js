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

export const createFranchiseController = asyncHandler(async (req, res) => {
  const franchise = await createFranchise(req.body, req.user);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Franchise created successfully",
    data: franchise,
  });
});

export const getFranchisesController = asyncHandler(async (req, res) => {
  const result = await getFranchises(req.user, req.query);

  return sendSuccess(res, {
    message: "Franchises fetched successfully",
    data: result.items,
    meta: result.meta,
  });
});

export const getFranchiseByIdController = asyncHandler(async (req, res) => {
  const franchise = await getFranchiseById(req.params.id, req.user);

  return sendSuccess(res, {
    message: "Franchise fetched successfully",
    data: franchise,
  });
});

export const updateFranchiseController = asyncHandler(async (req, res) => {
  const franchise = await updateFranchise(req.params.id, req.body, req.user);

  return sendSuccess(res, {
    message: "Franchise updated successfully",
    data: franchise,
  });
});

export const deleteFranchiseController = asyncHandler(async (req, res) => {
  await deleteFranchise(req.params.id, req.user);

  return sendSuccess(res, {
    message: "Franchise deleted successfully",
  });
});

export const setFranchiseStatusController = asyncHandler(async (req, res) => {
  const franchise = await setFranchiseStatus(
    req.params.id,
    req.body.status,
    req.user,
  );

  return sendSuccess(res, {
    message: `Franchise marked as ${req.body.status.toLowerCase()} successfully`,
    data: franchise,
  });
});
