import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../services/messageService.js", () => ({
  sendMessage: jest.fn(),
  markMessageAsRead: jest.fn(),
}));

jest.unstable_mockModule(
  "../../../repository/conversationRepository.js",
  () => ({
    getConversationById: jest.fn(),
  }),
);

const {
  handleMessageSend,
  handleConversationJoin,
  handleMessageRead,
  handleTyping,
  registerChatHandlers,
  roomFor,
  assertConversationMember,
} = await import("../../../socket/chatHandlers.js");
const messageService = await import("../../../services/messageService.js");
const conversationRepository =
  await import("../../../repository/conversationRepository.js");

const mockMessage = {
  id: "msg-1",
  conversation_id: "conv-1",
  sender_id: "user-1",
  listing_id: "listing-1",
  content: "Is this still available?",
  read_at: null,
};

const mockConversation = {
  id: "conv-1",
  user_a_id: "user-1",
  user_b_id: "user-2",
};

const createSocket = (overrides = {}) => ({
  user: { id: "user-1" },
  join: jest.fn(),
  to: jest.fn(() => ({ emit: jest.fn() })),
  ...overrides,
});

const createIo = () => {
  const emit = jest.fn();
  const io = {
    to: jest.fn(() => ({ emit })),
    emit,
  };
  return io;
};

