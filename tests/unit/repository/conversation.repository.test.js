import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../config/dbConfig.js", () => ({
  prisma: {
    conversation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const { prisma } = await import("../../../config/dbConfig.js");
const {
  createConversation,
  getConversationById,
  getConversationByUsers,
  getConversationsByUser,
} = await import("../../../repository/conversationRepository.js");
const { NotFoundError } = await import("../../../error/notFoundError.js");

const mockConversation = {
  id: "conv-1",
  user_a_id: "user-1",
  user_b_id: "user-2",
  userA: { id: "user-1", username: "johnny", avatar_key: null },
  userB: { id: "user-2", username: "jane", avatar_key: null },
};

const conversationInclude = {
  userA: {
    select: { id: true, username: true, avatar_key: true },
  },
  userB: {
    select: { id: true, username: true, avatar_key: true },
  },
};

describe("Conversation Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createConversation", () => {
    it("creates and returns a conversation", async () => {
      prisma.conversation.create.mockResolvedValue(mockConversation);

      const result = await createConversation({
        user_a_id: "user-1",
        user_b_id: "user-2",
      });

      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: { user_a_id: "user-1", user_b_id: "user-2" },
      });
      expect(result).toEqual(mockConversation);
    });
  });

  describe("getConversationById", () => {
    it("returns the conversation with both user relations", async () => {
      prisma.conversation.findUnique.mockResolvedValue(mockConversation);

      const result = await getConversationById("conv-1");

      expect(prisma.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: "conv-1" },
        include: conversationInclude,
      });
      expect(result.userA.username).toBe("johnny");
      expect(result.userB.username).toBe("jane");
    });

    it("throws NotFoundError when the conversation does not exist", async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);

      await expect(getConversationById("missing")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("getConversationByUsers", () => {
    it("matches the pair regardless of ordering", async () => {
      prisma.conversation.findFirst.mockResolvedValue(mockConversation);

      const result = await getConversationByUsers("user-1", "user-2");

      expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { user_a_id: "user-1", user_b_id: "user-2" },
            { user_a_id: "user-2", user_b_id: "user-1" },
          ],
        },
        include: conversationInclude,
      });
      expect(result).toEqual(mockConversation);
    });

    it("returns null when no conversation exists between the users", async () => {
      prisma.conversation.findFirst.mockResolvedValue(null);

      const result = await getConversationByUsers("user-1", "user-2");

      expect(result).toBeNull();
    });
  });

  describe("getConversationsByUser", () => {
    it("returns conversations where the user is either side", async () => {
      prisma.conversation.findMany.mockResolvedValue([mockConversation]);

      const result = await getConversationsByUser("user-1");

      expect(prisma.conversation.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ user_a_id: "user-1" }, { user_b_id: "user-1" }],
        },
        include: conversationInclude,
        orderBy: { created_at: "desc" },
      });
      expect(result).toEqual([mockConversation]);
    });
  });
});
