import express from "express";
import {
  registerUserController,
  loginUserController,
} from "../controller/auth.controller.js";

export const router = express.Router();

console.log("authRoutes.js loaded");

router.post("/register", registerUserController);
router.post("/login", loginUserController);
