import { AppError } from "./appError.js";

export class BadRequest extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}
