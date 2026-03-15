import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../model/user.model.js";
import AppError from "../../../shared/errors/AppError.js";
import { ROLE_HIERARCHY } from "../../../core/rbac/roleHierarchy.js";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../../../core/email/email.service.js";
import { forceLogout } from "../../../realtime/realtime.manager.js";
import {
  toBoundedLimit,
  encodeCursor,
  decodeCursor,
} from "../../../shared/utils/pagination.js";
import { invalidateAuthStatus } from "../../../core/auth/auth.middleware.js";
import { USER_ROLE, USER_STATUS } from "../constant/user.constants.js";

const DEFAULT_LIMIT = 10;
const SALT_ROUNDS = 10;

const OUTLET_SCOPED_ROLES = [
  USER_ROLE.OUTLET_MANAGER,
  USER_ROLE.KITCHEN_STAFF,
  USER_ROLE.PICKUP_STAFF,
  USER_ROLE.KIOSK_DEVICE,
];

const SUPER_ADMIN_CREATABLE_ROLES = [USER_ROLE.FRANCHISE_ADMIN];

// ─── Private helpers ──────────────────────────────────────────────────────────

function generateTempPassword() {
  return crypto.randomBytes(6).toString("hex");
}

function ensureHigherRole(creatorRole, targetRole) {
  if (ROLE_HIERARCHY[creatorRole] <= ROLE_HIERARCHY[targetRole]) {
    throw new AppError("Insufficient hierarchy level", 403);
  }
}

