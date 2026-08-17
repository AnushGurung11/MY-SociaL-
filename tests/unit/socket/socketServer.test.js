import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("socket.io", () => ({
  Server: jest.fn(),
}));

jest.unstable_mockModule("../../../utils/token.js", () => ({
  verifyToken: jest.fn(),
}));

jest.unstable_mockModule("../../../repository/userRepository.js", () => ({
  getUserById: jest.fn(),
}));

jest.unstable_mockModule("../../../services/conversationService.js", () => ({
  getUserConversations: jest.fn(),
}));

jest.unstable_mockModule("../../../socket/chatHandlers.js", () => ({
  registerChatHandlers: jest.fn(),
  roomFor: jest.fn((conversationId) => `conversation:${conversationId}`),
}));

const { Server } = await import("socket.io");
const { initializeSocket, joinUserConversations } =
  await import("../../../config/socket.js");
const { verifyToken } = await import("../../../utils/token.js");
const userRepository = await import("../../../repository/userRepository.js");
const conversationService =
  await import("../../../services/conversationService.js");
const chatHandlers = await import("../../../socket/chatHandlers.js");
const { UnauthenticatedError } =
  await import("../../../error/unauthenticatedError.js");

const mockUser = { id: "user-1", username: "johnny" };
const decodedToken = { userID: "user-1", email: "john@example.com" };

describe("Socket Server (initializeSocket)", () => {
  let serverInstance;
  let httpServer;
  let corsOptions;

  beforeEach(() => {
    jest.clearAllMocks();

    serverInstance = {
      use: jest.fn(),
      on: jest.fn(),
    };
    Server.mockImplementation(() => serverInstance);

    httpServer = { listen: jest.fn() };
    corsOptions = { origin: "http://localhost:3000", credentials: true };
  });

  it("creates the Socket.IO server with the http server and cors options", () => {
    initializeSocket(httpServer, corsOptions);

    expect(Server).toHaveBeenCalledWith(httpServer, { cors: corsOptions });
  });

  it("registers the authentication middleware", () => {
    initializeSocket(httpServer, corsOptions);

    expect(serverInstance.use).toHaveBeenCalledTimes(1);
    expect(typeof serverInstance.use.mock.calls[0][0]).toBe("function");
  });

  it("registers the connection handler", () => {
    initializeSocket(httpServer, corsOptions);

    expect(serverInstance.on).toHaveBeenCalledWith(
      "connection",
      expect.any(Function),
    );
  });

  describe("auth middleware", () => {
    it("attaches the user and calls next() for a valid token", async () => {
      verifyToken.mockReturnValue(decodedToken);
      userRepository.getUserById.mockResolvedValue(mockUser);

      initializeSocket(httpServer, corsOptions);
      const middleware = serverInstance.use.mock.calls[0][0];
      const socket = {
        handshake: { auth: { token: "good-token" } },
      };
      const next = jest.fn();

      await middleware(socket, next);

      expect(verifyToken).toHaveBeenCalledWith("good-token");
      expect(userRepository.getUserById).toHaveBeenCalledWith("user-1");
      expect(socket.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
    });

    it("calls next() with the error for an invalid token", async () => {
      verifyToken.mockReturnValue(null);

      initializeSocket(httpServer, corsOptions);
      const middleware = serverInstance.use.mock.calls[0][0];
      const socket = { handshake: { auth: { token: "bad-token" } } };
      const next = jest.fn();

      await middleware(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthenticatedError));
      expect(socket.user).toBeUndefined();
    });

    it("calls next() with the error when no token is provided", async () => {
      initializeSocket(httpServer, corsOptions);
      const middleware = serverInstance.use.mock.calls[0][0];
      const socket = { handshake: {} };
      const next = jest.fn();

      await middleware(socket, next);

      expect(next).toHaveBeenCalledWith(expect.any(UnauthenticatedError));
    });
  });

  describe("connection handler", () => {
    it("joins the user's conversations and registers chat handlers", async () => {
      verifyToken.mockReturnValue(decodedToken);
      userRepository.getUserById.mockResolvedValue(mockUser);
      conversationService.getUserConversations.mockResolvedValue({
        status: 200,
        conversations: [{ id: "conv-1" }, { id: "conv-2" }],
      });

      initializeSocket(httpServer, corsOptions);
      const connectionHandler = serverInstance.on.mock.calls[0][1];

      const socket = { user: mockUser, join: jest.fn() };

      // Run the middleware first so the connection flow matches production
      const middleware = serverInstance.use.mock.calls[0][0];
      await middleware(socket, jest.fn());

      await connectionHandler(socket);

      expect(conversationService.getUserConversations).toHaveBeenCalledWith(
        "user-1",
      );
      expect(socket.join).toHaveBeenCalledTimes(2);
      expect(socket.join).toHaveBeenCalledWith("conversation:conv-1");
      expect(socket.join).toHaveBeenCalledWith("conversation:conv-2");
      expect(chatHandlers.registerChatHandlers).toHaveBeenCalledWith(
        serverInstance,
        socket,
      );
    });

    it("still registers chat handlers when joining conversations fails", async () => {
      verifyToken.mockReturnValue(decodedToken);
      userRepository.getUserById.mockResolvedValue(mockUser);
      conversationService.getUserConversations.mockRejectedValue(
        new Error("DB error"),
      );
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      initializeSocket(httpServer, corsOptions);
      const connectionHandler = serverInstance.on.mock.calls[0][1];

      const socket = { user: mockUser, join: jest.fn() };
      const middleware = serverInstance.use.mock.calls[0][0];
      await middleware(socket, jest.fn());

      await connectionHandler(socket);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to join user conversations:",
        expect.any(Error),
      );
      expect(socket.join).not.toHaveBeenCalled();
      expect(chatHandlers.registerChatHandlers).toHaveBeenCalledWith(
        serverInstance,
        socket,
      );

      consoleErrorSpy.mockRestore();
    });
  });
});

describe("joinUserConversations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("joins a room for every conversation of the user", async () => {
    conversationService.getUserConversations.mockResolvedValue({
      status: 200,
      conversations: [{ id: "conv-1" }, { id: "conv-2" }, { id: "conv-3" }],
    });

    const socket = { user: { id: "user-1" }, join: jest.fn() };

    await joinUserConversations(socket);

    expect(conversationService.getUserConversations).toHaveBeenCalledWith(
      "user-1",
    );
    expect(socket.join).toHaveBeenCalledTimes(3);
    expect(socket.join).toHaveBeenCalledWith("conversation:conv-1");
    expect(socket.join).toHaveBeenCalledWith("conversation:conv-3");
  });

  it("does not throw when there are no conversations", async () => {
    conversationService.getUserConversations.mockResolvedValue({
      status: 200,
      conversations: [],
    });

    const socket = { user: { id: "user-1" }, join: jest.fn() };

    await expect(joinUserConversations(socket)).resolves.toBeUndefined();
    expect(socket.join).not.toHaveBeenCalled();
  });
});
