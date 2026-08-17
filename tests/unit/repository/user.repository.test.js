import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../config/dbConfig.js", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const { prisma } = await import("../../../config/dbConfig.js");
const {
  getAllUsers,
  getUserById,
  existingUser,
  loginExistingUser,
  createUser,
} = await import("../../../repository/userRepository.js");
const { ConflictError } = await import("../../../error/conflictError.js");
const { NotFoundError } = await import("../../../error/notFoundError.js");

const mockUser = {
  id: "user-123",
  username: "johnny",
  email: "john@example.com",
  password: "hashed-password",
  phone: "9812345678",
  dob: new Date("2000-01-01"),
  role: "user",
};

describe("User Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("returns all users", async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);

      const result = await getAllUsers();

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });

    it("throws error when findMany fails", async () => {
      prisma.user.findMany.mockRejectedValue(new Error("DB error"));

      await expect(getAllUsers()).rejects.toThrow("DB error");
    });
  });

  describe("getUserById", () => {
    it("returns the user when id exists", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserById("user-123");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
      expect(result).toEqual(mockUser);
    });

    it("throws NotFoundError when user does not exist", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(getUserById("missing")).rejects.toThrow(NotFoundError);
    });
  });

  describe("existingUser", () => {
    it("returns the user when email exists", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await existingUser("john@example.com");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
      });
      expect(result).toEqual(mockUser);
    });

    it("returns null when user does not exist", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await existingUser("nobody@example.com");

      expect(result).toBeNull();
    });
  });

  describe("loginExistingUser", () => {
    it("returns the user with password when email exists", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await loginExistingUser("john@example.com");

      expect(result).toEqual(mockUser);
    });

    it("throws ConflictError when user does not exist", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(loginExistingUser("nobody@example.com")).rejects.toThrow(
        ConflictError,
      );
    });
  });

  describe("createUser", () => {
    it("creates and returns a new user", async () => {
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await createUser({
        email: "john@example.com",
        password: "hashed-password",
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { email: "john@example.com", password: "hashed-password" },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
