import { z } from "zod";
import { objectIdSchema } from "../../shared/validation/common.schemas.js";
import { INVENTORY_MODE, SERVICE_TYPE, OFFER_TYPE } from "./menu.constants.js";

export const createCategorySchema = z.object({
  name: z.string({ required_error: "name is required" }).min(1).trim(),
  description: z.string().trim().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  displayOrder: z.number().int().nonnegative().optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

const offerSchema = z.object({
  type: z.enum(Object.values(OFFER_TYPE)),
  discountPercent: z.number().min(0).max(100).optional(),
  label: z.string().trim().optional(),
});

export const createMenuItemSchema = z.object({
  categoryId: objectIdSchema,
  name: z.string({ required_error: "name is required" }).min(1).trim(),
  description: z.string().trim().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  price: z
    .number({ required_error: "price is required" })
    .nonnegative("price must be non-negative"),
  stockQuantity: z.number().int().nonnegative().optional().default(0),
  inventoryMode: z
    .enum(Object.values(INVENTORY_MODE))
    .optional()
    .default(INVENTORY_MODE.RECIPE),
  serviceType: z
    .enum(Object.values(SERVICE_TYPE))
    .optional()
    .default(SERVICE_TYPE.BOTH),
  offers: z.array(offerSchema).optional().default([]),
  customizationItemIds: z.array(objectIdSchema).optional().default([]),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export const updateItemPriceSchema = z.object({
  price: z
    .number({ required_error: "price is required" })
    .nonnegative("price must be non-negative"),
});

export const updateItemStockSchema = z.object({
  stockQuantity: z
    .number({ required_error: "stockQuantity is required" })
    .int()
    .nonnegative("stockQuantity must be non-negative"),
});
