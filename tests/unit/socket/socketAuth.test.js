import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../config/dbConfig.js", () => ({
  prisma: {},
  connectDB: jest.fn(),
}));

jest.unstable_mockModule("../../../utils/token.js", () => ({
  verifyToken: jest.fn(),
}));

jest.unstable_mockModule("../../../repository/userRepository.js", () => ({
  getUserById: jest.fn(),
}));

const { authenticateSocket, getTokenFromCookie } =
  await import("../../../config/socket.js");
const { verifyToken } = await import("../../../utils/token.js");
const userRepository = await import("../../../repository/userRepository.js");
const { UnauthenticatedError } =
  await import("../../../error/unauthenticatedError.js");

const mockUser = {
  id: "user-1",
  username: "johnny",
  email: "john@example.com",
};
const decodedToken = {
  userID: "user-1",
  email: "john@example.com",
  role: "user",
};

describe("getTokenFromCookie", () => {
  it("returns null when there is no cookie header", () => {
    expect(getTokenFromCookie(null)).toBeNull();
  });

  it("returns null when the token cookie is missing", () => {
    expect(getTokenFromCookie("other=abc")).toBeNull();
  });

  it("extracts the token from the cookie header", () => {
    expect(getTokenFromCookie("token=my-jwt-token; other=abc")).toBe(
      "my-jwt-token",
    );
  });
});

describe("authenticateSocket", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws UnauthenticatedError when no token is provided", async () => {
    const socket = { handshake: {} };

    await expect(authenticateSocket(socket)).rejects.toThrow(
      UnauthenticatedError,
    );
    expect(userRepository.getUserById).not.toHaveBeenCalled();
  });

  it("throws UnauthenticatedError when the token is invalid", async () => {
    verifyToken.mockReturnValue(null);

    const socket = { handshake: { auth: { token: "bad-token" } } };

    await expect(authenticateSocket(socket)).rejects.toThrow(
      UnauthenticatedError,
    );
  });

  it("authenticates with a token from handshake auth", async () => {
    verifyToken.mockReturnValue(decodedToken);
    userRepository.getUserById.mockResolvedValue(mockUser);

    const socket = { handshake: { auth: { token: "good-token" } } };

    const user = await authenticateSocket(socket);

    expect(verifyToken).toHaveBeenCalledWith("good-token");
    expect(userRepository.getUserById).toHaveBeenCalledWith("user-1");
    expect(user).toEqual(mockUser);
  });

  it("authenticates with a token from the cookie header", async () => {
    verifyToken.mockReturnValue(decodedToken);
    userRepository.getUserById.mockResolvedValue(mockUser);

    const socket = {
      handshake: {
        headers: { cookie: "token=cookie-token; other=abc" },
      },
    };

    const user = await authenticateSocket(socket);

    expect(verifyToken).toHaveBeenCalledWith("cookie-token");
    expect(user).toEqual(mockUser);
  });

  it("throws UnauthenticatedError when the user no longer exists", async () => {
    verifyToken.mockReturnValue(decodedToken);
    userRepository.getUserById.mockRejectedValue(new Error("User not found"));

    const socket = { handshake: { auth: { token: "good-token" } } };

    await expect(authenticateSocket(socket)).rejects.toThrow("User not found");
  });
});
