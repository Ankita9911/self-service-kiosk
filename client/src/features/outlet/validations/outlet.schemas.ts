import { z } from "zod";

export const outletSchema = z.object({
    franchiseId: z.string().optional(),

    name: z
        .string()
        .trim()
        .min(2, "Outlet name must be at least 2 characters")
        .max(100, "Outlet name must be at most 100 characters")
        .regex(
            /^[a-zA-Z][a-zA-Z\s]*$/,
            "Outlet name can only contain letters"
        ),
    outletCode: z
        .string()
        .trim()
        .toUpperCase()
        .min(2, "Outlet code must be at least 2 characters")
        .max(20, "Outlet code must be at most 20 characters")
        .regex(
            /^[A-Z][A-Z0-9\-]*[A-Z0-9]$|^[A-Z]$/,
            "Outlet code must start with a letter and can only contain uppercase letters, digits and hyphens"
        ),
    address: z.object({
        line1: z
            .string()
            .trim()
            .max(200, "Address line 1 must be at most 200 characters")
            .refine((val) => val === "" || val.length >= 5, "Address line 1 must be at least 5 characters")
            .refine((val) => val === "" || /^[a-zA-Z0-9]/.test(val), "Address line 1 must start with a letter or number")
            .refine((val) => val === "" || !/\s{2,}/.test(val), "Address line 1 cannot have consecutive spaces")
            .refine((val) => val === "" || !/[-,.\/\\]{2,}/.test(val), "Address line 1 cannot have consecutive special characters")
            .refine((val) => val === "" || /[a-zA-Z]/.test(val), "Address line 1 must contain at least one letter")
            .refine((val) => val === "" || /[0-9]/.test(val), "Address line 1 must contain at least one number")
            .refine((val) => val === "" || /^[a-zA-Z0-9 ,.\/\-#&'()]+$/.test(val), "Address line 1 contains invalid characters")
            .optional()
            .or(z.literal("")),
        city:    z.string().trim().max(100, "Too long").optional().or(z.literal("")),
        state:   z.string().trim().max(100, "Too long").optional().or(z.literal("")),
        pincode: z.string().trim().max(20,  "Too long").optional().or(z.literal("")),
        country: z.string().trim().max(100, "Too long").optional().or(z.literal("")),
    }).optional(),
});

export type OutletFormValues = z.infer<typeof outletSchema>;

