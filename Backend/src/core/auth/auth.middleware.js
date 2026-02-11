import { verifyToken } from "./jwt.service.js";
import AppError from "../../shared/errors/AppError.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AppError("Authentication required", 401, "AUTH_REQUIRED")
    );
  }

  const token = authHeader.split(" ")[1];

  const decoded = verifyToken(token);

  if (!decoded) {
    return next(
      new AppError("Invalid or expired token", 401, "INVALID_TOKEN")
    );
  }

  req.user = decoded;

  next();
}
