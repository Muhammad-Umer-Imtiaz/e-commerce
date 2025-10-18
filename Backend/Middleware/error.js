// Middleware/error.js

// ---------------------------
// Custom Error Handler Class
// ---------------------------
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Capture stack trace excluding constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

// ---------------------------
// Global Error Middleware
// ---------------------------
export const errorMiddleware = (err, req, res, next) => {
  // Default error values
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  console.error("🔥 Error caught:", err);

  // ---------------------------
  // Specific Error Handlers
  // ---------------------------

  // Invalid MongoDB ObjectId (CastError)
  if (err.name === "CastError") {
    err = new ErrorHandler(`Invalid ${err.path}`, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((el) => el.message)
      .join(", ");
    err = new ErrorHandler(message, 400);
  }

  // Invalid JWT Token
  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("JWT is invalid, please try again", 400);
  }

  // Expired JWT Token
  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("JWT has expired, please login again", 400);
  }

  // ---------------------------
  // Send Error Response
  // ---------------------------
  return res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    code: err.statusCode,
    timestamp: new Date().toISOString(),
    // Show full error & stack trace only in development mode
    error: process.env.NODE_ENV === "development" ? err : undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

// ---------------------------
// Export Default for Convenience
// ---------------------------
export default ErrorHandler;
