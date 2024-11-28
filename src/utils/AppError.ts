export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Set status based on statusCode
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // Preserve the prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // Only capture stack trace for operational errors
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
