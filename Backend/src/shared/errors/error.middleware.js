import AppError from "./AppError.js";

function errorMiddleware(err, req, res, next) {
  console.error("Error:", err);

  // ── Operational errors thrown deliberately via AppError ───────────────────
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  // ── JWT: expired token (more specific — must come before JsonWebTokenError) ─
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Session expired, please log in again",
      errorCode: "TOKEN_EXPIRED",
    });
  }

  // ── JWT: malformed or invalid signature ───────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      errorCode: "INVALID_TOKEN",
    });
  }

  // ── Mongoose: schema validation failure ───────────────────────────────────
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
    });
  }

  // ── Mongoose: invalid ObjectId (e.g. /api/users/not-an-id) ───────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      errorCode: "INVALID_ID",
    });
  }

  // ── MongoDB: unique index violation ──────────────────────────────────────
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value",
      errorCode: "DUPLICATE_KEY",
    });
  }

  // ── Catch-all: unexpected errors ──────────────────────────────────────────
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errorCode: "INTERNAL_ERROR",
  });
}

export default errorMiddleware;
