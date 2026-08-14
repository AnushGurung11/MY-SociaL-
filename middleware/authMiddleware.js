import { UnauthenticatedError } from "../error/unauthenticatedError.js";
import { UnauthroizedError } from "../error/unauthorizedError.js";
import { verifyToken } from "../utils/token.js";

export const authmiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;

  // Must Have a header and must start with Bearer
  if (authorization && !authorization.startsWith("Bearer")) {
    throw new UnauthenticatedError("Invalid Token");
  }

  // Taking the access token from the cookies or from the header sent
  const token = req.cookies?.token || authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "JWT is incorrect",
    });
  }

  const isTokenValid = verifyToken(token);

  if (!isTokenValid) {
    throw new UnauthroizedError("The token is invalid");
  }

  req.user = {
    userId: isTokenValid.userID,
    email: isTokenValid.email,
    role: isTokenValid.role,
  };

  next();
};
