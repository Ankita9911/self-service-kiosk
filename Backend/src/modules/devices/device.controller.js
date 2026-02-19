import * as service from "./device.service.js";

export async function createDeviceController(req, res, next) {
  try {
    const result = await service.createDevice(req.user, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listDevicesController(req, res, next) {
  try {
    const result = await service.listDevices(req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateDeviceController(req, res, next) {
  try {
    const result = await service.updateDevice(
      req.user,
      req.params.deviceId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteDeviceController(req, res, next) {
  try {
    await service.softDeleteDevice(req.user, req.params.deviceId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function resetSecretController(req, res, next) {
  try {
    const result = await service.resetDeviceSecret(
      req.user,
      req.params.deviceId
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function heartbeatController(req, res, next) {
  try {
    await service.updateHeartbeat(req.user, req.body, req.ip);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
