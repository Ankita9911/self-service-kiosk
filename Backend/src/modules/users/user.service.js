import bcrypt from "bcrypt";
import User from "./user.model.js";
import AppError from "../../shared/errors/AppError.js";
import { ROLE_HIERARCHY } from "../../core/rbac/roleHierarchy.js";
import crypto from "crypto";

function generateTempPassword() {
  return crypto.randomBytes(6).toString("hex");
}

const SALT_ROUNDS = 10;

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

function ensureHigherRole(creatorRole, targetRole) {
  if (ROLE_HIERARCHY[creatorRole] <= ROLE_HIERARCHY[targetRole]) {
    throw new AppError("Insufficient hierarchy level", 403);
  }
}

function ensureSameTenant(currentUser, targetUser) {
  if (currentUser.role === "SUPER_ADMIN") return;

  if (
    currentUser.franchiseId?.toString() !==
    targetUser.franchiseId?.toString()
  ) {
    throw new AppError("Cross-tenant access denied", 403);
  }
}

/* -------------------------------------------------------
   Create User
------------------------------------------------------- */

const OUTLET_SCOPED_ROLES = [
  "OUTLET_MANAGER",
  "KITCHEN_STAFF",
  "PICKUP_STAFF",
  "KIOSK_DEVICE",
];

export async function createUser(currentUser, payload) {
  const { name, email, role, franchiseId: payloadFranchiseId, outletId: payloadOutletId } = payload;

  ensureHigherRole(currentUser.role, role);

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already exists", 400);
  }

  let franchiseId = currentUser.franchiseId || null;
  let outletId = payloadOutletId || null;

  if (currentUser.role === "SUPER_ADMIN") {
    // SUPER_ADMIN must provide franchiseId for any non–platform-level user
    if (role !== "SUPER_ADMIN" && !payloadFranchiseId) {
      throw new AppError("Franchise is required when creating this role", 400);
    }
    franchiseId = payloadFranchiseId || null;
    if (OUTLET_SCOPED_ROLES.includes(role) && !payloadOutletId) {
      throw new AppError("Outlet is required for this role", 400);
    }
    outletId = payloadOutletId || null;
  } else if (currentUser.role === "FRANCHISE_ADMIN") {
    franchiseId = currentUser.franchiseId;
    if (OUTLET_SCOPED_ROLES.includes(role)) {
      if (!payloadOutletId) {
        throw new AppError("Outlet is required for this role", 400);
      }
      outletId = payloadOutletId;
    }
  } else if (currentUser.role === "OUTLET_MANAGER") {
    franchiseId = currentUser.franchiseId;
    outletId = currentUser.outletId;
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    franchiseId,
    outletId,
    mustChangePassword: true,
  });

  return {
    user,
    tempPassword,
  };
}

/* -------------------------------------------------------
   List Users
------------------------------------------------------- */

export async function listUsers(currentUser) {
  const filter = { isDeleted: false };

  if (currentUser.role !== "SUPER_ADMIN") {
    filter.franchiseId = currentUser.franchiseId;
  }

  if (currentUser.role === "OUTLET_MANAGER") {
    filter.outletId = currentUser.outletId;
  }

  return User.find(filter);
}

/* -------------------------------------------------------
   Get User
------------------------------------------------------- */

export async function getUser(currentUser, id) {
  const user = await User.findById(id);

  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404);
  }

  ensureSameTenant(currentUser, user);

  return user;
}

/* -------------------------------------------------------
   Update User
------------------------------------------------------- */

export async function updateUser(currentUser, id, payload) {
  const user = await User.findById(id);

  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404);
  }

  ensureSameTenant(currentUser, user);
  ensureHigherRole(currentUser.role, user.role);

  Object.assign(user, payload);

  await user.save();

  return user;
}

/* -------------------------------------------------------
   Soft Delete
------------------------------------------------------- */

export async function deleteUser(currentUser, id) {
  const user = await User.findById(id);

  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404);
  }

  if (currentUser.userId === id) {
    throw new AppError("Cannot delete yourself", 400);
  }

  ensureSameTenant(currentUser, user);
  ensureHigherRole(currentUser.role, user.role);

  user.isDeleted = true;
  await user.save();

  return true;
}

/* -------------------------------------------------------
   Change Role
------------------------------------------------------- */

export async function changeUserRole(currentUser, id, newRole) {
  const user = await User.findById(id);

  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404);
  }

  ensureSameTenant(currentUser, user);

  ensureHigherRole(currentUser.role, user.role);
  ensureHigherRole(currentUser.role, newRole);

  user.role = newRole;
  await user.save();

  return user;
}

/* -------------------------------------------------------
   Change Status
------------------------------------------------------- */

export async function changeUserStatus(currentUser, id, status) {
  const user = await User.findById(id);

  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404);
  }

  if (currentUser.userId === id) {
    throw new AppError("Cannot change your own status", 400);
  }

  ensureSameTenant(currentUser, user);
  ensureHigherRole(currentUser.role, user.role);

  user.status = status;
  await user.save();

  return user;
}

/* -------------------------------------------------------
   Reset Password
------------------------------------------------------- */

export async function resetPassword(currentUser, id, newPassword) {
  const user = await User.findById(id).select("+passwordHash");

  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404);
  }

  ensureSameTenant(currentUser, user);
  ensureHigherRole(currentUser.role, user.role);

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();

  return true;
}
