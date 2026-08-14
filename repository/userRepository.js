import { ConflictError } from "../error/conflictError.js";
import User from "../models/user.model.js";

export const getAllUsers = async () => {
  const users = await User.find();
  return users;
};

export const existingUser = async (email) => {
  const existUser = await User.findOne({ email });

  if (!existUser) {
    return null;
  }

  return existUser;
};

export const loginExistingUser = async (email) => {
  const existUser = await User.findOne({ email }).select("+password");

  if (!existUser) {
    throw new ConflictError("User Does not exist");
  }
  return existUser;
};

export const createUser = async (userData) => {
  const newUser = await User.create(userData);
  return newUser;
};
