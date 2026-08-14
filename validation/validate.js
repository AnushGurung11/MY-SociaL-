import { BadRequest } from "../error/badRequestError.js";

// Middleware returing function
export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    // schema = the Zod schema to validate against (e.g. registerSchema)
    // returns an Express middleware function (req, res, next)

    // schema safePars if here to check for the format checking
    const result = schema.safeParse(req[source]);

    // checks if formatting is incorrect it will return array of errors
    // eg. email validation error, password pattern incorrect
    if (!result.success) {
      // issues return array of error message and map loops through each issue
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join("."), // eg. "email","phone" to email.phone email turing into readbale format
        message: issue.message, // the whole message
      }));

      // Throwing error
      return next(new BadRequest("Validation failed", errors));
    }

    // req.body = result.data cleaning the req object
    req[source] = result.data;

    // passes the req and res object to the next controller
    next();
  };
