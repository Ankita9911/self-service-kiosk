import { z } from "zod";

export const franchiseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Franchise name must be at least 2 characters")
    .max(100, "Franchise name must be at most 100 characters")
    .regex(/^[a-zA-Z][a-zA-Z\s]*$/, "Name can only contain letters"),
  brandCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Brand code must be at least 2 characters")
    .max(20, "Brand code must be at most 20 characters")
    .regex(/^[A-Z]/, "Brand code must start with a letter")
    .regex(
      /^[A-Z][A-Z0-9\-]*[A-Z0-9]$|^[A-Z]$/,
      "Brand code can only contain uppercase letters, digits and hyphens, and must not start with a number or end with a hyphen",
    ),
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Contact email must be at least 2 characters")
    .max(100, "Contact email must be at most 100 characters")
    .email("Enter a valid email address"),
});

export type FranchiseFormValues = z.infer<typeof franchiseSchema>;
