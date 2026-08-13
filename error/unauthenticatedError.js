import { AppError } from "./appError";

export class UnauthenticatedError extends AppError {
  constructor(message = "Login to Continue") {
    super(message, 401);
  }
}
