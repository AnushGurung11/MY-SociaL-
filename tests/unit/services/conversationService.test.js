import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule(
  "../../../repository/conversationRepository.js",
  () => ({
    createConversation: jest.fn(),
    getConversationById: jest.fn(),
    getConversationByUsers: jest.fn(),
    getConversationsByUser: jest.fn(),
  }),
);

jest.unstable_mockModule("../../../repository/userRepository.js", () => ({
  getUserById: jest.fn(),
}));

const { openConversation, getConversation, getUserConversations } =
  await import("../../../services/conversationService.js");
const conversationRepository =
  await import("../../../repository/conversationRepository.js");
const userRepository = await import("../../../repository/userRepository.js");
const { BadRequest } = await import("../../../error/badRequestError.js");

const mockConversation = {
  id: "conv-1",
  user_a_id: "user-1",
  user_b_id: "user-2",
  userA: { id: "user-1", username: "johnny" },
  userB: { id: "user-2", username: "jane" },
};

describe("Conversation Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("openConversation", () => {
    it("creates a conversation when the pair has none", async () => {
      userRepository.getUserById.mockResolvedValue({ id: "user-1" });
      conversationRepository.getConversationByUsers.mockResolvedValue(null);
      conversationRepository.createConversation.mockResolvedValue(
        mockConversation,
      );

      const result = await openConversation({
        user_a_id: "user-1",
        user_b_id: "user-2",
      });

      expect(conversationRepository.createConversation).toHaveBeenCalledWith({
        user_a_id: "user-1",
        user_b_id: "user-2",
      });
      expect(result).toMatchObject({
        status: 201,
        message: "Conversation created successfully",
        conversation: mockConversation,
      });
    });

    it("reuses the existing conversation for the same pair", async () => {
      userRepository.getUserById.mockResolvedValue({ id: "user-1" });
      conversationRepository.getConversationByUsers.mockResolvedValue(
        mockConversation,
      );

      const result = await openConversation({
        user_a_id: "user-1",
        user_b_id: "user-2",
      });

      expect(conversationRepository.createConversation).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: 200,
        message: "Conversation already exists",
        conversation: mockConversation,
      });
    });

    it("throws BadRequest when talking to yourself", async () => {
      await expect(
        openConversation({ user_a_id: "user-1", user_b_id: "user-1" }),
      ).rejects.toThrow(BadRequest);
      expect(conversationRepository.createConversation).not.toHaveBeenCalled();
    });

    it("propagates NotFoundError when a user does not exist", async () => {
      userRepository.getUserById.mockRejectedValue(new Error("User not found"));

      await expect(
        openConversation({ user_a_id: "missing", user_b_id: "user-2" }),
      ).rejects.toThrow("User not found");
      expect(conversationRepository.createConversation).not.toHaveBeenCalled();
    });
  });

  describe("getConversation", () => {
    it("returns the conversation by id", async () => {
      conversationRepository.getConversationById.mockResolvedValue(
        mockConversation,
      );

      const result = await getConversation("conv-1");

      expect(conversationRepository.getConversationById).toHaveBeenCalledWith(
        "conv-1",
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Conversation fetched successfully",
        conversation: mockConversation,
      });
    });
  });

  describe("getUserConversations", () => {
    it("returns conversations of a user", async () => {
      conversationRepository.getConversationsByUser.mockResolvedValue([
        mockConversation,
      ]);

      const result = await getUserConversations("user-1");

      expect(
        conversationRepository.getConversationsByUser,
      ).toHaveBeenCalledWith("user-1");
      expect(result).toMatchObject({
        status: 200,
        message: "Conversations fetched successfully",
        conversations: [mockConversation],
      });
    });
  });
});
