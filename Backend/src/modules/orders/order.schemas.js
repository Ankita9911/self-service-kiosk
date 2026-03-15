import { z } from "zod";
import { objectIdSchema } from "../../shared/validation/common.schemas.js";
import { ORDER_STATUS, PAYMENT_METHOD } from "./order.constants.js";

export const createOrderSchema = z.object({
  clientOrderId: z.string({ required_error: "clientOrderId is required" }).min(1),
  paymentMethod: z.enum(Object.values(PAYMENT_METHOD), {
    required_error: "paymentMethod is required",
    invalid_type_error: "Invalid payment method",
  }),
  items: z
    .array(
      z.object({
        itemId:                objectIdSchema,
        quantity:              z.number({ required_error: "quantity is required" }).int().positive("quantity must be a positive integer"),
        customizationItemIds:  z.array(objectIdSchema).optional().default([]),
      })
    )
    .min(1, "Order must contain at least one item"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(Object.values(ORDER_STATUS), {
    required_error: "status is required",
    invalid_type_error: "Invalid order status",
  }),
});
