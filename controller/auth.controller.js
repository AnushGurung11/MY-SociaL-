import { register, login } from "../services/authService.js";

export const registerUserController = async (req, res) => {
  const result = await register(req.body);
  res.status(result.status).json(result);
};

export const loginUserController = async (req, res) => {
  const result = await login(req.body);
  res.status(result.status).json(result);
};
