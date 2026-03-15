import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID format");

export const paginationSchema = z.object({
  limit: z.string().optional(),
  cursor: z.string().optional(),
});

export const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const emailSchema = z
  .string({ required_error: "Email is required" })
  .email("Invalid email address")
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(6, "Password must be at least 6 characters");
