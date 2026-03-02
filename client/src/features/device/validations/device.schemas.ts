import { z } from "zod";


export const createDeviceSchema = z.object({
    outletId: z.string().min(1, "Please select an outlet"),
    name: z
        .string()
        .trim()
        .min(2, "Device name must be at least 2 characters")
        .max(60, "Device name must be at most 60 characters")
        .regex(
            /^[a-zA-Z][a-zA-Z0-9\s\-]*$/,
            "Device name must start with a letter and can only contain letters, numbers, spaces and hyphens"
        ),
});

export const editDeviceSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Device name must be at least 2 characters")
        .max(60, "Device name must be at most 60 characters")
        .regex(
            /^[a-zA-Z][a-zA-Z0-9\s\-]*$/,
            "Device name must start with a letter and can only contain letters, numbers, spaces and hyphens"
        ),
});

export type CreateDeviceFormValues = z.infer<typeof createDeviceSchema>;
export type EditDeviceFormValues = z.infer<typeof editDeviceSchema>;
