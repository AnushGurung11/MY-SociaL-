import { z } from "zod";

/**
 * This validation is just a schema of zod objects which will be passed to the validate.js
 * which will take the schema and in case of any error will throw that error or
 * if the user input is correct will reset the req body value.
 */

// Register shcema
export const registerSchema = z.object({
  // for each filed, it is similar to creating DB schema
  username: z.string().trim().min(5).max(50),

  // email is also validated here
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .min(8)
    // patterns can also be defined and messages if incorrect
    .regex(/[A-Z]/, "Password must contain an Uppercase letter")
    .regex(/\d/, "Password must contain a digit"),

  // This coerce is for converting the data type before validating, eg. z.date() will return get the string, z.coerce.date() will convert into date
  dob: z.coerce
    .date()
    .refine((d) => d < new Date(), { message: "DOB must be in the past" })
    .refine((d) => d.getFullYear() > 1900, { message: "Invalid year" }),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/)
    .optional(),
});

//Login schema
export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});
