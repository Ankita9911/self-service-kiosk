import { ZodError } from "zod";

export function getZodFieldErrors<T extends Record<string, unknown>>(
  error: ZodError,
): Partial<Record<keyof T, string>> {
  const fieldErrors: Partial<Record<keyof T, string>> = {};

  for (const issue of error.issues) {
    if (issue.path.length === 0) continue;

    const key = issue.path[0];

    if (
      (typeof key === "string" || typeof key === "number") &&
      !fieldErrors[key as keyof T]
    ) {
      fieldErrors[key as keyof T] = issue.message;
    }
  }

  return fieldErrors;
}
