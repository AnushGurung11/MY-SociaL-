import express from "express";
import {
  registerUserController,
  loginUserController,
  logOutController,
} from "../controller/auth.controller.js";

export const authRouter = express.Router();

console.log("authRoutes.js loaded");

authRouter.post("/register", registerUserController);
authRouter.post("/login", loginUserController);
authRouter.post("/logout", logOutController);
