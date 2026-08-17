import bcrypt from "bcryptjs";
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
  const { email, password, ...rest } = userData;

  // Check if the user already exists
  const checkExistingUser = await existingUser(email);

  if (checkExistingUser != null) {
    throw new ConflictError("User Already Exist");
  }

  // Hash the password before storing it (Prisma has no pre-save hooks)
  const saltRound = 10;
  const hashedPassword = await bcrypt.hash(password, saltRound);

  // Create a new user in database
  const newUser = await createUser({
    ...rest,
    email,
    password: hashedPassword,
  });

  // Json response for a newly registered user with a status code of 201
  return {
    status: 201,
    message: "User registered successfully",
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      dob: newUser.dob,
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
  const isPasswordCorrect = await bcrypt.compare(password, userExists.password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Login Detail");
  }

  // If the password is correct, then we generate a token for the user

  //first creating a payload for the token which will be used to generate the token
  const payload = {
    userID: userExists.id,
    email: userExists.email,
    role: userExists.role,
  };

  const token = generateToken(payload);

  // For debugging
  return {
    status: 200,
    message: "User logged in successfully",
    user: {
      id: userExists.id,
      username: userExists.username,
      email: userExists.email,
      phone: userExists.phone,
      dob: userExists.dob,
      role: userExists.role,
    },
    token,
  };
};

export const logout = async () => {
  return { status: 200, message: "User logged out successfully" };
};
