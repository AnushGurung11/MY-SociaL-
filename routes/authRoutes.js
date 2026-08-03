import express from "express";
import { register } from "../controller/auth.controller.js";
export const router = express.Router();

console.log("authRoutes.js loaded");

router.post("/register", register);
router.post("/login");
