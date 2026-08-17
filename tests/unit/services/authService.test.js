import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../repository/userRepository.js", () => ({
  createUser: jest.fn(),
  loginExistingUser: jest.fn(),
  existingUser: jest.fn(),
}));

jest.unstable_mockModule("../../../utils/token.js", () => ({
  generateToken: jest.fn(),
}));

jest.unstable_mockModule("bcryptjs", () => {
  const hash = jest.fn();
  const compare = jest.fn();
  return { default: { hash, compare }, hash, compare };
});

const { register, login } = await import("../../../services/authService.js");
const userRepository = await import("../../../repository/userRepository.js");
const { generateToken } = await import("../../../utils/token.js");
const bcrypt = await import("bcryptjs");
const { ConflictError } = await import("../../../error/conflictError.js");
const { UnauthenticatedError } =
  await import("../../../error/unauthenticatedError.js");
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

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    const userData = {
      username: "johnny",
      email: "john@example.com",
      password: "Password1",
      dob: new Date("2000-01-01"),
      phone: "9812345678",
    };

    it("hashes the password and creates a new user", async () => {
      userRepository.existingUser.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed-password");
      userRepository.createUser.mockResolvedValue(mockUser);

      const result = await register(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith("Password1", 10);
      expect(userRepository.createUser).toHaveBeenCalledWith({
        username: "johnny",
        email: "john@example.com",
        dob: new Date("2000-01-01"),
        phone: "9812345678",
        password: "hashed-password",
      });
      expect(result).toMatchObject({
        status: 201,
        message: "User registered successfully",
        user: { id: mockUser.id, email: mockUser.email },
      });
    });

    it("throws ConflictError when the user already exists", async () => {
      userRepository.existingUser.mockResolvedValue(mockUser);

      await expect(register(userData)).rejects.toThrow(ConflictError);
      expect(userRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("returns a token when credentials are correct", async () => {
      userRepository.loginExistingUser.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue("jwt-token");

      const result = await login({
        email: "john@example.com",
        password: "Password1",
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "Password1",
        "hashed-password",
      );
      expect(generateToken).toHaveBeenCalledWith({
        userID: "user-123",
        email: "john@example.com",
        role: "user",
      });
      expect(result).toMatchObject({
        status: 200,
        message: "User logged in successfully",
        token: "jwt-token",
        user: { id: mockUser.id },
      });
    });

    it("throws UnauthenticatedError when the password is wrong", async () => {
      userRepository.loginExistingUser.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        login({ email: "john@example.com", password: "WrongPass1" }),
      ).rejects.toThrow(UnauthenticatedError);
    });

    it("throws NotFoundError when the user does not exist", async () => {
      userRepository.loginExistingUser.mockRejectedValue(
        new NotFoundError("User Does not exists"),
      );

      await expect(
        login({ email: "nobody@example.com", password: "Password1" }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
