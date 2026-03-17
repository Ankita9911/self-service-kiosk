import { z } from "zod";

export const VALID_ROLES = [
  "SUPER_ADMIN",
  "FRANCHISE_ADMIN",
  "OUTLET_MANAGER",
  "KITCHEN_STAFF",
  "PICKUP_STAFF",
] as const;

export type UserRole = (typeof VALID_ROLES)[number];

export const OUTLET_SCOPED_ROLES: UserRole[] = [
  "OUTLET_MANAGER",
  "KITCHEN_STAFF",
  "PICKUP_STAFF",
];

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be at most 80 characters")
    .regex(/^[a-zA-Z][a-zA-Z\s]*$/, "Name can only contain letters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(254, "Email address is too long"),

  role: z.enum(VALID_ROLES, {
    message: "Please select a valid role",
  }),
  franchiseId: z.string().optional(),
  outletId: z.string().optional(),
});

export function getCreateUserSchema(actorRole?: string) {
  return createUserSchema.superRefine((data, ctx) => {
    const needsFranchise =
      actorRole === "SUPER_ADMIN" && data.role !== "SUPER_ADMIN";
    const needsOutlet = OUTLET_SCOPED_ROLES.includes(data.role);

    if (needsFranchise && !data.franchiseId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["franchiseId"],
        message: "Please select a franchise",
      });
    }

    if (needsOutlet && !data.outletId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["outletId"],
        message: "Please select an outlet",
      });
    }
  });
}

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
