import { AppError } from "./appError.js";

export class UnauthorizedError extends AppError {
  constructor(message = "You do not have permission") {
    super(message, 403);
    this.isOperational = false;
  }
}
