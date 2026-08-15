import { generateToken } from "../utils/token.js";
import {
  createUser,
  loginExistingUser,
  existingUser,
} from "../repository/userRepository.js";
import { ConflictError } from "../error/conflictError.js";
import { UnauthenticatedError } from "../error/unauthenticatedError.js";
import { NotFoundError } from "../error/notFoundError.js";

export const register = async (userData) => {
  const { email } = userData;

  // Check if the user already exists
  const checkExistingUser = await existingUser(email);

  if (checkExistingUser != null) {
    throw new ConflictError("User Already Exist");
  }

  // Create a new user in database
  const newUser = await createUser(userData);

  // Json response for a newly registered user with a status code of 201
  return {
    status: 201,
    message: "User registered successfully",
    user: {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      DOB: newUser.dob,
      role: newUser.role,
    },
  };
};

export const login = async (userData) => {
  const { email, password } = userData;

  // Check if the user exists
  const userExists = await loginExistingUser(email);

  if (userExists == null) {
    throw new NotFoundError("User Does not exists");
  }

  // Check if the password is correct
  const isPasswordCorrect = await userExists.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Login Detail");
  }

  // If the password is correct, then we generate a token for the user

  //first creating a payload for the token which will be used to generate the token
  const payload = {
    userID: userExists._id,
    email: userExists.email,
    role: userExists.role,
  };

  const token = generateToken(payload);

  // For debugging
  return {
    status: 200,
    message: "User logged in successfully",
    user: {
      _id: userExists._id,
      username: userExists.username,
      email: userExists.email,
      phone: userExists.phone,
      DOB: userExists.DOB,
      role: userExists.role,
    },
    token,
  };
};

export const logout = async () => {
  return { status: 200, message: "User logged out successfully" };
};
