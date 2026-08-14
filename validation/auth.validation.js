import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(5).max(50),
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must contain an Uppercase letter")
    .regex(/\d/, "Password must contain a digit"),

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

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});
