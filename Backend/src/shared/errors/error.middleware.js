import AppError from "./AppError.js";

function errorMiddleware(err, req, res, next) {
  console.error("Error:", err);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
    });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      errorCode: "INVALID_TOKEN",
    });
  }
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value",
      errorCode: "DUPLICATE_KEY",
    });
  }
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errorCode: "INTERNAL_ERROR",
  });
}

export default errorMiddleware;