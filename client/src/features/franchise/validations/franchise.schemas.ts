import { z } from "zod";

export const franchiseSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Franchise name must be at least 2 characters")
        .max(100, "Franchise name must be at most 100 characters")
        .regex(
            /^[a-zA-Z0-9\s\-'&.]+$/,
            "Name can only contain letters, numbers, spaces, hyphens, apostrophes, ampersands and dots"
        ),
    brandCode: z
        .string()
        .trim()
        .toUpperCase()
        .min(2, "Brand code must be at least 2 characters")
        .max(20, "Brand code must be at most 20 characters")
        .regex(
            /^[A-Z0-9][A-Z0-9\-]*[A-Z0-9]$|^[A-Z0-9]$/,
            "Brand code can only contain uppercase letters, digits and hyphens, and must not start or end with a hyphen"
        ),
    contactEmail: z
        .string()
        .trim()
        .toLowerCase()
        .optional()
        .refine(
            (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            "Enter a valid email address"
        ),
});

export type FranchiseFormValues = z.infer<typeof franchiseSchema>;
