import { z } from "zod";

export const outletSchema = z.object({
    franchiseId: z.string().optional(),

    name: z
        .string()
        .trim()
        .min(2, "Outlet name must be at least 2 characters")
        .max(100, "Outlet name must be at most 100 characters")
        .regex(
            /^[a-zA-Z0-9\s\-'&.()]+$/,
            "Name can only contain letters, numbers, spaces and common punctuation"
        ),
    outletCode: z
        .string()
        .trim()
        .toUpperCase()
        .min(2, "Outlet code must be at least 2 characters")
        .max(20, "Outlet code must be at most 20 characters")
        .regex(
            /^[A-Z0-9][A-Z0-9\-]*[A-Z0-9]$|^[A-Z0-9]$/,
            "Outlet code can only contain uppercase letters, digits and hyphens"
        ),
    address: z
        .string()
        .trim()
        .max(300, "Address must be at most 300 characters")
        .optional()
        .or(z.literal("")),
});

export type OutletFormValues = z.infer<typeof outletSchema>;
