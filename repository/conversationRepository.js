import { prisma } from "../config/dbConfig.js";
import { NotFoundError } from "../error/notFoundError.js";

const conversationInclude = {
  userA: {
    select: {
      id: true,
      username: true,
      avatar_key: true,
    },
  },
  userB: {
    select: {
      id: true,
      username: true,
      avatar_key: true,
    },
  },
};

export const createConversation = async (data) => {
  const conversation = await prisma.conversation.create({ data });
  return conversation;
};

export const getConversationById = async (id) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: conversationInclude,
  });

  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  return conversation;
};

export const getConversationByUsers = async (userAId, userBId) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user_a_id: userAId, user_b_id: userBId },
        { user_a_id: userBId, user_b_id: userAId },
      ],
    },
    include: conversationInclude,
  });
  return conversation;
};

export const getConversationsByUser = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user_a_id: userId }, { user_b_id: userId }],
    },
    include: conversationInclude,
    orderBy: { created_at: "desc" },
  });
  return conversations;
};
