import { ZodError } from "zod";

export function getZodFieldErrors<T extends object>(
  error: ZodError,
): Partial<Record<keyof T, string>> & Record<string, string | undefined> {
  const fieldErrors: Record<string, string | undefined> = {};

  for (const issue of error.issues) {
    if (issue.path.length === 0) continue;

    const key = issue.path.map(String).join(".");

    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors as Partial<Record<keyof T, string>> &
    Record<string, string | undefined>;
}
