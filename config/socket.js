import { Server } from "socket.io";
import { verifyToken } from "../utils/token.js";
import { getUserById } from "../repository/userRepository.js";
import { getUserConversations } from "../services/conversationService.js";
import { registerChatHandlers, roomFor } from "../socket/chatHandlers.js";
import { UnauthenticatedError } from "../error/unauthenticatedError.js";

// Reads the token from "token=abc; ..." style cookie headers
export const getTokenFromCookie = (cookieHeader) => {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : null;
};

// Authenticates the socket connection using the JWT
export const authenticateSocket = async (socket) => {
  const token =
    socket.handshake?.auth?.token ||
    getTokenFromCookie(socket.handshake?.headers?.cookie);

  if (!token) {
    throw new UnauthenticatedError("No token provided");
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    throw new UnauthenticatedError("Invalid token");
  }

  // Ensures the user still exists in the database
  const user = await getUserById(decoded.userID);

  return user;
};

// Joins every conversation the user belongs to
export const joinUserConversations = async (socket) => {
  try {
    const { conversations } = await getUserConversations(socket.user.id);

    conversations.forEach((conversation) => {
      socket.join(roomFor(conversation.id));
    });
  } catch (error) {
    console.error("Failed to join user conversations:", error);
  }
};

export const initializeSocket = (httpServer, corsOptions = {}) => {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  // Authentication middleware for every socket connection
  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      socket.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on("connection", async (socket) => {
    await joinUserConversations(socket);

    registerChatHandlers(io, socket);
  });

  return io;
};