describe("Chat Handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("roomFor", () => {
    it("builds the room name from a conversation id", () => {
      expect(roomFor("conv-1")).toBe("conversation:conv-1");
    });
  });

  describe("assertConversationMember", () => {
    it("resolves when the user is a member", async () => {
      conversationRepository.getConversationById.mockResolvedValue(
        mockConversation,
      );

      await expect(
        assertConversationMember("conv-1", "user-1"),
      ).resolves.toEqual(mockConversation);
      await expect(
        assertConversationMember("conv-1", "user-2"),
      ).resolves.toEqual(mockConversation);
    });

    it("throws when the user is not a member", async () => {
      conversationRepository.getConversationById.mockResolvedValue(
        mockConversation,
      );

      await expect(
        assertConversationMember("conv-1", "intruder-9"),
      ).rejects.toThrow("User is not part of the conversation");
    });
  });

  describe("handleMessageSend", () => {
    it("persists the message and broadcasts it to the room", async () => {
      const io = createIo();
      const socket = createSocket();
      const ack = jest.fn();

      messageService.sendMessage.mockResolvedValue({
        status: 201,
        data: mockMessage,
      });

      await handleMessageSend({
        io,
        socket,
        payload: {
          conversation_id: "conv-1",
          listing_id: "listing-1",
          content: "Is this still available?",
        },
        ack,
      });

      // sender_id is always taken from the verified JWT, never the client
      expect(messageService.sendMessage).toHaveBeenCalledWith({
        conversation_id: "conv-1",
        listing_id: "listing-1",
        content: "Is this still available?",
        sender_id: "user-1",
      });
      expect(io.to).toHaveBeenCalledWith("conversation:conv-1");
      expect(io.emit).toHaveBeenCalledWith("message:new", mockMessage);
      expect(ack).toHaveBeenCalledWith({ success: true, data: mockMessage });
    });

    it("acks an error and does not broadcast when sending fails", async () => {
      const io = createIo();
      const socket = createSocket();
      const ack = jest.fn();

      messageService.sendMessage.mockRejectedValue(
        new Error("Sender is not part of the conversation"),
      );

      await handleMessageSend({
        io,
        socket,
        payload: { conversation_id: "conv-1", content: "Hi" },
        ack,
      });

      expect(io.to).not.toHaveBeenCalled();
      expect(ack).toHaveBeenCalledWith({
        success: false,
        error: "Sender is not part of the conversation",
      });
    });

    it("works without an ack callback", async () => {
      const io = createIo();
      const socket = createSocket();

      messageService.sendMessage.mockResolvedValue({
        status: 201,
        data: mockMessage,
      });

      await expect(
        handleMessageSend({
          io,
          socket,
          payload: { conversation_id: "conv-1", content: "Hi" },
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe("handleConversationJoin", () => {
    it("joins the room when the user is a member", async () => {
      const socket = createSocket();
      const ack = jest.fn();

      conversationRepository.getConversationById.mockResolvedValue(
        mockConversation,
      );

      await handleConversationJoin({
        socket,
        payload: { conversation_id: "conv-1" },
        ack,
      });

      expect(socket.join).toHaveBeenCalledWith("conversation:conv-1");
      expect(ack).toHaveBeenCalledWith({ success: true });
    });

    it("does not join the room when the user is not a member", async () => {
      const socket = createSocket();
      const ack = jest.fn();

      conversationRepository.getConversationById.mockResolvedValue({
        ...mockConversation,
        user_a_id: "someone-else",
        user_b_id: "another-one",
      });

      await handleConversationJoin({
        socket,
        payload: { conversation_id: "conv-1" },
        ack,
      });

      expect(socket.join).not.toHaveBeenCalled();
      expect(ack).toHaveBeenCalledWith({
        success: false,
        error: "User is not part of the conversation",
      });
    });
  });

  describe("handleMessageRead", () => {
    it("marks the message as read and notifies the room", async () => {
      const io = createIo();
      const socket = createSocket();
      const ack = jest.fn();

      conversationRepository.getConversationById.mockResolvedValue(
        mockConversation,
      );
      messageService.markMessageAsRead.mockResolvedValue({
        status: 200,
        data: { ...mockMessage, read_at: new Date("2026-08-17T10:00:00Z") },
      });

      await handleMessageRead({
        io,
        socket,
        payload: { conversation_id: "conv-1", message_id: "msg-1" },
        ack,
      });

      expect(messageService.markMessageAsRead).toHaveBeenCalledWith("msg-1");
      expect(io.to).toHaveBeenCalledWith("conversation:conv-1");
      expect(io.emit).toHaveBeenCalledWith("message:read", {
        message_id: "msg-1",
        conversation_id: "conv-1",
        read_at: new Date("2026-08-17T10:00:00Z"),
      });
      expect(ack).toHaveBeenCalledWith({ success: true });
    });

    it("acks an error when the user is not a member", async () => {
      const io = createIo();
      const socket = createSocket();
      const ack = jest.fn();

      conversationRepository.getConversationById.mockResolvedValue({
        ...mockConversation,
        user_a_id: "someone-else",
        user_b_id: "another-one",
      });

      await handleMessageRead({
        io,
        socket,
        payload: { conversation_id: "conv-1", message_id: "msg-1" },
        ack,
      });

      expect(messageService.markMessageAsRead).not.toHaveBeenCalled();
      expect(ack).toHaveBeenCalledWith({
        success: false,
        error: "User is not part of the conversation",
      });
    });
  });

  describe("handleTyping", () => {
    it("broadcasts typing:start to everyone except the sender", () => {
      const emit = jest.fn();
      const socket = createSocket({ to: jest.fn(() => ({ emit })) });

      handleTyping({
        socket,
        payload: { conversation_id: "conv-1" },
        isTyping: true,
      });

      expect(socket.to).toHaveBeenCalledWith("conversation:conv-1");
      expect(emit).toHaveBeenCalledWith("typing:start", {
        user_id: "user-1",
        conversation_id: "conv-1",
      });
    });

    it("broadcasts typing:stop to everyone except the sender", () => {
      const emit = jest.fn();
      const socket = createSocket({ to: jest.fn(() => ({ emit })) });

      handleTyping({
        socket,
        payload: { conversation_id: "conv-1" },
        isTyping: false,
      });

      expect(socket.to).toHaveBeenCalledWith("conversation:conv-1");
      expect(emit).toHaveBeenCalledWith("typing:stop", {
        user_id: "user-1",
        conversation_id: "conv-1",
      });
    });

    it("does nothing when the conversation id is missing", () => {
      const socket = createSocket();

      handleTyping({
        socket,
        payload: {},
        isTyping: true,
      });

      expect(socket.to).not.toHaveBeenCalled();
    });
  });

  describe("registerChatHandlers", () => {
    it("registers all chat events on the socket", () => {
      const socket = createSocket({ on: jest.fn() });
      const io = createIo();

      registerChatHandlers(io, socket);

      const events = socket.on.mock.calls.map(([event]) => event);
      expect(events).toEqual([
        "message:send",
        "conversation:join",
        "message:read",
        "typing:start",
        "typing:stop",
      ]);
    });
  });
});
