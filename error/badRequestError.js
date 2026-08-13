import { AppError } from "./appError";

export class BadRequest extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}
