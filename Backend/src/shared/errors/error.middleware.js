import AppError from "./AppError.js";

function errorMiddleware(err, req, res, next) {
  console.error("Error:", err);

  // If error is not AppError, treat as unknown
  if (!(err instanceof AppError)) {
    return res.status(500).json({
      success: false,
      error: {
        message: "Internal Server Error",
        code: "INTERNAL_ERROR"
      }
    });
  }

  return res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      code: err.errorCode
    }
  });
}

export default errorMiddleware;
