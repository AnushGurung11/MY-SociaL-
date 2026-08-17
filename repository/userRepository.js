import { prisma } from "../config/dbConfig.js";
import { ConflictError } from "../error/conflictError.js";
import { NotFoundError } from "../error/notFoundError.js";

export const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

export const existingUser = async (email) => {
  const existUser = await prisma.user.findUnique({ where: { email } });

  if (!existUser) {
    return null;
  }

  return existUser;
};

export const loginExistingUser = async (email) => {
  const existUser = await prisma.user.findUnique({ where: { email } });

  if (!existUser) {
    throw new ConflictError("User Does not exist");
  }
  return existUser;
};

export const createUser = async (userData) => {
  const newUser = await prisma.user.create({ data: userData });
  return newUser;
};
