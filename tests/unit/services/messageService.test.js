import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../repository/messageRepository.js", () => ({
  createMessage: jest.fn(),
  getMessagesByConversation: jest.fn(),
  updateMessage: jest.fn(),
  deleteMessage: jest.fn(),
}));

jest.unstable_mockModule(
  "../../../repository/conversationRepository.js",
  () => ({
    getConversationById: jest.fn(),
  }),
);

jest.unstable_mockModule("../../../repository/listingRepository.js", () => ({
  getListingById: jest.fn(),
}));

const {
  sendMessage,
  getConversationMessages,
  markMessageAsRead,
  removeMessage,
} = await import("../../../services/messageService.js");
const messageRepository =
  await import("../../../repository/messageRepository.js");
const conversationRepository =
  await import("../../../repository/conversationRepository.js");
const listingRepository =
  await import("../../../repository/listingRepository.js");
const { UnauthenticatedError } =
  await import("../../../error/unauthenticatedError.js");

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

describe("Message Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendMessage", () => {
    it("sends a message when the sender is a member", async () => {
      conversationRepository.getConversationById.mockResolvedValue(
        mockConversation,
      );
      listingRepository.getListingById.mockResolvedValue({ id: "listing-1" });
      messageRepository.createMessage.mockResolvedValue(mockMessage);

      const result = await sendMessage({
        conversation_id: "conv-1",
        sender_id: "user-1",
        listing_id: "listing-1",
        content: "Is this still available?",
      });

      expect(messageRepository.createMessage).toHaveBeenCalledWith({
        conversation_id: "conv-1",
        sender_id: "user-1",
        listing_id: "listing-1",
        content: "Is this still available?",
      });
      expect(result).toMatchObject({
        status: 201,
        message: "Message sent successfully",
        data: mockMessage,
      });
    });

    it("throws UnauthenticatedError when the sender is not a member", async () => {
      conversationRepository.getConversationById.mockResolvedValue(
        mockConversation,
      );
      listingRepository.getListingById.mockResolvedValue({ id: "listing-1" });

      await expect(
        sendMessage({
          conversation_id: "conv-1",
          sender_id: "intruder-9",
          listing_id: "listing-1",
          content: "Hello",
        }),
      ).rejects.toThrow(UnauthenticatedError);
      expect(messageRepository.createMessage).not.toHaveBeenCalled();
    });

    it("propagates NotFoundError when the conversation does not exist", async () => {
      conversationRepository.getConversationById.mockRejectedValue(
        new Error("Conversation not found"),
      );

      await expect(
        sendMessage({
          conversation_id: "missing",
          sender_id: "user-1",
          listing_id: "listing-1",
          content: "Hello",
        }),
      ).rejects.toThrow("Conversation not found");
      expect(messageRepository.createMessage).not.toHaveBeenCalled();
    });

    it("propagates NotFoundError when the listing does not exist", async () => {
      conversationRepository.getConversationById.mockResolvedValue(
        mockConversation,
      );
      listingRepository.getListingById.mockRejectedValue(
        new Error("Listing not found"),
      );

      await expect(
        sendMessage({
          conversation_id: "conv-1",
          sender_id: "user-1",
          listing_id: "missing",
          content: "Hello",
        }),
      ).rejects.toThrow("Listing not found");
      expect(messageRepository.createMessage).not.toHaveBeenCalled();
    });
  });

  describe("getConversationMessages", () => {
    it("returns messages of a conversation", async () => {
      messageRepository.getMessagesByConversation.mockResolvedValue([
        mockMessage,
      ]);

      const result = await getConversationMessages("conv-1");

      expect(messageRepository.getMessagesByConversation).toHaveBeenCalledWith(
        "conv-1",
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Messages fetched successfully",
        messages: [mockMessage],
      });
    });
  });

  describe("markMessageAsRead", () => {
    it("sets read_at on a message", async () => {
      messageRepository.updateMessage.mockResolvedValue({
        ...mockMessage,
        read_at: new Date(),
      });

      const result = await markMessageAsRead("msg-1");

      expect(messageRepository.updateMessage).toHaveBeenCalledWith("msg-1", {
        read_at: expect.any(Date),
      });
      expect(result).toMatchObject({
        status: 200,
        message: "Message marked as read",
        data: { ...mockMessage, read_at: expect.any(Date) },
      });
    });
  });

  describe("removeMessage", () => {
    it("deletes a message", async () => {
      messageRepository.deleteMessage.mockResolvedValue(mockMessage);

      const result = await removeMessage("msg-1");

      expect(messageRepository.deleteMessage).toHaveBeenCalledWith("msg-1");
      expect(result).toMatchObject({
        status: 200,
        message: "Message deleted successfully",
      });
    });
  });
});
