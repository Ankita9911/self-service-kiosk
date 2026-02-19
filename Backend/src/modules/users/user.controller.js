import * as service from "./user.service.js";

export async function createUserController(req, res, next) {
  try {
    const result = await service.createUser(req.user, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listUsersController(req, res, next) {
  try {
    const result = await service.listUsers(req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getUserController(req, res, next) {
  try {
    const result = await service.getUser(req.user, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateUserController(req, res, next) {
  try {
    const result = await service.updateUser(
      req.user,
      req.params.id,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteUserController(req, res, next) {
  try {
    await service.deleteUser(req.user, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function changeRoleController(req, res, next) {
  try {
    const result = await service.changeUserRole(
      req.user,
      req.params.id,
      req.body.role
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function changeStatusController(req, res, next) {
  try {
    const result = await service.changeUserStatus(
      req.user,
      req.params.id,
      req.body.status
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordController(req, res, next) {
  try {
    await service.resetPassword(
      req.user,
      req.params.id,
      req.body.password
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
