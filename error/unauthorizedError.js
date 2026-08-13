import { AppError } from "./appError";

export class UnauthorizedError extends AppError {
  constructor(message = "You do not have permission") {
    super(message, 403);
  }
}
