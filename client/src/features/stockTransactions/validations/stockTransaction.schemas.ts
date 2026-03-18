import { z } from "zod";

export const logTransactionSchema = z.object({
  sourceType: z.enum(["INGREDIENT", "MENU_ITEM"]),
  itemId: z.string().trim().min(1, "Please select an item."),
  type: z.enum(["PURCHASE", "WASTAGE", "ADJUSTMENT"]),
  quantity: z
    .number({ message: "Quantity is required." })
    .refine((val) => val !== 0, "Quantity must be non-zero."),
  note: z
    .string()
    .trim()
    .max(250, "Note must be at most 250 characters")
    .optional()
    .or(z.literal("")),
});

export type LogTransactionFormValues = z.infer<typeof logTransactionSchema>;
