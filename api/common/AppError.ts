class AppError extends Error {
  public statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // This ensures that the `AppError` constructor is set in the prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export default AppError;
