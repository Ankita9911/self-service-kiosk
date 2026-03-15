import { z } from "zod";
import { objectIdSchema } from "../../shared/validation/common.schemas.js";
import { TRANSACTION_TYPE } from "./stockTransaction.constants.js";

export const createManualTransactionSchema = z.object({
  ingredientId: objectIdSchema,
  type: z.enum(["PURCHASE", "WASTAGE", "ADJUSTMENT"], {
    required_error: "type is required",
  }),
  quantity: z
    .number({ required_error: "quantity is required" })
    .refine((v) => v !== 0, { message: "quantity must be non-zero" }),
  note: z.string().trim().optional(),
});
