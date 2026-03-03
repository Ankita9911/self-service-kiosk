import * as service from "./user.service.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const createUserController = asyncHandler(async (req, res) => {
  const result = await service.createUser(req.user, req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: "User created successfully",
    data: result,
  });
});

export const listUsersController = asyncHandler(async (req, res) => {
  const result = await service.listUsers(req.user, req.query);

  return sendSuccess(res, {
    message: "Users fetched successfully",
    data: result,
  });
});

export const getUserController = asyncHandler(async (req, res) => {
  const result = await service.getUser(req.user, req.params.id);

  return sendSuccess(res, {
    message: "User fetched successfully",
    data: result,
  });
});

export const updateUserController = asyncHandler(async (req, res) => {
  const result = await service.updateUser(
    req.user,
    req.params.id,
    req.body
  );

  return sendSuccess(res, {
    message: "User updated successfully",
    data: result,
  });
});


export const deleteUserController = asyncHandler(async (req, res) => {
  await service.deleteUser(req.user, req.params.id);

  return sendSuccess(res, {
    message: "User deleted successfully",
  });
});

export const changeRoleController = asyncHandler(async (req, res) => {
  const result = await service.changeUserRole(
    req.user,
    req.params.id,
    req.body.role
  );

  return sendSuccess(res, {
    message: "User role updated successfully",
    data: result,
  });
});

export const changeStatusController = asyncHandler(async (req, res) => {
  const result = await service.changeUserStatus(
    req.user,
    req.params.id,
    req.body.status
  );

  return sendSuccess(res, {
    message: "User status updated successfully",
    data: result,
  });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  await service.resetPassword(
    req.user,
    req.params.id,
    req.body.password
  );

  return sendSuccess(res, {
    message: "Password reset successfully",
  });
});