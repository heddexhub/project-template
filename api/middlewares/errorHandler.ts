import { Request, Response, NextFunction } from "express";
import AppError from "../common/AppError";
import { log } from "../utils/logger";

const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  log("Middleware", "error", `${err.statusCode} : ${err.message}`);
  console.error(err);

  if (process.env.NODE_ENV === "development") 
    return res.status(err.statusCode).json({
      status: "error",
      error: err,
      message: err.message,
      stack: err.stack,
    });
  
  if (err.isOperational) 
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};

export default errorHandler;
