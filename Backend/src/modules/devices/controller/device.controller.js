import * as service from "../service/device.service.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";

export const createDeviceController = asyncHandler(async (req, res) => {
  const result = await service.createDevice(req.user, req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Device created successfully",
    data: result,
  });
});

export const listDevicesController = asyncHandler(async (req, res) => {
  const result = await service.listDevices(req.user, req.query);

  return sendSuccess(res, {
    message: "Devices fetched successfully",
    data: result.items,
    meta: result.meta,
  });
});

export const updateDeviceController = asyncHandler(async (req, res) => {
  const result = await service.updateDevice(
    req.user,
    req.params.deviceId,
    req.body,
  );

  return sendSuccess(res, {
    message: "Device updated successfully",
    data: result,
  });
});

export const deleteDeviceController = asyncHandler(async (req, res) => {
  await service.softDeleteDevice(req.user, req.params.deviceId);

  return sendSuccess(res, {
    message: "Device deleted successfully",
  });
});

export const resetSecretController = asyncHandler(async (req, res) => {
  const result = await service.resetDeviceSecret(req.user, req.params.deviceId);

  return sendSuccess(res, {
    message: "Device secret reset successfully",
    data: result,
  });
});

export const heartbeatController = asyncHandler(async (req, res) => {
  await service.updateHeartbeat(req.user, req.body, req.ip);

  return sendSuccess(res, {
    message: "Heartbeat recorded successfully",
  });
});

export const setDeviceStatusController = asyncHandler(async (req, res) => {
  const result = await service.setDeviceStatus(
    req.user,
    req.params.deviceId,
    req.body.status,
  );

  return sendSuccess(res, {
    message: "Device status updated successfully",
    data: result,
  });
});
