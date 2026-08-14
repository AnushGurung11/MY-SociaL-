import { register, login, logout } from "../services/authService.js";
import { asynchandler } from "../utils/asyncHandler.js";

export const registerUserController = asynchandler(async (req, res) => {
  const result = await register(req.body);
  const { status, ...body } = result;
  res.status(status).json(body);
});

export const loginUserController = asynchandler(async (req, res) => {
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
});

export const logOutController = asynchandler(async (req, res) => {
  const result = await logout();
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.status(result.status).json(result);
});
