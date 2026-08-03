import jwt from "jsonwebtoken";

// generating JWT token requires user id role secret key and the expires in time for the token to be valid
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// This function is used to verify the token that is sent by the user in the request header
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};
