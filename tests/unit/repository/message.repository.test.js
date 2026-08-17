import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../config/dbConfig.js", () => ({
  prisma: {
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const { prisma } = await import("../../../config/dbConfig.js");
const {
  createMessage,
  getMessagesByConversation,
  getMessageById,
  updateMessage,
  deleteMessage,
} = await import("../../../repository/messageRepository.js");
const { NotFoundError } = await import("../../../error/notFoundError.js");

const mockMessage = {
  id: "msg-1",
  conversation_id: "conv-1",
  sender_id: "user-1",
  listing_id: "listing-1",
  content: "Is this still available?",
  media_key: null,
  read_at: null,
};

describe("Message Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createMessage", () => {
    it("creates and returns a message", async () => {
      prisma.message.create.mockResolvedValue(mockMessage);

      const result = await createMessage({
        conversation_id: "conv-1",
        sender_id: "user-1",
        listing_id: "listing-1",
        content: "Is this still available?",
      });

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          conversation_id: "conv-1",
          sender_id: "user-1",
          listing_id: "listing-1",
          content: "Is this still available?",
        },
      });
      expect(result).toEqual(mockMessage);
    });
  });

  describe("getMessagesByConversation", () => {
    it("returns messages of a conversation ordered chronologically", async () => {
      prisma.message.findMany.mockResolvedValue([mockMessage]);

      const result = await getMessagesByConversation("conv-1");

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { conversation_id: "conv-1" },
        orderBy: { created_at: "asc" },
      });
      expect(result).toEqual([mockMessage]);
    });
  });

  describe("getMessageById", () => {
    it("returns the message when it exists", async () => {
      prisma.message.findUnique.mockResolvedValue(mockMessage);

      const result = await getMessageById("msg-1");

      expect(result).toEqual(mockMessage);
    });

    it("throws NotFoundError when the message does not exist", async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      await expect(getMessageById("missing")).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateMessage", () => {
    it("updates an existing message", async () => {
      prisma.message.findUnique.mockResolvedValue(mockMessage);
      prisma.message.update.mockResolvedValue({
        ...mockMessage,
        read_at: new Date(),
      });

      const result = await updateMessage("msg-1", { read_at: new Date() });

      expect(prisma.message.update).toHaveBeenCalledWith({
        where: { id: "msg-1" },
        data: { read_at: expect.any(Date) },
      });
      expect(result.read_at).toBeDefined();
    });

    it("throws NotFoundError when updating a missing message", async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      await expect(
        updateMessage("missing", { read_at: new Date() }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteMessage", () => {
    it("deletes an existing message", async () => {
      prisma.message.findUnique.mockResolvedValue(mockMessage);
      prisma.message.delete.mockResolvedValue(mockMessage);

      const result = await deleteMessage("msg-1");

      expect(prisma.message.delete).toHaveBeenCalledWith({
        where: { id: "msg-1" },
      });
      expect(result).toEqual(mockMessage);
    });

    it("throws NotFoundError when deleting a missing message", async () => {
      prisma.message.findUnique.mockResolvedValue(null);

      await expect(deleteMessage("missing")).rejects.toThrow(NotFoundError);
      expect(prisma.message.delete).not.toHaveBeenCalled();
    });
  });
});
