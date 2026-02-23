import Franchise from "./franchise.model.js";
import AppError from "../../shared/errors/AppError.js";

export async function createFranchise(payload, user) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const { name, brandCode, contactEmail, contactPhone } = payload;

  if (!name || !brandCode) {
    throw new AppError(
      "Name and brandCode are required",
      400,
      "VALIDATION_ERROR"
    );
  }

  const existing = await Franchise.findOne({
    brandCode: brandCode.toUpperCase(),
    isDeleted: false,
  });

  if (existing) {
    throw new AppError(
      "Brand code already exists",
      409,
      "BRAND_CODE_EXISTS"
    );
  }

  const franchise = await Franchise.create({
    name,
    brandCode: brandCode.toUpperCase(),
    contactEmail,
    contactPhone,
  });

  return franchise;
}
export async function getFranchises(user) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  return Franchise.find({ isDeleted: false }).sort({
    createdAt: -1,
  });
}

export async function getFranchiseById(id, user) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const franchise = await Franchise.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!franchise) {
    throw new AppError(
      "Franchise not found",
      404,
      "FRANCHISE_NOT_FOUND"
    );
  }

  return franchise;
}

export async function updateFranchise(id, payload, user) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const franchise = await getFranchiseById(id, user);

  if (payload.brandCode) {
    payload.brandCode =
      payload.brandCode.toUpperCase();
  }

  Object.assign(franchise, payload);

  await franchise.save();

  return franchise;
}

export async function deleteFranchise(id, user) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  const franchise = await getFranchiseById(id, user);

  franchise.isDeleted = true;
  franchise.status = "INACTIVE";

  await franchise.save();

  return { message: "Franchise deleted successfully" };
}
