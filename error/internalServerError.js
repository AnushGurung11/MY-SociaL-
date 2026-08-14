import { AppError } from "./appError.js";

export class ServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}
