import { z } from "zod";
import { objectIdSchema } from "../../../shared/validation/common.schemas.js";
import { SOURCE_TYPE } from "../constant/stockTransaction.constants.js";

export const createManualTransactionSchema = z
  .object({
    sourceType: z
      .enum(Object.values(SOURCE_TYPE))
      .optional()
      .default(SOURCE_TYPE.INGREDIENT),
    itemId: objectIdSchema.optional(),
    ingredientId: objectIdSchema.optional(),
    type: z.enum(["PURCHASE", "WASTAGE", "ADJUSTMENT"], {
      required_error: "type is required",
    }),
    quantity: z
      .number({ required_error: "quantity is required" })
      .refine((v) => v !== 0, { message: "quantity must be non-zero" }),
    note: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.itemId && !data.ingredientId) {
      ctx.addIssue({
        path: ["itemId"],
        code: z.ZodIssueCode.custom,
        message: "itemId is required",
      });
    }
  });