function ensureSameTenant(currentUser, targetUser) {
  if (currentUser.role === USER_ROLE.SUPER_ADMIN) return;

  if (
    currentUser.franchiseId?.toString() !== targetUser.franchiseId?.toString()
  ) {
    throw new AppError("Cross-tenant access denied", 403);
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function createUser(currentUser, payload) {
  const {
    name,
    email,
    role,
    franchiseId: payloadFranchiseId,
    outletId: payloadOutletId,
  } = payload;

  ensureHigherRole(currentUser.role, role);

  if (
    currentUser.role === USER_ROLE.SUPER_ADMIN &&
    !SUPER_ADMIN_CREATABLE_ROLES.includes(role)
  ) {
    throw new AppError(
      "Super admins can only create Franchise Admin accounts",
      403,
    );
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already exists", 400);
  }

  let franchiseId = currentUser.franchiseId || null;
  let outletId = payloadOutletId || null;

  if (currentUser.role === USER_ROLE.SUPER_ADMIN) {
    if (role !== USER_ROLE.SUPER_ADMIN && !payloadFranchiseId) {
      throw new AppError("Franchise is required when creating this role", 400);
    }
    franchiseId = payloadFranchiseId || null;
    if (OUTLET_SCOPED_ROLES.includes(role) && !payloadOutletId) {
      throw new AppError("Outlet is required for this role", 400);
    }
    outletId = payloadOutletId || null;
  } else if (currentUser.role === USER_ROLE.FRANCHISE_ADMIN) {
    franchiseId = currentUser.franchiseId;
    if (OUTLET_SCOPED_ROLES.includes(role)) {
      if (!payloadOutletId) {
        throw new AppError("Outlet is required for this role", 400);
      }
      outletId = payloadOutletId;
    }
  } else if (currentUser.role === USER_ROLE.OUTLET_MANAGER) {
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

  // Fire-and-forget — never block the response
  sendWelcomeEmail({ name, email, tempPassword, role }).catch(() => {});

  return { user, tempPassword };
}

export async function listUsers(currentUser, query = {}) {
  const {
    search,
    role: roleFilter,
    franchiseId,
    outletId,
    status,
    cursor,
    limit,
  } = query;
  const pageLimit = toBoundedLimit(limit, DEFAULT_LIMIT);

  const currentLevel = ROLE_HIERARCHY[currentUser.role] ?? 0;

  // Only show roles strictly below the caller's hierarchy level
  const subordinateRoles = Object.entries(ROLE_HIERARCHY)
    .filter(([, level]) => level < currentLevel)
    .map(([role]) => role);

  const baseFilter = {
    isDeleted: false,
    _id: { $ne: currentUser._id },
  };

  // Role filter — validate requested role is a subordinate role
  if (roleFilter && roleFilter !== "ALL") {
    baseFilter.role = subordinateRoles.includes(roleFilter)
      ? roleFilter
      : { $in: [] };
  } else {
    baseFilter.role = { $in: subordinateRoles };
  }

  // Full-text search on name and email
  if (search && search.trim()) {
    baseFilter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Status filter
  if (status && status !== "ALL") baseFilter.status = status;

  // Scope to caller's franchise (SUPER_ADMIN sees all)
  if (currentUser.role !== USER_ROLE.SUPER_ADMIN) {
    baseFilter.franchiseId = currentUser.franchiseId;
  } else if (franchiseId && franchiseId !== "ALL") {
    baseFilter.franchiseId = franchiseId;
  }

  // Outlet filter
  if (outletId && outletId !== "ALL") baseFilter.outletId = outletId;

  // Scope to caller's outlet for OUTLET_MANAGER
  if (currentUser.role === USER_ROLE.OUTLET_MANAGER) {
    baseFilter.outletId = currentUser.outletId;
  }

  const decodedCursor = decodeCursor(cursor);
  const cursorFilter = decodedCursor
    ? {
        $or: [
          { createdAt: { $lt: decodedCursor.createdAt } },
          {
            createdAt: decodedCursor.createdAt,
            _id: { $lt: decodedCursor._id },
          },
        ],
      }
    : null;

  const queryFilter = cursorFilter
    ? { $and: [baseFilter, cursorFilter] }
    : baseFilter;

  const [usersPlusOne, totalMatching, totalUsers, activeUsers] =
    await Promise.all([
      User.find(queryFilter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(pageLimit + 1),
      User.countDocuments(baseFilter),
      User.countDocuments({
        isDeleted: false,
        _id: { $ne: currentUser._id },
        ...(currentUser.role !== USER_ROLE.SUPER_ADMIN
          ? { franchiseId: currentUser.franchiseId }
          : {}),
      }),
      User.countDocuments({
        isDeleted: false,
        status: USER_STATUS.ACTIVE,
        _id: { $ne: currentUser._id },
        ...(currentUser.role !== USER_ROLE.SUPER_ADMIN
          ? { franchiseId: currentUser.franchiseId }
          : {}),
      }),
    ]);

  const hasNext = usersPlusOne.length > pageLimit;
  const users = hasNext ? usersPlusOne.slice(0, pageLimit) : usersPlusOne;

  const lastUser = users[users.length - 1];
  const nextCursor =
    hasNext && lastUser
      ? encodeCursor({ createdAt: lastUser.createdAt, _id: lastUser._id })
      : null;

  return {
    items: users,
    meta: {
      pagination: { limit: pageLimit, hasNext, nextCursor, totalMatching },
      stats: { totalItems: totalUsers, activeItems: activeUsers },
    },
  };
}

export async function getUser(currentUser, id) {
  const user = await User.findById(id);

  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404);
  }

  ensureSameTenant(currentUser, user);

  return user;
}

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

  // Bust auth cache so next request reflects deletion immediately
  await invalidateAuthStatus("user", id);

  return true;
}

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

  // Bust auth cache immediately so the new status takes effect on next request
  await invalidateAuthStatus("user", id);

  // Force deactivated users off immediately
  if (status === USER_STATUS.INACTIVE) {
    forceLogout("user", id);
  }

  return user;
}

export async function resetPassword(currentUser, id, newPassword) {
  const user = await User.findById(id).select("+passwordHash");

  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404);
  }

  ensureSameTenant(currentUser, user);
  ensureHigherRole(currentUser.role, user.role);

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.mustChangePassword = true;
  await user.save();

  // Fire-and-forget
  sendPasswordResetEmail({
    name: user.name,
    email: user.email,
    tempPassword: newPassword,
  }).catch(() => {});

  return true;
}
