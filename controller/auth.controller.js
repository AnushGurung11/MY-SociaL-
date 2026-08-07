import { register, login, logout } from "../services/authService.js";

export const registerUserController = async (req, res) => {
  const result = await register(req.body);
  const { status, ...body } = result;
  res.status(status).json(body);
};

export const loginUserController = async (req, res) => {
  const result = await login(req.body);
  const { status, token, ...body } = result;

  if (status === 200 && token) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 12 * 60 * 60 * 1000,
      path: "/",
    });
  }

  res.status(status).json(body);
};

export const logOutController = async (req, res) => {
  const result = await logout();
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.status(result.status).json(result);
};
