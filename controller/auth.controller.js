import authService from "../services/authService.js";

export const register = async (req, res) => {
  const result = await authService.register(req.body);
  res.status(result.status).json(result);
};
