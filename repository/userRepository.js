import User from "../models/user.model.js";

export const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
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
    return null;
  }
  return existUser;
};

export const createUser = async (userData) => {
  try {
    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
