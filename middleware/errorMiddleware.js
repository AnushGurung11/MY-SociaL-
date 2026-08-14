import { AppError } from "../error/appError.js";
import { NotFoundError } from "../error/notFoundError.js";

export const notFound = (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
};

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ status: false, message: "Invalid ID format" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ status: false, message: "Duplicate value" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ status: false, message: err.message });
  }

  console.log(err.stack);
  return res
    .status(500)
    .json({ status: false, message: "Internal Server Error" });
};
