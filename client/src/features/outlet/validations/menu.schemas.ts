import { z } from "zod";

export const menuItemSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  name: z
    .string()
    .trim()
    .min(2, "Item name must be at least 2 characters")
    .max(100, "Item name must be at most 100 characters")
    .regex(
      /^[a-zA-Z][a-zA-Z\s]*$/,
      "Item name can only contain letters",
    ),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .regex(
      /^[a-zA-Z]/,
      "Description must start with a letter",
    )
    .optional()
    .or(z.literal("")),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) >= 1 && parseFloat(val) <= 1_000_000_000,
      "Price must be between 1 and 1,000,000,000 (e.g. 49 or 49.99)",
    ),
  stockQuantity: z
    .string()
    .min(1, "Stock quantity is required")
    .refine(
      (val) => /^\d+$/.test(val) && parseInt(val, 10) >= 0 && parseInt(val, 10) <= 1000,
      "Stock quantity must be a whole number between 0 and 1000",
    ),
  imageFile: z
    .instanceof(Blob)
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "Image must be smaller than 5 MB",
    )
    .refine(
      (file) =>
        !file ||
        ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type,
        ),
      "Only JPEG, PNG, WebP or GIF images are allowed",
    ),
});

export const editMenuItemSchema = menuItemSchema.omit({ categoryId: true });
export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(80, "Category name must be at most 80 characters")
    .regex(
      /^[a-zA-Z0-9\s\-'&]+$/,
      "Category name can only contain letters, numbers, spaces, hyphens and ampersands",
    ),
  description: z
    .string()
    .trim()
    .max(300, "Description must be at most 300 characters")
    .optional()
    .or(z.literal("")),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
export type EditMenuItemFormValues = z.infer<typeof editMenuItemSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;

// For creating items, image is required
export const createMenuItemSchema = menuItemSchema.extend({
  imageFile: z
    .instanceof(Blob, { message: "Please upload an image" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Image must be smaller than 5 MB",
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type,
        ),
      "Only JPEG, PNG, WebP or GIF images are allowed",
    ),
});

export type CreateMenuItemFormValues = z.infer<typeof createMenuItemSchema>;
