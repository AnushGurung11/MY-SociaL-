import { register, login } from "../services/authService.js";

export const registerUserController = async (req, res) => {
  const result = await register(req.body);
  const { status, ...body } = result;
  res.status(status).json(body);
};

export const loginUserController = async (req, res) => {
  const result = await login(req.body);
  const { status, ...body } = result;
  res.status(status).json(body);
};
