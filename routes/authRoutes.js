import express from "express";
import {
  registerUserController,
  loginUserController,
  logOutController,
} from "../controller/auth.controller.js";
import { validate } from "../validation/validate.js";
import { loginSchema, registerSchema } from "../validation/auth.validation.js";

export const authRouter = express.Router();

console.log("authRoutes.js loaded");

authRouter.post("/register", validate(registerSchema), registerUserController);
authRouter.post("/login", validate(loginSchema), loginUserController);
authRouter.post("/logout", logOutController);
