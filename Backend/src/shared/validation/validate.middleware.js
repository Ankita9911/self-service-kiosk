import AppError from "../errors/AppError.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Validation failed";
    return next(new AppError(message, 400, "VALIDATION_ERROR"));
  }
  req.body = result.data;
  next();
};
