import { z } from "zod";

const trimmedString = (label: string, min = 1, max = 255) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(254, "Email is too long");

const passwordField = (label = "Password") =>
  z
    .string()
    .min(8, `${label} must be at least 8 characters`)
    .max(128, `${label} must be at most 128 characters`)
    .regex(/[A-Z]/, `${label} must contain at least one uppercase letter`)
    .regex(/[a-z]/, `${label} must contain at least one lowercase letter`)
    .regex(/[0-9]/, `${label} must contain at least one number`);

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: passwordField("New password"),
    confirm: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password !== data.currentPassword, {
    path: ["password"],
    message: "New password must differ from your current password",
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export { emailField, passwordField, trimmedString };
