import {
  createConversation,
  getConversationById,
  getConversationByUsers,
  getConversationsByUser,
} from "../repository/conversationRepository.js";
import { getUserById } from "../repository/userRepository.js";
import { BadRequest } from "../error/badRequestError.js";

export const openConversation = async ({ user_a_id, user_b_id }) => {
  if (user_a_id === user_b_id) {
    throw new BadRequest("Cannot start a conversation with yourself");
  }

  // Both users must exist (relation check)
  await getUserById(user_a_id);
  await getUserById(user_b_id);

  // Only one conversation per user pair: reuse the existing one
  const existing = await getConversationByUsers(user_a_id, user_b_id);

  if (existing) {
    return {
      status: 200,
      message: "Conversation already exists",
      conversation: existing,
    };
  }

  const conversation = await createConversation({ user_a_id, user_b_id });

  return {
    status: 201,
    message: "Conversation created successfully",
    conversation,
  };
};

export const getConversation = async (id) => {
  const conversation = await getConversationById(id);

  return {
    status: 200,
    message: "Conversation fetched successfully",
    conversation,
  };
};

export const getUserConversations = async (userId) => {
  const conversations = await getConversationsByUser(userId);

  return {
    status: 200,
    message: "Conversations fetched successfully",
    conversations,
  };
};
